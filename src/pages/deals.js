import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
    Flame,
    ShoppingBag,
    ArrowRight,
    Package
} from 'lucide-react'

import Container from '../../components/common/Container'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/common/Button'
import { getData } from '@/lib/api-client'

const Deals = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadDeals = async () => {
            try {
                setLoading(true)

                const res = await getData(
                    'product?limit=100&deals=true'
                )

                if (res?.products) {
                    setProducts(res.products)
                } else {
                    setProducts([])
                }
            } catch (error) {
                console.error(
                    'Deals loading error:',
                    error
                )

                setProducts([])
            } finally {
                setLoading(false)
            }
        }

        loadDeals()
    }, [])

    return (
        <>
            <Head>
                <title>Deals | NovaCart</title>

                <meta
                    name="description"
                    content="Discover the best deals and discounts on NovaCart."
                />
            </Head>

            <main className="min-h-screen py-8 sm:py-10">
                <Container>

                    {/* ============================= */}
                    {/* HEADER */}
                    {/* ============================= */}

                    <section className="mb-8">
                        <div className="flex items-start justify-between gap-4">

                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <Flame
                                        size={22}
                                        className="text-orange-500"
                                    />

                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nova-muted)]">
                                        NovaCart
                                    </p>
                                </div>

                                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                    Today's Deals
                                </h1>

                                <p className="mt-2 max-w-xl text-sm text-[var(--nova-muted)]">
                                    Grab the best discounts before
                                    they are gone.
                                </p>
                            </div>

                            <div className="hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-4 py-3 sm:block">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag
                                        size={17}
                                        className="text-[var(--nova-blue)]"
                                    />

                                    <span className="text-sm font-semibold">
                                        {products.length} deals
                                    </span>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* ============================= */}
                    {/* LOADING */}
                    {/* ============================= */}

                    {loading && (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({
                                length: 8
                            }).map((_, index) => (
                                <div
                                    key={index}
                                    className="overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]"
                                >
                                    <div className="aspect-square animate-pulse bg-[var(--nova-surface-soft)]" />

                                    <div className="space-y-3 p-4">
                                        <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--nova-surface-soft)]" />

                                        <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--nova-surface-soft)]" />

                                        <div className="h-6 w-2/3 animate-pulse rounded bg-[var(--nova-surface-soft)]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ============================= */}
                    {/* EMPTY */}
                    {/* ============================= */}

                    {!loading &&
                        products.length === 0 && (
                            <EmptyState
                                title="No deals available"
                                description="There are no active discounts right now. Check back soon."
                            />
                        )}

                    {/* ============================= */}
                    {/* DEAL PRODUCTS */}
                    {/* ============================= */}

                    {!loading &&
                        products.length > 0 && (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                                {products.map((product) => {

                                    const image =
                                        Array.isArray(
                                            product.images
                                        ) &&
                                        product.images.length > 0
                                            ? product.images[0]
                                            : null

                                    const discount =
                                        Number(
                                            product.discountPercent
                                        ) || 0

                                    const originalPrice =
                                        Number(
                                            product.originalPrice ??
                                            product.price
                                        ) || 0

                                    const discountedPrice =
                                        Number(
                                            product.discountedPrice
                                        ) || 0

                                    return (
                                        <article
                                            key={product._id}
                                            className="group overflow-hidden rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] transition hover:-translate-y-1 hover:border-[var(--nova-blue)]"
                                        >

                                            {/* ========================= */}
                                            {/* IMAGE */}
                                            {/* ========================= */}

                                            <Link
                                                href={`/product/${product._id}`}
                                                className="relative block aspect-square overflow-hidden bg-[var(--nova-surface-soft)]"
                                            >

                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={
                                                            product.title ||
                                                            'Product'
                                                        }
                                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <Package
                                                            size={42}
                                                            className="text-[var(--nova-muted)]"
                                                        />
                                                    </div>
                                                )}

                                                {/* DISCOUNT BADGE */}

                                                {discount > 0 && (
                                                    <span className="absolute left-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                                                        {discount}% OFF
                                                    </span>
                                                )}
                                            </Link>

                                            {/* ========================= */}
                                            {/* CONTENT */}
                                            {/* ========================= */}

                                            <div className="p-4">

                                                <Link
                                                    href={`/product/${product._id}`}
                                                    className="block"
                                                >
                                                    <h2 className="line-clamp-2 text-base font-semibold capitalize transition group-hover:text-[var(--nova-blue)]">
                                                        {product.title}
                                                    </h2>
                                                </Link>

                                                {/* CATEGORY */}

                                                {product.category?.name && (
                                                    <p className="mt-1 text-xs capitalize text-[var(--nova-muted)]">
                                                        {product.category.name}

                                                        {product.subcategory?.name && (
                                                            <>
                                                                {' '}
                                                                →{' '}
                                                                {product.subcategory.name}
                                                            </>
                                                        )}
                                                    </p>
                                                )}

                                                {/* ========================= */}
                                                {/* PRICE */}
                                                {/* ========================= */}

                                                <div className="mt-3">

                                                    {discount > 0 ? (
                                                        <div className="flex flex-wrap items-center gap-2">

                                                            <span className="text-xl font-bold">
                                                                ₹{discountedPrice}
                                                            </span>

                                                            <span className="text-sm text-[var(--nova-muted)] line-through">
                                                                ₹{originalPrice}
                                                            </span>

                                                            <span className="text-sm font-semibold text-green-600">
                                                                {discount}% OFF
                                                            </span>

                                                        </div>
                                                    ) : (
                                                        <span className="text-xl font-bold">
                                                            ₹{originalPrice}
                                                        </span>
                                                    )}

                                                </div>

                                                {/* ========================= */}
                                                {/* VIEW PRODUCT */}
                                                {/* ========================= */}

                                                <Link
                                                    href={`/product/${product._id}`}
                                                    className="mt-4 block"
                                                >
                                                    <Button
                                                        variant="secondary"
                                                        className="w-full"
                                                    >
                                                        <span className="flex items-center justify-center gap-2">
                                                            View Deal

                                                            <ArrowRight
                                                                size={16}
                                                            />
                                                        </span>
                                                    </Button>
                                                </Link>

                                            </div>

                                        </article>
                                    )
                                })}

                            </div>
                        )}

                </Container>
            </main>
        </>
    )
}

export default Deals