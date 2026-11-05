import Link from 'next/link'
import { useContext } from 'react'

import { DataContext } from '../../store/GlobalState'
import BrandLogo from '../common/BrandLogo'
import Container from '../common/Container'

const heading = 'mb-3 text-sm font-bold text-[var(--nova-text)]'
const item =
  'block py-1.5 text-sm text-[var(--nova-muted)] transition-colors hover:text-[var(--nova-primary)]'

const StoreFooter = () => {
  const { state } = useContext(DataContext)
  const isLoggedIn = Boolean(state?.auth?.token)

  return (
    <footer className="mt-auto border-t border-[var(--nova-border)] bg-[var(--nova-surface)]">
      <Container className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-3 lg:grid-cols-4">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <BrandLogo />
          <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--nova-muted)]">
            NovaCart is an online store for everyday products, secure checkout
            and order tracking.
          </p>
        </div>

        <nav aria-label="Shop">
          <p className={heading}>Shop</p>
          <Link href="/products" className={item}>
            All products
          </Link>
          <Link href="/products?sort=-sold" className={item}>
            Best sellers
          </Link>
          <Link href="/deals" className={item}>
            Deals
          </Link>
        </nav>

        <nav aria-label="Account">
          <p className={heading}>Account</p>
          {isLoggedIn ? (
            <>
              <Link href="/profile" className={item}>
                Profile
              </Link>
              <Link href="/profile#orders" className={item}>
                Order status
              </Link>
            </>
          ) : (
            <>
              <Link href="/signin" className={item}>
                Sign in
              </Link>
              <Link href="/register" className={item}>
                Create account
              </Link>
            </>
          )}
          <Link href="/cart" className={item}>
            Cart
          </Link>
        </nav>
      </Container>

      <div className="border-t border-[var(--nova-border)] bg-[var(--nova-surface-soft)]">
        <Container className="py-5 text-xs text-[var(--nova-muted)]">
          © {new Date().getFullYear()} NovaCart. All rights reserved.
        </Container>
      </div>
    </footer>
  )
}

export default StoreFooter
