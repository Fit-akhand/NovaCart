import Head from 'next/head'
import { useContext, useState, useEffect } from 'react'
import { DataContext } from '../../../store/GlobalState'
import { updateItem } from '../../../store/Actions'

import { useRouter } from 'next/router'
import { patchData } from '@/lib/api-client'

import {
  ArrowLeft,
  Check,
  Crown,
  Mail,
  Save,
  Shield,
  ShieldCheck,
  User,
  UserCog,
} from 'lucide-react'

const EditUser = () => {
  const router = useRouter()
  const { id } = router.query

  const { state, dispatch } = useContext(DataContext)
  const { auth, users, notify } = state

  const [editUser, setEditUser] = useState(null)
  const [checkAdmin, setCheckAdmin] = useState(false)

  useEffect(() => {
    if (!id || !users) return

    const user = users.find(
      (user) => user._id === id
    )

    if (user) {
      setEditUser(user)
      setCheckAdmin(user.role === 'admin')
    }
  }, [id, users])

  const handleCheck = () => {
    setCheckAdmin((prev) => !prev)
  }

  const handleSubmit = async () => {
    if (!editUser) return

    if (!auth.user?.root) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'You do not have permission to modify users.',
        },
      })
    }

    if (auth.user.email === editUser.email) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'You cannot modify your own role.',
        },
      })
    }

    const role = checkAdmin
      ? 'admin'
      : 'user'

    if (role === editUser.role) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'No changes have been made.',
        },
      })
    }

    dispatch({
      type: 'NOTIFY',
      payload: {
        loading: true,
      },
    })

    const res = await patchData(
      `user/${editUser._id}`,
      { role },
      auth.token
    )

    if (res.err) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: res.err,
        },
      })
    }

    dispatch(
      updateItem(
        users,
        editUser._id,
        {
          ...editUser,
          role,
        },
        'ADD_USERS'
      )
    )

    setEditUser((prev) => ({
      ...prev,
      role,
    }))

    return dispatch({
      type: 'NOTIFY',
      payload: {
        success: res.msg,
      },
    })
  }

  if (!auth.user) return null

  return (
    <>
      <Head>
        <title>
          Edit User | NovaCart Admin
        </title>

        <meta
          name="description"
          content="Manage NovaCart user permissions."
        />
      </Head>

      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-4xl">

          {/* =================================================
              HEADER
          ================================================== */}

          <div className="mb-8">

            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >

              <ArrowLeft size={15} />

              Back to Users

            </button>


            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <UserCog size={19} />
              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  NovaCart Admin
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
                  Edit User
                </h1>

              </div>

            </div>

            <p className="mt-3 max-w-xl text-sm text-gray-500">
              Manage account permissions and administrator
              access for this user.
            </p>

          </div>


          {/* =================================================
              USER CARD
          ================================================== */}

          {editUser ? (

            <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">

              {/* PROFILE */}

              <section className="h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                <div className="flex flex-col items-center p-7 text-center">

                  <div className="relative">

                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-lg ring-1 ring-gray-200">

                      {editUser.avatar ? (

                        <img
                          src={editUser.avatar}
                          alt={editUser.name}
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        <div className="flex h-full w-full items-center justify-center">
                          <User
                            size={30}
                            className="text-gray-400"
                          />
                        </div>

                      )}

                    </div>


                    {editUser.role === 'admin' && (

                      <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-black text-white">
                        <ShieldCheck size={13} />
                      </div>

                    )}

                  </div>


                  <h2 className="mt-5 text-lg font-semibold text-gray-900">
                    {editUser.name}
                  </h2>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">

                    <Mail size={13} />

                    <span className="max-w-[190px] truncate">
                      {editUser.email}
                    </span>

                  </div>


                  {/* Current role */}

                  <div className="mt-5">

                    {editUser.role === 'admin' ? (

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[10px] font-semibold text-white">

                        <Shield size={12} />

                        Administrator

                      </span>

                    ) : (

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-semibold text-gray-600">

                        <User size={12} />

                        Customer

                      </span>

                    )}

                  </div>

                </div>


                <div className="border-t border-gray-100 px-6 py-4">

                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    User ID
                  </p>

                  <p className="break-all font-mono text-[10px] text-gray-500">
                    {editUser._id}
                  </p>

                </div>

              </section>


              {/* SETTINGS */}

              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-100 px-6 py-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                      <Shield size={17} />
                    </div>

                    <div>

                      <h2 className="text-sm font-semibold text-gray-900">
                        Account Permissions
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Control this user's access level.
                      </p>

                    </div>

                  </div>

                </div>


                <div className="p-6">

                  {/* Admin toggle */}

                  <label
                    htmlFor="isAdmin"
                    className={`group flex cursor-pointer items-center justify-between rounded-2xl border p-5 transition ${
                      checkAdmin
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >

                    <div className="flex items-center gap-4">

                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                          checkAdmin
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >

                        {checkAdmin ? (
                          <ShieldCheck size={19} />
                        ) : (
                          <User size={19} />
                        )}

                      </div>


                      <div>

                        <p className="text-sm font-semibold text-gray-900">
                          Administrator access
                        </p>

                        <p className="mt-1 max-w-md text-xs leading-5 text-gray-400">

                          {checkAdmin
                            ? 'This user can access administrator features.'
                            : 'This user has standard customer permissions.'}

                        </p>

                      </div>

                    </div>


                    {/* Toggle */}

                    <div className="relative ml-4 shrink-0">

                      <input
                        type="checkbox"
                        id="isAdmin"
                        checked={checkAdmin}
                        onChange={handleCheck}
                        className="peer sr-only"
                      />

                      <div className="h-6 w-11 rounded-full bg-gray-200 transition peer-checked:bg-black" />

                      <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />

                    </div>

                  </label>


                  {/* Warning */}

                  <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">

                    <div className="flex gap-3">

                      <Crown
                        size={17}
                        className="mt-0.5 shrink-0 text-amber-500"
                      />

                      <div>

                        <p className="text-xs font-semibold text-amber-900">
                          Administrator permissions
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-amber-700">
                          Administrators may have access to
                          products, users, orders and other
                          management features. Only grant this
                          role to trusted users.
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* Save */}

                  <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      <ArrowLeft size={15} />
                      Cancel
                    </button>


                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={notify?.loading}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      {notify?.loading ? (
                        'Saving...'
                      ) : (
                        <>
                          <Save size={15} />
                          Save Changes
                        </>
                      )}

                    </button>

                  </div>

                </div>

              </section>

            </div>

          ) : (

            /* =================================================
                LOADING
            ================================================== */

            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-xl bg-gray-200" />

              <p className="text-sm text-gray-400">
                Loading user...
              </p>

            </div>

          )}


          {/* Footer */}

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-gray-400">

            <ShieldCheck size={13} />

            User permissions are protected by NovaCart

          </div>

        </div>

      </main>
    </>
  )
}

export default EditUser
