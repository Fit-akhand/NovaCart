import Link from 'next/link'
import { LogOut, Menu, Store } from 'lucide-react'

import useLogout from '@/hooks/useLogout'
import BrandLogo from '../common/BrandLogo'
import ThemeToggle from '../common/ThemeToggle'

const AdminHeader = ({ onMenuClick }) => {
  const logout = useLogout()

  return (
    <header className="sticky top-0 z-[900] flex h-16 items-center justify-between border-b border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open admin menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[var(--nova-surface-soft)] lg:hidden"
        >
          <Menu size={20} />
        </button>
        <BrandLogo compact />
        <span className="hidden rounded-full bg-[var(--nova-lavender-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nova-primary)] sm:inline">
          Admin
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[var(--nova-text)] hover:bg-[var(--nova-lavender-soft)] hover:text-[var(--nova-primary)]"
        >
          <Store size={17} />
          <span className="hidden sm:inline">View store</span>
        </Link>
        <ThemeToggle />
        <button
          type="button"
          onClick={logout}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[var(--nova-danger)] hover:bg-[var(--nova-surface-soft)]"
        >
          <LogOut size={17} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}

export default AdminHeader
