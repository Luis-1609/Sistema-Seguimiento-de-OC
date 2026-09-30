import { NextResponse } from 'next/server';
import { MOCK_ORDENES } from '@/lib/constants';

// Determinar si Google Sheets está configurado
const isGoogleConfigured = () => {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.GOOGLE_SHEET_ID
  );
};

/**
 * PUT /api/ordenes/[id]
 * Actualiza una orden de compra existente.
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID de orden es requerido' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString().split('T')[0];

    if (isGoogleConfigured()) {
      const { updateRow } = await import('@/lib/google-sheets');

      const ordenActualizada = {
        id,
        fecha_creacion: body.fecha_creacion,
        proveedor: body.proveedor,
        descripcion: body.descripcion,
        monto: body.monto,
        estado: body.estado,
        fecha_entrega_estimada: body.fecha_entrega_estimada || '',
        responsable: body.responsable,
        notas: body.notas || '',
        fecha_actualizacion: now,
      };

      await updateRow(id, ordenActualizada);

      return NextResponse.json({
        orden: ordenActualizada,
        message: 'Orden actualizada exitosamente',
      });
    }

    // Fallback mock
    return NextResponse.json({
      orden: { id, ...body, fecha_actualizacion: now },
      source: 'mock',
      message: 'Orden actualizada (modo mock)',
    });
  } catch (error) {
    console.error('Error PUT /api/ordenes/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar la orden' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ordenes/[id]
 * Elimina una orden de compra.
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de orden es requerido' },
        { status: 400 }
      );
    }

    if (isGoogleConfigured()) {
      const { deleteRow } = await import('@/lib/google-sheets');
      await deleteRow(id);

      return NextResponse.json({
        message: `Orden ${id} eliminada exitosamente`,
      });
    }

    // Fallback mock
    return NextResponse.json({
      message: `Orden ${id} eliminada (modo mock)`,
      source: 'mock',
    });
  } catch (error) {
    console.error('Error DELETE /api/ordenes/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar la orden' },
      { status: 500 }
    );
  }
}
