import Head from 'next/head'
import { useContext, useMemo, useState } from 'react'
import { DataContext } from '../../store/GlobalState'
import Link from 'next/link'
import {
  Check,
  Edit3,
  Mail,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  Users as UsersIcon,
  X,
} from 'lucide-react'

const Users = () => {
  const { state, dispatch } = useContext(DataContext)
  const { users, auth } = state

  const [search, setSearch] = useState('')

  if (!auth.user) return null

  const filteredUsers = useMemo(() => {
    const value = search.toLowerCase().trim()

    if (!value) return users

    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(value) ||
        user.email?.toLowerCase().includes(value) ||
        user._id?.toLowerCase().includes(value)
    )
  }, [users, search])

  const adminCount = users.filter(
    (user) => user.role === 'admin'
  ).length

  const regularUserCount = users.filter(
    (user) => user.role !== 'admin'
  ).length

  return (
    <>
      <Head>
        <title>Users | NovaCart Admin</title>

        <meta
          name="description"
          content="Manage NovaCart users and administrators."
        />
      </Head>

      <main className="min-h-screen bg-[#f8f8f8] px-4 py-6 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          {/* =================================================
              HEADER
          ================================================== */}

          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                  <UsersIcon size={15} />
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  NovaCart Admin
                </span>

              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                Users
              </h1>

              <p className="mt-2 max-w-xl text-sm text-gray-500">
                Manage customers, administrators and account
                permissions from one place.
              </p>

            </div>


            {/* Statistics */}

            <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="px-5 py-4">

                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Total
                </p>

                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {users.length}
                </p>

              </div>

              <div className="border-l border-gray-100 px-5 py-4">

                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Admins
                </p>

                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {adminCount}
                </p>

              </div>

              <div className="border-l border-gray-100 px-5 py-4">

                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Customers
                </p>

                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {regularUserCount}
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              MAIN CARD
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* Toolbar */}

            <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-base font-semibold text-gray-900">
                  All Users
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {filteredUsers.length} user
                  {filteredUsers.length !== 1
                    ? 's'
                    : ''}{' '}
                  shown
                </p>

              </div>


              {/* Search */}

              <div className="relative w-full lg:w-80">

                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search by name, email or ID..."
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-200 hover:text-gray-900"
                  >
                    <X size={14} />
                  </button>
                )}

              </div>

            </div>


            {/* =================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-gray-100 bg-gray-50/70">

                    <th className="w-16 px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      #
                    </th>

                    <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      User
                    </th>

                    <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Email
                    </th>

                    <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Role
                    </th>

                    <th className="px-4 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-gray-100">

                  {filteredUsers.map((user, index) => {

                    const isCurrentUser =
                      auth.user.email === user.email

                    const isRootAdmin =
                      user.role === 'admin' &&
                      user.root

                    const canManage =
                      auth.user.root &&
                      !isCurrentUser

                    return (

                      <tr
                        key={user._id}
                        className="group transition hover:bg-gray-50/70"
                      >

                        {/* Number */}

                        <td className="px-6 py-4 text-xs font-medium text-gray-300">
                          {String(index + 1).padStart(
                            2,
                            '0'
                          )}
                        </td>


                        {/* User */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-3">

                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gray-100">

                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <User
                                    size={17}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}

                            </div>


                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-gray-900">
                                {user.name}
                              </p>

                              <p className="mt-0.5 max-w-[220px] truncate font-mono text-[10px] text-gray-400">
                                {user._id}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* Email */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2 text-sm text-gray-600">

                            <Mail
                              size={14}
                              className="text-gray-300"
                            />

                            {user.email}

                          </div>

                        </td>


                        {/* Role */}

                        <td className="px-4 py-4">

                          {user.role === 'admin' ? (

                            <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[10px] font-semibold text-white">

                              {isRootAdmin ? (
                                <ShieldCheck
                                  size={12}
                                />
                              ) : (
                                <Shield size={12} />
                              )}

                              {isRootAdmin
                                ? 'Root Admin'
                                : 'Admin'}

                            </div>

                          ) : (

                            <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-semibold text-gray-600">

                              <User size={12} />

                              Customer

                            </div>

                          )}

                        </td>


                        {/* Actions */}

                        <td className="px-4 py-4">

                          <div className="flex justify-end gap-1">

                            {canManage ? (

                              <>

                                <Link
                                  href={`/edit_user/${user._id}`}
                                  title="Edit user"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                                >
                                  <Edit3 size={16} />
                                </Link>


                                <button
                                  type="button"
                                  title="Remove user"
                                  data-toggle="modal"
                                  data-target="#exampleModal"
                                  onClick={() =>
                                    dispatch({
                                      type: 'ADD_MODAL',
                                      payload: [
                                        {
                                          data: users,
                                          id: user._id,
                                          title: user.name,
                                          type: 'ADD_USERS',
                                        },
                                      ],
                                    })
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                >
                                  <Trash2 size={16} />
                                </button>

                              </>

                            ) : (

                              <div className="flex h-9 items-center rounded-lg bg-gray-50 px-3 text-[10px] font-medium text-gray-400">
                                {isCurrentUser
                                  ? 'You'
                                  : 'Protected'}
                              </div>

                            )}

                          </div>

                        </td>

                      </tr>

                    )
                  })}

                </tbody>

              </table>

            </div>


            {/* =================================================
                MOBILE USER CARDS
            ================================================== */}

            <div className="divide-y divide-gray-100 md:hidden">

              {filteredUsers.map((user, index) => {

                const isCurrentUser =
                  auth.user.email === user.email

                const canManage =
                  auth.user.root &&
                  !isCurrentUser

                return (

                  <div
                    key={user._id}
                    className="p-5"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gray-100">

                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <User
                                size={18}
                                className="text-gray-400"
                              />
                            </div>
                          )}

                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-gray-900">
                            {user.name}
                          </p>

                          <p className="mt-1 truncate text-xs text-gray-400">
                            {user.email}
                          </p>

                        </div>

                      </div>


                      <span className="shrink-0 text-[10px] font-medium text-gray-300">
                        #{index + 1}
                      </span>

                    </div>


                    <div className="mt-4 flex items-center justify-between">

                      {user.role === 'admin' ? (

                        <span className="flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[10px] font-semibold text-white">

                          {user.root ? (
                            <ShieldCheck size={12} />
                          ) : (
                            <Shield size={12} />
                          )}

                          {user.root
                            ? 'Root Admin'
                            : 'Admin'}

                        </span>

                      ) : (

                        <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-semibold text-gray-600">

                          <User size={12} />

                          Customer

                        </span>

                      )}


                      <div className="flex gap-1">

                        {canManage ? (

                          <>

                            <Link
                              href={`/edit_user/${user._id}`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500"
                            >
                              <Edit3 size={16} />
                            </Link>

                            <button
                              type="button"
                              data-toggle="modal"
                              data-target="#exampleModal"
                              onClick={() =>
                                dispatch({
                                  type: 'ADD_MODAL',
                                  payload: [
                                    {
                                      data: users,
                                      id: user._id,
                                      title: user.name,
                                      type: 'ADD_USERS',
                                    },
                                  ],
                                })
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>

                          </>

                        ) : (

                          <span className="rounded-lg bg-gray-50 px-3 py-2 text-[10px] text-gray-400">
                            {isCurrentUser
                              ? 'You'
                              : 'Protected'}
                          </span>

                        )}

                      </div>

                    </div>

                  </div>

                )
              })}

            </div>


            {/* Empty state */}

            {filteredUsers.length === 0 && (

              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">

                  <Search
                    size={27}
                    className="text-gray-400"
                  />

                </div>

                <h3 className="text-base font-semibold text-gray-900">
                  No users found
                </h3>

                <p className="mt-2 max-w-sm text-sm text-gray-400">
                  No users match your current search.
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="mt-5 flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-800"
                  >
                    <X size={13} />
                    Clear search
                  </button>
                )}

              </div>

            )}

          </section>


          {/* Footer */}

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-gray-400">

            <Check size={13} />

            User permissions are protected by NovaCart

          </div>

        </div>

      </main>
    </>
  )
}

export default Users
