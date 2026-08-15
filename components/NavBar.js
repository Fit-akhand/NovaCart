import React, { useContext, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { DataContext } from '../store/GlobalState'
import { postData } from '../utils/fetchData'

const NAV_LINKS = [
  { href: '/', label: 'Home', match: (path) => path === '/' },
  { href: '/', label: 'Products', match: (path) => path === '/' },
  { href: '/categories', label: 'Categories', match: (path) => path === '/categories' },
  { href: '/?sort=-sold', label: 'Deals', match: (path, query) => path === '/' && query.sort === '-sold' },
]

function NavBar() {
  const router = useRouter()
  const { state, dispatch } = useContext(DataContext)
  const { auth, cart } = state

  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isLoggedIn = Boolean(auth?.user && auth?.token)

  const isActive = (match) => match(router.pathname, router.query)

  const linkClass = (active) =>
    `shrink-0 text-sm font-medium transition-colors ${
      active
        ? 'text-[var(--nova-blue)]'
        : 'text-slate-600 hover:text-[var(--nova-navy)]'
    }`

  const handleLogout = async () => {
    await postData('auth/logout', {})
    localStorage.removeItem('firstLogin')
    dispatch({ type: 'AUTH', payload: {} })
    dispatch({ type: 'NOTIFY', payload: { success: 'Logged out!' } })
    setProfileOpen(false)
    setMobileOpen(false)
    router.push('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    router.push(q ? `/?search=${encodeURIComponent(q)}` : '/')
    setMobileOpen(false)
  }

  const closeMenus = () => {
    setMobileOpen(false)
    setProfileOpen(false)
  }

  return (
    <header
      className="sticky top-0 z-[1000] w-full border-b border-slate-200 bg-white shadow-sm"
      style={{ height: 'var(--navbar-height)' }}
    >
      <div className="flex h-full w-full min-w-0 items-center gap-2 px-4 sm:px-6 lg:gap-3 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-[var(--nova-navy)]"
          onClick={closeMenus}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: 'var(--nova-navy)' }}
          >
            <Sparkles size={18} />
          </span>
          <span className="text-lg font-semibold tracking-tight">NovaCart</span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden shrink-0 items-center gap-5 xl:flex"
          aria-label="Main"
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={linkClass(isActive(item.match))}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="hidden min-w-0 flex-1 lg:block"
        >
          <div className="relative mx-auto w-full max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--nova-blue)] focus:bg-white focus:ring-2 focus:ring-blue-100"
              aria-label="Search for products"
            />
          </div>
        </form>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-0.5 xl:flex">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-[var(--nova-navy)]"
            aria-label="Wishlist"
          >
            <Heart size={20} />
          </button>

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-[var(--nova-navy)]"
            aria-label={`Cart, ${cart.length} items`}
          >
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
                style={{ backgroundColor: 'var(--nova-blue)' }}
              >
                {cart.length}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <>
              {auth.user.role === 'admin' && (
                <Link
                  href="/users"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[var(--nova-navy)]"
                >
                  Admin
                </Link>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                >
                  {auth.user.avatar ? (
                    <img
                      src={auth.user.avatar}
                      alt={auth.user.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </button>

                {profileOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40 cursor-default"
                      aria-hidden="true"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                      <div className="border-b border-slate-100 px-4 py-2">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {auth.user.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {auth.user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 2xl:flex"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/signin"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--nova-blue)' }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: cart + menu */}
        <div className="ml-auto flex shrink-0 items-center gap-0.5 xl:hidden">
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
            aria-label={`Cart, ${cart.length} items`}
          >
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
                style={{ backgroundColor: 'var(--nova-blue)' }}
              >
                {cart.length}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white xl:hidden">
          <div className="space-y-4 px-4 py-4 sm:px-6">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-[var(--nova-blue)] focus:bg-white focus:ring-2 focus:ring-blue-100"
                  aria-label="Search for products"
                />
              </div>
            </form>

            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`rounded-lg px-3 py-2.5 ${linkClass(isActive(item.match))}`}
                  onClick={closeMenus}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </button>
              <span className="text-sm text-slate-500">Wishlist</span>
            </div>

            {isLoggedIn ? (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3 px-3 py-2">
                  {auth.user.avatar && (
                    <img
                      src={auth.user.avatar}
                      alt={auth.user.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {auth.user.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {auth.user.email}
                    </p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  onClick={closeMenus}
                >
                  <User size={18} />
                  Profile
                </Link>
                {auth.user.role === 'admin' && (
                  <Link
                    href="/users"
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    onClick={closeMenus}
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                <Link
                  href="/signin"
                  className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-100"
                  onClick={closeMenus}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--nova-blue)' }}
                  onClick={closeMenus}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default NavBar
