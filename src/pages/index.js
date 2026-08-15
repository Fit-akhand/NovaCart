import Head from 'next/head'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '../../store/GlobalState'
import { getData } from '../../utils/fetchData'
import ProductItem from '../../components/product/ProductItem'
import filterSearch from '../../utils/filterSearch'
import { useRouter } from 'next/router'
import Filter from '../../components/Filter'
import {
  Check,
  Package,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'

const Home = (props) => {
  const [products, setProducts] = useState(props.products || [])
  const [isCheck, setIsCheck] = useState(false)
  const [page, setPage] = useState(1)

  const router = useRouter()

  const { state, dispatch } = useContext(DataContext)
  const { auth } = state

  useEffect(() => {
    setProducts(props.products || [])
  }, [props.products])

  useEffect(() => {
    if (Object.keys(router.query).length === 0) {
      setPage(1)
    }
  }, [router.query])

  // Select / unselect product
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

  // Select / unselect all
  const handleCheckALL = () => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => ({
        ...product,
        checked: !isCheck,
      }))
    )

    setIsCheck(!isCheck)
  }

  // Delete selected products
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
          error: 'Please select at least one product.',
        },
      })
    }

    dispatch({
      type: 'ADD_MODAL',
      payload: deleteArr,
    })
  }

  // Load more products
  const handleLoadmore = () => {
    const nextPage = page + 1

    setPage(nextPage)

    filterSearch({
      router,
      page: nextPage,
    })
  }

  const selectedCount = products.filter(
    (product) => product.checked
  ).length

  return (
    <>
      <Head>
        <title>NovaCart — Discover Something Better</title>

        <meta
          name="description"
          content="Discover the latest products, trending collections and exclusive deals on NovaCart."
        />
      </Head>

      <main className="min-h-screen w-full bg-slate-50">

        <section className="relative w-full overflow-hidden border-b border-slate-200 bg-white">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-60 blur-3xl"
            style={{ backgroundColor: 'var(--nova-blue-soft)' }}
          />

          <div className="relative w-full px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

            <div className="max-w-3xl">

              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium"
                style={{
                  borderColor: 'var(--nova-border)',
                  backgroundColor: 'var(--nova-blue-soft)',
                  color: 'var(--nova-navy-light)',
                }}
              >
                <Sparkles size={13} />
                Curated for you
              </div>

              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[var(--nova-navy)] sm:text-5xl lg:text-6xl">
                Discover products
                <br />
                <span className="text-slate-400">
                  worth adding to your life.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Explore our latest collection of thoughtfully
                selected products, trending essentials and
                everyday favorites.
              </p>

            </div>

            <div className="mt-9 flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Package size={17} />
                <span>
                  <strong className="text-[var(--nova-navy)]">
                    {props.result || 0}
                  </strong>{' '}
                  products
                </span>
              </div>
              <div className="hidden h-4 w-px bg-slate-200 sm:block" />
              <div className="flex items-center gap-2 text-slate-500">
                <Check size={16} />
                Quality products
              </div>
              <div className="hidden h-4 w-px bg-slate-200 sm:block" />
              <div className="flex items-center gap-2 text-slate-500">
                <Sparkles size={16} />
                New arrivals
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('browse-products')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
                className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--nova-blue)' }}
              >
                Browse Products
              </button>
            </div>
          </div>
        </section>

        <section
          id="browse-products"
          className="w-full px-4 pt-7 sm:px-6 lg:px-8"
        >
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
              <Search size={17} className="text-[var(--nova-blue)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--nova-navy)]">
                  Browse Products
                </p>
                <p className="text-xs text-slate-400">
                  Filter and sort the collection
                </p>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <Filter state={state} />
            </div>
          </div>
        </section>

        {/* =====================================================
            ADMIN BULK ACTION
        ====================================================== */}

        {auth.user &&
          auth.user.role === 'admin' && (

            <section className="w-full px-4 pt-5 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 rounded-lg border border-red-100 bg-red-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-500">
                    <Trash2 size={17} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-gray-900">
                      Product management
                    </p>

                    <p className="text-xs text-gray-500">
                      {selectedCount > 0
                        ? `${selectedCount} product${selectedCount === 1 ? '' : 's'} selected`
                        : 'Select products to perform bulk actions'}
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600">

                    <input
                      type="checkbox"
                      checked={isCheck}
                      onChange={handleCheckALL}
                      className="h-4 w-4 rounded border-gray-300 accent-black"
                    />

                    Select all

                  </label>

                  <button
                    type="button"
                    data-toggle="modal"
                    data-target="#exampleModal"
                    onClick={handleDeleteAll}
                    disabled={selectedCount === 0}
                    className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    <Trash2 size={14} />

                    Delete selected

                  </button>

                </div>

              </div>

            </section>
          )}

        {/* =====================================================
            PRODUCT GRID
        ====================================================== */}

        <section className="w-full px-4 py-8 sm:px-6 lg:px-8">

          {products.length === 0 ? (

            /* EMPTY STATE */

            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-center">

              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">

                <Package
                  size={28}
                  className="text-gray-400"
                />

              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                No products found
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">
                We couldn't find any products matching
                your current filters. Try changing your
                search or category.
              </p>

              <button
                onClick={() => router.push('/')}
                className="mt-6 rounded-lg px-5 py-3 text-xs font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--nova-blue)' }}
              >
                View all products
              </button>

            </div>

          ) : (

            <>

              {/* Product heading */}

              <div className="mb-5 flex items-end justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Collection
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
                    Explore our products
                  </h2>

                </div>

                <p className="hidden text-xs text-gray-400 sm:block">
                  Showing {products.length} of{' '}
                  {props.result || 0}
                </p>

              </div>

              {/* Grid */}

              <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {products.map((product) => (

                  <ProductItem
                    key={product._id}
                    product={product}
                    handleCheck={handleCheck}
                  />

                ))}

              </div>

            </>

          )}

        </section>

        {/* =====================================================
            LOAD MORE
        ====================================================== */}

        {props.result >= page * 6 &&
          products.length > 0 && (

            <div className="pb-12 text-center">

              <button
                type="button"
                onClick={handleLoadmore}
                className="group inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-7 py-3.5 text-sm font-medium text-[var(--nova-navy)] transition hover:border-[var(--nova-blue)] hover:text-[var(--nova-blue)]"
              >

                Load more

                <span className="transition-transform group-hover:translate-y-0.5">
                  ↓
                </span>

              </button>

            </div>
          )}

      </main>
    </>
  )
}

export async function getServerSideProps({ query }) {
  const page = query.page || 1
  const category = query.category || 'all'
  const sort = query.sort || ''
  const search = query.search || 'all'

  try {
    const res = await getData(
      `product?limit=${page * 6}&category=${category}&sort=${sort}&title=${search}`
    )

    return {
      props: {
        products: res?.products || [],
        result: res?.result || 0,
      },
    }
  } catch (error) {
    console.error('Home page product fetch error:', error)

    return {
      props: {
        products: [],
        result: 0,
      },
    }
  }
}

export default Home