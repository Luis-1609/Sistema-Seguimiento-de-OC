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
 * GET /api/ordenes
 * Retorna todas las órdenes de compra desde Google Sheets.
 */
export async function GET(request) {
  try {
    if (isGoogleConfigured()) {
      const { getRows } = await import('@/lib/google-sheets');
      const ordenes = await getRows();
      return NextResponse.json({ ordenes, source: 'google-sheets' });
    }

    // Fallback: devolver mock data
    return NextResponse.json({
      ordenes: MOCK_ORDENES,
      source: 'mock',
      message: 'Google Sheets no configurado. Usando datos de ejemplo.',
    });
  } catch (error) {
    console.error('Error GET /api/ordenes:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener las órdenes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ordenes
 * Crea una nueva línea de orden de compra.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validaciones básicas
    const requiredFields = ['oc', 'proveedor', 'monto', 'estado', 'descripcion'];
    const missing = requiredFields.filter((f) => !body[f]);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Campos requeridos faltantes: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    if (isGoogleConfigured()) {
      const { appendRow } = await import('@/lib/google-sheets');

      const orden = {
        oc: body.oc,
        proveedor: body.proveedor,
        linea_de_oc: body.linea_de_oc || '',
        monto: body.monto,
        estado: body.estado,
        descripcion: body.descripcion,
        fecha_vencimiento: body.fecha_vencimiento || '',
        comprador: body.comprador || '',
      };

      await appendRow(orden);

      return NextResponse.json(
        { orden, message: 'Orden creada exitosamente' },
        { status: 201 }
      );
    }

    // Fallback: simular creación
    const orden = {
      oc: body.oc,
      proveedor: body.proveedor,
      linea_de_oc: body.linea_de_oc || '',
      monto: parseFloat(body.monto),
      estado: body.estado,
      descripcion: body.descripcion,
      fecha_vencimiento: body.fecha_vencimiento || '',
      comprador: body.comprador || '',
    };

    return NextResponse.json(
      {
        orden,
        source: 'mock',
        message: 'Orden creada (modo mock — Google Sheets no configurado)',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error POST /api/ordenes:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear la orden' },
      { status: 500 }
    );
  }
}
