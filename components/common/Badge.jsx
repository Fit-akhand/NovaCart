const Badge = ({ children, variant = 'default', className = '' }) => {
  const styles = {
    default:
      'bg-[var(--nova-surface-soft)] text-[var(--nova-text)] border border-[var(--nova-border)]',
    success:
      'bg-[color-mix(in_srgb,var(--nova-success)_12%,transparent)] text-[var(--nova-success)]',
    warning:
      'bg-[color-mix(in_srgb,var(--nova-warning)_14%,transparent)] text-[var(--nova-warning)]',
    danger:
      'bg-[color-mix(in_srgb,var(--nova-danger)_12%,transparent)] text-[var(--nova-danger)]',
    blue:
      'bg-[color-mix(in_srgb,var(--nova-blue)_12%,transparent)] text-[var(--nova-blue)]',
  }

  return (
    <span
      className={`
        inline-flex items-center rounded-full
        px-2.5 py-1
        text-xs font-semibold
        ${styles[variant] || styles.default}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

export default Badge
