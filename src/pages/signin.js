```jsx
import Head from 'next/head'
import Link from 'next/link'
import { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookie from 'js-cookie'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Check,
} from 'lucide-react'

import { DataContext } from '../store/GlobalState'
import { postData } from '../utils/fetchData'

const Signin = () => {
  const initialState = {
    email: '',
    password: '',
  }

  const [userData, setUserData] = useState(initialState)
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

    const res = await postData(
      'auth/login',
      userData
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
        success: res.msg,
      },
    })

    dispatch({
      type: 'AUTH',
      payload: {
        token: res.access_token,
        user: res.user,
      },
    })

    Cookie.set(
      'refreshtoken',
      res.refresh_token,
      {
        path: 'api/auth/accessToken',
        expires: 7,
      }
    )

    localStorage.setItem(
      'firstLogin',
      true
    )
  }

  useEffect(() => {
    if (Object.keys(auth).length !== 0) {
      router.push('/')
    }
  }, [auth, router])

  return (
    <>
      <Head>
        <title>Sign In | NovaCart</title>

        <meta
          name="description"
          content="Sign in to your NovaCart account."
        />
      </Head>

      <main className="min-h-screen bg-[#f7f7f7]">

        <div className="mx-auto flex min-h-screen max-w-[1500px]">

          {/* =================================================
              LEFT — BRAND SECTION
          ================================================== */}

          <section className="relative hidden overflow-hidden bg-black lg:flex lg:w-[48%]">

            {/* Decorative elements */}

            <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full border border-white/10" />

            <div className="absolute -bottom-48 -left-40 h-[600px] w-[600px] rounded-full border border-white/10" />

            <div className="absolute right-24 top-1/3 h-44 w-44 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

              {/* Logo */}

              <Link href="/">
                <a className="flex items-center gap-3 text-white">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                    <Sparkles size={19} />
                  </div>

                  <span className="text-xl font-semibold tracking-tight">
                    NovaCart
                  </span>

                </a>
              </Link>


              {/* Main content */}

              <div className="max-w-lg">

                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70">

                  <ShieldCheck size={13} />

                  Secure shopping experience

                </div>


                <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-white xl:text-6xl">

                  Everything you
                  <br />

                  <span className="text-white/40">
                    want,
                  </span>

                  <br />

                  in one place.

                </h1>


                <p className="mt-6 max-w-md text-sm leading-6 text-white/50">

                  Sign in to continue shopping, manage your
                  orders and discover products curated for
                  you.

                </p>


                {/* Benefits */}

                <div className="mt-9 space-y-4">

                  <div className="flex items-center gap-3 text-sm text-white/70">

                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                      <Check size={14} />
                    </div>

                    Personalized shopping

                  </div>


                  <div className="flex items-center gap-3 text-sm text-white/70">

                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                      <Check size={14} />
                    </div>

                    Easy order tracking

                  </div>


                  <div className="flex items-center gap-3 text-sm text-white/70">

                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                      <Check size={14} />
                    </div>

                    Secure checkout

                  </div>

                </div>

              </div>


              <p className="text-xs text-white/30">
                © {new Date().getFullYear()} NovaCart. All rights reserved.
              </p>

            </div>

          </section>


          {/* =================================================
              RIGHT — LOGIN FORM
          ================================================== */}

          <section className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[52%]">

            <div className="w-full max-w-md">

              {/* Mobile logo */}

              <div className="mb-10 flex items-center justify-center lg:hidden">

                <Link href="/">
                  <a className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
                      <Sparkles size={17} />
                    </div>

                    <span className="text-lg font-semibold">
                      NovaCart
                    </span>

                  </a>
                </Link>

              </div>


              {/* Heading */}

              <div className="mb-8">

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">

                  <Lock size={19} />

                </div>


                <h2 className="text-3xl font-semibold tracking-tight text-gray-950">

                  Welcome back

                </h2>


                <p className="mt-2 text-sm leading-6 text-gray-500">

                  Sign in to your NovaCart account to continue
                  shopping.

                </p>

              </div>


              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold text-gray-700"
                  >
                    Email address
                  </label>

                  <div className="relative">

                    <Mail
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={handleChangeInput}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-4 focus:ring-black/5"
                    />

                  </div>

                </div>


                {/* Password */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-xs font-semibold text-gray-700"
                    >
                      Password
                    </label>

                    <Link href="/forgot-password">
                      <a className="text-xs font-medium text-gray-500 transition hover:text-black">
                        Forgot password?
                      </a>
                    </Link>

                  </div>


                  <div className="relative">

                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-4 focus:ring-black/5"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
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


                {/* Remember / security */}

                <div className="flex items-center gap-2 text-[11px] text-gray-400">

                  <ShieldCheck size={13} />

                  Your connection is secure.

                </div>


                {/* Submit */}

                <button
                  type="submit"
                  disabled={notify?.loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {notify?.loading
                    ? 'Signing in...'
                    : 'Sign in'}

                  {!notify?.loading && (
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}

                </button>

              </form>


              {/* Register */}

              <div className="mt-7 text-center">

                <p className="text-sm text-gray-500">

                  Don't have an account?{' '}

                  <Link href="/register">
                    <a className="font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 transition hover:decoration-gray-900">
                      Create an account
                    </a>
                  </Link>

                </p>

              </div>


              {/* Bottom security */}

              <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-gray-400">

                <Lock size={12} />

                Secure authentication by NovaCart

              </div>

            </div>

          </section>

        </div>

      </main>
    </>
  )
}

export default Signin
```
