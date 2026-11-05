import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { LogOut, Search, ShoppingCart, X } from 'lucide-react'

import BrandLogo from '../common/BrandLogo'
import { getAccountLinks, getMainLinks } from './navConfig'

const linkClass =
  'flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-[var(--nova-text)] transition-colors hover:bg-[var(--nova-lavender-soft)] hover:text-[var(--nova-primary)]'

const MobileNav = ({
  open,
  onClose,
  search,
  setSearch,
  onSearch,
  isLoggedIn,
  user,
  cartCount,
  onLogout,
}) => {
  const router = useRouter()

  // Close on navigation and lock page scroll while open.
  useEffect(() => {
    router.events.on('routeChangeStart', onClose)
    return () => router.events.off('routeChangeStart', onClose)
  }, [router.events, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  const mainLinks = getMainLinks(user?.role)
  const accountLinks = getAccountLinks(user?.role)

  return (
    <div className="fixed inset-0 z-[1100] lg:hidden">
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-[var(--nova-surface)] shadow-[var(--shadow-lg)]"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--nova-border)] px-4">
          <BrandLogo compact />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-[var(--nova-surface-soft)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <form onSubmit={onSearch} role="search" className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-11 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] pl-10 pr-4 text-sm text-[var(--nova-text)] outline-none focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
            />
          </form>

          <nav aria-label="Browse" className="space-y-1">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={linkClass}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/cart" onClick={onClose} className={linkClass}>
              <ShoppingCart size={17} />
              Cart
              {cartCount > 0 && (
                <span className="ml-auto rounded-full bg-[var(--nova-primary)] px-2 py-0.5 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>

          {isLoggedIn && (
            <nav aria-label="Account" className="space-y-1">
              <p className="px-3.5 pb-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--nova-muted)]">
                My account
              </p>
              {accountLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={linkClass}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--nova-border)] p-4">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={onLogout}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--nova-border)] text-sm font-semibold text-[var(--nova-danger)] hover:bg-[var(--nova-surface-soft)]"
            >
              <LogOut size={16} />
              Sign out
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/signin"
                onClick={onClose}
                className="flex min-h-11 items-center justify-center rounded-xl bg-[var(--nova-primary)] text-sm font-semibold text-white"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--nova-border)] text-sm font-semibold text-[var(--nova-text)]"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

export default MobileNav
