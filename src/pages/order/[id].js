import Head from 'next/head'
import { useContext, useEffect, useState } from 'react'
import { DataContext } from '../../../store/GlobalState'
import { useRouter } from 'next/router'
import OrderDetail from '../../../components/OrderDetail'
import Container from '../../../components/common/Container'
import Badge from '../../../components/common/Badge'
import Loading from '../../../components/common/Loading'
import { ArrowLeft, PackageCheck, ShieldCheck } from 'lucide-react'

const DetailOrder = () => {
  const { state, dispatch } = useContext(DataContext)
  const { orders, auth } = state
  const router = useRouter()
  const [orderDetail, setOrderDetail] = useState([])

  useEffect(() => {
    if (!router.query.id || !orders) return

    setOrderDetail(
      orders.filter(
        (order) =>
          order._id === router.query.id
      )
    )
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
      </Head>

      <main className="min-h-screen bg-[var(--nova-bg)] py-6 sm:py-8 lg:py-10">
        <Container>

          {/* =================================================
              BACK BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() => router.back()}
            className="
              mb-6
              inline-flex
              min-h-10
              items-center
              gap-2

              rounded-xl

              border
              border-[var(--nova-border)]

              bg-[var(--nova-surface)]

              px-4

              text-sm
              font-semibold
              text-[var(--nova-text)]

              shadow-[var(--shadow-md)]

              transition-all
              duration-200

              hover:-translate-x-0.5
              hover:border-[var(--nova-violet-light)]
              hover:bg-[var(--nova-lavender-soft)]
              hover:text-[var(--nova-primary)]
              hover:shadow-[0_8px_20px_rgba(124,58,237,0.10)]
            "
          >
            <ArrowLeft size={15} />
            Back
          </button>

          {/* =================================================
              PAGE HEADER
          ================================================= */}

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
              py-6

              shadow-[var(--shadow-md)]

              sm:px-7
              sm:py-7
            "
          >

            {/* Violet glow */}

            <div
              className="
                pointer-events-none

                absolute
                -right-20
                -top-24

                h-56
                w-56

                rounded-full

                bg-[rgba(139,92,246,0.12)]

                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none

                absolute
                -bottom-24
                left-1/3

                h-40
                w-40

                rounded-full

                bg-[rgba(167,139,250,0.06)]

                blur-3xl
              "
            />

            <div
              className="
                relative

                flex
                flex-col
                justify-between
                gap-5

                sm:flex-row
                sm:items-end
              "
            >

              {/* LEFT */}

              <div>

                <div
                  className="
                    mb-3
                    inline-flex
                    items-center
                    gap-2

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
                  <PackageCheck size={12} />

                  Order
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
                  Order details
                </h1>

                {order && (
                  <p
                    className="
                      mt-2

                      break-all

                      font-mono
                      text-xs

                      text-[var(--nova-muted)]
                    "
                  >
                    #{order._id}
                  </p>
                )}

              </div>

              {/* STATUS */}

              {order && (
                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >

                  <Badge
                    variant={
                      order.paid
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {order.paid
                      ? 'Payment confirmed'
                      : 'Payment pending'}
                  </Badge>

                  <Badge
                    variant={
                      order.delivered
                        ? 'success'
                        : 'default'
                    }
                  >
                    {order.delivered
                      ? 'Delivered'
                      : 'Processing'}
                  </Badge>

                </div>
              )}

            </div>

          </div>

          {/* =================================================
              SECURITY / STATUS STRIP
          ================================================= */}

          {order && (
            <div
              className="
                mb-6

                grid
                grid-cols-1
                gap-3

                sm:grid-cols-2
              "
            >

              {/* PAYMENT */}

              <div
                className="
                  flex
                  items-center
                  gap-3

                  rounded-3xl

                  border
                  border-[var(--nova-border)]

                  bg-[var(--nova-surface)]

                  p-4

                  shadow-[var(--shadow-md)]
                  transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(124,58,237,0.08)]
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl

                    bg-[rgba(34,197,94,0.10)]

                    text-[var(--nova-success)]
                  "
                >
                  <ShieldCheck
                    size={18}
                  />
                </div>

                <div className="min-w-0">

                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider

                      text-[var(--nova-muted)]
                    "
                  >
                    Payment
                  </p>

                  <p
                    className="
                      mt-0.5

                      text-sm
                      font-semibold

                      text-[var(--nova-text)]
                    "
                  >
                    {order.paid
                      ? 'Payment verified'
                      : 'Payment pending'}
                  </p>

                </div>

              </div>

              {/* ORDER STATUS */}

              <div
                className="
                  flex
                  items-center
                  gap-3

                  rounded-3xl

                  border
                  border-[var(--nova-border)]

                  bg-[var(--nova-surface)]

                  p-4

                  shadow-[var(--shadow-md)]
                  transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(124,58,237,0.08)]
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl

                    bg-[var(--nova-lavender-soft)]

                    text-[var(--nova-primary)]
                  "
                >
                  <PackageCheck
                    size={18}
                  />
                </div>

                <div className="min-w-0">

                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider

                      text-[var(--nova-muted)]
                    "
                  >
                    Order status
                  </p>

                  <p
                    className="
                      mt-0.5

                      text-sm
                      font-semibold

                      text-[var(--nova-text)]
                    "
                  >
                    {order.delivered
                      ? 'Order delivered'
                      : 'Order processing'}
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* =================================================
              ORDER CONTENT
          ================================================= */}

          {orderDetail.length > 0 ? (

            <div
              className="
                overflow-hidden

                rounded-3xl

                border
                border-[var(--nova-border)]

                bg-[var(--nova-surface)]

                shadow-[var(--shadow-md)]
              "
            >

              <OrderDetail
                orderDetail={
                  orderDetail
                }
                state={state}
                dispatch={dispatch}
              />

            </div>

          ) : (

            <div
              className="
                rounded-3xl

                border
                border-[var(--nova-border)]

                bg-[var(--nova-surface)]

                p-8

                shadow-[var(--shadow-md)]
              "
            >
              <Loading
                text="Loading order..."
              />
            </div>

          )}

        </Container>
      </main>
    </>
  )
}

export default DetailOrder