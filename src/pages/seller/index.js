import Head from 'next/head'
import Link from 'next/link'
import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AuthGuard from '../../../components/common/AuthGuard'

import {
    BarChart3,
    ChevronRight,
    ClipboardList,
    DollarSign,
    Package,
    Plus,
    ShoppingBag,
    Users,
    Warehouse
} from 'lucide-react'

import { DataContext } from '../../../store/GlobalState'
import { getData } from '@/lib/api-client'

import Container from '../../../components/common/Container'
import Button from '../../../components/common/Button'
import Badge from '../../../components/common/Badge'
import Loading from '../../../components/common/Loading'

const SellerDashboard = () => {

    const { state, dispatch } =
        useContext(DataContext)

    const { auth } = state

    const router = useRouter()

    const [dashboard, setDashboard] =
        useState(null)

    const [loading, setLoading] =
        useState(true)


    // ==============================
    // AUTHORIZATION
    // ==============================

    useEffect(() => {

        if (!auth) {
            return
        }

        if (!auth.user) {
            router.replace('/signin')
            return
        }

        if (auth.user.role !== 'seller') {
            router.replace('/')
            return
        }

    }, [auth, router])


    // ==============================
    // LOAD DASHBOARD
    // ==============================

    useEffect(() => {

        if (!auth?.token) {
            return
        }

        if (auth.user?.role !== 'seller') {
            return
        }

        const loadDashboard = async () => {

            setLoading(true)

            const res =
                await getData(
                    'seller/dashboard',
                    auth.token
                )

            if (res.err) {

                dispatch({
                    type: 'NOTIFY',
                    payload: {
                        error: res.err
                    }
                })

                setLoading(false)

                return
            }

            setDashboard(res)

            setLoading(false)
        }

        loadDashboard()

    }, [
        auth?.token,
        auth?.user?.role,
        dispatch
    ])


    if (
        !auth?.user ||
        auth.user.role !== 'seller'
    ) {
        return null
    }


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        )
    }


    if (!dashboard) {
        return null
    }


    const {
        stats,
        recentOrders,
        lowStock,
        products
    } = dashboard


    return (
        <>
            <Head>

                <title>
                    Seller Dashboard | NovaCart
                </title>

                <meta
                    name="description"
                    content="Manage your NovaCart store."
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
                                Welcome, {auth.user.name}
                            </h1>

                            <p className="mt-2 text-sm text-[var(--nova-muted)]">
                                Here's what's happening with your store.
                            </p>

                        </div>


                        <div className="flex gap-3">

                            <Link href="/products">

                                <Button variant="secondary">
                                    Visit Store
                                </Button>

                            </Link>


                            <Link href="/create">

                                <Button>

                                    <Plus size={16} />

                                    Add Product

                                </Button>

                            </Link>

                        </div>

                    </div>


                    {/* ==========================
                        STATS
                    =========================== */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">


                        <StatCard
                            icon={DollarSign}
                            label="Revenue"
                            value={`₹${Number(stats.revenue || 0).toLocaleString('en-IN')}`}
                        />


                        <StatCard
                            icon={ShoppingBag}
                            label="Orders"
                            value={stats.orders}
                        />


                        <StatCard
                            icon={Package}
                            label="Products"
                            value={stats.products}
                        />


                        <StatCard
                            icon={Users}
                            label="Customers"
                            value={stats.customers}
                        />

                    </div>


                    {/* ==========================
                        SECONDARY STATS
                    =========================== */}

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">


                        <div className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--nova-surface-soft)]">

                                    <Warehouse size={18} />

                                </div>

                                <div>

                                    <p className="text-xs text-[var(--nova-muted)]">
                                        Current Inventory
                                    </p>

                                    <p className="mt-1 text-xl font-semibold">
                                        {stats.totalStock}
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--nova-surface-soft)]">

                                    <BarChart3 size={18} />

                                </div>

                                <div>

                                    <p className="text-xs text-[var(--nova-muted)]">
                                        Units Sold
                                    </p>

                                    <p className="mt-1 text-xl font-semibold">
                                        {stats.totalSold}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ==========================
                        MAIN GRID
                    =========================== */}

                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">


                        {/* ======================
                            RECENT ORDERS
                        ======================= */}

                        <section className="overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">

                            <div className="flex items-center justify-between border-b border-[var(--nova-border)] px-5 py-4">

                                <div>

                                    <h2 className="font-semibold">
                                        Recent orders
                                    </h2>

                                    <p className="mt-1 text-xs text-[var(--nova-muted)]">
                                        Orders containing your products.
                                    </p>

                                </div>


                                <Link
                                    href="/profile#orders"
                                    className="flex items-center gap-1 text-xs font-medium text-[var(--nova-blue)]"
                                >
                                    View all
                                    <ChevronRight size={14} />
                                </Link>

                            </div>


                            {recentOrders.length === 0 ? (

                                <div className="px-5 py-12 text-center">

                                    <ClipboardList
                                        size={28}
                                        className="mx-auto mb-3 text-[var(--nova-muted)]"
                                    />

                                    <p className="text-sm font-medium">
                                        No orders yet
                                    </p>

                                    <p className="mt-1 text-xs text-[var(--nova-muted)]">
                                        Your customer orders will appear here.
                                    </p>

                                </div>

                            ) : (

                                <div className="divide-y divide-[var(--nova-border)]">

                                    {recentOrders.map(order => (

                                        <div
                                            key={order._id}
                                            className="flex items-center justify-between gap-4 px-5 py-4"
                                        >

                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-medium">
                                                    #{String(order._id).slice(-8)}
                                                </p>

                                                <p className="mt-1 text-xs text-[var(--nova-muted)]">
                                                    {order.user?.name || 'Customer'}
                                                    {' · '}
                                                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                </p>

                                            </div>


                                            <div className="shrink-0 text-right">

                                                <p className="text-sm font-semibold">
                                                    ₹{Number(order.sellerTotal || 0).toLocaleString('en-IN')}
                                                </p>


                                                <div className="mt-1">

                                                    {order.delivered ? (

                                                        <Badge variant="success">
                                                            Delivered
                                                        </Badge>

                                                    ) : order.paid ? (

                                                        <Badge variant="success">
                                                            Paid
                                                        </Badge>

                                                    ) : (

                                                        <Badge variant="warning">
                                                            Payment pending
                                                        </Badge>

                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </section>


                        {/* ======================
                            QUICK ACTIONS
                        ======================= */}

                        <section className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">

                            <div className="border-b border-[var(--nova-border)] px-5 py-4">

                                <h2 className="font-semibold">
                                    Store management
                                </h2>

                                <p className="mt-1 text-xs text-[var(--nova-muted)]">
                                    Common seller actions.
                                </p>

                            </div>


                            <div className="p-4">


                                <DashboardLink
                                    href="/create"
                                    icon={Plus}
                                    title="Add product"
                                    description="List a new product"
                                />


                                <DashboardLink
                                    href="/create"
                                    icon={Package}
                                    title="Manage products"
                                    description="View and update your products"
                                />


                                <DashboardLink
                                    href="/profile#orders"
                                    icon={ShoppingBag}
                                    title="Manage orders"
                                    description="Review your customer orders"
                                />


                                <DashboardLink
                                    href="/profile"
                                    icon={Users}
                                    title="Customers"
                                    description="View customers who bought from you"
                                />

                            </div>

                        </section>

                    </div>


                    {/* ==========================
                        LOW STOCK
                    =========================== */}

                    <section className="mt-6 overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">

                        <div className="flex items-center justify-between border-b border-[var(--nova-border)] px-5 py-4">

                            <div>

                                <h2 className="font-semibold">
                                    Inventory
                                </h2>

                                <p className="mt-1 text-xs text-[var(--nova-muted)]">
                                    Products that may need restocking.
                                </p>

                            </div>


                            <Link
                                href="/create"
                                className="text-xs font-medium text-[var(--nova-blue)]"
                            >
                                Manage products
                            </Link>

                        </div>


                        {lowStock.length === 0 ? (

                            <div className="px-5 py-8 text-sm text-[var(--nova-muted)]">
                                All products currently have healthy stock levels.
                            </div>

                        ) : (

                            <div className="divide-y divide-[var(--nova-border)]">

                                {lowStock.map(product => (

                                    <div
                                        key={product._id}
                                        className="flex items-center justify-between gap-4 px-5 py-4"
                                    >

                                        <div className="flex min-w-0 items-center gap-3">

                                            {product.images?.[0]?.url ? (

                                                <img
                                                    src={product.images[0].url}
                                                    alt={product.title}
                                                    className="h-11 w-11 rounded-lg object-cover"
                                                />

                                            ) : (

                                                <div className="h-11 w-11 rounded-lg bg-[var(--nova-surface-soft)]" />

                                            )}


                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-medium">
                                                    {product.title}
                                                </p>

                                                <p className="mt-1 text-xs text-[var(--nova-muted)]">
                                                    ₹{Number(product.price || 0).toLocaleString('en-IN')}
                                                </p>

                                            </div>

                                        </div>


                                        <Badge variant="warning">
                                            {product.inStock} left
                                        </Badge>

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>


                    {/* ==========================
                        PRODUCTS
                    =========================== */}

                    <section className="mt-6 overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]">

                        <div className="flex items-center justify-between border-b border-[var(--nova-border)] px-5 py-4">

                            <div>

                                <h2 className="font-semibold">
                                    Your products
                                </h2>

                                <p className="mt-1 text-xs text-[var(--nova-muted)]">
                                    Recently added products.
                                </p>

                            </div>

                            <Link
                                href="/create"
                                className="text-xs font-medium text-[var(--nova-blue)]"
                            >
                                View products
                            </Link>

                        </div>


                        {products.length === 0 ? (

                            <div className="px-5 py-10 text-center">

                                <Package
                                    size={28}
                                    className="mx-auto mb-3 text-[var(--nova-muted)]"
                                />

                                <p className="text-sm font-medium">
                                    No products yet
                                </p>

                                <Link
                                    href="/create"
                                    className="mt-2 inline-block text-sm text-[var(--nova-blue)]"
                                >
                                    Add your first product
                                </Link>

                            </div>

                        ) : (

                            <div className="divide-y divide-[var(--nova-border)]">

                                {products.map(product => (

                                    <div
                                        key={product._id}
                                        className="flex items-center justify-between gap-4 px-5 py-4"
                                    >

                                        <div className="flex min-w-0 items-center gap-3">

                                            {product.images?.[0]?.url && (

                                                <img
                                                    src={product.images[0].url}
                                                    alt={product.title}
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />

                                            )}

                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-medium">
                                                    {product.title}
                                                </p>

                                                <p className="mt-1 text-xs text-[var(--nova-muted)]">
                                                    ₹{Number(product.price || 0).toLocaleString('en-IN')}
                                                    {' · '}
                                                    {product.inStock} in stock
                                                </p>

                                            </div>

                                        </div>


                                        <Link
                                            href={`/product/${product._id}`}
                                            className="shrink-0 text-xs font-medium text-[var(--nova-blue)]"
                                        >
                                            View
                                        </Link>

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>

                </Container>

            </main>
        </>
    )
}


// =====================================
// STAT CARD
// =====================================

const StatCard = ({
    icon: Icon,
    label,
    value
}) => {

    return (

        <div className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5">

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-xs text-[var(--nova-muted)]">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                        {value}
                    </p>

                </div>


                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--nova-surface-soft)]">

                    <Icon size={17} />

                </div>

            </div>

        </div>

    )
}


// =====================================
// DASHBOARD LINK
// =====================================

const DashboardLink = ({
    href,
    icon: Icon,
    title,
    description
}) => {

    return (

        <Link
            href={href}
            className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-[var(--nova-surface-soft)]"
        >

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--nova-surface-soft)]">

                <Icon size={16} />

            </div>


            <div className="min-w-0 flex-1">

                <p className="text-sm font-medium">
                    {title}
                </p>

                <p className="mt-0.5 text-xs text-[var(--nova-muted)]">
                    {description}
                </p>

            </div>


            <ChevronRight
                size={15}
                className="text-[var(--nova-muted)]"
            />

        </Link>

    )
}


const SellerDashboardPage = () => {
    return (
        <AuthGuard roles={['seller']}>
            <DashboardLink />
        </AuthGuard>
    )
}

export default SellerDashboardPage