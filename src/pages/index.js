import Head from 'next/head'
import Link from 'next/link'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '../../store/GlobalState'
import { useRouter } from 'next/router'
import { fetchCatalogProps } from '../../utils/fetchCatalogProps'
import ProductGrid from '../../components/product/ProductGrid'
import ProductFilters from '../../components/product/ProductFilters'
import EmptyState from '../../components/common/EmptyState'
import Container from '../../components/common/Container'
import Button from '../../components/common/Button'
import {
  Check,
  Lock,
  Package,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react'

const Home = (props) => {
  const [products, setProducts] = useState(props.products || [])
  const [isCheck, setIsCheck] = useState(false)
  const router = useRouter()
  const { state, dispatch } = useContext(DataContext)
  const { auth, categories } = state

  useEffect(() => {
    setProducts(props.products || [])
  }, [props.products])


  const handleCheck = (id) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === id ? { ...product, checked: !product.checked } : product
      )
    )
  }

  const handleCheckALL = () => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => ({ ...product, checked: !isCheck }))
    )
    setIsCheck(!isCheck)
  }

  const handleDeleteAll = () => {
    const deleteArr = []
    products.forEach((product) => {
      if (product.checked) {
        deleteArr.push({
          data: '',
          id: product._id,
          title: 'Delete all selected products?',
          type: 'DELETE_PRODUCT',
        })
      }
    })

    if (deleteArr.length === 0) {
      return dispatch({
        type: 'NOTIFY',
        payload: { error: 'Please select at least one product.' },
      })
    }

    dispatch({ type: 'ADD_MODAL', payload: deleteArr })
  }

  const selectedCount = products.filter((product) => product.checked).length
  const bestSellers = products.filter((product) => Number(product.sold) > 0).slice(0, 4)

  return (
    <>
      <Head>
        <title>NovaCart — Shop smarter. Live better.</title>
        <meta
          name="description"
          content="Discover products selected for everyday life on NovaCart."
        />
      </Head>

      <main>
        <section className="border-b border-[var(--nova-border)] bg-[var(--nova-surface)]">
          <Container className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nova-muted)]">
                NovaCart
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-[var(--nova-text)] sm:text-5xl lg:text-6xl">
                Shop smarter.
                <br />
                Live better.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[var(--nova-muted)]">
                Discover products selected for everyday life. Browse the catalog, track orders, and check out securely.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--nova-blue)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  Shop now
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-5 py-3 text-sm font-semibold hover:bg-[var(--nova-surface-soft)]"
                >
                  Explore categories
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] p-8">
              <p className="text-sm font-semibold">{props.result || 0} products in catalog</p>
              <p className="mt-2 text-sm text-[var(--nova-muted)]">
                Search, filter by category, and sort by price or popularity.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] p-4">
                  <ShieldCheck size={18} className="mb-2 text-[var(--nova-blue)]" />
                  Secure checkout
                </div>
                <div className="rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] p-4">
                  <Package size={18} className="mb-2 text-[var(--nova-blue)]" />
                  Order tracking
                </div>
              </div>
            </div>
          </Container>
        </section>

        {categories?.length > 0 && (
          <section className="py-12">
            <Container>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nova-muted)]">Browse</p>
                  <h2 className="mt-1 text-2xl font-semibold">Featured categories</h2>
                </div>
                <Link href="/categories" className="text-sm font-semibold text-[var(--nova-blue)]">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category._id}
                    href={`/products?category=${category._id}`}
                    className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 transition hover:border-[var(--nova-blue)]"
                  >
                    <p className="font-semibold capitalize">{category.name}</p>
                    <p className="mt-1 text-xs text-[var(--nova-muted)]">Shop this category</p>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        )}

        <section id="browse-products" className="pb-8">
          <Container>
            <div className="mb-5 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-4 sm:p-5">
              <ProductFilters state={state} />
            </div>

            {auth.user && auth.user.role === 'admin' && (
              <div className="mb-5 flex flex-col gap-4 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Product management</p>
                  <p className="text-xs text-[var(--nova-muted)]">
                    {selectedCount > 0
                      ? `${selectedCount} product${selectedCount === 1 ? '' : 's'} selected`
                      : 'Select products to perform bulk actions'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--nova-border)] px-3 py-2 text-xs font-medium">
                    <input type="checkbox" checked={isCheck} onChange={handleCheckALL} />
                    Select all
                  </label>
                  <button
                    type="button"
                    onClick={handleDeleteAll}
                    disabled={selectedCount === 0}
                    className="flex min-h-11 items-center gap-2 rounded-lg bg-[var(--nova-danger)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                    Delete selected
                  </button>
                </div>
              </div>
            )}

            {products.length === 0 ? (
              <EmptyState
                title="No products found"
                description="Try changing your search or category."
                action={
                  <Button variant="secondary" onClick={() => router.push('/')}>
                    View all products
                  </Button>
                }
              />
            ) : (
              <>
                <div className="mb-5 flex items-end justify-between">
                  <h2 className="text-2xl font-semibold">Featured products</h2>
                  <p className="hidden text-xs text-[var(--nova-muted)] sm:block">
                    Showing {products.length} of {props.result || 0}
                  </p>
                </div>
                <ProductGrid products={products} handleCheck={handleCheck} />
              </>
            )}

            {/*
              Homepage loads the complete catalog.
              Pagination is intentionally disabled here.
              The dedicated /products page handles pagination.
            */}
          </Container>
        </section>

        {bestSellers.length > 0 && (
          <section className="border-t border-[var(--nova-border)] py-12">
            <Container>
              <h2 className="mb-2 text-2xl font-semibold">Best sellers</h2>
              <p className="mb-6 text-sm text-[var(--nova-muted)]">
                Products from the current catalog with recorded sales. Prices are unchanged.
              </p>
              <ProductGrid products={bestSellers} />
            </Container>
          </section>
        )}

        <section className="border-t border-[var(--nova-border)] bg-[var(--nova-surface)] py-12">
          <Container>
            <h2 className="mb-8 text-2xl font-semibold">Why NovaCart</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Lock, title: 'Secure checkout', text: 'Pay with the existing checkout flow.' },
                { icon: Truck, title: 'Order tracking', text: 'Follow payment and delivery status in your account.' },
                { icon: ShoppingBag, title: 'Quality products', text: 'A curated catalog you can search and filter.' },
                { icon: Check, title: 'Account management', text: 'Save profile details and review past orders.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-[var(--nova-border)] p-5">
                  <item.icon size={20} className="mb-3 text-[var(--nova-blue)]" />
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-[var(--nova-muted)]">{item.text}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </main>
    </>
  )
}

export async function getServerSideProps({ query }) {
  const props = await fetchCatalogProps(query)
  return { props }
}

export default Home