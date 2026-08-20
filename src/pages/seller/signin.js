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
} from 'lucide-react'

import { DataContext } from '../../../store/GlobalState'
import { postData } from '@/lib/api-client'
import BrandLogo from '../../../components/common/BrandLogo'
import Button from '../../../components/common/Button'
import ThemeToggle from '../../../components/common/ThemeToggle'

const fieldClass =
  'h-12 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 !pl-12 text-sm text-[var(--nova-text)] outline-none placeholder:text-[var(--nova-muted)] focus:border-[var(--nova-blue)]'

const SellerSignin = () => {
  const [userData, setUserData] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)

  const { email, password } = userData

  const { state, dispatch } = useContext(DataContext)

  const { auth, notify } = state

  const router = useRouter()

  const handleChangeInput = (e) => {
    const { name, value } = e.target

    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }))

    dispatch({
      type: 'NOTIFY',
      payload: {},
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: 'Please enter your email and password.',
        },
      })
    }

    dispatch({
      type: 'NOTIFY',
      payload: {
        loading: true,
      },
    })

    const res = await postData('auth/login', userData)

    if (res.err) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: res.err,
        },
      })
    }

    /*
     * IMPORTANT:
     * Seller login only accepts role=seller.
     *
     * Customer/admin accounts cannot enter seller dashboard
     * through this page.
     */

    if (!res.user || res.user.role !== 'seller') {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error:
            'This account is not registered as a seller.',
        },
      })
    }

    dispatch({
      type: 'NOTIFY',
      payload: {
        success: 'Seller login successful.',
      },
    })

    dispatch({
      type: 'AUTH',
      payload: {
        token: res.access_token,
        user: res.user,
      },
    })

    localStorage.setItem('firstLogin', true)

    router.push('/')
  }

  useEffect(() => {
    if (auth?.user?.role === 'seller') {
      router.push('/')
    }
  }, [auth, router])

  return (
    <>
      <Head>
        <title>Seller Login | NovaCart</title>

        <meta
          name="description"
          content="Login to the NovaCart seller dashboard."
        />
      </Head>

      <main className="min-h-screen bg-[var(--nova-bg)]">

        <div className="mx-auto flex min-h-screen max-w-[1500px]">

          {/* LEFT PANEL */}

          <section className="relative hidden overflow-hidden bg-[var(--nova-navy)] lg:flex lg:w-[48%]">

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
                  Sell smarter.
                  <br />
                  Grow faster.
                </h1>

                <p className="mt-6 max-w-md text-sm leading-6 text-white/70">
                  Manage your products, inventory, orders,
                  and customers from your seller dashboard.
                </p>

              </div>

              <p className="text-xs text-white/40">
                © {new Date().getFullYear()} NovaCart
              </p>

            </div>

          </section>

          {/* FORM */}

          <section className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[52%]">

            <div className="w-full max-w-md">

              {/* TOP */}

              <div className="mb-8 flex items-center justify-between">

                <Link
                  href="/signin"
                  className="flex items-center gap-2 text-sm text-[var(--nova-muted)] transition hover:text-[var(--nova-text)]"
                >
                  <ArrowLeft size={16} />
                  Customer login
                </Link>

                <ThemeToggle />

              </div>

              {/* HEADING */}

              <div className="mb-8">

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--nova-navy)] text-white">

                  <Store size={20} />

                </div>

                <h2 className="text-3xl font-semibold tracking-tight">
                  Seller login
                </h2>

                <p className="mt-2 text-sm text-[var(--nova-muted)]">
                  Login to manage your NovaCart store.
                </p>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

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
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className={`${fieldClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--nova-muted)]"
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

                {/* SECURITY */}

                <div className="flex items-center gap-2 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-3 py-3 text-xs text-[var(--nova-muted)]">

                  <ShieldCheck
                    size={15}
                    className="shrink-0"
                  />

                  Seller access is restricted to verified seller accounts.

                </div>

                {/* LOGIN */}

                <Button
                  type="submit"
                  loading={notify?.loading}
                  className="w-full"
                >
                  <Store size={17} />
                  Login as Seller
                </Button>

              </form>

              {/* BOTTOM */}

              <p className="mt-7 text-center text-sm text-[var(--nova-muted)]">

                Not a seller?{' '}

                <Link
                  href="/signin"
                  className="font-semibold text-[var(--nova-text)] underline"
                >
                  Customer login
                </Link>

              </p>

            </div>

          </section>

        </div>

      </main>
    </>
  )
}

export default SellerSignin

