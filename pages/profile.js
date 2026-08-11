```jsx
import Head from 'next/head'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '../store/GlobalState'
import Link from 'next/link'

import valid from '../utils/valid'
import { patchData } from '../utils/fetchData'
import { imageUpload } from '../utils/imageUpload'

import {
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Lock,
  Mail,
  Package,
  Phone,
  Save,
  ShieldCheck,
  ShoppingBag,
  User,
  X,
} from 'lucide-react'

const Profile = () => {
  const initialState = {
    avatar: '',
    name: '',
    password: '',
    cf_password: '',
  }

  const [data, setData] = useState(initialState)

  const {
    avatar,
    name,
    password,
    cf_password,
  } = data

  const { state, dispatch } = useContext(DataContext)
  const { auth, notify, orders } = state

  useEffect(() => {
    if (auth.user) {
      setData((prev) => ({
        ...prev,
        name: auth.user.name,
      }))
    }
  }, [auth.user])

  const handleChange = (e) => {
    const { name, value } = e.target

    setData((prev) => ({
      ...prev,
      [name]: value,
    }))

    dispatch({
      type: 'NOTIFY',
      payload: {},
    })
  }

  const handleUpdateProfile = (e) => {
    e.preventDefault()

    if (password) {
      const errMsg = valid(
        name,
        auth.user.email,
        password,
        cf_password
      )

      if (errMsg) {
        return dispatch({
          type: 'NOTIFY',
          payload: { error: errMsg },
        })
      }

      updatePassword()
    }

    if (
      name !== auth.user.name ||
      avatar
    ) {
      updateInfor()
    }
  }

  const updatePassword = () => {
    dispatch({
      type: 'NOTIFY',
      payload: { loading: true },
    })

    patchData(
      'user/resetPassword',
      { password },
      auth.token
    ).then((res) => {
      if (res.err) {
        return dispatch({
          type: 'NOTIFY',
          payload: { error: res.err },
        })
      }

      dispatch({
        type: 'NOTIFY',
        payload: { success: res.msg },
      })
    })
  }

  const changeAvatar = (e) => {
    const file = e.target.files[0]

    if (!file) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: 'File does not exist.',
        },
      })
    }

    if (file.size > 1024 * 1024) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: 'The largest image size is 1mb.',
        },
      })
    }

    if (
      file.type !== 'image/jpeg' &&
      file.type !== 'image/png'
    ) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: 'Image format is incorrect.',
        },
      })
    }

    setData((prev) => ({
      ...prev,
      avatar: file,
    }))
  }

  const updateInfor = async () => {
    let media

    dispatch({
      type: 'NOTIFY',
      payload: { loading: true },
    })

    if (avatar) {
      media = await imageUpload([avatar])
    }

    patchData(
      'user',
      {
        name,
        avatar: avatar
          ? media[0].url
          : auth.user.avatar,
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
        type: 'AUTH',
        payload: {
          token: auth.token,
          user: res.user,
        },
      })

      dispatch({
        type: 'NOTIFY',
        payload: {
          success: res.msg,
        },
      })
    })
  }

  if (!auth.user) return null

  return (
    <>
      <Head>
        <title>
          {auth.user.role === 'user'
            ? 'My Account'
            : 'Admin Profile'}{' '}
          | NovaCart
        </title>

        <meta
          name="description"
          content="Manage your NovaCart profile, security and orders."
        />
      </Head>

      <main className="min-h-screen bg-[#fafafa]">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <section className="border-b border-gray-200 bg-white">

          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                    <User size={15} />
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                    NovaCart Account
                  </span>

                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                  Welcome back, {auth.user.name}
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  Manage your profile, security and orders.
                </p>

              </div>

              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">

                <ShieldCheck
                  size={15}
                  className="text-green-600"
                />

                Account secured

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">


            {/* =================================================
                PROFILE CARD
            ================================================== */}

            <div className="h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              {/* Profile header */}

              <div className="border-b border-gray-100 px-6 py-5">

                <h2 className="text-base font-semibold text-gray-900">
                  Personal Information
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Update your account details.
                </p>

              </div>


              <div className="p-6">

                {/* Avatar */}

                <div className="mb-7 flex flex-col items-center">

                  <div className="group relative">

                    <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-lg ring-1 ring-gray-200">

                      <img
                        src={
                          avatar
                            ? URL.createObjectURL(
                                avatar
                              )
                            : auth.user.avatar
                        }
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                      />

                    </div>


                    {/* Camera overlay */}

                    <label
                      htmlFor="file_up"
                      className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-black text-white shadow-md transition hover:scale-105"
                    >

                      <Camera size={15} />

                    </label>

                    <input
                      type="file"
                      name="file"
                      id="file_up"
                      accept="image/jpeg,image/png"
                      onChange={changeAvatar}
                      className="hidden"
                    />

                  </div>

                  <p className="mt-3 text-xs text-gray-400">
                    JPG or PNG • Maximum 1MB
                  </p>

                </div>


                {/* Name */}

                <div className="mb-5">

                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-medium text-gray-600"
                  >
                    Full Name
                  </label>

                  <div className="relative">

                    <User
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      placeholder="Your name"
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
                    />

                  </div>

                </div>


                {/* Email */}

                <div className="mb-5">

                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-medium text-gray-600"
                  >
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={auth.user.email}
                      disabled
                      className="h-11 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 pl-11 pr-4 text-sm text-gray-500 outline-none"
                    />

                  </div>

                  <p className="mt-1.5 text-[11px] text-gray-400">
                    Email cannot be changed.
                  </p>

                </div>


                {/* Security */}

                <div className="mb-5 border-t border-gray-100 pt-5">

                  <div className="mb-4 flex items-center gap-2">

                    <Lock
                      size={16}
                      className="text-gray-500"
                    />

                    <div>

                      <p className="text-sm font-semibold text-gray-900">
                        Security
                      </p>

                      <p className="text-xs text-gray-400">
                        Change your password
                      </p>

                    </div>

                  </div>


                  <div className="space-y-3">

                    <input
                      type="password"
                      name="password"
                      value={password}
                      placeholder="New password"
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
                    />

                    <input
                      type="password"
                      name="cf_password"
                      value={cf_password}
                      placeholder="Confirm new password"
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
                    />

                  </div>

                </div>


                {/* Save */}

                <button
                  disabled={notify.loading}
                  onClick={handleUpdateProfile}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <Save size={16} />

                  {notify.loading
                    ? 'Saving...'
                    : 'Save Changes'}

                </button>

              </div>

            </div>


            {/* =================================================
                ORDERS
            ================================================== */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                    <ShoppingBag size={18} />
                  </div>

                  <div>

                    <h2 className="text-base font-semibold text-gray-900">
                      Your Orders
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-400">
                      {orders.length} total orders
                    </p>

                  </div>

                </div>

                <Package
                  size={19}
                  className="text-gray-300"
                />

              </div>


              {orders.length === 0 ? (

                /* Empty orders */

                <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">

                    <ShoppingBag
                      size={27}
                      className="text-gray-400"
                    />

                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">
                    No orders yet
                  </h3>

                  <p className="mt-2 max-w-sm text-sm text-gray-400">
                    Your purchases will appear here once
                    you place your first order.
                  </p>

                  <Link href="/">
                    <a className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-semibold text-white transition hover:bg-gray-800">
                      Start Shopping
                      <ChevronRight size={15} />
                    </a>
                  </Link>

                </div>

              ) : (

                <div className="divide-y divide-gray-100">

                  {orders.map((order) => (

                    <Link
                      href={`/order/${order._id}`}
                      key={order._id}
                    >
                      <a className="group block px-5 py-5 transition hover:bg-gray-50 sm:px-6">

                        <div className="flex items-center justify-between gap-4">

                          {/* Order information */}

                          <div className="flex min-w-0 items-center gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 transition group-hover:bg-black group-hover:text-white">

                              <Package size={18} />

                            </div>

                            <div className="min-w-0">

                              <p className="text-sm font-semibold text-gray-900">
                                Order #
                                {order._id.slice(-8)}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">

                                <span>
                                  {new Date(
                                    order.createdAt
                                  ).toLocaleDateString(
                                    'en-IN',
                                    {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    }
                                  )}
                                </span>

                                <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block" />

                                <span>
                                  {order.cart?.length || 0}{' '}
                                  {order.cart?.length === 1
                                    ? 'item'
                                    : 'items'}
                                </span>

                              </div>

                            </div>

                          </div>


                          {/* Order status */}

                          <div className="flex shrink-0 items-center gap-4">

                            <div className="hidden text-right sm:block">

                              <p className="text-sm font-semibold text-gray-900">
                                ${order.total}
                              </p>

                              <div className="mt-1 flex items-center justify-end gap-1">

                                {order.paid ? (
                                  <span className="flex items-center gap-1 text-[10px] font-medium text-green-600">
                                    <Check size={11} />
                                    Paid
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500">
                                    <Clock3 size={11} />
                                    Pending
                                  </span>
                                )}

                              </div>

                            </div>


                            <ChevronRight
                              size={18}
                              className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-700"
                            />

                          </div>

                        </div>


                        {/* Mobile price/status */}

                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 sm:hidden">

                          <span className="text-sm font-semibold text-gray-900">
                            ${order.total}
                          </span>

                          {order.paid ? (
                            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-medium text-green-600">
                              <Check size={11} />
                              Paid
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-600">
                              <Clock3 size={11} />
                              Payment pending
                            </span>
                          )}

                        </div>


                        {/* Delivery status */}

                        <div className="mt-3 flex items-center gap-2 text-[11px]">

                          {order.delivered ? (

                            <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 font-medium text-green-600">

                              <Check size={11} />

                              Delivered

                            </span>

                          ) : (

                            <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-500">

                              <Clock3 size={11} />

                              Processing

                            </span>

                          )}

                        </div>

                      </a>
                    </Link>

                  ))}

                </div>

              )}

            </div>

          </div>

        </section>

      </main>
    </>
  )
}

export default Profile
```
