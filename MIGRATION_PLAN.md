# NovaCart Migration Plan

> **Status:** Audit complete — no migration work has started.  
> **Goal:** Modernize this same repository in-place to a production-ready Next.js App Router architecture without changing the database schema or authentication mechanism during early phases.

---

## 1. Current Technology Stack

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| Framework | Next.js (Pages Router) | `10.0.1` |
| UI Library | React | `17.0.1` |
| Language | JavaScript (JSX) | No TypeScript |
| Styling (declared) | Custom CSS + Bootstrap 4 CDN | Loaded in `_document.js` |
| Styling (partial, undeclared) | Tailwind CSS utility classes | Used in many `pages/` files but **not installed or configured** |
| Icons (partial, undeclared) | Lucide React | Imported in many `pages/` files but **not in `package.json`** |
| Icons (legacy) | Font Awesome CDN | Used in `NavBar`, `CartItem`, `Modal` |
| State Management | React Context + `useReducer` | `store/GlobalState.js`, `Actions.js`, `Reducers.js` |
| Database | MongoDB | Via Mongoose `5.10.14` |
| Authentication | JWT (access + refresh tokens) | `jsonwebtoken` `8.5.1`, `bcrypt` `5.0.0` |
| Session Storage | `js-cookie` + `localStorage` | Refresh token cookie, cart + `firstLogin` in localStorage |
| Payments | PayPal JS SDK | Loaded globally in `_document.js` |
| Image Upload | Cloudinary | Client-side direct upload via `utils/imageUpload.js` |
| API Layer | Next.js API Routes (`pages/api/`) | REST-style handlers |
| Data Fetching | `getServerSideProps` (2 pages) + client `fetch` | Home + product detail use SSR self-fetch pattern |
| Build Workaround | `NODE_OPTIONS=--openssl-legacy-provider` | Required in all npm scripts |
| Config | `next.config.js` | Secrets and env vars embedded inline (placeholder values) |

### Environment Variables (Current)

Defined in `next.config.js` under `env` (not `.env` files):

| Variable | Purpose |
|----------|---------|
| `BASE_URL` | Base URL for client/server fetch calls to own API |
| `MONGODB_URL` | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | JWT access token signing secret |
| `REFRESH_TOKEN_SECRET` | JWT refresh token signing secret |
| `PAYPAL_CLIENT_ID` | PayPal SDK client ID |
| `CLOUD_UPDATE_PRESET` | Cloudinary unsigned upload preset |
| `CLOUD_NAME` | Cloudinary cloud name |
| `CLOUD_API` | Cloudinary upload API URL |

`.gitignore` excludes `.env*.local` files but none exist in the repo today.

---

## 2. Current Folder Structure

