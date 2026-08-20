import connectDB from '../../../../utils/connectDB'
import Users from '../../../../models/userModel'
import Products from '../../../../models/productModel'
import Orders from '../../../../models/orderModel'
import Categories from '../../../../models/categoriesModel'
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

        // Only admin can access this dashboard
        if (result.role !== 'admin') {
            return res.status(403).json({
                err: 'Admin access required.'
            })
        }

        // ==========================================
        // USERS
        // ==========================================

        const sellerCount = await Users.countDocuments({
            role: 'seller'
        })

        const customerCount = await Users.countDocuments({
            role: 'user'
        })

        // ==========================================
        // PRODUCTS
        // ==========================================

        const productCount = await Products.countDocuments()

        // ==========================================
        // CATEGORIES
        // ==========================================

        const categoryCount = await Categories.countDocuments({
            parentCategory: null,
            isActive: true
        })

        // ==========================================
        // ORDERS
        // ==========================================

        const orderCount = await Orders.countDocuments()

        // ==========================================
        // REVENUE
        // ==========================================

        const paidOrders = await Orders.find({
            paid: true
        }).select('total')

        const revenue = paidOrders.reduce(
            (total, order) =>
                total + (Number(order.total) || 0),
            0
        )

        // ==========================================
        // RECENT ORDERS
        // ==========================================

        const recentOrders = await Orders.find()
            .populate('user', '-password')
            .sort('-createdAt')
            .limit(8)

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({
            stats: {
                sellers: sellerCount,
                customers: customerCount,
                products: productCount,
                orders: orderCount,
                categories: categoryCount,
                revenue
            },

            recentOrders
        })

    } catch (err) {

        console.error(
            'Super Admin dashboard error:',
            err
        )

        return res.status(500).json({
            err: err.message
        })
    }
}