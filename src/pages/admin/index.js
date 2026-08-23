import Head from 'next/head'
import Link from 'next/link'
import { useContext, useEffect, useState } from 'react'
import {
    Users,
    Store,
    Package,
    ShoppingBag,
    FolderTree,
    IndianRupee
} from 'lucide-react'

import { DataContext } from '../../../store/GlobalState'
import { getData } from '@/lib/api-client'

const StatCard = ({
    icon: Icon,
    label,
    value,
    description
}) => {

    return (
        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5">

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-sm text-[var(--nova-muted)]">
                        {label}
                    </p>

                    <p className="mt-2 text-3xl font-semibold">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-[var(--nova-muted)]">
                        {description}
                    </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--nova-surface-soft)]">

                    <Icon size={18} />

                </div>

            </div>

        </div>
    )
}


const AdminDashboard = () => {

    const { state, dispatch } =
        useContext(DataContext)

    const { auth } = state

    const [data, setData] = useState({
        sellers: 0,
        customers: 0,
        admins: 0,
        products: 0,
        orders: 0,
        categories: 0,
        activeCategories: 0,
        revenue: 0
    })

    const [loading, setLoading] =
        useState(true)


    useEffect(() => {

        if (!auth?.token) return

        if (
            auth.user?.role !== 'admin' ||
            auth.user?.root !== true
        ) {
            setLoading(false)
            return
        }


        const loadDashboard = async () => {
            try {
                const res = await getData(
                    'admin/dashboard',
                    auth.token
                )

                if (res.err) {
                    dispatch({
                        type: 'NOTIFY',
                        payload: {
                            error: res.err,
                        },
                    })

                    return
                }

                const stats = res.stats || res

                setData({
                    sellers: Number(stats.sellers) || 0,
                    customers: Number(stats.customers) || 0,
                    admins: Number(stats.admins) || 0,
                    products: Number(stats.products) || 0,
                    orders: Number(stats.orders) || 0,
                    categories: Number(stats.categories) || 0,
                    activeCategories:
                        Number(
                            stats.activeCategories ??
                            stats.categories ??
                            0
                        ),
                    revenue: Number(stats.revenue) || 0,
                })

            } catch (error) {
                dispatch({
                    type: 'NOTIFY',
                    payload: {
                        error:
                            error.message ||
                            'Unable to load dashboard.',
                    },
                })
            } finally {
                setLoading(false)
            }
        }


        loadDashboard()

    }, [auth?.token])


    const formatMoney = (value) => {

        return new Intl.NumberFormat(
            'en-IN',
            {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }
        ).format(Number(value) || 0)

    }


    return (
        <>
            <Head>

                <title>
                    Super Admin | NovaCart
                </title>

                <meta
                    name="description"
                    content="NovaCart platform administration dashboard."
                />

            </Head>


            <main className="min-h-screen p-5 sm:p-7 lg:p-8">

                <div className="mx-auto max-w-7xl">


                    {/* HEADER */}

                    <div className="mb-8">

                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nova-muted)]">
                            NovaCart
                        </p>

                        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                            Platform overview
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-[var(--nova-muted)]">
                            Manage sellers, customers,
                            products, categories and orders
                            from one place.
                        </p>

                    </div>


                    {/* LOADING */}

                    {loading ? (

                        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-8 text-sm text-[var(--nova-muted)]">

                            Loading platform data...

                        </div>

                    ) : (

                        <>


                            {/* STATS */}

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">


                                <StatCard
                                    icon={Store}
                                    label="Sellers"
                                    value={data.sellers}
                                    description="Registered seller accounts"
                                />


                                <StatCard
                                    icon={Users}
                                    label="Customers"
                                    value={data.customers}
                                    description="Customer accounts"
                                />


                                <StatCard
                                    icon={Package}
                                    label="Products"
                                    value={data.products}
                                    description="Marketplace products"
                                />


                                <StatCard
                                    icon={ShoppingBag}
                                    label="Orders"
                                    value={data.orders}
                                    description="Platform orders"
                                />


                                <StatCard
                                    icon={FolderTree}
                                    label="Categories"
                                    value={data.categories}
                                    description={`${data.activeCategories} active categories`}
                                />


                                <StatCard
                                    icon={IndianRupee}
                                    label="Revenue"
                                    value={formatMoney(data.revenue)}
                                    description="Paid order value"
                                />


                            </div>


                            {/* MANAGEMENT */}

                            <div className="mt-8">

                                <div className="mb-4">

                                    <h2 className="text-lg font-semibold">
                                        Platform management
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--nova-muted)]">
                                        Quickly access the main
                                        marketplace controls.
                                    </p>

                                </div>


                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">


                                    <Link
                                        href="/users"
                                        className="group rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 transition hover:-translate-y-0.5 hover:bg-[var(--nova-surface-soft)]"
                                    >

                                        <Store
                                            size={20}
                                            className="mb-4"
                                        />

                                        <h3 className="font-semibold">
                                            Sellers
                                        </h3>

                                        <p className="mt-1 text-sm text-[var(--nova-muted)]">
                                            View and manage seller accounts.
                                        </p>

                                    </Link>


                                    <Link
                                        href="/users"
                                        className="group rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 transition hover:-translate-y-0.5 hover:bg-[var(--nova-surface-soft)]"
                                    >

                                        <Users
                                            size={20}
                                            className="mb-4"
                                        />

                                        <h3 className="font-semibold">
                                            Customers
                                        </h3>

                                        <p className="mt-1 text-sm text-[var(--nova-muted)]">
                                            Manage customer accounts.
                                        </p>

                                    </Link>


                                    <Link
                                        href="/admin/products"
                                        className="group rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 transition hover:-translate-y-0.5 hover:bg-[var(--nova-surface-soft)]"
                                    >

                                        <Package
                                            size={20}
                                            className="mb-4"
                                        />

                                        <h3 className="font-semibold">
                                            Products
                                        </h3>

                                        <p className="mt-1 text-sm text-[var(--nova-muted)]">
                                            Manage the marketplace catalog.
                                        </p>

                                    </Link>


                                    <Link
                                        href="/categories"
                                        className="group rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 transition hover:-translate-y-0.5 hover:bg-[var(--nova-surface-soft)]"
                                    >

                                        <FolderTree
                                            size={20}
                                            className="mb-4"
                                        />

                                        <h3 className="font-semibold">
                                            Categories
                                        </h3>

                                        <p className="mt-1 text-sm text-[var(--nova-muted)]">
                                            Organize the product catalog.
                                        </p>

                                    </Link>


                                </div>

                            </div>


                            {/* PLATFORM STATUS */}

                            <div className="mt-8 rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-6">

                                <h2 className="text-base font-semibold">
                                    Platform status
                                </h2>

                                <div className="mt-5 grid gap-4 sm:grid-cols-3">


                                    <div className="rounded-xl bg-[var(--nova-surface-soft)] p-4">

                                        <p className="text-xs text-[var(--nova-muted)]">
                                            Marketplace
                                        </p>

                                        <p className="mt-1 font-medium">
                                            Active
                                        </p>

                                    </div>


                                    <div className="rounded-xl bg-[var(--nova-surface-soft)] p-4">

                                        <p className="text-xs text-[var(--nova-muted)]">
                                            Product catalog
                                        </p>

                                        <p className="mt-1 font-medium">
                                            Active
                                        </p>

                                    </div>


                                    <div className="rounded-xl bg-[var(--nova-surface-soft)] p-4">

                                        <p className="text-xs text-[var(--nova-muted)]">
                                            Order processing
                                        </p>

                                        <p className="mt-1 font-medium">
                                            Active
                                        </p>

                                    </div>


                                </div>

                            </div>

                        </>

                    )}

                </div>

            </main>
        </>
    )
}

export default AdminDashboard