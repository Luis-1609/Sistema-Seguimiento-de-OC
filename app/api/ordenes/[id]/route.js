import { NextResponse } from 'next/server';

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
 * Actualiza una orden de compra.
 * El [id] es un composite "OC-LINEA" (ej: "642323-1").
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

    // Parsear composite ID: "642323-1" → oc=642323, linea=1
    const [oc, linea] = id.split('-');

    if (isGoogleConfigured()) {
      const { findRowIndex, updateRowByIndex } = await import('@/lib/google-sheets');

      const rowIndex = await findRowIndex(oc, linea);
      if (rowIndex === -1) {
        return NextResponse.json(
          { error: `Orden OC ${oc} Línea ${linea} no encontrada.` },
          { status: 404 }
        );
      }

      await updateRowByIndex(rowIndex, {
        oc: body.oc || oc,
        proveedor: body.proveedor,
        id: body.id || linea,
        monto: body.monto,
        estado: body.estado,
        descripcion: body.descripcion,
        fecha_vencimiento: body.fecha_vencimiento || '',
        comprador: body.comprador || '',
      });

      return NextResponse.json({
        message: 'Orden actualizada exitosamente',
      });
    }

    // Fallback mock
    return NextResponse.json({
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
 * El [id] es un composite "OC-LINEA" (ej: "642323-1").
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

    const [oc, linea] = id.split('-');

    if (isGoogleConfigured()) {
      const { findRowIndex, deleteRowByIndex } = await import('@/lib/google-sheets');

      const rowIndex = await findRowIndex(oc, linea);
      if (rowIndex === -1) {
        return NextResponse.json(
          { error: `Orden OC ${oc} Línea ${linea} no encontrada.` },
          { status: 404 }
        );
      }

      await deleteRowByIndex(rowIndex);

      return NextResponse.json({
        message: `Orden OC ${oc} Línea ${linea} eliminada exitosamente`,
      });
    }

    // Fallback mock
    return NextResponse.json({
      message: `Orden eliminada (modo mock)`,
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
