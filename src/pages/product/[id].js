import Head from 'next/head'
import { useState, useContext } from 'react'
import { getData } from '@/lib/api-client'
import { DataContext } from '../../../store/GlobalState'
import { addToCart } from '../../../store/Actions'
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingBag,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react'

const DetailProduct = ({ product }) => {
  const [tab, setTab] = useState(0)

  const { state, dispatch } = useContext(DataContext)
  const { cart } = state

  // Safety check
  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f8f8]">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Product not found
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            This product may have been removed or is unavailable.
          </p>
        </div>
      </main>
    )
  }

  // Safety check for images
  const images = Array.isArray(product.images)
    ? product.images.filter((img) => img?.url)
    : []

  const hasImages = images.length > 0

  // Prevent invalid image index
  const currentTab =
    hasImages && tab < images.length
      ? tab
      : 0

  const currentImage = hasImages
    ? images[currentTab].url
    : null

  const nextImage = () => {
    if (images.length <= 1) return

    setTab((prev) =>
      prev >= images.length - 1
        ? 0
        : prev + 1
    )
  }

  const previousImage = () => {
    if (images.length <= 1) return

    setTab((prev) =>
      prev <= 0
        ? images.length - 1
        : prev - 1
    )
  }

  const handleAddToCart = () => {
    if (!product.inStock || product.inStock <= 0) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: 'This product is currently out of stock.',
        },
      })
    }

    dispatch(addToCart(product, cart))
  }

  return (
    <>
      <Head>
        <title>
          {product.title
            ? `${product.title} | NovaCart`
            : 'Product | NovaCart'}
        </title>

        <meta
          name="description"
          content={
            product.description ||
            'View product details on NovaCart.'
          }
        />
      </Head>

      <main className="min-h-screen bg-[#f8f8f8]">

        {/* =================================================
            PRODUCT
        ================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

          {/* Breadcrumb */}

          <div className="mb-7 flex items-center gap-2 text-xs text-gray-400">

            <span>NovaCart</span>

            <ChevronRight size={13} />

            <span>Products</span>

            <ChevronRight size={13} />

            <span className="max-w-[220px] truncate text-gray-700">
              {product.title}
            </span>

          </div>


          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">

            {/* =================================================
                LEFT — IMAGE GALLERY
            ================================================== */}

            <div>

              <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                <div className="aspect-square w-full sm:aspect-[4/3]">

                  {hasImages ? (

                    <img
                      src={currentImage}
                      alt={product.title}
                      className="h-full w-full object-contain p-6 transition duration-700 group-hover:scale-[1.03] sm:p-10"
                    />

                  ) : (

                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No image available
                    </div>

                  )}

                </div>


                {/* Image counter */}

                {hasImages && (

                  <div className="absolute left-5 top-5 rounded-full bg-black/80 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur">

                    {currentTab + 1} / {images.length}

                  </div>

                )}


                {/* Navigation */}

                {images.length > 1 && (

                  <>

                    <button
                      type="button"
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-700 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 hover:bg-black hover:text-white"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={18} />
                    </button>


                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-700 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 hover:bg-black hover:text-white"
                      aria-label="Next image"
                    >
                      <ChevronRight size={18} />
                    </button>

                  </>

                )}

              </div>


              {/* Thumbnails */}

              {hasImages && (

                <div className="mt-4 grid grid-cols-5 gap-3">

                  {images.map((img, index) => (

                    <button
                      key={`${img.url}-${index}`}
                      type="button"
                      onClick={() => setTab(index)}
                      className={`group relative aspect-square overflow-hidden rounded-xl border-2 bg-white transition ${
                        currentTab === index
                          ? 'border-black'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >

                      <img
                        src={img.url}
                        alt={`${product.title} ${index + 1}`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      {currentTab === index && (

                        <div className="absolute inset-0 bg-black/5" />

                      )}

                    </button>

                  ))}

                </div>

              )}

            </div>


            {/* =================================================
                RIGHT — PRODUCT INFORMATION
            ================================================== */}

            <div className="flex flex-col">

              {/* Status */}

              <div className="mb-4 flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Premium Collection
                </span>

                {product.inStock > 0 ? (

                  <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-semibold text-green-600">

                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                    In Stock

                  </span>

                ) : (

                  <span className="rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-semibold text-red-500">
                    Out of Stock
                  </span>

                )}

              </div>


              {/* Title */}

              <h1 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-gray-950 sm:text-4xl lg:text-5xl">
                {product.title}
              </h1>


              {/* Rating */}

              <div className="mt-5 flex items-center gap-3">

                <div className="flex items-center gap-1">

                  {[1, 2, 3, 4, 5].map((star) => (

                    <Star
                      key={star}
                      size={15}
                      className="fill-black text-black"
                    />

                  ))}

                </div>

                <span className="text-xs text-gray-400">
                  Premium product
                </span>

              </div>


              {/* Price */}

              <div className="mt-7 border-y border-gray-200 py-6">

                <p className="text-3xl font-semibold tracking-tight text-gray-950">
                  ${product.price}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Inclusive of applicable taxes
                </p>

              </div>


              {/* Description */}

              {product.description && (

                <div className="mt-7">

                  <p className="text-sm leading-7 text-gray-600">
                    {product.description}
                  </p>

                </div>

              )}


              {/* Stock information */}

              <div className="mt-7 grid grid-cols-2 gap-3">

                <div className="rounded-xl border border-gray-200 bg-white p-4">

                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                    <Package size={15} />
                  </div>

                  <p className="text-[10px] uppercase tracking-wider text-gray-400">
                    Availability
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {product.inStock > 0
                      ? `${product.inStock} available`
                      : 'Out of stock'}
                  </p>

                </div>


                <div className="rounded-xl border border-gray-200 bg-white p-4">

                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                    <ShoppingBag size={15} />
                  </div>

                  <p className="text-[10px] uppercase tracking-wider text-gray-400">
                    Sold
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {product.sold || 0} units
                  </p>

                </div>

              </div>


              {/* CTA */}

              <div className="mt-7">

                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                  className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                >

                  <ShoppingBag size={18} />

                  {product.inStock > 0
                    ? 'Add to cart'
                    : 'Out of stock'}

                  {product.inStock > 0 && (

                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />

                  )}

                </button>

              </div>


              {/* Trust features */}

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">

                <div className="flex items-center gap-3 rounded-xl bg-white p-3.5">

                  <Truck
                    size={17}
                    className="shrink-0 text-gray-700"
                  />

                  <div>

                    <p className="text-[11px] font-semibold text-gray-900">
                      Fast delivery
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Reliable shipping
                    </p>

                  </div>

                </div>


                <div className="flex items-center gap-3 rounded-xl bg-white p-3.5">

                  <ShieldCheck
                    size={17}
                    className="shrink-0 text-gray-700"
                  />

                  <div>

                    <p className="text-[11px] font-semibold text-gray-900">
                      Secure payment
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Protected checkout
                    </p>

                  </div>

                </div>


                <div className="flex items-center gap-3 rounded-xl bg-white p-3.5">

                  <Check
                    size={17}
                    className="shrink-0 text-gray-700"
                  />

                  <div>

                    <p className="text-[11px] font-semibold text-gray-900">
                      Quality assured
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Carefully selected
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              PRODUCT DESCRIPTION
          ================================================== */}

          {product.content && (

            <section className="mt-10 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-6 py-5 sm:px-8">

                <h2 className="text-lg font-semibold tracking-tight text-gray-950">
                  Product Details
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Everything you need to know about this product.
                </p>

              </div>


              <div className="max-w-4xl px-6 py-7 sm:px-8">

                <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
                  {product.content}
                </p>

              </div>

            </section>

          )}

        </section>

      </main>
    </>
  )
}


export async function getServerSideProps({
  params,
}) {
  try {
    const res = await getData(
      `product/${params.id}`
    )

    if (!res || res.err || !res.product) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        product: res.product,
      },
    }

  } catch (error) {
    console.error(
      'Product fetch error:',
      error
    )

    return {
      notFound: true,
    }
  }
}


export default DetailProduct
