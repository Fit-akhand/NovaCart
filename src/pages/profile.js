import Head from 'next/head'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '../../store/GlobalState'
import Link from 'next/link'
import valid from '@/validators/auth'
import { patchData, postData } from '@/lib/api-client'
import { imageUpload } from '../../utils/imageUpload'
import Container from '../../components/common/Container'
import { formatPrice } from '@/lib/formatPrice'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import AddressManager from '../../components/profile/AddressManager'
import AuthGuard from '../../components/common/AuthGuard'
import { useRouter } from 'next/router'

import {
  Camera,
  Check,
  Clock3,
  LogOut,
  ShoppingBag,
} from 'lucide-react'


const Profile = () => {
  const router = useRouter()

  const [data, setData] = useState({
    avatar: '',
    name: '',
    password: '',
    cf_password: '',
    phone: '',
  })

  const [editingProfile, setEditingProfile] = useState(false)

  const { state, dispatch } = useContext(DataContext)

  const { auth, notify, orders } = state

  const isAdmin = auth?.user?.role === 'admin'

  const isSeller = auth?.user?.role === 'seller'


  useEffect(() => {

    if (auth.user) {

      setData((prev) => ({
        ...prev,

        name: auth.user.name || '',

        phone: auth.user.phone || '',

      }))

    }

  }, [auth.user])


  // ===============================
  // INPUT CHANGE
  // ===============================

 const changeAvatar = async (e) => {

  const file = e.target.files[0]

  if (!file) {
    return dispatch({
      type: 'NOTIFY',
      payload: {
        error: 'File does not exist.'
      }
    })
  }

  if (file.size > 1024 * 1024) {
    return dispatch({
      type: 'NOTIFY',
      payload: {
        error: 'The largest image size is 1mb.'
      }
    })
  }

  if (
    file.type !== 'image/jpeg' &&
    file.type !== 'image/png'
  ) {
    return dispatch({
      type: 'NOTIFY',
      payload: {
        error: 'Image format is incorrect.'
      }
    })
  }

  try {

    dispatch({
      type: 'NOTIFY',
      payload: {
        loading: true
      }
    })

    const media = await imageUpload([file])

    if (
      !media ||
      !media[0] ||
      !media[0].url
    ) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: 'Image upload failed.'
        }
      })
    }

    const avatarUrl = media[0].url

    const res = await patchData(
      'user',
      {
        avatar: avatarUrl
      },
      auth.token
    )

    if (res.err) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: res.err
        }
      })
    }

    dispatch({
      type: 'AUTH',
      payload: {
        token: auth.token,
        user: res.user
      }
    })

    setData((prev) => ({
      ...prev,
      avatar: ''
    }))

    dispatch({
      type: 'NOTIFY',
      payload: {
        success: 'Profile picture updated successfully.'
      }
    })

  } catch (error) {

    console.error(
      'Avatar upload error:',
      error
    )

    dispatch({
      type: 'NOTIFY',
      payload: {
        error:
          error?.message ||
          'Unable to update profile picture.'
      }
    })
  }
}


// ===============================
// HANDLE INPUT CHANGE
// ===============================

const handleChange = (e) => {

  const {
    name,
    value
  } = e.target

  setData((prev) => ({
    ...prev,
    [name]: value
  }))
}


// ===============================
// UPDATE PASSWORD
// ===============================

