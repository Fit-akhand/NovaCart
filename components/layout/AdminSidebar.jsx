import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  FolderTree,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react'

const links = [
  { href: '/', label: 'Storefront', icon: LayoutDashboard },
  { href: '/create', label: 'Products', icon: Package },
  { href: '/categories', label: 'Categories', icon: FolderTree },
  { href: '/profile#orders', label: 'Orders', icon: ShoppingBag },
  { href: '/users', label: 'Customers', icon: Users },
]

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

      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href !== '/' && router.pathname.startsWith(href.split('#')[0])
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
              active
                ? 'bg-[var(--nova-surface-soft)] text-[var(--nova-blue)]'
                : 'hover:bg-[var(--nova-surface-soft)]'
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        )
      })}

      <p className="mt-auto px-3 pt-6 text-xs text-[var(--nova-muted)]">
        Analytics and settings are not available yet.
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
