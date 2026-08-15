import Head from 'next/head'
import Link from 'next/link'
import { useContext, useMemo, useState } from 'react'
import { DataContext } from '../../store/GlobalState'
import { updateItem } from '../../store/Actions'
import { postData, putData } from '@/lib/api-client'
import Container from '../../components/common/Container'
import EmptyState from '../../components/common/EmptyState'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Edit3, FolderOpen, Search, Trash2 } from 'lucide-react'

const Categories = () => {
  const [name, setName] = useState('')
  const [id, setId] = useState('')
  const [search, setSearch] = useState('')
  const { state, dispatch } = useContext(DataContext)
  const { categories, auth } = state
  const isAdmin = auth?.user?.role === 'admin'

  const createCategory = async () => {
    if (auth.user.role !== 'admin') {
      return dispatch({
        type: 'NOTIFY',
        payload: { error: 'Authentication is not valid.' },
      })
    }

    if (!name.trim()) {
      return dispatch({
        type: 'NOTIFY',
        payload: { error: 'Name cannot be left blank.' },
      })
    }

    dispatch({ type: 'NOTIFY', payload: { loading: true } })

    let res
    if (id) {
      res = await putData(`categories/${id}`, { name: name.trim() }, auth.token)
      if (res.err) return dispatch({ type: 'NOTIFY', payload: { error: res.err } })
      dispatch(updateItem(categories, id, res.category, 'ADD_CATEGORIES'))
    } else {
      res = await postData('categories', { name: name.trim() }, auth.token)
      if (res.err) return dispatch({ type: 'NOTIFY', payload: { error: res.err } })
      dispatch({ type: 'ADD_CATEGORIES', payload: [...categories, res.newCategory] })
    }

    setName('')
    setId('')
    return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
  }

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [categories, search])

  return (
    <>
      <Head>
        <title>{isAdmin ? 'Categories | NovaCart Admin' : 'Categories | NovaCart'}</title>
      </Head>

      <main className="py-8 sm:py-10">
        <Container>
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nova-muted)]">
              {isAdmin ? 'Admin' : 'Shop'}
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Categories</h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--nova-muted)]">
              {isAdmin
                ? 'Create and organize product categories.'
                : 'Browse the catalog by category.'}
            </p>
          </div>

          {!isAdmin && (
            filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/products?category=${category._id}`}
                    className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-6 hover:border-[var(--nova-blue)]"
                  >
                    <p className="text-lg font-semibold capitalize">{category.name}</p>
                    <p className="mt-1 text-sm text-[var(--nova-muted)]">View products</p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No categories yet"
                description="Categories will appear here once they are added."
              />
            )
          )}

          {isAdmin && (
            <>
              <section className="mb-6 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5">
                <h2 className="mb-4 text-sm font-semibold">{id ? 'Edit category' : 'Create category'}</h2>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    id="category-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter category name..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') createCategory()
                    }}
                  />
                  <Button onClick={createCategory}>
                    {id ? 'Update' : 'Create'}
                  </Button>
                  {id && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setId('')
                        setName('')
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </section>

              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold">All categories</h2>
                <div className="relative w-full sm:w-72">
                  <Search
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
                  />
                  <input
                    type="search"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] pl-11 pr-4 text-sm outline-none focus:border-[var(--nova-blue)]"
                  />
                </div>
              </div>

              <section className="overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">
                {filteredCategories.length > 0 ? (
                  <div className="divide-y divide-[var(--nova-border)]">
                    {filteredCategories.map((category) => (
                      <div key={category._id} className="flex items-center justify-between px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <FolderOpen size={18} className="text-[var(--nova-muted)]" />
                          <p className="truncate font-semibold capitalize">{category.name}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label={`Edit ${category.name}`}
                            onClick={() => {
                              setId(category._id)
                              setName(category.name)
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[var(--nova-surface-soft)]"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${category.name}`}
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
                            className="flex h-10 w-10 items-center justify-center rounded-lg hover:text-[var(--nova-danger)]"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No categories found"
                    description={search ? `No category matches "${search}".` : 'Create your first category.'}
                  />
                )}
              </section>
            </>
          )}
        </Container>
      </main>
    </>
  )
}

export default Categories
