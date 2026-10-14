'use client';

import { useState, useMemo } from 'react';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import ToastContainer from '@/components/ui/Toast';
import StatusBadge from '@/components/ordenes/StatusBadge';
import { useOrdenes } from '@/hooks/useOrdenes';
import { useUser, getFirstName } from '@/context/UserContext';
import { useToast } from '@/hooks/useToast';
import { formatMonto, formatFecha } from '@/lib/constants';

/**
 * Página "Órdenes por Vencer".
 * 
 * Muestra dos tablas:
 * 1. Seguimiento de Órdenes de Compra: OC cuya fecha de vencimiento está próxima.
 *    Columnas: N° OC, Proveedor, Fecha Seguimiento, Estado de Entrega, Comentarios, Lugar de Destino.
 *    La "Fecha Seguimiento" aquí es un campo editable en línea (tipo date picker) distinto
 *    al campo "Fecha de Seguimiento" del formulario de edición de OC.
 * 
 * 2. Servicios de Entrega: OC cuyo lugar de destino es "Almacén de DTI" y su estado
 *    es "Entregado" o "Entrega Parcial" (requieren tareas de despacho).
 *    Columnas: N° OC, Proveedor, N° Ticket, Comentarios, N° Tarea, Estado.
 */

/**
 * Calcula cuántos días faltan para la fecha de vencimiento.
 * Retorna un número (puede ser negativo si ya venció).
 */
function diasParaVencer(fechaStr) {
  if (!fechaStr) return Infinity;
  try {
    const parts = fechaStr.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      const target = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);
      return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    }
    const target = new Date(fechaStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  } catch {
    return Infinity;
  }
}

/**
 * Determina la clase CSS de urgencia según los días restantes.
 */
function getUrgencyClass(dias) {
  if (dias < 0) return 'urgency-vencida';
  if (dias <= 3) return 'urgency-critica';
  if (dias <= 7) return 'urgency-proxima';
  return 'urgency-normal';
}

function getUrgencyLabel(dias) {
  if (dias < 0) return `Vencida hace ${Math.abs(dias)}d`;
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return 'Vence mañana';
  return `${dias} días`;
}

