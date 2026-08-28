import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import filterSearch from '../../utils/filterSearch'
import { useRouter } from 'next/router'

const ProductFilters = ({ state }) => {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('')
  const [category, setCategory] = useState('')

  const { categories } = state
  const router = useRouter()

  useEffect(() => {
    setSearch(
      router.query.search &&
        router.query.search !== 'all'
        ? router.query.search
        : ''
    )

    setSort(router.query.sort || '')

    setCategory(router.query.category || '')
  }, [
    router.query.search,
    router.query.sort,
    router.query.category,
  ])

  const fieldClass = `
    h-11
    w-full
    min-w-0
    rounded-xl
    border
    border-[var(--nova-border)]
    bg-[var(--nova-surface)]
    px-3
    text-sm
    text-[var(--nova-text)]
    outline-none
    transition-all
    duration-200
    placeholder:text-[var(--nova-muted)]
    hover:border-[var(--nova-violet-light)]
    focus:border-[var(--nova-primary)]
    focus:ring-2
    focus:ring-[rgba(139,92,246,0.12)]
  `

  return (
    <div className="w-full">

      {/* =====================================================
          MOBILE FILTER BAR
          Compact single-line layout
      ===================================================== */}

      <div className="flex h-11 w-full items-center gap-2 md:hidden">

        {/* SEARCH */}

        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            strokeWidth={2}
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-[var(--nova-muted)]
            "
          />

          <input
            id="product-search-mobile"
            type="search"
            autoComplete="off"
            value={search}
            onChange={(event) => {
              const value = event.target.value

              setSearch(value)

              filterSearch({
                router,
                search: value
                  ? value.toLowerCase()
                  : 'all',
              })
            }}
            placeholder="Search..."
            className="
              h-11
              w-full
              min-w-0
              rounded-xl
              border
              border-[var(--nova-border)]
              bg-[var(--nova-surface)]
              pl-9
              pr-3
              text-sm
              text-[var(--nova-text)]
              outline-none
              transition-all
              duration-200
              placeholder:text-[var(--nova-muted)]
              hover:border-[var(--nova-violet-light)]
              focus:border-[var(--nova-primary)]
              focus:ring-2
              focus:ring-[rgba(139,92,246,0.12)]
            "
          />
        </div>

        {/* CATEGORY */}

        <div className="relative w-[92px] shrink-0">
          <select
            id="product-category-mobile"
            aria-label="Filter by category"
            className="
              h-11
              w-full
              appearance-none
              rounded-xl
              border
              border-[var(--nova-border)]
              bg-[var(--nova-surface)]
              px-2.5
              pr-7
              text-xs
              font-semibold
              text-[var(--nova-text)]
              outline-none
              transition-all
              hover:border-[var(--nova-violet-light)]
              focus:border-[var(--nova-primary)]
              focus:ring-2
              focus:ring-[rgba(139,92,246,0.12)]
            "
            value={category}
            onChange={(event) => {
              setCategory(event.target.value)

              filterSearch({
                router,
                category: event.target.value,
              })
            }}
          >
            <option value="all">Filter</option>

            {categories
              .filter(
                (item) =>
                  item &&
                  item._id &&
                  typeof item.name === 'string'
              )
              .map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.name}
                </option>
              ))}
          </select>

          <SlidersHorizontal
            size={14}
            className="
              pointer-events-none
              absolute
              right-2.5
              top-1/2
              -translate-y-1/2
              text-[var(--nova-muted)]
            "
          />
        </div>

        {/* SORT */}

        <div className="relative w-[78px] shrink-0">
          <select
            id="product-sort-mobile"
            aria-label="Sort products"
            className="
              h-11
              w-full
              appearance-none
              rounded-xl
              border
              border-[var(--nova-border)]
              bg-[var(--nova-surface)]
              px-2.5
              pr-6
              text-xs
              font-semibold
              text-[var(--nova-text)]
              outline-none
              transition-all
              hover:border-[var(--nova-violet-light)]
              focus:border-[var(--nova-primary)]
              focus:ring-2
              focus:ring-[rgba(139,92,246,0.12)]
            "
            value={sort}
            onChange={(event) => {
              setSort(event.target.value)

              filterSearch({
                router,
                sort: event.target.value,
              })
            }}
          >
            <option value="-createdAt">Sort</option>
            <option value="-createdAt">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="-sold">Best sales</option>
            <option value="-price">High-Low</option>
            <option value="price">Low-High</option>
          </select>

          <span
            className="
              pointer-events-none
              absolute
              right-2
              top-1/2
              -translate-y-1/2
              text-[10px]
              text-[var(--nova-muted)]
            "
          >
            ▾
          </span>
        </div>

      </div>


      {/* =====================================================
          TABLET + DESKTOP FILTERS
          Existing full layout
      ===================================================== */}

      <div
        className="
          hidden
          grid-cols-1
          gap-3
          md:grid
          md:grid-cols-12
          md:gap-3
        "
      >

        {/* SEARCH */}

        <div className="min-w-0 md:col-span-5">
          <label
            htmlFor="product-search"
            className="
              mb-1.5
              block
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-[var(--nova-muted)]
            "
          >
            Search products
          </label>

          <div className="relative w-full">
            <Search
              size={16}
              strokeWidth={2}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                z-10
                -translate-y-1/2
                text-[var(--nova-muted)]
              "
            />

            <input
              id="product-search"
              type="search"
              autoComplete="off"
              value={search}
              onChange={(event) => {
                const value = event.target.value

                setSearch(value)

                filterSearch({
                  router,
                  search: value
                    ? value.toLowerCase()
                    : 'all',
                })
              }}
              placeholder="Search products..."
              className={`
                ${fieldClass}
                pl-10
                pr-4
              `}
            />
          </div>
        </div>


        {/* CATEGORY */}

        <div className="min-w-0 md:col-span-4">
          <label
            htmlFor="product-category"
            className="
              mb-1.5
              block
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-[var(--nova-muted)]
            "
          >
            Category
          </label>

          <select
            id="product-category"
            className={`
              ${fieldClass}
              cursor-pointer
              capitalize
            `}
            value={category}
            onChange={(event) => {
              setCategory(event.target.value)

              filterSearch({
                router,
                category: event.target.value,
              })
            }}
          >
            <option value="all">
              All Categories
            </option>

            {categories
              .filter(
                (item) =>
                  item &&
                  item._id &&
                  typeof item.name === 'string'
              )
              .map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.name}
                </option>
              ))}
          </select>
        </div>


        {/* SORT */}

        <div className="min-w-0 md:col-span-3">
          <label
            htmlFor="product-sort"
            className="
              mb-1.5
              block
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-[var(--nova-muted)]
            "
          >
            Sort by
          </label>

          <select
            id="product-sort"
            className={`
              ${fieldClass}
              cursor-pointer
            `}
            value={sort}
            onChange={(event) => {
              setSort(event.target.value)

              filterSearch({
                router,
                sort: event.target.value,
              })
            }}
          >
            <option value="-createdAt">
              Newest
            </option>

            <option value="oldest">
              Oldest
            </option>

            <option value="-sold">
              Best sales
            </option>

            <option value="-price">
              Price: High-Low
            </option>

            <option value="price">
              Price: Low-High
            </option>
          </select>
        </div>

      </div>

    </div>
  )
}

export default ProductFilters