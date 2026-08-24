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

      <main className="min-h-screen bg-[var(--nova-bg)] px-4 py-6 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-4xl">

          {/* =================================================
              HEADER
          ================================================== */}

          <div className="mb-8">

            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-2.5 text-xs font-semibold text-[var(--nova-muted)] shadow-sm transition hover:border-gray-300 hover:bg-[var(--nova-surface-soft)] hover:text-[var(--nova-text)]"
            >

              <ArrowLeft size={15} />

              Back to Users

            </button>


            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--nova-lavender-soft)] text-[var(--nova-primary)]">
                <UserCog size={19} />
              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nova-muted)]">
                  NovaCart Admin
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--nova-text)]">
                  Edit User
                </h1>

              </div>

            </div>

            <p className="mt-3 max-w-xl text-sm text-[var(--nova-muted)]">
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

              <section className="h-fit overflow-hidden rounded-3xl border border-[var(--nova-border)] bg-[var(--nova-surface)] shadow-[var(--shadow-md)]">

                <div className="flex flex-col items-center p-7 text-center">

                  <div className="relative">

                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-[var(--nova-surface-soft)] shadow-lg ring-1 ring-gray-200">

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
                            className="text-[var(--nova-muted)]"
                          />
                        </div>

                      )}

                    </div>


                    {editUser.role === 'admin' && (

                      <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[var(--nova-primary)] text-white">
                        <ShieldCheck size={13} />
                      </div>

                    )}

                  </div>


                  <h2 className="mt-5 text-lg font-semibold text-[var(--nova-text)]">
                    {editUser.name}
                  </h2>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--nova-muted)]">

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

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--nova-surface-soft)] px-3 py-1.5 text-[10px] font-semibold text-[var(--nova-muted)]">

                        <User size={12} />

                        Customer

                      </span>

                    )}

                  </div>

                </div>


                <div className="border-t border-[var(--nova-border)] px-6 py-4">

                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--nova-muted)]">
                    User ID
                  </p>

                  <p className="break-all font-mono text-[10px] text-[var(--nova-muted)]">
                    {editUser._id}
                  </p>

                </div>

              </section>


              {/* SETTINGS */}

              <section className="overflow-hidden rounded-3xl border border-[var(--nova-border)] bg-[var(--nova-surface)] shadow-[var(--shadow-md)]">

                <div className="border-b border-[var(--nova-border)] px-6 py-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--nova-surface-soft)]">
                      <Shield size={17} />
                    </div>

                    <div>

                      <h2 className="text-sm font-semibold text-[var(--nova-text)]">
                        Account Permissions
                      </h2>

                      <p className="mt-0.5 text-xs text-[var(--nova-muted)]">
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
                        ? 'border-gray-900 bg-[var(--nova-surface-soft)]'
                        : 'border-[var(--nova-border)] bg-[var(--nova-surface)] hover:border-gray-300'
                    }`}
                  >

                    <div className="flex items-center gap-4">

                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                          checkAdmin
                            ? 'bg-[var(--nova-primary)] text-white'
                            : 'bg-[var(--nova-surface-soft)] text-[var(--nova-muted)]'
                        }`}
                      >

                        {checkAdmin ? (
                          <ShieldCheck size={19} />
                        ) : (
                          <User size={19} />
                        )}

                      </div>


                      <div>

                        <p className="text-sm font-semibold text-[var(--nova-text)]">
                          Administrator access
                        </p>

                        <p className="mt-1 max-w-md text-xs leading-5 text-[var(--nova-muted)]">

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

                      <div className="h-6 w-11 rounded-full bg-[var(--nova-border)] transition peer-checked:bg-[var(--nova-primary)]" />

                      <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-[var(--nova-surface)] shadow-sm transition peer-checked:translate-x-5" />

                    </div>

                  </label>


                  {/* Warning */}

                  <div className="mt-5 rounded-xl border border-[rgba(245,158,11,0.20)] bg-[rgba(245,158,11,0.08)] p-4">

                    <div className="flex gap-3">

                      <Crown
                        size={17}
                        className="mt-0.5 shrink-0 text-[var(--nova-warning)]"
                      />

                      <div>

                        <p className="text-xs font-semibold text-[var(--nova-text)]">
                          Administrator permissions
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-[var(--nova-muted)]">
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
                      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--nova-border)] px-5 text-sm font-medium text-[var(--nova-muted)] transition hover:bg-[var(--nova-surface-soft)]"
                    >
                      <ArrowLeft size={15} />
                      Cancel
                    </button>


                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={notify?.loading}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--nova-primary)] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(124,58,237,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--nova-primary-dark)] hover:shadow-[0_12px_28px_rgba(124,58,237,0.24)] disabled:cursor-not-allowed disabled:opacity-50"
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

            <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-12 text-center shadow-sm">

              <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-xl bg-[var(--nova-border)]" />

              <p className="text-sm text-[var(--nova-muted)]">
                Loading user...
              </p>

            </div>

          )}


          {/* Footer */}

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[var(--nova-muted)]">

            <ShieldCheck size={13} />

            User permissions are protected by NovaCart

          </div>

        </div>

      </main>
    </>
  )
}

export default EditUser