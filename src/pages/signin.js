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


            <main
            className="
                min-h-screen
                bg-[var(--nova-bg)]

                lg:h-screen
                lg:overflow-hidden
            "
            >

                <div
                className="
                    mx-auto
                    flex
                    min-h-screen
                    max-w-[1500px]

                    lg:h-screen
                "
                >


                    {/* =================================================
                        LEFT PANEL
                    ================================================= */}

                    <section
                        className="
                            relative
                            hidden
                            overflow-hidden

                            bg-[var(--nova-surface)]

                            lg:flex
                            lg:w-[48%]

                            border-r
                            border-[var(--nova-border)]
                        "
                    >

                        {/* Violet background glow */}

                        <div
                            className="
                                pointer-events-none
                                absolute
                                -left-32
                                -top-32

                                h-[420px]
                                w-[420px]

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

                                h-[420px]
                                w-[420px]

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
                            "
                        >


                            {/* =================================================
                                LOGO
                            ================================================= */}

                            <div>

                                <BrandLogo
                                    size="lg"
                                />

                            </div>


                            {/* =================================================
                                HERO CONTENT
                            ================================================= */}

                            <div>

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
                                    <UserPlus
                                        size={13}
                                    />

                                    NovaCart
                                </div>


                                <h1
                                    className="
                                        max-w-xl

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
                                    Sign in to manage your account,
                                    track orders and enjoy a faster
                                    shopping experience.
                                </p>


                                {/* Feature cards */}

                                <div
                                    className="
                                        mt-8
                                        grid
                                        max-w-md
                                        grid-cols-2
                                        gap-3
                                    "
                                >

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
                                            Protected account access
                                        </p>

                                    </div>


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
                                            <Store
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
                                            Everything
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                text-xs

                                                text-[var(--nova-muted)]
                                            "
                                        >
                                            One place to shop
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                FOOTER
                            ================================================= */}

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3

                                    text-sm
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
                                        Secure account access
                                    </p>

                                    <p
                                        className="
                                            text-xs
                                            text-[var(--nova-muted)]
                                        "
                                    >
                                        Your account stays protected.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        RIGHT PANEL
                    ================================================= */}

                    <section
                    className="
                        relative
                        flex
                        flex-1
                        items-center
                        justify-center

                        px-5
                        py-6

                        sm:px-8
                        lg:px-12

                        lg:h-full
                        lg:overflow-hidden
                    "
                    >

                        <div
                            className="
                                w-full
                                max-w-md
                            "
                        >


                            {/* =================================================
                                HEADER
                            ================================================= */}

                            <div
                            className="
                                mb-8
                                flex
                                items-center
                                justify-between
                            "
                            >
                            <div className="lg:hidden">
                                <BrandLogo size="md" />
                            </div>

                            </div>


                            {/* =================================================
                                LOGIN CARD
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
                            <div className="flex justify-end">
                            <ThemeToggle />
                            </div>

                                {/* =================================================
                                    HEADING
                                ================================================= */}

                                <div className="mb-8">

                                    <div
                                        className="
                                            mb-4
                                            inline-flex
                                            h-11
                                            w-11
                                            items-center
                                            justify-center

                                            rounded-2xl

                                            bg-[var(--nova-lavender-soft)]

                                            text-[var(--nova-primary)]
                                        "
                                    >
                                        <Lock
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
                                        Welcome back
                                    </h2>


                                    <p
                                        className="
                                            mt-2
                                            text-sm

                                            text-[var(--nova-muted)]
                                        "
                                    >
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
                                                    absolute
                                                    left-4
                                                    top-1/2
                                                    -translate-y-1/2

                                                    text-[var(--nova-muted)]
                                                "
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
                                                    absolute
                                                    left-4
                                                    top-1/2
                                                    -translate-y-1/2

                                                    text-[var(--nova-muted)]
                                                "
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
                                        BUTTON
                                    ================================================= */}

                                    <Button
                                        type="submit"
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
                                        disabled={
                                            notify?.loading
                                        }
                                    >

                                        {notify?.loading
                                            ? 'Signing in...'
                                            : 'Sign in'}

                                    </Button>


                                </form>


                                {/* =================================================
                                    REGISTER
                                ================================================= */}

                                <div
                                    className="
                                        mt-7
                                        border-t
                                        border-[var(--nova-border)]

                                        pt-6
                                    "
                                >

                                    <div
                                        className="
                                            text-center
                                            text-sm

                                            text-[var(--nova-muted)]
                                        "
                                    >

                                        Don't have an account?{' '}

                                        <Link
                                            href="/register"
                                            className="
                                                font-bold

                                                text-[var(--nova-primary)]

                                                transition

                                                hover:text-[var(--nova-primary-dark)]
                                                hover:underline
                                            "
                                        >
                                            Create account
                                        </Link>

                                    </div>


                                    <Link
                                        href="/seller/signin"
                                        className="
                                            mt-5

                                            flex
                                            items-center
                                            justify-center
                                            gap-2

                                            rounded-xl

                                            border
                                            border-[var(--nova-border)]

                                            px-4
                                            py-3

                                            text-xs
                                            font-semibold

                                            text-[var(--nova-muted)]

                                            transition-all

                                            hover:border-[var(--nova-violet-light)]
                                            hover:bg-[var(--nova-lavender-soft)]
                                            hover:text-[var(--nova-primary)]
                                        "
                                    >

                                        <Store
                                            size={14}
                                        />

                                        Seller sign in

                                    </Link>

                                </div>

                            </div>


                            {/* =================================================
                                MOBILE SECURITY
                            ================================================= */}

                            <div
                                className="
                                    mt-5
                                    flex
                                    items-center
                                    justify-center
                                    gap-2

                                    text-xs

                                    text-[var(--nova-muted)]

                                    lg:hidden
                                "
                            >

                                <ShieldCheck
                                    size={14}
                                    className="text-[var(--nova-primary)]"
                                />

                                Secure NovaCart account access

                            </div>

                        </div>

                    </section>

                </div>

            </main>
        </>
    )
}


export default Signin