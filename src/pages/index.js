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
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const Home = (props) => {
  const [products, setProducts] = useState(
    props.products || []
  )

  const [isCheck, setIsCheck] = useState(false)

  const router = useRouter()

  const { state, dispatch } =
    useContext(DataContext)

  const { auth, categories } = state

  useEffect(() => {
    setProducts(props.products || [])
  }, [props.products])

  /* =====================================================
     ADMIN PRODUCT SELECTION
  ===================================================== */

  const handleCheck = (id) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === id
          ? {
              ...product,
              checked: !product.checked,
            }
          : product
      )
    )
  }

  const handleCheckALL = () => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => ({
        ...product,
        checked: !isCheck,
      }))
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
        payload: {
          error:
            'Please select at least one product.',
        },
      })
    }

    dispatch({
      type: 'ADD_MODAL',
      payload: deleteArr,
    })
  }

  const selectedCount = products.filter(
    (product) => product.checked
  ).length

  const bestSellers = products
    .filter(
      (product) =>
        Number(product.sold) > 0
    )
    .slice(0, 4)

  return (
    <>
      <Head>
        <title>
          NovaCart — Shop smarter. Live better.
        </title>

        <meta
          name="description"
          content="Discover products selected for everyday life on NovaCart."
        />
      </Head>

      <main
        className="
          min-h-screen
          bg-[var(--nova-bg)]
        "
      >

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="
            relative
            overflow-hidden

            border-b
            border-[var(--nova-border)]

            bg-[var(--nova-bg)]
          "
        >

          {/* Decorative violet glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-32
              -top-32

              h-80
              w-80

              rounded-full

              bg-[rgba(139,92,246,0.12)]

              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-40
              left-1/3

              h-80
              w-80

              rounded-full

              bg-[rgba(167,139,250,0.08)]

              blur-3xl
            "
          />

          <Container
            className="
              relative
              grid
              items-center
              gap-10

              py-14

              sm:py-16

              lg:grid-cols-[1.15fr_0.85fr]
              lg:gap-16
              lg:py-24
            "
          >

            {/* HERO CONTENT */}

            <div>

              <div
                className="
                  mb-5
                  inline-flex
                  items-center
                  gap-2

                  rounded-full

                  border
                  border-[rgba(139,92,246,0.2)]

                  bg-[var(--nova-lavender-soft)]

                  px-3
                  py-1.5

                  text-xs
                  font-semibold
                  tracking-wide

                  text-[var(--nova-primary)]
                "
              >
                <Sparkles size={14} />

                CURATED FOR YOU
              </div>

              <h1
                className="
                  max-w-3xl

                  text-4xl
                  font-bold
                  leading-[1.05]
                  tracking-[-0.04em]

                  text-[var(--nova-text)]

                  sm:text-5xl

                  lg:text-6xl
                  xl:text-7xl
                "
              >
                Shop smarter.
                <br />

                <span
                  className="
                    text-[var(--nova-primary)]
                  "
                >
                  Live better.
                </span>
              </h1>

              <p
                className="
                  mt-6
                  max-w-xl

                  text-base
                  leading-7

                  text-[var(--nova-muted)]

                  sm:text-lg
                "
              >
                Discover products selected for
                everyday life. Browse the catalog,
                track orders, and check out securely.
              </p>

              {/* HERO ACTIONS */}

              <div
                className="
                  mt-8
                  flex
                  flex-wrap
                  gap-3
                "
              >

                <Link
                  href="/products"
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    gap-2

                    rounded-xl

                    bg-[var(--nova-primary)]

                    px-5
                    py-3

                    text-sm
                    font-semibold
                    text-white

                    shadow-[0_8px_24px_rgba(124,58,237,0.2)]

                    transition-all
                    duration-200

                    hover:bg-[var(--nova-primary-hover)]
                    hover:shadow-[0_12px_30px_rgba(124,58,237,0.28)]

                    active:scale-[0.98]
                  "
                >
                  Shop now

                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/categories"
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center

                    rounded-xl

                    border
                    border-[var(--nova-border)]

                    bg-[var(--nova-surface)]

                    px-5
                    py-3

                    text-sm
                    font-semibold

                    text-[var(--nova-text)]

                    transition-all
                    duration-200

                    hover:border-[var(--nova-violet-light)]
                    hover:bg-[var(--nova-surface-soft)]
                    hover:text-[var(--nova-primary)]

                    active:scale-[0.98]
                  "
                >
                  Explore categories
                </Link>

              </div>

              {/* TRUST POINTS */}

              <div
                className="
                  mt-8
                  flex
                  flex-wrap
                  gap-x-6
                  gap-y-3
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2

                    text-xs
                    font-medium

                    text-[var(--nova-muted)]
                  "
                >
                  <ShieldCheck
                    size={16}
                    className="text-[var(--nova-primary)]"
                  />

                  Secure checkout
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-2

                    text-xs
                    font-medium

                    text-[var(--nova-muted)]
                  "
                >
                  <Truck
                    size={16}
                    className="text-[var(--nova-primary)]"
                  />

                  Reliable delivery
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-2

                    text-xs
                    font-medium

                    text-[var(--nova-muted)]
                  "
                >
                  <Package
                    size={16}
                    className="text-[var(--nova-primary)]"
                  />

                  Order tracking
                </div>

              </div>
            </div>

            {/* HERO INFORMATION CARD */}

            <div
              className="
                relative

                overflow-hidden

                rounded-3xl

                border
                border-[var(--nova-border)]

                bg-[var(--nova-surface)]

                p-5

                shadow-[var(--shadow-lg)]

                sm:p-7
              "
            >

              {/* Inner glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16

                  h-48
                  w-48

                  rounded-full

                  bg-[rgba(139,92,246,0.12)]

                  blur-3xl
                "
              />

              <div className="relative">

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.16em]

                        text-[var(--nova-muted)]
                      "
                    >
                      NovaCart
                    </p>

                    <p
                      className="
                        mt-2
                        text-2xl
                        font-bold
                        tracking-tight

                        text-[var(--nova-text)]
                      "
                    >
                      {props.result || 0}
                    </p>

                    <p
                      className="
                        text-sm
                        text-[var(--nova-muted)]
                      "
                    >
                      products in catalog
                    </p>

                  </div>

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center

                      rounded-2xl

                      bg-[var(--nova-lavender-soft)]

                      text-[var(--nova-primary)]
                    "
                  >
                    <ShoppingBag size={22} />
                  </div>
                </div>

                <p
                  className="
                    mt-6

                    text-sm
                    leading-6

                    text-[var(--nova-muted)]
                  "
                >
                  Search, filter by category,
                  and sort by price or popularity.
                </p>

                <div
                  className="
                    mt-6
                    grid
                    grid-cols-2
                    gap-3
                  "
                >

                  <div
                    className="
                      rounded-2xl

                      border
                      border-[var(--nova-border)]

                      bg-[var(--nova-surface-soft)]

                      p-4
                    "
                  >
                    <ShieldCheck
                      size={19}
                      className="
                        mb-3
                        text-[var(--nova-primary)]
                      "
                    />

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-[var(--nova-text)]
                      "
                    >
                      Secure
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-[var(--nova-muted)]
                      "
                    >
                      Checkout
                    </p>
                  </div>

                  <div
                    className="
                      rounded-2xl

                      border
                      border-[var(--nova-border)]

                      bg-[var(--nova-surface-soft)]

                      p-4
                    "
                  >
                    <Package
                      size={19}
                      className="
                        mb-3
                        text-[var(--nova-primary)]
                      "
                    />

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-[var(--nova-text)]
                      "
                    >
                      Track
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-[var(--nova-muted)]
                      "
                    >
                      Your orders
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </Container>
        </section>

        {/* =================================================
                FEATURED CATEGORIES
            ================================================= */}

            {categories?.length > 0 && (
              <section className="py-12 sm:py-16">

                <Container>

                  {/* SECTION HEADER */}

                  <div
                    className="
                      mb-7
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
                          tracking-[0.18em]

                          text-[var(--nova-primary)]
                        "
                      >
                        Explore
                      </p>

                      <h2
                        className="
                          mt-1
                          text-2xl
                          font-bold
                          tracking-tight

                          text-[var(--nova-text)]

                          sm:text-3xl
                        "
                      >
                        Featured categories
                      </h2>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-[var(--nova-muted)]
                        "
                      >
                        Discover products by category
                      </p>

                    </div>

                    <Link
                      href="/categories"
                      className="
                        inline-flex
                        shrink-0
                        items-center
                        gap-1

                        text-sm
                        font-semibold

                        text-[var(--nova-primary)]

                        transition-all
                        duration-200

                        hover:gap-2
                      "
                    >
                      View all
                      <ArrowRight size={15} />
                    </Link>

                  </div>


                  {/* CATEGORY GRID */}

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-4

                      sm:grid-cols-3

                      lg:grid-cols-4
                    "
                  >

                    {categories
                      .filter(
                        (category) =>
                          !category.parentCategory &&
                          category.isActive !== false
                      )
                      .slice(0, 8)
                      .map((category) => (

                        <Link
                          key={category._id}
                          href={`/products?category=${category._id}`}
                          className="
                            group
                            relative
                            overflow-hidden

                            rounded-2xl

                            border
                            border-[var(--nova-border)]

                            bg-[var(--nova-surface)]

                            transition-all
                            duration-300

                            hover:-translate-y-1

                            hover:border-[var(--nova-violet-light)]

                            hover:shadow-[0_14px_35px_rgba(124,58,237,0.12)]
                          "
                        >

                          {/* ================================
                              IMAGE
                          ================================= */}

                          <div
                            className="
                              relative

                              aspect-[4/3]

                              overflow-hidden

                              bg-[var(--nova-surface-soft)]
                            "
                          >

                            {category.image ? (

                              <img
                                src={category.image}
                                alt={category.name}
                                className="
                                  h-full
                                  w-full

                                  object-cover

                                  transition-transform
                                  duration-500

                                  group-hover:scale-105
                                "
                              />

                            ) : (

                              /* FALLBACK */

                              <div
                                className="
                                  flex
                                  h-full
                                  w-full

                                  items-center
                                  justify-center

                                  bg-[var(--nova-lavender-soft)]

                                  text-[var(--nova-primary)]
                                "
                              >
                                <ShoppingBag
                                  size={38}
                                  strokeWidth={1.5}
                                />
                              </div>

                            )}


                            {/* IMAGE OVERLAY */}

                            <div
                              className="
                                pointer-events-none
                                absolute
                                inset-0

                                bg-gradient-to-t
                                from-black/35
                                via-transparent
                                to-transparent
                              "
                            />


                            {/* DISCOUNT BADGE */}

                            {category.discountActive &&
                              Number(
                                category.discountPercent
                              ) > 0 && (

                                <div
                                  className="
                                    absolute
                                    left-3
                                    top-3

                                    rounded-full

                                    bg-[var(--nova-primary)]

                                    px-2.5
                                    py-1

                                    text-[10px]
                                    font-bold

                                    text-white

                                    shadow-lg
                                  "
                                >
                                  Up to{' '}
                                  {Number(
                                    category.discountPercent
                                  )}
                                  % OFF
                                </div>

                              )}

                          </div>


                          {/* ================================
                              CATEGORY INFORMATION
                          ================================= */}

                          <div
                            className="
                              p-4
                              sm:p-5
                            "
                          >

                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-3
                              "
                            >

                              <div className="min-w-0">

                                <p
                                  className="
                                    truncate

                                    text-sm
                                    font-semibold
                                    capitalize

                                    text-[var(--nova-text)]

                                    transition-colors
                                    duration-200

                                    group-hover:text-[var(--nova-primary)]
                                  "
                                >
                                  {category.name}
                                </p>

                                <p
                                  className="
                                    mt-1

                                    text-xs

                                    text-[var(--nova-muted)]
                                  "
                                >
                                  Shop this category
                                </p>

                              </div>


                              <div
                                className="
                                  flex
                                  h-8
                                  w-8
                                  shrink-0

                                  items-center
                                  justify-center

                                  rounded-full

                                  bg-[var(--nova-lavender-soft)]

                                  text-[var(--nova-primary)]

                                  transition-transform
                                  duration-200

                                  group-hover:translate-x-1
                                "
                              >
                                <ArrowRight size={14} />
                              </div>

                            </div>


                            {/* DISCOUNT TEXT */}

                            {category.discountActive &&
                              Number(
                                category.discountPercent
                              ) > 0 && (

                                <p
                                  className="
                                    mt-3

                                    text-xs
                                    font-semibold

                                    text-[var(--nova-primary)]
                                  "
                                >
                                  Save up to{' '}
                                  {Number(
                                    category.discountPercent
                                  )}
                                  % on selected products
                                </p>

                              )}

                          </div>

                        </Link>

                      ))}

                  </div>

                </Container>

              </section>
            )}

        {/* =================================================
            PRODUCT BROWSE
        ================================================= */}

        <section
          id="browse-products"
          className="
            pb-10
            sm:pb-14
          "
        >

          <Container>

            {/* FILTERS */}

            <div
              className="
                mb-6

                rounded-2xl

                border
                border-[var(--nova-border)]

                bg-[var(--nova-surface)]

                p-3
                sm:p-4

                shadow-[var(--shadow-sm)]
              "
            >
              <ProductFilters state={state} />
            </div>

            {/* =================================================
                ADMIN MANAGEMENT
            ================================================= */}

            {auth.user &&
              auth.user.role === 'admin' && (
                <div
                  className="
                    mb-6

                    flex
                    flex-col
                    gap-4

                    rounded-2xl

                    border
                    border-[var(--nova-border)]

                    bg-[var(--nova-surface)]

                    p-4

                    shadow-[var(--shadow-sm)]

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >

                  <div>

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-[var(--nova-text)]
                      "
                    >
                      Product management
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-[var(--nova-muted)]
                      "
                    >
                      {selectedCount > 0
                        ? `${selectedCount} product${
                            selectedCount === 1
                              ? ''
                              : 's'
                          } selected`
                        : 'Select products to perform bulk actions'}
                    </p>

                  </div>

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-3
                    "
                  >

                    <label
                      className="
                        flex
                        cursor-pointer
                        items-center
                        gap-2

                        rounded-xl

                        border
                        border-[var(--nova-border)]

                        bg-[var(--nova-surface-soft)]

                        px-3
                        py-2

                        text-xs
                        font-medium

                        text-[var(--nova-text)]

                        transition-colors

                        hover:border-[var(--nova-violet-light)]
                      "
                    >
                      <input
                        type="checkbox"
                        checked={isCheck}
                        onChange={
                          handleCheckALL
                        }
                        className="
                          accent-[var(--nova-primary)]
                        "
                      />

                      Select all
                    </label>

                    <button
                      type="button"
                      onClick={
                        handleDeleteAll
                      }
                      disabled={
                        selectedCount === 0
                      }
                      className="
                        flex
                        min-h-10
                        items-center
                        gap-2

                        rounded-xl

                        bg-[var(--nova-danger)]

                        px-4
                        py-2

                        text-xs
                        font-semibold
                        text-white

                        transition-all
                        duration-200

                        hover:opacity-90

                        active:scale-[0.98]

                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      <Trash2 size={14} />

                      Delete selected
                    </button>

                  </div>

                </div>
              )}

            {/* =================================================
                PRODUCTS
            ================================================= */}

            {products.length === 0 ? (
              <EmptyState
                title="No products found"
                description="Try changing your search or category."
                action={
                  <Button
                    variant="secondary"
                    onClick={() =>
                      router.push('/')
                    }
                  >
                    View all products
                  </Button>
                }
              />
            ) : (
              <>
                <div
                  className="
                    mb-6
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
                      Discover
                    </p>

                    <h2
                      className="
                        mt-1
                        text-2xl
                        font-bold
                        tracking-tight

                        text-[var(--nova-text)]

                        sm:text-3xl
                      "
                    >
                      Featured products
                    </h2>

                  </div>

                  <p
                    className="
                      hidden
                      text-xs
                      text-[var(--nova-muted)]

                      sm:block
                    "
                  >
                    Showing {products.length} of{' '}
                    {props.result || 0}
                  </p>

                </div>

                <ProductGrid
                  products={products}
                  handleCheck={handleCheck}
                />
              </>
            )}

            {/*
              Homepage loads the complete catalog.
              Pagination is intentionally disabled here.
              The dedicated /products page handles pagination.
            */}

          </Container>
        </section>

        {/* =================================================
            BEST SELLERS
        ================================================= */}

        {bestSellers.length > 0 && (
          <section
            className="
              border-t
              border-[var(--nova-border)]

              bg-[var(--nova-surface)]

              py-12
              sm:py-16
            "
          >

            <Container>

              <div
                className="
                  mb-7
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
                    Popular
                  </p>

                  <h2
                    className="
                      mt-1
                      text-2xl
                      font-bold
                      tracking-tight

                      text-[var(--nova-text)]

                      sm:text-3xl
                    "
                  >
                    Best sellers
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-xl
                      text-sm
                      text-[var(--nova-muted)]
                    "
                  >
                    Products from the current
                    catalog with recorded sales.
                  </p>

                </div>

              </div>

              <ProductGrid
                products={bestSellers}
              />

            </Container>
          </section>
        )}

        {/* =================================================
            WHY NOVACART
        ================================================= */}

        <section
          className="
            border-t
            border-[var(--nova-border)]

            py-12
            sm:py-16
          "
        >

          <Container>

            <div className="mb-8">

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.16em]

                  text-[var(--nova-primary)]
                "
              >
                The NovaCart promise
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-bold
                  tracking-tight

                  text-[var(--nova-text)]

                  sm:text-3xl
                "
              >
                Why NovaCart
              </h2>

            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-3

                sm:grid-cols-2

                lg:grid-cols-4
              "
            >

              {[
                {
                  icon: Lock,
                  title: 'Secure checkout',
                  text: 'Pay with the existing checkout flow.',
                },
                {
                  icon: Truck,
                  title: 'Order tracking',
                  text: 'Follow payment and delivery status in your account.',
                },
                {
                  icon: ShoppingBag,
                  title: 'Quality products',
                  text: 'A curated catalog you can search and filter.',
                },
                {
                  icon: Check,
                  title: 'Account management',
                  text: 'Save profile details and review past orders.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="
                    group

                    rounded-2xl

                    border
                    border-[var(--nova-border)]

                    bg-[var(--nova-surface)]

                    p-5

                    transition-all
                    duration-200

                    hover:-translate-y-1
                    hover:border-[var(--nova-violet-light)]
                    hover:shadow-[0_12px_30px_rgba(124,58,237,0.1)]
                  "
                >

                  <div
                    className="
                      mb-4
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center

                      rounded-xl

                      bg-[var(--nova-lavender-soft)]

                      text-[var(--nova-primary)]

                      transition-transform
                      duration-200

                      group-hover:scale-105
                    "
                  >
                    <item.icon
                      size={19}
                    />
                  </div>

                  <p
                    className="
                      font-semibold
                      text-[var(--nova-text)]
                    "
                  >
                    {item.title}
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6

                      text-[var(--nova-muted)]
                    "
                  >
                    {item.text}
                  </p>

                </div>
              ))}

            </div>

          </Container>
        </section>

      </main>
    </>
  )
}

export async function getServerSideProps({
  query,
  req,
}) {
  const protocol =
    req.headers['x-forwarded-proto'] ||
    'http'

  const host = req.headers.host

  const baseUrl =
    `${protocol}://${host}`

  const props =
    await fetchCatalogProps(
      query,
      baseUrl
    )

  return {
    props,
  }
}

export default Home