```
NC/
├── components/
│   ├── product/
│   │   └── ProductItem.js          # Bootstrap card — product grid item
│   ├── CartItem.js                 # Bootstrap table row
│   ├── Filter.js                   # Bootstrap form controls
│   ├── Layout.js                   # Wraps NavBar, Notify, Modal
│   ├── Loading.js                  # Full-screen SVG loader
│   ├── Modal.js                    # Bootstrap 4 delete confirmation modal
│   ├── NavBar.js                   # Bootstrap navbar (brand: "DEVAT")
│   ├── Notify.js                   # Toast/loading orchestrator
│   ├── OrderDetail.js              # Order view + PayPal + admin delivery
│   ├── Toast.js                    # Bootstrap toast
│   └── paypalBtn.js                # PayPal button integration
├── middleware/
│   └── auth.js                     # JWT verification helper (not Next.js middleware)
├── models/
│   ├── categoriesModel.js
│   ├── orderModel.js
│   ├── productModel.js
│   └── userModel.js
├── pages/
│   ├── _app.js                     # DataProvider + Layout wrapper
│   ├── _document.js                # Bootstrap, jQuery, FontAwesome, PayPal CDN
│   ├── index.js                    # Home — product listing (Tailwind UI, GSSP)
│   ├── signin.js                   # Login (Tailwind UI)
│   ├── register.js                 # Registration (Tailwind UI)
│   ├── cart.js                     # Cart + checkout (Tailwind UI)
│   ├── profile.js                  # Profile + order history (Tailwind UI)
│   ├── categories.js               # Admin category CRUD (Tailwind UI)
│   ├── users.js                    # Admin user list (Tailwind UI)
│   ├── create/[[...id]].js         # Admin product create/edit (Tailwind UI)
│   ├── edit_user/[id].js           # Root admin role editor (Tailwind UI)
│   ├── product/[id].js             # Product detail (Tailwind UI, GSSP)
│   ├── order/[id].js               # Order detail (Tailwind UI)
│   └── api/
│       ├── auth/
│       │   ├── login.js
│       │   ├── register.js
│       │   └── accessToken.js
│       ├── categories/
│       │   ├── index.js            # GET, POST
│       │   └── [id].js             # PUT, DELETE
│       ├── order/
│       │   ├── index.js            # GET, POST
│       │   ├── payment/[id].js     # PATCH (PayPal confirm)
│       │   └── delivered/[id].js   # PATCH (admin mark delivered)
│       ├── product/
│       │   ├── index.js            # GET, POST
│       │   └── [id].js             # GET, PUT, DELETE
│       └── user/
│           ├── index.js            # GET (admin), PATCH (profile update)
│           ├── [id].js             # PATCH (role), DELETE
│           └── resetPassword.js    # PATCH
├── public/
│   └── vercel.svg
├── store/
│   ├── Actions.js                  # Cart, CRUD action creators
│   ├── GlobalState.js              # DataProvider + side effects
│   └── Reducers.js                 # Reducer switch
├── styles/
│   ├── globals.css                 # Base styles + CSS imports
│   ├── loading.css
│   ├── product.css
│   ├── products_manager.css
│   └── profile.css
├── utils/
│   ├── connectDB.js                # Mongoose connection
│   ├── fetchData.js                # getData, postData, putData, patchData, deleteData
│   ├── filterSearch.js             # Router query helper
│   ├── generateToken.js            # JWT creation
│   ├── imageUpload.js              # Cloudinary client upload
│   └── valid.js                    # Manual registration validation
├── next.config.js
├── package.json
└── .gitignore
```

**Not present:** `app/`, `middleware.js`, Tailwind/PostCSS config, test suite, `.env.example`, TypeScript config.

---

