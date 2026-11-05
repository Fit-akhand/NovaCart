import Head from 'next/head'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { useContext, useEffect, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'

import { DataContext } from '../../store/GlobalState'
import { getData, postData } from '@/lib/api-client'
import { formatPrice } from '@/lib/formatPrice'

import CartItem from '../../components/CartItem'
import Container from '../../components/common/Container'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import CheckoutSteps from '../../components/checkout/CheckoutSteps'
import OrderSummary from '../../components/checkout/OrderSummary'
import AddressStep from '../../components/checkout/AddressStep'

const EMPTY_ADDRESS = {
  fullName: '',
  phone: '',
  address: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
}

const fromSaved = (item) => ({
  fullName: item.fullName || '',
  phone: item.phone || '',
  address: item.address || '',
  addressLine2: item.landmark || '',
  city: item.city || '',
  state: item.state || '',
  pincode: item.pincode || '',
})

const Cart = () => {
  const { state, dispatch } = useContext(DataContext)
  const { cart, auth, orders, categories } = state
  const router = useRouter()

  // 'cart' -> 'delivery' (payment opens from here)
  const [step, setStep] = useState('cart')
  const [paying, setPaying] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const [address, setAddress] = useState(EMPTY_ADDRESS)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [saveNewAddress, setSaveNewAddress] = useState(false)

  const notifyError = (error) =>
    dispatch({ type: 'NOTIFY', payload: { error } })

  // ---------------------------------------------------------
  // Totals (display only: the server recalculates everything)
  // ---------------------------------------------------------

  const { subtotal, total, itemCount } = useMemo(() => {
    const items = Array.isArray(cart) ? cart : []

    const discountFor = (product) => {
      const find = (ref) =>
        categories?.find(
          (c) => String(c._id) === String(ref?._id || ref)
        )
      const sub = find(product.subcategory)
      const cat = find(product.category)

      if (sub?.discountActive === true)
        return Number(sub.discountPercent) || 0
      if (cat?.discountActive === true)
        return Number(cat.discountPercent) || 0
      return 0
    }

    let subtotal = 0
    let total = 0
    let itemCount = 0

    for (const item of items) {
      const qty = Number(item.quantity) || 0
      const price = Number(item.price) || 0
      const discounted =
        Math.round(price * (1 - discountFor(item) / 100) * 100) / 100

      subtotal += price * qty
      total += discounted * qty
      itemCount += qty
    }

    return { subtotal, total, itemCount }
  }, [cart, categories])

  // ---------------------------------------------------------
  // Addresses: saved ones first, else prefill from profile
  // ---------------------------------------------------------

  useEffect(() => {
    if (!auth?.user) return

    setAddress((current) => ({
      ...current,
      fullName: current.fullName || auth.user.name || '',
      phone: current.phone || auth.user.phone || '',
    }))
  }, [auth?.user])

  useEffect(() => {
    if (!auth?.token) return

    getData('address', auth.token)
      .then((res) => {
        const list = Array.isArray(res?.addresses) ? res.addresses : []
        setSavedAddresses(list)

        const preferred = list.find((a) => a.isDefault) || list[0]
        if (preferred) {
          setSelectedAddressId(preferred._id)
          setAddress(fromSaved(preferred))
        }
      })
      .catch(() => {})
  }, [auth?.token])

  const formOpen = savedAddresses.length === 0 || useNewAddress

  const handleChange = (e) => {
    const { name, value } = e.target
    setAddress((current) => ({ ...current, [name]: value }))
  }

  const handleSelect = (item) => {
    setUseNewAddress(false)
    setSelectedAddressId(item._id)
    setAddress(fromSaved(item))
  }

  const handleAddNew = () => {
    setUseNewAddress(true)
    setSelectedAddressId(null)
    setAddress({
      ...EMPTY_ADDRESS,
      fullName: auth?.user?.name || '',
      phone: auth?.user?.phone || '',
    })
  }

  // ---------------------------------------------------------
  // Step 1 -> 2
  // ---------------------------------------------------------

  const goToDelivery = () => {
    if (!auth?.token || !auth?.user) {
      return router.push('/signin?returnUrl=%2Fcart')
    }
    setStep('delivery')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ---------------------------------------------------------
  // Pay
  // ---------------------------------------------------------

  const validateAddress = () => {
    const a = address
    if (
      !a.fullName.trim() ||
      !a.phone.trim() ||
      !a.address.trim() ||
      !a.city.trim() ||
      !a.state.trim() ||
      !a.pincode.trim()
    ) {
      return 'Please complete all delivery address fields.'
    }
    if (!/^[6-9]\d{9}$/.test(a.phone.trim()))
      return 'Please enter a valid 10-digit mobile number.'
    if (!/^\d{6}$/.test(a.pincode.trim()))
      return 'Please enter a valid 6-digit PIN code.'
    return null
  }

  const handlePay = async () => {
    if (paying) return

    const problem = validateAddress()
    if (problem) return notifyError(problem)

    if (!window.Razorpay)
      return notifyError(
        'Payment is still loading. Please wait a moment and try again.'
      )

    setPaying(true)
    dispatch({ type: 'NOTIFY', payload: { loading: true } })

    try {
      const shippingAddress = {
        fullName: address.fullName.trim(),
        phone: address.phone.trim(),
        address: address.addressLine2.trim()
          ? `${address.address.trim()}, ${address.addressLine2.trim()}`
          : address.address.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
      }

      if (formOpen && saveNewAddress) {
        const saved = await postData(
          'address',
          {
            label: 'Home',
            ...shippingAddress,
            isDefault: savedAddresses.length === 0,
          },
          auth.token
        )
        if (saved?.err) return notifyError(saved.err)
      }

      // The server re-reads prices, discounts and stock.
      const created = await postData(
        'create-order',
        {
          cart: cart.map((i) => ({
            _id: i._id,
            title: i.title,
            quantity: Number(i.quantity),
          })),
          shippingAddress,
        },
        auth.token
      )

      if (created?.err) return notifyError(created.err)
      if (!created?.order_id)
        return notifyError('Unable to start payment. Please try again.')

      const checkout = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: created.amount,
        currency: created.currency || 'INR',
        order_id: created.order_id,
        name: 'NovaCart',
        description: 'NovaCart order payment',
        prefill: {
          name: shippingAddress.fullName,
          email: auth.user.email || '',
          contact: shippingAddress.phone,
        },
        theme: { color: '#7c3aed' },

        handler: async (response) => {
          dispatch({ type: 'NOTIFY', payload: { loading: true } })
          try {
            const verified = await postData(
              'verify-payment',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              auth.token
            )

            if (verified?.err || verified?.status !== 'success') {
              return notifyError(
                verified?.err ||
                  'Payment verification failed. If money was deducted, your order will be confirmed automatically.'
              )
            }

            dispatch({ type: 'ADD_CART', payload: [] })
            dispatch({
              type: 'ADD_ORDERS',
              payload: [
                ...orders,
                { ...verified.order, user: auth.user },
              ],
            })
            dispatch({
              type: 'NOTIFY',
              payload: { success: 'Payment successful! Order placed.' },
            })
            router.push(`/order/${verified.order._id}`)
          } catch (error) {
            console.error('Verify error:', error)
            notifyError(
              'Your payment went through, but we could not show your order yet. It will be confirmed automatically: check My Orders in your profile.'
            )
          }
        },

        modal: {
          ondismiss: () => notifyError('Payment cancelled. Your cart is safe.'),
        },
      })

      checkout.on('payment.failed', (response) =>
        notifyError(
          response?.error?.description ||
            'Payment failed. Please try again.'
        )
      )

      // Hide our loading overlay so the checkout window is usable.
      dispatch({ type: 'NOTIFY', payload: {} })
      checkout.open()
    } catch (error) {
      console.error('Checkout error:', error)
      notifyError(
        error?.message || 'Unable to start payment. Please try again.'
      )
    } finally {
      setPaying(false)
    }
  }

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <>
        <Head>
          <title>Your Cart | NovaCart</title>
        </Head>
        <Container className="min-h-[65vh] py-12 sm:py-16">
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

  const onDelivery = step === 'delivery'

  return (
    <>
      <Script
        id="razorpay-checkout"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onReady={() => setRazorpayLoaded(Boolean(window.Razorpay))}
        onLoad={() => setRazorpayLoaded(Boolean(window.Razorpay))}
        onError={() => notifyError('Unable to load Razorpay Checkout.')}
      />

      <Head>
        <title>{onDelivery ? 'Delivery' : 'Your Cart'} | NovaCart</title>
      </Head>

      <main className="min-h-screen bg-[var(--nova-bg)] py-6 sm:py-10">
        <Container>
          <CheckoutSteps step={onDelivery ? 2 : 1} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
            <div className="min-w-0 space-y-5">
              {onDelivery ? (
                <>
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--nova-muted)] hover:text-[var(--nova-primary)]"
                  >
                    <ArrowLeft size={16} />
                    Back to cart
                  </button>

                  <AddressStep
                    savedAddresses={savedAddresses}
                    selectedAddressId={selectedAddressId}
                    formOpen={formOpen}
                    address={address}
                    onChange={handleChange}
                    onSelect={handleSelect}
                    onAddNew={handleAddNew}
                    saveNew={saveNewAddress}
                    onSaveNewChange={setSaveNewAddress}
                  />
                </>
              ) : (
                <section className="overflow-hidden rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] shadow-[var(--shadow-sm)]">
                  <h1 className="border-b border-[var(--nova-border)] px-5 py-4 text-lg font-bold text-[var(--nova-text)] sm:px-6">
                    Shopping cart
                    <span className="ml-2 text-sm font-medium text-[var(--nova-muted)]">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </h1>
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
                </section>
              )}
            </div>

            <OrderSummary
              itemCount={itemCount}
              subtotal={subtotal}
              discount={Math.max(0, subtotal - total)}
              total={total}
            >
              {onDelivery ? (
                <Button
                  className="w-full"
                  disabled={!razorpayLoaded || paying}
                  onClick={handlePay}
                >
                  {!razorpayLoaded
                    ? 'Loading payment...'
                    : paying
                    ? 'Opening payment...'
                    : `Pay ${formatPrice(total)}`}
                </Button>
              ) : auth?.user ? (
                <Button className="w-full" onClick={goToDelivery}>
                  Continue to delivery
                </Button>
              ) : (
                <Link href="/signin?returnUrl=%2Fcart">
                  <Button className="w-full">Sign in to checkout</Button>
                </Link>
              )}
            </OrderSummary>
          </div>
        </Container>
      </main>
    </>
  )
}

export default Cart
