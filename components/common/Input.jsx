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
          className="
            mb-2 block text-sm font-medium
            text-[var(--nova-text)]
          "
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

          transition-all duration-200 ease-out

          ${
            error
              ? `
                border-[var(--nova-danger)]
                focus:border-[var(--nova-danger)]
                focus:ring-2
                focus:ring-[rgba(225,29,72,0.12)]
              `
              : `
                border-[var(--nova-border)]
                hover:border-[var(--nova-violet-light)]
                focus:border-[var(--nova-primary)]
                focus:ring-2
                focus:ring-[rgba(139,92,246,0.14)]
              `
          }

          disabled:cursor-not-allowed
          disabled:opacity-70
          disabled:bg-[var(--nova-surface-soft)]

          ${className}
        `}
        {...props}
      />

      {error && (
        <p
          className="
            mt-1.5
            text-xs
            font-medium
            text-[var(--nova-danger)]
          "
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default Input