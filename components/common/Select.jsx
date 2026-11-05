import Field, { controlClass } from './Field'

// options: array of strings or { value, label }
const Select = ({
  label,
  error,
  hint,
  id,
  options = [],
  className = '',
  ...props
}) => (
  <Field id={id} label={label} error={error} hint={hint}>
    <select
      id={id}
      aria-invalid={Boolean(error)}
      className={`h-11 ${controlClass(error)} ${className}`}
      {...props}
    >
      {options.map((option) => {
        const value = typeof option === 'string' ? option : option.value
        const text = typeof option === 'string' ? option : option.label
        return (
          <option key={value} value={value}>
            {text}
          </option>
        )
      })}
    </select>
  </Field>
)

export default Select
