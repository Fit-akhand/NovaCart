import Link from 'next/link'
import { useContext } from 'react'
import { DataContext } from '../../store/GlobalState'
import { addToCart } from '../../store/Actions'

const ProductItem = ({ product, handleCheck }) => {
  const { state, dispatch } = useContext(DataContext)
  const { cart, auth } = state

  const isAdmin = auth.user && auth.user.role === 'admin'

  const userActions = () => (
  <>
    <Link
      href={`/product/${product._id}`}
      className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-center text-sm font-medium text-[var(--nova-navy)] transition hover:border-[var(--nova-blue)] hover:text-[var(--nova-blue)]"
    >
      View
    </Link>
    <button
      type="button"
      disabled={product.inStock === 0}
      onClick={() => dispatch(addToCart(product, cart))}
      className="flex-1 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      style={{ backgroundColor: 'var(--nova-blue)' }}
    >
      Buy
    </button>
  </>
  )

  const adminActions = () => (
    <>
      <Link
        href={`/create/${product._id}`}
        className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-center text-sm font-medium text-[var(--nova-navy)] transition hover:border-[var(--nova-blue)] hover:text-[var(--nova-blue)]"
      >
        Edit
      </Link>
      <button
        type="button"
        className="flex-1 rounded-lg bg-red-500 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
        data-toggle="modal"
        data-target="#exampleModal"
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
  )

  return (
    <article
      className="group relative flex w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
    >
      {isAdmin && (
        <input
          type="checkbox"
          checked={product.checked}
          className="absolute left-3 top-3 z-10 h-4 w-4 rounded border-slate-300 accent-[var(--nova-blue)]"
          onChange={() => handleCheck(product._id)}
          aria-label={`Select ${product.title}`}
        />
      )}

      <Link href={`/product/${product._id}`} className="block overflow-hidden">
        <img
          src={product.images[0].url}
          alt={product.images[0].url}
          className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/product/${product._id}`}>
          <h3
            className="truncate text-base font-semibold capitalize text-[var(--nova-navy)]"
            title={product.title}
          >
            {product.title}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-lg font-semibold text-[var(--nova-blue)]">
            ${product.price}
          </span>
          {product.inStock > 0 ? (
            <span className="text-xs font-medium text-emerald-600">
              In stock: {product.inStock}
            </span>
          ) : (
            <span className="text-xs font-medium text-red-500">Out of stock</span>
          )}
        </div>

        <p
          className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500"
          title={product.description}
        >
          {product.description}
        </p>

        <div className="mt-4 flex gap-2">
          {!isAdmin ? userActions() : adminActions()}
        </div>
      </div>
    </article>
  )
}

export default ProductItem
