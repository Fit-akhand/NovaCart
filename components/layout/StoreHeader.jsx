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

const navLinkClass = `
  rounded-xl
  px-3 py-2
  text-sm font-medium
  text-[var(--nova-text)]
  transition-all duration-200
  hover:bg-[var(--nova-lavender-soft)]
  hover:text-[var(--nova-primary)]
  active:scale-[0.98]
`

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

  return (
    <>
      {/* =========================================
          HEADER
      ========================================= */}

      <header
        className="
          sticky top-0 z-[1000] w-full
          border-b border-[var(--nova-border)]
          bg-[color-mix(in_srgb,var(--nova-surface)_88%,transparent)]
          text-[var(--nova-text)]
          backdrop-blur-xl
          transition-colors duration-200
        "
        style={{
          height: 'var(--navbar-height)',
        }}
      >
        <div
          className="
            mx-auto flex h-full w-full max-w-[1440px]
            items-center gap-2
            px-3
            sm:px-5
            lg:gap-4
            lg:px-8
          "
        >

          {/* =====================================
              MOBILE MENU
          ===================================== */}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              border border-transparent
              text-[var(--nova-text)]
              transition-all duration-200
              hover:border-[var(--nova-border)]
              hover:bg-[var(--nova-surface-soft)]
              hover:text-[var(--nova-primary)]
              active:scale-95
              lg:hidden
            "
          >
            <Menu size={21} strokeWidth={2} />
          </button>

          {/* =====================================
              LOGO
          ===================================== */}

          <div className="shrink-0">
            <BrandLogo />
          </div>

          {/* =====================================
              DESKTOP NAVIGATION
          ===================================== */}

          <nav
            className="
              hidden
              items-center
              gap-1
              lg:flex
            "
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

            <Link
              href="/deals"
              className={navLinkClass}
            >
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
            ================================= */}

            {isSeller && (
              <>
                <span
                  className="
                    mx-1
                    h-5 w-px
                    bg-[var(--nova-border)]
                  "
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
            className="
              ml-auto
              hidden
              min-w-0
              max-w-xl
              flex-1
              md:flex
            "
          >
            <div className="relative w-full">

              <Search
                size={18}
                strokeWidth={2}
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-[var(--nova-muted)]
                "
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products, brands and more..."
                aria-label="Search products"
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-[var(--nova-border)]
                  bg-[var(--nova-surface-soft)]
                  pl-10
                  pr-4
                  text-sm
                  text-[var(--nova-text)]
                  outline-none

                  placeholder:text-[var(--nova-muted)]

                  transition-all duration-200

                  hover:border-[var(--nova-violet-light)]

                  focus:border-[var(--nova-primary)]
                  focus:bg-[var(--nova-surface)]
                  focus:ring-2
                  focus:ring-[rgba(139,92,246,0.12)]
                   shadow-[var(--shadow-sm)]
                "
              />

            </div>
          </form>

          {/* =====================================
              RIGHT SIDE
          ===================================== */}

          <div
            className="
              ml-auto
              flex
              shrink-0
              items-center
              gap-1
              md:ml-2
            "
          >

            {/* CART */}

            <Link
              href="/cart"
              aria-label={`Cart${
                cartCount
                  ? `, ${cartCount} items`
                  : ''
              }`}
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-transparent
                text-[var(--nova-text)]
                transition-all duration-200

                hover:border-[var(--nova-border)]
                hover:bg-[var(--nova-surface-soft)]
                hover:text-[var(--nova-primary)]

                active:scale-95
              "
            >
              <ShoppingCart
                size={19}
                strokeWidth={2}
              />

              {cartCount > 0 && (
                <span
                  className="
                    absolute
                    right-0.5
                    top-0.5

                    flex
                    h-[17px]
                    min-w-[17px]
                    items-center
                    justify-center

                    rounded-full

                    bg-[var(--nova-primary)]
                    px-1

                    text-[9px]
                    font-bold
                    leading-none
                    text-white

                    shadow-[0_4px_12px_rgba(124,58,237,0.32)]
                  "
                >
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
                className="
                  relative
                  hidden
                  lg:block
                "
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
                  className="
                    flex
                    h-10
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-transparent
                    px-2.5

                    text-sm
                    font-semibold

                    transition-all duration-200

                    hover:border-[var(--nova-border)]
                    hover:bg-[var(--nova-surface-soft)]
                    hover:text-[var(--nova-primary)]

                    active:scale-[0.98]
                    hover:shadow-[0_6px_18px_rgba(124,58,237,0.08)]
                  "
                >

                  {/* AVATAR */}

                  <span
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-full

                      border
                      border-[var(--nova-violet-light)]

                      bg-[var(--nova-lavender)]

                      text-[var(--nova-primary)]

                      shadow-[0_4px_14px_rgba(124,58,237,0.12)]
                    "
                  >
                    {auth?.user?.avatar ? (
                      <img
                        src={auth.user.avatar}
                        alt=""
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />
                    ) : (
                      <User
                        size={15}
                        strokeWidth={2}
                      />
                    )}
                  </span>

                  {/* NAME */}

                  <span className="max-w-[110px] truncate">
                    {isAdmin
                      ? 'Admin'
                      : auth?.user?.name ||
                        'Profile'}
                  </span>

                  <ChevronDown
                    size={14}
                    className={`
                      transition-transform duration-200
                      ${
                        profileOpen
                          ? 'rotate-180 text-[var(--nova-primary)]'
                          : ''
                      }
                    `}
                  />

                </button>

                {/* =================================
                    PROFILE DROPDOWN
                ================================= */}

                {profileOpen && (
                  <div
                    role="menu"
                    className="
                      absolute
                      right-0
                      mt-2
                      w-60
                      overflow-hidden

                      rounded-2xl
                      border
                      border-[var(--nova-border)]

                      bg-[var(--nova-surface)]

                      py-1.5

                      shadow-[0_18px_45px_rgba(15,23,42,0.14)]

                      ring-1
                      ring-[rgba(139,92,246,0.05)]
                    "
                  >

                    {/* SELLER LINKS */}

                    {isSeller && (
                      <>
                        {/* SELLER DASHBOARD */}

                        <Link
                          href="/seller"
                          role="menuitem"
                          onClick={() =>
                            setProfileOpen(false)
                          }
                          className="
                            flex
                            items-center
                            gap-3
                            px-4
                            py-2.5

                            text-sm

                            text-[var(--nova-text)]

                            transition-colors duration-150

                            hover:bg-[var(--nova-surface-soft)]
                            hover:text-[var(--nova-primary)]
                          "
                        >
                          <LayoutDashboard
                            size={16}
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
                          className="
                            flex
                            items-center
                            gap-3
                            px-4
                            py-2.5

                            text-sm

                            text-[var(--nova-text)]

                            transition-colors duration-150

                            hover:bg-[var(--nova-surface-soft)]
                            hover:text-[var(--nova-primary)]
                          "
                        >
                          <Package size={16} />

                          My Products
                        </Link>

                        {/* MY ORDERS */}

                        <Link
                          href="/seller/orders"
                          role="menuitem"
                          onClick={() =>
                            setProfileOpen(false)
                          }
                          className="
                            flex
                            items-center
                            gap-3
                            px-4
                            py-2.5

                            text-sm

                            text-[var(--nova-text)]

                            transition-colors duration-150

                            hover:bg-[var(--nova-surface-soft)]
                            hover:text-[var(--nova-primary)]
                          "
                        >
                          <ShoppingBag
                            size={16}
                          />

                          My Orders
                        </Link>

                        <div
                          className="
                            my-1.5
                            border-t
                            border-[var(--nova-border)]
                          "
                        />
                      </>
                    )}

                    {/* PROFILE */}

                    <Link
                      href="/profile"
                      role="menuitem"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="
                        flex
                        items-center
                        gap-3
                        px-4
                        py-2.5

                        text-sm

                        text-[var(--nova-text)]

                        transition-colors duration-150

                        hover:bg-[var(--nova-surface-soft)]
                        hover:text-[var(--nova-primary)]
                      "
                    >
                      <User size={16} />

                      Profile
                    </Link>

                    {/* CUSTOMER ORDERS */}

                    {!isSeller && (
                      <Link
                        href="/profile#orders"
                        role="menuitem"
                        onClick={() =>
                          setProfileOpen(false)
                        }
                        className="
                          flex
                          items-center
                          gap-3
                          px-4
                          py-2.5

                          text-sm

                          text-[var(--nova-text)]

                          transition-colors duration-150

                          hover:bg-[var(--nova-surface-soft)]
                          hover:text-[var(--nova-primary)]
                        "
                      >
                        <Package size={16} />

                        Orders
                      </Link>
                    )}

                    {/* LOGOUT */}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        px-4
                        py-2.5

                        text-left
                        text-sm
                        font-medium

                        text-[var(--nova-danger)]

                        transition-colors duration-150

                        hover:bg-[var(--nova-surface-soft)]
                      "
                    >
                      <LogOut size={16} />

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
                className="
                  hidden
                  rounded-xl

                  border
                  border-[var(--nova-primary)]

                  bg-[var(--nova-primary)]

                  px-4
                  py-2.5

                  text-sm
                  font-semibold
                  text-white

                  shadow-[0_6px_18px_rgba(124,58,237,0.16)]

                  transition-all duration-200

                  hover:bg-[var(--nova-primary-dark)]
                  hover:shadow-[0_8px_24px_rgba(124,58,237,0.24)]

                  active:scale-[0.98]

                  lg:block
                "
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