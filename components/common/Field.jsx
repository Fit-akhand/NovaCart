// Shared label + error/hint wrapper and control styling for all form fields.
export const controlClass = (error) => `
  w-full rounded-xl border bg-[var(--nova-surface)] px-4 text-sm
  text-[var(--nova-text)] outline-none transition-all duration-200 ease-out
  placeholder:text-[var(--nova-muted)]
  disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-[var(--nova-surface-soft)]
  ${
    error
      ? 'border-[var(--nova-danger)] focus:border-[var(--nova-danger)] focus:ring-2 focus:ring-[rgba(225,29,72,0.12)]'
      : 'border-[var(--nova-border)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.14)]'
  }
`

const Field = ({ id, label, error, hint, className = '', children }) => (
  <div className={`w-full ${className}`}>
    {label && (
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-[var(--nova-text)]"
      >
        {label}
      </label>
    )}

    {children}

    {error ? (
      <p className="mt-1.5 text-xs font-medium text-[var(--nova-danger)]">
        {error}
      </p>
    ) : (
      hint && (
        <p className="mt-1.5 text-xs text-[var(--nova-muted)]">{hint}</p>
      )
    )}
  </div>
)

export default Field
