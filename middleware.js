import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

// ============================================================
// PAGES ROUTER MIDDLEWARE — SERVER-SIDE PAGE PROTECTION
//
// This is the page-level boundary. The API routes remain the
// real data boundary via middleware/auth.js — this middleware
// only prevents unauthenticated / wrong-role users from even
// rendering a protected page shell.
//
// Runtime: Node.js is required because the existing JWT
// mechanism (jsonwebtoken -> jwa -> Node 'crypto') cannot
// run on the Edge runtime. This reuses the existing JWT
// verification mechanism — no second auth library.
//
// The ONLY credential available here is the HttpOnly
// 'refreshtoken' cookie. The short-lived access token lives
// in React Context (in-memory) and is intentionally never
// exposed to middleware. The refresh token now carries the
// minimal claims { id, role, root }.
// ============================================================

export const runtime = 'nodejs'

const REFRESH_COOKIE = 'refreshtoken'

// ============================================================
// ROUTE RULES
//
// Each entry maps a route prefix to the roles allowed.
// 'root: true' is required only where the page itself
// enforces the super-admin check.
//
// FAIL-SAFE: a token WITHOUT role/root claims (issued
// before this middleware existed) decodes to undefined
// role/root. Undefined role/root is treated as a plain
// 'user' with root=false — NEVER as admin/seller/root.
// Old tokens therefore keep access to /profile and
// /order/* only, and are redirected away from every
// admin/seller page until they re-login.
// ============================================================

const ROUTE_RULES = [
    // Super-admin (admin + root) only
    {
        prefix: '/edit-user',
        roles: ['admin'],
        root: true,
    },

    // Admin only
    {
        prefix: '/admin',
        roles: ['admin'],
    },
    {
        prefix: '/categories',
        roles: ['admin'],
    },
    {
        prefix: '/users',
        roles: ['admin'],
    },

    // Seller or admin (matches AuthGuard roles={['seller','admin']})
    {
        prefix: '/create',
        roles: ['seller', 'admin'],
    },

    // Seller only
    {
        prefix: '/seller',
        roles: ['seller'],
    },

    // Any authenticated user
    {
        prefix: '/profile',
        roles: ['user', 'seller', 'admin'],
    },
    {
        prefix: '/order',
        roles: ['user', 'seller', 'admin'],
    },
]

// Public pages — never touched by middleware
const PUBLIC_PREFIXES = [
    '/',
    '/signin',
    '/register',
    '/product',
    '/products',
    '/cart',
    '/deals',
    '/seller/register',
    '/seller/signin',
]

const isPublic = (pathname) =>
    PUBLIC_PREFIXES.some(
        (prefix) =>
            pathname === prefix ||
            pathname.startsWith(`${prefix}/`)
    )

// Find the rule for a pathname, longest prefix first so
// '/edit-user' is matched before any generic rule.
const findRule = (pathname) => {
    let best = null

    for (const rule of ROUTE_RULES) {
        if (
            pathname === rule.prefix ||
            pathname.startsWith(`${rule.prefix}/`)
        ) {
            if (
                !best ||
                rule.prefix.length >
                    best.prefix.length
            ) {
                best = rule
            }
        }
    }

    return best
}

const decodeRefreshToken = (token) => {
    try {
        // jwt.verify validates the signature and expiry
        // using the existing secret.
        return jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET
        )
    } catch (error) {
        // Expired / invalid / tampered -> treat as signed out.
        return null
    }
}

export default function middleware(request) {
    const { pathname } = request.nextUrl

    // --------------------------------------------------------
    // Only page routes are protected. API routes keep their
    // own authorization in middleware/auth.js.
    // --------------------------------------------------------

    if (pathname.startsWith('/api/')) {
        return NextResponse.next()
    }

    if (isPublic(pathname)) {
        return NextResponse.next()
    }

    const rule = findRule(pathname)

    // Unknown route -> let it through (Next.js 404s it).
    if (!rule) {
        return NextResponse.next()
    }

    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    const refreshToken =
        request.cookies.get(REFRESH_COOKIE)?.value

    if (!refreshToken) {
        return redirectToSignin(request)
    }

    const decoded = decodeRefreshToken(refreshToken)

    if (!decoded?.id) {
        return redirectToSignin(request)
    }

    // --------------------------------------------------------
    // AUTHORIZATION
    //
    // Normalize claims with safe defaults.
    //
    // A missing role/root claim (tokens issued before
    // page-level protection existed) must never be read
    // as an elevated role. It is normalized to a plain
    // authenticated 'user' with root=false. This keeps
    // the existing authentication behavior — the user
    // can still reach /profile and /order/* — while
    // being locked out of every admin/seller page until
    // they re-login and receive a token with claims.
    // --------------------------------------------------------

    const role =
        typeof decoded.role === 'string'
            ? decoded.role
            : 'user'

    const root =
        decoded.root === true

    const hasValidRole =
        typeof role === 'string' &&
        rule.roles.includes(role)

    if (!hasValidRole) {
        return redirectToSignin(request)
    }

    if (rule.root && !root) {
        return redirectToSignin(request)
    }

    return NextResponse.next()
}

const redirectToSignin = (request) => {
    const signinUrl = new URL('/signin', request.url)

    // Preserve a safe, same-origin return URL. Only the
    // path is carried (never the token, never a full URL),
    // and only when it starts with '/'.
    const { pathname, search } = request.nextUrl

    if (pathname && pathname.startsWith('/')) {
        signinUrl.searchParams.set(
            'returnUrl',
            pathname + search
        )
    }

    return NextResponse.redirect(signinUrl)
}

// ============================================================
// MATCHER
//
// Run on all page routes except the public set and static
// assets. _next/static, _next/image and static files are
// excluded so middleware does not run on every asset.
// ============================================================

export const config = {
    matcher: [
        /*
         * Match all paths except:
         *  - _next/static (static files)
         *  - _next/image  (image optimization)
         *  - favicon.ico  (browser auto-request)
         *  - common static file extensions
         *
         * Public pages are additionally filtered inside the
         * middleware via PUBLIC_PREFIXES.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json|txt|xml|woff|woff2|ttf|eot)$).*)',
    ],
}
