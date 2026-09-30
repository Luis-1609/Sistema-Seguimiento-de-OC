'use client';

/**
 * Select con label y estados de error.
 */
export default function Select({
  label,
  id,
  options = [],
  required = false,
  error,
  placeholder = 'Seleccionar...',
  className = '',
  ...props
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className={`form-label ${required ? 'form-label-required' : ''}`}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={`form-select ${error ? 'error' : ''}`}
        required={required}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
      {error && <p className="form-error-text">{error}</p>}
    </div>
  );
}