## 3. Current Architecture

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ GlobalState  │  │ localStorage │  │ js-cookie (refresh)  │ │
│  │ Context      │  │ (cart, login)│  │                      │ │
│  └──────┬───────┘  └──────────────┘  └──────────────────────┘ │
│         │                                                       │
│  ┌──────▼───────────────────────────────────────────────────┐ │
│  │ Pages (mostly client-rendered, some getServerSideProps)  │ │
│  │ + Legacy Bootstrap components + Partial Tailwind pages   │ │
│  └──────┬───────────────────────────────────────────────────┘ │
└─────────┼───────────────────────────────────────────────────────┘
          │ fetch (utils/fetchData.js → BASE_URL/api/*)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js Pages Router (v10)                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ pages/api/*  —  API Route Handlers                         │ │
│  │   connectDB() → middleware/auth.js → Mongoose models       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────┼───────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────┐     ┌──────────────────┐
│     MongoDB      │     │    Cloudinary    │
│  users           │     │  (image uploads) │
│  products        │     └──────────────────┘
│  orders          │
│  categories      │     ┌──────────────────┐
└──────────────────┘     │     PayPal       │
                         │  (client SDK)    │
                         └──────────────────┘
```

### Request / Data Flow

1. **App bootstrap:** `_app.js` wraps all pages in `DataProvider` → `Layout` (NavBar, notifications, modal).
2. **Auth flow:**
   - Login → `POST /api/auth/login` → returns `access_token` + `refresh_token`.
   - Access token stored in React Context (`state.auth.token`).
   - Refresh token stored in cookie via `js-cookie` (path: `api/auth/accessToken`).
   - On reload, if `localStorage.firstLogin` exists → `GET /api/auth/accessToken` silently refreshes session.
   - Protected API routes read raw `Authorization` header (no `Bearer` prefix) via `middleware/auth.js`.
3. **Cart flow:**
   - Cart items stored in Context + synced to `localStorage` key `__next__cart01__devat`.
   - On cart page load, re-validates stock against live product data.
   - Checkout → `POST /api/order` → decrements product stock → redirects to order page.
4. **Product listing:**
   - Home page uses `getServerSideProps` → calls own API via `getData()` (HTTP round-trip to self).
   - Filtering/sorting/pagination via URL query params (`category`, `sort`, `search`, `page`).
5. **Admin flow:**
   - Role check: `auth.user.role === 'admin'` (client-side UI gating only).
   - Root admin (`auth.user.root === true`) can edit/delete other users.
6. **Image upload:**
   - Client reads file → `FormData` → direct POST to Cloudinary API (unsigned preset).
   - Returns `{ public_id, url }` stored in product/user documents.

### Database Schema (Mongoose — preserve as-is)

| Collection | Key Fields |
|------------|-------------|
| `user` | name, email, password (bcrypt), role (`user`/`admin`), root (bool), avatar, timestamps |
| `product` | title, price, description, content, images[], category (string ID), inStock, sold, checked, timestamps |
| `order` | user (ObjectId ref), address, mobile, cart[], total, paymentId, method, paid, delivered, dateOfPayment, timestamps |
| `categories` | name, timestamps |

### Pages & Routes

| Route | Access | Rendering |
|-------|--------|-----------|
| `/` | Public | SSR (`getServerSideProps`) |
| `/signin`, `/register` | Public (redirect if authed) | CSR |
| `/cart` | Public (checkout requires auth) | CSR |
| `/product/[id]` | Public | SSR (`getServerSideProps`) |
| `/profile` | Authenticated | CSR |
| `/order/[id]` | Authenticated | CSR |
| `/users` | Admin | CSR |
| `/edit_user/[id]` | Root admin | CSR |
| `/categories` | Admin | CSR |
| `/create`, `/create/[id]` | Admin | CSR |

---

## 4. Problems with the Current Architecture

### Critical

1. **Framework is 5+ major versions behind** — Next.js 10 / React 17 lack App Router, Server Components, modern caching, and security patches.
2. **Broken partial modernization** — 11 page files import `lucide-react` and use Tailwind classes, but neither is installed or configured. The app cannot build cleanly as-is.
3. **Dual UI systems** — Pages use Tailwind; shared components (`NavBar`, `ProductItem`, `CartItem`, `Filter`, `Modal`) still use Bootstrap 4 + jQuery. Visual and architectural inconsistency.
4. **Secrets in source control** — JWT secrets, MongoDB URL, Cloudinary, and PayPal credentials are placeholder values in `next.config.js` instead of proper `.env` files.
5. **OpenSSL legacy provider required** — Indicates incompatible/outdated dependency tree; blocks modern Node.js LTS usage.
6. **No server-side route protection** — Admin pages rely on client-side `if (!auth.user) return null`. URLs are accessible without middleware guards.

### Architectural

7. **Self-fetch anti-pattern** — `getServerSideProps` HTTP-calls the app's own API instead of querying the database directly.
8. **Global client state for server data** — Categories, users, orders fetched in `useEffect` and held in Context. Causes stale data, unnecessary client bundles, and waterfall requests.
9. **No validation layer** — Manual `valid.js` regex checks; no schema-based server validation (Zod).
10. **Deprecated Mongoose API** — Uses `useCreateIndex`, `useFindAndModify`, callback-style `connect()`.
11. **Outdated JWT library** — `jsonwebtoken@8.5.1` has known vulnerabilities; no token rotation strategy.
12. **Auth header convention** — Raw token in `Authorization` header without `Bearer` prefix; non-standard.
13. **Category reference is a plain string** — Not a Mongoose `ObjectId` ref; no referential integrity at DB level.

### Functional / UX

14. **Brand inconsistency** — NavBar shows "DEVAT"; pages show "NovaCart".
15. **Dead link** — Sign-in page links to `/forgot-password` which does not exist.
16. **Product count bug** — `GET /api/product` returns `result: products.length` (current page count) instead of total matching documents; "Load more" logic is unreliable.
17. **Order page depends on in-memory orders** — `/order/[id]` filters from Context `orders` array; direct navigation may show "Loading..." indefinitely if orders haven't been fetched.
18. **Bootstrap modal dependency** — Delete confirmations require jQuery Bootstrap modal (`data-toggle`, `data-target`).

### Operational

19. **No tests** — Zero unit, integration, or E2E coverage.
20. **No CI/CD configuration** visible in repo.
21. **No `.env.example`** — Onboarding requires reading `next.config.js` to discover required variables.
22. **Console.log in token generator** — `generateToken.js` logs `ACCESS_TOKEN_SECRET`.

---

## 5. Recommended Modern Technology Stack

| Layer | Target | Rationale |
|-------|--------|-----------|
| Framework | **Next.js 16** (App Router) | Server Components, Route Handlers, middleware, modern caching |
| UI Library | **React 19** | Pairs with Next.js 16; improved concurrent features |
| Language | **JavaScript / JSX** | Per project requirement — no TypeScript |
| Styling | **Tailwind CSS v4** (or latest stable v3) | Utility-first; already started in pages |
| Component Library | **shadcn/ui** | Accessible, composable primitives built on Radix |
| Icons | **Lucide React** | Already used in pages; consistent icon set |
| Animation | **Framer Motion** | Page transitions, cart animations, modals |
| Database | **MongoDB** (unchanged) | Keep existing data and connection |
| ODM | **Mongoose 8.x** | Modern connection API, maintained MongoDB driver |
| Validation | **Zod** | Shared client/server schemas |
| Forms | **React Hook Form** | Performant forms with Zod resolver |
| Notifications | **Sonner** | Replace custom Toast/Notify/Loading pattern |
| Auth | **Existing JWT mechanism** (preserve) | Same access/refresh token flow initially; migrate to Route Handlers |
| Payments | **PayPal JS SDK** (preserve) | Keep existing integration; load via Script component |
| Image Upload | **Cloudinary** (preserve) | Same unsigned upload flow initially |
| API | **Next.js Route Handlers** (`app/api/`) | Replace `pages/api/` incrementally |
| Rendering | **Server Components by default** | Client Components only where interactivity required |
| Env Management | **`.env.local` + `.env.example`** | Remove secrets from `next.config.js` |

---

## 6. Recommended Final Folder Structure

```
NC/
├── app/
│   ├── layout.js                         # Root layout — fonts, providers, Sonner
│   ├── page.js                           # Home (Server Component + client filter island)
│   ├── globals.css                       # Tailwind directives + CSS variables (shadcn)
│   ├── (auth)/
│   │   ├── signin/page.js
│   │   └── register/page.js
│   ├── (shop)/
│   │   ├── cart/page.js
│   │   ├── product/[id]/page.js
│   │   └── order/[id]/page.js
│   ├── (account)/
│   │   └── profile/page.js
│   ├── (admin)/
│   │   ├── users/page.js
│   │   ├── edit-user/[id]/page.js
│   │   ├── categories/page.js
│   │   └── create/[[...id]]/page.js
│   └── api/                              # Route Handlers (mirror existing API surface)
│       ├── auth/
│       │   ├── login/route.js
│       │   ├── register/route.js
│       │   └── access-token/route.js
│       ├── product/
│       │   ├── route.js
│       │   └── [id]/route.js
│       ├── order/
│       │   ├── route.js
│       │   ├── payment/[id]/route.js
│       │   └── delivered/[id]/route.js
│       ├── categories/
│       │   ├── route.js
│       │   └── [id]/route.js
│       └── user/
│           ├── route.js
│           ├── [id]/route.js
│           └── reset-password/route.js
├── components/
│   ├── ui/                               # shadcn/ui primitives (button, input, dialog…)
│   ├── layout/
│   │   ├── navbar.jsx
│   │   ├── footer.jsx
│   │   └── page-header.jsx
│   ├── product/
│   │   ├── product-card.jsx
│   │   ├── product-grid.jsx
│   │   ├── product-filter.jsx
│   │   └── product-form.jsx
│   ├── cart/
│   │   ├── cart-item.jsx
│   │   └── cart-summary.jsx
│   ├── order/
│   │   ├── order-detail.jsx
│   │   └── paypal-button.jsx
│   ├── admin/
│   │   ├── user-table.jsx
│   │   ├── category-list.jsx
│   │   └── confirm-dialog.jsx
│   └── shared/
│       ├── loading-spinner.jsx
│       └── empty-state.jsx
├── lib/
│   ├── db/
│   │   └── connect.js                    # Cached Mongoose connection (server-only)
│   ├── auth/
│   │   ├── tokens.js                     # createAccessToken, createRefreshToken
│   │   ├── verify.js                     # JWT verification helper
│   │   └── session.js                    # getSession from cookies (server)
│   ├── validations/
│   │   ├── auth.schema.js
│   │   ├── product.schema.js
│   │   ├── order.schema.js
│   │   ├── category.schema.js
│   │   └── user.schema.js
│   ├── actions/                          # Server Actions (optional, phase 2+)
│   │   ├── cart.actions.js
│   │   └── order.actions.js
│   └── utils/
│       ├── cn.js                         # clsx + tailwind-merge
│       ├── filter-search.js
│       └── image-upload.js
├── hooks/
│   ├── use-cart.js
│   └── use-auth.js
├── providers/
│   ├── auth-provider.jsx                 # Slim client auth context
│   └── cart-provider.jsx                 # Cart state (replaces GlobalState cart slice)
├── models/                               # Mongoose models (unchanged schemas)
│   ├── user.model.js
│   ├── product.model.js
│   ├── order.model.js
│   └── category.model.js
├── middleware.js                         # Route protection (admin, auth routes)
├── public/
│   └── ...                               # Static assets
├── pages/                                # KEEP during migration — remove in final phase
│   └── ...                               # Legacy Pages Router (temporary coexistence)
├── styles/                               # Legacy CSS — remove after component migration
├── .env.example
├── .env.local                            # Git-ignored — real secrets
├── components.json                       # shadcn/ui config
├── next.config.js                        # Minimal — no inline secrets
├── postcss.config.js
├── tailwind.config.js
├── jsconfig.json                         # Path aliases (@/components, @/lib)
├── package.json
└── MIGRATION_PLAN.md
```

### Path Aliases (jsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 7. Dependencies to Remove

| Package | Reason |
|---------|--------|
| *(none immediately)* | Keep all current deps until App Router routes are verified |

### Remove After Migration Complete (Final Cleanup Phase)

| Dependency / Asset | Reason |
|--------------------|--------|
| Bootstrap 4 CDN (in `_document.js`) | Replaced by Tailwind + shadcn/ui |
| jQuery CDN | Only used by Bootstrap modals |
| Font Awesome CDN | Replaced by Lucide React |
| `styles/product.css`, `profile.css`, `products_manager.css`, `loading.css` | Replaced by Tailwind utilities |
| `pages/` directory entirely | Replaced by `app/` |
| `pages/api/` directory | Replaced by `app/api/` Route Handlers |
| `store/` (GlobalState pattern) | Replaced by server data + focused client providers |
| `components/Toast.js`, `Notify.js`, `Loading.js`, `Modal.js` | Replaced by Sonner + shadcn Dialog |
| `utils/valid.js` | Replaced by Zod schemas |
| `NODE_OPTIONS=--openssl-legacy-provider` script flag | No longer needed with modern deps |
| Inline `env` block in `next.config.js` | Move to `.env.local` |

---

## 8. Dependencies to Add

### Core

```json
{
  "next": "^16.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "mongoose": "^8.0.0"
}
```

### Styling & UI

```json
{
  "tailwindcss": "^4.0.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.5.0",
  "lucide-react": "^0.460.0",
  "framer-motion": "^11.0.0"
}
```

### Forms & Validation

```json
{
  "zod": "^3.23.0",
  "react-hook-form": "^7.53.0",
  "@hookform/resolvers": "^3.9.0"
}
```

### Notifications

```json
{
  "sonner": "^1.7.0"
}
```

### shadcn/ui Peer Dependencies (installed via CLI)

```
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-label
@radix-ui/react-select
@radix-ui/react-slot
@radix-ui/react-checkbox
@radix-ui/react-avatar
@radix-ui/react-separator
```

### Keep (Updated Versions)

```json
{
  "bcrypt": "^5.1.0",
  "jsonwebtoken": "^9.0.0",
  "js-cookie": "^3.0.0"
}
```

---

## 9. Existing Functionality That Must Be Preserved

### Authentication & Users

- [ ] Email/password registration with validation (name, email, password, confirm password)
- [ ] Login returning access token (15 min) + refresh token (7 days)
- [ ] Silent token refresh via cookie on page reload (`firstLogin` + `/api/auth/accessToken`)
- [ ] Logout clears cookie + localStorage flag
- [ ] Profile update (name, avatar via Cloudinary)
- [ ] Password reset for logged-in user (`PATCH /api/user/resetPassword`)
- [ ] Role system: `user`, `admin`, `root` (boolean)
- [ ] Root admin can change roles and delete users
- [ ] Admin can list all users; regular users cannot

### Products

- [ ] Public product listing with filter (category), search (title regex), sort, pagination
- [ ] Product detail page with image gallery
- [ ] Admin create/edit product (title, price, stock, description, content, category, up to 5 images)
- [ ] Admin bulk select + delete products from home page
- [ ] Admin edit link from product card
- [ ] Stock tracking (`inStock`, `sold`)

### Categories

- [ ] Public read (used in filters)
- [ ] Admin CRUD (create, rename, delete)
- [ ] Delete blocked if products reference category

### Cart & Orders

- [ ] Add to cart (single quantity per product, stock check)
- [ ] Cart persisted in localStorage
- [ ] Quantity increase/decrease with stock limits
- [ ] Remove cart items (with confirmation)
- [ ] Checkout requires auth + address + mobile
- [ ] Stock re-validation at checkout
- [ ] Order creation decrements product stock
- [ ] Order history on profile page
- [ ] Order detail with shipping info, items, payment status, delivery status
- [ ] PayPal payment for unpaid orders (non-admin)
- [ ] Admin mark order as delivered (cash or PayPal orders)

### Admin Panel

- [ ] Admin dropdown nav: Users, Products, Categories
- [ ] All admin pages gated by role

### Integrations

- [ ] Cloudinary image upload (JPEG/PNG, max 1MB, unsigned preset)
- [ ] PayPal SDK payment flow
- [ ] MongoDB collections and document shapes unchanged

### API Contract (Backward Compatible During Transition)

All existing endpoint paths, methods, request bodies, and response shapes must remain functional until the Pages Router is removed. Frontend code will be migrated route-by-route.

---

## 10. Migration Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Pages + App Router coexistence conflicts** | High | Use different route paths initially OR migrate one route at a time with rewrites in `next.config.js` |
| **Broken current build (missing Tailwind/Lucide)** | High | Phase 0 installs missing deps before any structural changes |
| **JWT/cookie breakage during auth migration** | High | Keep exact cookie name (`refreshtoken`), path, and token payload shape; test login/logout/refresh thoroughly |
| **Cart localStorage key change loses user carts** | Medium | Preserve key `__next__cart01__devat` or migrate with read-fallback |
| **Mongoose 5 → 8 breaking changes** | Medium | Upgrade connection API; test all queries; schemas unchanged so low data risk |
| **MongoDB data corruption on order stock updates** | Medium | `sold()` in order creation uses async without await — fix during API migration |
| **PayPal SDK loading differences in App Router** | Medium | Use `next/script` with same client ID env var; test payment end-to-end |
| **Cloudinary env var rename breaks uploads** | Low | Keep exact env var names initially |
| **Partial UI during transition looks inconsistent** | Medium | Migrate shared components (NavBar, ProductItem) before individual pages |
| **Admin routes exposed without middleware** | High | Add `middleware.js` early in migration — currently no server-side guard exists |
| **Self-fetch removal changes SSR behavior** | Low | Replace with direct DB queries in Server Components — faster, not breaking |
| **jsonwebtoken upgrade invalidates existing tokens** | Low | Acceptable — users re-login once after deploy |
| **Next.js 16 / React 19 ecosystem gaps** | Medium | Pin exact versions; verify shadcn/ui + RHF compatibility before bulk install |

---

## 11. Step-by-Step Migration Order

### Phase 0 — Foundation (No Route Changes)

> Goal: Fix the broken build state and prepare tooling without moving routes.

1. Create `.env.example` documenting all required environment variables.
2. Move secrets from `next.config.js` → `.env.local` (keep placeholders in `.env.example`).
3. Upgrade `package.json` dependencies to target versions (Next 16, React 19, Mongoose 8, etc.).
4. Install Tailwind CSS, PostCSS, Lucide React, and configure `tailwind.config.js` + `postcss.config.js`.
5. Add `jsconfig.json` path aliases.
6. Remove `NODE_OPTIONS=--openssl-legacy-provider` from scripts once build succeeds.
7. Verify legacy `pages/` app still runs end-to-end on modern stack.

**Exit criteria:** `npm run dev` and `npm run build` succeed; existing Pages Router functional.

---

### Phase 1 — App Router Shell

> Goal: Create `app/` alongside `pages/` without deleting anything.

1. Create `app/layout.js` with global styles (`app/globals.css`), Sonner toaster, and font setup.
2. Create `app/page.js` as a stub (or redirect) — do not replace home yet.
3. Initialize shadcn/ui (`components.json`, `lib/utils/cn.js`, base UI primitives).
4. Add `middleware.js` for route protection skeleton (auth + admin guards).
5. Modernize `lib/db/connect.js` — cached Mongoose 8 connection pattern for server use.

**Exit criteria:** App Router renders alongside Pages Router; no route conflicts.

---

### Phase 2 — API Migration (Route Handlers)

> Goal: Port `pages/api/` → `app/api/` one domain at a time. Keep `pages/api/` until all clients verified.

1. Port `connectDB` + auth middleware → `lib/auth/verify.js`.
2. Create Zod schemas mirroring current validation rules (`lib/validations/`).
3. Migrate API routes in order:
   - `auth/` (login, register, access-token)
   - `categories/` (simplest CRUD)
   - `product/` (includes APIfeatures class — refactor to query builder)
   - `user/` (profile, role, delete, reset password)
   - `order/` (includes stock decrement fix — add `await` to `sold()`)
4. Add API response consistency (status codes, error shape).
5. Update `utils/fetchData.js` or create server-side data helpers that query DB directly (for Server Components).

**Exit criteria:** All Route Handlers pass manual API testing; `pages/api/` still exists as fallback.

---

### Phase 3 — Shared Components & Providers

> Goal: Replace Bootstrap components before migrating pages.

1. Build shadcn-based `Navbar` (NovaCart branding, cart badge, admin dropdown).
2. Build `ProductCard`, `ProductFilter`, `CartItem`, `CartSummary`.
3. Build `ConfirmDialog` (replaces Bootstrap Modal).
4. Replace `Notify`/`Toast`/`Loading` with Sonner + shadcn loading states.
5. Create slim `AuthProvider` + `CartProvider` (replace monolithic `GlobalState`).
6. Preserve localStorage cart key and auth cookie behavior exactly.

**Exit criteria:** New components render in isolation; Storybook or test pages optional.

---

### Phase 4 — Public Pages Migration

> Goal: Migrate customer-facing routes to App Router with Server Components.

1. **`/` (Home)** — Server Component fetches products directly from DB; client island for filter/sort/pagination; admin bulk delete as client component.
2. **`/product/[id]`** — Server Component for product data; client island for gallery + add to cart.
3. **`/cart`** — Client Component (cart state); use existing cart provider.
4. **`/signin` + `/register`** — React Hook Form + Zod; preserve auth flow exactly.
5. Add Next.js `<Script>` for PayPal SDK (remove from `_document.js` when ready).

**Exit criteria:** Public shopping flow works entirely through `app/` routes.

---

### Phase 5 — Authenticated & Admin Pages

1. **`/profile`** — Server fetch orders; client form for profile/password.
2. **`/order/[id]`** — Server fetch order by ID (fix direct-navigation bug); PayPal button as client component.
3. **`/categories`** — Admin CRUD with shadcn forms.
4. **`/create/[[...id]]`** — Product form with React Hook Form + Zod + Cloudinary upload.
5. **`/users` + `/edit-user/[id]`** — Admin user management.

**Exit criteria:** Full admin and account functionality verified on App Router.

---

### Phase 6 — Middleware, SEO & Polish

1. Finalize `middleware.js` — protect `/profile`, `/order/*`, `/users`, `/categories`, `/create/*`, `/edit-user/*`.
2. Add `metadata` exports to all `app/` pages.
3. Add Framer Motion page transitions (optional, non-breaking).
4. Fix `/forgot-password` dead link (remove or stub page).
5. Fix product total count bug in API.
6. Remove `console.log` from token generator.

**Exit criteria:** All routes protected server-side; SEO metadata present.

---

### Phase 7 — Legacy Removal & Production Hardening

1. Delete `pages/` directory (including `pages/api/`).
2. Delete `store/` (GlobalState, Actions, Reducers).
3. Delete legacy `components/` (Bootstrap versions).
4. Delete legacy `styles/*.css` imports.
5. Remove Bootstrap/jQuery/FontAwesome from any remaining CDN references.
6. Clean `next.config.js` — remove deprecated options.
7. Add `.env.example` to repo; verify `.env.local` gitignored.
8. Production build + deployment smoke test.

**Exit criteria:** Zero references to Pages Router; single architecture remains.

---

### Phase 8 — Post-Migration Enhancements (Out of Scope for Initial Migration)

- Server Actions for cart/checkout (replace client fetch)
- httpOnly secure cookies for refresh token (instead of js-cookie)
- Image upload via server-side Cloudinary signed upload
- Rate limiting on auth routes
- Test suite (Vitest + Playwright)
- CI/CD pipeline

---

## Appendix A — API Endpoint Reference

| Method | Legacy Path | Target Route Handler |
|--------|-------------|---------------------|
| POST | `/api/auth/login` | `app/api/auth/login/route.js` |
| POST | `/api/auth/register` | `app/api/auth/register/route.js` |
| GET | `/api/auth/accessToken` | `app/api/auth/access-token/route.js` |
| GET | `/api/product` | `app/api/product/route.js` |
| POST | `/api/product` | `app/api/product/route.js` |
| GET | `/api/product/[id]` | `app/api/product/[id]/route.js` |
| PUT | `/api/product/[id]` | `app/api/product/[id]/route.js` |
| DELETE | `/api/product/[id]` | `app/api/product/[id]/route.js` |
| GET | `/api/categories` | `app/api/categories/route.js` |
| POST | `/api/categories` | `app/api/categories/route.js` |
| PUT | `/api/categories/[id]` | `app/api/categories/[id]/route.js` |
| DELETE | `/api/categories/[id]` | `app/api/categories/[id]/route.js` |
| GET | `/api/order` | `app/api/order/route.js` |
| POST | `/api/order` | `app/api/order/route.js` |
| PATCH | `/api/order/payment/[id]` | `app/api/order/payment/[id]/route.js` |
| PATCH | `/api/order/delivered/[id]` | `app/api/order/delivered/[id]/route.js` |
| GET | `/api/user` | `app/api/user/route.js` |
| PATCH | `/api/user` | `app/api/user/route.js` |
| PATCH | `/api/user/[id]` | `app/api/user/[id]/route.js` |
| DELETE | `/api/user/[id]` | `app/api/user/[id]/route.js` |
| PATCH | `/api/user/resetPassword` | `app/api/user/reset-password/route.js` |

## Appendix B — Current vs Target Component Map

| Legacy Component | Target Component | Notes |
|-----------------|------------------|-------|
| `NavBar.js` | `components/layout/navbar.jsx` | Bootstrap → shadcn + Lucide; fix branding |
| `ProductItem.js` | `components/product/product-card.jsx` | Bootstrap card → Tailwind card |
| `Filter.js` | `components/product/product-filter.jsx` | Bootstrap → shadcn Select + Input |
| `CartItem.js` | `components/cart/cart-item.jsx` | Table row → flex/card layout |
| `OrderDetail.js` | `components/order/order-detail.jsx` | Preserve PayPal + admin actions |
| `Modal.js` | `components/admin/confirm-dialog.jsx` | Bootstrap modal → shadcn Dialog |
| `Notify.js` + `Toast.js` | Sonner toasts | Remove custom toast system |
| `Loading.js` | shadcn Skeleton / spinner | Remove full-screen SVG loader |
| `paypalBtn.js` | `components/order/paypal-button.jsx` | Same logic, client component |
| `Layout.js` | `app/layout.js` | Root layout replaces wrapper |

---

*Generated from full repository audit — August 2026. No files were modified during this audit.*
