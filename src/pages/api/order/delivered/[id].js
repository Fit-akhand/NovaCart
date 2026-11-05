import connectDB from '../../../../../utils/connectDB'
import Orders from '../../../../../models/orderModel'
import auth, {
    isSuperAdmin
} from '../../../../../middleware/auth'

connectDB()

export default async (req, res) => {
    switch(req.method){
        case "PATCH":
            await deliveredOrder(req, res)
            break;
        default:
            return res.status(405).json({ err: 'Method not allowed.' })
    }
}

const deliveredOrder = async(req, res) => {
    try {
        const result = await auth(req, res)
        if (!result) return

        // Only the Super Admin may mark orders delivered.
        // Unauthenticated users are rejected with 401 by
        // auth(); authenticated non-super-admins get 403.
        if (!isSuperAdmin(result)) {
            return res.status(403).json({
                err: 'Only the Super Admin can update delivery status.'
            })
        }

        const {id} = req.query

        const order = await Orders.findById(id)

        if (!order) {
            return res.status(404).json({
                err: 'This order does not exist.'
            })
        }

        if(order.paid){
            await Orders.findOneAndUpdate({_id: id}, {delivered: true})

            res.json({
                msg: 'Updated success!',
                result: {
                    paid: true,
                    dateOfPayment: order.dateOfPayment,
                    method: order.method,
                    delivered: true
                }
            })
        }else{
            await Orders.findOneAndUpdate({_id: id}, {
                paid: true, dateOfPayment: new Date().toISOString(),
                method: 'Receive Cash', delivered: true
            })

            res.json({
                msg: 'Updated success!',
                result: {
                    paid: true,
                    dateOfPayment: new Date().toISOString(),
                    method: 'Receive Cash',
                    delivered: true
                }
            })
        }

    } catch (err) {
        return res.status(500).json({err: 'Something went wrong.'})
    }
}
