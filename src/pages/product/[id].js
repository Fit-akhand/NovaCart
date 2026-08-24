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
import {
  ChevronRight,
  Package,
  ShoppingBag,
  ShieldCheck,
  Truck,
} from 'lucide-react'

const DetailProduct = ({
  product,
  related = [],
}) => {
  const [quantity, setQuantity] = useState(1)

  const { state, dispatch } =
    useContext(DataContext)

  const { cart } = state

  useEffect(() => {
    setQuantity(1)
  }, [product?._id])

  if (!product) {
    return (
      <main
        className="
          flex
          min-h-[60vh]
          items-center
          justify-center
          bg-[var(--nova-bg)]
          px-4
        "
      >
        <div
          className="
            rounded-2xl
            border
            border-[var(--nova-border)]
            bg-[var(--nova-surface)]
            px-8
            py-10
            text-center
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-[var(--nova-muted)]
            "
          >
            Product not found
          </p>
        </div>
      </main>
    )
  }

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart = () => {
    if (
      !product.inStock ||
      product.inStock <= 0
    ) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'This product is currently out of stock.',
        },
      })
    }

    dispatch(
      addToCart(
        {
          ...product,
          quantity,
        },
        cart
      )
    )
  }

  const maxQty = Math.max(
    product.inStock || 1,
    1
  )

  return (
    <>
      <Head>
        <title>
          {product.title
            ? `${product.title} | NovaCart`
            : 'Product | NovaCart'}
        </title>

        <meta
          name="description"
          content={
            product.description ||
            'View product details on NovaCart.'
          }
        />
      </Head>

      <main
        className="
          min-h-screen
          bg-[var(--nova-bg)]

          py-6
          sm:py-8
          lg:py-10
        "
      >
        <Container>

          {/* =================================================
              BREADCRUMB
          ================================================= */}

          <div
            className="
              mb-6
              flex
              items-center
              gap-1.5

              overflow-hidden

              text-xs
              text-[var(--nova-muted)]
            "
          >
            <span className="shrink-0">
              NovaCart
            </span>

            <ChevronRight
              size={13}
              className="shrink-0"
            />

            <span className="shrink-0">
              Products
            </span>

            <ChevronRight
              size={13}
              className="shrink-0"
            />

            <span
              className="
                min-w-0
                truncate
                font-medium
                text-[var(--nova-text)]
              "
            >
              {product.title}
            </span>
          </div>

          {/* =================================================
              MAIN PRODUCT SECTION
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1

              gap-7

              lg:grid-cols-[1.08fr_0.92fr]
              lg:gap-10
              xl:gap-14
            "
          >

            {/* =================================================
                PRODUCT GALLERY
            ================================================= */}

            <div className="min-w-0">
              <ProductGallery
                images={product.images}
                title={product.title}
              />
            </div>

            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <div
              className="
                min-w-0
                rounded-2xl

                border
                border-[var(--nova-border)]

                bg-[var(--nova-surface)]

                p-5

                shadow-[var(--shadow-sm)]

                sm:p-7

                lg:p-8
              "
            >

              {/* STOCK */}

              <div
                className="
                  mb-4
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
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

              {/* TITLE */}

              <h1
                className="
                  text-2xl
                  font-bold
                  leading-tight
                  tracking-[-0.025em]

                  text-[var(--nova-text)]

                  sm:text-3xl

                  lg:text-4xl
                "
              >
                {product.title}
              </h1>

              {/* PRICE */}

              <div
                className="
                  mt-6

                  rounded-2xl

                  border
                  border-[var(--nova-border)]

                  bg-[var(--nova-surface-soft)]

                  px-4
                  py-4

                  sm:px-5
                "
              >
                <p
                  className="
                    mb-1

                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.15em]

                    text-[var(--nova-muted)]
                  "
                >
                  Price
                </p>

                <ProductPrice
                  price={product.price}
                  className="
                    text-3xl
                    font-bold

                    text-[var(--nova-primary)]
                  "
                />
              </div>

              {/* DESCRIPTION */}

              {product.description && (
                <div className="mt-6">

                  <p
                    className="
                      text-sm
                      leading-7

                      text-[var(--nova-muted)]
                    "
                  >
                    {product.description}
                  </p>

                </div>
              )}

              {/* =================================================
                  PRODUCT STATS
              ================================================= */}

              <div
                className="
                  mt-6
                  grid
                  grid-cols-2
                  gap-3
                "
              >

                {/* AVAILABILITY */}

                <div
                  className="
                    rounded-2xl

                    border
                    border-[var(--nova-border)]

                    bg-[var(--nova-surface)]

                    p-4
                  "
                >
                  <div
                    className="
                      mb-3
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center

                      rounded-xl

                      bg-[var(--nova-lavender-soft)]

                      text-[var(--nova-primary)]
                    "
                  >
                    <Package
                      size={17}
                    />
                  </div>

                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider

                      text-[var(--nova-muted)]
                    "
                  >
                    Availability
                  </p>

                  <p
                    className="
                      mt-1

                      text-sm
                      font-semibold

                      text-[var(--nova-text)]
                    "
                  >
                    {product.inStock > 0
                      ? `${product.inStock} available`
                      : 'Out of stock'}
                  </p>
                </div>

                {/* SOLD */}

                <div
                  className="
                    rounded-2xl

                    border
                    border-[var(--nova-border)]

                    bg-[var(--nova-surface)]

                    p-4
                  "
                >
                  <div
                    className="
                      mb-3
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center

                      rounded-xl

                      bg-[var(--nova-lavender-soft)]

                      text-[var(--nova-primary)]
                    "
                  >
                    <ShoppingBag
                      size={17}
                    />
                  </div>

                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider

                      text-[var(--nova-muted)]
                    "
                  >
                    Sold
                  </p>

                  <p
                    className="
                      mt-1

                      text-sm
                      font-semibold

                      text-[var(--nova-text)]
                    "
                  >
                    {product.sold || 0} units
                  </p>
                </div>

              </div>

              {/* =================================================
                  QUANTITY
              ================================================= */}

              <div className="mt-7">

                <label
                  htmlFor="qty"
                  className="
                    mb-2
                    block

                    text-sm
                    font-semibold

                    text-[var(--nova-text)]
                  "
                >
                  Quantity
                </label>

                <div
                  className="
                    mb-4
                    flex
                    w-fit
                    items-center
                    overflow-hidden

                    rounded-xl

                    border
                    border-[var(--nova-border)]

                    bg-[var(--nova-surface)]
                  "
                >

                  {/* DECREASE */}

                  <button
                    type="button"
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center

                      text-lg
                      font-medium

                      text-[var(--nova-text)]

                      transition-colors
                      duration-150

                      hover:bg-[var(--nova-lavender-soft)]
                      hover:text-[var(--nova-primary)]

                      active:scale-95
                    "
                    onClick={() =>
                      setQuantity(
                        (value) =>
                          Math.max(
                            1,
                            value - 1
                          )
                      )
                    }
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  {/* INPUT */}

                  <input
                    id="qty"
                    type="number"
                    min="1"
                    max={maxQty}
                    value={quantity}
                    onChange={(event) => {
                      const next =
                        Number(
                          event.target.value
                        ) || 1

                      setQuantity(
                        Math.min(
                          maxQty,
                          Math.max(
                            1,
                            next
                          )
                        )
                      )
                    }}
                    className="
                      h-11
                      w-14

                      border-x
                      border-[var(--nova-border)]

                      bg-transparent

                      text-center
                      text-sm
                      font-semibold

                      text-[var(--nova-text)]

                      outline-none

                      focus:text-[var(--nova-primary)]
                    "
                  />

                  {/* INCREASE */}

                  <button
                    type="button"
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center

                      text-lg
                      font-medium

                      text-[var(--nova-text)]

                      transition-colors
                      duration-150

                      hover:bg-[var(--nova-lavender-soft)]
                      hover:text-[var(--nova-primary)]

                      active:scale-95
                    "
                    onClick={() =>
                      setQuantity(
                        (value) =>
                          Math.min(
                            maxQty,
                            value + 1
                          )
                      )
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>

                </div>

                {/* ADD TO CART */}

                <Button
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                  className="
                    w-full
                    min-h-12
                    rounded-xl
                    text-sm
                  "
                >
                  {product.inStock > 0
                    ? 'Add to cart'
                    : 'Out of stock'}
                </Button>

              </div>

              {/* =================================================
                  TRUST INFORMATION
              ================================================= */}

              <div
                className="
                  mt-6
                  grid
                  grid-cols-1
                  gap-3

                  border-t
                  border-[var(--nova-border)]

                  pt-6

                  sm:grid-cols-3
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <ShieldCheck
                    size={16}
                    className="
                      shrink-0
                      text-[var(--nova-primary)]
                    "
                  />

                  <span
                    className="
                      text-xs
                      font-medium
                      text-[var(--nova-muted)]
                    "
                  >
                    Secure checkout
                  </span>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Truck
                    size={16}
                    className="
                      shrink-0
                      text-[var(--nova-primary)]
                    "
                  />

                  <span
                    className="
                      text-xs
                      font-medium
                      text-[var(--nova-muted)]
                    "
                  >
                    Reliable delivery
                  </span>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Package
                    size={16}
                    className="
                      shrink-0
                      text-[var(--nova-primary)]
                    "
                  />

                  <span
                    className="
                      text-xs
                      font-medium
                      text-[var(--nova-muted)]
                    "
                  >
                    Order tracking
                  </span>
                </div>

              </div>

            </div>
          </div>

          {/* =================================================
              PRODUCT DETAILS
          ================================================= */}

          {product.content && (
            <section
              className="
                mt-8

                rounded-2xl

                border
                border-[var(--nova-border)]

                bg-[var(--nova-surface)]

                p-5

                shadow-[var(--shadow-sm)]

                sm:mt-10
                sm:p-7
                lg:p-8
              "
            >

              <div
                className="
                  border-b
                  border-[var(--nova-border)]

                  pb-4
                "
              >
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.15em]

                    text-[var(--nova-primary)]
                  "
                >
                  Product information
                </p>

                <h2
                  className="
                    mt-1

                    text-xl
                    font-bold

                    text-[var(--nova-text)]
                  "
                >
                  Product details
                </h2>
              </div>

              <p
                className="
                  mt-5

                  whitespace-pre-line

                  text-sm
                  leading-7

                  text-[var(--nova-muted)]
                "
              >
                {product.content}
              </p>

            </section>
          )}

          {/* =================================================
              RELATED PRODUCTS
          ================================================= */}

          {related.length > 0 && (
            <section className="mt-10 sm:mt-14">

              <div
                className="
                  mb-5
                  flex
                  items-end
                  justify-between
                  gap-4
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.16em]

                      text-[var(--nova-primary)]
                    "
                  >
                    You may also like
                  </p>

                  <h2
                    className="
                      mt-1

                      text-2xl
                      font-bold
                      tracking-tight

                      text-[var(--nova-text)]
                    "
                  >
                    Related products
                  </h2>

                </div>

              </div>

              <ProductGrid
                products={related}
              />

            </section>
          )}

        </Container>
      </main>
    </>
  )
}

export async function getServerSideProps({
  params,
}) {
  try {
    const res = await getData(
      `product/${params.id}`
    )

    if (
      !res ||
      res.err ||
      !res.product
    ) {
      return {
        notFound: true,
      }
    }

    let related = []

    if (res.product.category) {
      const relatedRes =
        await getData(
          `product?limit=8&category=${res.product.category}&sort=-createdAt&title=all`
        )

      related = (
        relatedRes?.products || []
      )
        .filter(
          (item) =>
            item._id !==
            res.product._id
        )
        .slice(0, 4)
    }

    return {
      props: {
        product: res.product,
        related,
      },
    }
  } catch (error) {
    console.error(
      'Product fetch error:',
      error
    )

    return {
      notFound: true,
    }
  }
}

export default DetailProduct