const updatePassword = async () => {

  dispatch({
    type: 'NOTIFY',
    payload: {
      loading: true
    }
  })


  const res = await patchData(
    'user',
    {
      password: data.password,
      cf_password: data.cf_password
    },
    auth.token
  )


  if (res.err) {

    return dispatch({
      type: 'NOTIFY',
      payload: {
        error: res.err
      }
    })
  }


  dispatch({
    type: 'NOTIFY',
    payload: {
      success: res.msg
    }
  })
}
  // ===============================
  // UPDATE USER INFORMATION
  // ===============================

  const updateInfor = async (fields) => {

    let media

    dispatch({
      type: 'NOTIFY',
      payload: {
        loading: true
      }
    })


    if (data.avatar) {

      media = await imageUpload([
        data.avatar
      ])
    }


    const payload = {

      ...fields,

      avatar: data.avatar
        ? media[0].url
        : auth.user.avatar

    } 

    console.log('========== PROFILE UPDATE ==========')
    console.log('Selected file:', data.avatar)
    console.log('Cloudinary media:', media)
    console.log('Payload being sent:', payload)
    console.log('Auth token exists:', !!auth.token)
    console.log('====================================')

    const res = await patchData(
      'user',
      payload,
      auth.token
    )

    console.log('========== API RESPONSE ==========')
    console.log('User update response:', res)
    console.log('Saved avatar:', res?.user?.avatar)
    console.log('==================================')

    if (res.err) {

      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: res.err
        }
      })
    }


    dispatch({
      type: 'AUTH',
      payload: {
        token: auth.token,
        user: res.user
      }
    })


    dispatch({
      type: 'NOTIFY',
      payload: {
        success: res.msg
      }
    })


    setData((prev) => ({
      ...prev,
      avatar: ''
    }))
  }


  // ===============================
  // UPDATE PROFILE
  // ===============================

  const handleUpdateProfile = async (e) => {

    e.preventDefault()


    if (data.password) {

      const errMsg = valid(
        data.name,
        auth.user.email,
        data.password,
        data.cf_password
      )


      if (errMsg) {

        return dispatch({
          type: 'NOTIFY',
          payload: {
            error: errMsg
          }
        })
      }


      await updatePassword()
    }


    if (
      data.name !== auth.user.name ||
      data.avatar ||
      data.phone !== (auth.user.phone || '')
    ) {

      await updateInfor({
        name: data.name,
        phone: data.phone
      })
    }


    setEditingProfile(false)
  }


// ===============================
// LOGOUT
// ===============================

