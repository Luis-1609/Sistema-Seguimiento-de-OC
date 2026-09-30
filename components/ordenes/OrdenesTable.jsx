'use client';

import { useState } from 'react';
import StatusBadge from './StatusBadge';
import DeleteModal from './DeleteModal';
import { formatMonto, formatFecha } from '@/lib/constants';

/**
 * Tabla de órdenes de compra con acciones inline.
 * Adaptada a la estructura real del Google Sheet:
 * OC | Proveedor | Línea de OC | Monto | Estado | Descripcion | Fecha vencimiento | Comprador
 */
export default function OrdenesTable({
  ordenes,
  onEdit,
  onDelete,
  saving,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterEstado, setFilterEstado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado
  const filteredOrdenes = ordenes.filter((o) => {
    const matchEstado = !filterEstado || o.estado === filterEstado;
    const matchSearch =
      !searchTerm ||
      o.oc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.comprador?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

  // Obtener estados únicos de los datos reales
  const estadosUnicos = [...new Set(ordenes.map((o) => o.estado).filter(Boolean))];

  return (
    <>
      {/* Filter Bar */}
      <div className="filter-bar">
        <button
          className={`filter-chip ${!filterEstado ? 'active' : ''}`}
          onClick={() => setFilterEstado('')}
        >
          Todas ({ordenes.length})
        </button>
        {estadosUnicos.map((estado) => {
          const count = ordenes.filter((o) => o.estado === estado).length;
          return (
            <button
              key={estado}
              className={`filter-chip ${filterEstado === estado ? 'active' : ''}`}
              onClick={() => setFilterEstado(filterEstado === estado ? '' : estado)}
            >
              {estado} ({count})
            </button>
          );
        })}
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
                <th>OC</th>
                <th>Línea</th>
                <th>Proveedor</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>F. Vencimiento</th>
                <th>Comprador</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrdenes.length === 0 ? (
                <tr>
                  <td colSpan="9" className="table-empty">
                    <div className="table-empty-icon">📋</div>
                    <div className="table-empty-text">
                      {searchTerm || filterEstado
                        ? 'No se encontraron órdenes con esos filtros'
                        : 'No hay órdenes de compra registradas'}
                    </div>
                    <div className="table-empty-sub">
                      {searchTerm || filterEstado
                        ? 'Intenta con otros criterios de búsqueda'
                        : 'Crea una nueva orden para comenzar'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrdenes.map((orden, index) => (
                  <tr key={`${orden.oc}-${orden.linea_de_oc}-${index}`}>
                    <td>{orden.oc}</td>
                    <td style={{ textAlign: 'center' }}>{orden.linea_de_oc}</td>
                    <td>{orden.proveedor}</td>
                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {orden.descripcion}
                    </td>
                    <td className="table-cell-monto">{formatMonto(orden.monto)}</td>
                    <td>
                      <StatusBadge estado={orden.estado} />
                    </td>
                    <td>{formatFecha(orden.fecha_vencimiento)}</td>
                    <td>{orden.comprador}</td>
                    <td>
                      <div className="table-actions">
                        {/* Editar */}
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => onEdit && onEdit(orden)}
                          title="Editar orden"
                          aria-label={`Editar OC ${orden.oc} línea ${orden.linea_de_oc}`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        {/* Eliminar */}
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setDeleteTarget(orden)}
                          title="Eliminar orden"
                          aria-label={`Eliminar OC ${orden.oc} línea ${orden.linea_de_oc}`}
                          style={{ color: 'var(--color-error)' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen */}
      {filteredOrdenes.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-4) 0',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-tertiary)',
        }}>
          <span>
            Mostrando {filteredOrdenes.length} de {ordenes.length} registros
          </span>
          <span>
            Total filtrado: {formatMonto(filteredOrdenes.reduce((sum, o) => sum + parseFloat(o.monto || 0), 0))}
          </span>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        orden={deleteTarget}
        onConfirm={(compositeId) => {
          onDelete && onDelete(compositeId);
          setDeleteTarget(null);
        }}
        loading={saving}
      />
    </>
  );
}
