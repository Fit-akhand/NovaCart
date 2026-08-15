import { PackageOpen } from 'lucide-react'

const EmptyState = ({
  title = 'Nothing here yet',
  description = 'There is nothing to display right now.',
  action,
  className = '',
}) => {
  return (
    <div
      className={`
        flex min-h-[300px]
        flex-col items-center justify-center
        rounded-2xl border border-dashed
        border-[var(--nova-border)]
        bg-[var(--nova-surface)]
        px-6 py-12 text-center
        ${className}
      `}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--nova-surface-soft)] text-[var(--nova-muted)]">
        <PackageOpen size={26} />
      </div>

      <h3 className="text-lg font-semibold text-[var(--nova-text)]">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-[var(--nova-muted)]">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export default EmptyState