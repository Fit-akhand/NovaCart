import { getData } from '@/lib/api-client'

export async function fetchCatalogProps(
  query = {},
  baseUrl = null
) {
  const category = query.category || 'all'
  const sort = query.sort || ''
  const search = query.search || 'all'

  try {
    const res = await getData(
      `product?limit=1000&category=${encodeURIComponent(
        category
      )}&sort=${encodeURIComponent(
        sort
      )}&title=${encodeURIComponent(
        search
      )}`,
      '',
      baseUrl
    )

    return {
      products: Array.isArray(res?.products)
        ? res.products
        : [],

      result: Number(res?.result) || 0,
    }
  } catch (error) {
    console.error(
      'Catalog product fetch error:',
      error
    )

    return {
      products: [],
      result: 0,
    }
  }
}