import Head from 'next/head'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '../../store/GlobalState'
import Link from 'next/link'
import valid, { validCustomerDetails } from '@/validators/auth'
import { patchData, postData } from '@/lib/api-client'
import { imageUpload } from '../../utils/imageUpload'
import Container from '../../components/common/Container'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
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
    address: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)

  const { state, dispatch } = useContext(DataContext)
  const { auth, notify, orders } = state
  const isAdmin = auth?.user?.role === 'admin'

  useEffect(() => {
    if (auth.user) {
      setData((prev) => ({
        ...prev,
        name: auth.user.name || '',
        phone: auth.user.phone || '',
        address: auth.user.address || '',
        city: auth.user.city || '',
        state: auth.user.state || '',
        pincode: auth.user.pincode || '',
      }))
    }
  }, [auth.user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setData((prev) => ({ ...prev, [name]: value }))
    dispatch({ type: 'NOTIFY', payload: {} })
  }

  const changeAvatar = (e) => {
    const file = e.target.files[0]
    if (!file) {
      return dispatch({ type: 'NOTIFY', payload: { error: 'File does not exist.' } })
    }
    if (file.size > 1024 * 1024) {
      return dispatch({ type: 'NOTIFY', payload: { error: 'The largest image size is 1mb.' } })
    }
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      return dispatch({ type: 'NOTIFY', payload: { error: 'Image format is incorrect.' } })
    }
    setData((prev) => ({ ...prev, avatar: file }))
  }

  const updatePassword = () => {
    dispatch({ type: 'NOTIFY', payload: { loading: true } })
    patchData('user/resetPassword', { password: data.password }, auth.token).then((res) => {
      if (res.err) return dispatch({ type: 'NOTIFY', payload: { error: res.err } })
      dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
    })
  }

  const updateInfor = async (fields) => {
    let media
    dispatch({ type: 'NOTIFY', payload: { loading: true } })

    if (data.avatar) {
      media = await imageUpload([data.avatar])
    }

    const payload = {
      ...fields,
      avatar: data.avatar ? media[0].url : auth.user.avatar,
    }

    const res = await patchData('user', payload, auth.token)
    if (res.err) return dispatch({ type: 'NOTIFY', payload: { error: res.err } })

    dispatch({
      type: 'AUTH',
      payload: { token: auth.token, user: res.user },
    })
    dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
    setData((prev) => ({ ...prev, avatar: '' }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()

    if (data.password) {
      const errMsg = valid(data.name, auth.user.email, data.password, data.cf_password)
      if (errMsg) return dispatch({ type: 'NOTIFY', payload: { error: errMsg } })
      updatePassword()
    }

    if (data.name !== auth.user.name || data.avatar) {
      await updateInfor({ name: data.name })
    }

    setEditingProfile(false)
  }

  const handleUpdateAddress = async (e) => {
    e.preventDefault()
    const customerErr = validCustomerDetails(
      data.address,
      data.city,
      data.state,
      data.pincode,
      data.phone
    )
    if (customerErr) return dispatch({ type: 'NOTIFY', payload: { error: customerErr } })

    await updateInfor({
      name: data.name || auth.user.name,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
    })
    setEditingAddress(false)
  }

  const handleLogout = async () => {
    try {
      await postData('auth/logout', null, auth?.token)
      localStorage.removeItem('firstLogin')
      dispatch({ type: 'AUTH', payload: {} })
      dispatch({ type: 'ADD_ORDERS', payload: [] })
      dispatch({ type: 'ADD_USERS', payload: [] })
      window.location.href = '/'
    } catch (error) {
      dispatch({
        type: 'NOTIFY',
        payload: { error: error.message || 'Logout failed.' },
      })
    }
  }

  if (!auth.user) return null

  const memberSince = auth.user.createdAt
    ? new Date(auth.user.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Not available'

  return (
    <>
      <Head>
        <title>{isAdmin ? 'Admin Profile' : 'My Profile'} | NovaCart</title>
      </Head>

      <main className="py-8 sm:py-10">
        <Container>
          <h1 className="mb-8 text-center text-3xl font-semibold">My Profile</h1>

          <section className="mb-6 flex flex-col items-center rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-6 py-8 text-center">
            <div className="relative mb-4">
              <div className="h-24 w-24 overflow-hidden rounded-full border border-[var(--nova-border)] bg-[var(--nova-surface-soft)]">
                <img
                  src={data.avatar ? URL.createObjectURL(data.avatar) : auth.user.avatar}
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
            <h2 className="text-xl font-semibold">{auth.user.name}</h2>
            <p className="text-sm text-[var(--nova-muted)]">{auth.user.email}</p>
            <Badge className="mt-2" variant={isAdmin ? 'blue' : 'default'}>
              {isAdmin ? 'Admin' : 'Customer'}
            </Badge>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-6">
              <section className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Personal information</h3>
                  <Button variant="secondary" onClick={() => setEditingProfile((open) => !open)}>
                    {editingProfile ? 'Cancel' : 'Edit profile'}
                  </Button>
                </div>

                {editingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <Input id="name" name="name" label="Full name" value={data.name} onChange={handleChange} />
                    <Input id="email" label="Email" value={auth.user.email} disabled />
                    {!isAdmin && (
                      <Input id="phone" name="phone" label="Phone" value={data.phone} onChange={handleChange} />
                    )}
                    <Input id="password" name="password" type="password" label="New password (optional)" value={data.password} onChange={handleChange} />
                    <Input id="cf_password" name="cf_password" type="password" label="Confirm new password" value={data.cf_password} onChange={handleChange} />
                    <Button type="submit" loading={notify.loading} className="w-full">
                      Save changes
                    </Button>
                  </form>
                ) : (
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--nova-muted)]">Full name</dt>
                      <dd>{auth.user.name}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--nova-muted)]">Email</dt>
                      <dd className="break-all">{auth.user.email}</dd>
                    </div>
                    {!isAdmin && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--nova-muted)]">Phone</dt>
                        <dd>{auth.user.phone || 'Not added'}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </section>

              {!isAdmin && (
                <section className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">Delivery address</h3>
                    <Button variant="secondary" onClick={() => setEditingAddress((open) => !open)}>
                      {editingAddress ? 'Cancel' : 'Edit address'}
                    </Button>
                  </div>

                  {editingAddress ? (
                    <form onSubmit={handleUpdateAddress} className="space-y-4">
                      <div>
                        <label htmlFor="address" className="mb-2 block text-sm font-medium">Address</label>
                        <textarea id="address" name="address" rows="3" value={data.address} onChange={handleChange} className="w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--nova-blue)]" />
                      </div>
                      <Input id="city" name="city" label="City" value={data.city} onChange={handleChange} />
                      <Input id="state" name="state" label="State" value={data.state} onChange={handleChange} />
                      <Input id="pincode" name="pincode" label="Pincode" value={data.pincode} onChange={handleChange} />
                      <Button type="submit" loading={notify.loading} className="w-full">Save address</Button>
                    </form>
                  ) : (
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--nova-muted)]">Address</dt>
                        <dd className="text-right">{auth.user.address || 'Not added'}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--nova-muted)]">City</dt>
                        <dd>{auth.user.city || 'Not added'}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--nova-muted)]">State</dt>
                        <dd>{auth.user.state || 'Not added'}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--nova-muted)]">Pincode</dt>
                        <dd>{auth.user.pincode || 'Not added'}</dd>
                      </div>
                    </dl>
                  )}
                </section>
              )}

              <section className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-6">
                <h3 className="mb-4 font-semibold">Account</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--nova-muted)]">Account type</dt>
                    <dd>{isAdmin ? 'Admin' : 'Customer'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--nova-muted)]">Member since</dt>
                    <dd>{memberSince}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-6">
                <h3 className="mb-4 font-semibold">Quick actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Link href="#orders"><Button variant="secondary">My orders</Button></Link>
                  <Link href="/cart"><Button variant="secondary">Cart</Button></Link>
                  {isAdmin && (
                    <>
                      <Link href="/users"><Button variant="secondary">Customers</Button></Link>
                      <Link href="/create"><Button variant="secondary">Admin tools</Button></Link>
                    </>
                  )}
                </div>
              </section>

              <Button variant="danger" onClick={handleLogout} className="w-full">
                <span className="inline-flex items-center gap-2">
                  <LogOut size={16} />
                  Sign out
                </span>
              </Button>
            </div>

            <section id="orders" className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">
              <div className="flex items-center justify-between border-b border-[var(--nova-border)] px-6 py-5">
                <div>
                  <h3 className="font-semibold">Orders</h3>
                  <p className="text-xs text-[var(--nova-muted)]">{orders.length} total orders</p>
                </div>
                <ShoppingBag size={18} className="text-[var(--nova-muted)]" />
              </div>

              {orders.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  description="Your purchases will appear here once you place an order."
                  action={<Link href="/products"><Button>Start shopping</Button></Link>}
                />
              ) : (
                <div className="divide-y divide-[var(--nova-border)]">
                  {orders.map((order) => (
                    <Link key={order._id} href={`/order/${order._id}`} className="block px-6 py-5 hover:bg-[var(--nova-surface-soft)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold">Order #{order._id.slice(-8)}</p>
                          <p className="mt-1 text-xs text-[var(--nova-muted)]">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {' · '}
                            {order.cart?.length || 0} items
                          </p>
                        </div>
                        <p className="text-sm font-semibold">${order.total}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {order.paid ? (
                          <Badge variant="success"><Check size={11} className="mr-1" />Paid</Badge>
                        ) : (
                          <Badge variant="warning"><Clock3 size={11} className="mr-1" />Payment pending</Badge>
                        )}
                        {order.delivered ? (
                          <Badge variant="success">Delivered</Badge>
                        ) : (
                          <Badge>Processing</Badge>
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

export default Profile
