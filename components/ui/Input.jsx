'use client';

/**
 * Input con label y estados de error.
 */
export default function Input({
  label,
  id,
  type = 'text',
  required = false,
  error,
  hint,
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
      <input
        id={id}
        type={type}
        className={`form-input ${error ? 'error' : ''}`}
        required={required}
        {...props}
      />
      {error && <p className="form-error-text">{error}</p>}
      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  );
}
