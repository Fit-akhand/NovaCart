import Head from 'next/head'
import AuthGuard from '../../../components/common/AuthGuard'
import { formatPrice } from '@/lib/formatPrice'
import { useState, useContext, useEffect, useMemo } from 'react'
import { DataContext } from '../../../store/GlobalState'
import { imageUpload } from '../../../utils/imageUpload'
import {
  postData,
  getData,
  putData,
} from '@/lib/api-client'
import { useRouter } from 'next/router'
import {
  ArrowLeft,
  Check,
  DollarSign,
  FileText,
  ImagePlus,
  Package,
  Save,
  Tag,
  Upload,
  X,
} from 'lucide-react'

const ProductsManager = () => {
  // =========================================================
  // INITIAL PRODUCT STATE
  // =========================================================

  const initialState = {
    title: '',
    price: 0,
    inStock: 0,
    description: '',
    content: '',
    category: '',
    subcategory: null,
  }

  const [product, setProduct] = useState(initialState)

  const {
    title,
    price,
    inStock,
    description,
    content,
    category,
    subcategory,
  } = product

  // =========================================================
  // GLOBAL STATE
  // =========================================================

  const [images, setImages] = useState([])

  const { state, dispatch } = useContext(DataContext)

  const {
    categories = [],
    auth,
  } = state

  // =========================================================
  // ROUTER
  // =========================================================

  const router = useRouter()
  const { id } = router.query

  const [onEdit, setOnEdit] = useState(false)

  // =========================================================
  // SAFE CATEGORY HELPERS
  // =========================================================

  const getParentCategoryId = (parentCategory) => {
    if (!parentCategory) return ''

    if (typeof parentCategory === 'object') {
      return parentCategory._id?.toString() || ''
    }

    return parentCategory.toString()
  }

  const getCategoryId = (categoryValue) => {
    if (!categoryValue) return ''

    if (typeof categoryValue === 'object') {
      return categoryValue._id?.toString() || ''
    }

    return categoryValue.toString()
  }

  // =========================================================
  // PARENT CATEGORIES
  // =========================================================

  const parentCategories = useMemo(() => {
    return categories.filter((item) => {
      if (!item || !item._id) {
        return false
      }

      return !item.parentCategory
    })
  }, [categories])

  // =========================================================
  // SUBCATEGORIES
  // =========================================================

  const subcategories = useMemo(() => {
    if (!category) {
      return []
    }

    const selectedCategoryId = getCategoryId(category)

    return categories.filter((item) => {
      if (!item || !item._id || !item.parentCategory) {
        return false
      }

      const parentId = getParentCategoryId(
        item.parentCategory
      )

      return parentId === selectedCategoryId
    })
  }, [categories, category])

  // =========================================================
  // GET PRODUCT WHEN EDITING
  // =========================================================

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (id) {
      setOnEdit(true)

      getData(`product/${id}`).then((res) => {
        if (res?.err) {
          return dispatch({
            type: 'NOTIFY',
            payload: {
              error: res.err,
            },
          })
        }

        if (!res?.product) {
          return
        }

        const productData = res.product

        const productCategory =
          getCategoryId(productData.category)

        const productSubcategory =
          getCategoryId(productData.subcategory)

        setProduct({
          ...productData,
          category: productCategory,
          subcategory: productSubcategory || null,
        })

        setImages(
          Array.isArray(productData.images)
            ? productData.images
            : []
        )
      })
    } else {
      setOnEdit(false)
      setProduct(initialState)
      setImages([])
    }
  }, [id, router.isReady])

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChangeInput = (e) => {
    const {
      name,
      value,
    } = e.target

    // -------------------------------------------------------
    // CATEGORY CHANGED
    // -------------------------------------------------------

    if (name === 'category') {
      setProduct((prev) => ({
        ...prev,
        category: value,
        subcategory: '',
      }))

      dispatch({
        type: 'NOTIFY',
        payload: {},
      })

      return
    }

    // -------------------------------------------------------
    // SUBCATEGORY CHANGED
    // -------------------------------------------------------

    if (name === 'subcategory') {
      setProduct((prev) => ({
        ...prev,
        subcategory: value || null,
      }))

      dispatch({
        type: 'NOTIFY',
        payload: {},
      })

      return
    }

    // -------------------------------------------------------
    // NORMAL INPUT
    // -------------------------------------------------------

    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }))

    dispatch({
      type: 'NOTIFY',
      payload: {},
    })
  }

  // =========================================================
  // IMAGE UPLOAD
  // =========================================================

  const handleUploadInput = (e) => {
    dispatch({
      type: 'NOTIFY',
      payload: {},
    })

    const files = [...e.target.files]

    if (files.length === 0) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: 'Files do not exist.',
        },
      })
    }

    let newImages = []
    let err = ''

    files.forEach((file) => {
      if (file.size > 1024 * 1024) {
        err = 'The largest image size is 1MB.'
        return
      }

      if (
        file.type !== 'image/jpeg' &&
        file.type !== 'image/png'
      ) {
        err = 'Only JPG and PNG images are allowed.'
        return
      }

      if (newImages.length < 5) {
        newImages.push(file)
      }
    })

    if (err) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: err,
        },
      })
    }

    if (
      images.length + newImages.length > 5
    ) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: 'You can select up to 5 images.',
        },
      })
    }

    setImages((prev) => [
      ...prev,
      ...newImages,
    ])

    // Allow selecting the same file again
    e.target.value = ''
  }

  // =========================================================
  // DELETE IMAGE
  // =========================================================

  const deleteImage = (index) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    )
  }

  // =========================================================
  // SUBMIT PRODUCT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    // =======================================================
    // AUTHORIZATION
    // =======================================================

    if (
      !auth?.user ||
      !['admin', 'seller'].includes(
        auth.user.role
      )
    ) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'You are not authorized to manage products.',
        },
      })
    }

    // =======================================================
    // BASIC VALIDATION
    // =======================================================

    if (
    !title ||
    price === '' ||
    price === null ||
    Number(price) <= 0 ||
    !inStock ||
    Number(inStock) <= 0 ||
    !description ||
    !content ||
    !category ||
    category === 'all' ||
    images.length === 0
  ) {
    return dispatch({
      type: 'NOTIFY',
      payload: {
        error: 'Please enter a valid price, stock quantity, and complete all required fields.',
      },
    })
  }

    // =======================================================
    // SUBCATEGORY VALIDATION
    // =======================================================

    if (
      subcategory &&
      subcategory !== 'all'
    ) {
      const exists = subcategories.some(
        (item) =>
          item &&
          item._id?.toString() ===
            subcategory.toString()
      )

      if (!exists) {
        return dispatch({
          type: 'NOTIFY',
          payload: {
            error:
              'Selected subcategory is not valid for this category.',
          },
        })
      }
    }

    // =======================================================
    // LOADING
    // =======================================================

    dispatch({
      type: 'NOTIFY',
      payload: {
        loading: true,
      },
    })

    // =======================================================
    // UPLOAD IMAGES
    // =======================================================

    let media = []

    const imgNewURL = images.filter(
      (img) => !img.url
    )

    const imgOldURL = images.filter(
      (img) => img.url
    )

    if (imgNewURL.length > 0) {
      media = await imageUpload(imgNewURL)
    }

    // =======================================================
    // FINAL PAYLOAD
    // =======================================================

    const payload = {
      title,
      price,
      inStock,
      description,
      content,
      category,
      subcategory:
        subcategory &&
        subcategory !== 'all'
          ? subcategory
          : null,
      images: [
        ...imgOldURL,
        ...media,
      ],
    }

    // =======================================================
    // CREATE / UPDATE
    // =======================================================

    let res

    if (onEdit) {
      res = await putData(
        `product/${id}`,
        payload,
        auth.token
      )
    } else {
      res = await postData(
        'product',
        payload,
        auth.token
      )
    }

    // =======================================================
    // ERROR
    // =======================================================

    if (res?.err) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: res.err,
        },
      })
    }

    // =======================================================
    // SUCCESS
    // =======================================================

    return dispatch({
      type: 'NOTIFY',
      payload: {
        success: res.msg,
      },
    })
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <Head>
        <title>
          {onEdit
            ? 'Edit Product'
            : 'Create Product'}{' '}
          | NovaCart Admin
        </title>

        <meta
          name="description"
          content="Manage NovaCart products."
        />
      </Head>

      <main className="min-h-screen bg-[var(--nova-bg)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* =================================================
              HEADER
          ================================================== */}

          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--nova-lavender-soft)] text-[var(--nova-primary)]">
                  <Package size={15} />
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nova-muted)]">
                  NovaCart Admin
                </span>

              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-[var(--nova-text)] sm:text-4xl">
                {onEdit
                  ? 'Edit Product'
                  : 'Create Product'}
              </h1>

              <p className="mt-2 text-sm text-[var(--nova-muted)]">
                {onEdit
                  ? 'Update product information, pricing and media.'
                  : 'Add a new product to your NovaCart catalog.'}
              </p>

            </div>

            <div className="flex items-center gap-2 rounded-full border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-2 text-xs font-semibold text-[var(--nova-text)] shadow-[var(--shadow-sm)] shadow-[var(--shadow-sm)]">

              <span className="h-2 w-2 rounded-full bg-green-500" />

              {onEdit
                ? 'Editing product'
                : 'New product'}

            </div>

          </div>

          {/* =================================================
              FORM
          ================================================== */}

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_430px]">

              {/* =================================================
                  LEFT COLUMN
              ================================================== */}

              <div className="space-y-6">

                {/* =================================================
                    BASIC INFORMATION
                ================================================== */}

                <section className="overflow-hidden rounded-3xl border border-[var(--nova-border)] bg-[var(--nova-surface)] shadow-[var(--shadow-md)]">

                  <div className="border-b border-[var(--nova-border)] px-6 py-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--nova-lavender-soft)] text-[var(--nova-primary)]">
                        <Package size={17} />
                      </div>

                      <div>

                        <h2 className="text-sm font-semibold text-[var(--nova-text)]">
                          Basic Information
                        </h2>

                        <p className="mt-0.5 text-xs text-[var(--nova-muted)]">
                          Core information about your product.
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="space-y-5 p-6">

                    {/* =================================================
                        TITLE
                    ================================================== */}

                    <div>

                      <label
                        htmlFor="title"
                        className="mb-2 block text-xs font-semibold text-[var(--nova-text)]"
                      >
                        Product Title
                      </label>

                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={title}
                        placeholder="e.g. Premium Running Shoes"
                        onChange={handleChangeInput}
                        className="h-12 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-4 text-sm text-[var(--nova-text)] outline-none transition placeholder:text-[var(--nova-muted)] focus:border-[var(--nova-primary)] focus:bg-[var(--nova-surface)] focus:ring-4 focus:ring-[rgba(139,92,246,0.10)]"
                      />

                    </div>

                    {/* =================================================
                        PRICE / STOCK
                    ================================================== */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <div>

                        <label
                          htmlFor="price"
                          className="mb-2 block text-xs font-semibold text-[var(--nova-text)]"
                        >
                          Price
                        </label>

                        <div className="relative">

                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--nova-muted)]">
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            name="price"
                            id="price"
                            value={price}
                            placeholder="0.00"
                            onChange={handleChangeInput}
                            className="h-12 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] pl-10 pr-4 text-sm text-[var(--nova-text)] outline-none transition focus:border-[var(--nova-primary)] focus:bg-[var(--nova-surface)] focus:ring-4 focus:ring-[rgba(139,92,246,0.10)]"
                          />

                        </div>

                      </div>

                      <div>

                        <label
                          htmlFor="inStock"
                          className="mb-2 block text-xs font-semibold text-[var(--nova-text)]"
                        >
                          Stock Quantity
                        </label>

                        <div className="relative">

                          <Package
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
                          />

                          <input
                            type="number"
                            min="0"
                            name="inStock"
                            id="inStock"
                            value={inStock}
                            placeholder="0"
                            onChange={handleChangeInput}
                            className="h-12 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] pl-10 pr-4 text-sm text-[var(--nova-text)] outline-none transition focus:border-[var(--nova-primary)] focus:bg-[var(--nova-surface)] focus:ring-4 focus:ring-[rgba(139,92,246,0.10)]"
                          />

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        CATEGORY
                    ================================================== */}

                    <div>

                      <label
                        htmlFor="category"
                        className="mb-2 block text-xs font-semibold text-[var(--nova-text)]"
                      >
                        Category
                      </label>

                      <div className="relative">

                        <Tag
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
                        />

                        <select
                          name="category"
                          id="category"
                          value={category || ''}
                          onChange={handleChangeInput}
                          className="h-12 w-full appearance-none rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] pl-10 pr-4 text-sm capitalize text-[var(--nova-text)] outline-none transition focus:border-[var(--nova-primary)] focus:bg-[var(--nova-surface)] focus:ring-4 focus:ring-[rgba(139,92,246,0.10)]"
                        >

                          <option value="">
                            Select category
                          </option>

                          {parentCategories.map(
                            (item) => (
                              <option
                                key={item._id}
                                value={item._id}
                              >
                                {item.name}
                              </option>
                            )
                          )}

                        </select>

                      </div>

                    </div>

                    {/* =================================================
                        SUBCATEGORY
                    ================================================== */}

                    <div>

                      <label
                        htmlFor="subcategory"
                        className="mb-2 block text-xs font-semibold text-[var(--nova-text)]"
                      >
                        Subcategory
                      </label>

                      <div className="relative">

                        <Tag
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
                        />

                        <select
                          name="subcategory"
                          id="subcategory"
                          value={subcategory || ''}
                          onChange={handleChangeInput}
                          disabled={!category}
                          className="h-12 w-full appearance-none rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] pl-10 pr-4 text-sm capitalize text-[var(--nova-text)] outline-none transition focus:border-[var(--nova-primary)] focus:bg-[var(--nova-surface)] focus:ring-4 focus:ring-[rgba(139,92,246,0.10)] disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <option value="">
                            {!category
                              ? 'Select category first'
                              : subcategories.length === 0
                              ? 'No subcategories available'
                              : 'Select subcategory'}
                          </option>

                          {subcategories.map(
                            (item) => (
                              <option
                                key={item._id}
                                value={item._id}
                              >
                                {item.name}
                              </option>
                            )
                          )}

                        </select>

                      </div>

                      {category &&
                        subcategories.length === 0 && (
                          <p className="mt-2 text-xs text-[var(--nova-muted)]">
                            No subcategories have been created for this category yet.
                          </p>
                        )}

                    </div>

                  </div>

                </section>

                {/* =================================================
                    DESCRIPTION
                ================================================== */}

                <section className="overflow-hidden rounded-3xl border border-[var(--nova-border)] bg-[var(--nova-surface)] shadow-[var(--shadow-md)]">

                  <div className="border-b border-[var(--nova-border)] px-6 py-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--nova-lavender-soft)] text-[var(--nova-primary)]">
                        <FileText size={17} />
                      </div>

                      <div>

                        <h2 className="text-sm font-semibold text-[var(--nova-text)]">
                          Product Details
                        </h2>

                        <p className="mt-0.5 text-xs text-[var(--nova-muted)]">
                          Describe what makes this product special.
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="space-y-5 p-6">

                    {/* DESCRIPTION */}

                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <label
                          htmlFor="description"
                          className="text-xs font-semibold text-[var(--nova-text)]"
                        >
                          Short Description
                        </label>

                        <span className="text-[10px] text-[var(--nova-muted)]">
                          {description.length} characters
                        </span>

                      </div>

                      <textarea
                        name="description"
                        id="description"
                        rows="4"
                        value={description}
                        placeholder="Write a short description..."
                        onChange={handleChangeInput}
                        className="w-full resize-none rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--nova-text)] outline-none transition placeholder:text-[var(--nova-muted)] focus:border-[var(--nova-primary)] focus:bg-[var(--nova-surface)] focus:ring-4 focus:ring-[rgba(139,92,246,0.10)]"
                      />

                    </div>

                    {/* CONTENT */}

                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <label
                          htmlFor="content"
                          className="text-xs font-semibold text-[var(--nova-text)]"
                        >
                          Full Product Content
                        </label>

                        <span className="text-[10px] text-[var(--nova-muted)]">
                          {content.length} characters
                        </span>

                      </div>

                      <textarea
                        name="content"
                        id="content"
                        rows="8"
                        value={content}
                        placeholder="Write detailed product information..."
                        onChange={handleChangeInput}
                        className="w-full resize-none rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--nova-text)] outline-none transition placeholder:text-[var(--nova-muted)] focus:border-[var(--nova-primary)] focus:bg-[var(--nova-surface)] focus:ring-4 focus:ring-[rgba(139,92,246,0.10)]"
                      />

                    </div>

                  </div>

                </section>

              </div>

              {/* =================================================
                  RIGHT COLUMN
              ================================================== */}

              <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">

                {/* =================================================
                    MEDIA
                ================================================== */}

                <section className="overflow-hidden rounded-3xl border border-[var(--nova-border)] bg-[var(--nova-surface)] shadow-[var(--shadow-md)]">

                  <div className="border-b border-[var(--nova-border)] px-6 py-5">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--nova-lavender-soft)] text-[var(--nova-primary)]">
                          <ImagePlus size={17} />
                        </div>

                        <div>

                          <h2 className="text-sm font-semibold text-[var(--nova-text)]">
                            Product Images
                          </h2>

                          <p className="mt-0.5 text-xs text-[var(--nova-muted)]">
                            {images.length}/5 images
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                  <div className="p-6">

                    {/* UPLOAD */}

                    <label
                      htmlFor="product-images"
                      className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-6 py-8 text-center transition hover:border-[var(--nova-violet-light)] hover:bg-[var(--nova-surface)]"
                    >

                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--nova-surface)] shadow-[var(--shadow-sm)] ring-1 ring-gray-100 transition group-hover:scale-105">

                        <Upload
                          size={19}
                          className="text-[var(--nova-muted)]"
                        />

                      </div>

                      <p className="text-sm font-semibold text-[var(--nova-text)]">
                        Upload product images
                      </p>

                      <p className="mt-1 text-xs text-[var(--nova-muted)]">
                        PNG or JPG • Maximum 1MB each
                      </p>

                      <p className="mt-2 text-[10px] text-[var(--nova-muted)]">
                        Up to 5 images
                      </p>

                      <input
                        id="product-images"
                        type="file"
                        multiple
                        accept="image/jpeg,image/png"
                        onChange={handleUploadInput}
                        className="hidden"
                      />

                    </label>

                    {/* IMAGE PREVIEW */}

                    {images.length > 0 && (

                      <div className="mt-5 grid grid-cols-2 gap-3">

                        {images.map(
                          (img, index) => {

                            const imageSrc =
                              img?.url
                                ? img.url
                                : img
                                ? URL.createObjectURL(
                                    img
                                  )
                                : ''

                            return (
                              <div
                                key={index}
                                className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)]"
                              >

                                {imageSrc && (
                                  <img
                                    src={imageSrc}
                                    alt={`Product ${index + 1}`}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                  />
                                )}

                                {/* NUMBER */}

                                <span className="absolute left-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-md bg-black/70 px-1.5 text-[10px] font-semibold text-white backdrop-blur">
                                  {index + 1}
                                </span>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteImage(
                                      index
                                    )
                                  }
                                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--nova-surface)]/90 text-[var(--nova-muted)] opacity-0 shadow-[var(--shadow-sm)] backdrop-blur transition group-hover:opacity-100 hover:bg-red-500 hover:text-white"
                                >
                                  <X size={14} />
                                </button>

                              </div>
                            )
                          }
                        )}

                      </div>

                    )}

                  </div>

                </section>

                {/* =================================================
                    PUBLISH CARD
                ================================================== */}

                <section className="overflow-hidden rounded-3xl border border-[var(--nova-border)] bg-[var(--nova-surface)] shadow-[var(--shadow-md)]">

                  <div className="p-6">

                    <div className="mb-5 flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--nova-success)_10%,transparent)] text-[var(--nova-success)]">
                        <Check size={17} />
                      </div>

                      <div>

                        <h3 className="text-sm font-semibold text-[var(--nova-text)]">
                          Ready to publish?
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-[var(--nova-muted)]">
                          Make sure all product information and images are correct before saving.
                        </p>

                      </div>

                    </div>

                    <button
                      type="submit"
                      disabled={
                        state.notify?.loading
                      }
                      className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-[var(--nova-primary-dark)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <Save size={16} />

                      {state.notify?.loading
                        ? 'Saving...'
                        : onEdit
                        ? 'Update Product'
                        : 'Create Product'}

                    </button>

                    {onEdit && (

                      <button
                        type="button"
                        onClick={() =>
                          router.push('/')
                        }
                        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--nova-border)] text-sm font-medium text-[var(--nova-muted)] transition hover:bg-[var(--nova-surface-soft)]"
                      >

                        <ArrowLeft size={15} />

                        Back to Products

                      </button>

                    )}

                  </div>

                </section>

                {/* =================================================
                    PRODUCT PREVIEW
                ================================================== */}

                <section className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-6 shadow-[var(--shadow-sm)]">

                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nova-muted)]">
                    Quick Preview
                  </p>

                  <div className="flex gap-4">

                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--nova-lavender-soft)] text-[var(--nova-primary)]">

                      {images[0] ? (

                        <img
                          src={
                            images[0]?.url
                              ? images[0].url
                              : URL.createObjectURL(
                                  images[0]
                                )
                          }
                          alt=""
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        <div className="flex h-full w-full items-center justify-center">

                          <ImagePlus
                            size={20}
                            className="text-[var(--nova-muted)]"
                          />

                        </div>

                      )}

                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-[var(--nova-text)]">
                        {title ||
                          'Product title'}
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--nova-muted)]">
                        {description ||
                          'Your product description will appear here.'}
                      </p>

                      <p className="mt-2 text-sm font-semibold text-[var(--nova-text)]">
                        {formatPrice(price)}
                      </p>

                    </div>

                  </div>

                  {/* CATEGORY PREVIEW */}

                  {category && (
                    <div className="mt-4 border-t border-[var(--nova-border)] pt-4">

                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nova-muted)]">
                        Category
                      </p>

                      <p className="mt-1 text-xs font-medium text-[var(--nova-text)]">

                        {
                          parentCategories.find(
                            (item) =>
                              item._id?.toString() ===
                              category?.toString()
                          )?.name
                        }

                        {subcategory && (
                          <>
                            <span className="mx-1 text-[var(--nova-muted)]">
                              /
                            </span>

                            {
                              subcategories.find(
                                (item) =>
                                  item._id?.toString() ===
                                  subcategory?.toString()
                              )?.name
                            }
                          </>
                        )}

                      </p>

                    </div>
                  )}

                </section>

              </div>

            </div>

          </form>

        </div>
      </main>
    </>
  )
}

const CreateProductPage = () => {
    return (
        <AuthGuard roles={['seller', 'admin']}>
            <ProductsManager/>
        </AuthGuard>
    )
}

export default CreateProductPage