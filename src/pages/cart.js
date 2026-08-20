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
import { Lock, MapPin, Phone, User } from 'lucide-react'
import { formatPrice } from '@/lib/formatPrice'

const Cart = () => {
  const { state, dispatch } = useContext(DataContext)

  const {
    cart,
    auth,
    orders,
  } = state

  const [total, setTotal] = useState(0)

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  })

  const router = useRouter()

  // =========================================================
  // CALCULATE CART TOTAL
  // =========================================================

  useEffect(() => {
    if (!Array.isArray(cart)) {
      setTotal(0)
      return
    }

    const cartTotal = cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
        Number(item.quantity || 0),
      0
    )

    setTotal(cartTotal)
  }, [cart])

  // =========================================================
  // PREFILL USER INFORMATION
  // =========================================================

  useEffect(() => {
    if (!auth?.user) return

    setShippingAddress((current) => ({
      ...current,

      fullName:
        current.fullName ||
        auth.user.name ||
        auth.user.username ||
        '',

      phone:
        current.phone ||
        auth.user.phone ||
        '',

      address:
        current.address ||
        auth.user.address ||
        '',

      city:
        current.city ||
        auth.user.city ||
        '',

      state:
        current.state ||
        auth.user.state ||
        '',

      pincode:
        current.pincode ||
        auth.user.pincode ||
        '',
    }))
  }, [auth?.user])

  // =========================================================
  // ADDRESS INPUT HANDLER
  // =========================================================

  const handleAddressChange = (event) => {
    const {
      name,
      value,
    } = event.target

    setShippingAddress((current) => ({
      ...current,
      [name]: value,
    }))
  }

  // =========================================================
  // CHECKOUT
  // =========================================================

  const handlePayment = async () => {
    const {
      fullName,
      phone,
      address,
      addressLine2,
      city,
      state,
      pincode,
    } = shippingAddress

    // -------------------------------------------------------
    // REQUIRED FIELD VALIDATION
    // -------------------------------------------------------

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'Please complete all delivery address fields.',
        },
      })
    }

    // -------------------------------------------------------
    // PHONE VALIDATION
    // -------------------------------------------------------

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'Please enter a valid 10-digit mobile number.',
        },
      })
    }

    // -------------------------------------------------------
    // PINCODE VALIDATION
    // -------------------------------------------------------

    if (!/^\d{6}$/.test(pincode.trim())) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'Please enter a valid 6-digit PIN code.',
        },
      })
    }

    // -------------------------------------------------------
    // VERIFY CART AGAINST DATABASE
    // -------------------------------------------------------

    const newCart = []

    for (const item of cart) {
      const response =
        await getData(
          `product/${item._id}`
        )

      if (!response?.product) {
        return dispatch({
          type: 'NOTIFY',
          payload: {
            error:
              `Unable to verify ${item.title}. Please try again.`,
          },
        })
      }

      const currentProduct =
        response.product

      // -----------------------------------------------------
      // STOCK VALIDATION
      // -----------------------------------------------------

      if (
        Number(currentProduct.inStock) <
        Number(item.quantity)
      ) {
        return dispatch({
          type: 'NOTIFY',
          payload: {
            error:
              `${item.title} does not have enough stock.`,
          },
        })
      }

      // -----------------------------------------------------
      // ALWAYS USE SERVER PRICE
      // -----------------------------------------------------

      newCart.push({
        ...item,

        price:
          Number(currentProduct.price),

        inStock:
          Number(currentProduct.inStock),

        sold:
          Number(currentProduct.sold) || 0,

        quantity:
          Number(item.quantity),
      })
    }

    // -------------------------------------------------------
    // FINAL SERVER-VERIFIED TOTAL
    // -------------------------------------------------------

    const finalTotal =
      newCart.reduce(
        (sum, item) =>
          sum +
          Number(item.price) *
          Number(item.quantity),
        0
      )

    // -------------------------------------------------------
    // SHIPPING ADDRESS
    // -------------------------------------------------------

    const finalShippingAddress = {
      fullName:
        fullName.trim(),

      phone:
        phone.trim(),

      address:
        addressLine2.trim()
          ? `${address.trim()}, ${addressLine2.trim()}`
          : address.trim(),

      city:
        city.trim(),

      state:
        state.trim(),

      pincode:
        pincode.trim(),
    }

    // -------------------------------------------------------
    // LOADING
    // -------------------------------------------------------

    dispatch({
      type: 'NOTIFY',
      payload: {
        loading: true,
      },
    })

    // -------------------------------------------------------
    // CREATE ORDER
    // -------------------------------------------------------

    postData(
      'order',
      {
        shippingAddress:
          finalShippingAddress,

        cart:
          newCart,

        total:
          finalTotal,
      },
      auth.token
    ).then((response) => {

      // -----------------------------------------------------
      // API ERROR
      // -----------------------------------------------------

      if (response.err) {
        return dispatch({
          type: 'NOTIFY',
          payload: {
            error:
              response.err,
          },
        })
      }

      // -----------------------------------------------------
      // CLEAR CART
      // -----------------------------------------------------

      dispatch({
        type: 'ADD_CART',
        payload: [],
      })

      // -----------------------------------------------------
      // ADD ORDER TO GLOBAL STATE
      // -----------------------------------------------------

      dispatch({
        type: 'ADD_ORDERS',
        payload: [
          ...orders,
          {
            ...response.newOrder,
            user: auth.user,
          },
        ],
      })

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      dispatch({
        type: 'NOTIFY',
        payload: {
          success:
            response.msg,
        },
      })

      // -----------------------------------------------------
      // ORDER DETAILS
      // -----------------------------------------------------

      return router.push(
        `/order/${response.newOrder._id}`
      )
    })
  }

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (
    !Array.isArray(cart) ||
    cart.length === 0
  ) {
    return (
      <>
        <Head>
          <title>
            Your Cart | NovaCart
          </title>
        </Head>

        <Container className="py-16">

          <EmptyState
            title="Your cart is empty"
            description="Looks like you have not added anything to your cart yet."
            action={
              <Link href="/products">
                <Button>
                  Continue shopping
                </Button>
              </Link>
            }
          />

        </Container>
      </>
    )
  }

  // =========================================================
  // ITEM COUNT
  // =========================================================

  const itemCount =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0),
      0
    )

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <>
      <Head>
        <title>
          Your Cart | NovaCart
        </title>
      </Head>

      <main className="py-8 sm:py-10">

        <Container>

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8">

            <h1 className="text-3xl font-semibold">
              Shopping cart
            </h1>

            <p className="mt-2 text-sm text-[var(--nova-muted)]">
              {itemCount}{' '}
              {itemCount === 1
                ? 'item'
                : 'items'}
            </p>

          </div>

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">

            {/* =================================================
                CART ITEMS
            ================================================= */}

            <div className="overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">

              <div className="divide-y divide-[var(--nova-border)]">

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

            {/* =================================================
                BILLING / CHECKOUT
            ================================================= */}

            <aside className="h-fit rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-6 lg:sticky lg:top-24">

              <h2 className="text-xl font-semibold">
                Order summary
              </h2>

              {/* =================================================
                  DELIVERY INFORMATION
              ================================================= */}

              <div className="mt-6">

                <div className="mb-4">

                  <h3 className="text-sm font-semibold">
                    Delivery information
                  </h3>

                  <p className="mt-1 text-xs text-[var(--nova-muted)]">
                    Enter the complete address for delivery.
                  </p>

                </div>

                <div className="space-y-4">

                  {/* FULL NAME */}

                  <div>

                    <label
                      htmlFor="fullName"
                      className="mb-2 flex items-center gap-2 text-sm font-medium"
                    >
                      <User size={14} />
                      Full name
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={
                        shippingAddress.fullName
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--nova-blue)]"
                    />

                  </div>

                  {/* PHONE */}

                  <div>

                    <label
                      htmlFor="phone"
                      className="mb-2 flex items-center gap-2 text-sm font-medium"
                    >
                      <Phone size={14} />
                      Mobile number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={
                        shippingAddress.phone
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                      className="w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--nova-blue)]"
                    />

                  </div>

                  {/* ADDRESS */}

                  <div>

                    <label
                      htmlFor="address"
                      className="mb-2 flex items-center gap-2 text-sm font-medium"
                    >
                      <MapPin size={14} />
                      Full address
                    </label>

                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={
                        shippingAddress.address
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="House number, street, area"
                      autoComplete="street-address"
                      className="w-full resize-none rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--nova-blue)]"
                    />

                  </div>

                  {/* ADDRESS LINE 2 */}

                  <div>

                    <label
                      htmlFor="addressLine2"
                      className="mb-2 block text-sm font-medium"
                    >
                      Landmark / Apartment

                      <span className="ml-1 text-xs text-[var(--nova-muted)]">
                        (optional)
                      </span>
                    </label>

                    <input
                      id="addressLine2"
                      name="addressLine2"
                      type="text"
                      value={
                        shippingAddress.addressLine2
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="Apartment, landmark, etc."
                      autoComplete="address-line2"
                      className="w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--nova-blue)]"
                    />

                  </div>

                  {/* CITY + STATE */}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>

                      <label
                        htmlFor="city"
                        className="mb-2 block text-sm font-medium"
                      >
                        City
                      </label>

                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={
                          shippingAddress.city
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="City"
                        autoComplete="address-level2"
                        className="w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--nova-blue)]"
                      />

                    </div>

                    <div>

                      <label
                        htmlFor="state"
                        className="mb-2 block text-sm font-medium"
                      >
                        State
                      </label>

                      <input
                        id="state"
                        name="state"
                        type="text"
                        value={
                          shippingAddress.state
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="State"
                        autoComplete="address-level1"
                        className="w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--nova-blue)]"
                      />

                    </div>

                  </div>

                  {/* PINCODE */}

                  <div>

                    <label
                      htmlFor="pincode"
                      className="mb-2 block text-sm font-medium"
                    >
                      PIN code
                    </label>

                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={
                        shippingAddress.pincode
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="6-digit PIN code"
                      autoComplete="postal-code"
                      className="w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--nova-blue)]"
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  BILLING
              ================================================= */}

              <div className="my-6 border-t border-[var(--nova-border)] pt-5">

                <h3 className="mb-4 text-sm font-semibold">
                  Billing details
                </h3>

                {/* ITEMS */}

                <div className="flex items-center justify-between text-sm">

                  <span className="text-[var(--nova-muted)]">
                    Items
                  </span>

                  <span>
                    {itemCount}
                  </span>

                </div>

                {/* SUBTOTAL */}

                <div className="mt-3 flex items-center justify-between text-sm">

                  <span className="text-[var(--nova-muted)]">
                    Subtotal
                  </span>

                  <span>
                    {formatPrice(total)}
                  </span>

                </div>

                {/* DISCOUNT */}

                <div className="mt-3 flex items-center justify-between text-sm">

                  <span className="text-[var(--nova-muted)]">
                    Discount
                  </span>

                  <span className="text-emerald-500">
                    {formatPrice(0)}
                  </span>

                </div>

                {/* DELIVERY */}

                <div className="mt-3 flex items-center justify-between text-sm">

                  <span className="text-[var(--nova-muted)]">
                    Delivery
                  </span>

                  <span className="font-medium text-emerald-500">
                    FREE
                  </span>

                </div>

                <div className="my-5 border-t border-[var(--nova-border)]" />

                {/* TOTAL */}

                <div className="flex items-end justify-between">

                  <div>

                    <p className="font-semibold">
                      Total
                    </p>

                    <p className="mt-1 text-xs text-[var(--nova-muted)]">
                      Inclusive of delivery
                    </p>

                  </div>

                  <span className="text-2xl font-semibold">
                    {formatPrice(total)}
                  </span>

                </div>

              </div>

              {/* =================================================
                  CHECKOUT BUTTON
              ================================================= */}

              {auth?.user ? (

                <Button
                  onClick={handlePayment}
                  className="w-full"
                >
                  Proceed to payment
                </Button>

              ) : (

                <Link
                  href={{
                    pathname: '/signin',
                    query: {
                      returnUrl: '/cart',
                    },
                  }}
                >
                  <Button className="w-full">
                    Sign in to checkout
                  </Button>
                </Link>

              )}

              {/* =================================================
                  SECURITY
              ================================================= */}

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