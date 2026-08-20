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

import {
  Camera,
  Check,
  Clock3,
  LogOut,
  ShoppingBag,
} from 'lucide-react'


const Profile = () => {

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

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target

    setData((prev) => ({
      ...prev,
      [name]: value
    }))

    dispatch({
      type: 'NOTIFY',
      payload: {}
    })
  }


  // ===============================
  // AVATAR
  // ===============================

  const changeAvatar = (e) => {

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


    setData((prev) => ({
      ...prev,
      avatar: file
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
      'user/resetPassword',
      {
        password: data.password
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


    const res = await patchData(
      'user',
      payload,
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

      await postData(
        'auth/logout',
        null,
        auth?.token
      )


      localStorage.removeItem(
        'firstLogin'
      )


      dispatch({
        type: 'AUTH',
        payload: {}
      })


      dispatch({
        type: 'ADD_ORDERS',
        payload: []
      })


      dispatch({
        type: 'ADD_USERS',
        payload: []
      })


      window.location.href = '/'


    } catch (error) {

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


      <main className="py-8 sm:py-10">

        <Container>

          <h1 className="mb-8 text-center text-3xl font-semibold">
            My Profile
          </h1>


          {/* =====================================
              PROFILE HEADER
          ====================================== */}

          <section className="mb-6 flex flex-col items-center rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-6 py-8 text-center">

            <div className="relative mb-4">

              <div className="h-24 w-24 overflow-hidden rounded-full border border-[var(--nova-border)] bg-[var(--nova-surface-soft)]">

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
                className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[var(--nova-navy)] text-white"
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


            <h2 className="text-xl font-semibold">
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">


            {/* ===================================
                LEFT COLUMN
            ==================================== */}

            <div className="space-y-6">


              {/* =================================
                  PERSONAL INFORMATION
              ================================== */}

              <section className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-6">

                <div className="mb-4 flex items-center justify-between">

                  <h3 className="font-semibold">
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


                    <div className="flex justify-between gap-4">

                      <dt className="text-[var(--nova-muted)]">
                        Full name
                      </dt>

                      <dd>
                        {auth.user.name}
                      </dd>

                    </div>


                    <div className="flex justify-between gap-4">

                      <dt className="text-[var(--nova-muted)]">
                        Email
                      </dt>

                      <dd className="break-all">
                        {auth.user.email}
                      </dd>

                    </div>


                    <div className="flex justify-between gap-4">

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

              <section className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-6">

                <h3 className="mb-4 font-semibold">
                  Account
                </h3>


                <dl className="space-y-3 text-sm">


                  <div className="flex justify-between gap-4">

                    <dt className="text-[var(--nova-muted)]">
                      Account type
                    </dt>

                    <dd>
                      {accountLabel}
                    </dd>

                  </div>


                  <div className="flex justify-between gap-4">

                    <dt className="text-[var(--nova-muted)]">
                      Member since
                    </dt>

                    <dd>
                      {memberSince}
                    </dd>

                  </div>


                  {isSeller && (

                    <div className="flex justify-between gap-4">

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

              <section className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-6">
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
                    <section className="mt-4 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] p-5">

                      <div className="mb-4">
                        <h3 className="font-semibold">
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
              className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]"
            >


              <div className="flex items-center justify-between border-b border-[var(--nova-border)] px-6 py-5">

                <div>

                  <h3 className="font-semibold">
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
                      className="block px-6 py-5 hover:bg-[var(--nova-surface-soft)]"
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