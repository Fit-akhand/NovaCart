import connectDB from '../../../../../utils/connectDB'
import Orders from '../../../../../models/orderModel'
import auth from '../../../../../middleware/auth'

connectDB()

export default async (req, res) => {
    switch(req.method){
        case "PATCH":
            await paymentOrder(req, res)
            break;
        default:
            return res.status(405).json({ err: 'Method not allowed.' })
    }
}

const paymentOrder = async(req, res) => {
    try {
        const result = await auth(req, res)
        if (!result) return
        
        if(result.role === 'user'){
            const {id} = req.query
            const { paymentId } = req.body
    
            await Orders.findOneAndUpdate({_id: id}, {
                paid: true, dateOfPayment: new Date().toISOString(), paymentId,
                method: 'Paypal'
            })
    
            res.json({msg: 'Payment success!'})
        } else {
            return res.status(400).json({err: 'Authentication is not valid.'})
        }
        
    } catch (err) {
        return res.status(500).json({err: 'Something went wrong.'})
    }
}
