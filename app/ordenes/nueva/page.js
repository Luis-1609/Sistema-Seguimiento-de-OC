'use client';

import { useRouter } from 'next/navigation';
import OrdenForm from '@/components/ordenes/OrdenForm';
import { useOrdenes } from '@/hooks/useOrdenes';
import { useAppToast } from '@/components/layout/AppShell';

/**
 * Página para crear una nueva orden de compra.
 */
export default function NuevaOrdenPage() {
  const router = useRouter();
  const { crearOrden, saving } = useOrdenes();
  const toast = useAppToast();

  const handleSubmit = async (data) => {
    try {
      const result = await crearOrden(data);
      const id = result?.orden?.id || 'nueva';
      toast?.success('Orden creada', `La orden ${id} se creó exitosamente.`);
      router.push('/ordenes');
    } catch (err) {
      toast?.error('Error al crear', err.message);
    }
  };

  const handleCancel = () => {
    router.push('/ordenes');
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>Nueva Orden de Compra</h1>
          <p>Registra una nueva orden en el sistema</p>
        </div>
      </div>

      {/* Form */}
      <OrdenForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        saving={saving}
      />
    </>
  );
}
