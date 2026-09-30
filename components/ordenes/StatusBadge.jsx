'use client';

import { ESTADO_CSS_CLASS } from '@/lib/constants';

/**
 * Badge visual para el estado de una orden de compra.
 */
export default function StatusBadge({ estado }) {
  const cssClass = ESTADO_CSS_CLASS[estado] || 'pendiente';

  return (
    <span className={`status-badge status-badge--${cssClass}`}>
      <span className="status-badge-dot" />
      {estado}
    </span>
  );
}
