import Link from 'next/link'
import { useRouter } from 'next/router'
import { X } from 'lucide-react'
import { ADMIN_NAV, isNavActive } from './adminNav'

const AdminSidebar = ({ open, onClose }) => {
  const router = useRouter()

  const content = (
    <nav className="flex h-full flex-col bg-[var(--nova-surface)] p-4 text-[var(--nova-text)]">
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <p className="text-sm font-semibold">Admin</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close admin menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[var(--nova-surface-soft)]"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-5">
        {ADMIN_NAV.map(({ group, items }) => (
          <div key={group}>
            <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--nova-muted)]">
              {group}
            </p>

            {items.map((item) => {
              const Icon = item.icon
              const active = isNavActive(item, router.pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[var(--nova-lavender-soft)] text-[var(--nova-primary)]'
                      : 'text-[var(--nova-text)] hover:bg-[var(--nova-surface-soft)]'
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      <p className="mt-auto px-3 pt-6 text-xs text-[var(--nova-muted)]">
        Platform administration
      </p>
    </nav>
  )

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-[var(--nova-border)] lg:block">
        {content}
      </aside>

      {open && (
        <div className="fixed inset-0 z-[1000] lg:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <div className="absolute left-0 top-0 h-full w-64 border-r border-[var(--nova-border)]">
            {content}
          </div>
        </div>
      )}
    </>
  )
}

export default AdminSidebar
