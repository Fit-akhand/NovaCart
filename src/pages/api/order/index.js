import connectDB from '../../../../utils/connectDB'
import Orders from '../../../../models/orderModel'
import Products from '../../../../models/productModel'
import auth from '../../../../middleware/auth'

connectDB()
// ============================================================
// MAIN API HANDLER
// ============================================================

export default async (req, res) => {
    switch (req.method) {

        case 'POST':
            await createOrder(req, res)
            break

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


// ============================================================
// CREATE ORDER
// ============================================================

const createOrder = async (req, res) => {

    try {

        const result =
            await auth(req, res)

        if (!result) return


        // ====================================================
        // ONLY CUSTOMER CAN CREATE ORDER
        // ====================================================

        if (
            result.role !== 'user'
        ) {

            return res.status(403).json({
                err:
                    'Only customers can create orders.'
            })
        }


        // ====================================================
        // REQUEST DATA
        // ====================================================

        const {
            shippingAddress,
            cart
        } = req.body


        // ====================================================
        // VALIDATE SHIPPING ADDRESS
        // ====================================================

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
                err:
                    'Please provide complete delivery information.'
            })
        }


        // ====================================================
        // VALIDATE CART
        // ====================================================

        if (
            !Array.isArray(cart) ||
            cart.length === 0
        ) {

            return res.status(400).json({
                err:
                    'Your cart is empty.'
            })
        }


        // ====================================================
        // VALIDATE PHONE
        // ====================================================

        if (
            !/^[6-9]\d{9}$/.test(
                String(
                    shippingAddress.phone
                ).trim()
            )
        ) {

            return res.status(400).json({
                err:
                    'Please provide a valid mobile number.'
            })
        }


        // ====================================================
        // VALIDATE PINCODE
        // ====================================================

        if (
            !/^\d{6}$/.test(
                String(
                    shippingAddress.pincode
                ).trim()
            )
        ) {

            return res.status(400).json({
                err:
                    'Please provide a valid PIN code.'
            })
        }


        // ====================================================
        // SERVER-SIDE PRICE + STOCK VALIDATION
        // ====================================================

        let serverTotal = 0

        const verifiedCart = []


        for (
            const item of cart
        ) {

            // ------------------------------------------------
            // VALIDATE PRODUCT ID
            // ------------------------------------------------

            if (!item?._id) {

                return res.status(400).json({
                    err:
                        'Invalid product in cart.'
                })
            }


            // ------------------------------------------------
            // VALIDATE QUANTITY
            // ------------------------------------------------

            const quantity =
                Number(item.quantity)


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                return res.status(400).json({
                    err:
                        'Invalid product quantity.'
                })
            }


            // ------------------------------------------------
            // GET CURRENT PRODUCT
            // ------------------------------------------------

            const product =
                await Products.findById(
                    item._id
                )


            if (!product) {

                return res.status(404).json({
                    err:
                        'One of the products in your cart no longer exists.'
                })
            }


            // ------------------------------------------------
            // STOCK CHECK
            // ------------------------------------------------

            if (
                Number(product.inStock) <
                quantity
            ) {

                return res.status(400).json({
                    err:
                        `${product.title} does not have enough stock.`
                })
            }


            // ------------------------------------------------
            // SERVER PRICE
            // ------------------------------------------------

            const price =
                Number(product.price)


            if (
                !Number.isFinite(price) ||
                price < 0
            ) {

                return res.status(400).json({
                    err:
                        `Invalid price for ${product.title}.`
                })
            }


            // ------------------------------------------------
            // CALCULATE ITEM TOTAL
            // ------------------------------------------------

            const itemTotal =
                price * quantity


            serverTotal +=
                itemTotal


            // ------------------------------------------------
            // STORE VERIFIED CART ITEM
            // ------------------------------------------------

            verifiedCart.push({

                _id:
                    product._id,

                title:
                    product.title,

                price:
                    price,

                images:
                    product.images,

                inStock:
                    Number(product.inStock),

                sold:
                    Number(product.sold) || 0,

                quantity:
                    quantity

            })
        }


        // ====================================================
        // CREATE ORDER
        // ====================================================

        const newOrder =
            new Orders({

                user:
                    result.id,

                shippingAddress: {

                    fullName:
                        String(
                            shippingAddress.fullName
                        ).trim(),

                    phone:
                        String(
                            shippingAddress.phone
                        ).trim(),

                    address:
                        String(
                            shippingAddress.address
                        ).trim(),

                    city:
                        String(
                            shippingAddress.city
                        ).trim(),

                    state:
                        String(
                            shippingAddress.state
                        ).trim(),

                    pincode:
                        String(
                            shippingAddress.pincode
                        ).trim()

                },

                cart:
                    verifiedCart,

                total:
                    serverTotal

            })


        // ====================================================
        // UPDATE STOCK
        // ====================================================

        for (
            const item of verifiedCart
        ) {

            await sold(
                item._id,
                item.quantity,
                item.inStock,
                item.sold
            )
        }


        // ====================================================
        // SAVE ORDER
        // ====================================================

        await newOrder.save()


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.json({

            msg:
                'Order success! We will contact you to confirm the order.',

            newOrder

        })

    } catch (err) {

        console.error(
            'CREATE ORDER ERROR:',
            err
        )

        return res.status(500).json({
            err:
                err.message
        })
    }
}


// ============================================================
// UPDATE STOCK
// ============================================================

const sold = async (
    id,
    quantity,
    oldInStock,
    oldSold
) => {

    await Products.findOneAndUpdate(
        {
            _id:
                id
        },
        {
            inStock:
                Number(oldInStock) -
                Number(quantity),

            sold:
                Number(quantity) +
                Number(oldSold)
        }
    )
}