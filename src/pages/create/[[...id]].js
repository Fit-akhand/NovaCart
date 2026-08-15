import Head from 'next/head'
import { useState, useContext, useEffect } from 'react'
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
  Plus,
  Save,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

const ProductsManager = () => {
  const initialState = {
    title: '',
    price: 0,
    inStock: 0,
    description: '',
    content: '',
    category: '',
  }

  const [product, setProduct] = useState(initialState)

  const {
    title,
    price,
    inStock,
    description,
    content,
    category,
  } = product

  const [images, setImages] = useState([])

  const { state, dispatch } = useContext(DataContext)
  const { categories, auth } = state

  const router = useRouter()
  const { id } = router.query

  const [onEdit, setOnEdit] = useState(false)

  useEffect(() => {
    if (id) {
      setOnEdit(true)

      getData(`product/${id}`).then((res) => {
        setProduct(res.product)
        setImages(res.product.images)
      })
    } else {
      setOnEdit(false)
      setProduct(initialState)
      setImages([])
    }
  }, [id])

  const handleChangeInput = (e) => {
    const { name, value } = e.target

    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }))

    dispatch({
      type: 'NOTIFY',
      payload: {},
    })
  }

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
        payload: { error: err },
      })
    }

    if (images.length + newImages.length > 5) {
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
  }

  const deleteImage = (index) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!auth.user || auth.user.role !== 'admin') {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: 'Authentication is not valid.',
        },
      })
    }

    if (
      !title ||
      !price ||
      !inStock ||
      !description ||
      !content ||
      !category ||
      category === 'all' ||
      images.length === 0
    ) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: 'Please complete all required fields.',
        },
      })
    }

    dispatch({
      type: 'NOTIFY',
      payload: {
        loading: true,
      },
    })

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

    let res

    if (onEdit) {
      res = await putData(
        `product/${id}`,
        {
          ...product,
          images: [
            ...imgOldURL,
            ...media,
          ],
        },
        auth.token
      )
    } else {
      res = await postData(
        'product',
        {
          ...product,
          images: [
            ...imgOldURL,
            ...media,
          ],
        },
        auth.token
      )
    }

    if (res.err) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: res.err,
        },
      })
    }

    return dispatch({
      type: 'NOTIFY',
      payload: {
        success: res.msg,
      },
    })
  }

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

      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          {/* =================================================
              HEADER
          ================================================== */}

          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                  <Package size={15} />
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  NovaCart Admin
                </span>

              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">

                {onEdit
                  ? 'Edit Product'
                  : 'Create Product'}

              </h1>

              <p className="mt-2 text-sm text-gray-500">

                {onEdit
                  ? 'Update product information, pricing and media.'
                  : 'Add a new product to your NovaCart catalog.'}

              </p>

            </div>


            {/* Status */}

            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 shadow-sm">

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


                {/* BASIC INFORMATION */}

                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                  <div className="border-b border-gray-100 px-6 py-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                        <Package size={17} />
                      </div>

                      <div>

                        <h2 className="text-sm font-semibold text-gray-900">
                          Basic Information
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                          Core information about your product.
                        </p>

                      </div>

                    </div>

                  </div>


                  <div className="space-y-5 p-6">

                    {/* Title */}

                    <div>

                      <label
                        htmlFor="title"
                        className="mb-2 block text-xs font-semibold text-gray-700"
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
                        className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
                      />

                    </div>


                    {/* Price / Stock */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <div>

                        <label
                          htmlFor="price"
                          className="mb-2 block text-xs font-semibold text-gray-700"
                        >
                          Price
                        </label>

                        <div className="relative">

                          <DollarSign
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          />

                          <input
                            type="number"
                            min="0"
                            name="price"
                            id="price"
                            value={price}
                            placeholder="0.00"
                            onChange={handleChangeInput}
                            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
                          />

                        </div>

                      </div>


                      <div>

                        <label
                          htmlFor="inStock"
                          className="mb-2 block text-xs font-semibold text-gray-700"
                        >
                          Stock Quantity
                        </label>

                        <div className="relative">

                          <Package
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          />

                          <input
                            type="number"
                            min="0"
                            name="inStock"
                            id="inStock"
                            value={inStock}
                            placeholder="0"
                            onChange={handleChangeInput}
                            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
                          />

                        </div>

                      </div>

                    </div>


                    {/* Category */}

                    <div>

                      <label
                        htmlFor="category"
                        className="mb-2 block text-xs font-semibold text-gray-700"
                      >
                        Category
                      </label>

                      <div className="relative">

                        <Tag
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <select
                          name="category"
                          id="category"
                          value={category}
                          onChange={handleChangeInput}
                          className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm capitalize text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
                        >

                          <option value="">
                            Select category
                          </option>

                          {categories.map((item) => (
                            <option
                              key={item._id}
                              value={item._id}
                            >
                              {item.name}
                            </option>
                          ))}

                        </select>

                      </div>

                    </div>

                  </div>

                </section>


                {/* DESCRIPTION */}

                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                  <div className="border-b border-gray-100 px-6 py-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                        <FileText size={17} />
                      </div>

                      <div>

                        <h2 className="text-sm font-semibold text-gray-900">
                          Product Details
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                          Describe what makes this product special.
                        </p>

                      </div>

                    </div>

                  </div>


                  <div className="space-y-5 p-6">

                    {/* Description */}

                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <label
                          htmlFor="description"
                          className="text-xs font-semibold text-gray-700"
                        >
                          Short Description
                        </label>

                        <span className="text-[10px] text-gray-400">
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
                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
                      />

                    </div>


                    {/* Content */}

                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <label
                          htmlFor="content"
                          className="text-xs font-semibold text-gray-700"
                        >
                          Full Product Content
                        </label>

                        <span className="text-[10px] text-gray-400">
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
                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
                      />

                    </div>

                  </div>

                </section>

              </div>


              {/* =================================================
                  RIGHT COLUMN
              ================================================== */}

              <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">


                {/* MEDIA */}

                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                  <div className="border-b border-gray-100 px-6 py-5">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                          <ImagePlus size={17} />
                        </div>

                        <div>

                          <h2 className="text-sm font-semibold text-gray-900">
                            Product Images
                          </h2>

                          <p className="mt-0.5 text-xs text-gray-400">
                            {images.length}/5 images
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>


                  <div className="p-6">

                    {/* Upload */}

                    <label
                      htmlFor="product-images"
                      className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center transition hover:border-gray-400 hover:bg-white"
                    >

                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition group-hover:scale-105">

                        <Upload
                          size={19}
                          className="text-gray-500"
                        />

                      </div>

                      <p className="text-sm font-semibold text-gray-900">
                        Upload product images
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        PNG or JPG • Maximum 1MB each
                      </p>

                      <p className="mt-2 text-[10px] text-gray-300">
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


                    {/* Image preview */}

                    {images.length > 0 && (

                      <div className="mt-5 grid grid-cols-2 gap-3">

                        {images.map((img, index) => (

                          <div
                            key={index}
                            className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                          >

                            <img
                              src={
                                img.url
                                  ? img.url
                                  : URL.createObjectURL(
                                      img
                                    )
                              }
                              alt={`Product ${index + 1}`}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />


                            {/* Number */}

                            <span className="absolute left-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-md bg-black/70 px-1.5 text-[10px] font-semibold text-white backdrop-blur">
                              {index + 1}
                            </span>


                            {/* Delete */}

                            <button
                              type="button"
                              onClick={() =>
                                deleteImage(index)
                              }
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-gray-600 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 hover:bg-red-500 hover:text-white"
                            >
                              <X size={14} />
                            </button>

                          </div>

                        ))}

                      </div>

                    )}

                  </div>

                </section>


                {/* PUBLISH CARD */}

                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                  <div className="p-6">

                    <div className="mb-5 flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                        <Check size={17} />
                      </div>

                      <div>

                        <h3 className="text-sm font-semibold text-gray-900">
                          Ready to publish?
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-gray-400">
                          Make sure all product information
                          and images are correct before saving.
                        </p>

                      </div>

                    </div>


                    <button
                      type="submit"
                      disabled={state.notify?.loading}
                      className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
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
                        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                      >

                        <ArrowLeft size={15} />

                        Back to Products

                      </button>

                    )}

                  </div>

                </section>


                {/* PRODUCT PREVIEW */}

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Quick Preview
                  </p>

                  <div className="flex gap-4">

                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">

                      {images[0] ? (

                        <img
                          src={
                            images[0].url
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
                            className="text-gray-300"
                          />
                        </div>

                      )}

                    </div>


                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-gray-900">
                        {title || 'Product title'}
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">
                        {description ||
                          'Your product description will appear here.'}
                      </p>

                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        ${price || '0.00'}
                      </p>

                    </div>

                  </div>

                </section>

              </div>

            </div>

          </form>

        </div>

      </main>
    </>
  )
}

export default ProductsManager
