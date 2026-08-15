import Head from 'next/head'
import { useContext, useEffect, useState } from 'react'
import { getData } from '@/lib/api-client'
import { DataContext } from '../../../store/GlobalState'
import { addToCart } from '../../../store/Actions'
import ProductGallery from '../../../components/product/ProductGallery'
import ProductPrice from '../../../components/product/ProductPrice'
import ProductGrid from '../../../components/product/ProductGrid'
import Badge from '../../../components/common/Badge'
import Button from '../../../components/common/Button'
import Container from '../../../components/common/Container'
import { ChevronRight, Package, ShoppingBag } from 'lucide-react'

const DetailProduct = ({ product, related = [] }) => {
  const [quantity, setQuantity] = useState(1)
  const { state, dispatch } = useContext(DataContext)
  const { cart } = state

  useEffect(() => {
    setQuantity(1)
  }, [product?._id])

  if (!product) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p>Product not found</p>
      </main>
    )
  }

  const handleAddToCart = () => {
    if (!product.inStock || product.inStock <= 0) {
      return dispatch({
        type: 'NOTIFY',
        payload: { error: 'This product is currently out of stock.' },
      })
    }

    dispatch(addToCart({ ...product, quantity }, cart))
  }

  const maxQty = Math.max(product.inStock || 1, 1)

  return (
    <>
      <Head>
        <title>{product.title ? `${product.title} | NovaCart` : 'Product | NovaCart'}</title>
        <meta name="description" content={product.description || 'View product details on NovaCart.'} />
      </Head>

      <main className="py-8 sm:py-10">
        <Container>
          <div className="mb-7 flex items-center gap-2 text-xs text-[var(--nova-muted)]">
            <span>NovaCart</span>
            <ChevronRight size={13} />
            <span>Products</span>
            <ChevronRight size={13} />
            <span className="max-w-[220px] truncate text-[var(--nova-text)]">{product.title}</span>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <ProductGallery images={product.images} title={product.title} />

            <div className="flex flex-col">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {product.inStock > 0 ? (
                  <Badge variant="success">In stock</Badge>
                ) : (
                  <Badge variant="danger">Out of stock</Badge>
                )}
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{product.title}</h1>

              <div className="mt-6 border-y border-[var(--nova-border)] py-5">
                <ProductPrice price={product.price} className="text-3xl" />
              </div>

              {product.description && (
                <p className="mt-6 text-sm leading-7 text-[var(--nova-muted)]">{product.description}</p>
              )}

              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-4">
                  <Package size={15} className="mb-2" />
                  <p className="text-[10px] uppercase tracking-wider text-[var(--nova-muted)]">Availability</p>
                  <p className="mt-1 text-sm font-semibold">
                    {product.inStock > 0 ? `${product.inStock} available` : 'Out of stock'}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-4">
                  <ShoppingBag size={15} className="mb-2" />
                  <p className="text-[10px] uppercase tracking-wider text-[var(--nova-muted)]">Sold</p>
                  <p className="mt-1 text-sm font-semibold">{product.sold || 0} units</p>
                </div>
              </div>

              <div className="mt-7">
                <label htmlFor="qty" className="mb-2 block text-sm font-medium">
                  Quantity
                </label>
                <div className="mb-4 flex w-fit items-center rounded-lg border border-[var(--nova-border)]">
                  <button
                    type="button"
                    className="h-11 w-11"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <input
                    id="qty"
                    type="number"
                    min="1"
                    max={maxQty}
                    value={quantity}
                    onChange={(event) => {
                      const next = Number(event.target.value) || 1
                      setQuantity(Math.min(maxQty, Math.max(1, next)))
                    }}
                    className="h-11 w-16 border-x border-[var(--nova-border)] bg-transparent text-center outline-none"
                  />
                  <button
                    type="button"
                    className="h-11 w-11"
                    onClick={() => setQuantity((value) => Math.min(maxQty, value + 1))}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <Button
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                  className="w-full"
                >
                  {product.inStock > 0 ? 'Add to cart' : 'Out of stock'}
                </Button>
              </div>
            </div>
          </div>

          {product.content && (
            <section className="mt-10 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-6 sm:p-8">
              <h2 className="text-lg font-semibold">Product details</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--nova-muted)]">
                {product.content}
              </p>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-5 text-2xl font-semibold">Related products</h2>
              <ProductGrid products={related} />
            </section>
          )}
        </Container>
      </main>
    </>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const res = await getData(`product/${params.id}`)

    if (!res || res.err || !res.product) {
      return { notFound: true }
    }

    let related = []
    if (res.product.category) {
      const relatedRes = await getData(
        `product?limit=8&category=${res.product.category}&sort=-createdAt&title=all`
      )
      related = (relatedRes?.products || [])
        .filter((item) => item._id !== res.product._id)
        .slice(0, 4)
    }

    return {
      props: {
        product: res.product,
        related,
      },
    }
  } catch (error) {
    console.error('Product fetch error:', error)
    return { notFound: true }
  }
}

export default DetailProduct
