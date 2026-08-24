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
        flex
        min-h-[320px]
        flex-col
        items-center
        justify-center

        rounded-3xl

        border
        border-dashed
        border-[var(--nova-border)]

        bg-[var(--nova-surface)]

        px-6
        py-14

        text-center

        shadow-[var(--shadow-sm)]

        transition-all
        duration-300

        hover:border-[var(--nova-violet-light)]
        hover:shadow-[0_12px_30px_rgba(124,58,237,0.06)]

        ${className}
      `}
    >
      {/* =====================================================
          ICON
      ===================================================== */}

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

          transition-all
          duration-300

          hover:scale-105
          hover:shadow-[0_12px_30px_rgba(124,58,237,0.14)]
        "
      >
        <PackageOpen
          size={28}
          strokeWidth={1.8}
        />
      </div>


      {/* =====================================================
          TITLE
      ===================================================== */}

      <h3
        className="
          text-lg
          font-bold
          tracking-[-0.015em]

          text-[var(--nova-text)]
        "
      >
        {title}
      </h3>


      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

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


      {/* =====================================================
          ACTION
      ===================================================== */}

      {action && (
        <div
          className="
            mt-6
            flex
            items-center
            justify-center
          "
        >
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState