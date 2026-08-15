import Head from 'next/head'
import { useContext, useState, useEffect } from 'react'
import { DataContext } from '../../store/GlobalState'
import CartItem from '../../components/CartItem'
import Link from 'next/link'
import { getData, postData } from '@/lib/api-client'
import { useRouter } from 'next/router'
import Container from '../../components/common/Container'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import { Lock, MapPin, Phone, ShoppingBag } from 'lucide-react'

const Cart = () => {
  const { state, dispatch } = useContext(DataContext)
  const { cart, auth, orders } = state
  const [total, setTotal] = useState(0)
  const [address, setAddress] = useState('')
  const [mobile, setMobile] = useState('')
  const [callback, setCallback] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getTotal = () => {
      const res = cart.reduce((prev, item) => prev + item.price * item.quantity, 0)
      setTotal(res)
    }
    getTotal()
  }, [cart])

  useEffect(() => {
    if (auth?.user) {
      const parts = [auth.user.address, auth.user.city, auth.user.state, auth.user.pincode]
        .filter(Boolean)
        .join(', ')
      if (parts) setAddress((current) => current || parts)
      if (auth.user.phone) setMobile((current) => current || auth.user.phone)
    }
  }, [auth?.user])

  useEffect(() => {
    const cartLocal = JSON.parse(localStorage.getItem('__next__cart01__devat'))

    if (cartLocal && cartLocal.length > 0) {
      let newArr = []
      const updateCart = async () => {
        for (const item of cartLocal) {
          const res = await getData(`product/${item._id}`)
          const { _id, title, images, price, inStock, sold } = res.product
          if (inStock > 0) {
            newArr.push({
              _id,
              title,
              images,
              price,
              inStock,
              sold,
              quantity: item.quantity > inStock ? 1 : item.quantity,
            })
          }
        }
        dispatch({ type: 'ADD_CART', payload: newArr })
      }
      updateCart()
    }
  }, [callback, dispatch])

  const handlePayment = async () => {
    if (!address || !mobile) {
      return dispatch({
        type: 'NOTIFY',
        payload: { error: 'Please add your address and mobile.' },
      })
    }

    let newCart = []
    for (const item of cart) {
      const res = await getData(`product/${item._id}`)
      if (res.product.inStock - item.quantity >= 0) newCart.push(item)
    }

    if (newCart.length < cart.length) {
      setCallback(!callback)
      return dispatch({
        type: 'NOTIFY',
        payload: { error: 'The product is out of stock or the quantity is insufficient.' },
      })
    }

    dispatch({ type: 'NOTIFY', payload: { loading: true } })

    postData('order', { address, mobile, cart, total }, auth.token).then((res) => {
      if (res.err) return dispatch({ type: 'NOTIFY', payload: { error: res.err } })

      dispatch({ type: 'ADD_CART', payload: [] })
      dispatch({
        type: 'ADD_ORDERS',
        payload: [...orders, { ...res.newOrder, user: auth.user }],
      })
      dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
      return router.push(`/order/${res.newOrder._id}`)
    })
  }

  if (cart.length === 0) {
    return (
      <>
        <Head>
          <title>Your Cart | NovaCart</title>
        </Head>
        <Container className="py-16">
          <EmptyState
            title="Your cart is empty"
            description="Looks like you have not added anything to your cart yet."
            action={
              <Link href="/products">
                <Button>Continue shopping</Button>
              </Link>
            }
          />
        </Container>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Your Cart | NovaCart</title>
      </Head>

      <main className="py-8 sm:py-10">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Shopping cart</h1>
            <p className="mt-2 text-sm text-[var(--nova-muted)]">
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            <div className="overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">
              <div className="divide-y divide-[var(--nova-border)]">
                {cart.map((item) => (
                  <CartItem key={item._id} item={item} dispatch={dispatch} cart={cart} />
                ))}
              </div>
            </div>

            <aside className="h-fit rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="address" className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <MapPin size={14} />
                    Delivery address
                  </label>
                  <textarea
                    id="address"
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full delivery address"
                    className="w-full resize-none rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--nova-blue)]"
                  />
                </div>
                <div>
                  <label htmlFor="mobile" className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Phone size={14} />
                    Mobile number
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--nova-blue)]"
                  />
                </div>
              </div>

              <div className="my-6 border-t border-[var(--nova-border)] pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--nova-muted)]">Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-semibold">${total.toFixed(2)}</span>
                </div>
              </div>

              {auth.user ? (
                <Button onClick={handlePayment} className="w-full">
                  Proceed to payment
                </Button>
              ) : (
                <Link href="/signin">
                  <Button className="w-full">Sign in to checkout</Button>
                </Link>
              )}

              <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[var(--nova-muted)]">
                <Lock size={12} />
                Secure checkout
              </p>
            </aside>
          </div>
        </Container>
      </main>
    </>
  )
}

export default Cart
