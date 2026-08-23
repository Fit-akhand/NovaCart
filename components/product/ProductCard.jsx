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
        group relative flex h-full flex-col
        overflow-hidden rounded-xl
        border border-[var(--nova-border)]
        bg-[var(--nova-surface)]
      "
    >

      {/* =====================================================
          ADMIN CHECKBOX
      ===================================================== */}

      {isAdmin && handleCheck && (
        <input
          type="checkbox"
          checked={Boolean(product.checked)}
          className="
            absolute z-10 ml-3 mt-3
            h-4 w-4
            accent-[var(--nova-blue)]
          "
          onChange={() =>
            handleCheck(product._id)
          }
          aria-label={`Select ${product.title}`}
        />
      )}

      {/* =====================================================
          PRODUCT IMAGE
      ===================================================== */}

      <Link
        href={`/product/${product._id}`}
        className="relative block overflow-hidden"
      >
        <img
          src={image}
          alt={
            product.title ||
            'Product'
          }
          onError={onImageError}
          className="
            h-48 w-full object-cover
            transition duration-300
            group-hover:scale-[1.02]
          "
        />
      </Link>

      {/* =====================================================
          PRODUCT CONTENT
      ===================================================== */}

      <div className="flex flex-1 flex-col p-4">

        {/* CATEGORY */}

        {categoryName && (
          <p
            className="
              mb-1 text-xs uppercase
              tracking-wide
              text-[var(--nova-muted)]
            "
          >
            {categoryName}
          </p>
        )}

        {/* TITLE */}

        <Link
          href={`/product/${product._id}`}
        >
          <h3
            className="
              line-clamp-2 text-sm
              font-semibold capitalize
              text-[var(--nova-text)]
            "
            title={product.title}
          >
            {product.title}
          </h3>
        </Link>

        {/* =================================================
            PRICE + STOCK
        ================================================= */}

        <div className="mt-2 flex items-start justify-between gap-2">

          <div className="min-w-0">

            {hasDiscount ? (
              <div className="flex flex-wrap items-center gap-2">

                <ProductPrice
                  price={displayPrice}
                  className="text-xl font-bold"
                />

                <span
                  className="
                    text-sm
                    text-[var(--nova-muted)]
                    line-through
                  "
                >
                  ₹
                  {originalPrice.toLocaleString(
                    'en-IN',
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>

                <span
                  className="
                    text-sm font-semibold
                    text-green-600
                  "
                >
                  {product.discountPercent}% OFF
                </span>

              </div>
            ) : (
              <ProductPrice
                price={displayPrice}
                className="text-xl font-bold"
              />
            )}

          </div>

          {/* STOCK */}

          {product.inStock > 0 ? (
            <Badge variant="success">
              In stock
            </Badge>
          ) : (
            <Badge variant="danger">
              Out of stock
            </Badge>
          )}

        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="mt-4 flex gap-2">

          {/* =================================================
              ADMIN
          ================================================= */}

          {isAdmin ? (
            <>
              <Link
                href={`/create/${product._id}`}
                className="
                  flex-1 rounded-lg
                  border border-[var(--nova-border)]
                  px-3 py-2.5
                  text-center text-sm
                  font-medium
                  hover:border-[var(--nova-blue)]
                  hover:text-[var(--nova-blue)]
                "
              >
                Edit
              </Link>

              <button
                type="button"
                className="
                  flex-1 rounded-lg
                  bg-[var(--nova-danger)]
                  px-3 py-2.5
                  text-sm font-medium
                  text-white
                  hover:opacity-90
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

            /* =================================================
               CUSTOMER
            ================================================= */

            <>
              <Link
                href={`/product/${product._id}`}
                className="
                  flex-1 rounded-lg
                  border border-[var(--nova-border)]
                  px-3 py-2.5
                  text-center text-sm
                  font-medium
                  hover:border-[var(--nova-blue)]
                  hover:text-[var(--nova-blue)]
                "
              >
                View
              </Link>

              {!isInCart ? (

                /* =========================================
                   NOT IN CART
                ========================================= */

                <button
                  type="button"
                  disabled={
                    product.inStock === 0
                  }
                  onClick={
                    handleAddToCart
                  }
                  className="
                    flex-1 rounded-lg
                    bg-[var(--nova-blue)]
                    px-3 py-2.5
                    text-sm font-medium
                    text-white
                    transition
                    hover:opacity-90
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Add to cart
                </button>

              ) : (

                /* =========================================
                   ALREADY IN CART
                ========================================= */

                <div
                  className="
                    flex flex-1
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-lg
                    border border-[var(--nova-blue)]
                    bg-[var(--nova-blue)]
                    text-white
                  "
                >

                  {/* MINUS */}

                  <button
                    type="button"
                    onClick={
                      handleDecrease
                    }
                    disabled={
                      cartQuantity <= 1
                    }
                    aria-label={`Decrease ${product.title} quantity`}
                    className="
                      flex h-full
                      min-h-[42px]
                      w-10
                      items-center
                      justify-center
                      text-lg font-semibold
                      transition
                      hover:bg-black/10
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    −
                  </button>

                  {/* QUANTITY */}

                  <span
                    className="
                      flex min-h-[42px]
                      min-w-[42px]
                      items-center
                      justify-center
                      border-x
                      border-white/20
                      text-sm font-semibold
                    "
                  >
                    {cartQuantity}
                  </span>

                  {/* PLUS */}

                  <button
                    type="button"
                    onClick={
                      handleIncrease
                    }
                    disabled={
                      cartQuantity >=
                      Number(
                        product.inStock || 0
                      )
                    }
                    aria-label={`Increase ${product.title} quantity`}
                    className="
                      flex h-full
                      min-h-[42px]
                      w-10
                      items-center
                      justify-center
                      text-lg font-semibold
                      transition
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