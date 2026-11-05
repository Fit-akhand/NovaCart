import { ChevronDown, LogOut, Menu, Search, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

import { DataContext } from '../../store/GlobalState'
import { postData } from '@/lib/api-client'

import BrandLogo from '../common/BrandLogo'
import ThemeToggle from '../common/ThemeToggle'
import MobileNav from './MobileNav'
import { getAccountLinks, getMainLinks } from './navConfig'

const StoreHeader = () => {
  const { state, dispatch } = useContext(DataContext)
  const { auth, cart } = state
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const profileRef = useRef(null)

  const isLoggedIn = Boolean(auth?.token)

  const role = auth?.user?.role
  const mainLinks = getMainLinks(role)
  const accountLinks = getAccountLinks(role)

  const cartCount =
    cart?.reduce(
      (total, item) => total + (item.quantity || 1),
      0
    ) || 0

  /* -----------------------------------------
     Sync search with URL
  ----------------------------------------- */

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(
      window.location.search
    )

    const searchValue = params.get('search')

    if (searchValue && searchValue !== 'all') {
      setSearch(searchValue)
    } else {
      setSearch('')
    }
  }, [router.asPath])

  /* -----------------------------------------
     Close profile dropdown on outside click
  ----------------------------------------- */

  useEffect(() => {
    const onClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', onClick)

    return () => {
      document.removeEventListener(
        'mousedown',
        onClick
      )
    }
  }, [])

  /* -----------------------------------------
     Search
  ----------------------------------------- */

  const handleSearch = (event) => {
    event.preventDefault()

    const value = search.trim()

    if (!value) {
      router.push('/products')
      return
    }

    router.push(
      `/products?search=${encodeURIComponent(value)}`
    )
  }

  /* -----------------------------------------
     Logout
  ----------------------------------------- */

  const handleLogout = async () => {
    try {

      sessionStorage.setItem(
          '__novacart_logout',
          'true'
      ) 

      await postData(
        'auth/logout',
        null,
        auth?.token
      )

      // ================================================
      // IMPORTANT
      // DO NOT clear cart here.
      //
      // GlobalState knows that this is a logout
      // transition and prevents the account cart
      // from becoming the guest cart.
      // ================================================

      if (
        typeof window !== 'undefined'
      ) {
        localStorage.removeItem(
          'firstLogin'
        )
      }

      dispatch({
        type: 'AUTH',
        payload: {},
      })

      dispatch({
        type: 'ADD_ORDERS',
        payload: [],
      })

      dispatch({
        type: 'ADD_USERS',
        payload: [],
      })

      setMenuOpen(false)
      setProfileOpen(false)

      // Give GlobalState time to process the
      // account -> guest transition.
      window.location.href = '/'

    } catch (error) {
      dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            error?.message ||
            'Logout failed.',
        },
      })
    }
  }

  const iconButton =
    'relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-[var(--nova-text)] transition-all duration-200 hover:border-[var(--nova-border)] hover:bg-[var(--nova-lavender-soft)] hover:text-[var(--nova-primary)] active:scale-95'

  const isActive = (href) =>
    href === '/'
      ? router.pathname === '/'
      : router.pathname.startsWith(href.split('#')[0])

  const initial = (auth?.user?.name || 'U').charAt(0).toUpperCase()

  return (
    <>
      <header
        className="sticky top-0 z-[1000] w-full border-b border-[var(--nova-border)] bg-[color-mix(in_srgb,var(--nova-surface)_88%,transparent)] text-[var(--nova-text)] backdrop-blur-xl"
        style={{ height: 'var(--navbar-height)' }}
      >
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-center gap-2 px-3 sm:px-5 lg:gap-4 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            className={`${iconButton} shrink-0 lg:hidden`}
          >
            <Menu size={21} />
          </button>

          <BrandLogo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-[var(--nova-lavender-soft)] hover:text-[var(--nova-primary)] ${
                  isActive(link.href)
                    ? 'bg-[var(--nova-lavender-soft)] text-[var(--nova-primary)]'
                    : 'text-[var(--nova-text)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form
            onSubmit={handleSearch}
            role="search"
            className="ml-auto hidden min-w-0 max-w-xl flex-1 md:flex"
          >
            <div className="relative w-full">
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
                className="h-10 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] pl-10 pr-4 text-sm text-[var(--nova-text)] outline-none placeholder:text-[var(--nova-muted)] transition-all duration-200 hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:bg-[var(--nova-surface)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
              />
            </div>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-2">
            <Link
              href="/cart"
              aria-label={`Cart${cartCount ? `, ${cartCount} items` : ''}`}
              className={iconButton}
            >
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[var(--nova-primary)] px-1 text-[9px] font-bold leading-none text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <ThemeToggle />

            {isLoggedIn ? (
              <div className="relative hidden lg:block" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  className="flex h-10 items-center gap-2 rounded-xl border border-transparent px-2.5 text-sm font-semibold transition-all duration-200 hover:border-[var(--nova-border)] hover:bg-[var(--nova-surface-soft)]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--nova-primary)] text-xs font-bold text-white">
                    {initial}
                  </span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-1.5 shadow-[var(--shadow-md)]"
                  >
                    <p className="truncate px-3 py-2 text-xs text-[var(--nova-muted)]">
                      {auth?.user?.email}
                    </p>

                    {accountLinks.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--nova-text)] hover:bg-[var(--nova-lavender-soft)] hover:text-[var(--nova-primary)]"
                      >
                        <Icon size={16} />
                        {label}
                      </Link>
                    ))}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl border-t border-[var(--nova-border)] px-3 py-2.5 text-sm font-medium text-[var(--nova-danger)] hover:bg-[var(--nova-surface-soft)]"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="ml-1 hidden rounded-xl bg-[var(--nova-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--nova-primary-hover)] lg:block"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
        isLoggedIn={isLoggedIn}
        user={auth?.user}
        cartCount={cartCount}
        onLogout={handleLogout}
      />
    </>
  )
}

export default StoreHeader
