'use client';

/**
 * Botón reutilizable con variantes y estados.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconOnly = false,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  onClick,
  ...props
}) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const iconOnlyClass = iconOnly ? 'btn-icon' : '';

  const classes = [baseClass, variantClass, sizeClass, iconOnlyClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="spinner spinner-sm" />
      ) : icon ? (
        <span className="btn-icon-inner" dangerouslySetInnerHTML={{ __html: icon }} />
      ) : null}
      {!iconOnly && children}
    </button>
  );
}
