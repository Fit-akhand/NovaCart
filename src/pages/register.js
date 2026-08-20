import Head from 'next/head'
import Link from 'next/link'
import { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from 'lucide-react'

import valid from '@/validators/auth'
import { DataContext } from '../../store/GlobalState'
import { postData } from '@/lib/api-client'
import BrandLogo from '../../components/common/BrandLogo'
import Button from '../../components/common/Button'
import ThemeToggle from '../../components/common/ThemeToggle'

const fieldClass =
  'h-12 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 !pl-12 text-sm text-[var(--nova-text)] outline-none placeholder:text-[var(--nova-muted)] focus:border-[var(--nova-blue)]'

const Register = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    cf_password: '',
  })

  const {
    name,
    email,
    password,
    cf_password,
  } = userData

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { state, dispatch } = useContext(DataContext)
  const { auth, notify } = state

  const router = useRouter()

  const handleChangeInput = (e) => {
    const { name: field, value } = e.target

    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }))

    dispatch({
      type: 'NOTIFY',
      payload: {},
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errMsg = valid(
      name,
      email,
      password,
      cf_password
    )

    if (errMsg) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: errMsg,
        },
      })
    }

    dispatch({
      type: 'NOTIFY',
      payload: {
        loading: true,
      },
    })

    const res = await postData(
      'auth/register',
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        cf_password,

        // Backend creates a normal customer.
        accountType: 'user',
      }
    )

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
          'Account created successfully.',
      },
    })

    setTimeout(() => {
      router.push('/signin')
    }, 1000)
  }

  useEffect(() => {
    if (Object.keys(auth).length !== 0) {
      router.push('/')
    }
  }, [auth, router])

  return (
    <>
      <Head>
        <title>Create Account | NovaCart</title>

        <meta
          name="description"
          content="Create your NovaCart customer account."
        />
      </Head>

      <main className="min-h-screen bg-[var(--nova-bg)]">

        <div className="mx-auto flex min-h-screen max-w-[1500px]">

          {/* LEFT BRAND PANEL */}

          <section className="relative hidden overflow-hidden bg-[var(--nova-navy)] lg:flex lg:w-[44%]">

            <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white xl:p-16">

              <BrandLogo variant="light" />

              <div className="max-w-lg">

                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                  Welcome to NovaCart
                </p>

                <h1 className="text-5xl font-semibold leading-tight">

                  Shop smarter.
                  <br />
                  Live better.

                </h1>

                <p className="mt-6 max-w-md text-sm leading-6 text-white/70">

                  Create your account and start
                  discovering products from NovaCart.

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

              <div className="mb-8 flex items-center justify-between">

                <div className="lg:hidden">

                  <BrandLogo compact />

                </div>

                <ThemeToggle />

              </div>


              <div className="mb-7">

                <h2 className="text-3xl font-semibold tracking-tight">

                  Create your NovaCart account

                </h2>

                <p className="mt-2 text-sm text-[var(--nova-muted)]">

                  Enter your details to create your customer account.

                </p>

              </div>


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
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
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
                    Email
                  </label>

                  <div className="relative">

                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
                    />

                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={handleChangeInput}
                      placeholder="you@example.com"
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
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
                    />

                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      id="password"
                      name="password"
                      value={password}
                      onChange={handleChangeInput}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className={`${fieldClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
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
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
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
                      className={`${fieldClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
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


                {/* SUBMIT */}

                <Button
                  type="submit"
                  loading={notify?.loading}
                  className="w-full"
                >
                  Create Customer Account
                </Button>

              </form>


              {/* SELLER */}

              <div className="mt-6 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] p-4">

                <p className="text-sm font-semibold">
                  Want to sell on NovaCart?
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--nova-muted)]">
                  Create a verified seller account with
                  a seller code provided by NovaCart administration.
                </p>

                <Link
                  href="/seller/register"
                  className="mt-3 inline-flex text-sm font-semibold text-[var(--nova-blue)] hover:underline"
                >
                  Create account as seller →
                </Link>

              </div>


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

export default Register