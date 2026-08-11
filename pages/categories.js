```jsx
import Head from 'next/head'
import { useContext, useMemo, useState } from 'react'
import { DataContext } from '../store/GlobalState'
import { updateItem } from '../store/Actions'
import { postData, putData } from '../utils/fetchData'
import {
  Check,
  Edit3,
  FolderOpen,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react'

const Categories = () => {
  const [name, setName] = useState('')
  const [id, setId] = useState('')
  const [search, setSearch] = useState('')

  const { state, dispatch } = useContext(DataContext)
  const { categories, auth } = state

  const createCategory = async () => {
    if (auth.user.role !== 'admin')
      return dispatch({
        type: 'NOTIFY',
        payload: { error: 'Authentication is not valid.' },
      })

    if (!name.trim())
      return dispatch({
        type: 'NOTIFY',
        payload: { error: 'Name cannot be left blank.' },
      })

    dispatch({
      type: 'NOTIFY',
      payload: { loading: true },
    })

    let res

    if (id) {
      res = await putData(
        `categories/${id}`,
        { name: name.trim() },
        auth.token
      )

      if (res.err)
        return dispatch({
          type: 'NOTIFY',
          payload: { error: res.err },
        })

      dispatch(
        updateItem(
          categories,
          id,
          res.category,
          'ADD_CATEGORIES'
        )
      )
    } else {
      res = await postData(
        'categories',
        { name: name.trim() },
        auth.token
      )

      if (res.err)
        return dispatch({
          type: 'NOTIFY',
          payload: { error: res.err },
        })

      dispatch({
        type: 'ADD_CATEGORIES',
        payload: [...categories, res.newCategory],
      })
    }

    setName('')
    setId('')

    return dispatch({
      type: 'NOTIFY',
      payload: { success: res.msg },
    })
  }

  const handleEditCategory = (category) => {
    setId(category._id)
    setName(category.name)
  }

  const cancelEdit = () => {
    setId('')
    setName('')
  }

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [categories, search])

  return (
    <>
      <Head>
        <title>Categories | NovaCart Admin</title>
        <meta
          name="description"
          content="Manage NovaCart product categories."
        />
      </Head>

      <main className="min-h-screen bg-[#f8f8f8] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                  <Tag size={15} />
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  NovaCart Admin
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                Categories
              </h1>

              <p className="mt-2 max-w-xl text-sm text-gray-500">
                Organize your products into clean, easy-to-discover
                categories.
              </p>
            </div>

            {/* Category count */}
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <FolderOpen size={19} className="text-gray-700" />
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Total Categories
                </p>

                <p className="text-xl font-semibold text-gray-900">
                  {categories.length}
                </p>
              </div>
            </div>
          </div>

          {/* Create / Edit Card */}
          <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                  {id ? (
                    <Edit3 size={17} />
                  ) : (
                    <Plus size={18} />
                  )}
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {id
                      ? 'Edit Category'
                      : 'Create Category'}
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-400">
                    {id
                      ? 'Update the selected category.'
                      : 'Add a new product category.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Tag
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="Enter category name..."
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        createCategory()
                      }
                    }}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
                  />
                </div>

                <button
                  onClick={createCategory}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.98]"
                >
                  {id ? (
                    <>
                      <Check size={17} />
                      Update
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create
                    </>
                  )}
                </button>

                {id && (
                  <button
                    onClick={cancelEdit}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    <X size={17} />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Search */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                All Categories
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                {filteredCategories.length} categories shown
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5"
              />
            </div>
          </div>

          {/* Category List */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {filteredCategories.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredCategories.map(
                  (category, index) => (
                    <div
                      key={category._id}
                      className="group flex items-center justify-between px-5 py-4 transition hover:bg-gray-50 sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        {/* Number */}
                        <span className="hidden w-6 text-xs font-medium text-gray-300 sm:block">
                          {String(index + 1).padStart(
                            2,
                            '0'
                          )}
                        </span>

                        {/* Icon */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 transition group-hover:bg-black group-hover:text-white">
                          <FolderOpen size={17} />
                        </div>

                        {/* Name */}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold capitalize text-gray-900">
                            {category.name}
                          </p>

                          <p className="mt-0.5 text-[11px] text-gray-400">
                            Product category
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-4 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleEditCategory(category)
                          }
                          aria-label={`Edit ${category.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          type="button"
                          aria-label={`Delete ${category.name}`}
                          data-toggle="modal"
                          data-target="#exampleModal"
                          onClick={() =>
                            dispatch({
                              type: 'ADD_MODAL',
                              payload: [
                                {
                                  data: categories,
                                  id: category._id,
                                  title: category.name,
                                  type: 'ADD_CATEGORIES',
                                },
                              ],
                            })
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <FolderOpen
                    size={27}
                    className="text-gray-400"
                  />
                </div>

                <h3 className="text-base font-semibold text-gray-900">
                  No categories found
                </h3>

                <p className="mt-2 max-w-sm text-sm text-gray-400">
                  {search
                    ? `No category matches "${search}".`
                    : 'Create your first category to start organizing products.'}
                </p>

                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="mt-5 rounded-lg bg-black px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-800"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Footer hint */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <Check size={13} />
            Changes are synced with your NovaCart catalog
          </div>
        </div>
      </main>
    </>
  )
}

export default Categories
```
