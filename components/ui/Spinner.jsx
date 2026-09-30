'use client';

/**
 * Spinner de carga con estado textual.
 */
export default function Spinner({ size = 'md', text }) {
  return (
    <div className="loading-state">
      <span className={`spinner spinner-${size}`} />
      {text && <span>{text}</span>}
    </div>
  );
}
