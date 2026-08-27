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
  const [heroes, setHeroes] = useState([])
  const [heroIndex, setHeroIndex] = useState(0)

  const [isCheck, setIsCheck] = useState(false)

  const router = useRouter()

  const { state, dispatch } =
    useContext(DataContext)

  const { auth, categories } = state

  useEffect(() => {
    setProducts(props.products || [])
  }, [props.products])

  // =====================================================
  // LOAD HOMEPAGE HERO BANNERS
  // =====================================================

  useEffect(() => {

    let mounted = true

    const loadHeroes = async () => {

      try {

        const response = await fetch(
          '/api/heroes',
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          }
        )

        const data =
          await response.json()

        if (!response.ok) {
          throw new Error(
            data?.err ||
            'Failed to load hero banners.'
          )
        }

        if (!mounted) {
          return
        }

        const activeHeroes =
          Array.isArray(data?.heroes)
            ? data.heroes.filter(
                hero =>
                  hero &&
                  hero.isActive &&
                  hero.image
              )
            : []

        setHeroes(activeHeroes)

      } catch (error) {

        console.error(
          'NovaCart hero banners load failed:',
          error
        )

        if (mounted) {
          setHeroes([])
        }

      }

    }

    loadHeroes()

    return () => {
      mounted = false
    }

  }, [])
  // =====================================================
// HERO AUTO SLIDER
// =====================================================

