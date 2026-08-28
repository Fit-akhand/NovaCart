import Head from 'next/head'
import Script from 'next/script'
import { useContext, useState, useEffect } from 'react'
import { DataContext } from '../../store/GlobalState'
import CartItem from '../../components/CartItem'
import Link from 'next/link'
import { getData, postData } from '@/lib/api-client'
import { useRouter } from 'next/router'
import Container from '../../components/common/Container'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import {
  Lock,
  MapPin,
  Phone,  
  User,
} from 'lucide-react'
import { formatPrice } from '@/lib/formatPrice'

const EMPTY_SHIPPING_ADDRESS = {
  fullName: '',
  phone: '',
  address: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
}

const CHECKOUT_ADDRESS_KEY =
  'novacart_checkout_address'

const Cart = () => {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const { state, dispatch } =
    useContext(DataContext)

  const {
    cart,
    auth,
    orders,
    categories,
  } = state

  const router = useRouter()

  const [total, setTotal] =
    useState(0)

  const [shippingAddress, setShippingAddress] =
    useState(EMPTY_SHIPPING_ADDRESS)

    const getEffectiveDiscount = (
  product
) => {
  if (!product) return 0

  const subcategory = categories?.find(
    category =>
      String(category._id) ===
      String(
        product.subcategory?._id ||
        product.subcategory
      )
  )

  const category = categories?.find(
    category =>
      String(category._id) ===
      String(
        product.category?._id ||
        product.category
      )
  )

  // Subcategory discount overrides parent
  if (
    subcategory &&
    subcategory.discountActive === true
  ) {
    return Number(
      subcategory.discountPercent
    ) || 0
  }

  // Otherwise use parent category discount
  if (
    category &&
    category.discountActive === true
  ) {
    return Number(
      category.discountPercent
    ) || 0
  }

  return 0
}

const getDiscountedPrice = (
  price,
  discount
) => {
  const originalPrice =
    Number(price) || 0

  const discountPercent =
    Number(discount) || 0

  return Math.round(
    originalPrice *
      (1 - discountPercent / 100) *
      100
  ) / 100
}

  // =========================================================
  // RESTORE CHECKOUT ADDRESS
  // =========================================================

  useEffect(() => {
    if (
      typeof window === 'undefined'
    ) {
      return
    }

    try {
      const savedAddress =
        sessionStorage.getItem(
          CHECKOUT_ADDRESS_KEY
        )

      if (!savedAddress) {
        return
      }

      const parsedAddress =
        JSON.parse(savedAddress)

      if (
        parsedAddress &&
        typeof parsedAddress === 'object'
      ) {
        setShippingAddress(
          (current) => ({
            ...current,
            ...parsedAddress,
          })
        )
      }
    } catch (error) {
      console.error(
        'Failed to restore checkout address:',
        error
      )
    }
  }, [])

  // =========================================================
  // SAVE CHECKOUT ADDRESS
  // =========================================================

  useEffect(() => {
    if (
      typeof window === 'undefined'
    ) {
      return
    }

    try {
      sessionStorage.setItem(
        CHECKOUT_ADDRESS_KEY,
        JSON.stringify(
          shippingAddress
        )
      )
    } catch (error) {
      console.error(
        'Failed to save checkout address:',
        error
      )
    }
  }, [shippingAddress])

  // =========================================================
  // CALCULATE CART TOTAL
  // =========================================================

  // =========================================================
  // CALCULATE CART TOTAL
  // =========================================================

 useEffect(() => {
  if (!Array.isArray(cart)) {
    setTotal(0)
    return
  }

  const cartTotal =
    cart.reduce(
      (sum, item) => {
        const discount =
          getEffectiveDiscount(item)

        const discountedPrice =
          getDiscountedPrice(
            item.price,
            discount
          )

        return (
          sum +
          discountedPrice *
            Number(item.quantity || 0)
        )
      },
      0
    )

  setTotal(cartTotal)
}, [cart, categories])

  // =========================================================
  // PREFILL USER INFORMATION
  // =========================================================

  useEffect(() => {
    if (!auth?.user) {
      return
    }

    setShippingAddress(
      (current) => ({
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
      })
    )
  }, [auth?.user])

  const [savedAddresses, setSavedAddresses] =
    useState([])

  const [selectedAddressId, setSelectedAddressId] =
    useState(null)

  const [useNewAddress, setUseNewAddress] =
    useState(false)

  const [saveNewAddress, setSaveNewAddress] =
    useState(false)

  const [showAddressForm, setShowAddressForm] =
    useState(false)

  const [addresses, setAddresses] =
    useState([])

  // =========================================================
  // LOAD DEFAULT SAVED ADDRESS
  // =========================================================

  useEffect(() => {
    if (!auth?.user || !auth?.token) return

    const loadAddresses = async () => {
      try {
        const res = await getData(
          'address',
          auth.token
        )

        if (res?.err) {
          console.error(res.err)
          return
        }

        const addresses = Array.isArray(
          res?.addresses
        )
          ? res.addresses
          : []

        setSavedAddresses(addresses)

        const defaultAddress =
          addresses.find(
            (item) =>
              item?.isDefault === true
          ) || addresses[0]

        if (defaultAddress) {
          setSelectedAddressId(
            defaultAddress._id
          )

          setShippingAddress({
            fullName:
              defaultAddress.fullName || '',
            phone:
              defaultAddress.phone || '',
            address:
              defaultAddress.address || '',
            addressLine2:
              defaultAddress.landmark || '',
            city:
              defaultAddress.city || '',
            state:
              defaultAddress.state || '',
            pincode:
              defaultAddress.pincode || '',
          })
        }
      } catch (error) {
        console.error(
          'Failed to load addresses:',
          error
        )
      }
    }

    loadAddresses()
  }, [auth?.user, auth?.token])

  // =========================================================
  // ADDRESS INPUT HANDLER
  // =========================================================

  const handleAddressChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target

    setShippingAddress(
      (current) => ({
        ...current,
        [name]: value,
      })
    )
  }

  const handleSelectAddress = (item) => {
    setUseNewAddress(false)
    setSelectedAddressId(item._id)

    setShippingAddress({
      fullName: item.fullName || '',
      phone: item.phone || '',
      address: item.address || '',
      addressLine2:
        item.landmark || '',
      city: item.city || '',
      state: item.state || '',
      pincode: item.pincode || '',
    })
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

    // =========================================================
    // REQUIRED FIELDS
    // =========================================================

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

    // =========================================================
    // PHONE VALIDATION
    // =========================================================

    if (
      !/^[6-9]\d{9}$/.test(
        phone.trim()
      )
    ) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'Please enter a valid 10-digit mobile number.',
        },
      })
    }

    // =========================================================
    // PINCODE VALIDATION
    // =========================================================

    if (
      !/^\d{6}$/.test(
        pincode.trim()
      )
    ) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'Please enter a valid 6-digit PIN code.',
        },
      })
    }

    // =========================================================
    // LOGIN CHECK
    // =========================================================

    if (!auth?.token || !auth?.user) {
      return router.push(
        `/signin?returnUrl=${encodeURIComponent(
          '/cart'
        )}`
      )
    }

    // =====================================================
    // SAVE NEW ADDRESS TO PROFILE
    // =====================================================

    if (useNewAddress && saveNewAddress) {
      const addressResponse = await postData(
        'address',
        {
          label: 'Home',
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          isDefault:
            savedAddresses.length === 0,
        },
        auth.token
      )

      if (addressResponse?.err) {
        return dispatch({
          type: 'NOTIFY',
          payload: {
            error: addressResponse.err,
          },
        })
      }

      // Refresh saved addresses
      const refreshed = await getData(
        'address',
        auth.token
      )

      if (
        Array.isArray(
          refreshed?.addresses
        )
      ) {
        setSavedAddresses(
          refreshed.addresses
        )

        const newlySaved =
          refreshed.addresses.find(
            (item) =>
              item.fullName ===
                fullName.trim() &&
              item.phone ===
                phone.trim() &&
              item.pincode ===
                pincode.trim()
          )

        if (newlySaved) {
          setSelectedAddressId(
            newlySaved._id
          )
        }
      }
    }

    // =========================================================
    // VERIFY CART AGAINST DATABASE
    // =========================================================

    const verifiedCart = []

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

      // =====================================================
      // STOCK VALIDATION
      // =====================================================

      if (
        Number(
          currentProduct.inStock
        ) <
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

      // =====================================================
      // USE SERVER PRICE
      // =====================================================

      const price =
        Number(
          currentProduct.price
        )

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        return dispatch({
          type: 'NOTIFY',
          payload: {
            error:
              `Invalid price for ${item.title}.`,
          },
        })
      }

      verifiedCart.push({
        ...item,

        price,

        inStock:
          Number(
            currentProduct.inStock
          ),

        sold:
          Number(
            currentProduct.sold
          ) || 0,

        quantity:
          Number(item.quantity),
      })
    }

    // =========================================================
    // SERVER-VERIFIED TOTAL
    // =========================================================

    const finalTotal =
      verifiedCart.reduce(
        (sum, item) =>
          sum +
          Number(item.price) *
            Number(item.quantity),
        0
      )

    if (
      !Number.isFinite(finalTotal) ||
      finalTotal <= 0
    ) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'Invalid order amount.',
        },
      })
    }

    // =========================================================
    // FINAL SHIPPING ADDRESS
    // =========================================================

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

    // =========================================================
    // LOADING
    // =========================================================

    dispatch({
      type: 'NOTIFY',
      payload: {
        loading: true,
      },
    })

    try {
      // =====================================================
      // STEP 1 — CREATE RAZORPAY ORDER
      // =====================================================

      const razorpayOrder =
        await postData(
          'create-order',
          {
            cart: verifiedCart,
          },
          auth.token
        )

      if (razorpayOrder?.err) {
        return dispatch({
          type: 'NOTIFY',
          payload: {
            error:
              razorpayOrder.err,
          },
        })
      }

      if (
        !razorpayOrder?.order_id
      ) {
        return dispatch({
          type: 'NOTIFY',
          payload: {
            error:
              'Unable to create Razorpay order.',
          },
        })
      }

      // =====================================================
      // CHECK RAZORPAY SCRIPT
      // =====================================================

      if (typeof window === 'undefined') {
        return dispatch({
          type: 'NOTIFY',
          payload: {
            error:
              'Payment is not available.',
          },
        })
      }

      if (!window.Razorpay) {
        return dispatch({
          type: 'NOTIFY',
          payload: {
            error:
              'Razorpay Checkout is still loading. Please wait a moment and try again.',
          },
        })
      }

      // =====================================================
      // STEP 2 — RAZORPAY OPTIONS
      // =====================================================

      const options = {
        key:
          process.env
            .NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency ||
          'INR',

        name:
          'NovaCart',

        description:
          'NovaCart Order Payment',

        order_id:
          razorpayOrder.order_id,

        prefill: {
          name:
            fullName.trim(),

          email:
            auth.user.email || '',

          contact:
            phone.trim(),
        },

        notes: {
          address:
            finalShippingAddress.address,

          city:
            finalShippingAddress.city,

          state:
            finalShippingAddress.state,

          pincode:
            finalShippingAddress.pincode,
        },

        // UI color only
        theme: {
          color: '#7c3aed',
        },

        // =================================================
        // PAYMENT SUCCESS
        // =================================================

        handler: async function (
          paymentResponse
        ) {
          try {
            // ---------------------------------------------
            // VERIFY PAYMENT SIGNATURE
            // ---------------------------------------------

            const verification =
              await postData(
                'verify-payment',
                {
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,
                },
                auth.token
              )

            if (
              verification?.err
            ) {
              dispatch({
                type: 'NOTIFY',
                payload: {
                  error:
                    verification.err,
                },
              })

              return
            }

            if (
              verification?.status !==
              'success'
            ) {
              dispatch({
                type: 'NOTIFY',
                payload: {
                  error:
                    'Payment verification failed.',
                },
              })

              return
            }

            // ---------------------------------------------
            // PAYMENT VERIFIED
            // ---------------------------------------------
            //
            // Only NOW create the NovaCart order.
            //
            // Your existing /api/order endpoint will then
            // perform the existing stock deduction logic.
            // ---------------------------------------------

            const orderResponse =
              await postData(
                'order',
                {
                  shippingAddress:
                    finalShippingAddress,

                  cart:
                    verifiedCart,

                  total:
                    finalTotal,

                  // Razorpay information
                  razorpayOrderId:
                    paymentResponse.razorpay_order_id,

                  razorpayPaymentId:
                    paymentResponse.razorpay_payment_id,

                  razorpaySignature:
                    paymentResponse.razorpay_signature,

                  paymentMethod:
                    'razorpay',

                  paid:
                    true,
                },
                auth.token
              )

            if (
              orderResponse?.err
            ) {
              dispatch({
                type: 'NOTIFY',
                payload: {
                  error:
                    `Payment succeeded, but order creation failed. Payment ID: ${paymentResponse.razorpay_payment_id}`,
                },
              })

              return
            }

            // ---------------------------------------------
            // CLEAR CART
            // ---------------------------------------------

            dispatch({
              type: 'ADD_CART',
              payload: [],
            })

            // ---------------------------------------------
            // CLEAR TEMPORARY ADDRESS
            // ---------------------------------------------

            if (
              typeof window !==
              'undefined'
            ) {
              sessionStorage.removeItem(
                CHECKOUT_ADDRESS_KEY
              )
            }

            // ---------------------------------------------
            // ADD ORDER TO GLOBAL STATE
            // ---------------------------------------------

            dispatch({
              type: 'ADD_ORDERS',
              payload: [
                ...orders,
                {
                  ...orderResponse.newOrder,

                  user:
                    auth.user,

                  paymentStatus:
                    'paid',

                  razorpayPaymentId:
                    paymentResponse.razorpay_payment_id,

                  razorpayOrderId:
                    paymentResponse.razorpay_order_id,
                },
              ],
            })

            // ---------------------------------------------
            // SUCCESS
            // ---------------------------------------------

            dispatch({
              type: 'NOTIFY',
              payload: {
                success:
                  'Payment successful! Order placed successfully.',
              },
            })

            // ---------------------------------------------
            // ORDER DETAILS
            // ---------------------------------------------

            return router.push(
              `/order/${orderResponse.newOrder._id}`
            )
          } catch (error) {
            console.error(
              'Payment verification/order error:',
              error
            )

            dispatch({
              type: 'NOTIFY',
              payload: {
                error:
                  'Payment was completed, but we could not complete your order. Please contact support with your payment ID.',
              },
            })
          }
        },

        // =================================================
        // PAYMENT FAILED
        // =================================================

        modal: {
          ondismiss: function () {
            dispatch({
              type: 'NOTIFY',
              payload: {
                error:
                  'Payment cancelled. Your cart has not been changed.',
              },
            })
          },
        },
      }

      // =====================================================
      // STEP 3 — OPEN RAZORPAY
      // =====================================================

      const razorpay =
        new window.Razorpay(
          options
        )

      razorpay.on(
        'payment.failed',
        function (
          response
        ) {
          console.error(
            'Razorpay payment failed:',
            response
          )

          dispatch({
            type: 'NOTIFY',
            payload: {
              error:
                response?.error?.description ||
                'Payment failed. Please try again.',
            },
          })
        }
      )

      razorpay.open()
    } catch (error) {
      console.error(
        'Checkout error:',
        error
      )

      dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            error?.message ||
            'Unable to start payment. Please try again.',
        },
      })
    }
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

        <Container className="min-h-[65vh] py-12 sm:py-16">
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
  // TOTAL ITEM COUNT
  // =========================================================

  const itemCount =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(
          item.quantity || 0
        ),
      0
    )

    const originalSubtotal =
  Array.isArray(cart)
    ? cart.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0
      )
    : 0

