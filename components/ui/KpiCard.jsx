'use client';

/**
 * Tarjeta de KPI para el dashboard.
 */
export default function KpiCard({ label, value, subtitle, icon, color = 'accent' }) {
  const colorMap = {
    accent: { color: 'var(--color-accent)', bg: 'var(--color-accent-glow)' },
    success: { color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    warning: { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
    error: { color: 'var(--color-error)', bg: 'var(--color-error-bg)' },
    info: { color: 'var(--color-info)', bg: 'var(--color-info-bg)' },
  };

  const colors = colorMap[color] || colorMap.accent;

  return (
    <div
      className="kpi-card"
      style={{
        '--kpi-color': colors.color,
        '--kpi-color-bg': colors.bg,
      }}
    >
      <div className="kpi-card-header">
        <span className="kpi-card-label">{label}</span>
        {icon && (
          <div className="kpi-card-icon" dangerouslySetInnerHTML={{ __html: icon }} />
        )}
      </div>
      <div className="kpi-card-value">{value}</div>
      {subtitle && <div className="kpi-card-subtitle">{subtitle}</div>}
    </div>
  );
}
