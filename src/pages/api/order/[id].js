import connectDB from '../../../../utils/connectDB'
import Orders from '../../../../models/orderModel'
import Products from '../../../../models/productModel'
import auth, {
    isSeller,
    isSuperAdmin
} from '../../../../middleware/auth'

connectDB()

export default async (req, res) => {
    switch (req.method) {
        case 'GET':
            return getOrder(req, res)

        default:
            return res.status(405).json({
                err: 'Method not allowed.'
            })
    }
}

const getOrder = async (req, res) => {
    try {
        const result = await auth(req, res)
        if (!result) return

        const { id } = req.query

        const order = await Orders
            .findById(id)
            .populate('user', '-password')

        if (!order) {
            return res.status(404).json({
                err: 'This order does not exist.'
            })
        }

        // Customer can only see their own order
        if (
            result.role === 'user' &&
            order.user._id.toString() !== result.id.toString()
        ) {
            return res.status(403).json({
                err: 'You are not allowed to view this order.'
            })
        }

        // Seller can only see an order containing their products
        if (isSeller(result)) {
            const cart = order.cart || []

            const productIds = cart.map((item) => item._id)

            const sellerProducts = await Products.find({
                _id: { $in: productIds },
                seller: result.id
            }).select('_id')

            const sellerProductIds = new Set(
                sellerProducts.map((product) =>
                    product._id.toString()
                )
            )

            const sellerItems = cart.filter((item) =>
                sellerProductIds.has(item._id.toString())
            )

            if (sellerItems.length === 0) {
                return res.status(403).json({
                    err: 'This order does not contain your products.'
                })
            }

            return res.json({
                order: {
                    ...order.toObject(),
                    cart: sellerItems
                }
            })
        }

        // Super Admin can see everything
        if (isSuperAdmin(result)) {
            return res.json({
                order
            })
        }

        // Customer
        return res.json({
            order
        })

    } catch (err) {
        return res.status(500).json({
            err: err.message
        })
    }
}