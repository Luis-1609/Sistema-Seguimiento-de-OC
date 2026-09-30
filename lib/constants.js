// Constantes del sistema

export const ESTADOS = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  EN_PROCESO: 'En Proceso',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
};

export const ESTADOS_LIST = Object.values(ESTADOS);

// Mapeo de estado a clase CSS
export const ESTADO_CSS_CLASS = {
  [ESTADOS.PENDIENTE]: 'pendiente',
  [ESTADOS.APROBADA]: 'aprobada',
  [ESTADOS.EN_PROCESO]: 'en-proceso',
  [ESTADOS.ENTREGADA]: 'entregada',
  [ESTADOS.CANCELADA]: 'cancelada',
};

// Transiciones válidas de estado
export const TRANSICIONES_VALIDAS = {
  [ESTADOS.PENDIENTE]: [ESTADOS.APROBADA, ESTADOS.CANCELADA],
  [ESTADOS.APROBADA]: [ESTADOS.EN_PROCESO, ESTADOS.CANCELADA],
  [ESTADOS.EN_PROCESO]: [ESTADOS.ENTREGADA, ESTADOS.CANCELADA],
  [ESTADOS.ENTREGADA]: [],
  [ESTADOS.CANCELADA]: [],
};

// Columnas del Google Sheet (mapeo índice → nombre)
export const SHEET_COLUMNS = [
  'id',
  'fecha_creacion',
  'proveedor',
  'descripcion',
  'monto',
  'estado',
  'fecha_entrega_estimada',
  'responsable',
  'notas',
  'fecha_actualizacion',
];

// Headers para la primera fila del Sheet
export const SHEET_HEADERS = [
  'ID',
  'Fecha Creación',
  'Proveedor',
  'Descripción',
  'Monto',
  'Estado',
  'Fecha Entrega Estimada',
  'Responsable',
  'Notas',
  'Fecha Actualización',
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
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return fecha;
  }
};

// Generar siguiente ID de OC
export const generateId = (lastId) => {
  if (!lastId) return 'OC-001';
  const num = parseInt(lastId.replace('OC-', ''), 10);
  return `OC-${String(num + 1).padStart(3, '0')}`;
};

// Mock data para desarrollo sin Google Sheets
export const MOCK_ORDENES = [
  {
    id: 'OC-001',
    fecha_creacion: '2026-09-01',
    proveedor: 'Materiales del Norte S.A.',
    descripcion: 'Suministro de material de oficina Q4',
    monto: 15750.00,
    estado: 'Pendiente',
    fecha_entrega_estimada: '2026-10-15',
    responsable: 'Carlos García',
    notas: 'Incluye papel bond y tóner para impresoras',
    fecha_actualizacion: '2026-09-28',
  },
  {
    id: 'OC-002',
    fecha_creacion: '2026-09-05',
    proveedor: 'TechParts México',
    descripcion: 'Equipos de cómputo — 5 laptops Dell',
    monto: 87500.00,
    estado: 'Aprobada',
    fecha_entrega_estimada: '2026-10-20',
    responsable: 'María López',
    notas: 'Especificaciones aprobadas por TI',
    fecha_actualizacion: '2026-09-15',
  },
  {
    id: 'OC-003',
    fecha_creacion: '2026-09-10',
    proveedor: 'Limpieza Industrial Pro',
    descripcion: 'Servicio de limpieza profunda — Planta B',
    monto: 32000.00,
    estado: 'En Proceso',
    fecha_entrega_estimada: '2026-09-30',
    responsable: 'Roberto Méndez',
    notas: 'Programada para fin de mes',
    fecha_actualizacion: '2026-09-20',
  },
  {
    id: 'OC-004',
    fecha_creacion: '2026-08-20',
    proveedor: 'Aceros y Metales SA de CV',
    descripcion: 'Lámina de acero galvanizado 3mm',
    monto: 125000.00,
    estado: 'Entregada',
    fecha_entrega_estimada: '2026-09-15',
    responsable: 'Ana Ramírez',
    notas: 'Entregado completo — verificar calidad',
    fecha_actualizacion: '2026-09-16',
  },
  {
    id: 'OC-005',
    fecha_creacion: '2026-09-12',
    proveedor: 'Distribuidora Eléctrica Central',
    descripcion: 'Cable eléctrico calibre 12 — 500m',
    monto: 8900.00,
    estado: 'Cancelada',
    fecha_entrega_estimada: '2026-10-01',
    responsable: 'Pedro Hernández',
    notas: 'Cancelada por cambio de proveedor',
    fecha_actualizacion: '2026-09-14',
  },
  {
    id: 'OC-006',
    fecha_creacion: '2026-09-18',
    proveedor: 'Muebles Corporativos Ideal',
    descripcion: 'Escritorios ergonómicos — 10 unidades',
    monto: 67200.00,
    estado: 'Pendiente',
    fecha_entrega_estimada: '2026-11-01',
    responsable: 'Laura Sánchez',
    notas: 'Cotización pendiente de revisión',
    fecha_actualizacion: '2026-09-25',
  },
  {
    id: 'OC-007',
    fecha_creacion: '2026-09-22',
    proveedor: 'Seguridad Industrial MX',
    descripcion: 'EPP: Cascos, guantes y botas de seguridad',
    monto: 45600.00,
    estado: 'Aprobada',
    fecha_entrega_estimada: '2026-10-10',
    responsable: 'Carlos García',
    notas: 'Para personal de planta nueva',
    fecha_actualizacion: '2026-09-26',
  },
];
