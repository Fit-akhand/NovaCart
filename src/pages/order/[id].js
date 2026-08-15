import Head from 'next/head'
import { useContext, useEffect, useState } from 'react'
import { DataContext } from '../../../store/GlobalState'
import { useRouter } from 'next/router'
import OrderDetail from '../../../components/OrderDetail'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Package,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react'

const DetailOrder = () => {
  const { state, dispatch } = useContext(DataContext)
  const { orders, auth } = state

  const router = useRouter()

  const [orderDetail, setOrderDetail] = useState([])

  useEffect(() => {
    if (!router.query.id || !orders) return

    const newArr = orders.filter(
      (order) => order._id === router.query.id
    )

    setOrderDetail(newArr)
  }, [router.query.id, orders])

  if (!auth.user) return null

  const order = orderDetail[0]

  return (
    <>
      <Head>
        <title>
          {order
            ? `Order #${order._id.slice(-8)} | NovaCart`
            : 'Order Details | NovaCart'}
        </title>

        <meta
          name="description"
          content="View your NovaCart order details and delivery status."
        />
      </Head>

      <main className="min-h-screen bg-[#f8f8f8]">

        {/* =================================================
            HEADER
        ================================================== */}

        <section className="border-b border-gray-200 bg-white">

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowLeft size={15} />
              Back
            </button>


            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                    <Package size={15} />
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                    NovaCart Orders
                  </span>

                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                  Order Details
                </h1>

                {order && (
                  <p className="mt-2 font-mono text-xs text-gray-400">
                    #{order._id}
                  </p>
                )}

              </div>


              {order && (

                <div className="flex flex-wrap gap-2">

                  {order.paid ? (

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-semibold text-green-600">
                      <CheckCircle2 size={13} />
                      Payment Confirmed
                    </span>

                  ) : (

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-600">
                      <Clock3 size={13} />
                      Payment Pending
                    </span>

                  )}


                  {order.delivered ? (

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-semibold text-green-600">
                      <CheckCircle2 size={13} />
                      Delivered
                    </span>

                  ) : (

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-semibold text-gray-500">
                      <Clock3 size={13} />
                      Processing
                    </span>

                  )}

                </div>

              )}

            </div>

          </div>

        </section>


        {/* =================================================
            ORDER CONTENT
        ================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          {orderDetail.length > 0 ? (

            <>

              {/* Order summary */}

              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                    <ShoppingBag size={17} />
                  </div>

                  <p className="text-xs text-gray-400">
                    Order Total
                  </p>

                  <p className="mt-1 text-xl font-semibold text-gray-900">
                    ${order.total}
                  </p>

                </div>


                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                    <Package size={17} />
                  </div>

                  <p className="text-xs text-gray-400">
                    Items
                  </p>

                  <p className="mt-1 text-xl font-semibold text-gray-900">
                    {order.cart?.length || 0}
                  </p>

                </div>


                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                    <ShieldCheck size={17} />
                  </div>

                  <p className="text-xs text-gray-400">
                    Order Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {order.delivered
                      ? 'Delivered'
                      : 'Processing'}
                  </p>

                </div>

              </div>


              {/* Existing order detail */}

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                <OrderDetail
                  orderDetail={orderDetail}
                  state={state}
                  dispatch={dispatch}
                />

              </div>

            </>

          ) : (

            /* =================================================
                LOADING / NOT FOUND
            ================================================== */

            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white text-center shadow-sm">

              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">

                <Package
                  size={28}
                  className="text-gray-400"
                />

              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                Loading order...
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Please wait while we retrieve your order details.
              </p>

            </div>

          )}

        </section>

      </main>
    </>
  )
}

export default DetailOrder
