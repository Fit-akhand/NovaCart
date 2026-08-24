import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
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

  /* =====================================================
     COMMON FIELD STYLE
     Used by search, category and sort.
  ===================================================== */

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
    <div
      className="
        grid
        grid-cols-1
        gap-4

        md:grid-cols-12
        md:gap-3
      "
    >

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="md:col-span-5">

        <label
          htmlFor="product-search"
          className="
            mb-2
            block

            text-xs
            font-semibold
            uppercase
            tracking-wide

            text-[var(--nova-muted)]
          "
        >
          Search products
        </label>

        <div className="relative w-full">

          {/* Search icon */}

          <Search
            size={17}
            strokeWidth={2}
            className="
              pointer-events-none

              absolute
              left-3.5
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
              const value =
                event.target.value

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

              pl-11
              pr-10
            `}
          />

        </div>
      </div>

      {/* =================================================
          CATEGORY
      ================================================= */}

      <div className="md:col-span-4">

        <label
          htmlFor="product-category"
          className="
            mb-2
            block

            text-xs
            font-semibold
            uppercase
            tracking-wide

            text-[var(--nova-muted)]
          "
        >
          Category
        </label>

        <select
          id="product-category"
          className={`
            ${fieldClass}

            capitalize

            cursor-pointer
          `}
          value={category}
          onChange={(event) => {
            setCategory(
              event.target.value
            )

            filterSearch({
              router,
              category:
                event.target.value,
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
                typeof item.name ===
                  'string'
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

      {/* =================================================
          SORT
      ================================================= */}

      <div className="md:col-span-3">

        <label
          htmlFor="product-sort"
          className="
            mb-2
            block

            text-xs
            font-semibold
            uppercase
            tracking-wide

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
            setSort(
              event.target.value
            )

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
  )
}

export default ProductFilters