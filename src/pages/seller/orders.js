import Head from 'next/head'
import Link from 'next/link'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import {
    Calendar,
    ChevronRight,
    ClipboardList,
    Package,
    PackageCheck,
    Search,
    ShoppingBag,
    XCircle
} from 'lucide-react'

import AuthGuard from '../../../components/common/AuthGuard'
import { DataContext } from '../../../store/GlobalState'
import { getData } from '@/lib/api-client'
import { formatPrice } from '@/lib/formatPrice'

import Container from '../../../components/common/Container'
import Button from '../../../components/common/Button'
import Badge from '../../../components/common/Badge'
import Loading from '../../../components/common/Loading'
import EmptyState from '../../../components/common/EmptyState'
import ErrorState from '../../../components/common/ErrorState'

/*
 * Order lifecycle.
 *
 * IMPORTANT:
 * The order model has no shipped / cancelled field.
 * The only state fields are `paid`, `delivered` and
 * `paymentStatus`. These statuses are derived from
 * that real data — nothing is fabricated.
 */
const STATUSES = {
    pending: 'Pending',
    processing: 'Processing',
    delivered: 'Delivered',
    failed: 'Failed'
}

const deriveStatus = (order) => {
    if (order.paymentStatus === 'failed') {
        return 'failed'
    }

    if (order.paid !== true) {
        return 'pending'
    }

    if (order.delivered === true) {
        return 'delivered'
    }

    return 'processing'
}

/*
 * The API already returns only this seller's items in
 * `order.cart`, so the seller's portion of the order
 * is the sum of the returned items.
 */
const sellerAmount = (order) => {
    const items = Array.isArray(order.cart) ? order.cart : []

    return items.reduce(
        (sum, item) =>
            sum +
            (Number(item.price) || 0) *
                (Number(item.quantity) || 0),
        0
    )
}

const formatDate = (value) => {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return '—'
    }

    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

const STATUS_META = {
    pending: {
        label: STATUSES.pending,
        variant: 'warning'
    },
    processing: {
        label: STATUSES.processing,
        variant: 'blue'
    },
    delivered: {
        label: STATUSES.delivered,
        variant: 'success'
    },
    failed: {
        label: STATUSES.failed,
        variant: 'danger'
    }
}

