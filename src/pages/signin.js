import Head from 'next/head'
import Link from 'next/link'
import {
    useState,
    useContext
} from 'react'
import { useRouter } from 'next/router'

import {
    Eye,
    EyeOff,
    Lock,
    Mail,
    ShieldCheck,
    Store,
    UserPlus
} from 'lucide-react'

import { DataContext } from '../../store/GlobalState'
import { postData } from '@/lib/api-client'

import BrandLogo from '../../components/common/BrandLogo'
import Button from '../../components/common/Button'
import ThemeToggle from '../../components/common/ThemeToggle'


const fieldClass =
    'h-12 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 !pl-12 pr-12 text-sm text-[var(--nova-text)] outline-none placeholder:text-[var(--nova-muted)] focus:border-[var(--nova-blue)]'


const Signin = () => {

    const [
        userData,
        setUserData
    ] = useState({
        email: '',
        password: ''
    })


    const [
        showPassword,
        setShowPassword
    ] = useState(false)


    const {
        email,
        password
    } = userData


    const {
        state,
        dispatch
    } = useContext(
        DataContext
    )


    const {
        notify
    } = state


    const router =
        useRouter()


    // =========================================================
    // INPUT
    // =========================================================

    const handleChangeInput =
        (e) => {

            const {
                name,
                value
            } = e.target

            setUserData(
                prev => ({
                    ...prev,
                    [name]: value
                })
            )

            dispatch({
                type: 'NOTIFY',
                payload: {}
            })
        }


    // =========================================================
    // LOGIN
    // =========================================================

    const handleSubmit =
        async (e) => {

            e.preventDefault()


            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

            if (
                !email.trim() ||
                !password
            ) {

                return dispatch({
                    type: 'NOTIFY',
                    payload: {
                        error:
                            'Please enter your email and password.'
                    }
                })
            }


            // -------------------------------------------------
            // LOADING
            // -------------------------------------------------

            dispatch({
                type: 'NOTIFY',
                payload: {
                    loading: true
                }
            })


            try {

                // -------------------------------------------------
                // LOGIN API
                // -------------------------------------------------

                const res =
                    await postData(
                        'auth/login',
                        {
                            email:
                                email
                                    .trim()
                                    .toLowerCase(),

                            password
                        }
                    )


                // -------------------------------------------------
                // API ERROR
                // -------------------------------------------------

                if (res?.err) {

                    return dispatch({
                        type: 'NOTIFY',
                        payload: {
                            error:
                                res.err
                        }
                    })
                }


                // -------------------------------------------------
                // VALIDATE RESPONSE
                // -------------------------------------------------

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
                                'Login response is invalid.'
                        }
                    })
                }


                // -------------------------------------------------
                // AUTH STATE
                // -------------------------------------------------

                dispatch({
                    type: 'AUTH',
                    payload: {
                        token:
                            res.access_token,

                        user:
                            res.user
                    }
                })


                // -------------------------------------------------
                // LOGIN FLAG
                // -------------------------------------------------

                localStorage.setItem(
                    'firstLogin',
                    'true'
                )


                // -------------------------------------------------
                // SUCCESS
                // -------------------------------------------------

                dispatch({
                    type: 'NOTIFY',
                    payload: {
                        success:
                            res.msg ||
                            'Login successful.'
                    }
                })


                // -------------------------------------------------
                // IMPORTANT
                //
                // Return the user to the page they originally
                // wanted instead of always sending them home.
                // -------------------------------------------------

                const returnUrl =
                    router.query.returnUrl


                if (
                    typeof returnUrl ===
                        'string' &&
                    returnUrl.startsWith('/')
                ) {

                    await router.replace(
                        returnUrl
                    )

                } else {

                    await router.replace(
                        '/'
                    )
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
                            'Unable to login. Please try again.'
                    }
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


                    {/* =================================================
                        LEFT PANEL
                    ================================================= */}

                    <section className="relative hidden overflow-hidden bg-[var(--nova-navy)] lg:flex lg:w-[48%]">

                        <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">

                            <BrandLogo
                                size="lg"
                            />


                            <div>

                                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
                                    NovaCart
                                </p>

                                <h1 className="max-w-lg text-5xl font-semibold leading-tight">
                                    Shop smarter.
                                    <br />
                                    Live better.
                                </h1>

                                <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
                                    Sign in to manage your account,
                                    track orders and enjoy a faster
                                    shopping experience.
                                </p>

                            </div>


                            <div className="flex items-center gap-3 text-sm text-slate-400">

                                <ShieldCheck
                                    size={18}
                                />

                                Secure account access

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        RIGHT PANEL
                    ================================================= */}

                    <section className="flex flex-1 items-center justify-center px-5 py-10">

                        <div className="w-full max-w-md">


                            {/* HEADER */}

                            <div className="mb-8 flex items-center justify-between">

                                <BrandLogo
                                    size="md"
                                />

                                <ThemeToggle />

                            </div>


                            <div className="mb-8">

                                <h2 className="text-3xl font-semibold">
                                    Welcome back
                                </h2>

                                <p className="mt-2 text-sm text-[var(--nova-muted)]">
                                    Sign in to continue shopping.
                                </p>

                            </div>


                            {/* =================================================
                                FORM
                            ================================================= */}

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                                className="space-y-5"
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
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
                                        />

                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={email}
                                            onChange={
                                                handleChangeInput
                                            }
                                            placeholder="Enter your email"
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
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
                                        />

                                        <input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
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
                                                    prev =>
                                                        !prev
                                                )
                                            }
                                            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center p-1 text-[var(--nova-muted)]"
                                            aria-label={
                                                showPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }
                                        >

                                            {showPassword ? (
                                                <EyeOff
                                                    size={17}
                                                />
                                            ) : (
                                                <Eye
                                                    size={17}
                                                />
                                            )}

                                        </button>

                                    </div>

                                </div>


                                {/* ERROR */}

                                {notify?.error && (

                                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                        {notify.error}
                                    </div>

                                )}


                                {/* BUTTON */}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={
                                        notify?.loading
                                    }
                                >

                                    {notify?.loading
                                        ? 'Signing in...'
                                        : 'Sign in'}

                                </Button>


                            </form>


                            {/* REGISTER */}

                            <div className="mt-8 space-y-4">

                                <div className="text-center text-sm text-[var(--nova-muted)]">

                                    Don't have an account?{' '}

                                    <Link
                                        href="/register"
                                        className="font-semibold text-[var(--nova-blue)] hover:underline"
                                    >
                                        Create account
                                    </Link>

                                </div>


                                <Link
                                    href="/seller/signin"
                                    className="flex items-center justify-center gap-2 text-xs text-[var(--nova-muted)] hover:text-[var(--nova-text)]"
                                >

                                    <Store
                                        size={14}
                                    />

                                    Seller sign in

                                </Link>

                            </div>

                        </div>

                    </section>

                </div>

            </main>
        </>
    )
}


export default Signin