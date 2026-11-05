import Razorpay from 'razorpay'
import connectDB from '../../../utils/connectDB'
import Products from '../../../models/productModel'
import Orders from '../../../models/orderModel'
import auth from '../../../middleware/auth'
import {
    getProductDiscount,
    getDiscountedPrice
} from '../../../utils/getProductDiscount'

connectDB()

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

export default async function handler(req, res) {
    if (req.method !== 'POST') {
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

        if (result.role !== 'user') {
            return res.status(403).json({
                err:
                    'Only customers can make payments.'
            })
        }

        // ==========================================
        // REQUEST
        // ==========================================

        const { cart, shippingAddress } = req.body

        if (
            !shippingAddress ||
            !shippingAddress.fullName ||
            !shippingAddress.phone ||
            !shippingAddress.address ||
            !shippingAddress.city ||
            !shippingAddress.state ||
            !shippingAddress.pincode
        ) {
            return res.status(400).json({
                err: 'Please provide complete delivery information.'
            })
        }

        if (!/^[6-9]\d{9}$/.test(String(shippingAddress.phone).trim())) {
            return res.status(400).json({
                err: 'Please provide a valid mobile number.'
            })
        }

        if (!/^\d{6}$/.test(String(shippingAddress.pincode).trim())) {
            return res.status(400).json({
                err: 'Please provide a valid PIN code.'
            })
        }

        if (
            !Array.isArray(cart) ||
            cart.length === 0
        ) {
            return res.status(400).json({
                err: 'Your cart is empty.'
            })
        }

        // ==========================================
        // SERVER-SIDE PRICE VALIDATION
        // ==========================================

        const productIds = cart
            .map(item => item?._id)
            .filter(Boolean)

        if (productIds.length !== cart.length) {
            return res.status(400).json({
                err: 'Invalid cart items.'
            })
        }

        const products =
        await Products.find({
            _id: {
                $in: productIds
            }
        })
            .populate('category')
            .populate('subcategory')

        if (
            products.length !==
            cart.length
        ) {
            return res.status(400).json({
                err:
                    'One or more products are no longer available.'
            })
        }

        let total = 0
        const verifiedCart = []

        for (const cartItem of cart) {
            const product =
                products.find(
                    item =>
                        String(item._id) ===
                        String(cartItem._id)
                )

            if (!product) {
                return res.status(400).json({
                    err:
                        'Product not found.'
                })
            }

            const quantity =
                Number(cartItem.quantity)

            if (
                !Number.isInteger(quantity) ||
                quantity < 1
            ) {
                return res.status(400).json({
                    err:
                        'Invalid product quantity.'
                })
            }

            if (
                quantity >
                Number(product.inStock)
            ) {
                return res.status(400).json({
                    err:
                        `${product.title} does not have enough stock.`
                })
            }

            /*
             * IMPORTANT:
             * Never trust price from browser.
             *
             * The price comes from MongoDB.
             */
            const originalPrice =
                Number(product.price) || 0

            const discountedPrice =
                getDiscountedPrice(
                    originalPrice,
                    getProductDiscount(product)
                )

            total += discountedPrice * quantity

            verifiedCart.push({
                _id: product._id,
                title: product.title,
                price: discountedPrice,
                images: product.images,
                inStock: Number(product.inStock),
                sold: Number(product.sold) || 0,
                quantity
            })
        }

        // ==========================================
        // RUPEES → PAISE
        // ==========================================

        const amount =
            Math.round(total * 100)

        if (amount < 100) {
            return res.status(400).json({
                err:
                    'Minimum payment amount is ₹1.'
            })
        }

        // ==========================================
        // RAZORPAY ORDER
        // ==========================================

        const receipt =
            `NC_${Date.now()}_${String(
                result.id
            ).slice(-6)}`

        const razorpayOrder =
            await razorpay.orders.create({
                amount,
                currency: 'INR',
                receipt,
                notes: {
                    userId:
                        String(result.id)
                }
            })

        // ==========================================
        // PENDING DB ORDER
        //
        // Cart, address and total are stored now, from
        // server-verified data, so verify-payment and the
        // webhook can finalize it without trusting the browser.
        // Stock is deducted only once payment is confirmed.
        // ==========================================

        const str = v => String(v).trim()

        const pendingOrder = await Orders.create({
            user: result.id,
            shippingAddress: {
                fullName: str(shippingAddress.fullName),
                phone: str(shippingAddress.phone),
                address: str(shippingAddress.address),
                city: str(shippingAddress.city),
                state: str(shippingAddress.state),
                pincode: str(shippingAddress.pincode)
            },
            cart: verifiedCart,
            total,
            method: 'razorpay',
            razorpayOrderId: razorpayOrder.id,
            paid: false,
            paymentStatus: 'pending'
        })

        return res.status(200).json({
            status: 'success',

            orderId: pendingOrder._id,

            order_id:
                razorpayOrder.id,

            amount:
                razorpayOrder.amount,

            currency:
                razorpayOrder.currency,

            total
        })

    } catch (err) {

        console.error(
            'Razorpay create order error:',
            err
        )

        return res.status(500).json({
            err:
                'Unable to create payment order.'
        })
    }
}