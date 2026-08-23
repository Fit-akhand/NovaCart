import Head from 'next/head'
import Link from 'next/link'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { DataContext } from '../../../store/GlobalState'
import {
    getData,
    deleteData,
    patchData
} from '../../lib/api-client'
import Container from '../../../components/common/Container'
import Button from '../../../components/common/Button'
import Loading from '../../../components/common/Loading'
import EmptyState from '../../../components/common/EmptyState'
import ProductPrice from '../../../components/product/ProductPrice'
import Badge from '../../../components/common/Badge'
import {
    ArrowLeft,
    Edit,
    Trash2,
    Plus,
    Package,
    Search
} from 'lucide-react'
const FALLBACK_IMAGE =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>'

const AdminProducts = () => {

    const { state, dispatch } =
        useContext(DataContext)

    const { auth } = state

    const router = useRouter()

    const [products, setProducts] =
        useState([])

    const [loading, setLoading] =
        useState(true)

    const [search, setSearch] =
        useState('')


    // =====================================================
    // LOAD ALL PRODUCTS
    // =====================================================

    useEffect(() => {

        if (!auth?.user) {
            return
        }

        if (auth.user.role !== 'admin') {

            router.replace('/')

            return
        }

        const loadProducts = async () => {

            try {

                setLoading(true)

                const response =
                    await getData(
                        'seller/products',
                        auth.token
                    )

                console.log(
                    'ADMIN PRODUCTS API:',
                    response
                )

                if (response?.err) {

                    dispatch({
                        type: 'NOTIFY',
                        payload: {
                            error: response.err
                        }
                    })

                    setProducts([])

                    return
                }

                const productList =
                    Array.isArray(response?.products)
                        ? response.products
                        : []

                setProducts(productList)

            } catch (error) {

                console.error(
                    'Admin products error:',
                    error
                )

                dispatch({
                    type: 'NOTIFY',
                    payload: {
                        error:
                            'Unable to load products.'
                    }
                })

                setProducts([])

            } finally {

                setLoading(false)

            }

        }

        loadProducts()

    }, [auth?.user])


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredProducts =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase()

            if (!query) {
                return products
            }

            return products.filter(
                product =>
                    String(
                        product?.title || ''
                    )
                        .toLowerCase()
                        .includes(query)
            )

        }, [products, search])


    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (
        product
    ) => {

        const confirmed =
            window.confirm(
                `Delete "${product.title}"?\n\nThis action cannot be undone.`
            )

        if (!confirmed) {
            return
        }

        try {

            dispatch({
                type: 'NOTIFY',
                payload: {
                    loading: true
                }
            })

            const response =
                await deleteData(
                    `product/${product._id}`,
                    auth.token
                )

            if (response?.err) {

                dispatch({
                    type: 'NOTIFY',
                    payload: {
                        error:
                            response.err
                    }
                })

                return
            }

            setProducts(
                previous =>
                    previous.filter(
                        item =>
                            item._id !==
                            product._id
                    )
            )

            dispatch({
                type: 'NOTIFY',
                payload: {
                    success:
                        'Product deleted successfully.'
                }
            })

        } catch (error) {

            console.error(
                'Delete product error:',
                error
            )

            dispatch({
                type: 'NOTIFY',
                payload: {
                    error:
                        'Unable to delete product.'
                }
            })

        }

    }

    const handleStockChange = async (
    productId,
    change
) => {
    if (!productId || !auth?.token) return

    try {
        const response = await patchData(
            'seller/products',
            {
                id: productId,
                change
            },
            auth.token
        )

        if (response?.err) {
            dispatch({
                type: 'NOTIFY',
                payload: {
                    error: response.err
                }
            })

            return
        }

        setProducts((previous) =>
            previous.map((product) =>
                product._id === productId
                    ? {
                          ...product,
                          inStock:
                              response.product.inStock
                      }
                    : product
            )
        )

        dispatch({
            type: 'NOTIFY',
            payload: {
                success:
                    change === 1
                        ? 'Stock increased successfully.'
                        : 'Stock decreased successfully.'
            }
        })
    } catch (error) {
        console.error(
            'Admin stock update error:',
            error
        )

        dispatch({
            type: 'NOTIFY',
            payload: {
                error:
                    'Unable to update stock.'
            }
        })
    }
}


    // =====================================================
    // AUTH CHECK
    // =====================================================

    if (!auth?.user) {

        return (
            <>
                <Head>
                    <title>
                        Admin Products | NovaCart
                    </title>
                </Head>

                <Container className="py-16">

                    <Loading
                        text="Checking authentication..."
                    />

                </Container>
            </>
        )

    }


    if (auth.user.role !== 'admin') {
        return null
    }


    return (
        <>
            <Head>

                <title>
                    My Products | NovaCart
                </title>

            </Head>


            <main className="min-h-screen py-8">

                <Container>


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <Link
                                href="/admin"
                                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--nova-muted)] hover:text-[var(--nova-blue)]"
                            >

                                <ArrowLeft
                                    size={15}
                                />

                                Back to Admin Dashboard

                            </Link>


                            <div className="flex items-center gap-3">

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--nova-blue)] text-white">

                                    <Package
                                        size={22}
                                    />

                                </div>


                                <div>

                                    <h1 className="text-3xl font-semibold">

                                        My Products

                                    </h1>

                                    <p className="mt-1 text-sm text-[var(--nova-muted)]">

                                        Manage all products in the NovaCart catalog.

                                    </p>

                                </div>

                            </div>

                        </div>


                        <Link href="/create">

                            <Button className="inline-flex items-center gap-2">

                                <Plus
                                    size={17}
                                />

                                Add Product

                            </Button>

                        </Link>

                    </div>


                    {/* =================================================
                        STATS
                    ================================================= */}

                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

                        <div className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5">

                            <p className="text-sm text-[var(--nova-muted)]">
                                Total Products
                            </p>

                            <p className="mt-2 text-3xl font-semibold">
                                {products.length}
                            </p>

                        </div>


                        <div className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5">

                            <p className="text-sm text-[var(--nova-muted)]">
                                In Stock
                            </p>

                            <p className="mt-2 text-3xl font-semibold">

                                {
                                    products.filter(
                                        product =>
                                            Number(
                                                product.inStock
                                            ) > 0
                                    ).length
                                }

                            </p>

                        </div>


                        <div className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5">

                            <p className="text-sm text-[var(--nova-muted)]">
                                Out of Stock
                            </p>

                            <p className="mt-2 text-3xl font-semibold">

                                {
                                    products.filter(
                                        product =>
                                            Number(
                                                product.inStock
                                            ) <= 0
                                    ).length
                                }

                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        SEARCH
                    ================================================= */}

                    <div className="mb-6">

                        <div className="relative max-w-xl">

                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]"
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={
                                    e =>
                                        setSearch(
                                            e.target.value
                                        )
                                }
                                placeholder="Search products..."
                                className="h-12 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] pl-11 pr-4 text-sm outline-none focus:border-[var(--nova-blue)]"
                            />

                        </div>

                    </div>


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading && (

                        <div className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-12">

                            <Loading
                                text="Loading products..."
                            />

                        </div>

                    )}


                    {/* =================================================
                        EMPTY
                    ================================================= */}

                    {!loading &&
                        filteredProducts.length === 0 && (

                            <EmptyState
                                title={
                                    search
                                        ? 'No products found'
                                        : 'No products found'
                                }
                                description={
                                    search
                                        ? 'Try a different search.'
                                        : 'There are currently no products in the catalog.'
                                }
                                action={
                                    !search && (
                                        <Link href="/create">

                                            <Button className="inline-flex items-center gap-2">

                                                <Plus
                                                    size={16}
                                                />

                                                Add Product

                                            </Button>

                                        </Link>
                                    )
                                }
                            />

                        )}


                    {/* =================================================
                        PRODUCT GRID
                    ================================================= */}

                    {!loading &&
                        filteredProducts.length > 0 && (

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                                {filteredProducts.map(
                                    product => {

                                        const image =
                                            product?.images?.[0]?.url ||
                                            FALLBACK_IMAGE

                                        const displayPrice =
                                            Number(
                                                product.discountedPrice
                                            ) > 0
                                                ? product.discountedPrice
                                                : product.price


                                        return (

                                            <article
                                                key={
                                                    product._id
                                                }
                                                className="group overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]"
                                            >

                                                {/* IMAGE */}

                                                <Link
                                                    href={`/product/${product._id}`}
                                                    className="block overflow-hidden"
                                                >

                                                    <img
                                                        src={image}
                                                        alt={
                                                            product.title ||
                                                            'Product'
                                                        }
                                                        onError={
                                                            event => {
                                                                event.currentTarget.src =
                                                                    FALLBACK_IMAGE
                                                            }
                                                        }
                                                        className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                                    />

                                                </Link>


                                                {/* CONTENT */}

                                                <div className="p-4">

                                                    <div className="mb-2 flex items-start justify-between gap-2">

                                                        <Link
                                                            href={`/product/${product._id}`}
                                                            className="line-clamp-2 text-base font-semibold capitalize hover:text-[var(--nova-blue)]"
                                                        >
                                                            {
                                                                product.title
                                                            }
                                                        </Link>


                                                        {
                                                            Number(
                                                                product.inStock
                                                            ) > 0
                                                                ? (
                                                                    <Badge variant="success">
                                                                        Stock
                                                                    </Badge>
                                                                )
                                                                : (
                                                                    <Badge variant="danger">
                                                                        Out
                                                                    </Badge>
                                                                )
                                                        }

                                                    </div>


                                                    {/* PRICE */}

                                                    <div className="mb-4">

                                                        <ProductPrice
                                                            price={
                                                                displayPrice
                                                            }
                                                            className="text-lg"
                                                        />

                                                    </div>


                                                    {/* STOCK / SOLD */}

                                                    <div className="mb-4 grid grid-cols-2 gap-3">

                                                        <div className="rounded-lg bg-[var(--nova-surface-soft)] p-3">

                                                        <p className="text-xs text-[var(--nova-muted)]">
                                                            Stock
                                                        </p>

                                                        <div className="mt-2 flex items-center gap-2">

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    Number(product.inStock) <= 0
                                                                }
                                                                onClick={() =>
                                                                    handleStockChange(
                                                                        product._id,
                                                                        -1
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--nova-border)] text-sm font-bold hover:border-[var(--nova-blue)] hover:text-[var(--nova-blue)] disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                −
                                                            </button>

                                                            <span className="min-w-8 text-center font-semibold">
                                                                {Number(product.inStock) || 0}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleStockChange(
                                                                        product._id,
                                                                        1
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--nova-blue)] text-sm font-bold text-white hover:opacity-90"
                                                            >
                                                                +
                                                            </button>

                                                        </div>

                                                    </div>


                                                        <div className="rounded-lg bg-[var(--nova-surface-soft)] p-3">

                                                            <p className="text-xs text-[var(--nova-muted)]">
                                                                Sold
                                                            </p>

                                                            <p className="mt-1 font-semibold">
                                                                {
                                                                    Number(
                                                                        product.sold
                                                                    ) || 0
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>


                                                    {/* ACTIONS */}

                                                    <div className="grid grid-cols-2 gap-2">

                                                        <Link
                                                            href={`/create/${product._id}`}
                                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--nova-border)] px-3 py-2.5 text-sm font-medium hover:border-[var(--nova-blue)] hover:text-[var(--nova-blue)]"
                                                        >

                                                            <Edit
                                                                size={15}
                                                            />

                                                            Edit

                                                        </Link>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    product
                                                                )
                                                            }
                                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--nova-danger)] px-3 py-2.5 text-sm font-medium text-white hover:opacity-90"
                                                        >

                                                            <Trash2
                                                                size={15}
                                                            />

                                                            Delete

                                                        </button>

                                                    </div>

                                                </div>

                                            </article>

                                        )

                                    }
                                )}

                            </div>

                        )}

                </Container>

            </main>

        </>
    )
}

export default AdminProducts