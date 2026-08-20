import {
  ChevronDown,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  User,
  LayoutDashboard,
  ShoppingBag,
} from 'lucide-react'
import Link from 'next/link'
import { useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

import { DataContext } from '../../store/GlobalState'
import { postData } from '@/lib/api-client'

import BrandLogo from '../common/BrandLogo'
import ThemeToggle from '../common/ThemeToggle'
import MobileNav from './MobileNav'

const navLinkClass =
  'rounded-lg px-3 py-2 text-sm font-medium text-[var(--nova-text)] transition hover:bg-[var(--nova-surface-soft)] hover:text-[var(--nova-blue)]'

const StoreHeader = () => {
  const { state, dispatch } = useContext(DataContext)
  const { auth, cart } = state
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const profileRef = useRef(null)

  const isLoggedIn = Boolean(auth?.token)

  const isAdmin = auth?.user?.role === 'admin'
  const isSeller = auth?.user?.role === 'seller'

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
      await postData(
        'auth/logout',
        null,
        auth?.token
      )

      localStorage.removeItem('firstLogin')

      dispatch({ type: 'AUTH', payload: {} })
      dispatch({ type: 'ADD_ORDERS', payload: [] })
      dispatch({ type: 'ADD_USERS', payload: [] })
      dispatch({ type: 'ADD_CART', payload: [] })

      setMenuOpen(false)
      setProfileOpen(false)

      window.location.href = '/'
    } catch (error) {
      dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            error.message || 'Logout failed.',
        },
      })
    }
  }

  return (
    <>
      {/* =========================================
          HEADER
      ========================================= */}

      <header
        className="sticky top-0 z-[1000] w-full border-b border-[var(--nova-border)] bg-[var(--nova-surface)] text-[var(--nova-text)]"
        style={{
          height: 'var(--navbar-height)',
        }}
      >
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-center gap-2 px-4 sm:px-6 lg:gap-4 lg:px-8">

          {/* =====================================
              MOBILE MENU
          ===================================== */}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--nova-surface-soft)] lg:hidden"
          >
            <Menu size={21} />
          </button>

          {/* =====================================
              LOGO
          ===================================== */}

          <BrandLogo />

          {/* =====================================
              DESKTOP NAVIGATION
          ===================================== */}

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Primary"
          >

            {/* HOME */}

            <Link
              href="/"
              className={navLinkClass}
            >
              Home
            </Link>

            {/* PRODUCTS */}

            <Link
              href="/products"
              className={navLinkClass}
            >
              Products
            </Link>

            {/* CATEGORIES */}

            <Link
              href="/categories"
              className={navLinkClass}
            >
              Categories
            </Link>

            {/* DEALS */}

            <Link href="/deals">
                Deals
            </Link>

            {/* =================================
                LOGGED-IN USER
            ================================= */}

            {isLoggedIn && (
              <>
                {/* CREATE PRODUCT */}

                <Link
                  href="/create"
                  className={navLinkClass}
                >
                  Create
                </Link>

                {/* ADMIN */}

                {isAdmin && (
                  <Link
                    href="/users"
                    className={navLinkClass}
                  >
                    Users
                  </Link>
                )}
              </>
            )}

            {/* =================================
                SELLER NAVIGATION

                IMPORTANT:
                Only ONE seller navigation block.
            ================================= */}

            {isSeller && (
              <>
                <span
                  className="mx-1 h-5 w-px bg-[var(--nova-border)]"
                  aria-hidden="true"
                />

                {/* SELLER DASHBOARD */}

                <Link
                  href="/seller"
                  className={navLinkClass}
                >
                  Seller Dashboard
                </Link>

                {/* MY PRODUCTS */}

                <Link
                  href="/seller/products"
                  className={navLinkClass}
                >
                  My Products
                </Link>

                {/* MY ORDERS */}

                <Link
                  href="/seller/orders"
                  className={navLinkClass}
                >
                  My Orders
                </Link>
              </>
            )}

          </nav>

          {/* =====================================
              SEARCH
          ===================================== */}

          <form
            onSubmit={handleSearch}
            className="ml-auto hidden min-w-0 max-w-md flex-1 md:flex"
          >
            <div className="relative w-full">

              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products..."
                aria-label="Search products"
                className="h-10 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] pl-10 pr-4 text-sm text-[var(--nova-text)] outline-none placeholder:text-[var(--nova-muted)] focus:border-[var(--nova-blue)] focus:bg-[var(--nova-surface)]"
              />

            </div>
          </form>

          {/* =====================================
              RIGHT SIDE
          ===================================== */}

          <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-2">

            {/* CART */}

            <Link
              href="/cart"
              aria-label={`Cart${
                cartCount
                  ? `, ${cartCount} items`
                  : ''
              }`}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[var(--nova-surface-soft)] hover:text-[var(--nova-blue)]"
            >
              <ShoppingCart size={19} />

              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--nova-blue)] px-1 text-[10px] font-bold text-white">
                  {cartCount > 99
                    ? '99+'
                    : cartCount}
                </span>
              )}
            </Link>

            {/* THEME */}

            <ThemeToggle />

            {/* =================================
                PROFILE
            ================================= */}

            {isLoggedIn ? (
              <div
                className="relative hidden lg:block"
                ref={profileRef}
              >

                {/* PROFILE BUTTON */}

                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen(
                      (open) => !open
                    )
                  }
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-[var(--nova-surface-soft)]"
                >

                  {/* AVATAR */}

                  <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[var(--nova-blue)] text-white">

                    {auth?.user?.avatar ? (
                      <img
                        src={auth.user.avatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={15} />
                    )}

                  </span>

                  {/* NAME */}

                  <span className="max-w-[110px] truncate">
                    {isAdmin
                      ? 'Admin'
                      : auth?.user?.name ||
                        'Profile'}
                  </span>

                  <ChevronDown size={14} />

                </button>

                {/* =================================
                    PROFILE DROPDOWN
                ================================= */}

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] py-1 shadow-[var(--shadow-md)]"
                  >

                    {/* =================================
                        SELLER LINKS
                    ================================= */}

                    {isSeller && (
                      <>
                        {/* SELLER DASHBOARD */}

                        <Link
                          href="/seller"
                          role="menuitem"
                          onClick={() =>
                            setProfileOpen(false)
                          }
                          className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--nova-surface-soft)]"
                        >
                          <LayoutDashboard
                            size={15}
                          />

                          Seller Dashboard
                        </Link>

                        {/* MY PRODUCTS */}

                        <Link
                          href="/seller/products"
                          role="menuitem"
                          onClick={() =>
                            setProfileOpen(false)
                          }
                          className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--nova-surface-soft)]"
                        >
                          <Package size={15} />

                          My Products
                        </Link>

                        {/* MY ORDERS */}

                        <Link
                          href="/seller/orders"
                          role="menuitem"
                          onClick={() =>
                            setProfileOpen(false)
                          }
                          className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--nova-surface-soft)]"
                        >
                          <ShoppingBag
                            size={15}
                          />

                          My Orders
                        </Link>

                        <div className="my-1 border-t border-[var(--nova-border)]" />
                      </>
                    )}

                    {/* =================================
                        PROFILE
                    ================================= */}

                    <Link
                      href="/profile"
                      role="menuitem"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--nova-surface-soft)]"
                    >
                      <User size={15} />

                      Profile
                    </Link>

                    {/* =================================
                        CUSTOMER ORDERS
                    ================================= */}

                    {!isSeller && (
                      <Link
                        href="/profile#orders"
                        role="menuitem"
                        onClick={() =>
                          setProfileOpen(false)
                        }
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--nova-surface-soft)]"
                      >
                        <Package size={15} />

                        Orders
                      </Link>
                    )}

                    {/* =================================
                        LOGOUT
                    ================================= */}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--nova-danger)] hover:bg-[var(--nova-surface-soft)]"
                    >
                      <LogOut size={15} />

                      Sign out
                    </button>

                  </div>
                )}

              </div>
            ) : (

              /* =================================
                 SIGN IN
              ================================= */

              <Link
                href="/signin"
                className="hidden rounded-lg bg-[var(--nova-blue)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 lg:block"
              >
                Sign in
              </Link>

            )}

          </div>

        </div>
      </header>

      {/* =========================================
          MOBILE NAVIGATION
      ========================================= */}

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        cartCount={cartCount}
        onLogout={handleLogout}
      />
    </>
  )
}

export default StoreHeader