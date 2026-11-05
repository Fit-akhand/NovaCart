// Standard surface used for every panel: sections, forms, summaries.
const Card = ({ title, description, action, children, className = '' }) => (
  <section
    className={`rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6 ${className}`}
  >
    {(title || action) && (
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          {title && (
            <h2 className="text-lg font-bold tracking-tight text-[var(--nova-text)]">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-[var(--nova-muted)]">
              {description}
            </p>
          )}
        </div>
        {action}
      </header>
    )}
    {children}
  </section>
)

export default Card
