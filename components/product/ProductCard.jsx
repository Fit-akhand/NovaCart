import Link from 'next/link'
import { useContext } from 'react'

import { DataContext } from '../../store/GlobalState'
import {
  addToCart,
  increase,
  decrease,
} from '../../store/Actions'

import Badge from '../common/Badge'
import ProductPrice from './ProductPrice'

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-size="16">No image</text></svg>'

const ProductCard = ({ product, handleCheck }) => {
  const { state, dispatch } = useContext(DataContext)

  const {
    cart = [],
    auth = {},
    categories = [],
  } = state

  const isAdmin =
    auth?.user?.role === 'admin'

  const image =
    product?.images?.[0]?.url ||
    FALLBACK_IMAGE

  const categoryName =
    categories?.find(
      (item) =>
        String(item._id) ===
        String(
          typeof product.category === 'object'
            ? product.category?._id
            : product.category
        )
    )?.name ||
    product?.category?.name

  const onImageError = (event) => {
    event.currentTarget.src =
      FALLBACK_IMAGE
  }

  // =========================================================
  // FIND PRODUCT IN CART
  // =========================================================

  const cartItem = Array.isArray(cart)
    ? cart.find(
        (item) =>
          String(item._id) ===
          String(product._id)
      )
    : null

  const cartQuantity =
    Number(cartItem?.quantity) || 0

  const isInCart =
    Boolean(cartItem)

  // =========================================================
  // CART ACTIONS
  // =========================================================

  const handleAddToCart = () => {
    if (product.inStock <= 0) return

    dispatch(
      addToCart(product, cart)
    )
  }

  const handleIncrease = () => {
    if (!cartItem) return

    if (
      cartQuantity >=
      Number(product.inStock || 0)
    ) {
      return
    }

    dispatch(
      increase(product, cart)
    )
  }

  const handleDecrease = () => {
    if (!cartItem) return

    if (cartQuantity <= 1) return

    dispatch(
      decrease(product, cart)
    )
  }

  // =========================================================
  // PRICE
  // =========================================================

  const hasDiscount =
    Number(product?.discountPercent) > 0

  const displayPrice =
    hasDiscount
      ? Number(product?.discountedPrice)
      : Number(product?.price)

  const originalPrice =
    Number(product?.originalPrice ?? product?.price)

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <article
      className="
        group
        relative
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-[var(--nova-border)]
        bg-[var(--nova-surface)]
        shadow-[var(--shadow-sm)]
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1
        hover:border-[var(--nova-violet-light)]
        hover:shadow-[0_16px_40px_rgba(124,58,237,0.12)]
      "
    >
      {isAdmin && handleCheck && (
        <input
          type="checkbox"
          checked={Boolean(product.checked)}
          className="
            absolute
            left-2.5
            top-2.5
            z-20
            h-4
            w-4
            cursor-pointer
            rounded
            accent-[var(--nova-primary)]
          "
          onChange={() => handleCheck(product._id)}
          aria-label={`Select ${product.title}`}
        />
      )}

      <Link
        href={`/product/${product._id}`}
        className="
          relative
          block
          aspect-[4/3]
          overflow-hidden
          bg-[var(--nova-surface-soft)]
        "
      >
        {hasDiscount && (
          <div
            className="
              absolute
              left-2.5
              top-2.5
              z-10
              rounded-full
              bg-[var(--nova-danger)]
              px-2
              py-1
              text-[9px]
              font-bold
              uppercase
              tracking-wide
              text-white
              shadow-[0_4px_12px_rgba(225,29,72,0.18)]
              sm:left-3
              sm:top-3
              sm:px-2.5
              sm:text-[10px]
            "
          >
            {product.discountPercent}% OFF
          </div>
        )}

        <img
          src={image}
          alt={product.title || 'Product'}
          onError={onImageError}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-500
            ease-out
            group-hover:scale-[1.04]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-16
            bg-gradient-to-t
            from-black/10
            to-transparent
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        />
      </Link>

      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
          p-3
          sm:p-4
        "
      >
        {categoryName && (
          <p
            className="
              mb-1
              truncate
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.12em]
              text-[var(--nova-violet-light)]
              sm:text-[10px]
            "
          >
            {categoryName}
          </p>
        )}

        <Link
          href={`/product/${product._id}`}
          className="block min-w-0"
        >
          <h3
            className="
              line-clamp-2
              min-h-[40px]
              min-w-0
              text-sm
              font-semibold
              capitalize
              leading-5
              text-[var(--nova-text)]
              transition-colors
              duration-200
              group-hover:text-[var(--nova-primary)]
            "
            title={product.title}
          >
            {product.title}
          </h3>
        </Link>

        <div className="mt-2.5 min-w-0">
          <div className="min-w-0">
            {hasDiscount ? (
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <ProductPrice
                  price={displayPrice}
                  className="
                    text-base
                    font-bold
                    text-[var(--nova-text)]
                    sm:text-lg
                  "
                />

                <span
                  className="
                    text-[10px]
                    text-[var(--nova-muted)]
                    line-through
                    sm:text-xs
                  "
                >
                  ₹
                  {originalPrice.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ) : (
              <ProductPrice
                price={displayPrice}
                className="
                  text-base
                  font-bold
                  text-[var(--nova-text)]
                  sm:text-lg
                "
              />
            )}
          </div>

          <div className="mt-1.5">
            {product.inStock > 0 ? (
              <Badge variant="success">In stock</Badge>
            ) : (
              <Badge variant="danger">Out of stock</Badge>
            )}
          </div>
        </div>

        <div
          className="
            mt-3
            grid
            grid-cols-1
            gap-2
            sm:mt-4
          "
        >
          {isAdmin ? (
            <>
              <Link
                href={`/create/${product._id}`}
                className="
                  flex
                  min-w-0
                  min-h-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[var(--nova-border)]
                  px-2
                  py-2
                  text-center
                  text-xs
                  font-semibold
                  text-[var(--nova-text)]
                  transition-all
                  duration-200
                  hover:border-[var(--nova-primary)]
                  hover:bg-[var(--nova-lavender-soft)]
                  hover:text-[var(--nova-primary)]
                  sm:px-3
                  sm:py-2.5
                  sm:text-sm
                "
              >
                Edit
              </Link>

              <button
                type="button"
                className="
                  flex
                  min-w-0
                  min-h-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-[var(--nova-danger)]
                  px-2
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  shadow-[0_4px_14px_rgba(225,29,72,0.12)]
                  transition-all
                  duration-200
                  hover:opacity-90
                  hover:shadow-[0_8px_20px_rgba(225,29,72,0.18)]
                  active:scale-[0.98]
                  sm:px-3
                  sm:py-2.5
                  sm:text-sm
                "
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
              {!isInCart ? (
                <button
                  type="button"
                  disabled={product.inStock === 0}
                  onClick={handleAddToCart}
                  className="
                    flex
                    min-w-0
                    min-h-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[var(--nova-primary)]
                    px-2
                    py-2
                    text-xs
                    font-semibold
                    text-white
                    shadow-[0_6px_18px_rgba(124,58,237,0.16)]
                    transition-all
                    duration-200
                    hover:bg-[var(--nova-primary-hover)]
                    hover:shadow-[0_8px_24px_rgba(124,58,237,0.24)]
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                    disabled:shadow-none
                    sm:px-3
                    sm:py-2.5
                    sm:text-sm
                  "
                >
                  <span className="truncate">Add to cart</span>
                </button>
              ) : (
                <div
                  className="
                    flex
                    min-w-0
                    min-h-10
                    flex-1
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-[var(--nova-primary)]
                    bg-[var(--nova-primary)]
                    text-white
                    shadow-[0_6px_18px_rgba(124,58,237,0.16)]
                  "
                >
                  <button
                    type="button"
                    onClick={handleDecrease}
                    disabled={cartQuantity <= 1}
                    aria-label={`Decrease ${product.title} quantity`}
                    className="
                      flex
                      h-full
                      min-h-10
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      text-lg
                      font-semibold
                      transition-colors
                      duration-150
                      hover:bg-black/10
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    −
                  </button>

                  <span
                    className="
                      flex
                      min-h-10
                      min-w-9
                      flex-1
                      items-center
                      justify-center
                      border-x
                      border-white/20
                      text-sm
                      font-semibold
                    "
                  >
                    {cartQuantity}
                  </span>

                  <button
                    type="button"
                    onClick={handleIncrease}
                    disabled={
                      cartQuantity >=
                      Number(product.inStock || 0)
                    }
                    aria-label={`Increase ${product.title} quantity`}
                    className="
                      flex
                      h-full
                      min-h-10
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      text-lg
                      font-semibold
                      transition-colors
                      duration-150
                      hover:bg-black/10
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    +
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard