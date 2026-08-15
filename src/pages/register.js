import Head from 'next/head'
import Link from 'next/link'
import { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Eye, EyeOff, KeyRound, Lock, Mail, Phone, User } from 'lucide-react'
import valid, {
  validAccountType,
  validAdminCodePresent,
  validCustomerDetails,
} from '@/validators/auth'
import { DataContext } from '../../store/GlobalState'
import { postData } from '@/lib/api-client'
import BrandLogo from '../../components/common/BrandLogo'
import Button from '../../components/common/Button'
import ThemeToggle from '../../components/common/ThemeToggle'

const fieldClass =
  'h-12 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 !pl-12 text-sm text-[var(--nova-text)] outline-none placeholder:text-[var(--nova-muted)] focus:border-[var(--nova-blue)]'
const Register = () => {
  const initialState = {
    name: '',
    email: '',
    password: '',
    cf_password: '',
    accountType: 'customer',
    adminCode: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
  }

  const [userData, setUserData] = useState(initialState)
  const {
    name,
    email,
    password,
    cf_password,
    accountType,
    adminCode,
    address,
    city,
    state: deliveryState,
    pincode,
    phone,
  } = userData
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { state, dispatch } = useContext(DataContext)
  const { auth, notify } = state
  const router = useRouter()

  const handleChangeInput = (e) => {
    const { name: field, value } = e.target
    setUserData((prev) => ({ ...prev, [field]: value }))
    dispatch({ type: 'NOTIFY', payload: {} })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errMsg = valid(name, email, password, cf_password)
    if (errMsg) return dispatch({ type: 'NOTIFY', payload: { error: errMsg } })

    const accountTypeErr = validAccountType(accountType)
    if (accountTypeErr) return dispatch({ type: 'NOTIFY', payload: { error: accountTypeErr } })

    if (accountType === 'customer') {
      const customerErr = validCustomerDetails(address, city, deliveryState, pincode, phone)
      if (customerErr) return dispatch({ type: 'NOTIFY', payload: { error: customerErr } })
    }

    if (accountType === 'admin') {
      const adminCodeErr = validAdminCodePresent(adminCode)
      if (adminCodeErr) return dispatch({ type: 'NOTIFY', payload: { error: adminCodeErr } })
    }

    dispatch({ type: 'NOTIFY', payload: { loading: true } })

    const payload =
      accountType === 'admin'
        ? { name, email, password, cf_password, accountType, adminCode }
        : {
            name,
            email,
            password,
            cf_password,
            accountType,
            address,
            city,
            state: deliveryState,
            pincode,
            phone,
          }

    const res = await postData('auth/register', payload)
    if (res.err) return dispatch({ type: 'NOTIFY', payload: { error: res.err } })
    return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
  }

  useEffect(() => {
    if (Object.keys(auth).length !== 0) router.push('/')
  }, [auth, router])

  return (
    <>
      <Head>
        <title>Create Account | NovaCart</title>
      </Head>

      <main className="min-h-screen bg-[var(--nova-bg)]">
        <div className="mx-auto flex min-h-screen max-w-[1500px]">
          <section className="relative hidden overflow-hidden bg-[var(--nova-navy)] lg:flex lg:w-[44%]">
            <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white xl:p-16">
              <BrandLogo variant="light" />
              <div>
                <h1 className="text-5xl font-semibold leading-tight">
                  Create your
                  <br />
                  NovaCart account
                </h1>
                <p className="mt-6 max-w-md text-sm leading-6 text-white/70">
                  Customers can save a delivery address. Admin accounts require a registration code validated on the server.
                </p>
              </div>
              <p className="text-xs text-white/40">© {new Date().getFullYear()} NovaCart</p>
            </div>
          </section>

          <section className="flex w-full items-start justify-center px-5 py-10 sm:px-8 lg:w-[56%]">
            <div className="w-full max-w-md">
              <div className="mb-8 flex items-center justify-between">
                <div className="lg:hidden">
                  <BrandLogo compact />
                </div>
                <ThemeToggle />
              </div>

              <h2 className="text-3xl font-semibold">Create your NovaCart account</h2>
              <p className="mt-2 text-sm text-[var(--nova-muted)]">
                Choose Customer or Admin. Admin access is verified with a secret code.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <p className="mb-2 text-sm font-medium">Account type</p>
                  <div className="grid grid-cols-2 gap-1 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] p-1">
                    {['customer', 'admin'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setUserData((prev) => ({ ...prev, accountType: type }))}
                        className={`h-10 rounded-md text-sm font-semibold capitalize ${
                          accountType === type
                            ? 'bg-[var(--nova-blue)] text-white'
                            : 'text-[var(--nova-muted)] hover:bg-[var(--nova-surface-soft)]'
                        }`}
                      >
                        {type === 'customer' ? 'Customer' : 'Admin'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium">Full name</label>
                  <div className="relative">
                    <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
                    <input id="name" name="name" value={name} onChange={handleChangeInput} placeholder="Enter your full name" className={`${fieldClass} pl-11`} />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
                    <input type="email" id="email" name="email" value={email} onChange={handleChangeInput} placeholder="you@example.com" className={`${fieldClass} pl-11`} />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
                    <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={password} onChange={handleChangeInput} placeholder="Create a password" className={`${fieldClass} pl-11 pr-12`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="cf_password" className="mb-2 block text-sm font-medium">Confirm password</label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
                    <input type={showConfirmPassword ? 'text' : 'password'} id="cf_password" name="cf_password" value={cf_password} onChange={handleChangeInput} placeholder="Confirm your password" className={`${fieldClass} pl-11 pr-12`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {accountType === 'customer' && (
                  <>
                    <div>
                      <label htmlFor="address" className="mb-2 block text-sm font-medium">Address</label>
                      <textarea id="address" name="address" rows="3" value={address} onChange={handleChangeInput} placeholder="Enter your delivery address" className="w-full resize-none rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--nova-blue)]" />
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="city" className="mb-2 block text-sm font-medium">City</label>
                        <input id="city" name="city" value={city} onChange={handleChangeInput} placeholder="City" className={fieldClass} />
                      </div>
                      <div>
                        <label htmlFor="state" className="mb-2 block text-sm font-medium">State</label>
                        <input id="state" name="state" value={deliveryState} onChange={handleChangeInput} placeholder="State" className={fieldClass} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="pincode" className="mb-2 block text-sm font-medium">Pincode</label>
                        <input id="pincode" name="pincode" inputMode="numeric" value={pincode} onChange={handleChangeInput} placeholder="6-digit pincode" className={fieldClass} />
                      </div>
                      <div>
                        <label htmlFor="phone" className="mb-2 block text-sm font-medium">Phone</label>
                        <div className="relative">
                          <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
                          <input type="tel" id="phone" name="phone" inputMode="numeric" value={phone} onChange={handleChangeInput} placeholder="10-digit phone" className={`${fieldClass} pl-11`} />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {accountType === 'admin' && (
                  <div>
                    <label htmlFor="adminCode" className="mb-2 block text-sm font-medium">Admin registration code</label>
                    <div className="relative">
                      <KeyRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
                      <input type="password" id="adminCode" name="adminCode" value={adminCode} onChange={handleChangeInput} placeholder="Enter admin registration code" autoComplete="off" className={`${fieldClass} pl-11`} />
                    </div>
                    <p className="mt-2 text-xs text-[var(--nova-warning)]">
                      Admin registration is restricted. The code is validated on the server and is never stored on your profile.
                    </p>
                  </div>
                )}

                <Button type="submit" loading={notify?.loading} className="w-full">
                  {accountType === 'admin' ? 'Create Admin Account' : 'Create Customer Account'}
                </Button>
              </form>

              <p className="mt-7 text-center text-sm text-[var(--nova-muted)]">
                Already have an account?{' '}
                <Link href="/signin" className="font-semibold text-[var(--nova-text)] underline">Sign in</Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

export default Register