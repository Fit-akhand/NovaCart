import connectDB from '../../../../utils/connectDB'
import Products from '../../../../models/productModel'
import Orders from '../../../../models/orderModel'
import auth from '../../../../middleware/auth'

connectDB()

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            err: 'Method not allowed.'
        })
    }

    try {
        // ==========================================
        // AUTHENTICATION
        // ==========================================

        const result = await auth(req, res)

        if (!result) return

        if (result.role !== 'seller') {
            return res.status(403).json({
                err: 'Seller access required.'
            })
        }

        const sellerId = result.id

        // ==========================================
        // GET ONLY THIS SELLER'S PRODUCTS
        // ==========================================

        const products = await Products.find({
            seller: sellerId
        }).sort('-createdAt')

        const productIds = products.map(
            product => product._id.toString()
        )

        // ==========================================
        // NO PRODUCTS
        // ==========================================

        if (productIds.length === 0) {
            return res.status(200).json({
                stats: {
                    products: 0,
                    orders: 0,
                    customers: 0,
                    revenue: 0,
                    inventory: 0,
                    unitsSold: 0
                },

                recentOrders: [],

                lowStock: [],

                products: []
            })
        }

        // ==========================================
        // GET ORDERS
        // ==========================================

        const allOrders = await Orders.find()
            .populate('user', '-password')
            .sort('-createdAt')

        // ==========================================
        // FIND ORDERS CONTAINING SELLER PRODUCTS
        // ==========================================

        const sellerOrders = allOrders.filter(order => {

            if (!Array.isArray(order.cart)) {
                return false
            }

            return order.cart.some(item => {

                if (!item) {
                    return false
                }

                /*
                 * IMPORTANT:
                 *
                 * This assumes item._id contains
                 * the original product ID.
                 *
                 * If your Order model stores the
                 * product ID under another field such
                 * as item.product, change this section.
                 */

                if (!item._id) {
                    return false
                }

                return productIds.includes(
                    item._id.toString()
                )
            })
        })

        // ==========================================
        // REVENUE
        // ==========================================

        let revenue = 0

        sellerOrders.forEach(order => {

            // Only paid orders count as revenue
            if (order.paid !== true) {
                return
            }

            if (!Array.isArray(order.cart)) {
                return
            }

            order.cart.forEach(item => {

                if (!item?._id) {
                    return
                }

                const productId =
                    item._id.toString()

                if (!productIds.includes(productId)) {
                    return
                }

                const quantity =
                    Number(item.quantity) || 0

                const price =
                    Number(item.price) || 0

                revenue +=
                    price * quantity
            })
        })

        // ==========================================
        // CUSTOMERS
        // ==========================================

        const customerIds = new Set()

        sellerOrders.forEach(order => {

            if (order.user?._id) {
                customerIds.add(
                    order.user._id.toString()
                )
            }
        })

        // ==========================================
        // INVENTORY
        // ==========================================

        const inventory = products.reduce(
            (sum, product) => {
                return (
                    sum +
                    (Number(product.inStock) || 0)
                )
            },
            0
        )

        // ==========================================
        // UNITS SOLD
        // ==========================================

        let unitsSold = 0

        sellerOrders.forEach(order => {

            if (order.paid !== true) {
                return
            }

            if (!Array.isArray(order.cart)) {
                return
            }

            order.cart.forEach(item => {

                if (!item?._id) {
                    return
                }

                const productId =
                    item._id.toString()

                if (!productIds.includes(productId)) {
                    return
                }

                unitsSold +=
                    Number(item.quantity) || 0
            })
        })

        // ==========================================
        // RECENT SELLER ORDERS
        // ==========================================

        const recentOrders = sellerOrders
            .slice(0, 8)
            .map(order => {

                const sellerItems =
                    Array.isArray(order.cart)
                        ? order.cart.filter(item => {

                            if (!item?._id) {
                                return false
                            }

                            return productIds.includes(
                                item._id.toString()
                            )
                        })
                        : []

                const sellerTotal =
                    sellerItems.reduce(
                        (sum, item) => {

                            const price =
                                Number(item.price) || 0

                            const quantity =
                                Number(item.quantity) || 0

                            return (
                                sum +
                                price * quantity
                            )
                        },
                        0
                    )

                return {
                    _id: order._id,
                    user: order.user,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt,
                    paid: order.paid,
                    delivered: order.delivered,
                    method: order.method,
                    sellerTotal,
                    items: sellerItems
                }
            })

        // ==========================================
        // LOW STOCK
        // ==========================================

        const lowStock = products
            .filter(product => {
                return (
                    Number(product.inStock) <= 5
                )
            })
            .slice(0, 6)

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({

            stats: {
                products: products.length,

                orders: sellerOrders.length,

                customers: customerIds.size,

                revenue,

                inventory,

                unitsSold
            },

            recentOrders,

            lowStock,

            products: products.slice(0, 8)
        })

    } catch (err) {

        console.error(
            'Seller dashboard error:',
            err
        )

        return res.status(500).json({
            err:
                err.message ||
                'Unable to load seller dashboard.'
        })
    }
}