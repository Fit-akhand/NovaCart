import connectDB from '../../../../utils/connectDB'
import Users from '../../../../models/userModel'
import Products from '../../../../models/productModel'
import Orders from '../../../../models/orderModel'
import auth from '../../../../middleware/auth'
import { toSafeUser } from '../../../../utils/safeUser'

connectDB()

export default async (req, res) => {
    switch (req.method) {
        case 'PATCH':
            return uploadInfor(req, res)

        case 'GET':
            return getUsers(req, res)

        default:
            return res.status(405).json({
                err: 'Method not allowed.'
            })
    }
}

const getUsers = async (req, res) => {
    try {
        const result = await auth(req, res)
        if (!result) return

        // SUPER ADMIN → can see everyone
        if (result.role === 'admin' && result.root === true) {
            const users = await Users.find()
                .select('-password')

            return res.json({ users })
        }

        // SELLER → only customers who purchased seller products
        if (result.role === 'seller') {

            const sellerProducts = await Products.find({
                seller: result.id
            }).select('_id')

            const productIds = sellerProducts.map(product =>
                product._id.toString()
            )

            if (productIds.length === 0) {
                return res.json({ users: [] })
            }

            const orders = await Orders.find({
                'cart._id': {
                    $in: productIds
                }
            }).select('user')

            const customerIds = [
                ...new Set(
                    orders
                        .map(order => order.user?.toString())
                        .filter(Boolean)
                )
            ]

            if (customerIds.length === 0) {
                return res.json({ users: [] })
            }

            const users = await Users.find({
                _id: { $in: customerIds }
            }).select('-password')

            return res.json({ users })
        }

        return res.status(403).json({
            err: 'You are not allowed to view users.'
        })

    } catch (err) {
        return res.status(500).json({
            err: err.message
        })
    }
}

const uploadInfor = async (req, res) => {
    try {
        const result = await auth(req, res)
        if (!result) return

        const {
            name,
            avatar,
            phone,
            address,
            city,
            state,
            pincode
        } = req.body

        const updates = {}

        if (typeof name === 'string' && name.trim()) {
            updates.name = name.trim()
        }

        if (typeof avatar === 'string' && avatar) {
            updates.avatar = avatar
        }

        if (typeof phone === 'string') {
            updates.phone = phone.trim()
        }

        if (typeof address === 'string') {
            updates.address = address.trim()
        }

        if (typeof city === 'string') {
            updates.city = city.trim()
        }

        if (typeof state === 'string') {
            updates.state = state.trim()
        }

        if (typeof pincode === 'string') {
            updates.pincode = pincode.trim()
        }

        const newUser = await Users.findOneAndUpdate(
            { _id: result.id },
            updates,
            { new: true }
        ).select('-password')

        res.json({
            msg: 'Update Success!',
            user: toSafeUser(newUser)
        })

    } catch (err) {
        return res.status(500).json({
            err: err.message
        })
    }
}