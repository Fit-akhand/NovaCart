import Head from 'next/head'
import Link from 'next/link'
import { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'

import valid from '../../utils/valid'
import { DataContext } from '../../store/GlobalState'
import { postData } from '../../utils/fetchData'

const Register = () => {
  const initialState = {
    name: '',
    email: '',
    password: '',
    cf_password: '',
  }

  const [userData, setUserData] = useState(initialState)

  const {
    name,
    email,
    password,
    cf_password,
  } = userData

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

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

    return dispatch({
      type: 'NOTIFY',
      payload: {
        success: res.msg,
      },
    })
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
          content="Create your NovaCart account and start shopping."
        />
      </Head>

      <main className="min-h-screen bg-[#f7f7f7]">

        <div className="mx-auto flex min-h-screen max-w-[1500px]">

          {/* =================================================
              LEFT — BRAND EXPERIENCE
          ================================================== */}

          <section className="relative hidden overflow-hidden bg-black lg:flex lg:w-[48%]">

            {/* Decorative circles */}

            <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full border border-white/10" />

            <div className="absolute -bottom-48 -left-40 h-[600px] w-[600px] rounded-full border border-white/10" />

            <div className="absolute right-20 top-1/3 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

              {/* Logo */}

              <Link href="/" className="flex items-center gap-3 text-white">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                    <Sparkles size={19} />
                  </div>

                  <span className="text-xl font-semibold tracking-tight">
                    NovaCart
                  </span>

              </Link>


              {/* Main message */}

              <div className="max-w-lg">

                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70">

                  <Sparkles size={13} />

                  Welcome to something better

                </div>

                <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-white xl:text-6xl">

                  Your next
                  <br />

                  <span className="text-white/40">
                    favorite thing
                  </span>

                  <br />

                  starts here.

                </h1>

                <p className="mt-6 max-w-md text-sm leading-6 text-white/50">

                  Create your NovaCart account and discover
                  a smarter, simpler way to shop your favorite
                  products.

                </p>


                {/* Benefits */}

                <div className="mt-9 space-y-4">

                  <div className="flex items-center gap-3 text-sm text-white/70">

                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">

                      <Check size={14} />

                    </div>

                    Curated products

                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/70">

                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">

                      <Check size={14} />

                    </div>

                    Secure & reliable checkout

                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/70">

                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">

                      <Check size={14} />

                    </div>

                    Track every order

                  </div>

                </div>

              </div>


              {/* Footer */}

              <p className="text-xs text-white/30">
                © {new Date().getFullYear()} NovaCart. All rights reserved.
              </p>

            </div>

          </section>


          {/* =================================================
              RIGHT — REGISTER FORM
          ================================================== */}

          <section className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[52%]">

            <div className="w-full max-w-md">

              {/* Mobile logo */}

              <div className="mb-10 flex items-center justify-center lg:hidden">

                <Link href="/" className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
                      <Sparkles size={17} />
                    </div>

                    <span className="text-lg font-semibold">
                      NovaCart
                    </span>

                </Link>

              </div>


              {/* Heading */}

              <div className="mb-8">

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">

                  <User size={20} />

                </div>

                <h2 className="text-3xl font-semibold tracking-tight text-gray-950">

                  Create your account

                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">

                  Join NovaCart and start discovering products
                  you'll love.

                </p>

              </div>


              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Name */}

                <div>

                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-semibold text-gray-700"
                  >
                    Full name
                  </label>

                  <div className="relative">

                    <User
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={handleChangeInput}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-4 focus:ring-black/5"
                    />

                  </div>

                </div>


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

                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">

                    <ShieldCheck size={12} />

                    Your email is safe with us.

                  </p>

                </div>


                {/* Password */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-semibold text-gray-700"
                  >
                    Password
                  </label>

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
                      placeholder="Create a password"
                      autoComplete="new-password"
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


                {/* Confirm Password */}

                <div>

                  <label
                    htmlFor="cf_password"
                    className="mb-2 block text-xs font-semibold text-gray-700"
                  >
                    Confirm password
                  </label>

                  <div className="relative">

                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-4 focus:ring-black/5"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
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


                {/* Submit */}

                <button
                  type="submit"
                  disabled={notify?.loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {notify?.loading
                    ? 'Creating account...'
                    : 'Create account'}

                  {!notify?.loading && (
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}

                </button>

              </form>


              {/* Login */}

              <div className="mt-7 text-center">

                <p className="text-sm text-gray-500">

                  Already have an account?{' '}

                  <Link href="/signin" className="font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 transition hover:decoration-gray-900">
                      Sign in
                  </Link>

                </p>

              </div>


              {/* Security */}

              <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-gray-400">

                <ShieldCheck size={13} />

                Your information is protected and encrypted.

              </div>

            </div>

          </section>

        </div>

      </main>
    </>
  )
}

export default Register