const discountAmount =
  Math.max(
    0,
    originalSubtotal - total
  )

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <>
      <Script
        id="razorpay-checkout"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log(
            '✅ Razorpay checkout.js loaded'
          )

          console.log(
            'window.Razorpay:',
            window.Razorpay
          )

          setRazorpayLoaded(
            typeof window.Razorpay ===
              'function'
          )
        }}
        onReady={() => {
          console.log(
            '✅ Razorpay Script ready'
          )

          if (
            typeof window !==
              'undefined' &&
            window.Razorpay
          ) {
            setRazorpayLoaded(
              true
            )
          }
        }}
        onError={(error) => {
          console.error(
            '❌ Razorpay checkout.js failed:',
            error
          )

          setRazorpayLoaded(
            false
          )

          dispatch({
            type: 'NOTIFY',
            payload: {
              error:
                'Unable to load Razorpay Checkout.',
            },
          })
        }}
      />

      <Head>
        <title>
          Your Cart | NovaCart
        </title>
      </Head>

      <main className="min-h-screen bg-[var(--nova-bg)] py-6 sm:py-8 lg:py-10">

        <Container>

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="relative mb-7 overflow-hidden rounded-3xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-5 py-6 shadow-[var(--shadow-sm)] sm:mb-8 sm:px-7 sm:py-7">

            <div className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-[rgba(139,92,246,0.10)] blur-3xl" />

            <div className="relative">

              <div className="mb-2 inline-flex items-center rounded-full border border-[rgba(139,92,246,0.18)] bg-[var(--nova-lavender-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nova-primary)]">
                Checkout
              </div>

              <h1 className="text-3xl font-bold tracking-[-0.03em] text-[var(--nova-text)] sm:text-4xl">
                Shopping cart
              </h1>

              <p className="mt-2 text-sm text-[var(--nova-muted)]">
                {itemCount}{' '}
                {itemCount === 1
                  ? 'item'
                  : 'items'}
              </p>

            </div>

          </div>

          {/* =================================================
              CART + BILLING
          ================================================= */}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">

            {/* =================================================
                LEFT COLUMN — CART + DELIVERY ADDRESS
            ================================================= */}

            <div className="min-w-0 space-y-5 sm:space-y-6">

              {/* =================================================
                  CART ITEMS
              ================================================= */}

              <div className="overflow-hidden rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] shadow-[var(--shadow-sm)]">

                <div className="divide-y divide-[var(--nova-border)]">

                  {cart.map(
                    (item) => (
                      <CartItem
                        key={item._id}
                        item={item}
                        dispatch={dispatch}
                        cart={cart}
                      />
                    )
                  )}

                </div>

              </div>

              {/* =================================================
                  DELIVERY ADDRESS
              ================================================= */}

              <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">

                <div className="mb-5">

                  <h2 className="text-xl font-bold tracking-tight text-[var(--nova-text)]">
                    Delivery address
                  </h2>

                  <p className="mt-1 text-sm text-[var(--nova-muted)]">
                    Select a saved address or add a new delivery address.
                  </p>

                </div>

                {/* =================================================
                    SAVED ADDRESSES
                ================================================= */}

                {savedAddresses.length > 0 && (

                  <div className="space-y-3">

                    <h3 className="text-sm font-bold text-[var(--nova-text)]">
                      Saved addresses
                    </h3>

                    {savedAddresses.map(
                      (item) => (

                        <button
                          key={item._id}
                          type="button"
                          onClick={() =>
                            handleSelectAddress(item)
                          }
                          className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                            selectedAddressId === item._id &&
                            !useNewAddress
                              ? 'border-[var(--nova-primary)] bg-[var(--nova-lavender-soft)] shadow-[0_8px_24px_rgba(124,58,237,0.10)] ring-1 ring-[var(--nova-primary)]'
                              : 'border-[var(--nova-border)] bg-[var(--nova-surface)] hover:border-[var(--nova-violet-light)] hover:bg-[var(--nova-surface-soft)] hover:shadow-[var(--shadow-sm)]'
                          }`}
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">

                              <h3 className="text-sm font-bold text-[var(--nova-text)]">
                                {item.label || 'Home'}
                              </h3>

                              <p className="mt-2 text-sm font-semibold text-[var(--nova-text)]">
                                {item.fullName}
                              </p>

                              <p className="mt-2 text-sm leading-6 text-[var(--nova-muted)]">
                                {item.address}, {item.city}, {item.state} - {item.pincode}
                              </p>

                              <p className="mt-2 text-sm text-[var(--nova-muted)]">
                                {item.phone}
                              </p>

                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-2">

                              {item.isDefault && (

                                <span className="rounded-full border border-[rgba(139,92,246,0.18)] bg-[var(--nova-lavender-soft)] px-3 py-1 text-xs font-semibold text-[var(--nova-primary)]">
                                  Default
                                </span>

                              )}

                              {selectedAddressId === item._id &&
                                !useNewAddress && (

                                  <span className="rounded-full bg-[var(--nova-primary)] px-3 py-1 text-xs font-semibold text-white">
                                    Selected
                                  </span>

                                )}

                            </div>

                          </div>

                        </button>

                      )
                    )}

                  </div>

                )}

                {/* =================================================
                    ADD NEW ADDRESS
                ================================================= */}

                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(true)
                    setUseNewAddress(true)
                    setSelectedAddressId(null)
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-dashed border-[var(--nova-violet-light)] px-4 py-2.5 text-sm font-semibold text-[var(--nova-primary)] transition-all hover:bg-[var(--nova-lavender-soft)]"
                >
                  + Add New Address
                </button>

                {/* =================================================
                    DELIVERY INFORMATION FORM
                ================================================= */}

                {showAddressForm && (

                  <div className="mt-5 rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] p-5">

                    <div className="mb-5">

                      <h3 className="text-sm font-bold text-[var(--nova-text)]">
                        Delivery information
                      </h3>

                      <p className="mt-1 text-xs text-[var(--nova-muted)]">
                        Enter the complete address for delivery.
                      </p>

                    </div>

                    <div className="space-y-4">

                      {/* =================================================
                          FULL NAME
                      ================================================= */}

                      <div>

                        <label
                          htmlFor="fullName"
                          className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--nova-text)]"
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
                          className="w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-3 text-sm text-[var(--nova-text)] outline-none transition-all placeholder:text-[var(--nova-muted)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
                        />

                      </div>

                      {/* =================================================
                          PHONE
                      ================================================= */}

                      <div>

                        <label
                          htmlFor="phone"
                          className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--nova-text)]"
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
                          className="w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-3 text-sm text-[var(--nova-text)] outline-none transition-all placeholder:text-[var(--nova-muted)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
                        />

                      </div>

                      {/* =================================================
                          FULL ADDRESS
                      ================================================= */}

                      <div>

                        <label
                          htmlFor="address"
                          className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--nova-text)]"
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
                          className="w-full resize-none rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-3 text-sm text-[var(--nova-text)] outline-none transition-all placeholder:text-[var(--nova-muted)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
                        />

                      </div>

                      {/* =================================================
                          LANDMARK
                      ================================================= */}

                      <div>

                        <label
                          htmlFor="addressLine2"
                          className="mb-2 block text-sm font-semibold text-[var(--nova-text)]"
                        >
                          Landmark / Apartment

                          <span className="ml-1 text-xs font-normal text-[var(--nova-muted)]">
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
                          className="w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-3 text-sm text-[var(--nova-text)] outline-none transition-all placeholder:text-[var(--nova-muted)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
                        />

                      </div>

                      {/* =================================================
                          CITY + STATE
                      ================================================= */}

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <div>

                          <label
                            htmlFor="city"
                            className="mb-2 block text-sm font-semibold text-[var(--nova-text)]"
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
                            className="w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-3 text-sm text-[var(--nova-text)] outline-none transition-all placeholder:text-[var(--nova-muted)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
                          />

                        </div>

                        <div>

                          <label
                            htmlFor="state"
                            className="mb-2 block text-sm font-semibold text-[var(--nova-text)]"
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
                            className="w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-3 text-sm text-[var(--nova-text)] outline-none transition-all placeholder:text-[var(--nova-muted)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
                          />

                        </div>

                      </div>

                      {/* =================================================
                          PIN CODE
                      ================================================= */}

                      <div>

                        <label
                          htmlFor="pincode"
                          className="mb-2 block text-sm font-semibold text-[var(--nova-text)]"
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
                          className="w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-3 text-sm text-[var(--nova-text)] outline-none transition-all placeholder:text-[var(--nova-muted)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
                        />

                        {useNewAddress && (

                          <label className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 py-2.5 text-sm text-[var(--nova-text)]">

                            <input
                              type="checkbox"
                              checked={
                                saveNewAddress
                              }
                              onChange={(e) =>
                                setSaveNewAddress(
                                  e.target.checked
                                )
                              }
                            />

                            Save this address to my profile

                          </label>

                        )}

                      </div>

                    </div>

                  </div>

                )}

              </div>

            </div>

            {/* =================================================
                RIGHT COLUMN — ORDER SUMMARY
            ================================================= */}

            <aside className="h-fit rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 shadow-[var(--shadow-md)] sm:p-6 lg:sticky lg:top-24">

              <h2 className="text-xl font-bold tracking-tight text-[var(--nova-text)]">
                Order summary
              </h2>

              {/* =================================================
                  BILLING DETAILS
              ================================================= */}

              <div className="my-6 border-t border-[var(--nova-border)] pt-5">

                <h3 className="mb-4 text-sm font-bold text-[var(--nova-text)]">
                  Billing details
                </h3>

                {/* ITEMS */}

                <div className="flex items-center justify-between text-sm">

                  <span className="text-[var(--nova-muted)]">
                    Items
                  </span>

                  <span className="font-semibold text-[var(--nova-text)]">
                    {itemCount}
                  </span>

                </div>

                {/* SUBTOTAL */}

                <div className="mt-3 flex items-center justify-between text-sm">

                  <span className="text-[var(--nova-muted)]">
                    Subtotal
                  </span>

                  <span className="font-semibold text-[var(--nova-text)]">
                    {formatPrice(originalSubtotal)}
                  </span>

                </div>

                {/* DISCOUNT */}

                <div className="mt-3 flex items-center justify-between text-sm">

                  <span className="text-[var(--nova-muted)]">
                    Discount
                  </span>

                  <span className="font-semibold text-[var(--nova-success)]">
                    -{formatPrice(discountAmount)}
                  </span>

                </div>

                {/* DELIVERY */}

                <div className="mt-3 flex items-center justify-between text-sm">

                  <span className="text-[var(--nova-muted)]">
                    Delivery
                  </span>

                  <span className="font-semibold text-[var(--nova-success)]">
                    FREE
                  </span>

                </div>

                <div className="my-5 border-t border-[var(--nova-border)]" />

                {/* TOTAL */}

                <div className="flex items-end justify-between gap-4 rounded-xl bg-[var(--nova-surface-soft)] p-4">

                  <div>

                    <p className="font-bold text-[var(--nova-text)]">
                      Total
                    </p>

                    <p className="mt-1 text-xs text-[var(--nova-muted)]">
                      Inclusive of delivery
                    </p>

                  </div>

                  <span className="text-2xl font-bold tracking-tight text-[var(--nova-text)]">
                    {formatPrice(total)}
                  </span>

                </div>

              </div>

              {/* =================================================
                  CHECKOUT
              ================================================= */}

              {auth?.user ? (

                <button
                  type="button"
                  disabled={!razorpayLoaded}
                  onClick={handlePayment}
                  className="w-full min-h-12 rounded-xl bg-[var(--nova-primary)] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(124,58,237,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(124,58,237,0.24)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {!razorpayLoaded
                    ? 'Loading payment...'
                    : 'Proceed to payment'}
                </button>

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