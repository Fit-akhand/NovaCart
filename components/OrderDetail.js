import Link from 'next/link'
import { formatPrice } from '@/lib/formatPrice'
import PaypalBtn from './paypalBtn'
import { patchData } from '@/lib/api-client'
import { updateItem } from '../store/Actions'
import Badge from './common/Badge'
import Button from './common/Button'

const OrderDetail = ({ orderDetail, state, dispatch }) => {
  const { auth, orders } = state

  const handleDelivered = (order) => {
    dispatch({ type: 'NOTIFY', payload: { loading: true } })

    patchData(`order/delivered/${order._id}`, null, auth.token).then((res) => {
      if (res.err) return dispatch({ type: 'NOTIFY', payload: { error: res.err } })

      const { paid, dateOfPayment, method, delivered } = res.result
      dispatch(
        updateItem(
          orders,
          order._id,
          { ...order, paid, dateOfPayment, method, delivered },
          'ADD_ORDERS'
        )
      )
      return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
    })
  }

  if (!auth.user) return null

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {orderDetail.map((order) => (
        <div key={order._id} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="break-all text-lg font-semibold">Order {order._id}</h2>

            <div className="mt-6 space-y-2 text-sm">
              <h3 className="text-base font-semibold">Shipping</h3>
              <p>Name: {order.user.name}</p>
              <p>Email: {order.user.email}</p>
              <p>Address: {order.address}</p>
              <p>Mobile: {order.mobile}</p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Badge variant={order.delivered ? 'success' : 'warning'}>
                  {order.delivered ? `Delivered on ${order.updatedAt}` : 'Not delivered'}
                </Badge>
                {auth.user.role === 'admin' && !order.delivered && (
                  <Button onClick={() => handleDelivered(order)}>Mark as delivered</Button>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <h3 className="text-base font-semibold">Payment</h3>
              {order.method && <p>Method: {order.method}</p>}
              {order.paymentId && <p>Payment ID: {order.paymentId}</p>}
              <Badge variant={order.paid ? 'success' : 'warning'}>
                {order.paid ? `Paid on ${order.dateOfPayment}` : 'Not paid'}
              </Badge>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-base font-semibold">Order items</h3>
              <div className="divide-y divide-[var(--nova-border)] rounded-xl border border-[var(--nova-border)]">
                {order.cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 p-3">
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                    <Link href={`/product/${item._id}`} className="flex-1 text-sm font-medium hover:text-[var(--nova-blue)]">
                      {item.title}
                    </Link>
                    <span className="text-sm text-[var(--nova-muted)]">
                      {item.quantity} × {formatPrice(item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {!order.paid && auth.user.role !== 'admin' && (
            <div className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] p-5">
              <h2 className="mb-4 text-lg font-semibold">Total: {formatPrice(order.total)}</h2>
              <PaypalBtn order={order} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default OrderDetail
