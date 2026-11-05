import Field, { controlClass } from './Field'

const Input = ({ label, error, hint, id, className = '', ...props }) => (
  <Field id={id} label={label} error={error} hint={hint}>
    <input
      id={id}
      aria-invalid={Boolean(error)}
      className={`h-11 ${controlClass(error)} ${className}`}
      {...props}
    />
  </Field>
)

export default Input
