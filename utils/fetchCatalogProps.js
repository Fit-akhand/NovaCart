import { getData } from '@/lib/api-client'

export async function fetchCatalogProps(query = {}) {
  const page = query.page || 1
  const category = query.category || 'all'
  const sort = query.sort || ''
  const search = query.search || 'all'

  try {
    const res = await getData(
      `product?limit=${page * 6}&category=${category}&sort=${sort}&title=${search}`
    )

    return {
      products: res?.products || [],
      result: res?.result || 0,
    }
  } catch (error) {
    console.error('Catalog product fetch error:', error)
    return {
      products: [],
      result: 0,
    }
  }
}
