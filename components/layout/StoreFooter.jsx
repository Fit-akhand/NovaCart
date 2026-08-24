import Link from 'next/link'
import BrandLogo from '../common/BrandLogo'
import Container from '../common/Container'

const StoreFooter = () => {
  const year = new Date().getFullYear()

  const heading = `
    mb-4
    text-sm
    font-semibold
    tracking-wide
    text-[var(--nova-text)]
  `

  const item = `
    block
    py-1.5
    text-sm
    text-[var(--nova-muted)]
    transition-all
    duration-200
    hover:translate-x-0.5
    hover:text-[var(--nova-primary)]
  `

  return (
    <footer
      className="
        mt-auto
        border-t
        border-[var(--nova-border)]
        bg-[var(--nova-surface)]
        text-[var(--nova-text)]
      "
    >
      {/* =========================================
          MAIN FOOTER
      ========================================= */}

      <Container
        className="
          grid
          grid-cols-2
          gap-x-8
          gap-y-10
          py-12

          sm:grid-cols-3

          lg:grid-cols-5
          lg:gap-10
          lg:py-16
        "
      >

        {/* =====================================
            BRAND
        ===================================== */}

        <div
          className="
            col-span-2
            sm:col-span-3
            lg:col-span-2
          "
        >
          <BrandLogo />

          <p
            className="
              mt-4
              max-w-sm
              text-sm
              leading-6
              text-[var(--nova-muted)]
            "
          >
            NovaCart is an online store for everyday
            products, secure checkout, and order
            tracking.
          </p>

          {/* Small brand accent */}

          <div
            className="
              mt-6
              h-1
              w-12
              rounded-full
              bg-[var(--nova-primary)]
            "
          />
        </div>

        {/* =====================================
            SHOP
        ===================================== */}

        <div>
          <p className={heading}>
            Shop
          </p>

          <Link
            href="/products"
            className={item}
          >
            Products
          </Link>

          <Link
            href="/categories"
            className={item}
          >
            Categories
          </Link>

          <Link
            href="/products?sort=-sold"
            className={item}
          >
            Best sellers
          </Link>
        </div>

        {/* =====================================
            ACCOUNT
        ===================================== */}

        <div>
          <p className={heading}>
            Account
          </p>

          <Link
            href="/signin"
            className={item}
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className={item}
          >
            Create account
          </Link>

          <Link
            href="/profile"
            className={item}
          >
            Profile
          </Link>

          <Link
            href="/cart"
            className={item}
          >
            Cart
          </Link>
        </div>

        {/* =====================================
            SUPPORT
        ===================================== */}

        <div>
          <p className={heading}>
            Support
          </p>

          <Link
            href="/profile#orders"
            className={item}
          >
            Order status
          </Link>

          <p
            className="
              py-1.5
              text-sm
              text-[var(--nova-muted)]
            "
          >
            Secure checkout
          </p>
        </div>

      </Container>

      {/* =========================================
          BOTTOM BAR
      ========================================= */}

      <div
        className="
          border-t
          border-[var(--nova-border)]
          bg-[var(--nova-surface-soft)]
        "
      >
        <Container
          className="
            flex
            flex-col
            gap-2
            py-5

            text-xs
            text-[var(--nova-muted)]

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>
            © {year} NovaCart. All rights reserved.
          </p>

          <p
            className="
              font-medium
              text-[var(--nova-violet-light)]
            "
          >
            Shop smarter. Live better.
          </p>
        </Container>
      </div>
    </footer>
  )
}

export default StoreFooter