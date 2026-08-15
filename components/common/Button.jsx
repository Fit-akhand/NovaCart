const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
}) => {
  const styles = {
    primary:
      'bg-[var(--nova-blue)] text-white border-[var(--nova-blue)] hover:opacity-90',
    secondary:
      'bg-[var(--nova-surface)] text-[var(--nova-text)] border-[var(--nova-border)] hover:bg-[var(--nova-surface-soft)]',
    dark:
      'bg-[var(--nova-navy)] text-white border-[var(--nova-navy)] hover:opacity-90',
    danger:
      'bg-[var(--nova-danger)] text-white border-[var(--nova-danger)] hover:opacity-90',
    ghost:
      'bg-transparent text-[var(--nova-text)] border-transparent hover:bg-[var(--nova-surface-soft)]',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
        className={`
          inline-flex min-h-11 items-center justify-center
          rounded-lg border px-5 py-3
          text-sm font-semibold
          transition
          disabled:cursor-not-allowed
          disabled:opacity-50
          ${styles[variant] || styles.primary}
          ${className}
        `}
    >
      {loading ? 'Please wait...' : children}
    </button>
  )
}

export default Button