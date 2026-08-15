import Link from 'next/link'
import { decrease, increase } from '../store/Actions'
import ProductPrice from './product/ProductPrice'

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>'

const CartItem = ({ item, dispatch, cart }) => {
  const image = item?.images?.[0]?.url || FALLBACK_IMAGE

  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
      <Link href={`/product/${item._id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-[var(--nova-border)]">
        <img
          src={image}
          alt={item.title}
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE
          }}
          className="h-full w-full object-cover"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/product/${item._id}`} className="font-semibold capitalize hover:text-[var(--nova-blue)]">
          {item.title}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--nova-muted)]">
          <ProductPrice price={item.price} />
          <span>{item.inStock > 0 ? `In stock: ${item.inStock}` : 'Out of stock'}</span>
        </div>
      </div>

      <div className="flex items-center rounded-lg border border-[var(--nova-border)]">
        <button
          type="button"
          className="h-10 w-10"
          onClick={() => dispatch(decrease(cart, item._id))}
          disabled={item.quantity === 1}
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="w-8 text-center text-sm">{item.quantity}</span>
        <button
          type="button"
          className="h-10 w-10"
          onClick={() => dispatch(increase(cart, item._id))}
          disabled={item.quantity === item.inStock}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <div className="text-right">
        <ProductPrice price={item.quantity * item.price} />
        <button
          type="button"
          className="mt-2 block text-sm text-[var(--nova-danger)]"
          onClick={() =>
            dispatch({
              type: 'ADD_MODAL',
              payload: [{ data: cart, id: item._id, title: item.title, type: 'ADD_CART' }],
            })
          }
        >
          Remove
        </button>
      </div>
    </div>
  )
}

export default CartItem
