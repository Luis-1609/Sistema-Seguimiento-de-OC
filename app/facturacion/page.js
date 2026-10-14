'use client';

import { useState, useMemo } from 'react';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ordenes/StatusBadge';
import { useOrdenes } from '@/hooks/useOrdenes';
import { useUser, getFirstName } from '@/context/UserContext';
import { formatMonto } from '@/lib/constants';

/**
 * Página "Facturación".
 *
 * Panel de control de comprobantes y despacho.
 * Muestra una tabla con las órdenes y su estado de facturación.
 *
 * Columnas: N° OC, Proveedor, Estado de Entrega, Importe de OC, Importe Facturado, Etiqueta.
 *
 * Estados de facturación (etiquetas):
 *   - Parcial
 *   - Facturado
 *   - Por facturar
 *   - Diferencia mínima
 *   - Falta recepción
 */

const ESTADOS_FACTURACION = [
  'Parcial',
  'Facturado',
  'Por facturar',
  'Diferencia mínima',
  'Falta recepción',
];

/**
 * Determina la etiqueta de facturación de una orden.
 *
 * Lógica basada en el importe facturado vs importe de OC y estado de entrega:
 *  - Si el estado de entrega no indica recepción → "Falta recepción"
 *  - Si no hay importe facturado o es 0 → "Por facturar"
 *  - Si el importe facturado cubre totalmente el importe OC → "Facturado"
 *  - Si la diferencia es mínima (< 5% o < 10 unidades) → "Diferencia mínima"
 *  - Si el importe facturado es parcial → "Parcial"
 */
function getEtiquetaFacturacion(orden) {
  const importeOC = parseFloat(orden.monto) || 0;
  const importeFacturado = parseFloat(orden.importe_facturado) || 0;

  // Si no se ha entregado nada, falta recepción
  const estadosConRecepcion = [
    'Entregado',
    'Entrega Parcial',
    'Despachado',
    'Recibido',
  ];
  if (!estadosConRecepcion.includes(orden.estado)) {
    return 'Falta recepción';
  }

  // Sin facturación registrada
  if (importeFacturado === 0) {
    return 'Por facturar';
  }

  // Facturado total
  if (importeFacturado >= importeOC) {
    return 'Facturado';
  }

  // Diferencia mínima: menos del 5% de diferencia o menos de 10 unidades
  const diferencia = importeOC - importeFacturado;
  if (diferencia / importeOC < 0.05 || diferencia < 10) {
    return 'Diferencia mínima';
  }

  // Parcial
  return 'Parcial';
}

/**
 * Mapeo de etiqueta de facturación a clase CSS.
 */
const ETIQUETA_CSS_CLASS = {
  'Parcial': 'parcial',
  'Facturado': 'facturado',
  'Por facturar': 'por-facturar',
  'Diferencia mínima': 'diferencia-minima',
  'Falta recepción': 'falta-recepcion',
};

