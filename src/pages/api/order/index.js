import connectDB from '../../../../utils/connectDB'
import Orders from '../../../../models/orderModel'
import Products from '../../../../models/productModel'
import auth from '../../../../middleware/auth'
import {
    getProductDiscount,
    getDiscountedPrice
} from '../../../../utils/getProductDiscount'

connectDB()
// ============================================================
// MAIN API HANDLER
// ============================================================

export default async (req, res) => {
    switch (req.method) {

        // Orders are created server-side by /api/create-order and
        // marked paid only by /api/verify-payment or the Razorpay
        // webhook. Clients can never create or flag an order paid.
        case 'POST':
            return res.status(410).json({
                err: 'Orders are created through checkout only.'
            })

        case 'GET':
            await getOrders(req, res)
            break

        default:
            return res.status(405).json({
                err: 'Method not allowed.'
            })
    }
}


// ============================================================
// GET ORDERS
// ============================================================

const getOrders = async (req, res) => {

    try {

        const result = await auth(req, res)

        if (!result) return


        // ====================================================
        // CUSTOMER
        // ====================================================

        if (result.role === 'user') {

            const orders =
                await Orders.find({
                    user: result.id
                })
                .populate(
                    'user',
                    '-password'
                )
                .sort('-createdAt')

            return res.json({
                orders
            })
        }


        // ====================================================
        // SELLER
        // ====================================================

        if (result.role === 'seller') {

            const sellerProducts =
                await Products.find({
                    seller: result.id
                })
                .select('_id')


            const sellerProductIds =
                new Set(
                    sellerProducts.map(
                        product =>
                            product._id.toString()
                    )
                )


            const allOrders =
                await Orders.find()
                    .populate(
                        'user',
                        '-password'
                    )
                    .sort('-createdAt')


            const sellerOrders =
                allOrders
                    .filter(order => {

                        if (
                            !Array.isArray(
                                order.cart
                            )
                        ) {
                            return false
                        }

                        return order.cart.some(
                            item => {

                                if (!item?._id) {
                                    return false
                                }

                                return sellerProductIds.has(
                                    item._id.toString()
                                )
                            }
                        )
                    })
                    .map(order => {

                        const sellerItems =
                            order.cart.filter(
                                item =>
                                    item?._id &&
                                    sellerProductIds.has(
                                        item._id.toString()
                                    )
                            )


                        return {
                            ...order.toObject(),

                            cart:
                                sellerItems
                        }
                    })


            return res.json({
                orders:
                    sellerOrders
            })
        }


        // ====================================================
        // SUPER ADMIN / ADMIN
        // ====================================================

        if (result.role === 'admin') {

            const orders =
                await Orders.find()
                    .populate(
                        'user',
                        '-password'
                    )
                    .sort('-createdAt')


            return res.json({
                orders
            })
        }


        return res.status(403).json({
            err:
                'Authentication is not valid.'
        })

    } catch (err) {

        return res.status(500).json({
            err:
                err.message
        })
    }
}
