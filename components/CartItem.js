import Link from 'next/link'
import { decrease, increase } from '../store/Actions'
import ProductPrice from './product/ProductPrice'

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>'

const CartItem = ({ item, dispatch, cart }) => {
  const image = item?.images?.[0]?.url || FALLBACK_IMAGE

  return (
    <div
      className="
        flex flex-col gap-4
        border-b border-[var(--nova-border)]
        px-4 py-5

        transition-colors duration-200

        hover:bg-[var(--nova-surface-soft)]

        sm:flex-row
        sm:items-center
        sm:px-6
      "
    >
      {/* =========================================
          PRODUCT IMAGE
      ========================================= */}

      <Link
        href={`/product/${item._id}`}
        className="
          h-24 w-24
          shrink-0
          overflow-hidden

          rounded-xl

          border
          border-[var(--nova-border)]

          bg-[var(--nova-surface-soft)]

          shadow-[var(--shadow-sm)]

          transition-all
          duration-200

          hover:border-[var(--nova-violet-light)]
          hover:shadow-[0_8px_20px_rgba(124,58,237,0.12)]
        "
      >
        <img
          src={image}
          alt={item.title}
          onError={(event) => {
            event.currentTarget.src =
              FALLBACK_IMAGE
          }}
          className="
            h-full
            w-full
            object-cover

            transition-transform
            duration-300

            hover:scale-[1.04]
          "
        />
      </Link>

      {/* =========================================
          PRODUCT INFORMATION
      ========================================= */}

      <div className="min-w-0 flex-1">

        <Link
          href={`/product/${item._id}`}
          className="
            block

            truncate

            font-semibold
            capitalize

            text-[var(--nova-text)]

            transition-colors
            duration-200

            hover:text-[var(--nova-primary)]
          "
        >
          {item.title}
        </Link>

        <div
          className="
            mt-2
            flex
            flex-wrap
            items-center
            gap-x-3
            gap-y-1

            text-sm
            text-[var(--nova-muted)]
          "
        >
          <ProductPrice
            price={item.price}
            className="
              font-semibold
              text-[var(--nova-text)]
            "
          />

          <span
            className={
              item.inStock > 0
                ? 'text-[var(--nova-success)]'
                : 'text-[var(--nova-danger)]'
            }
          >
            {item.inStock > 0
              ? `In stock: ${item.inStock}`
              : 'Out of stock'}
          </span>
        </div>
      </div>

      {/* =========================================
          QUANTITY CONTROL
      ========================================= */}

      <div
        className="
          flex
          h-10
          items-center
          overflow-hidden

          rounded-xl

          border
          border-[var(--nova-border)]

          bg-[var(--nova-surface)]

          shadow-[var(--shadow-sm)]
        "
      >
        <button
          type="button"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center

            text-lg
            font-medium
            text-[var(--nova-text)]

            transition-colors
            duration-150

            hover:bg-[var(--nova-lavender-soft)]
            hover:text-[var(--nova-primary)]

            disabled:cursor-not-allowed
            disabled:opacity-35
          "
          onClick={() =>
            dispatch(decrease(item, cart))
          }
          disabled={item.quantity === 1}
          aria-label="Decrease quantity"
        >
          −
        </button>

        <span
          className="
            flex
            h-full
            w-10
            items-center
            justify-center

            border-x
            border-[var(--nova-border)]

            text-sm
            font-semibold
            text-[var(--nova-text)]
          "
        >
          {item.quantity}
        </span>

        <button
          type="button"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center

            text-lg
            font-medium
            text-[var(--nova-text)]

            transition-colors
            duration-150

            hover:bg-[var(--nova-lavender-soft)]
            hover:text-[var(--nova-primary)]

            disabled:cursor-not-allowed
            disabled:opacity-35
          "
          onClick={() =>
            dispatch(increase(item, cart))
          }
          disabled={
            item.inStock > 0 &&
            item.quantity >= item.inStock
          }
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      {/* =========================================
          TOTAL + REMOVE
      ========================================= */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-4

          sm:block
          sm:min-w-[110px]
          sm:text-right
        "
      >
        <ProductPrice
          price={item.quantity * item.price}
          className="
            text-base
            font-bold
            text-[var(--nova-text)]
          "
        />

        <button
          type="button"
          className="
            mt-0
            block

            text-sm
            font-medium

            text-[var(--nova-danger)]

            transition-colors
            duration-150

            hover:text-[var(--nova-danger)]
            hover:underline

            sm:mt-2
            sm:ml-auto
          "
          onClick={() =>
            dispatch({
              type: 'ADD_MODAL',
              payload: [
                {
                  data: cart,
                  id: item._id,
                  title: item.title,
                  type: 'ADD_CART',
                },
              ],
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