import Head from 'next/head'
import Link from 'next/link'
import { useContext, useEffect, useState } from 'react'
import AuthGuard from '../../../components/common/AuthGuard'
import {
    Package,
    Plus,
    Pencil,
    Trash2
} from 'lucide-react'
import { DataContext } from '../../../store/GlobalState'
import { getData, deleteData } from '@/lib/api-client'

const SellerProducts = () => {
    const { state, dispatch } = useContext(DataContext)

    const auth = state?.auth

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const loadProducts = async () => {
        if (!auth?.token) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)

            // IMPORTANT:
            // Do NOT send seller=undefined.
            // Backend identifies seller from auth token.
            const res = await getData(
                'seller/products',
                auth.token
            )

            if (res?.err) {
                dispatch({
                    type: 'NOTIFY',
                    payload: {
                        error: res.err
                    }
                })

                setProducts([])
                return
            }

            setProducts(res?.products || [])
        } catch (error) {
            console.error(
                'Load seller products error:',
                error
            )

            dispatch({
                type: 'NOTIFY',
                payload: {
                    error: 'Unable to load your products.'
                }
            })

            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProducts()
    }, [auth?.token])

    const handleDelete = async (id) => {
        if (!id || !auth?.token) return

        const confirmed = window.confirm(
            'Are you sure you want to delete this product?'
        )

        if (!confirmed) return

        try {
            dispatch({
                type: 'NOTIFY',
                payload: {
                    loading: true
                }
            })

            const res = await deleteData(
                `seller/products?id=${id}`,
                auth.token
            )

            if (res?.err) {
                dispatch({
                    type: 'NOTIFY',
                    payload: {
                        error: res.err
                    }
                })

                return
            }

            setProducts((prev) =>
                prev.filter(
                    (product) => product._id !== id
                )
            )

            dispatch({
                type: 'NOTIFY',
                payload: {
                    success:
                        res?.msg ||
                        'Product deleted successfully.'
                }
            })
        } catch (error) {
            console.error(
                'Delete seller product error:',
                error
            )

            dispatch({
                type: 'NOTIFY',
                payload: {
                    error: 'Unable to delete product.'
                }
            })
        }
    }

    if (!auth?.user) {
        return (
            <>
                <Head>
                    <title>My Products | NovaCart</title>
                </Head>

                <main className="min-h-screen bg-[var(--nova-bg)] px-6 py-12">
                    <div className="mx-auto max-w-6xl">
                        <h1 className="text-3xl font-semibold">
                            My Products
                        </h1>

                        <p className="mt-3 text-[var(--nova-muted)]">
                            Please sign in to manage your products.
                        </p>
                    </div>
                </main>
            </>
        )
    }

    if (auth.user.role !== 'seller') {
        return (
            <>
                <Head>
                    <title>My Products | NovaCart</title>
                </Head>

                <main className="min-h-screen bg-[var(--nova-bg)] px-6 py-12">
                    <div className="mx-auto max-w-6xl">
                        <h1 className="text-3xl font-semibold">
                            My Products
                        </h1>

                        <p className="mt-3 text-[var(--nova-danger)]">
                            Only sellers can access this page.
                        </p>
                    </div>
                </main>
            </>
        )
    }

    return (
        <>
            <Head>
                <title>My Products | NovaCart</title>
            </Head>

            <main className="min-h-screen bg-[var(--nova-bg)] px-6 py-10">
                <div className="mx-auto max-w-7xl">

                    {/* HEADER */}
                    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nova-muted)]">
                                Seller
                            </p>

                            <h1 className="mt-2 text-4xl font-semibold">
                                My Products
                            </h1>

                            <p className="mt-2 text-[var(--nova-muted)]">
                                Manage the products you have added to NovaCart.
                            </p>
                        </div>

                        <Link
                            href="/create"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--nova-blue)] px-6 py-3 font-semibold text-white hover:opacity-90"
                        >
                            <Plus size={18} />
                            Add Product
                        </Link>
                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-12 text-center">
                            <p className="text-[var(--nova-muted)]">
                                Loading your products...
                            </p>
                        </div>
                    )}

                    {/* EMPTY */}
                    {!loading && products.length === 0 && (
                        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-16 text-center">

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--nova-surface-soft)]">
                                <Package size={34} />
                            </div>

                            <h2 className="mt-6 text-2xl font-semibold">
                                No products yet
                            </h2>

                            <p className="mx-auto mt-3 max-w-lg text-[var(--nova-muted)]">
                                You haven't added any products yet.
                                Create your first product to start selling.
                            </p>

                            <Link
                                href="/create"
                                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--nova-blue)] px-7 py-3 font-semibold text-white"
                            >
                                <Plus size={18} />
                                Create your first product
                            </Link>
                        </div>
                    )}

                    {/* PRODUCTS */}
                    {!loading && products.length > 0 && (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    className="overflow-hidden rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)]"
                                >

                                    {/* IMAGE */}
                                    <div className="relative aspect-square bg-[var(--nova-surface-soft)]">

                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Package
                                                    size={48}
                                                    className="text-[var(--nova-muted)]"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* CONTENT */}
                                    <div className="p-5">

                                        <h2 className="line-clamp-2 text-lg font-semibold capitalize">
                                            {product.title}
                                        </h2>

                                        <p className="mt-2 text-xl font-bold">
                                            ₹{Number(product.price || 0).toLocaleString('en-IN')}
                                        </p>

                                        <p className="mt-2 text-sm text-[var(--nova-muted)]">
                                            Stock: {product.inStock || 0}
                                        </p>

                                        {/* ACTIONS */}
                                        <div className="mt-5 flex gap-3">

                                            <Link
                                                href={`/edit/${product._id}`}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--nova-border)] px-4 py-2.5 text-sm font-semibold hover:bg-[var(--nova-surface-soft)]"
                                            >
                                                <Pencil size={16} />
                                                Edit
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(product._id)
                                                }
                                                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--nova-border)] px-4 py-2.5 text-sm font-semibold hover:text-[var(--nova-danger)]"
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </div>
            </main>
        </>
    )
}

const SellerProductsPage = () => {
    return (
        <AuthGuard roles={['seller']}>
            <SellerProducts />
        </AuthGuard>
    )
}

export default SellerProductsPage