const SellerOrders = () => {
    const { state, dispatch } = useContext(DataContext)

    const auth = state?.auth

    const router = useRouter()

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] =
        useState('all')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    // ==============================
    // LOAD ORDERS
    //
    // GET /api/order already contains a
    // seller branch: it returns only the
    // orders that contain this seller's
    // products, with `cart` narrowed to
    // that seller's items. No new API is
    // needed and no authorization is
    // weakened here.
    // ==============================

    const loadOrders = async () => {
        if (!auth?.token) {
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await getData(
                'order',
                auth.token
            )

            if (res?.err) {
                setError(res.err)
                setOrders([])
                return
            }

            setOrders(Array.isArray(res?.orders) ? res.orders : [])
        } catch (err) {
            console.error(
                'Load seller orders error:',
                err
            )

            setError(
                'Unable to load your orders.'
            )

            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadOrders()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth?.token])

    // ==============================
    // ENRICH
    //
    // Attach the derived status and the
    // seller-specific amount once, so the
    // filters and the render share them.
    // ==============================

    const enriched = useMemo(
        () =>
            orders.map((order) => ({
                ...order,
                status: deriveStatus(order),
                amount: sellerAmount(order)
            })),
        [orders]
    )

    // ==============================
    // STATISTICS
    // ==============================

    const stats = useMemo(() => {
        const counts = {
            total: enriched.length,
            pending: 0,
            processing: 0,
            delivered: 0,
            failed: 0
        }

        enriched.forEach((order) => {
            counts[order.status] += 1
        })

        return counts
    }, [enriched])

    // ==============================
    // FILTERS
    //
    // Search, status and date range are all
    // applied client-side over the data the
    // API already returns. `createdAt` comes
    // from the order's timestamps — no
    // backend change is required.
    // ==============================

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase()

        const from = dateFrom ? new Date(dateFrom) : null
        const to = dateTo ? new Date(dateTo) : null

        return enriched.filter((order) => {
            if (
                statusFilter !== 'all' &&
                order.status !== statusFilter
            ) {
                return false
            }

            const created = new Date(order.createdAt)

            if (
                from &&
                !Number.isNaN(from.getTime()) &&
                created < from
            ) {
                return false
            }

            if (
                to &&
                !Number.isNaN(to.getTime()) &&
                created > to
            ) {
                return false
            }

            if (!query) {
                return true
            }

            const orderId = String(order._id || '')

            const customer =
                order.user?.name || ''

            const products = Array.isArray(
                order.cart
            )
                ? order.cart
                      .map(
                          (item) =>
                              item?.title || ''
                      )
                      .join(' ')
                : ''

            return (
                orderId
                    .toLowerCase()
                    .includes(query) ||
                customer
                    .toLowerCase()
                    .includes(query) ||
                products
                    .toLowerCase()
                    .includes(query)
            )
        })
    }, [
        enriched,
        search,
        statusFilter,
        dateFrom,
        dateTo
    ])

    const hasFilters =
        search.trim() !== '' ||
        statusFilter !== 'all' ||
        dateFrom !== '' ||
        dateTo !== ''

    const clearFilters = () => {
        setSearch('')
        setStatusFilter('all')
        setDateFrom('')
        setDateTo('')
    }

    // ==============================
    // GUARD
    //
    // AuthGuard already blocks non-sellers,
    // this only prevents a flash of content
    // while the session resolves.
    // ==============================

    if (
        !auth?.user ||
        auth.user.role !== 'seller'
    ) {
        return null
    }

    return (
        <>
            <Head>
                <title>Orders | NovaCart Seller</title>

                <meta
                    name="description"
                    content="Manage your NovaCart orders."
                />
            </Head>

            <main className="min-h-screen bg-[var(--nova-bg)] py-8 sm:py-10">
                <Container>

                    {/* ==========================
                        HEADER
                    =========================== */}

                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--nova-muted)]">
                                Seller Dashboard
                            </p>

                            <h1 className="text-3xl font-semibold tracking-tight">
                                Orders
                            </h1>

                            <p className="mt-2 text-sm text-[var(--nova-muted)]">
                                Orders containing your products.
                            </p>

                        </div>


                        <div className="flex items-center gap-2 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-2.5">
                            <ShoppingBag
                                size={16}
                                className="text-[var(--nova-muted)]"
                            />

                            <span className="text-sm font-semibold">
                                {stats.total}{' '}
                                {stats.total === 1
                                    ? 'order'
                                    : 'orders'}
                            </span>
                        </div>

                    </div>


                    {/* ==========================
                        STATISTICS
                    =========================== */}

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">

                        <SummaryCard
                            icon={ClipboardList}
                            label="Total Orders"
                            value={stats.total}
                        />

                        <SummaryCard
                            icon={Calendar}
                            label="Pending"
                            value={stats.pending}
                            tone="warning"
                        />

                        <SummaryCard
                            icon={Package}
                            label="Processing"
                            value={stats.processing}
                            tone="blue"
                        />

                        <SummaryCard
                            icon={PackageCheck}
                            label="Delivered"
                            value={stats.delivered}
                            tone="success"
                        />

                        <SummaryCard
                            icon={XCircle}
                            label="Failed"
                            value={stats.failed}
                            tone="danger"
                        />

                    </div>


                    {/* ==========================
                        TOOLBAR
                    =========================== */}

                    <div className="mt-6 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-4">

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">

                            {/* SEARCH */}

                            <div className="relative">

                                <Search
                                    size={16}
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
                                />

                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search order ID, customer or product..."
                                    aria-label="Search orders"
                                    className="h-11 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] pl-10 pr-4 text-sm text-[var(--nova-text)] outline-none placeholder:text-[var(--nova-muted)] transition-all duration-200 hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.14)]"
                                />

                            </div>


                            {/* STATUS */}

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                                aria-label="Filter by status"
                                className="h-11 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-3 text-sm font-medium text-[var(--nova-text)] outline-none transition-all duration-200 hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)]"
                            >
                                <option value="all">
                                    All statuses
                                </option>

                                {Object.entries(
                                    STATUSES
                                ).map(([value, label]) => (
                                    <option
                                        key={value}
                                        value={value}
                                    >
                                        {label}
                                    </option>
                                ))}
                            </select>


                            {/* DATE FROM */}

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(event) =>
                                    setDateFrom(
                                        event.target.value
                                    )
                                }
                                aria-label="From date"
                                className="h-11 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-3 text-sm text-[var(--nova-text)] outline-none transition-all duration-200 hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)]"
                            />


                            {/* DATE TO */}

                            <input
                                type="date"
                                value={dateTo}
                                onChange={(event) =>
                                    setDateTo(
                                        event.target.value
                                    )
                                }
                                aria-label="To date"
                                className="h-11 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] px-3 text-sm text-[var(--nova-text)] outline-none transition-all duration-200 hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)]"
                            />

                        </div>


                        {hasFilters && (
                            <div className="mt-3 flex items-center justify-between gap-3">

                                <p className="text-xs text-[var(--nova-muted)]">
                                    {filtered.length}{' '}
                                    {filtered.length === 1
                                        ? 'order'
                                        : 'orders'} match
                                    your filters
                                </p>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-xs font-medium text-[var(--nova-blue)] hover:underline"
                                >
                                    Clear filters
                                </button>

                            </div>
                        )}

                    </div>


                    {/* ==========================
                        STATES
                    =========================== */}

                    {loading && (
                        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">
                            <Loading text="Loading your orders..." />
                        </div>
                    )}


                    {!loading && error && (
                        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">
                            <ErrorState
                                title="Unable to load orders"
                                description={error}
                                onRetry={loadOrders}
                            />
                        </div>
                    )}


                    {!loading &&
                        !error &&
                        enriched.length === 0 && (
                            <div className="mt-6">
                                <EmptyState
                                    title="No orders yet"
                                    description="Orders containing your products will appear here."
                                />
                            </div>
                        )}


                    {/* ==========================
                        NO MATCHES
                    =========================== */}

                    {!loading &&
                        !error &&
                        enriched.length > 0 &&
                        filtered.length === 0 && (
                            <div className="mt-6">
                                <EmptyState
                                    title="No matching orders"
                                    description="Try adjusting your search or filters."
                                    action={
                                        <Button
                                            variant="secondary"
                                            onClick={
                                                clearFilters
                                            }
                                        >
                                            Clear filters
                                        </Button>
                                    }
                                />
                            </div>
                        )}


                    {/* ==========================
                        DESKTOP TABLE
                    =========================== */}

                    {!loading &&
                        !error &&
                        filtered.length > 0 && (
                            <div className="mt-6 overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">

                                <div className="hidden md:block">

                                    <table className="w-full min-w-[760px] text-left text-sm">

                                        <thead>
                                            <tr className="border-b border-[var(--nova-border)] bg-[var(--nova-surface-soft)] text-xs font-semibold uppercase tracking-wider text-[var(--nova-muted)]">
                                                <th className="px-5 py-4">
                                                    Order
                                                </th>

                                                <th className="px-5 py-4">
                                                    Customer
                                                </th>

                                                <th className="px-5 py-4">
                                                    Products
                                                </th>

                                                <th className="px-5 py-4">
                                                    Date
                                                </th>

                                                <th className="px-5 py-4 text-right">
                                                    Amount
                                                </th>

                                                <th className="px-5 py-4">
                                                    Payment
                                                </th>

                                                <th className="px-5 py-4">
                                                    Status
                                                </th>

                                                <th className="px-5 py-4 text-right">
                                                    Details
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-[var(--nova-border)]">
                                            {filtered.map(
                                                (order) => (
                                                    <tr
                                                        key={
                                                            order._id
                                                        }
                                                        className="transition-colors duration-150 hover:bg-[var(--nova-surface-soft)]"
                                                    >
                                                        {/* ORDER ID */}
                                                        <td className="px-5 py-4">
                                                            <span className="font-semibold">
                                                                #{String(order._id).slice(-8)}
                                                            </span>
                                                        </td>

                                                        {/* CUSTOMER */}
                                                        <td className="px-5 py-4">
                                                            <span className="text-[var(--nova-text)]">
                                                                {order.user?.name ||
                                                                    'Customer'}
                                                            </span>
                                                        </td>

                                                        {/* PRODUCTS */}
                                                        <td className="max-w-[220px] px-5 py-4">
                                                            <ProductList
                                                                cart={
                                                                    order.cart
                                                                }
                                                            />
                                                        </td>

                                                        {/* DATE */}
                                                        <td className="px-5 py-4 text-[var(--nova-muted)]">
                                                            {formatDate(
                                                                order.createdAt
                                                            )}
                                                        </td>

                                                        {/* AMOUNT */}
                                                        <td className="px-5 py-4 text-right font-semibold">
                                                            {formatPrice(
                                                                order.amount
                                                            )}
                                                        </td>

                                                        {/* PAYMENT */}
                                                        <td className="px-5 py-4">
                                                            {order.paid ? (
                                                                <Badge variant="success">
                                                                    Paid
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="warning">
                                                                    Pending
                                                                </Badge>
                                                            )}
                                                        </td>

                                                        {/* STATUS */}
                                                        <td className="px-5 py-4">
                                                            <Badge
                                                                variant={
                                                                    STATUS_META[
                                                                        order
                                                                            .status
                                                                    ]
                                                                        .variant
                                                                }
                                                            >
                                                                {
                                                                    STATUS_META[
                                                                        order
                                                                            .status
                                                                    ]
                                                                        .label
                                                                }
                                                            </Badge>
                                                        </td>

                                                        {/* DETAILS */}
                                                        <td className="px-5 py-4 text-right">
                                                            <Link
                                                                href={`/order/${order._id}`}
                                                                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--nova-blue)] hover:underline"
                                                            >
                                                                View
                                                                <ChevronRight
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>

                                    </table>

                                </div>


                                {/* ======================
                                    MOBILE CARDS
                                ======================= */}

                                <div className="divide-y divide-[var(--nova-border)] md:hidden">
                                    {filtered.map(
                                        (order) => (
                                            <div
                                                key={
                                                    order._id
                                                }
                                                className="p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold">
                                                            #{String(order._id).slice(-8)}
                                                        </p>

                                                        <p className="mt-1 text-xs text-[var(--nova-muted)]">
                                                            {order.user?.name ||
                                                                'Customer'}
                                                        </p>
                                                    </div>

                                                    <p className="text-sm font-semibold">
                                                        {formatPrice(
                                                            order.amount
                                                        )}
                                                    </p>
                                                </div>

                                                <ProductList
                                                    cart={
                                                        order.cart
                                                    }
                                                    className="mt-3"
                                                />

                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            order.paid
                                                                ? 'success'
                                                                : 'warning'
                                                        }
                                                    >
                                                        {order.paid
                                                            ? 'Paid'
                                                            : 'Pending'}
                                                    </Badge>

                                                    <Badge
                                                        variant={
                                                            STATUS_META[
                                                                order.status
                                                            ].variant
                                                        }
                                                    >
                                                        {
                                                            STATUS_META[
                                                                order.status
                                                            ].label
                                                        }
                                                    </Badge>

                                                    <span className="text-xs text-[var(--nova-muted)]">
                                                        {formatDate(
                                                            order.createdAt
                                                        )}
                                                    </span>
                                                </div>

                                                <Link
                                                    href={`/order/${order._id}`}
                                                    className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--nova-blue)] hover:underline"
                                                >
                                                    View details
                                                    <ChevronRight
                                                        size={14}
                                                    />
                                                </Link>
                                            </div>
                                        )
                                    )}
                                </div>

                            </div>
                        )}

                </Container>
            </main>
        </>
    )
}


