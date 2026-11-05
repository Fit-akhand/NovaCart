import Link from 'next/link'
import { useRouter } from 'next/router'
import { ArrowLeft, ChevronRight } from 'lucide-react'

import { getBreadcrumbs } from './adminNav'

// Back button + breadcrumbs shown on every admin page.
const AdminPageBar = () => {
  const router = useRouter()
  const trail = getBreadcrumbs(router.pathname)

  // Back goes to the logical parent, so it always works,
  // even when the page was opened directly.
  const parent = trail.length > 1 ? trail[trail.length - 2] : null

  if (!parent) return null

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-3 lg:px-8">
      <Link
        href={parent.href}
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--nova-border)] px-3 py-2 text-sm font-semibold text-[var(--nova-text)] transition-colors hover:border-[var(--nova-violet-light)] hover:bg-[var(--nova-lavender-soft)] hover:text-[var(--nova-primary)]"
      >
        <ArrowLeft size={16} />
        Back to {parent.title}
      </Link>

      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-[var(--nova-muted)]">
          {trail.map((crumb, index) => {
            const last = index === trail.length - 1
            return (
              <li key={crumb.href} className="flex items-center gap-1.5">
                {last ? (
                  <span
                    aria-current="page"
                    className="font-semibold text-[var(--nova-text)]"
                  >
                    {crumb.title}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-[var(--nova-primary)]"
                  >
                    {crumb.title}
                  </Link>
                )}
                {!last && <ChevronRight size={14} />}
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}

export default AdminPageBar
