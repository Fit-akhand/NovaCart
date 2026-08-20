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

import {
  ChevronDown,
  ChevronRight,
  Edit3,
  FolderOpen,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'

const Categories = () => {
  const [name, setName] = useState('')
  const [id, setId] = useState('')
  const [search, setSearch] = useState('')

  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountActive, setDiscountActive] = useState(false)

  const [parentCategory, setParentCategory] = useState('')
  const [openCategories, setOpenCategories] = useState({})

  const { state, dispatch } = useContext(DataContext)

  const {
    categories = [],
    auth,
  } = state

  const isAdmin =
    auth?.user?.role === 'admin'
  // ==========================================
  // PARENT CATEGORIES
  // ==========================================

  const parentCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category &&
        category._id &&
        typeof category.name === 'string' &&
        !category.parentCategory
    )
  }, [categories])

  // ==========================================
  // GET SUBCATEGORIES
  // ==========================================

  const getSubcategories = (parentId) => {
    if (!parentId) return []

    return categories.filter(
      (category) =>
        category &&
        category._id &&
        category.parentCategory &&
        category.parentCategory.toString() ===
          parentId.toString()
    )
  }

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredParentCategories = useMemo(() => {
    const query =
      search.trim().toLowerCase()

    if (!query) {
      return parentCategories
    }

    return parentCategories.filter(
      (parent) => {
        if (
          !parent ||
          typeof parent.name !== 'string'
        ) {
          return false
        }

        const parentMatches =
          parent.name
            .toLowerCase()
            .includes(query)

        const childMatches =
          getSubcategories(parent._id).some(
            (child) =>
              child &&
              typeof child.name === 'string' &&
              child.name
                .toLowerCase()
                .includes(query)
          )

        return (
          parentMatches ||
          childMatches
        )
      }
    )
  }, [
    parentCategories,
    categories,
    search,
  ])

  // ==========================================
  // RESET FORM
  // ==========================================

  /*
   * keepParent = true
   *
   * Used after creating a subcategory.
   *
   * Example:
   *
   * Men's Fashion
   *      ↓
   * Shirts
   *      ↓
   * Create
   *      ↓
   * Parent remains Men's Fashion
   */

  const resetForm = (
    keepParent = false
  ) => {
    setName('')
    setId('')

    if (!keepParent) {
      setParentCategory('')
    }
  }

  // ==========================================
  // SAVE CATEGORY
  // ==========================================

  const saveCategory = async () => {
    if (
      !auth?.user ||
      auth.user.role !== 'admin'
    ) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'Authentication is not valid.',
        },
      })
    }

    if (!name.trim()) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'Name cannot be left blank.',
        },
      })
    }

    dispatch({
      type: 'NOTIFY',
      payload: {
        loading: true,
      },
    })

    try {
      let res

      const editingId = id

      const isCreatingSubcategory =
        !editingId &&
        Boolean(parentCategory)

      // ========================================
      // UPDATE
      // ========================================

      if (editingId) {
        res = await putData(
          `categories/${editingId}`,
          {
            name: name.trim(),
          },
          auth.token
        )

        if (res.err) {
          return dispatch({
            type: 'NOTIFY',
            payload: {
              error: res.err,
            },
          })
        }

        dispatch(
          updateItem(
            categories,
            editingId,
            res.category,
            'ADD_CATEGORIES'
          )
        )

        /*
         * After editing:
         *
         * Keep parent selected if editing
         * a subcategory.
         */

        const updatedParent =
          res.category?.parentCategory

        if (updatedParent) {
          setParentCategory(
            updatedParent.toString()
          )
        } else {
          setParentCategory('')
        }

        setName('')
        setId('')

        return dispatch({
          type: 'NOTIFY',
          payload: {
            success:
              res.msg ||
              'Category updated successfully.',
          },
        })
      }

      // ========================================
      // CREATE
      // ========================================

      res = await postData(
        'categories',
        {
          name: name.trim(),
          parentCategory:
            parentCategory || null,
        },
        auth.token
      )

      if (res.err) {
        return dispatch({
          type: 'NOTIFY',
          payload: {
            error: res.err,
          },
        })
      }

      /*
       * Add the new category locally.
       */

      if (res.newCategory) {
        dispatch({
          type: 'ADD_CATEGORIES',
          payload: [
            ...categories,
            res.newCategory,
          ],
        })
      }

      // ========================================
      // IMPORTANT
      // ========================================

      /*
       * If creating a subcategory:
       *
       * KEEP the parent selected.
       *
       * This allows:
       *
       * Shirts
       * T-Shirts
       * Jeans
       * Jackets
       *
       * to be created continuously.
       */

      if (isCreatingSubcategory) {
        const selectedParent =
          parentCategory

        setName('')
        setId('')

        setParentCategory(
          selectedParent
        )

        /*
         * Automatically expand parent.
         */

        setOpenCategories(
          (previous) => ({
            ...previous,
            [selectedParent]: true,
          })
        )
      } else {
        /*
         * Normal category creation.
         * Clear parent selection.
         */

        resetForm(false)
      }

      return dispatch({
        type: 'NOTIFY',
        payload: {
          success:
            res.msg ||
            (
              isCreatingSubcategory
                ? 'Successfully created subcategory.'
                : 'Successfully created category.'
            ),
        },
      })
    } catch (error) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            error.message ||
            'Something went wrong.',
        },
      })
    }
  }

  // ==========================================
  // EDIT CATEGORY
  // ==========================================

  const editCategory = (category) => {
    if (!category) return

    setId(category._id)

    setName(
      typeof category.name === 'string'
        ? category.name
        : ''
    )

    /*
     * IMPORTANT:
     *
     * Existing subcategory automatically
     * gets its parent selected.
     */

    if (category.parentCategory) {
      setParentCategory(
        category.parentCategory.toString()
      )

      /*
       * Expand parent automatically.
       */

      setOpenCategories(
        (previous) => ({
          ...previous,
          [category.parentCategory.toString()]:
            true,
        })
      )
    } else {
      setParentCategory('')
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // ==========================================
  // START CREATE SUBCATEGORY
  // ==========================================

  const startCreateSubcategory = (
    parentId
  ) => {
    if (!parentId) return

    setId('')
    setName('')

    /*
     * Keep selected parent.
     */

    setParentCategory(
      parentId.toString()
    )

    /*
     * Expand parent.
     */

    setOpenCategories(
      (previous) => ({
        ...previous,
        [parentId.toString()]: true,
      })
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // ==========================================
  // TOGGLE CATEGORY
  // ==========================================

  const toggleCategory = (
    categoryId
  ) => {
    setOpenCategories(
      (previous) => ({
        ...previous,
        [categoryId]:
          !previous[categoryId],
      })
    )
  }

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  const deleteCategory = (
    category
  ) => {
    if (!category) return

    const children =
      getSubcategories(
        category._id
      )

    /*
     * Prevent deleting a parent while it
     * still has subcategories.
     */

    if (children.length > 0) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'Delete the subcategories before deleting this category.',
        },
      })
    }

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

  // ==========================================
  // ADMIN CATEGORY TREE
  // ==========================================

  const AdminCategoryTree = () => {
    if (
      filteredParentCategories.length ===
      0
    ) {
      return (
        <EmptyState
          title="No categories found"
          description={
            search
              ? `No category matches "${search}".`
              : 'Create your first category.'
          }
        />
      )
    }

    return (
      <div className="divide-y divide-[var(--nova-border)]">

        {filteredParentCategories.map(
          (parent) => {
            const children =
              getSubcategories(
                parent._id
              )

            const isOpen =
              openCategories[
                parent._id
              ] ||
              Boolean(search)

            return (
              <div
                key={parent._id}
              >

                {/* ================================= */}
                {/* PARENT CATEGORY */}
                {/* ================================= */}

                <div className="flex items-center justify-between gap-4 px-5 py-4">

                  <div className="flex min-w-0 items-center gap-2">

                    {children.length >
                    0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          toggleCategory(
                            parent._id
                          )
                        }
                        aria-label={
                          isOpen
                            ? 'Collapse category'
                            : 'Expand category'
                        }
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--nova-surface-soft)]"
                      >
                        {isOpen ? (
                          <ChevronDown
                            size={17}
                          />
                        ) : (
                          <ChevronRight
                            size={17}
                          />
                        )}
                      </button>
                    ) : (
                      <div className="w-8" />
                    )}

                    <FolderOpen
                      size={18}
                      className="shrink-0 text-[var(--nova-muted)]"
                    />

                    <Link
                      href={`/products?category=${parent._id}`}
                      className="truncate font-semibold capitalize hover:text-[var(--nova-blue)]"
                    >
                      {parent.name}
                    </Link>

                    {children.length >
                      0 && (
                      <span className="rounded-full bg-[var(--nova-surface-soft)] px-2 py-0.5 text-xs text-[var(--nova-muted)]">
                        {children.length}
                      </span>
                    )}

                  </div>

                  <div className="flex shrink-0 items-center gap-1">

                    {/* ADD SUBCATEGORY */}

                    <button
                      type="button"
                      onClick={() =>
                        startCreateSubcategory(
                          parent._id
                        )
                      }
                      className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[var(--nova-blue)] hover:bg-[var(--nova-surface-soft)] sm:flex"
                    >
                      <Plus
                        size={14}
                      />

                      Add subcategory
                    </button>

                    {/* EDIT */}

                    <button
                      type="button"
                      onClick={() =>
                        editCategory(
                          parent
                        )
                      }
                      aria-label={`Edit ${parent.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--nova-surface-soft)]"
                    >
                      <Edit3
                        size={15}
                      />
                    </button>

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={() =>
                        deleteCategory(
                          parent
                        )
                      }
                      aria-label={`Delete ${parent.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--nova-surface-soft)] hover:text-[var(--nova-danger)]"
                    >
                      <Trash2
                        size={15}
                      />
                    </button>

                  </div>
                </div>

                {/* ================================= */}
                {/* MOBILE ADD SUBCATEGORY */}
                {/* ================================= */}

                <div className="px-5 pb-3 sm:hidden">

                  <button
                    type="button"
                    onClick={() =>
                      startCreateSubcategory(
                        parent._id
                      )
                    }
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--nova-blue)]"
                  >
                    <Plus size={14} />

                    Add subcategory
                  </button>

                </div>

                {/* ================================= */}
                {/* SUBCATEGORIES */}
                {/* ================================= */}

                {isOpen &&
                  children.length >
                    0 && (
                    <div className="border-t border-[var(--nova-border)] bg-[var(--nova-surface-soft)]">

                      {children.map(
                        (child) => (
                          <div
                            key={child._id}
                            className="flex items-center justify-between gap-4 border-b border-[var(--nova-border)] px-5 py-3.5 pl-16 last:border-b-0"
                          >

                            <div className="flex min-w-0 items-center gap-3">

                              <span className="text-[var(--nova-muted)]">
                                └
                              </span>

                              <Link
                                href={`/products?category=${parent._id}&subcategory=${child._id}`}
                                className="truncate text-sm font-medium capitalize hover:text-[var(--nova-blue)]"
                              >
                                {child.name}
                              </Link>

                            </div>

                            <div className="flex shrink-0 items-center gap-1">

                              <button
                                type="button"
                                onClick={() =>
                                  editCategory(
                                    child
                                  )
                                }
                                aria-label={`Edit ${child.name}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--nova-surface)]"
                              >
                                <Edit3
                                  size={14}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteCategory(
                                    child
                                  )
                                }
                                aria-label={`Delete ${child.name}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--nova-surface)] hover:text-[var(--nova-danger)]"
                              >
                                <Trash2
                                  size={14}
                                />
                              </button>

                            </div>

                          </div>
                        )
                      )}

                    </div>
                  )}

              </div>
            )
          }
        )}

      </div>
    )
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <>
      <Head>

        <title>
          {isAdmin
            ? 'Categories | NovaCart Admin'
            : 'Categories | NovaCart'}
        </title>

        <meta
          name="description"
          content="Browse and manage NovaCart categories."
        />

      </Head>

      <main className="py-8 sm:py-10">

        <Container>

          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <div className="mb-8">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nova-muted)]">
              {isAdmin
                ? 'Super Admin'
                : 'Shop'}
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Categories
            </h1>

            <p className="mt-2 max-w-xl text-sm text-[var(--nova-muted)]">
              {isAdmin
                ? 'Organize the marketplace catalog with categories and subcategories.'
                : 'Browse the catalog by category.'}
            </p>

          </div>

          {/* ================================= */}
          {/* CUSTOMER VIEW */}
          {/* ================================= */}

          {!isAdmin && (
            filteredParentCategories.length >
            0 ? (

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {filteredParentCategories.map(
                  (category) => {

                    const children =
                      getSubcategories(
                        category._id
                      )

                    return (
                      <div
                        key={category._id}
                        className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-6"
                      >

                        <Link
                          href={`/products?category=${category._id}`}
                          className="text-lg font-semibold capitalize hover:text-[var(--nova-blue)]"
                        >
                          {category.name}
                        </Link>

                        {children.length >
                          0 && (
                          <div className="mt-4 space-y-2">

                            {children.map(
                              (child) => (
                                <Link
                                  key={child._id}
                                  href={`/products?category=${category._id}&subcategory=${child._id}`}
                                  className="block text-sm text-[var(--nova-muted)] hover:text-[var(--nova-blue)]"
                                >
                                  {child.name}
                                </Link>
                              )
                            )}

                          </div>
                        )}

                        <Link
                          href={`/products?category=${category._id}`}
                          className="mt-4 inline-block text-xs font-semibold text-[var(--nova-blue)]"
                        >
                          View all products →
                        </Link>

                      </div>
                    )
                  }
                )}

              </div>

            ) : (

              <EmptyState
                title="No categories yet"
                description="Categories will appear here once they are added."
              />

            )
          )}

          {/* ================================= */}
          {/* ADMIN VIEW */}
          {/* ================================= */}

          {isAdmin && (
            <>

              {/* ================================= */}
              {/* CREATE / EDIT FORM */}
              {/* ================================= */}

              <section className="mb-6 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5">

                <div className="mb-4">

                  <h2 className="text-sm font-semibold">

                    {id
                      ? parentCategory
                        ? 'Edit subcategory'
                        : 'Edit category'
                      : parentCategory
                        ? 'Create subcategory'
                        : 'Create category'}

                  </h2>

                  <p className="mt-1 text-xs text-[var(--nova-muted)]">

                    {id
                      ? parentCategory
                        ? 'Update the subcategory name. Its parent category remains unchanged.'
                        : 'Update the category name.'
                      : parentCategory
                        ? `New subcategory under ${
                            parentCategories.find(
                              (item) =>
                                item._id.toString() ===
                                parentCategory.toString()
                            )?.name ||
                            'selected category'
                          }.`
                        : 'Create a top-level marketplace category.'}

                  </p>

                </div>

                {/* ================================= */}
                {/* PARENT CATEGORY SELECT */}
                {/* ================================= */}

                <div className="mb-3">

                  <label
                    htmlFor="parent-category"
                    className="mb-2 block text-xs font-medium text-[var(--nova-muted)]"
                  >
                    Parent category
                  </label>

                  <select
                    id="parent-category"
                    value={parentCategory}
                    onChange={(e) =>
                      setParentCategory(
                        e.target.value
                      )
                    }
                    disabled={Boolean(id)}
                    className="h-11 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 text-sm text-[var(--nova-text)] outline-none focus:border-[var(--nova-blue)] disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <option value="">
                      No parent — Create category
                    </option>

                    {parentCategories.map(
                      (category) => (
                        <option
                          key={category._id}
                          value={category._id}
                        >
                          {category.name}
                        </option>
                      )
                    )}

                  </select>

                  {id &&
                    parentCategory && (
                      <p className="mt-2 text-xs text-[var(--nova-muted)]">
                        Parent category is preserved while editing.
                      </p>
                    )}

                </div>

                {/* ================================= */}
                {/* NAME + BUTTONS */}
                {/* ================================= */}

                <div className="flex flex-col gap-3 sm:flex-row">

                  <Input
                    id="category-name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder={
                      parentCategory
                        ? 'Enter subcategory name...'
                        : 'Enter category name...'
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                        'Enter'
                      ) {
                        saveCategory()
                      }
                    }}
                  />

                  <Button
                    onClick={saveCategory}
                  >
                    {id
                      ? 'Update'
                      : parentCategory
                        ? 'Create subcategory'
                        : 'Create'}
                  </Button>

                  {(id ||
                    parentCategory) && (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        resetForm(false)
                      }
                    >
                      Cancel
                    </Button>
                  )}

                </div>

              </section>

              {/* ================================= */}
              {/* SEARCH */}
              {/* ================================= */}

              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-lg font-semibold">
                    All categories
                  </h2>

                  <p className="mt-1 text-xs text-[var(--nova-muted)]">

                    {parentCategories.length}{' '}
                    categories ·{' '}

                    {Math.max(
                      categories.length -
                        parentCategories.length,
                      0
                    )}{' '}

                    subcategories

                  </p>

                </div>

                <div className="relative w-full sm:w-72">

                  <Search
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
                  />

                  <input
                    type="search"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] pl-11 pr-4 text-sm outline-none focus:border-[var(--nova-blue)]"
                  />

                </div>

              </div>

              {/* ================================= */}
              {/* CATEGORY TREE */}
              {/* ================================= */}

              <section className="overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">

                <AdminCategoryTree />

              </section>

            </>
          )}

        </Container>

      </main>
    </>
  )
}

export default Categories