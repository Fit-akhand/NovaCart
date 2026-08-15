const Input = ({
  label,
  error,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-medium text-[var(--nova-text)]"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={`
          h-11 w-full rounded-xl border
          bg-[var(--nova-surface)]
          px-4 text-sm
          text-[var(--nova-text)]
          outline-none
          placeholder:text-[var(--nova-muted)]
          transition
          ${
            error
              ? 'border-[var(--nova-danger)]'
              : 'border-[var(--nova-border)] focus:border-[var(--nova-blue)]'
          }
          disabled:cursor-not-allowed disabled:opacity-70
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="mt-1.5 text-xs text-[var(--nova-danger)]">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input