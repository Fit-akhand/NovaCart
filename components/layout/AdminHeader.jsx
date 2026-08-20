import { Menu } from 'lucide-react'
import BrandLogo from '../common/BrandLogo'
import ThemeToggle from '../common/ThemeToggle'

const AdminHeader = ({ onMenuClick }) => {
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
        <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-[var(--nova-muted)] sm:inline">
    Super Admin
</span>
      </div>
      <ThemeToggle />
    </header>
  )
}

export default AdminHeader
