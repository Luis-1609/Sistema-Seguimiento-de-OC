'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import KpiCard from '@/components/ui/KpiCard';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ordenes/StatusBadge';
import { useOrdenes } from '@/hooks/useOrdenes';
import { formatMonto, formatFecha } from '@/lib/constants';

/**
 * Dashboard principal — Vista general del sistema.
 */
export default function DashboardPage() {
  const { ordenes, loading } = useOrdenes();

  const kpis = useMemo(() => {
    if (!ordenes.length) return null;

    const total = ordenes.length;
    const pendientes = ordenes.filter((o) => o.estado === 'Pendiente').length;
    const enProceso = ordenes.filter((o) => o.estado === 'En Proceso').length;
    const entregadas = ordenes.filter((o) => o.estado === 'Entregada').length;
    const montoTotal = ordenes.reduce((sum, o) => sum + parseFloat(o.monto || 0), 0);
    const montoActivo = ordenes
      .filter((o) => !['Cancelada', 'Entregada'].includes(o.estado))
      .reduce((sum, o) => sum + parseFloat(o.monto || 0), 0);

    return { total, pendientes, enProceso, entregadas, montoTotal, montoActivo };
  }, [ordenes]);

  // Últimas 5 órdenes
  const recentOrdenes = useMemo(() => {
    return [...ordenes]
      .sort((a, b) => new Date(b.fecha_actualizacion) - new Date(a.fecha_actualizacion))
      .slice(0, 5);
  }, [ordenes]);

  if (loading) {
    return <Spinner size="lg" text="Cargando dashboard..." />;
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>Dashboard</h1>
          <p>Vista general del sistema de órdenes de compra</p>
        </div>
        <div className="page-header-actions">
          <Link href="/ordenes/nueva">
            <Button
              variant="primary"
              icon='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
            >
              Nueva Orden
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="kpi-grid">
          <KpiCard
            label="Total Órdenes"
            value={kpis.total}
            subtitle="Registradas en el sistema"
            color="accent"
            icon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
          />
          <KpiCard
            label="Pendientes"
            value={kpis.pendientes}
            subtitle="Esperando aprobación"
            color="warning"
            icon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
          />
          <KpiCard
            label="En Proceso"
            value={kpis.enProceso}
            subtitle="En curso de entrega"
            color="info"
            icon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>'
          />
          <KpiCard
            label="Monto Activo"
            value={formatMonto(kpis.montoActivo)}
            subtitle={`Total: ${formatMonto(kpis.montoTotal)}`}
            color="success"
            icon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
          />
        </div>
      )}

      {/* Recent Orders */}
      <div className="glass-card">
        <div className="glass-card-header">
          <h2 className="glass-card-title">Órdenes Recientes</h2>
          <Link href="/ordenes">
            <Button variant="ghost" size="sm">
              Ver todas →
            </Button>
          </Link>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Proveedor</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Actualizado</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {recentOrdenes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty">
                    <div className="table-empty-icon">📊</div>
                    <div className="table-empty-text">No hay órdenes aún</div>
                    <div className="table-empty-sub">
                      <Link href="/ordenes/nueva" style={{ color: 'var(--color-accent)' }}>
                        Crea tu primera orden →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                recentOrdenes.map((orden) => (
                  <tr key={orden.id}>
                    <td>{orden.id}</td>
                    <td>{orden.proveedor}</td>
                    <td className="table-cell-monto">{formatMonto(orden.monto)}</td>
                    <td><StatusBadge estado={orden.estado} /></td>
                    <td>{formatFecha(orden.fecha_actualizacion)}</td>
                    <td>{orden.responsable}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
