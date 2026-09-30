'use client';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

/**
 * Modal de confirmación para eliminar una orden.
 */
export default function DeleteModal({ isOpen, onClose, orden, onConfirm, loading }) {
  if (!orden) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Orden de Compra"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => onConfirm(orden.id)} loading={loading}>
            Sí, eliminar
          </Button>
        </>
      }
    >
      <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}>
          ⚠️
        </div>
        <p style={{ color: 'var(--color-text-primary)', fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>
          ¿Estás seguro de eliminar la orden <strong>{orden.id}</strong>?
        </p>
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
          {orden.proveedor} — {orden.descripcion}
        </p>
        <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-4)' }}>
          Esta acción no se puede deshacer.
        </p>
      </div>
    </Modal>
  );
}