// =====================================
// SUMMARY CARD
// =====================================

const SummaryCard = ({
    icon: Icon,
    label,
    value,
    tone = 'default'
}) => {
    const tones = {
        default:
            'bg-[var(--nova-surface-soft)] text-[var(--nova-text)]',
        warning:
            'bg-[color-mix(in_srgb,var(--nova-warning)_14%,transparent)] text-[var(--nova-warning)]',
        blue:
            'bg-[color-mix(in_srgb,var(--nova-primary)_12%,transparent)] text-[var(--nova-primary)]',
        success:
            'bg-[color-mix(in_srgb,var(--nova-success)_12%,transparent)] text-[var(--nova-success)]',
        danger:
            'bg-[color-mix(in_srgb,var(--nova-danger)_12%,transparent)] text-[var(--nova-danger)]'
    }

    return (
        <div className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-4 sm:p-5">

            <div className="flex items-center gap-3">

                <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone] || tones.default}`}
                >
                    <Icon size={16} />
                </div>

                <div className="min-w-0">

                    <p className="text-[11px] font-medium text-[var(--nova-muted)]">
                        {label}
                    </p>

                    <p className="mt-0.5 text-xl font-semibold">
                        {value}
                    </p>

                </div>

            </div>

        </div>
    )
}


// =====================================
// PRODUCT LIST
// =====================================

const ProductList = ({ cart, className = '' }) => {
    const items = Array.isArray(cart) ? cart : []

    if (items.length === 0) {
        return (
            <p
                className={`text-xs text-[var(--nova-muted)] ${className}`}
            >
                No items
            </p>
        )
    }

    return (
        <ul className={className}>
            {items.slice(0, 3).map((item) => (
                <li
                    key={item?._id}
                    className="truncate text-xs text-[var(--nova-muted)]"
                >
                    <span className="text-[var(--nova-text)]">
                        {item?.title || 'Product'}
                    </span>
                    {' · '}
                    {Number(item?.quantity) || 0} ×{' '}
                    {formatPrice(item?.price)}
                </li>
            ))}

            {items.length > 3 && (
                <li className="text-xs text-[var(--nova-muted)]">
                    + {items.length - 3} more
                </li>
            )}
        </ul>
    )
}


const SellerOrdersPage = () => {
    return (
        <AuthGuard roles={['seller']}>
            <SellerOrders />
        </AuthGuard>
    )
}

export default SellerOrdersPage
