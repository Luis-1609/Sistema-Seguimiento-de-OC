// Constantes del sistema — mapeadas al Google Sheet real

// Estados posibles (ajustar según lo que uses en tu Sheet)
export const ESTADOS = {
  DESPACHADO: 'Despachado',
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En Proceso',
  RECIBIDO: 'Recibido',
  CANCELADO: 'Cancelado',
};

export const ESTADOS_LIST = Object.values(ESTADOS);

// Mapeo de estado a clase CSS para los badges
export const ESTADO_CSS_CLASS = {
  'Despachado': 'en-proceso',
  'Pendiente': 'pendiente',
  'En Proceso': 'en-proceso',
  'Recibido': 'entregada',
  'Cancelado': 'cancelada',
  // Fallbacks para variaciones
  'despachado': 'en-proceso',
  'pendiente': 'pendiente',
  'en proceso': 'en-proceso',
  'recibido': 'entregada',
  'cancelado': 'cancelada',
};

/**
 * Columnas del Google Sheet real (pestaña DATA):
 * A = OC (número de orden)
 * B = Proveedor
 * C = Línea de OC
 * D = Monto
 * E = Estado
 * F = Descripcion
 * G = Fecha vencimiento
 * H = Comprador
 */
export const SHEET_COLUMNS = [
  'oc',
  'proveedor',
  'linea_de_oc',
  'monto',
  'estado',
  'descripcion',
  'fecha_vencimiento',
  'comprador',
];

// Headers para la primera fila del Sheet
export const SHEET_HEADERS = [
  'OC',
  'Proveedor',
  'Línea de OC',
  'Monto',
  'Estado',
  'Descripcion',
  'Fecha vencimiento',
  'Comprador',
];

// Formato de moneda
export const formatMonto = (monto) => {
  const num = parseFloat(monto);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(num);
};

// Formato de fecha legible
export const formatFecha = (fecha) => {
  if (!fecha) return '—';
  try {
    // Manejar formato "6/10/2026" (M/D/YYYY) de Google Sheets
    const parts = fecha.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      return new Date(year, month - 1, day).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return fecha;
  }
};

// Mock data para desarrollo sin Google Sheets
export const MOCK_ORDENES = [
  {
    oc: '642323',
    proveedor: 'Multimport',
    linea_de_oc: '1',
    monto: 38,
    estado: 'Despachado',
    descripcion: 'Kit teclado mouse',
    fecha_vencimiento: '6/10/2026',
    comprador: '20222227',
  },
  {
    oc: '642323',
    proveedor: 'Multimport',
    linea_de_oc: '2',
    monto: 60,
    estado: 'Despachado',
    descripcion: 'Tinta 938',
    fecha_vencimiento: '6/10/2026',
    comprador: '20222227',
  },
  {
    oc: '642323',
    proveedor: 'Multimport',
    linea_de_oc: '3',
    monto: 1200,
    estado: 'Despachado',
    descripcion: 'Logitech h390',
    fecha_vencimiento: '6/10/2026',
    comprador: '20222227',
  },
  {
    oc: '640505',
    proveedor: 'Esconsa',
    linea_de_oc: '1',
    monto: 80,
    estado: 'Despachado',
    descripcion: 'Patch cords',
    fecha_vencimiento: '6/10/2026',
    comprador: '20191582',
  },
];
