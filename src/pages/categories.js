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
  const [openCategories, setOpenCategories] =
    useState({})

  const { state, dispatch } =
    useContext(DataContext)

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
      // KEEP PARENT FOR SUBCATEGORY
      // ========================================

      if (isCreatingSubcategory) {
        const selectedParent =
          parentCategory

        setName('')
        setId('')

        setParentCategory(
          selectedParent
        )

        setOpenCategories(
          (previous) => ({
            ...previous,
            [selectedParent]: true,
          })
        )
      } else {
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

    if (category.parentCategory) {
      setParentCategory(
        category.parentCategory.toString()
      )

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

    setParentCategory(
      parentId.toString()
    )

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
      <div
        className="
          divide-y
          divide-[var(--nova-border)]
        "
      >
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
                className="
                  transition-colors
                  duration-200
                "
              >

                {/* =================================
                    PARENT CATEGORY
                ================================= */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3

                    px-4
                    py-4

                    sm:px-5
                  "
                >

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-2
                    "
                  >

                    {/* EXPAND */}

                    {children.length > 0 ? (
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
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center

                          rounded-xl

                          border
                          border-transparent

                          text-[var(--nova-muted)]

                          transition-all
                          duration-200

                          hover:border-[var(--nova-border)]
                          hover:bg-[var(--nova-lavender-soft)]
                          hover:text-[var(--nova-primary)]
                        "
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
                      <div className="w-9 shrink-0" />
                    )}

                    {/* FOLDER */}

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center

                        rounded-xl

                        bg-[var(--nova-lavender-soft)]

                        text-[var(--nova-primary)]
                      "
                    >
                      <FolderOpen
                        size={17}
                      />
                    </div>

                    {/* NAME */}

                    <Link
                      href={`/products?category=${parent._id}`}
                      className="
                        min-w-0
                        truncate

                        text-sm
                        font-semibold
                        capitalize

                        text-[var(--nova-text)]

                        transition-colors
                        duration-200

                        hover:text-[var(--nova-primary)]
                      "
                    >
                      {parent.name}
                    </Link>

                    {/* COUNT */}

                    {children.length > 0 && (
                      <span
                        className="
                          shrink-0

                          rounded-full

                          border
                          border-[var(--nova-border)]

                          bg-[var(--nova-surface-soft)]

                          px-2
                          py-0.5

                          text-[10px]
                          font-semibold

                          text-[var(--nova-muted)]
                        "
                      >
                        {children.length}
                      </span>
                    )}

                  </div>

                  {/* ACTIONS */}

                  <div
                    className="
                      flex
                      shrink-0
                      items-center
                      gap-1
                    "
                  >

                    {/* ADD SUBCATEGORY */}

                    <button
                      type="button"
                      onClick={() =>
                        startCreateSubcategory(
                          parent._id
                        )
                      }
                      className="
                        hidden
                        h-9
                        items-center
                        gap-1.5

                        rounded-xl

                        border
                        border-transparent

                        px-3

                        text-xs
                        font-semibold

                        text-[var(--nova-primary)]

                        transition-all
                        duration-200

                        hover:border-[var(--nova-border)]
                        hover:bg-[var(--nova-lavender-soft)]

                        sm:flex
                      "
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
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center

                        rounded-xl

                        border
                        border-transparent

                        text-[var(--nova-muted)]

                        transition-all
                        duration-200

                        hover:border-[var(--nova-border)]
                        hover:bg-[var(--nova-lavender-soft)]
                        hover:text-[var(--nova-primary)]
                      "
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
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center

                        rounded-xl

                        border
                        border-transparent

                        text-[var(--nova-muted)]

                        transition-all
                        duration-200

                        hover:border-[rgba(239,68,68,0.15)]
                        hover:bg-[rgba(239,68,68,0.08)]
                        hover:text-[var(--nova-danger)]
                      "
                    >
                      <Trash2
                        size={15}
                      />
                    </button>

                  </div>

                </div>

                {/* =================================
                    MOBILE ADD SUBCATEGORY
                ================================= */}

                <div
                  className="
                    px-4
                    pb-3

                    sm:hidden
                    sm:px-5
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      startCreateSubcategory(
                        parent._id
                      )
                    }
                    className="
                      inline-flex
                      items-center
                      gap-1.5

                      rounded-lg

                      px-2
                      py-1.5

                      text-xs
                      font-semibold

                      text-[var(--nova-primary)]

                      transition-colors

                      hover:bg-[var(--nova-lavender-soft)]
                    "
                  >
                    <Plus size={14} />

                    Add subcategory
                  </button>
                </div>

                {/* =================================
                    SUBCATEGORIES
                ================================= */}

                {isOpen &&
                  children.length > 0 && (
                    <div
                      className="
                        border-t
                        border-[var(--nova-border)]

                        bg-[var(--nova-surface-soft)]

                        py-1
                      "
                    >
                      {children.map(
                        (child) => (
                          <div
                            key={child._id}
                            className="
                              flex
                              items-center
                              justify-between
                              gap-3

                              border-b
                              border-[var(--nova-border)]

                              px-4
                              py-3

                              last:border-b-0

                              sm:pl-20
                            "
                          >

                            <div
                              className="
                                flex
                                min-w-0
                                items-center
                                gap-2
                              "
                            >

                              <span
                                className="
                                  shrink-0

                                  text-[var(--nova-violet-light)]
                                "
                              >
                                └
                              </span>

                              <div
                                className="
                                  h-1.5
                                  w-1.5
                                  shrink-0

                                  rounded-full

                                  bg-[var(--nova-violet-light)]
                                "
                              />

                              <Link
                                href={`/products?category=${parent._id}&subcategory=${child._id}`}
                                className="
                                  min-w-0
                                  truncate

                                  text-sm
                                  font-medium
                                  capitalize

                                  text-[var(--nova-muted)]

                                  transition-colors

                                  hover:text-[var(--nova-primary)]
                                "
                              >
                                {child.name}
                              </Link>

                            </div>

                            <div
                              className="
                                flex
                                shrink-0
                                items-center
                                gap-1
                              "
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  editCategory(
                                    child
                                  )
                                }
                                aria-label={`Edit ${child.name}`}
                                className="
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center

                                  rounded-lg

                                  text-[var(--nova-muted)]

                                  transition-all

                                  hover:bg-[var(--nova-surface)]
                                  hover:text-[var(--nova-primary)]
                                "
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
                                className="
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center

                                  rounded-lg

                                  text-[var(--nova-muted)]

                                  transition-all

                                  hover:bg-[var(--nova-surface)]
                                  hover:text-[var(--nova-danger)]
                                "
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

      <main
        className="
          min-h-screen

          bg-[var(--nova-bg)]

          py-7
          sm:py-9
          lg:py-11
        "
      >
        <Container>

          {/* =================================
              HEADER
          ================================= */}

          <div
            className="
              relative
              mb-7
              overflow-hidden

              rounded-3xl

              border
              border-[var(--nova-border)]

              bg-[var(--nova-surface)]

              px-5
              py-7

              shadow-[var(--shadow-md)]

              sm:px-7
              sm:py-8
            "
          >

            {/* Violet glow */}

            <div
              className="
                pointer-events-none
                absolute
                -right-24
                -top-28

                h-64
                w-64

                rounded-full

                bg-[rgba(139,92,246,0.12)]

                blur-3xl
              "
            />

            <div className="relative">

              <div
                className="
                  mb-3
                  inline-flex
                  items-center

                  rounded-full

                  border
                  border-[rgba(139,92,246,0.18)]

                  bg-[var(--nova-lavender-soft)]

                  px-3
                  py-1.5

                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]

                  text-[var(--nova-primary)]
                "
              >
                {isAdmin
                  ? 'Super Admin'
                  : 'Shop'}
              </div>

              <h1
                className="
                  text-3xl
                  font-bold
                  tracking-[-0.03em]

                  text-[var(--nova-text)]

                  sm:text-4xl
                "
              >
                Categories
              </h1>

              <p
                className="
                  mt-2
                  max-w-xl

                  text-sm
                  leading-6

                  text-[var(--nova-muted)]
                "
              >
                {isAdmin
                  ? 'Organize the marketplace catalog with categories and subcategories.'
                  : 'Browse the catalog by category.'}
              </p>

            </div>
          </div>

          {/* =================================
              CUSTOMER VIEW
          ================================= */}

          {!isAdmin && (
            filteredParentCategories.length >
            0 ? (

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4

                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >

                {filteredParentCategories.map(
                  (category) => {
                    const children =
                      getSubcategories(
                        category._id
                      )

                    return (
                      <div
                        key={category._id}
                        className="
                          group

                          relative
                          overflow-hidden

                          rounded-2xl

                          border
                          border-[var(--nova-border)]

                          bg-[var(--nova-surface)]

                          p-5

                          shadow-[var(--shadow-md)]

                          transition-all
                          duration-200

                          hover:-translate-y-1
                          hover:border-[var(--nova-violet-light)]
                          hover:shadow-[0_16px_36px_rgba(124,58,237,0.13)]

                          sm:p-6
                        "
                      >

                        {/* Category icon */}

                        <div
                          className="
                            mb-5
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center

                            rounded-xl

                            bg-[var(--nova-lavender-soft)]

                            text-[var(--nova-primary)]

                            transition-transform
                            duration-200

                            group-hover:scale-105
                          "
                        >
                          <FolderOpen
                            size={19}
                          />
                        </div>

                        <Link
                          href={`/products?category=${category._id}`}
                          className="
                            block

                            text-lg
                            font-bold
                            capitalize

                            text-[var(--nova-text)]

                            transition-colors

                            hover:text-[var(--nova-primary)]
                          "
                        >
                          {category.name}
                        </Link>

                        {children.length >
                          0 && (
                          <div
                            className="
                              mt-4
                              space-y-1
                            "
                          >
                            {children.map(
                              (child) => (
                                <Link
                                  key={
                                    child._id
                                  }
                                  href={`/products?category=${category._id}&subcategory=${child._id}`}
                                  className="
                                    flex
                                    items-center
                                    gap-2

                                    rounded-lg

                                    px-2
                                    py-1.5

                                    text-sm

                                    text-[var(--nova-muted)]

                                    transition-colors

                                    hover:bg-[var(--nova-lavender-soft)]
                                    hover:text-[var(--nova-primary)]
                                  "
                                >
                                  <span
                                    className="
                                      h-1.5
                                      w-1.5
                                      rounded-full

                                      bg-[var(--nova-violet-light)]
                                    "
                                  />

                                  {child.name}
                                </Link>
                              )
                            )}
                          </div>
                        )}

                        <Link
                          href={`/products?category=${category._id}`}
                          className="
                            mt-5
                            inline-flex
                            items-center
                            gap-1

                            text-xs
                            font-bold

                            text-[var(--nova-primary)]

                            transition-all

                            hover:gap-2
                          "
                        >
                          View all products
                          <ChevronRight
                            size={13}
                          />
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

          {/* =================================
              ADMIN VIEW
          ================================= */}

          {isAdmin && (
            <>

              {/* =================================
                  CREATE / EDIT FORM
              ================================= */}

              <section
                className="
                  mb-7

                  overflow-hidden

                  rounded-3xl

                  border
                  border-[var(--nova-border)]

                  bg-[var(--nova-surface)]

                  shadow-[var(--shadow-md)]
                "
              >

                {/* Form header */}

                <div
                  className="
                    border-b
                    border-[var(--nova-border)]

                    bg-[var(--nova-surface-soft)]

                    px-5
                    py-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center

                        rounded-xl

                        bg-[var(--nova-lavender-soft)]

                        text-[var(--nova-primary)]
                      "
                    >
                      <Plus size={18} />
                    </div>

                    <div>

                      <h2
                        className="
                          text-sm
                          font-bold

                          text-[var(--nova-text)]
                        "
                      >
                        {id
                          ? parentCategory
                            ? 'Edit subcategory'
                            : 'Edit category'
                          : parentCategory
                            ? 'Create subcategory'
                            : 'Create category'}
                      </h2>

                      <p
                        className="
                          mt-0.5

                          text-xs

                          text-[var(--nova-muted)]
                        "
                      >
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

                  </div>

                </div>

                {/* Form body */}

                <div className="p-5">

                  {/* PARENT CATEGORY */}

                  <div className="mb-4">

                    <label
                      htmlFor="parent-category"
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
                      className="
                        h-11
                        w-full

                        rounded-xl

                        border
                        border-[var(--nova-border)]

                        bg-[var(--nova-surface)]

                        px-3

                        text-sm
                        text-[var(--nova-text)]

                        outline-none

                        transition-all

                        hover:border-[var(--nova-violet-light)]

                        focus:border-[var(--nova-primary)]
                        focus:ring-2
                        focus:ring-[rgba(139,92,246,0.12)]

                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        shadow-[var(--shadow-sm)]
                      "
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
                        <p
                          className="
                            mt-2

                            text-xs

                            text-[var(--nova-muted)]
                          "
                        >
                          Parent category is
                          preserved while
                          editing.
                        </p>
                      )}

                  </div>

                  {/* NAME + BUTTONS */}

                  <div
                    className="
                      flex
                      flex-col
                      gap-3

                      sm:flex-row
                      sm:items-end
                    "
                  >

                    <div className="min-w-0 flex-1">

                      <Input
                        id="category-name"
                        label="Category name"
                        value={name}
                        onChange={(e) =>
                          setName(
                            e.target.value
                          )
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

                    </div>

                    <div
                      className="
                        flex
                        gap-2

                        sm:shrink-0
                      "
                    >

                      <Button
                        onClick={saveCategory}
                        className="shadow-[0_8px_20px_rgba(124,58,237,0.16)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(124,58,237,0.22)]"
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

                  </div>

                </div>

              </section>

              {/* =================================
                  SEARCH / LIST HEADER
              ================================= */}

              <div
                className="
                  mb-4

                  flex
                  flex-col
                  gap-4

                  sm:flex-row
                  sm:items-end
                  sm:justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.16em]

                      text-[var(--nova-primary)]
                    "
                  >
                    Catalog structure
                  </p>

                  <h2
                    className="
                      mt-1

                      text-xl
                      font-bold

                      text-[var(--nova-text)]
                    "
                  >
                    All categories
                  </h2>

                  <p
                    className="
                      mt-1

                      text-xs

                      text-[var(--nova-muted)]
                    "
                  >
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

                {/* SEARCH */}

                <div
                  className="
                    relative
                    w-full

                    sm:w-80
                  "
                >

                  <Search
                    size={17}
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
                    type="search"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    className="
                      h-11
                      w-full

                      rounded-xl

                      border
                      border-[var(--nova-border)]

                      bg-[var(--nova-surface)]

                      pl-11
                      pr-4

                      text-sm
                      text-[var(--nova-text)]

                      outline-none

                      placeholder:text-[var(--nova-muted)]

                      transition-all
                      duration-200

                      hover:border-[var(--nova-violet-light)]

                      focus:border-[var(--nova-primary)]

                      focus:ring-2
                      focus:ring-[rgba(139,92,246,0.12)]
                      shadow-[var(--shadow-sm)]
                    "
                  />

                </div>

              </div>

              {/* =================================
                  CATEGORY TREE
              ================================= */}

              <section
                className="
                  overflow-hidden

                  rounded-3xl

                  border
                  border-[var(--nova-border)]

                  bg-[var(--nova-surface)]

                  shadow-[var(--shadow-md)]
                "
              >
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