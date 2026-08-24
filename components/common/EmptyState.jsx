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

        rounded-2xl
        border border-dashed
        border-[var(--nova-border)]

        bg-[var(--nova-surface)]

        px-6 py-12
        text-center

        transition-colors
        duration-200

        hover:border-[var(--nova-violet-light)]

        ${className}
      `}
    >
      {/* Icon */}
      <div
        className="
          mb-5
          flex
          h-16
          w-16
          items-center
          justify-center

          rounded-2xl

          border
          border-[color-mix(in_srgb,var(--nova-primary)_18%,transparent)]

          bg-[var(--nova-lavender-soft)]

          text-[var(--nova-primary)]

          shadow-[0_8px_24px_rgba(124,58,237,0.08)]

          transition-transform
          duration-200

          hover:scale-105
        "
      >
        <PackageOpen
          size={28}
          strokeWidth={1.8}
        />
      </div>

      {/* Title */}
      <h3
        className="
          text-lg
          font-semibold
          tracking-[-0.01em]
          text-[var(--nova-text)]
        "
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="
          mt-2
          max-w-md
          text-sm
          leading-6
          text-[var(--nova-muted)]
        "
      >
        {description}
      </p>

      {/* Action */}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState