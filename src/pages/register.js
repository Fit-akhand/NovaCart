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
  ShieldCheck,
  Store,
  UserPlus,
} from 'lucide-react'

import valid from '@/validators/auth'
import { DataContext } from '../../store/GlobalState'
import { postData } from '@/lib/api-client'
import BrandLogo from '../../components/common/BrandLogo'
import Button from '../../components/common/Button'
import ThemeToggle from '../../components/common/ThemeToggle'

const fieldClass = `
  h-12
  w-full
  rounded-xl
  border
  border-[var(--nova-border)]
  bg-[var(--nova-surface)]
  px-4
  !pl-12
  pr-12
  text-sm
  text-[var(--nova-text)]
  outline-none
  placeholder:text-[var(--nova-muted)]

  transition-all
  duration-200

  hover:border-[var(--nova-violet-light)]

  focus:border-[var(--nova-primary)]
  focus:ring-4
  focus:ring-[rgba(139,92,246,0.10)]
`

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

  const [showPassword, setShowPassword] =
    useState(false)

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const { state, dispatch } =
    useContext(DataContext)

  const { auth, notify } = state

  const router = useRouter()

  // =========================================================
  // INPUT
  // =========================================================

  const handleChangeInput = (e) => {
    const {
      name: field,
      value,
    } = e.target

    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }))

    dispatch({
      type: 'NOTIFY',
      payload: {},
    })
  }

  // =========================================================
  // REGISTER
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

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

    // -------------------------------------------------------
    // LOADING
    // -------------------------------------------------------

    dispatch({
      type: 'NOTIFY',
      payload: {
        loading: true,
      },
    })

    // -------------------------------------------------------
    // REGISTER API
    // -------------------------------------------------------

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

    // -------------------------------------------------------
    // API ERROR
    // -------------------------------------------------------

    if (res.err) {
      return dispatch({
        type: 'NOTIFY',
        payload: {
          error: res.err,
        },
      })
    }

    // -------------------------------------------------------
    // SUCCESS
    // -------------------------------------------------------

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

  // =========================================================
  // AUTH REDIRECT
  // =========================================================

  useEffect(() => {
    if (Object.keys(auth).length !== 0) {
      router.push('/')
    }
  }, [auth, router])

  return (
    <>
      <Head>
        <title>
          Create Account | NovaCart
        </title>

        <meta
          name="description"
          content="Create your NovaCart customer account."
        />
      </Head>

      <main className="min-h-screen bg-[var(--nova-bg)]">

        <div
          className="
            mx-auto
            flex
            min-h-screen
            max-w-[1500px]
          "
        >

          {/* =================================================
              LEFT BRAND PANEL
          ================================================= */}

          <section
            className="
              relative
              hidden
              overflow-hidden

              border-r
              border-[var(--nova-border)]

              bg-[var(--nova-surface)]

              lg:flex
              lg:w-[46%]
            "
          >

            {/* Violet glow */}

            <div
              className="
                pointer-events-none
                absolute
                -left-32
                -top-32

                h-[430px]
                w-[430px]

                rounded-full

                bg-[rgba(139,92,246,0.16)]

                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-40
                right-0

                h-[430px]
                w-[430px]

                rounded-full

                bg-[rgba(167,139,250,0.10)]

                blur-3xl
              "
            />

            <div
              className="
                relative
                z-10

                flex
                w-full
                flex-col
                justify-between

                p-12
                xl:p-16
              "
            >

              {/* LOGO */}

              <BrandLogo />


              {/* HERO */}

              <div className="max-w-lg">

                <div
                  className="
                    mb-5
                    inline-flex
                    items-center
                    gap-2

                    rounded-full

                    border
                    border-[rgba(139,92,246,0.20)]

                    bg-[var(--nova-lavender-soft)]

                    px-3
                    py-1.5

                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.18em]

                    text-[var(--nova-primary)]
                  "
                >
                  <UserPlus size={13} />

                  Welcome to NovaCart
                </div>


                <h1
                  className="
                    text-5xl
                    font-bold
                    leading-[1.08]
                    tracking-[-0.04em]

                    text-[var(--nova-text)]
                  "
                >
                  Shop smarter.

                  <br />

                  <span className="text-[var(--nova-primary)]">
                    Live better.
                  </span>
                </h1>


                <p
                  className="
                    mt-6
                    max-w-md

                    text-base
                    leading-7

                    text-[var(--nova-muted)]
                  "
                >
                  Create your account and start
                  discovering products from NovaCart.
                </p>


                {/* FEATURES */}

                <div
                  className="
                    mt-8
                    grid
                    max-w-md
                    grid-cols-2
                    gap-3
                  "
                >

                  {/* CUSTOMER */}

                  <div
                    className="
                      rounded-2xl

                      border
                      border-[var(--nova-border)]

                      bg-[var(--nova-surface)]

                      p-4

                      shadow-[var(--shadow-sm)]
                    "
                  >

                    <div
                      className="
                        mb-3
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center

                        rounded-xl

                        bg-[var(--nova-lavender-soft)]

                        text-[var(--nova-primary)]
                      "
                    >
                      <User
                        size={17}
                      />
                    </div>

                    <p
                      className="
                        text-sm
                        font-bold

                        text-[var(--nova-text)]
                      "
                    >
                      Customer
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs

                        text-[var(--nova-muted)]
                      "
                    >
                      Shop and track orders
                    </p>

                  </div>


                  {/* SECURE */}

                  <div
                    className="
                      rounded-2xl

                      border
                      border-[var(--nova-border)]

                      bg-[var(--nova-surface)]

                      p-4

                      shadow-[var(--shadow-sm)]
                    "
                  >

                    <div
                      className="
                        mb-3
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center

                        rounded-xl

                        bg-[var(--nova-lavender-soft)]

                        text-[var(--nova-primary)]
                      "
                    >
                      <ShieldCheck
                        size={17}
                      />
                    </div>

                    <p
                      className="
                        text-sm
                        font-bold

                        text-[var(--nova-text)]
                      "
                    >
                      Secure
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs

                        text-[var(--nova-muted)]
                      "
                    >
                      Protected account
                    </p>

                  </div>

                </div>

              </div>


              {/* FOOTER */}

              <div
                className="
                  flex
                  items-center
                  gap-3

                  text-xs
                  text-[var(--nova-muted)]
                "
              >

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center

                    rounded-xl

                    bg-[var(--nova-lavender-soft)]

                    text-[var(--nova-primary)]
                  "
                >
                  <ShieldCheck
                    size={17}
                  />
                </div>

                <div>

                  <p
                    className="
                      font-semibold

                      text-[var(--nova-text)]
                    "
                  >
                    Secure account creation
                  </p>

                  <p className="mt-0.5">
                    Your information stays protected.
                  </p>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              FORM PANEL
          ================================================= */}

          <section
            className="
              flex
              w-full
              items-start
              justify-center

              px-5
              py-8

              sm:px-8
              sm:py-10

              lg:w-[54%]
            "
          >

            <div
              className="
                w-full
                max-w-md
              "
            >

              {/* HEADER */}

              <div
                className="
                  mb-8
                  flex
                  items-center
                  justify-between
                "
              >

                <div className="lg:hidden">
                  <BrandLogo compact />
                </div>

                <ThemeToggle />

              </div>


              {/* =================================================
                  REGISTER CARD
              ================================================= */}

              <div
                className="
                  rounded-3xl

                  border
                  border-[var(--nova-border)]

                  bg-[var(--nova-surface)]

                  p-6

                  shadow-[var(--shadow-md)]

                  sm:p-8
                "
              >

                {/* HEADING */}

                <div className="mb-7">

                  <div
                    className="
                      mb-4
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center

                      rounded-2xl

                      bg-[var(--nova-lavender-soft)]

                      text-[var(--nova-primary)]
                    "
                  >
                    <UserPlus
                      size={20}
                    />
                  </div>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      tracking-[-0.03em]

                      text-[var(--nova-text)]
                    "
                  >
                    Create your account
                  </h2>


                  <p
                    className="
                      mt-2
                      text-sm

                      text-[var(--nova-muted)]
                    "
                  >
                    Enter your details to create
                    your customer account.
                  </p>

                </div>


                {/* =================================================
                    FORM
                ================================================= */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* =================================================
                      NAME
                  ================================================= */}

                  <div>

                    <label
                      htmlFor="name"
                      className="
                        mb-2
                        block

                        text-sm
                        font-semibold

                        text-[var(--nova-text)]
                      "
                    >
                      Full name
                    </label>


                    <div className="relative">

                      <User
                        size={17}
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2

                          text-[var(--nova-muted)]
                        "
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


                  {/* =================================================
                      EMAIL
                  ================================================= */}

                  <div>

                    <label
                      htmlFor="email"
                      className="
                        mb-2
                        block

                        text-sm
                        font-semibold

                        text-[var(--nova-text)]
                      "
                    >
                      Email
                    </label>


                    <div className="relative">

                      <Mail
                        size={17}
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2

                          text-[var(--nova-muted)]
                        "
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


                  {/* =================================================
                      PASSWORD
                  ================================================= */}

                  <div>

                    <label
                      htmlFor="password"
                      className="
                        mb-2
                        block

                        text-sm
                        font-semibold

                        text-[var(--nova-text)]
                      "
                    >
                      Password
                    </label>


                    <div className="relative">

                      <Lock
                        size={17}
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2

                          text-[var(--nova-muted)]
                        "
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
                        className="
                          absolute
                          right-3
                          top-1/2
                          flex
                          -translate-y-1/2

                          items-center
                          justify-center

                          rounded-lg
                          p-1.5

                          text-[var(--nova-muted)]

                          transition

                          hover:bg-[var(--nova-lavender-soft)]
                          hover:text-[var(--nova-primary)]
                        "
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


                  {/* =================================================
                      CONFIRM PASSWORD
                  ================================================= */}

                  <div>

                    <label
                      htmlFor="cf_password"
                      className="
                        mb-2
                        block

                        text-sm
                        font-semibold

                        text-[var(--nova-text)]
                      "
                    >
                      Confirm password
                    </label>


                    <div className="relative">

                      <Lock
                        size={17}
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2

                          text-[var(--nova-muted)]
                        "
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
                        className="
                          absolute
                          right-3
                          top-1/2
                          flex
                          -translate-y-1/2

                          items-center
                          justify-center

                          rounded-lg
                          p-1.5

                          text-[var(--nova-muted)]

                          transition

                          hover:bg-[var(--nova-lavender-soft)]
                          hover:text-[var(--nova-primary)]
                        "
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


                  {/* =================================================
                      ERROR
                  ================================================= */}

                  {notify?.error && (

                    <div
                      className="
                        rounded-xl

                        border
                        border-[rgba(239,68,68,0.20)]

                        bg-[rgba(239,68,68,0.08)]

                        px-4
                        py-3

                        text-sm
                        font-medium

                        text-[var(--nova-danger)]
                      "
                    >
                      {notify.error}
                    </div>

                  )}


                  {/* =================================================
                      SUCCESS
                  ================================================= */}

                  {notify?.success && (

                    <div
                      className="
                        rounded-xl

                        border
                        border-[rgba(34,197,94,0.20)]

                        bg-[rgba(34,197,94,0.08)]

                        px-4
                        py-3

                        text-sm
                        font-medium

                        text-[var(--nova-success)]
                      "
                    >
                      {notify.success}
                    </div>

                  )}


                  {/* =================================================
                      SUBMIT
                  ================================================= */}

                  <Button
                    type="submit"
                    loading={notify?.loading}
                    className="
                      w-full
                      min-h-12

                      rounded-xl

                      !bg-[var(--nova-primary)]

                      font-bold

                      shadow-[0_8px_20px_rgba(124,58,237,0.18)]

                      hover:!bg-[var(--nova-primary-dark)]
                      hover:-translate-y-0.5
                      hover:shadow-[0_12px_28px_rgba(124,58,237,0.24)]
                    "
                  >
                    Create Customer Account
                  </Button>

                </form>


                {/* =================================================
                    SELLER
                ================================================= */}

                <div
                  className="
                    mt-6

                    rounded-2xl

                    border
                    border-[var(--nova-border)]

                    bg-[var(--nova-surface-soft)]

                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center

                        rounded-xl

                        bg-[var(--nova-lavender-soft)]

                        text-[var(--nova-primary)]
                      "
                    >
                      <Store size={16} />
                    </div>

                    <div>

                      <p
                        className="
                          text-sm
                          font-bold

                          text-[var(--nova-text)]
                        "
                      >
                        Want to sell on NovaCart?
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5

                          text-[var(--nova-muted)]
                        "
                      >
                        Create a verified seller account
                        with a seller code provided by
                        NovaCart administration.
                      </p>

                      <Link
                        href="/seller/register"
                        className="
                          mt-3
                          inline-flex

                          text-sm
                          font-bold

                          text-[var(--nova-primary)]

                          transition

                          hover:text-[var(--nova-primary-dark)]
                          hover:underline
                        "
                      >
                        Create account as seller →
                      </Link>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    LOGIN
                ================================================= */}

                <p
                  className="
                    mt-6
                    text-center
                    text-sm

                    text-[var(--nova-muted)]
                  "
                >

                  Already have an account?{' '}

                  <Link
                    href="/signin"
                    className="
                      font-bold

                      text-[var(--nova-primary)]

                      transition

                      hover:text-[var(--nova-primary-dark)]
                      hover:underline
                    "
                  >
                    Sign in
                  </Link>

                </p>

              </div>

            </div>

          </section>

        </div>

      </main>
    </>
  )
}

export default Register