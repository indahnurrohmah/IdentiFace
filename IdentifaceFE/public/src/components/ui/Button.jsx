export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  const classNames = [
    'button',
    `button-${variant}`,
    `button-${size}`,
    fullWidth ? 'button-full' : '',
    disabled || loading ? 'button-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={classNames}
      {...props}
    >
      {loading ? <span className="button-spinner" aria-hidden="true"></span> : null}
      <span>{loading ? 'Sedang masuk...' : children}</span>
    </button>
  )
}