useEffect(() => {

  if (heroes.length <= 1) {
    return
  }

  const interval = setInterval(() => {

    setHeroIndex(
      previous =>
        (previous + 1) % heroes.length
    )

  }, 5000)

  return () => {
    clearInterval(interval)
  }

}, [heroes.length])

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

        {/* =================================================
                DYNAMIC HERO BANNER
            ================================================= */}

            {heroes.length > 0 && (
              <section className="py-5 sm:py-7 lg:py-8">

                <Container>

                  <div
                    className="
                      relative
                      overflow-hidden

                      rounded-2xl
                      sm:rounded-3xl

                      border
                      border-[var(--nova-border)]

                      bg-[var(--nova-surface)]

                      shadow-[var(--shadow-lg)]
                    "
                  >

                    {/* HERO IMAGE */}

                    <div
                      className="
                        relative

                        aspect-[16/7]

                        min-h-[330px]

                        overflow-hidden

                        sm:min-h-[400px]

                        lg:min-h-[500px]
                      "
                    >

                      <img
                        src={heroes[heroIndex].image}
                        alt={
                          heroes[heroIndex].title ||
                          'NovaCart hero banner'
                        }
                        className="
                          absolute
                          inset-0

                          h-full
                          w-full

                          object-cover
                        "
                      />

                      {/* LEFT OVERLAY */}

                      <div
                        className="
                          absolute
                          inset-0

                          bg-gradient-to-r
                          from-black/60
                          via-black/25
                          to-transparent
                        "
                      />

                      {/* HERO CONTENT */}

                      <div
                        className="
                          absolute
                          inset-y-0
                          left-0

                          flex
                          w-full
                          max-w-2xl

                          items-center

                          px-5
                          py-7

                          sm:px-10
                          sm:py-8
                          lg:px-14
                        "
                      >

                        <div>

                          {heroes[heroIndex].title && (
                            <h1
                              className="
                                max-w-xl

                                text-3xl
                                font-bold
                                leading-tight
                                tracking-tight

                                text-white

                                sm:text-4xl

                                lg:text-5xl
                              "
                            >
                              {heroes[heroIndex].title}
                            </h1>
                          )}

                          {heroes[heroIndex].subtitle && (
                            <p
                              className="
                                mt-4

                                max-w-lg

                                text-sm
                                leading-6

                                text-white/90

                                sm:text-base
                                sm:leading-7
                              "
                            >
                              {heroes[heroIndex].subtitle}
                            </p>
                          )}

                          {heroes[heroIndex].buttonLink && (
                            <Link
                              href={
                                heroes[heroIndex].buttonLink
                              }
                              className="
                                mt-6

                                inline-flex

                                min-h-11

                                items-center
                                justify-center

                                gap-2

                                rounded-xl

                                bg-white

                                px-5
                                py-3

                                text-sm
                                font-semibold

                                text-[var(--nova-primary)]

                                shadow-lg

                                transition-all
                                duration-200

                                hover:-translate-y-0.5
                                hover:bg-[var(--nova-surface-soft)]

                                active:scale-[0.98]
                              "
                            >
                              {heroes[heroIndex].buttonText ||
                                'Shop Now'}

                              <ArrowRight size={16} />
                            </Link>
                          )}

                        </div>

                      </div>

                      {/* PREVIOUS */}

                      {heroes.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setHeroIndex(
                              previous =>
                                previous === 0
                                  ? heroes.length - 1
                                  : previous - 1
                            )
                          }
                          aria-label="Previous hero banner"
                          className="
                            absolute
                            left-3
                            top-1/2

                            flex
                            h-10
                            w-10

                            -translate-y-1/2

                            items-center
                            justify-center

                            rounded-full

                            bg-white/90

                            text-[var(--nova-text)]

                            shadow-md

                            backdrop-blur

                            transition-all
                            duration-200

                            hover:bg-white

                            sm:left-5
                          "
                        >
                          ←
                        </button>
                      )}

                      {/* NEXT */}

                      {heroes.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setHeroIndex(
                              previous =>
                                (previous + 1) %
                                heroes.length
                            )
                          }
                          aria-label="Next hero banner"
                          className="
                            absolute
                            right-3
                            top-1/2

                            flex
                            h-10
                            w-10

                            -translate-y-1/2

                            items-center
                            justify-center

                            rounded-full

                            bg-white/90

                            text-[var(--nova-text)]

                            shadow-md

                            backdrop-blur

                            transition-all
                            duration-200

                            hover:bg-white

                            sm:right-5
                          "
                        >
                          →
                        </button>
                      )}

                      {/* DOTS */}

                      {heroes.length > 1 && (
                        <div
                          className="
                            absolute
                            bottom-5
                            left-1/2

                            flex

                            -translate-x-1/2

                            items-center
                            gap-2
                          "
                        >

                          {heroes.map(
                            (hero, index) => (
                              <button
                                key={hero._id}
                                type="button"
                                onClick={() =>
                                  setHeroIndex(index)
                                }
                                aria-label={`Go to hero banner ${
                                  index + 1
                                }`}
                                className={`
                                  h-2
                                  rounded-full

                                  transition-all
                                  duration-200

                                  ${
                                    index === heroIndex
                                      ? 'w-7 bg-white'
                                      : 'w-2 bg-white/60'
                                  }
                                `}
                              />
                            )
                          )}

                        </div>
                      )}

                    </div>

                  </div>

                </Container>

              </section>
            )}
        {/* =================================================
                FEATURED CATEGORIES
            ================================================= */}

            {categories?.length > 0 && (
              <section className="py-12 sm:py-16">

                <Container>

                  {/* SECTION HEADER */}

                  <div
                    className="
                      mb-6
                      flex
                      flex-col
                      items-start
                      justify-between
                      gap-3

                      sm:mb-7
                      sm:flex-row
                      sm:items-end
                      sm:gap-4
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
                      gap-3

                      sm:grid-cols-3
                      sm:gap-4

                      lg:grid-cols-4
                      lg:gap-5
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

                              aspect-[5/4]

                              overflow-hidden

                              sm:aspect-[4/3]

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
                              p-3
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
                                  hidden
                                  h-8
                                  w-8
                                  sm:flex
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

                p-2.5
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

                    p-3
                    sm:p-4

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
                      w-full
                      flex-wrap
                      items-center
                      gap-2

                      sm:w-auto
                      sm:gap-3
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

                        flex-1
                        px-3
                        py-2

                        text-center
                        text-xs

                        sm:flex-none
                        sm:px-4
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
                  mb-6
                  flex
                  flex-col
                  items-start
                  justify-between
                  gap-3

                  sm:mb-7
                  sm:flex-row
                  sm:items-end
                  sm:gap-4
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
                sm:gap-4

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

                    p-4
                    sm:p-5

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