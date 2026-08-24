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
      'bg-[var(--nova-primary)] text-white border-[var(--nova-primary)] hover:bg-[var(--nova-primary-hover)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.22)] active:bg-[var(--nova-primary-active)]',

    secondary:
      'bg-[var(--nova-surface)] text-[var(--nova-text)] border-[var(--nova-border)] hover:bg-[var(--nova-surface-soft)] hover:border-[var(--nova-violet-light)]',

    dark:
      'bg-[var(--nova-navy)] text-white border-[var(--nova-navy)] hover:bg-[var(--nova-primary-hover)] hover:border-[var(--nova-primary-hover)]',

    danger:
      'bg-[var(--nova-danger)] text-white border-[var(--nova-danger)] hover:opacity-90 hover:shadow-[0_8px_20px_rgba(225,29,72,0.18)]',

    ghost:
      'bg-transparent text-[var(--nova-text)] border-transparent hover:bg-[var(--nova-surface-soft)] hover:text-[var(--nova-primary)]',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex min-h-11 items-center justify-center
        rounded-xl border px-5 py-3
        text-sm font-semibold
        tracking-[-0.01em]
        transition-all duration-200 ease-out
        active:scale-[0.98]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[var(--nova-primary)]
        focus-visible:ring-offset-2
        focus-visible:ring-offset-[var(--nova-bg)]
        disabled:cursor-not-allowed
        disabled:opacity-50
        disabled:pointer-events-none
        ${styles[variant] || styles.primary}
        ${className}
      `}
    >
      {loading ? 'Please wait...' : children}
    </button>
  )
}

export default Button