const handleLogout = async () => {

  try {

    sessionStorage.setItem(
        '__novacart_logout',
        'true'
    )

    const res = await postData(
      'auth/logout',
      null,
      auth?.token
    )

    if (res?.err) {

      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: res.err
        }
      })
    }


    // Clear client authentication state
    dispatch({
      type: 'AUTH',
      payload: {}
    })


    // Clear user-specific state
    dispatch({
      type: 'ADD_ORDERS',
      payload: []
    })

    dispatch({
      type: 'ADD_USERS',
      payload: []
    })


    // Clear login marker
    localStorage.removeItem(
      'firstLogin'
    )


    // Go home
    router.push('/')

  } catch (error) {

    console.error(
      'Logout error:',
      error
    )

    dispatch({
      type: 'NOTIFY',
      payload: {
        error:
          error.message ||
          'Logout failed.'
      }
    })
  }
}


  // ===============================
  // AUTH CHECK
  // ===============================

  if (!auth.user) return null


  // ===============================
  // MEMBER SINCE
  // ===============================

  const memberSince = auth.user.createdAt

    ? new Date(
        auth.user.createdAt
      ).toLocaleDateString(
        'en-IN',
        {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }
      )

    : 'Not available'


  // ===============================
  // ACCOUNT LABEL
  // ===============================

  const accountLabel = isAdmin
    ? 'Super Admin'
    : isSeller
      ? 'Seller'
      : 'Customer'


  // ===============================
  // RETURN
  // ===============================

  return (
    <>
      <Head>

        <title>
          {accountLabel} Profile | NovaCart
        </title>

      </Head>


      <main className="min-h-screen bg-[var(--nova-bg)] py-6 sm:py-10">

        <Container>

          <h1 className="mb-8 text-center text-3xl font-bold tracking-[-0.03em] text-[var(--nova-text)] sm:text-4xl">
            My Profile
          </h1>


          {/* =====================================
              PROFILE HEADER
          ====================================== */}

          <section className="relative mb-6 flex flex-col items-center overflow-hidden rounded-3xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-6 py-10 text-center shadow-[var(--shadow-sm)] sm:px-8">

            <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-[rgba(139,92,246,0.10)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-[rgba(167,139,250,0.07)] blur-3xl" />

            <div className="relative mb-4">

              <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-[var(--nova-lavender-soft)] bg-[var(--nova-surface-soft)] shadow-[0_10px_30px_rgba(124,58,237,0.14)]">

                <img
                  src={
                    data.avatar
                      ? URL.createObjectURL(data.avatar)
                      : auth.user.avatar
                  }
                  alt="Profile avatar"
                  className="h-full w-full object-cover"
                />

              </div>


              <label
                htmlFor="file_up"
                className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-[var(--nova-surface)] bg-[var(--nova-primary)] text-white shadow-md transition-transform hover:scale-105"
              >

                <Camera size={15} />

              </label>


              <input
                type="file"
                id="file_up"
                accept="image/jpeg,image/png"
                onChange={changeAvatar}
                className="hidden"
              />

            </div>


            <h2 className="text-xl font-bold tracking-tight text-[var(--nova-text)]">
              {auth.user.name}
            </h2>


            <p className="text-sm text-[var(--nova-muted)]">
              {auth.user.email}
            </p>


            <Badge
              className="mt-2"
              variant={
                isAdmin
                  ? 'blue'
                  : isSeller
                    ? 'success'
                    : 'default'
              }
            >

              {accountLabel}

            </Badge>

          </section>


          {/* =====================================
              MAIN GRID
          ====================================== */}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-7">


            {/* ===================================
                LEFT COLUMN
            ==================================== */}

            <div className="space-y-5 sm:space-y-6">


              {/* =================================
                  PERSONAL INFORMATION
              ================================== */}

              <section className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">

                <div className="mb-5 flex items-center justify-between gap-4">

                  <h3 className="font-bold tracking-tight text-[var(--nova-text)]">
                    Personal information
                  </h3>


                  <Button
                    variant="secondary"
                    onClick={() =>
                      setEditingProfile(
                        (open) => !open
                      )
                    }
                  >

                    {editingProfile
                      ? 'Cancel'
                      : 'Edit profile'}

                  </Button>

                </div>


                {editingProfile ? (

                  <form
                    onSubmit={handleUpdateProfile}
                    className="space-y-4"
                  >

                    <Input
                      id="name"
                      name="name"
                      label="Full name"
                      value={data.name}
                      onChange={handleChange}
                    />


                    <Input
                      id="email"
                      label="Email"
                      value={auth.user.email}
                      disabled
                    />


                    <Input
                      id="phone"
                      name="phone"
                      label="Phone"
                      value={data.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />


                    <Input
                      id="password"
                      name="password"
                      type="password"
                      label="New password (optional)"
                      value={data.password}
                      onChange={handleChange}
                    />


                    <Input
                      id="cf_password"
                      name="cf_password"
                      type="password"
                      label="Confirm new password"
                      value={data.cf_password}
                      onChange={handleChange}
                    />


                    <Button
                      type="submit"
                      loading={notify.loading}
                      className="w-full"
                    >
                      Save changes
                    </Button>

                  </form>

                ) : (

                  <dl className="space-y-3 text-sm">


                    <div className="flex flex-col gap-1 rounded-xl bg-[var(--nova-surface-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                      <dt className="text-[var(--nova-muted)]">
                        Full name
                      </dt>

                      <dd>
                        {auth.user.name}
                      </dd>

                    </div>


                    <div className="flex flex-col gap-1 rounded-xl bg-[var(--nova-surface-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                      <dt className="text-[var(--nova-muted)]">
                        Email
                      </dt>

                      <dd className="break-all">
                        {auth.user.email}
                      </dd>

                    </div>


                    <div className="flex flex-col gap-1 rounded-xl bg-[var(--nova-surface-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                      <dt className="text-[var(--nova-muted)]">
                        Phone
                      </dt>

                      <dd>
                        {auth.user.phone ||
                          'Not added'}
                      </dd>

                    </div>

                  </dl>

                )}

              </section>


              {/* =================================
                  MULTIPLE ADDRESSES
              ================================== */}

              {!isAdmin && (

                <AddressManager
                  token={auth.token}
                />

              )}


              {/* =================================
                  ACCOUNT
              ================================== */}

              <section className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">

                <h3 className="mb-4 font-semibold">
                  Account
                </h3>


                <dl className="space-y-3 text-sm">


                  <div className="flex flex-col gap-1 rounded-xl bg-[var(--nova-surface-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                    <dt className="text-[var(--nova-muted)]">
                      Account type
                    </dt>

                    <dd>
                      {accountLabel}
                    </dd>

                  </div>


                  <div className="flex flex-col gap-1 rounded-xl bg-[var(--nova-surface-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                    <dt className="text-[var(--nova-muted)]">
                      Member since
                    </dt>

                    <dd>
                      {memberSince}
                    </dd>

                  </div>


                  {isSeller && (

                    <div className="flex flex-col gap-1 rounded-xl bg-[var(--nova-surface-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                      <dt className="text-[var(--nova-muted)]">
                        Seller status
                      </dt>

                      <dd>

                        <Badge variant="success">
                          Verified Seller
                        </Badge>

                      </dd>

                    </div>

                  )}

                </dl>

              </section>


             {/* =================================
                  QUICK ACTIONS
              ================================== */}

              <section className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
                <h3 className="mb-4 font-semibold">
                  Quick actions
                </h3>

                <div className="flex flex-wrap gap-3">

                  {/* Common actions */}
                  <Link href="#orders">
                    <Button variant="secondary">
                      My orders
                    </Button>
                  </Link>

                  <Link href="/cart">
                    <Button variant="secondary">
                      Cart
                    </Button>
                  </Link>

                  {/* Seller */}
                  {isSeller && (
                    <Link href="/create">
                      <Button variant="secondary">
                        Seller dashboard
                      </Button>
                    </Link>
                  )}

                  {/* Super Admin */}
                  {isAdmin && (
                    <section className="mt-5 w-full rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] p-5">

                      <div className="mb-4">
                        <h3 className="font-bold tracking-tight text-[var(--nova-text)]">
                          Admin Tools
                        </h3>

                        <p className="mt-1 text-sm text-[var(--nova-muted)]">
                          Manage NovaCart from your administrator account.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                        <Link href="/admin">
                          <Button variant="secondary" className="w-full">
                            Dashboard
                          </Button>
                        </Link>

                        <Link href="/users">
                          <Button variant="secondary" className="w-full">
                            Sellers & Customers
                          </Button>
                        </Link>

                        <Link href="/create">
                          <Button variant="secondary" className="w-full">
                            Products
                          </Button>
                        </Link>

                        <Link href="/categories">
                          <Button variant="secondary" className="w-full">
                            Categories
                          </Button>
                        </Link>

                        <Link href="/profile#orders">
                          <Button variant="secondary" className="w-full">
                            Orders
                          </Button>
                        </Link>

                      </div>
                    </section>
                  )}

                </div>
              </section>
              {/* =================================
                  LOGOUT
              ================================== */}

              <Button
                variant="danger"
                onClick={handleLogout}
                className="w-full"
              >

                <span className="inline-flex items-center gap-2">

                  <LogOut size={16} />

                  Sign out

                </span>

              </Button>

            </div>


            {/* ===================================
                ORDERS
            ==================================== */}

            <section
              id="orders"
              className="overflow-hidden rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] shadow-[var(--shadow-md)]"
            >


              <div className="flex items-center justify-between border-b border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-5 py-5 sm:px-6">

                <div>

                  <h3 className="font-bold tracking-tight text-[var(--nova-text)]">
                    Orders
                  </h3>

                  <p className="text-xs text-[var(--nova-muted)]">
                    {orders.length} total orders
                  </p>

                </div>


                <ShoppingBag
                  size={18}
                  className="text-[var(--nova-muted)]"
                />

              </div>


              {orders.length === 0 ? (

                <EmptyState
                  title="No orders yet"
                  description="Your purchases will appear here once you place an order."
                  action={
                    <Link href="/products">

                      <Button>
                        Start shopping
                      </Button>

                    </Link>
                  }
                />

              ) : (

                <div className="divide-y divide-[var(--nova-border)]">


                  {orders.map((order) => (

                    <Link
                      key={order._id}
                      href={`/order/${order._id}`}
                      className="block px-5 py-5 transition-all duration-200 hover:bg-[var(--nova-surface-soft)] sm:px-6 hover:shadow-[inset_3px_0_0_var(--nova-primary)]"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="text-sm font-semibold">
                            Order #{order._id.slice(-8)}
                          </p>


                          <p className="mt-1 text-xs text-[var(--nova-muted)]">

                            {new Date(
                              order.createdAt
                            ).toLocaleDateString(
                              'en-IN',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }
                            )}

                            {' · '}

                            {order.cart?.length || 0}
                            {' '}
                            items

                          </p>

                        </div>


                        <p className="text-sm font-semibold">
                          {formatPrice(order.total)}
                        </p>

                      </div>


                      <div className="mt-3 flex flex-wrap gap-2">


                        {order.paid ? (

                          <Badge variant="success">

                            <Check
                              size={11}
                              className="mr-1"
                            />

                            Paid

                          </Badge>

                        ) : (

                          <Badge variant="warning">

                            <Clock3
                              size={11}
                              className="mr-1"
                            />

                            Payment pending

                          </Badge>

                        )}


                        {order.delivered ? (

                          <Badge variant="success">
                            Delivered
                          </Badge>

                        ) : (

                          <Badge>
                            Processing
                          </Badge>

                        )}

                      </div>

                    </Link>

                  ))}

                </div>

              )}

            </section>

          </div>

        </Container>

      </main>

    </>
  )
}


const ProfilePage = () => {
    return (
        <AuthGuard>
            <Profile />
        </AuthGuard>
    )
}

export default ProfilePage