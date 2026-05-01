export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  autoComplete = 'off',
  className = '',
  ...props
}) {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label htmlFor={id || name} className="input-label">
          {label}
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error ? <p className="input-help">{error}</p> : null}
    </div>
  )
}
