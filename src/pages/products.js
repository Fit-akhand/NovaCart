import Head from 'next/head'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '../../store/GlobalState'
import { useRouter } from 'next/router'
import filterSearch from '../../utils/filterSearch'
import { fetchCatalogProps } from '../../utils/fetchCatalogProps'
import ProductGrid from '../../components/product/ProductGrid'
import ProductFilters from '../../components/product/ProductFilters'
import Pagination from '../../components/common/Pagination'
import EmptyState from '../../components/common/EmptyState'
import Container from '../../components/common/Container'
import Button from '../../components/common/Button'
import { Trash2, SlidersHorizontal, Sparkles, Search } from 'lucide-react'

const Products = (props) => {
  const [products, setProducts] = useState(
    props.products || []
  )

  const [isCheck, setIsCheck] = useState(false)
  const [page, setPage] = useState(
    Number(props.page) || 1
  )

  const router = useRouter()

  const { state, dispatch } =
    useContext(DataContext)

  const { auth } = state

  useEffect(() => {
    setProducts(props.products || [])
  }, [props.products])

  useEffect(() => {
    if (
      Object.keys(router.query).length === 0
    ) {
      setPage(1)
    }
  }, [router.query])

  /* =====================================================
     PRODUCT SELECTION
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

  /* =====================================================
     DELETE SELECTED
  ===================================================== */

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

  /* =====================================================
     LOAD MORE
  ===================================================== */

  const handleLoadmore = () => {
    const nextPage = page + 1

    setPage(nextPage)

    filterSearch({
      router,
      page: nextPage,
    })
  }

  const selectedCount =
    products.filter(
      (product) => product.checked
    ).length

  return (
    <>
      <Head>
        <title>Products | NovaCart</title>
      </Head>

      <main
        className="
          min-h-screen
          bg-[var(--nova-bg)]
          py-8
          sm:py-10
          lg:py-12
        "
      >
        <Container>

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section
            className="
              relative
              mb-7
              overflow-hidden

              rounded-3xl

              border
              border-[var(--nova-border)]

              bg-[var(--nova-surface)]

              px-5
              py-7

              shadow-[var(--shadow-md)]

              sm:px-7
              sm:py-8
            "
          >

            {/* Violet glow */}

            <div
              className="
                pointer-events-none
                absolute
                -right-20
                -top-24

                h-56
                w-56

                rounded-full

                bg-[rgba(139,92,246,0.12)]

                blur-3xl
              "
            />

            <div className="relative">

              <div
                className="
                  mb-3
                  inline-flex
                  items-center
                  gap-2

                  rounded-full

                  border
                  border-[rgba(139,92,246,0.18)]

                  bg-[var(--nova-lavender-soft)]

                  px-3
                  py-1.5

                  text-xs
                  font-semibold

                  text-[var(--nova-primary)]
                "
              >
                <Sparkles size={13} />

                NOVACART CATALOG
              </div>

              <h1
                className="
                  text-3xl
                  font-bold
                  tracking-[-0.03em]

                  text-[var(--nova-text)]

                  sm:text-4xl
                "
              >
                Explore products
              </h1>

              <p
                className="
                  mt-2
                  max-w-2xl

                  text-sm
                  leading-6

                  text-[var(--nova-muted)]

                  sm:text-base
                "
              >
                Search, filter, and sort the
                NovaCart catalog to find exactly
                what you're looking for.
              </p>

              {/* Result count */}

              <div
                className="
                  mt-5
                  inline-flex
                  items-center

                  rounded-xl

                  border
                  border-[var(--nova-border)]

                  bg-[var(--nova-surface-soft)]

                  px-3
                  py-2

                  text-xs
                  font-medium

                  text-[var(--nova-muted)]
                "
              >
                <span
                  className="
                    mr-1.5
                    font-semibold
                    text-[var(--nova-text)]
                  "
                >
                  {props.result || 0}
                </span>

                products available
              </div>

            </div>
          </section>

          {/* =================================================
              FILTERS
          ================================================= */}

          <section
            className="
              mb-6

              overflow-hidden

              rounded-3xl

              border
              border-[var(--nova-border)]

              bg-[var(--nova-surface)]

              shadow-[var(--shadow-md)]
            "
          >

            <div
              className="
                flex
                items-center
                gap-2

                border-b
                border-[var(--nova-border)]

                px-4
                py-3

                text-sm
                font-semibold

                text-[var(--nova-text)]
              "
            >
              <SlidersHorizontal
                size={17}
                className="
                  text-[var(--nova-primary)]
                "
              />

              Filter & sort
            </div>

            <div className="p-3 sm:p-5">
              <ProductFilters
                state={state}
              />
            </div>

          </section>

          {/* =================================================
              ADMIN PRODUCT MANAGEMENT
          ================================================= */}

          {auth.user &&
            auth.user.role === 'admin' && (
              <section
                className="
                  mb-6

                  flex
                  flex-col
                  gap-4

                  rounded-3xl

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
                      ? `${selectedCount} selected`
                      : 'Select products to delete'}
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

                  {/* SELECT ALL */}

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
                      py-2.5

                      text-sm
                      font-medium

                      text-[var(--nova-text)]

                      transition-colors
                      duration-200

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
                        h-4
                        w-4
                        accent-[var(--nova-primary)]
                      "
                    />

                    Select all
                  </label>

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={
                      handleDeleteAll
                    }
                    disabled={
                      selectedCount === 0
                    }
                    className="
                      inline-flex
                      min-h-11
                      items-center
                      gap-2

                      rounded-xl

                      bg-[var(--nova-danger)]

                      px-4

                      text-sm
                      font-semibold
                      text-white

                      transition-all
                      duration-200

                      shadow-[0_6px_18px_rgba(239,68,68,0.14)]

                      hover:opacity-90

                      active:scale-[0.98]

                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <Trash2 size={15} />

                    Delete selected
                  </button>

                </div>
              </section>
            )}

          {/* =================================================
              PRODUCTS
          ================================================= */}

          {products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="We could not find products matching your filters."
              action={
                <Button
                  variant="secondary"
                  onClick={() =>
                    router.push('/products')
                  }
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <section>

              {/* Product heading */}

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
                    Discover
                  </p>

                  <h2
                    className="
                      mt-1
                      text-xl
                      font-bold
                      tracking-tight

                      text-[var(--nova-text)]

                      sm:text-2xl
                    "
                  >
                    All products
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
                  Page {page}
                </p>

              </div>

              <ProductGrid
                products={products}
                handleCheck={handleCheck}
              />

            </section>
          )}

          {/* =================================================
              PAGINATION
          ================================================= */}

          <div
            className="
              mt-8
              flex
              justify-center
            "
          >
            <Pagination
              hasMore={
                props.result >= page * 6 &&
                products.length > 0
              }
              onLoadMore={handleLoadmore}
            />
          </div>

        </Container>
      </main>
    </>
  )
}

export async function getServerSideProps({
  query,
}) {
  const props =
    await fetchCatalogProps(query)

  return {
    props: {
      ...props,
      page: query.page || 1,
    },
  }
}

export default Products