import Head from 'next/head'
import Link from 'next/link'
import { useState, useContext } from 'react'
import { useRouter } from 'next/router'
import {
    Eye,
    EyeOff,
    Lock,
    Mail,
    ShieldCheck,
    Store,
    UserPlus,
} from 'lucide-react'

import { DataContext } from '../../store/GlobalState'
import { postData } from '@/lib/api-client'
import BrandLogo from '../../components/common/BrandLogo'
import Button from '../../components/common/Button'
import ThemeToggle from '../../components/common/ThemeToggle'

const fieldClass =
    'h-12 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 !pl-12 pr-12 text-sm text-[var(--nova-text)] outline-none placeholder:text-[var(--nova-muted)] focus:border-[var(--nova-blue)]'

const Signin = () => {
    const [userData, setUserData] = useState({
        email: '',
        password: '',
    })

    const [showPassword, setShowPassword] =
        useState(false)

    const { email, password } = userData

    const { state, dispatch } =
        useContext(DataContext)

    const { notify } = state

    const router = useRouter()

    // ==========================================
    // INPUT CHANGE
    // ==========================================

    const handleChangeInput = (e) => {
        const {
            name,
            value,
        } = e.target

        setUserData((prev) => ({
            ...prev,
            [name]: value,
        }))

        dispatch({
            type: 'NOTIFY',
            payload: {},
        })
    }

    // ==========================================
    // LOGIN
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault()

        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------

        if (!email.trim() || !password) {
            return dispatch({
                type: 'NOTIFY',
                payload: {
                    error:
                        'Please enter your email and password.',
                },
            })
        }

        // ------------------------------------------
        // LOADING
        // ------------------------------------------

        dispatch({
            type: 'NOTIFY',
            payload: {
                loading: true,
            },
        })

        try {
            // ------------------------------------------
            // LOGIN API
            // ------------------------------------------

            const res = await postData(
                'auth/login',
                {
                    email:
                        email
                            .trim()
                            .toLowerCase(),

                    password,
                }
            )

            // ------------------------------------------
            // API ERROR
            // ------------------------------------------

            if (res?.err) {
                return dispatch({
                    type: 'NOTIFY',
                    payload: {
                        error: res.err,
                    },
                })
            }

            // ------------------------------------------
            // VALIDATE RESPONSE
            // ------------------------------------------

            if (
                !res?.access_token ||
                !res?.user
            ) {
                console.error(
                    'Invalid login response:',
                    res
                )

                return dispatch({
                    type: 'NOTIFY',
                    payload: {
                        error:
                            'Login response is invalid.',
                    },
                })
            }

            // ------------------------------------------
            // UPDATE AUTH STATE
            // ------------------------------------------

            dispatch({
                type: 'AUTH',
                payload: {
                    token:
                        res.access_token,

                    user:
                        res.user,
                },
            })

            // ------------------------------------------
            // LOGIN FLAG
            // ------------------------------------------

            localStorage.setItem(
                'firstLogin',
                'true'
            )

            // ------------------------------------------
            // SUCCESS MESSAGE
            // ------------------------------------------

            dispatch({
                type: 'NOTIFY',
                payload: {
                    success:
                        res.msg ||
                        'Login successful.',
                },
            })

            // ------------------------------------------
            // REDIRECT TO ORIGINAL DESTINATION
            // ------------------------------------------

            // If the user came from a protected/checkout page,
            // return them there after successful login.
            //
            // Example:
            // /signin?returnUrl=/cart
            //
            // After login:
            // /cart

            const returnUrl = router.query.returnUrl

            if (
                typeof returnUrl === 'string' &&
                returnUrl.startsWith('/') &&
                !returnUrl.startsWith('//')
            ) {
                await router.replace(returnUrl)
            } else {
                // Normal login without a return destination
                await router.replace('/')
            }
        } catch (error) {
            console.error(
                'Login error:',
                error
            )

            dispatch({
                type: 'NOTIFY',
                payload: {
                    error:
                        error?.message ||
                        'Unable to login. Please try again.',
                },
            })
        }
    }

    return (
        <>
            <Head>
                <title>
                    Sign In | NovaCart
                </title>

                <meta
                    name="description"
                    content="Sign in to your NovaCart account."
                />
            </Head>

            <main className="min-h-screen bg-[var(--nova-bg)]">
                <div className="mx-auto flex min-h-screen max-w-[1500px]">

                    {/* =====================================
                        LEFT BRAND PANEL
                    ====================================== */}

                    <section className="relative hidden overflow-hidden bg-[var(--nova-navy)] lg:flex lg:w-[48%]">

                        <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white xl:p-16">

                            <BrandLogo
                                variant="light"
                            />

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
                                    Sign in to continue shopping,
                                    manage orders, sell products,
                                    and manage your NovaCart
                                    account.
                                </p>

                            </div>

                            <p className="text-xs text-white/40">
                                © {new Date().getFullYear()} NovaCart
                            </p>

                        </div>

                    </section>

                    {/* =====================================
                        LOGIN SECTION
                    ====================================== */}

                    <section className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[52%]">

                        <div className="w-full max-w-md">

                            {/* TOP */}

                            <div className="mb-8 flex items-center justify-between">

                                <div className="lg:hidden">
                                    <BrandLogo compact />
                                </div>

                                <ThemeToggle />

                            </div>

                            {/* HEADING */}

                            <h2 className="text-3xl font-semibold tracking-tight">
                                Welcome back
                            </h2>

                            <p className="mt-2 text-sm text-[var(--nova-muted)]">
                                Sign in to your NovaCart account.
                            </p>

                            {/* FORM */}

                            <form
                                onSubmit={handleSubmit}
                                className="mt-8 space-y-5"
                            >

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
                                            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--nova-muted)]"
                                        />

                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={email}
                                            onChange={
                                                handleChangeInput
                                            }
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
                                            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--nova-muted)]"
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
                                            onChange={
                                                handleChangeInput
                                            }
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            className={fieldClass}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
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

                                {/* SECURITY */}

                                <div className="flex items-start gap-3 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-3 py-3 text-xs leading-5 text-[var(--nova-muted)]">

                                    <ShieldCheck
                                        size={15}
                                        className="mt-0.5 shrink-0"
                                    />

                                    <span>
                                        Your account access is
                                        protected by secure
                                        authentication.
                                    </span>

                                </div>

                                {/* LOGIN BUTTON */}

                                <Button
                                    type="submit"
                                    loading={
                                        notify?.loading
                                    }
                                    className="flex w-full items-center justify-center gap-2"
                                >
                                    Sign in
                                </Button>

                            </form>

                            {/* =====================================
                                CREATE ACCOUNT
                            ====================================== */}

                            <div className="mt-8 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] p-4">

                                <div className="mb-4">

                                    <p className="text-sm font-semibold text-[var(--nova-text)]">
                                        New to NovaCart?
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[var(--nova-muted)]">
                                        Create an account to shop
                                        or start selling on
                                        NovaCart.
                                    </p>

                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                    {/* CUSTOMER */}

                                    <Link
                                        href="/register"
                                        className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--nova-text)] transition hover:border-[var(--nova-blue)] hover:text-[var(--nova-blue)]"
                                    >
                                        <UserPlus
                                            size={16}
                                        />

                                        Create Account
                                    </Link>

                                    {/* SELLER */}

                                    <Link
                                        href="/seller/register"
                                        className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--nova-blue)] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
                                    >
                                        <Store
                                            size={16}
                                        />

                                        Create Account as Seller
                                    </Link>

                                </div>

                            </div>

                            {/* FOOTER */}

                            <p className="mt-6 text-center text-xs text-[var(--nova-muted)]">
                                By continuing, you agree to NovaCart&apos;s
                                terms and policies.
                            </p>

                        </div>

                    </section>

                </div>
            </main>
        </>
    )
}

export default Signin