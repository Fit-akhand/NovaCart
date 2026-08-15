import Head from 'next/head'
import Link from 'next/link'
import { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { DataContext } from '../../store/GlobalState'
import { postData } from '@/lib/api-client'
import BrandLogo from '../../components/common/BrandLogo'
import Button from '../../components/common/Button'
import ThemeToggle from '../../components/common/ThemeToggle'

const fieldClass =
  'h-12 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 !pl-12 text-sm text-[var(--nova-text)] outline-none placeholder:text-[var(--nova-muted)] focus:border-[var(--nova-blue)]'
const Signin = () => {
  const [userData, setUserData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const { email, password } = userData
  const { state, dispatch } = useContext(DataContext)
  const { auth, notify } = state
  const router = useRouter()

  const handleChangeInput = (e) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
    dispatch({ type: 'NOTIFY', payload: {} })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      return dispatch({
        type: 'NOTIFY',
        payload: { error: 'Please enter your email and password.' },
      })
    }

    dispatch({ type: 'NOTIFY', payload: { loading: true } })
    const res = await postData('auth/login', userData)
    if (res.err) return dispatch({ type: 'NOTIFY', payload: { error: res.err } })

    dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
    dispatch({
      type: 'AUTH',
      payload: { token: res.access_token, user: res.user },
    })
    localStorage.setItem('firstLogin', true)
  }

  useEffect(() => {
    if (Object.keys(auth).length !== 0) router.push('/')
  }, [auth, router])

  return (
    <>
      <Head>
        <title>Sign In | NovaCart</title>
      </Head>

      <main className="min-h-screen bg-[var(--nova-bg)]">
        <div className="mx-auto flex min-h-screen max-w-[1500px]">
          <section className="relative hidden overflow-hidden bg-[var(--nova-navy)] lg:flex lg:w-[48%]">
            <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white xl:p-16">
              <BrandLogo variant="light" />
              <div className="max-w-lg">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                  NovaCart
                </p>
                <h1 className="text-5xl font-semibold leading-tight tracking-tight xl:text-6xl">
                  Shop smarter.
                  <br />
                  Live better.
                </h1>
                <p className="mt-6 max-w-md text-sm leading-6 text-white/70">
                  Sign in to continue shopping, manage orders, and check out securely.
                </p>
              </div>
              <p className="text-xs text-white/40">© {new Date().getFullYear()} NovaCart</p>
            </div>
          </section>

          <section className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[52%]">
            <div className="w-full max-w-md">
              <div className="mb-8 flex items-center justify-between">
                <div className="lg:hidden">
                  <BrandLogo compact />
                </div>
                <ThemeToggle />
              </div>

              <h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2>
              <p className="mt-2 text-sm text-[var(--nova-muted)]">
                Sign in to your NovaCart account.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email
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
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium">
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
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--nova-muted)]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <p className="flex items-center gap-2 text-xs text-[var(--nova-muted)]">
                  <ShieldCheck size={13} />
                  Your connection is secure.
                </p>

                <Button type="submit" loading={notify?.loading} className="w-full">
                  Sign in
                </Button>
              </form>

              <p className="mt-7 text-center text-sm text-[var(--nova-muted)]">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-semibold text-[var(--nova-text)] underline">
                  Create account
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

export default Signin