const Badge = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const styles = {
    default:
      `
        bg-[var(--nova-surface-soft)]
        text-[var(--nova-text)]
        border
        border-[var(--nova-border)]
      `,

    success:
      `
        bg-[color-mix(in_srgb,var(--nova-success)_12%,transparent)]
        text-[var(--nova-success)]
        border
        border-[color-mix(in_srgb,var(--nova-success)_20%,transparent)]
      `,

    warning:
      `
        bg-[color-mix(in_srgb,var(--nova-warning)_14%,transparent)]
        text-[var(--nova-warning)]
        border
        border-[color-mix(in_srgb,var(--nova-warning)_22%,transparent)]
      `,

    danger:
      `
        bg-[color-mix(in_srgb,var(--nova-danger)_12%,transparent)]
        text-[var(--nova-danger)]
        border
        border-[color-mix(in_srgb,var(--nova-danger)_20%,transparent)]
      `,

    blue:
      `
        bg-[color-mix(in_srgb,var(--nova-primary)_12%,transparent)]
        text-[var(--nova-primary)]
        border
        border-[color-mix(in_srgb,var(--nova-primary)_20%,transparent)]
      `,
  }

  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-full

        px-2.5
        py-1

        text-xs
        font-semibold
        leading-none
        tracking-wide

        whitespace-nowrap

        transition-colors
        duration-200

        ${styles[variant] || styles.default}

        ${className}
      `}
    >
      {children}
    </span>
  )
}

export default Badge