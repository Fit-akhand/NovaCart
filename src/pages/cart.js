import Head from 'next/head'
import { useContext, useState, useEffect } from 'react'
import { DataContext } from '../../store/GlobalState'
import CartItem from '../../components/CartItem'
import Link from 'next/link'
import { getData, postData } from '../../utils/fetchData'
import { useRouter } from 'next/router'
import {
  ArrowRight,
  Lock,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react'

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
      const res = cart.reduce((prev, item) => {
        return prev + item.price * item.quantity
      }, 0)

      setTotal(res)
    }

    getTotal()
  }, [cart])

  useEffect(() => {
    const cartLocal = JSON.parse(
      localStorage.getItem('__next__cart01__devat')
    )

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
        payload: {
          error: 'Please add your address and mobile.',
        },
      })
    }

    let newCart = []

    for (const item of cart) {
      const res = await getData(`product/${item._id}`)

      if (res.product.inStock - item.quantity >= 0) {
        newCart.push(item)
      }
    }

    if (newCart.length < cart.length) {
      setCallback(!callback)

      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'The product is out of stock or the quantity is insufficient.',
        },
      })
    }

    dispatch({
      type: 'NOTIFY',
      payload: { loading: true },
    })

    postData(
      'order',
      {
        address,
        mobile,
        cart,
        total,
      },
      auth.token
    ).then((res) => {
      if (res.err) {
        return dispatch({
          type: 'NOTIFY',
          payload: { error: res.err },
        })
      }

      dispatch({
        type: 'ADD_CART',
        payload: [],
      })

      const newOrder = {
        ...res.newOrder,
        user: auth.user,
      }

      dispatch({
        type: 'ADD_ORDERS',
        payload: [...orders, newOrder],
      })

      dispatch({
        type: 'NOTIFY',
        payload: { success: res.msg },
      })

      return router.push(`/order/${res.newOrder._id}`)
    })
  }

  if (cart.length === 0) {
    return (
      <>
        <Head>
          <title>Your Cart | NovaCart</title>
        </Head>

        <div className="min-h-[75vh] flex items-center justify-center bg-[#fafafa] px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
              <ShoppingBag size={38} strokeWidth={1.5} />
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
              Your cart is empty
            </h1>

            <p className="mt-3 text-gray-500">
              Looks like you haven't added anything to your cart yet.
            </p>

            <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800">
                Continue Shopping
                <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Your Cart | NovaCart</title>
        <meta
          name="description"
          content="Review your NovaCart items and complete your purchase."
        />
      </Head>

      <main className="min-h-screen bg-[#fafafa]">
        {/* Header */}
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  NovaCart
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                  Shopping Cart
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} in your
                  cart
                </p>
              </div>

              <div className="hidden items-center gap-2 text-xs text-gray-500 sm:flex">
                <ShieldCheck size={17} />
                Secure checkout
              </div>
            </div>
          </div>
        </section>

        {/* Main */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_390px]">
            {/* Cart */}
            <div>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-7">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Your Items
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Review your products before checkout
                    </p>
                  </div>

                  <ShoppingBag size={20} className="text-gray-400" />
                </div>

                <div className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <CartItem
                      key={item._id}
                      item={item}
                      dispatch={dispatch}
                      cart={cart}
                    />
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <Truck size={19} className="mb-3 text-gray-800" />
                  <p className="text-sm font-medium text-gray-900">
                    Fast Delivery
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Quick & reliable shipping
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <ShieldCheck size={19} className="mb-3 text-gray-800" />
                  <p className="text-sm font-medium text-gray-900">
                    Secure Payment
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Your payment is protected
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <Lock size={19} className="mb-3 text-gray-800" />
                  <p className="text-sm font-medium text-gray-900">
                    Safe Checkout
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Your information stays private
                  </p>
                </div>
              </div>
            </div>

            {/* Checkout */}
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order Summary
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Complete your details to place your order
                  </p>
                </div>

                <div className="px-6 py-6">
                  {/* Shipping */}
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-gray-900">
                      Shipping Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="address"
                          className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-600"
                        >
                          <MapPin size={14} />
                          Delivery Address
                        </label>

                        <textarea
                          id="address"
                          name="address"
                          rows="3"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter your full delivery address"
                          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/5"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="mobile"
                          className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-600"
                        >
                          <Phone size={14} />
                          Mobile Number
                        </label>

                        <input
                          type="tel"
                          name="mobile"
                          id="mobile"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="Enter your mobile number"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="my-6 border-t border-gray-100 pt-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Subtotal
                      </span>
                      <span className="font-medium text-gray-900">
                        ${total.toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Shipping
                      </span>
                      <span className="font-medium text-green-600">
                        Free
                      </span>
                    </div>

                    <div className="my-5 border-t border-dashed border-gray-200" />

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Total
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Including applicable taxes
                        </p>
                      </div>

                      <span className="text-2xl font-semibold tracking-tight text-gray-900">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  {auth.user ? (
                    <button
                      type="button"
                      onClick={handlePayment}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99]"
                    >
                      Proceed to Payment
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  ) : (
                    <Link href="/signin" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800">
                        Sign in to Checkout
                        <ArrowRight
                          size={17}
                          className="transition-transform group-hover:translate-x-1"
                        />
                    </Link>
                  )}

                  <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-400">
                    <Lock size={12} />
                    Secure and encrypted checkout
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  )
}

export default Cart
