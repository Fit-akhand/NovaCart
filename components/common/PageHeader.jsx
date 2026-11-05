// One consistent page title block: title, optional subtitle and actions.
const PageHeader = ({ title, description, actions, className = '' }) => (
  <div
    className={`mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between ${className}`}
  >
    <div className="min-w-0">
      <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--nova-text)] sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 text-sm text-[var(--nova-muted)]">
          {description}
        </p>
      )}
    </div>
    {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
  </div>
)

export default PageHeader
