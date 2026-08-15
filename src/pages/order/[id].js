import Head from 'next/head'
import { useContext, useEffect, useState } from 'react'
import { DataContext } from '../../../store/GlobalState'
import { useRouter } from 'next/router'
import OrderDetail from '../../../components/OrderDetail'
import Container from '../../../components/common/Container'
import Badge from '../../../components/common/Badge'
import Loading from '../../../components/common/Loading'
import { ArrowLeft } from 'lucide-react'

const DetailOrder = () => {
  const { state, dispatch } = useContext(DataContext)
  const { orders, auth } = state
  const router = useRouter()
  const [orderDetail, setOrderDetail] = useState([])

  useEffect(() => {
    if (!router.query.id || !orders) return
    setOrderDetail(orders.filter((order) => order._id === router.query.id))
  }, [router.query.id, orders])

  if (!auth.user) return null

  const order = orderDetail[0]

  return (
    <>
      <Head>
        <title>
          {order ? `Order #${order._id.slice(-8)} | NovaCart` : 'Order Details | NovaCart'}
        </title>
      </Head>

      <main className="py-8 sm:py-10">
        <Container>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 text-sm font-semibold"
          >
            <ArrowLeft size={15} />
            Back
          </button>

          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold">Order details</h1>
              {order && <p className="mt-2 font-mono text-xs text-[var(--nova-muted)]">#{order._id}</p>}
            </div>
            {order && (
              <div className="flex flex-wrap gap-2">
                <Badge variant={order.paid ? 'success' : 'warning'}>
                  {order.paid ? 'Payment confirmed' : 'Payment pending'}
                </Badge>
                <Badge variant={order.delivered ? 'success' : 'default'}>
                  {order.delivered ? 'Delivered' : 'Processing'}
                </Badge>
              </div>
            )}
          </div>

          {orderDetail.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">
              <OrderDetail orderDetail={orderDetail} state={state} dispatch={dispatch} />
            </div>
          ) : (
            <Loading text="Loading order..." />
          )}
        </Container>
      </main>
    </>
  )
}

export default DetailOrder
