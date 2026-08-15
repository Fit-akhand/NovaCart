import Link from 'next/link'
import { LogOut, Package, ShoppingCart, User, X } from 'lucide-react'

const MobileNav = ({
  open,
  onClose,
  search,
  setSearch,
  onSearch,
  isLoggedIn,
  isAdmin,
  cartCount,
  onLogout,
}) => {
  if (!open) return null

  const linkClass =
    'block rounded-lg px-4 py-3 text-sm font-semibold text-[var(--nova-text)] transition hover:bg-[var(--nova-surface-soft)] hover:text-[var(--nova-blue)]'

  return (
    <div className="fixed inset-0 z-[1100] lg:hidden">
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <aside
        className="absolute left-0 top-0 flex h-full w-[min(88vw,360px)] flex-col bg-[var(--nova-surface)] text-[var(--nova-text)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex h-[var(--navbar-height)] items-center justify-between border-b border-[var(--nova-border)] px-4">
          <p className="text-sm font-semibold">Menu</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[var(--nova-surface-soft)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <form
            onSubmit={(event) => {
              onSearch(event)
              onClose()
            }}
            className="mb-5"
          >
            <label htmlFor="mobile-search" className="sr-only">
              Search products
            </label>
            <input
              id="mobile-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="h-11 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-4 text-sm text-[var(--nova-text)] outline-none placeholder:text-[var(--nova-muted)] focus:border-[var(--nova-blue)]"
            />
          </form>

          <nav className="space-y-1">
            <Link href="/" onClick={onClose} className={linkClass}>
              Home
            </Link>
            <Link href="/products" onClick={onClose} className={linkClass}>
              Products
            </Link>
            <Link href="/categories" onClick={onClose} className={linkClass}>
              Categories
            </Link>
            <Link href="/products?sort=-sold" onClick={onClose} className={linkClass}>
              Deals
            </Link>

            {isAdmin && (
              <>
                <div className="my-4 border-t border-[var(--nova-border)]" />
                <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-[var(--nova-muted)]">
                  Administration
                </p>
                <Link href="/create" onClick={onClose} className={linkClass}>
                  Create
                </Link>
                <Link href="/users" onClick={onClose} className={linkClass}>
                  Users
                </Link>
              </>
            )}

            <div className="my-4 border-t border-[var(--nova-border)]" />

            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold hover:bg-[var(--nova-surface-soft)] hover:text-[var(--nova-blue)]"
            >
              <span className="inline-flex items-center gap-2">
                <ShoppingCart size={16} />
                Cart
              </span>
              {cartCount > 0 && (
                <span className="rounded-full bg-[var(--nova-blue)] px-2 py-0.5 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn && (
              <>
                <Link href="/profile" onClick={onClose} className={linkClass}>
                  <span className="inline-flex items-center gap-2">
                    <User size={16} />
                    Profile
                  </span>
                </Link>
                <Link href="/profile#orders" onClick={onClose} className={linkClass}>
                  <span className="inline-flex items-center gap-2">
                    <Package size={16} />
                    Orders
                  </span>
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="border-t border-[var(--nova-border)] p-4">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--nova-border)] px-4 py-3 text-sm font-semibold hover:text-[var(--nova-danger)]"
            >
              <LogOut size={17} />
              Sign out
            </button>
          ) : (
            <Link
              href="/signin"
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-lg bg-[var(--nova-blue)] px-4 py-3 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
          )}
        </div>
      </aside>
    </div>
  )
}

export default MobileNav
