import Link from 'next/link'
import BrandLogo from '../common/BrandLogo'
import Container from '../common/Container'

const StoreFooter = () => {
  const year = new Date().getFullYear()
  const heading = 'mb-3 text-sm font-semibold text-[var(--nova-text)]'
  const item = 'block py-1 text-sm text-[var(--nova-muted)] transition hover:text-[var(--nova-blue)]'

  return (
    <footer className="mt-auto border-t border-[var(--nova-border)] bg-[var(--nova-surface)] text-[var(--nova-text)]">
      <Container className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <BrandLogo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--nova-muted)]">
            NovaCart is an online store for everyday products, secure checkout, and order tracking.
          </p>
        </div>

        <div>
          <p className={heading}>Shop</p>
          <Link href="/products" className={item}>Products</Link>
          <Link href="/categories" className={item}>Categories</Link>
          <Link href="/products?sort=-sold" className={item}>Best sellers</Link>
        </div>

        <div>
          <p className={heading}>Account</p>
          <Link href="/signin" className={item}>Sign in</Link>
          <Link href="/register" className={item}>Create account</Link>
          <Link href="/profile" className={item}>Profile</Link>
          <Link href="/cart" className={item}>Cart</Link>
        </div>

        <div>
          <p className={heading}>Support</p>
          <Link href="/profile#orders" className={item}>Order status</Link>
          <p className="py-1 text-sm text-[var(--nova-muted)]">Secure checkout</p>
        </div>
      </Container>

      <div className="border-t border-[var(--nova-border)]">
        <Container className="flex flex-col gap-2 py-5 text-xs text-[var(--nova-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} NovaCart. All rights reserved.</p>
          <p>Shop smarter. Live better.</p>
        </Container>
      </div>
    </footer>
  )
}

export default StoreFooter
