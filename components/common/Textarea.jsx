import Field, { controlClass } from './Field'

const Textarea = ({
  label,
  error,
  hint,
  id,
  rows = 3,
  className = '',
  ...props
}) => (
  <Field id={id} label={label} error={error} hint={hint}>
    <textarea
      id={id}
      rows={rows}
      aria-invalid={Boolean(error)}
      className={`resize-none py-3 ${controlClass(error)} ${className}`}
      {...props}
    />
  </Field>
)

export default Textarea
