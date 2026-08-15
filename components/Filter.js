import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import filterSearch from '../utils/filterSearch'
import { useRouter } from 'next/router'

const Filter = ({ state }) => {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('')
  const [category, setCategory] = useState('')

  const { categories } = state
  const router = useRouter()

  const handleCategory = (e) => {
    setCategory(e.target.value)
    filterSearch({ router, category: e.target.value })
  }

  const handleSort = (e) => {
    setSort(e.target.value)
    filterSearch({ router, sort: e.target.value })
  }

  useEffect(() => {
    filterSearch({ router, search: search ? search.toLowerCase() : 'all' })
  }, [search])

  const selectClass =
    'h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[var(--nova-blue)] focus:ring-2 focus:ring-blue-100'

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
      <div className="md:col-span-5">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Search products
        </label>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            autoComplete="off"
            list="title_product"
            value={search.toLowerCase()}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--nova-blue)] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="md:col-span-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Category
        </label>
        <select
          className={`${selectClass} capitalize`}
          value={category}
          onChange={handleCategory}
        >
          <option value="all">All Categories</option>
          {categories.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-3">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Sort by
        </label>
        <select
          className={`${selectClass} capitalize`}
          value={sort}
          onChange={handleSort}
        >
          <option value="-createdAt">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="-sold">Best sales</option>
          <option value="-price">Price: High-Low</option>
          <option value="price">Price: Low-High</option>
        </select>
      </div>
    </div>
  )
}

export default Filter
