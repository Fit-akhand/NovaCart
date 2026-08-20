import Head from 'next/head'
import Link from 'next/link'
import { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Store,
  User,
} from 'lucide-react'

import { DataContext } from '../../../store/GlobalState'
import { postData } from '@/lib/api-client'
import BrandLogo from '../../../components/common/BrandLogo'
import Button from '../../../components/common/Button'
import ThemeToggle from '../../../components/common/ThemeToggle'

const fieldClass =
  'h-12 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 !pl-12 pr-12 text-sm text-[var(--nova-text)] outline-none placeholder:text-[var(--nova-muted)] focus:border-[var(--nova-blue)]'

const SellerRegister = () => {
  const router = useRouter()

  const { state, dispatch } = useContext(DataContext)
  const { auth, notify } = state

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    cf_password: '',
    sellerCode: '',
  })

  const {
    name,
    email,
    password,
    cf_password,
    sellerCode,
  } = userData

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSellerCode, setShowSellerCode] = useState(false)

  useEffect(() => {
    if (auth && Object.keys(auth).length !== 0) {
      router.push('/')
    }
  }, [auth, router])

  const handleChangeInput = (e) => {
    const { name: fieldName, value } = e.target

    setUserData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))

    dispatch({
      type: 'NOTIFY',
      payload: {},
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !cf_password ||
      !sellerCode.trim()
    ) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: 'Please fill in all required fields.',
        },
      })
    }

    if (password.length < 6) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: 'Password must be at least 6 characters.',
        },
      })
    }

    if (password !== cf_password) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: 'Passwords do not match.',
        },
      })
    }

    dispatch({
      type: 'NOTIFY',
      payload: {
        loading: true,
      },
    })

    const res = await postData('auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      cf_password,

      // Seller registration
      accountType: 'seller',

      // Verified by backend
      sellerCode: sellerCode.trim(),
    })

    if (res.err) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: res.err,
        },
      })
    }

    dispatch({
      type: 'NOTIFY',
      payload: {
        success:
          res.msg ||
          'Seller account created successfully.',
      },
    })

    setTimeout(() => {
      router.push('/signin')
    }, 1200)
  }

  return (
    <>
      <Head>
        <title>Create Seller Account | NovaCart</title>

        <meta
          name="description"
          content="Create a verified NovaCart seller account."
        />
      </Head>

      <main className="min-h-screen bg-[var(--nova-bg)]">

        <div className="mx-auto flex min-h-screen max-w-[1500px]">

          {/* LEFT PANEL */}

          <section className="relative hidden overflow-hidden bg-[var(--nova-navy)] lg:flex lg:w-[44%]">

            <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white xl:p-16">

              <BrandLogo variant="light" />

              <div className="max-w-lg">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <Store size={24} />
                </div>

                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                  NovaCart Seller
                </p>

                <h1 className="text-5xl font-semibold leading-tight tracking-tight xl:text-6xl">
                  Start selling.
                  <br />
                  Grow with NovaCart.
                </h1>

                <p className="mt-6 max-w-md text-sm leading-6 text-white/70">
                  Create your verified seller account and manage
                  your products, inventory, orders, and customers.
                </p>

              </div>

              <p className="text-xs text-white/40">
                © {new Date().getFullYear()} NovaCart
              </p>

            </div>

          </section>


          {/* FORM */}

          <section className="flex w-full items-start justify-center px-5 py-8 sm:px-8 lg:w-[56%]">

            <div className="w-full max-w-md">

              {/* TOP */}

              <div className="mb-7 flex items-center justify-between">

                <Link
                  href="/signin"
                  className="flex items-center gap-2 text-sm text-[var(--nova-muted)] transition hover:text-[var(--nova-text)]"
                >
                  <ArrowLeft size={16} />
                  Back to login
                </Link>

                <ThemeToggle />

              </div>


              {/* HEADER */}

              <div className="mb-7">

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--nova-navy)] text-white">
                  <Store size={20} />
                </div>

                <h2 className="text-3xl font-semibold tracking-tight">
                  Create seller account
                </h2>

                <p className="mt-2 text-sm leading-5 text-[var(--nova-muted)]">
                  Join NovaCart and start selling your products.
                </p>

              </div>


              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* NAME */}

                <div>

                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Full name
                  </label>

                  <div className="relative">

                    <User
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--nova-muted)]"
                    />

                    <input
                      id="name"
                      name="name"
                      value={name}
                      onChange={handleChangeInput}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className={fieldClass}
                    />

                  </div>

                </div>


                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Seller email
                  </label>

                  <div className="relative">

                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--nova-muted)]"
                    />

                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={handleChangeInput}
                      placeholder="seller@example.com"
                      autoComplete="email"
                      className={fieldClass}
                    />

                  </div>

                </div>


                {/* PASSWORD */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--nova-muted)]"
                    />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={password}
                      onChange={handleChangeInput}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className={fieldClass}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--nova-muted)] transition hover:bg-[var(--nova-surface-soft)] hover:text-[var(--nova-text)]"
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >

                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}

                    </button>

                  </div>

                </div>


                {/* CONFIRM PASSWORD */}

                <div>

                  <label
                    htmlFor="cf_password"
                    className="mb-2 block text-sm font-medium"
                  >
                    Confirm password
                  </label>

                  <div className="relative">

                    <Lock
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--nova-muted)]"
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      id="cf_password"
                      name="cf_password"
                      value={cf_password}
                      onChange={handleChangeInput}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      className={fieldClass}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--nova-muted)] transition hover:bg-[var(--nova-surface-soft)] hover:text-[var(--nova-text)]"
                      aria-label={
                        showConfirmPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >

                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}

                    </button>

                  </div>

                </div>


                {/* SELLER VERIFICATION CODE */}

                <div>

                  <label
                    htmlFor="sellerCode"
                    className="mb-2 block text-sm font-medium"
                  >
                    Seller verification code
                  </label>

                  <div className="relative">

                    <ShieldCheck
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--nova-muted)]"
                    />

                    <input
                      type={
                        showSellerCode
                          ? 'text'
                          : 'password'
                      }
                      id="sellerCode"
                      name="sellerCode"
                      value={sellerCode}
                      onChange={handleChangeInput}
                      placeholder="Enter code provided by admin"
                      autoComplete="off"
                      className={fieldClass}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowSellerCode((prev) => !prev)
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--nova-muted)] transition hover:bg-[var(--nova-surface-soft)] hover:text-[var(--nova-text)]"
                      aria-label={
                        showSellerCode
                          ? 'Hide seller code'
                          : 'Show seller code'
                      }
                    >

                      {showSellerCode ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}

                    </button>

                  </div>

                  <p className="mt-2 text-xs leading-5 text-[var(--nova-muted)]">
                    A valid seller verification code is required.
                    Get the code from NovaCart administration.
                  </p>

                </div>


                {/* SECURITY */}

                <div className="flex items-start gap-3 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-4 py-3 text-xs leading-5 text-[var(--nova-muted)]">

                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    Seller access is verified by the NovaCart server.
                    Your seller code is never stored in your account.
                  </span>

                </div>


                {/* BUTTON */}

                <Button
                  type="submit"
                  loading={notify?.loading}
                  className="flex w-full items-center justify-center gap-2"
                >
                  <Store size={17} />
                  Create Seller Account
                </Button>

              </form>


              {/* LOGIN */}

              <p className="mt-6 text-center text-sm text-[var(--nova-muted)]">

                Already have an account?{' '}

                <Link
                  href="/signin"
                  className="font-semibold text-[var(--nova-text)] underline"
                >
                  Sign in
                </Link>

              </p>

            </div>

          </section>

        </div>

      </main>
    </>
  )
}

export default SellerRegister