export default function FacturacionPage() {
  const { ordenes, loading } = useOrdenes();
  const { activeUser, usuarios } = useUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtiqueta, setFilterEtiqueta] = useState('');

  // Enriquecer órdenes con etiqueta de facturación
  const ordenesConEtiqueta = useMemo(() => {
    return ordenes.map((o) => ({
      ...o,
      etiqueta_facturacion: getEtiquetaFacturacion(o),
    }));
  }, [ordenes]);

  // Filtrado por búsqueda y etiqueta
  const filteredOrdenes = useMemo(() => {
    return ordenesConEtiqueta.filter((o) => {
      const matchSearch =
        !searchTerm ||
        o.oc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEtiqueta =
        !filterEtiqueta || o.etiqueta_facturacion === filterEtiqueta;

      return matchSearch && matchEtiqueta;
    });
  }, [ordenesConEtiqueta, searchTerm, filterEtiqueta]);

  // Conteo por etiqueta
  const conteoEtiquetas = useMemo(() => {
    const counts = {};
    ESTADOS_FACTURACION.forEach((e) => {
      counts[e] = ordenesConEtiqueta.filter(
        (o) => o.etiqueta_facturacion === e
      ).length;
    });
    return counts;
  }, [ordenesConEtiqueta]);

  if (loading) {
    return <Spinner size="lg" text="Cargando datos de facturación..." />;
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>Facturación</h1>
          <p>Panel de control de comprobantes y despacho</p>
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

      {/* Section Header */}
      <div className="pv-section">
        <div className="pv-section-header">
          <div className="pv-section-title-row">
            <div className="pv-section-indicator pv-section-indicator--primary" />
            <h2 className="pv-section-title">Pendientes de Facturación</h2>
            <span className="pv-badge pv-badge--info">
              {filteredOrdenes.length}{' '}
              {filteredOrdenes.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          <p className="pv-section-hint">
            Actualizado según reglas de recepción y facturación institucional
          </p>
        </div>

        {/* Filter Bar: Etiquetas + Search */}
        <div className="filter-bar">
          <button
            className={`filter-chip ${!filterEtiqueta ? 'active' : ''}`}
            onClick={() => setFilterEtiqueta('')}
          >
            Todas ({ordenesConEtiqueta.length})
          </button>
          {ESTADOS_FACTURACION.map((etiqueta) => (
            <button
              key={etiqueta}
              className={`filter-chip ${filterEtiqueta === etiqueta ? 'active' : ''}`}
              onClick={() =>
                setFilterEtiqueta(filterEtiqueta === etiqueta ? '' : etiqueta)
              }
            >
              {etiqueta} ({conteoEtiquetas[etiqueta] || 0})
            </button>
          ))}
          <div className="filter-search">
            <input
              type="text"
              className="form-input"
              placeholder="Buscar por OC, proveedor, descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="glass-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N° de OC</th>
                  <th>Proveedor</th>
                  <th>Estado de Entrega</th>
                  <th>Importe de OC</th>
                  <th>Importe Facturado</th>
                  <th>Etiqueta</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrdenes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty">
                      <div className="table-empty-icon">🧾</div>
                      <div className="table-empty-text">
                        {searchTerm || filterEtiqueta
                          ? 'No se encontraron registros con esos filtros'
                          : 'No hay registros de facturación'}
                      </div>
                      <div className="table-empty-sub">
                        {searchTerm || filterEtiqueta
                          ? 'Intenta con otros criterios de búsqueda'
                          : 'Los datos se actualizan automáticamente'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrdenes.map((orden) => {
                    const importeOC = parseFloat(orden.monto) || 0;
                    const importeFacturado =
                      parseFloat(orden.importe_facturado) || 0;
                    const etiquetaClass =
                      ETIQUETA_CSS_CLASS[orden.etiqueta_facturacion] ||
                      'por-facturar';

                    // Resolve proveedor display with description sub-line
                    return (
                      <tr key={`fac-${orden.oc}-${orden.id}`}>
                        <td>
                          <span className="pv-oc-number">{orden.oc}</span>
                        </td>
                        <td>
                          <div className="pv-proveedor-cell">
                            <span className="pv-proveedor-name">
                              {orden.proveedor}
                            </span>
                            {orden.descripcion && (
                              <span className="pv-proveedor-sub">
                                {orden.descripcion}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <StatusBadge estado={orden.estado} />
                        </td>
                        <td className="table-cell-monto">
                          {formatMonto(importeOC)}
                        </td>
                        <td className="table-cell-monto">
                          {formatMonto(importeFacturado)}
                        </td>
                        <td>
                          <span
                            className={`facturacion-badge facturacion-badge--${etiquetaClass}`}
                          >
                            {orden.etiqueta_facturacion}
                          </span>
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

      {/* Resumen Footer */}
      {filteredOrdenes.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-4) 0',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-tertiary)',
          }}
        >
          <span>
            Mostrando {filteredOrdenes.length} de {ordenesConEtiqueta.length}{' '}
            registros
          </span>
          <span>
            Total importe OC:{' '}
            {formatMonto(
              filteredOrdenes.reduce(
                (sum, o) => sum + (parseFloat(o.monto) || 0),
                0
              )
            )}{' '}
            · Total facturado:{' '}
            {formatMonto(
              filteredOrdenes.reduce(
                (sum, o) => sum + (parseFloat(o.importe_facturado) || 0),
                0
              )
            )}
          </span>
        </div>
      )}
    </>
  );
}
