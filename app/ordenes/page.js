'use client';

import { useState } from 'react';
import Link from 'next/link';
import OrdenesTable from '@/components/ordenes/OrdenesTable';
import OrdenForm from '@/components/ordenes/OrdenForm';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useOrdenes } from '@/hooks/useOrdenes';
import { useAppToast } from '@/components/layout/AppShell';

/**
 * Página de listado de todas las órdenes de compra.
 */
export default function OrdenesPage() {
  const { ordenes, loading, saving, actualizarOrden, eliminarOrden } = useOrdenes();
  const toast = useAppToast();
  const [editingOrden, setEditingOrden] = useState(null);

  const handleEdit = (orden) => {
    setEditingOrden(orden);
  };

  const handleEditSubmit = async (data) => {
    try {
      const compositeId = `${editingOrden.oc}-${editingOrden.id || editingOrden.linea_de_oc || ''}`;
      await actualizarOrden(compositeId, data);
      setEditingOrden(null);
      toast?.success('Orden actualizada', `OC ${data.oc} ID ${data.id || data.num_id || ''} actualizada.`);
    } catch (err) {
      toast?.error('Error', err.message);
    }
  };
  /*
  const handleDelete = async (compositeId) => {
    try {
      await eliminarOrden(compositeId);
      toast?.success('Orden eliminada', `Registro eliminado correctamente.`);
    } catch (err) {
      toast?.error('Error', err.message);
    }
  };
  */
  if (loading) {
    return <Spinner size="lg" text="Cargando órdenes de compra..." />;
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>Órdenes de Compra</h1>
          <p>Gestiona y da seguimiento a todas las órdenes</p>
        </div>
        <div className="page-header-actions">
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
            icon='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>'
          >
            Actualizar
          </Button>
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

      {/* Orders Table */}
      <OrdenesTable
        ordenes={ordenes}
        onEdit={handleEdit}
        //onDelete={handleDelete}
        saving={saving}
      />

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingOrden}
        onClose={() => setEditingOrden(null)}
        //— Línea ${editingOrden?.linea_de_oc || ''}
        title={`Editar OC ${editingOrden?.oc || ''}`}
        size="xl"
      >
        {editingOrden && (
          <OrdenForm
            orden={editingOrden}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingOrden(null)}
            saving={saving}
          />
        )}
      </Modal>
    </>
  );
}
