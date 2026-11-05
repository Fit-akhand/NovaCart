import crypto from 'crypto'
import connectDB from '../../../utils/connectDB'
import Orders from '../../../models/orderModel'
import { finalizeOrder } from '../../../utils/finalizeOrder'

connectDB()

// Raw body is required to verify Razorpay's signature.
export const config = {
    api: { bodyParser: false }
}

const readRawBody = req =>
    new Promise((resolve, reject) => {
        const chunks = []
        req.on('data', c => chunks.push(c))
        req.on('end', () => resolve(Buffer.concat(chunks)))
        req.on('error', reject)
    })

// Backup path for the browser callback: if the customer closes the
// tab after paying, Razorpay still notifies us and the order is
// confirmed. Configure in the Razorpay dashboard with events
// payment.captured and order.paid.
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ err: 'Method not allowed.' })
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) {
        console.error('RAZORPAY_WEBHOOK_SECRET is not set.')
        return res.status(500).json({ err: 'Webhook not configured.' })
    }

    try {
        const raw = await readRawBody(req)
        const signature = String(req.headers['x-razorpay-signature'] || '')

        const expected = crypto
            .createHmac('sha256', secret)
            .update(raw)
            .digest('hex')

        const a = Buffer.from(signature, 'utf8')
        const b = Buffer.from(expected, 'utf8')

        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
            return res.status(400).json({ err: 'Invalid signature.' })
        }

        const event = JSON.parse(raw.toString('utf8'))

        if (
            event.event === 'payment.captured' ||
            event.event === 'order.paid'
        ) {
            const payment = event.payload?.payment?.entity
            const razorpayOrderId =
                payment?.order_id || event.payload?.order?.entity?.id

            if (razorpayOrderId && payment?.id) {
                const order = await Orders.findOne({ razorpayOrderId })

                // Only confirm when the captured amount matches the
                // server-computed total.
                if (
                    order &&
                    Math.round(order.total * 100) === Number(payment.amount)
                ) {
                    await finalizeOrder(order._id, { paymentId: payment.id })
                }
            }
        }

        // Always 200 for verified events so Razorpay stops retrying.
        return res.status(200).json({ status: 'ok' })
    } catch (err) {
        console.error('Razorpay webhook error:', err)
        return res.status(500).json({ err: 'Webhook failed.' })
    }
}
