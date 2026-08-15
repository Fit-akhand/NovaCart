import Link from 'next/link'
import { useContext } from 'react'
import { DataContext } from '../../store/GlobalState'
import { addToCart } from '../../store/Actions'
import Badge from '../common/Badge'
import ProductPrice from './ProductPrice'

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-size="16">No image</text></svg>'

const ProductCard = ({ product, handleCheck }) => {
  const { state, dispatch } = useContext(DataContext)
  const { cart, auth, categories } = state
  const isAdmin = auth.user && auth.user.role === 'admin'

  const image = product?.images?.[0]?.url || FALLBACK_IMAGE
  const categoryName = categories?.find((item) => item._id === product.category)?.name

  const onImageError = (event) => {
    event.currentTarget.src = FALLBACK_IMAGE
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">
      {isAdmin && handleCheck && (
        <input
          type="checkbox"
          checked={Boolean(product.checked)}
          className="absolute z-10 ml-3 mt-3 h-4 w-4 accent-[var(--nova-blue)]"
          onChange={() => handleCheck(product._id)}
          aria-label={`Select ${product.title}`}
        />
      )}

      <Link href={`/product/${product._id}`} className="relative block overflow-hidden">
        <img
          src={image}
          alt={product.title || 'Product'}
          onError={onImageError}
          className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {categoryName && (
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--nova-muted)]">
            {categoryName}
          </p>
        )}

        <Link href={`/product/${product._id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold capitalize text-[var(--nova-text)]" title={product.title}>
            {product.title}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between gap-2">
          <ProductPrice price={product.price} />
          {product.inStock > 0 ? (
            <Badge variant="success">In stock</Badge>
          ) : (
            <Badge variant="danger">Out of stock</Badge>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {isAdmin ? (
            <>
              <Link
                href={`/create/${product._id}`}
                className="flex-1 rounded-lg border border-[var(--nova-border)] px-3 py-2.5 text-center text-sm font-medium hover:border-[var(--nova-blue)] hover:text-[var(--nova-blue)]"
              >
                Edit
              </Link>
              <button
                type="button"
                className="flex-1 rounded-lg bg-[var(--nova-danger)] px-3 py-2.5 text-sm font-medium text-white hover:opacity-90"
                onClick={() =>
                  dispatch({
                    type: 'ADD_MODAL',
                    payload: [
                      {
                        data: '',
                        id: product._id,
                        title: product.title,
                        type: 'DELETE_PRODUCT',
                      },
                    ],
                  })
                }
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/product/${product._id}`}
                className="flex-1 rounded-lg border border-[var(--nova-border)] px-3 py-2.5 text-center text-sm font-medium hover:border-[var(--nova-blue)] hover:text-[var(--nova-blue)]"
              >
                View
              </Link>
              <button
                type="button"
                disabled={product.inStock === 0}
                onClick={() => dispatch(addToCart(product, cart))}
                className="flex-1 rounded-lg bg-[var(--nova-blue)] px-3 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add to cart
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard
