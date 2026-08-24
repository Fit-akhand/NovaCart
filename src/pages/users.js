import Head from 'next/head'
import { useContext, useEffect, useMemo, useState } from 'react'
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
  const { users = [], auth } = state

  const [search, setSearch] = useState('')

  // =========================================================
  // LOAD USERS FROM API
  // =========================================================

  useEffect(() => {
          if (!auth?.user) return

          let mounted = true

          const loadUsers = async () => {
            try {
              const response = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(auth?.token
            ? {
                Authorization: `Bearer ${auth.token}`,
              }
            : {}),
        },
      })

        const data = await response.json()

        if (!response.ok) {
          console.error(
            'Failed to load users:',
            data?.err || 'Unable to load users'
          )

          if (mounted) {
            dispatch({
              type: 'ADD_USERS',
              payload: [],
            })
          }

          return
        }

        if (!mounted) return

        dispatch({
          type: 'ADD_USERS',
          payload: Array.isArray(data?.users)
            ? data.users
            : [],
        })
      } catch (error) {
        console.error('Load users error:', error)

        if (mounted) {
          dispatch({
            type: 'ADD_USERS',
            payload: [],
          })
        }
      }
    }

    loadUsers()

    return () => {
      mounted = false
    }
  }, [
    auth?.user?._id,
    auth?.user?.role,
    auth?.user?.root,
    dispatch,
  ])

  // =========================================================
  // AUTH CHECK
  // =========================================================

  if (!auth?.user) return null

  // =========================================================
  // ROLE CHECK
  // =========================================================

  const isSuperAdmin =
    auth.user.role === 'admin' &&
    auth.user.root === true

  const isSeller =
    auth.user.role === 'seller'

  const pageTitle =
    isSeller
      ? 'My Customers'
      : 'Users'

  const pageDescription =
    isSeller
      ? 'Customers who have purchased products from your store.'
      : 'Manage customers, sellers and administrators from one place.'

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredUsers = useMemo(() => {
    const value =
      search
        .toLowerCase()
        .trim()

    if (!value) {
      return users
    }

    return users.filter((user) => {
      return (
        user.name
          ?.toLowerCase()
          .includes(value) ||

        user.email
          ?.toLowerCase()
          .includes(value) ||

        user._id
          ?.toString()
          .toLowerCase()
          .includes(value)
      )
    })
  }, [users, search])

  // =========================================================
  // STATISTICS
  // =========================================================

  const customerCount =
    users.filter(
      (user) =>
        user.role === 'user'
    ).length

  const sellerCount =
    users.filter(
      (user) =>
        user.role === 'seller'
    ).length

  const adminCount =
    users.filter(
      (user) =>
        user.role === 'admin'
    ).length

  // =========================================================
  // DELETE USER
  // =========================================================

  const handleDeleteUser = (user) => {
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

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <Head>
        <title>
          {isSeller
            ? 'My Customers | NovaCart'
            : 'Users | NovaCart'}
        </title>

        <meta
          name="description"
          content={pageDescription}
        />
      </Head>

      <main className="min-h-screen bg-[var(--nova-bg)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--nova-lavender-soft)] text-[var(--nova-primary)]">
                  <UsersIcon size={15} />
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nova-muted)]">
                  {isSeller
                    ? 'NovaCart Seller'
                    : 'NovaCart Super Admin'}
                </span>

              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-[var(--nova-text)] sm:text-4xl">
                {pageTitle}
              </h1>

              <p className="mt-2 max-w-xl text-sm text-[var(--nova-muted)]">
                {pageDescription}
              </p>

            </div>

            {/* =================================================
                STATISTICS
            ================================================= */}

            {isSeller ? (

              <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-6 py-4 shadow-[var(--shadow-sm)]">

                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--nova-muted)]">
                  My Customers
                </p>

                <p className="mt-1 text-2xl font-semibold text-[var(--nova-text)]">
                  {users.length}
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-4 overflow-hidden rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] shadow-[var(--shadow-sm)]">

                {/* TOTAL */}

                <div className="px-5 py-4">

                  <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--nova-muted)]">
                    Total
                  </p>

                  <p className="mt-1 text-xl font-semibold text-[var(--nova-text)]">
                    {users.length}
                  </p>

                </div>

                {/* CUSTOMERS */}

                <div className="border-l border-[var(--nova-border)] px-5 py-4">

                  <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--nova-muted)]">
                    Customers
                  </p>

                  <p className="mt-1 text-xl font-semibold text-[var(--nova-text)]">
                    {customerCount}
                  </p>

                </div>

                {/* SELLERS */}

                <div className="border-l border-[var(--nova-border)] px-5 py-4">

                  <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--nova-muted)]">
                    Sellers
                  </p>

                  <p className="mt-1 text-xl font-semibold text-[var(--nova-text)]">
                    {sellerCount}
                  </p>

                </div>

                {/* ADMINS */}

                <div className="border-l border-[var(--nova-border)] px-5 py-4">

                  <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--nova-muted)]">
                    Admins
                  </p>

                  <p className="mt-1 text-xl font-semibold text-[var(--nova-text)]">
                    {adminCount}
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              MAIN CARD
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-[var(--nova-border)] bg-[var(--nova-surface)] shadow-[var(--shadow-md)]">

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="flex flex-col gap-4 border-b border-[var(--nova-border)] px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-base font-semibold text-[var(--nova-text)]">
                  {isSeller
                    ? 'My Customers'
                    : 'All Users'}
                </h2>

                <p className="mt-1 text-xs text-[var(--nova-muted)]">
                  {filteredUsers.length}{' '}
                  user
                  {filteredUsers.length !== 1
                    ? 's'
                    : ''}{' '}
                  shown
                </p>

              </div>

              {/* SEARCH */}

              <div className="relative w-full lg:w-80">

                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search by name, email or ID..."
                  className="h-11 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] pl-11 pr-10 text-sm text-[var(--nova-text)] outline-none transition-all duration-200 placeholder:text-[var(--nova-muted)] focus:border-[var(--nova-primary)] focus:bg-[var(--nova-surface)] focus:ring-4 focus:ring-[rgba(139,92,246,0.10)]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch('')
                    }
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--nova-muted)] transition hover:bg-gray-200 hover:text-[var(--nova-text)]"
                  >
                    <X size={14} />
                  </button>
                )}

              </div>

            </div>

            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-[var(--nova-border)] bg-[var(--nova-surface-soft)]">

                    <th className="w-16 px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--nova-muted)]">
                      #
                    </th>

                    <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--nova-muted)]">
                      User
                    </th>

                    <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--nova-muted)]">
                      Email
                    </th>

                    {!isSeller && (
                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--nova-muted)]">
                        Role
                      </th>
                    )}

                    {isSuperAdmin && (
                      <th className="px-4 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--nova-muted)]">
                        Actions
                      </th>
                    )}

                  </tr>

                </thead>

                <tbody className="divide-y divide-[var(--nova-border)]">

                  {filteredUsers.map(
                    (user, index) => {

                      const isCurrentUser =
                        auth.user.email ===
                        user.email

                      const isRootAdmin =
                        user.role === 'admin' &&
                        user.root

                      const canManage =
                        isSuperAdmin &&
                        !isCurrentUser

                      return (

                        <tr
                          key={user._id}
                          className="group transition hover:bg-[var(--nova-surface-soft)]"
                        >

                          {/* NUMBER */}

                          <td className="px-6 py-4 text-xs font-medium text-[var(--nova-muted)]">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              '0'
                            )}
                          </td>

                          {/* USER */}

                          <td className="px-4 py-4">

                            <div className="flex items-center gap-3">

                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[var(--nova-surface-soft)]">

                                {user.avatar ? (

                                  <img
                                    src={user.avatar}
                                    alt={
                                      user.name ||
                                      'User'
                                    }
                                    className="h-full w-full object-cover"
                                  />

                                ) : (

                                  <div className="flex h-full w-full items-center justify-center">

                                    <User
                                      size={17}
                                      className="text-[var(--nova-muted)]"
                                    />

                                  </div>

                                )}

                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-sm font-semibold text-[var(--nova-text)]">
                                  {user.name ||
                                    'Unnamed User'}
                                </p>

                                <p className="mt-0.5 max-w-[220px] truncate font-mono text-[10px] text-[var(--nova-muted)]">
                                  {user._id}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* EMAIL */}

                          <td className="px-4 py-4">

                            <div className="flex items-center gap-2 text-sm text-[var(--nova-muted)]">

                              <Mail
                                size={14}
                                className="text-[var(--nova-muted)]"
                              />

                              {user.email ||
                                'No email'}

                            </div>

                          </td>

                          {/* ROLE */}

                          {!isSeller && (

                            <td className="px-4 py-4">

                              {user.role ===
                              'admin' ? (

                                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--nova-primary)] px-3 py-1.5 text-[10px] font-semibold text-white">

                                  {isRootAdmin ? (
                                    <ShieldCheck
                                      size={12}
                                    />
                                  ) : (
                                    <Shield
                                      size={12}
                                    />
                                  )}

                                  {isRootAdmin
                                    ? 'Super Admin'
                                    : 'Admin'}

                                </div>

                              ) : user.role ===
                                'seller' ? (

                                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--nova-lavender-soft)] px-3 py-1.5 text-[10px] font-semibold text-[var(--nova-primary)]">

                                  <Shield
                                    size={12}
                                  />

                                  Seller

                                </div>

                              ) : (

                                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--nova-surface-soft)] px-3 py-1.5 text-[10px] font-semibold text-[var(--nova-muted)]">

                                  <User
                                    size={12}
                                  />

                                  Customer

                                </div>

                              )}

                            </td>

                          )}

                          {/* ACTIONS */}

                          {isSuperAdmin && (

                            <td className="px-4 py-4">

                              <div className="flex justify-end gap-1">

                                {canManage ? (

                                  <>

                                    <Link
                                      href={`/edit_user/${user._id}`}
                                      title="Edit user"
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--nova-muted)] transition hover:bg-[var(--nova-surface-soft)] hover:text-[var(--nova-text)]"
                                    >
                                      <Edit3
                                        size={16}
                                      />
                                    </Link>

                                    <button
                                      type="button"
                                      title="Remove user"
                                      onClick={() =>
                                        handleDeleteUser(
                                          user
                                        )
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--nova-muted)] transition hover:bg-[color-mix(in_srgb,var(--nova-danger)_8%,transparent)] hover:text-[var(--nova-danger)]"
                                    >
                                      <Trash2
                                        size={16}
                                      />
                                    </button>

                                  </>

                                ) : (

                                  <div className="flex h-9 items-center rounded-lg bg-[var(--nova-surface-soft)] px-3 text-[10px] font-medium text-[var(--nova-muted)]">
                                    {isCurrentUser
                                      ? 'You'
                                      : 'Protected'}
                                  </div>

                                )}

                              </div>

                            </td>

                          )}

                        </tr>

                      )
                    }
                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                MOBILE USERS
            ================================================= */}

            <div className="divide-y divide-[var(--nova-border)] md:hidden">

              {filteredUsers.map(
                (user, index) => {

                  const isCurrentUser =
                    auth.user.email ===
                    user.email

                  const canManage =
                    isSuperAdmin &&
                    !isCurrentUser

                  return (

                    <div
                      key={user._id}
                      className="p-5"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[var(--nova-surface-soft)]">

                            {user.avatar ? (

                              <img
                                src={user.avatar}
                                alt={
                                  user.name ||
                                  'User'
                                }
                                className="h-full w-full object-cover"
                              />

                            ) : (

                              <div className="flex h-full w-full items-center justify-center">

                                <User
                                  size={18}
                                  className="text-[var(--nova-muted)]"
                                />

                              </div>

                            )}

                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-[var(--nova-text)]">
                              {user.name ||
                                'Unnamed User'}
                            </p>

                            <p className="mt-1 truncate text-xs text-[var(--nova-muted)]">
                              {user.email ||
                                'No email'}
                            </p>

                          </div>

                        </div>

                        <span className="shrink-0 text-[10px] font-medium text-[var(--nova-muted)]">
                          #{index + 1}
                        </span>

                      </div>

                      <div className="mt-4 flex items-center justify-between">

                        {/* ROLE */}

                        {!isSeller && (

                          <>

                            {user.role ===
                            'admin' ? (

                              <span className="flex items-center gap-1.5 rounded-full bg-[var(--nova-primary)] px-3 py-1.5 text-[10px] font-semibold text-white">

                                {user.root ? (
                                  <ShieldCheck
                                    size={12}
                                  />
                                ) : (
                                  <Shield
                                    size={12}
                                  />
                                )}

                                {user.root
                                  ? 'Super Admin'
                                  : 'Admin'}

                              </span>

                            ) : user.role ===
                              'seller' ? (

                              <span className="flex items-center gap-1.5 rounded-full bg-[var(--nova-lavender-soft)] px-3 py-1.5 text-[10px] font-semibold text-[var(--nova-primary)]">

                                <Shield
                                  size={12}
                                />

                                Seller

                              </span>

                            ) : (

                              <span className="flex items-center gap-1.5 rounded-full bg-[var(--nova-surface-soft)] px-3 py-1.5 text-[10px] font-semibold text-[var(--nova-muted)]">

                                <User
                                  size={12}
                                />

                                Customer

                              </span>

                            )}

                          </>

                        )}

                        {/* ACTIONS */}

                        {isSuperAdmin && (

                          <div className="flex gap-1">

                            {canManage ? (

                              <>

                                <Link
                                  href={`/edit_user/${user._id}`}
                                  title="Edit user"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--nova-surface-soft)] text-[var(--nova-muted)]"
                                >
                                  <Edit3
                                    size={16}
                                  />
                                </Link>

                                <button
                                  type="button"
                                  title="Remove user"
                                  onClick={() =>
                                    handleDeleteUser(
                                      user
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--nova-danger)_8%,transparent)] text-[var(--nova-danger)]"
                                >
                                  <Trash2
                                    size={16}
                                  />
                                </button>

                              </>

                            ) : (

                              <span className="rounded-lg bg-[var(--nova-surface-soft)] px-3 py-2 text-[10px] text-[var(--nova-muted)]">
                                {isCurrentUser
                                  ? 'You'
                                  : 'Protected'}
                              </span>

                            )}

                          </div>

                        )}

                      </div>

                    </div>

                  )
                }
              )}

            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {filteredUsers.length === 0 && (

              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--nova-surface-soft)]">

                  <Search
                    size={27}
                    className="text-[var(--nova-muted)]"
                  />

                </div>

                <h3 className="text-base font-semibold text-[var(--nova-text)]">

                  {isSeller
                    ? 'No customers yet'
                    : 'No users found'}

                </h3>

                <p className="mt-2 max-w-sm text-sm text-[var(--nova-muted)]">

                  {isSeller
                    ? 'Customers who purchase your products will appear here.'
                    : 'No users match your current search.'}

                </p>

                {search && (

                  <button
                    type="button"
                    onClick={() =>
                      setSearch('')
                    }
                    className="mt-5 flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--nova-primary-dark)]"
                  >

                    <X size={13} />

                    Clear search

                  </button>

                )}

              </div>

            )}

          </section>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[var(--nova-muted)]">

            <Check size={13} />

            User permissions are protected by NovaCart

          </div>

        </div>
      </main>
    </>
  )
}

export default Users