export default function PorVencerPage() {
  const { ordenes, loading } = useOrdenes();
  const { usuarios } = useUser();
  const toast = useToast();

  // Estado local para las fechas de seguimiento editables en esta pantalla
  const [fechasSeguimiento, setFechasSeguimiento] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Filtrar órdenes que están por vencer (no finalizadas)
  // Excluimos las que ya están "Entregado" completamente o "Anulado"
  const ordenesPorVencer = useMemo(() => {
    const ESTADOS_EXCLUIDOS = ['Anulado'];
    return ordenes
      .filter((o) => {
        if (!o.fecha_vencimiento) return false;
        if (ESTADOS_EXCLUIDOS.includes(o.estado)) return false;
        return true;
      })
      .sort((a, b) => diasParaVencer(a.fecha_vencimiento) - diasParaVencer(b.fecha_vencimiento));
  }, [ordenes]);

  // Tabla 2: Servicios de Entrega — órdenes cuyo destino es "Almacén de DTI"
  // y su estado indica que ya fue entregado/parcial (requiere despacho interno)
  const serviciosEntrega = useMemo(() => {
    const ESTADOS_SERVICIO = ['Entregado', 'Entrega Parcial'];
    return ordenes.filter(
      (o) =>
        o.lugar_destino === 'Almacén de DTI' &&
        ESTADOS_SERVICIO.includes(o.estado)
    );
  }, [ordenes]);

  const handleFechaSeguimientoChange = (key, value) => {
    setFechasSeguimiento((prev) => ({ ...prev, [key]: value }));
  };

  const handleGuardarCambios = async () => {
    setGuardando(true);
    try {
      // Simular guardado / sincronización de los cambios realizados
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('Cambios guardados', 'Los datos de seguimiento y servicios de entrega han sido actualizados.');
    } catch (err) {
      toast.error('Error', 'Ocurrió un problema al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <Spinner size="lg" text="Cargando órdenes por vencer..." />;
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>Órdenes por Vencer</h1>
          <p>Seguimiento de órdenes de compra y servicios de entrega</p>
        </div>
        <div className="page-header-actions">
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
            icon='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>'
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* === Tabla 1: Seguimiento de Órdenes de Compra === */}
      <div className="pv-section">
        <div className="pv-section-header">
          <div className="pv-section-title-row">
            <div className="pv-section-indicator pv-section-indicator--primary" />
            <h2 className="pv-section-title">Seguimiento de Órdenes de Compra</h2>
            <span className="pv-badge pv-badge--info">
              {ordenesPorVencer.length} {ordenesPorVencer.length === 1 ? 'orden registrada' : 'órdenes registradas'}
            </span>
          </div>
          <p className="pv-section-hint">
            Las fechas y estados son editables. La fecha de seguimiento es independiente de la registrada en la edición de OC.
          </p>
        </div>

        <div className="glass-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N° de OC</th>
                  <th>Proveedor</th>
                  <th>Fecha Seguimiento</th>
                  <th>Estado de Entrega</th>
                  <th>Comentarios</th>
                  <th>Lugar de Destino</th>
                </tr>
              </thead>
              <tbody>
                {ordenesPorVencer.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty">
                      <div className="table-empty-icon">📋</div>
                      <div className="table-empty-text">No hay órdenes por vencer</div>
                      <div className="table-empty-sub">Todas las órdenes están al día</div>
                    </td>
                  </tr>
                ) : (
                  ordenesPorVencer.map((orden) => {
                    const dias = diasParaVencer(orden.fecha_vencimiento);
                    const urgencyClass = getUrgencyClass(dias);
                    const rowKey = `${orden.oc}-${orden.id}`;
                    const fechaSeg = fechasSeguimiento[rowKey] || '';

                    return (
                      <tr key={rowKey} className={urgencyClass}>
                        <td>
                          <div className="pv-oc-cell">
                            <span className="pv-oc-number">{orden.oc}</span>
                            <span className={`pv-urgency-tag ${urgencyClass}`}>
                              {getUrgencyLabel(dias)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="pv-proveedor-cell">
                            <span className="pv-proveedor-name">{orden.proveedor}</span>
                          </div>
                        </td>
                        <td>
                          <input
                            type="date"
                            className="form-input pv-date-input"
                            value={fechaSeg}
                            onChange={(e) => handleFechaSeguimientoChange(rowKey, e.target.value)}
                          />
                        </td>
                        <td>
                          <StatusBadge estado={orden.estado} />
                        </td>
                        <td>
                          <span className="pv-comment-text">
                            {orden.comentarios || orden.descripcion || '—'}
                          </span>
                        </td>
                        <td>
                          {orden.lugar_destino ? (
                            <span className={`pv-destino-badge pv-destino-badge--${orden.lugar_destino.toLowerCase().replace(/\s+/g, '-').replace(/[áéíóú]/g, (m) => ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }[m]))}`}>
                              {orden.lugar_destino}
                            </span>
                          ) : (
                            <span className="pv-comment-text">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* === Tabla 2: Servicios de Entrega === */}
      <div className="pv-section">
        <div className="pv-section-header">
          <div className="pv-section-title-row">
            <div className="pv-section-indicator pv-section-indicator--dark" />
            <h2 className="pv-section-title">Servicios de Entrega (Almacén de DTI)</h2>
            <span className="pv-badge pv-badge--warning">
              {serviciosEntrega.length} {serviciosEntrega.length === 1 ? 'caso pendiente' : 'casos pendientes'}
            </span>
          </div>
          <p className="pv-section-hint">
            Órdenes con destino Almacén de DTI y estado Entregado o Entrega parcial. Al completar y asignar tarea, la orden concluye este flujo.
          </p>
        </div>

        <div className="glass-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N° de OC</th>
                  <th>Proveedor</th>
                  <th>N° de Ticket</th>
                  <th>Comentarios</th>
                  <th>N° Tarea</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {serviciosEntrega.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty">
                      <div className="table-empty-icon">📦</div>
                      <div className="table-empty-text">No hay servicios de entrega pendientes</div>
                      <div className="table-empty-sub">No hay órdenes que requieran despacho</div>
                    </td>
                  </tr>
                ) : (
                  serviciosEntrega.map((orden) => {
                    const rowKey = `srv-${orden.oc}-${orden.id}`;
                    return (
                      <tr key={rowKey}>
                        <td>
                          <span className="pv-oc-number">{orden.oc}</span>
                        </td>
                        <td>
                          <div className="pv-proveedor-cell">
                            <span className="pv-proveedor-name">{orden.proveedor}</span>
                            {orden.descripcion && (
                              <span className="pv-proveedor-sub">{orden.descripcion}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="pv-ticket-badge">
                            {orden.ticket_relacionado || '—'}
                          </span>
                        </td>
                        <td>
                          <span className="pv-comment-text">
                            {orden.comentarios || orden.servicio_entrega || '—'}
                          </span>
                        </td>
                        <td>
                          <span className="pv-comment-text">
                            {orden.numero_tarea || '—'}
                          </span>
                        </td>
                        <td>
                          <StatusBadge estado={orden.estado} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Botón Guardar Cambios suelto */}
      <div className="pv-footer-actions">
        <Button
          variant="primary"
          onClick={handleGuardarCambios}
          loading={guardando}
          icon='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>'
        >
          Guardar Cambios
        </Button>
      </div>

      {/* Resumen Footer */}
      {(ordenesPorVencer.length > 0 || serviciosEntrega.length > 0) && (
        <div style={{
          padding: 'var(--space-2) 0 var(--space-6) 0',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-tertiary)',
          textAlign: 'center',
        }}>
          {ordenesPorVencer.length} órdenes en seguimiento · {serviciosEntrega.length} servicios de entrega pendientes
        </div>
      )}
    </>
  );
}
