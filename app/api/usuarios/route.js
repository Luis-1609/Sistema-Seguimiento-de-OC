import { NextResponse } from 'next/server';

// Mock usuarios para desarrollo
const MOCK_USUARIOS = [
  {
    codigo_comprador: '20222227',
    nombre_comprador: 'IZARRA LIMACHE, LUIS MARIO',
    correo_comprador: 'a20222227@pucp.edu.pe',
    rol: 'Comprador',
  },
  {
    codigo_comprador: '20191582',
    nombre_comprador: 'RUIZ FIGUEROA, NAYELI ALEXANDRA',
    correo_comprador: 'nruizf@pucp.edu.pe',
    rol: 'Comprador',
  },
  {
    codigo_comprador: 'H0004274',
    nombre_comprador: 'CURI NAVARRO, JORGE RUBÉN',
    correo_comprador: 'jcurin@pucp.edu.pe',
    rol: 'Comprador',
  },
  {
    codigo_comprador: '19950071',
    nombre_comprador: 'ESPINOZA ROJAS, JOSE RAUL',
    correo_comprador: 'espinoza.jr@pucp.edu.pe',
    rol: 'Supervisor',
  },
];

const isGoogleConfigured = () => {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.GOOGLE_SHEET_ID
  );
};

/**
 * GET /api/usuarios
 * Lee la pestaña CONFIG del Google Sheet para obtener la lista de usuarios.
 */
export async function GET() {
  try {
    if (isGoogleConfigured()) {
      const { getUsuarios } = await import('@/lib/google-sheets');
      const usuarios = await getUsuarios();
      return NextResponse.json({ usuarios, source: 'google-sheets' });
    }

    // Fallback: mock data
    return NextResponse.json({
      usuarios: MOCK_USUARIOS,
      source: 'mock',
      message: 'Google Sheets no configurado. Usando usuarios de ejemplo.',
    });
  } catch (error) {
    console.error('Error GET /api/usuarios:', error);
    // Si falla la lectura de Sheets, devolver mock igualmente
    return NextResponse.json({
      usuarios: MOCK_USUARIOS,
      source: 'mock-fallback',
      message: `Error leyendo Sheets: ${error.message}. Usando datos de ejemplo.`,
    });
  }
}
