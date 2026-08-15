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
import { Trash2 } from 'lucide-react'

const Products = (props) => {
  const [products, setProducts] = useState(props.products || [])
  const [isCheck, setIsCheck] = useState(false)
  const [page, setPage] = useState(Number(props.page) || 1)
  const router = useRouter()
  const { state, dispatch } = useContext(DataContext)
  const { auth } = state

  useEffect(() => {
    setProducts(props.products || [])
  }, [props.products])

  useEffect(() => {
    if (Object.keys(router.query).length === 0) setPage(1)
  }, [router.query])

  const handleCheck = (id) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === id ? { ...product, checked: !product.checked } : product
      )
    )
  }

  const handleCheckALL = () => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => ({ ...product, checked: !isCheck }))
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
        payload: { error: 'Please select at least one product.' },
      })
    }

    dispatch({ type: 'ADD_MODAL', payload: deleteArr })
  }

  const handleLoadmore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    filterSearch({ router, page: nextPage })
  }

  const selectedCount = products.filter((product) => product.checked).length

  return (
    <>
      <Head>
        <title>Products | NovaCart</title>
      </Head>

      <main className="py-8 sm:py-10">
        <Container>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nova-muted)]">
              Catalog
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Products</h1>
            <p className="mt-2 text-sm text-[var(--nova-muted)]">
              Search, filter, and sort the NovaCart catalog.
            </p>
          </div>

          <div className="mb-5 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-4 sm:p-5">
            <ProductFilters state={state} />
          </div>

          {auth.user && auth.user.role === 'admin' && (
            <div className="mb-5 flex flex-col gap-4 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--nova-muted)]">
                {selectedCount > 0
                  ? `${selectedCount} selected`
                  : 'Select products to delete'}
              </p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isCheck} onChange={handleCheckALL} />
                  Select all
                </label>
                <button
                  type="button"
                  onClick={handleDeleteAll}
                  disabled={selectedCount === 0}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--nova-danger)] px-4 text-sm font-semibold text-white disabled:opacity-40"
                >
                  <Trash2 size={14} />
                  Delete selected
                </button>
              </div>
            </div>
          )}

          {products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="We could not find products matching your filters."
              action={
                <Button variant="secondary" onClick={() => router.push('/products')}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <ProductGrid products={products} handleCheck={handleCheck} />
          )}

          <Pagination
            hasMore={props.result >= page * 6 && products.length > 0}
            onLoadMore={handleLoadmore}
          />
        </Container>
      </main>
    </>
  )
}

export async function getServerSideProps({ query }) {
  const props = await fetchCatalogProps(query)
  return { props: { ...props, page: query.page || 1 } }
}

export default Products
