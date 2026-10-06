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
    const estadoCounts = {};
    ordenes.forEach((o) => {
      estadoCounts[o.estado] = (estadoCounts[o.estado] || 0) + 1;
    });
    const montoTotal = ordenes.reduce((sum, o) => sum + parseFloat(o.monto || 0), 0);
    const ocsUnicas = new Set(ordenes.map((o) => o.oc)).size;

    return { total, estadoCounts, montoTotal, ocsUnicas };
  }, [ordenes]);

  // Últimos 5 registros
  const recentOrdenes = useMemo(() => {
    return ordenes.slice(-5).reverse();
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
          {/* 
          <Link href="/ordenes/nueva">
            <Button
              variant="primary"
              icon='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
            >
              Nueva Orden
            </Button>
          </Link>
          */}
        </div>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="kpi-grid">
          <KpiCard
            label="OCs Únicas"
            value={kpis.ocsUnicas}
            subtitle={`${kpis.total} líneas totales`}
            color="accent"
            icon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
          />
          <KpiCard
            label="Líneas Totales"
            value={kpis.total}
            subtitle="Registradas en el sistema"
            color="info"
            icon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>'
          />
          <KpiCard
            label="Estado Principal"
            value={Object.entries(kpis.estadoCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'}
            subtitle={`${Object.entries(kpis.estadoCounts).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} registros`}
            color="warning"
            icon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
          />
          <KpiCard
            label="Monto Total"
            value={formatMonto(kpis.montoTotal)}
            subtitle="Suma de todas las líneas"
            color="success"
            icon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
          />
        </div>
      )}

      {/* Recent Orders */}
      <div className="glass-card">
        <div className="glass-card-header">
          <h2 className="glass-card-title">Registros Recientes</h2>
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
                <th>OC</th>
                <th style={{ textAlign: 'center' }}>ID</th>
                <th>Proveedor</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Comprador</th>
              </tr>
            </thead>
            <tbody>
              {recentOrdenes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">
                    <div className="table-empty-icon">📊</div>
                    <div className="table-empty-text">No hay órdenes aún</div>
                    <div className="table-empty-sub">
                      <Link href="/ordenes/nueva" style={{ color: 'var(--color-tertiary)' }}>
                        Crea tu primera orden →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                recentOrdenes.map((orden, index) => (
                  <tr key={`${orden.oc}-${orden.id || orden.linea_de_oc}-${index}`}>
                    <td>{orden.oc}</td>
                    <td style={{ textAlign: 'center' }}>{orden.id || orden.linea_de_oc}</td>
                    <td>{orden.proveedor}</td>
                    <td>{orden.descripcion}</td>
                    <td className="table-cell-monto">{formatMonto(orden.monto)}</td>
                    <td><StatusBadge estado={orden.estado} /></td>
                    <td>{orden.comprador}</td>
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
