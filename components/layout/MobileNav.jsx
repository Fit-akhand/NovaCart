import Link from 'next/link'
import { LogOut, Package, ShoppingCart, User, X, Search, Plus, Users } from 'lucide-react'

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
    'group flex min-h-11 items-center rounded-xl px-3.5 py-3 text-sm font-semibold text-[var(--nova-text)] transition-all duration-200 hover:bg-[var(--nova-lavender-soft)] hover:text-[var(--nova-primary)] active:scale-[0.99]'

  return (
    <div className="fixed inset-0 z-[1100] lg:hidden">

      {/* =====================================================
          BACKDROP
      ===================================================== */}

      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className="
          absolute
          inset-0
          cursor-default
          bg-slate-950/45
          backdrop-blur-[2px]
        "
      />


      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}

      <aside
        className="
          absolute
          left-0
          top-0

          flex
          h-full

          w-[min(86vw,380px)]

          flex-col

          border-r
          border-[var(--nova-border)]

          bg-[var(--nova-surface)]

          text-[var(--nova-text)]

          shadow-[12px_0_40px_rgba(15,23,42,0.16)]
        "
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            h-[64px]
            shrink-0
            items-center
            justify-between

            border-b
            border-[var(--nova-border)]

            px-4
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[var(--nova-primary)]
              "
            >
              NovaCart
            </p>

            <p
              className="
                mt-0.5
                text-sm
                font-bold
                text-[var(--nova-text)]
              "
            >
              Menu
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center

              rounded-xl

              border
              border-[var(--nova-border)]

              bg-[var(--nova-surface-soft)]

              text-[var(--nova-muted)]

              transition-all
              duration-200

              hover:border-[var(--nova-violet-light)]
              hover:bg-[var(--nova-lavender-soft)]
              hover:text-[var(--nova-primary)]

              active:scale-95
            "
          >
            <X size={19} strokeWidth={2} />
          </button>
        </div>


        {/* =================================================
            SCROLLABLE CONTENT
        ================================================= */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto

            px-3
            py-4
          "
        >

          {/* =================================================
              SEARCH
          ================================================= */}

          <form
            onSubmit={(event) => {
              onSearch(event)
              onClose()
            }}
            className="mb-5"
          >
            <label
              htmlFor="mobile-search"
              className="sr-only"
            >
              Search products
            </label>

            <div className="relative">

              <Search
                size={17}
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
                id="mobile-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products..."
                className="
                  h-12
                  w-full

                  rounded-2xl

                  border
                  border-[var(--nova-border)]

                  bg-[var(--nova-surface-soft)]

                  pl-10
                  pr-4

                  text-sm
                  text-[var(--nova-text)]

                  outline-none

                  placeholder:text-[var(--nova-muted)]

                  transition-all
                  duration-200

                  focus:border-[var(--nova-primary)]
                  focus:bg-[var(--nova-surface)]
                  focus:ring-4
                  focus:ring-[color-mix(in_srgb,var(--nova-primary)_10%,transparent)]
                "
              />

            </div>
          </form>


          {/* =================================================
              MAIN NAVIGATION
          ================================================= */}

          <nav>

            <p
              className="
                mb-2
                px-3
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-[var(--nova-muted)]
              "
            >
              Shop
            </p>

            <div className="space-y-1">

              <Link
                href="/"
                onClick={onClose}
                className={linkClass}
              >
                <span>Home</span>
              </Link>

              <Link
                href="/products"
                onClick={onClose}
                className={linkClass}
              >
                <span>Products</span>
              </Link>

              <Link
                href="/categories"
                onClick={onClose}
                className={linkClass}
              >
                <span>Categories</span>
              </Link>

              <Link
                href="/products?sort=-sold"
                onClick={onClose}
                className={linkClass}
              >
                <span>Deals</span>
              </Link>

            </div>


            {/* =================================================
                ADMIN
            ================================================= */}

            {isAdmin && (
              <div className="mt-5">

                <div
                  className="
                    mb-2
                    border-t
                    border-[var(--nova-border)]
                  "
                />

                <p
                  className="
                    mb-2
                    px-3
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-[var(--nova-muted)]
                  "
                >
                  Administration
                </p>

                <div className="space-y-1">

                  <Link
                    href="/create"
                    onClick={onClose}
                    className={linkClass}
                  >
                    <span
                      className="
                        mr-3
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[var(--nova-lavender-soft)]
                        text-[var(--nova-primary)]
                      "
                    >
                      <Plus size={16} />
                    </span>

                    Create
                  </Link>

                  <Link
                    href="/users"
                    onClick={onClose}
                    className={linkClass}
                  >
                    <span
                      className="
                        mr-3
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[var(--nova-lavender-soft)]
                        text-[var(--nova-primary)]
                      "
                    >
                      <Users size={16} />
                    </span>

                    Users
                  </Link>

                </div>

              </div>
            )}


            {/* =================================================
                ACCOUNT
            ================================================= */}

            <div className="mt-5">

              <div
                className="
                  mb-2
                  border-t
                  border-[var(--nova-border)]
                "
              />

              <p
                className="
                  mb-2
                  px-3
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-[var(--nova-muted)]
                "
              >
                Account
              </p>


              {/* CART */}

              <Link
                href="/cart"
                onClick={onClose}
                className="
                  flex
                  min-h-11
                  items-center
                  justify-between

                  rounded-xl

                  px-3.5
                  py-3

                  text-sm
                  font-semibold
                  text-[var(--nova-text)]

                  transition-all
                  duration-200

                  hover:bg-[var(--nova-lavender-soft)]
                  hover:text-[var(--nova-primary)]

                  active:scale-[0.99]
                "
              >
                <span className="inline-flex items-center gap-3">

                  <span
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-[var(--nova-lavender-soft)]
                      text-[var(--nova-primary)]
                    "
                  >
                    <ShoppingCart size={16} />
                  </span>

                  Cart

                </span>

                {cartCount > 0 && (
                  <span
                    className="
                      inline-flex
                      min-w-6
                      items-center
                      justify-center

                      rounded-full

                      bg-[var(--nova-primary)]

                      px-2
                      py-1

                      text-[10px]
                      font-bold
                      leading-none
                      text-white

                      shadow-[0_4px_12px_rgba(124,58,237,0.2)]
                    "
                  >
                    {cartCount}
                  </span>
                )}
              </Link>


              {/* PROFILE */}

              {isLoggedIn && (
                <>
                  <Link
                    href="/profile"
                    onClick={onClose}
                    className={linkClass}
                  >
                    <span
                      className="
                        mr-3
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[var(--nova-surface-soft)]
                        text-[var(--nova-muted)]
                      "
                    >
                      <User size={16} />
                    </span>

                    Profile
                  </Link>


                  {/* ORDERS */}

                  <Link
                    href="/profile#orders"
                    onClick={onClose}
                    className={linkClass}
                  >
                    <span
                      className="
                        mr-3
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[var(--nova-surface-soft)]
                        text-[var(--nova-muted)]
                      "
                    >
                      <Package size={16} />
                    </span>

                    Orders
                  </Link>
                </>
              )}

            </div>

          </nav>

        </div>


        {/* =================================================
            BOTTOM ACTION
        ================================================= */}

        <div
          className="
            shrink-0

            border-t
            border-[var(--nova-border)]

            bg-[var(--nova-surface)]

            p-3
          "
        >

          {isLoggedIn ? (

            <button
              type="button"
              onClick={onLogout}
              className="
                flex
                min-h-12
                w-full
                items-center
                justify-center
                gap-2

                rounded-xl

                border
                border-[var(--nova-border)]

                bg-[var(--nova-surface-soft)]

                px-4
                py-3

                text-sm
                font-semibold

                text-[var(--nova-text)]

                transition-all
                duration-200

                hover:border-[var(--nova-danger)]
                hover:bg-[color-mix(in_srgb,var(--nova-danger)_7%,transparent)]
                hover:text-[var(--nova-danger)]

                active:scale-[0.99]
              "
            >
              <LogOut size={17} />
              Sign out
            </button>

          ) : (

            <Link
              href="/signin"
              onClick={onClose}
              className="
                flex
                min-h-12
                w-full
                items-center
                justify-center

                rounded-xl

                bg-[var(--nova-primary)]

                px-4
                py-3

                text-sm
                font-bold
                text-white

                shadow-[0_8px_22px_rgba(124,58,237,0.18)]

                transition-all
                duration-200

                hover:bg-[var(--nova-primary-hover)]
                hover:shadow-[0_10px_28px_rgba(124,58,237,0.25)]

                active:scale-[0.99]
              "
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