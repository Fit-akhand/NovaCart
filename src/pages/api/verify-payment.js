import crypto from 'crypto'
import connectDB from '../../../utils/connectDB'
import auth from '../../../middleware/auth'

connectDB()

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
                    'Only customers can verify payments.'
            })
        }

        // ==========================================
        // PAYMENT DATA
        // ==========================================

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                err:
                    'Missing payment verification fields.'
            })
        }

        // ==========================================
        // GENERATE SIGNATURE
        // ==========================================

        const body =
            `${razorpay_order_id}|${razorpay_payment_id}`

        const expectedSignature =
            crypto
                .createHmac(
                    'sha256',
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(body)
                .digest('hex')

        // ==========================================
        // TIMING-SAFE COMPARISON
        // ==========================================

        const receivedBuffer =
            Buffer.from(
                razorpay_signature,
                'utf8'
            )

        const expectedBuffer =
            Buffer.from(
                expectedSignature,
                'utf8'
            )

        if (
            receivedBuffer.length !==
            expectedBuffer.length
        ) {
            return res.status(400).json({
                err:
                    'Payment signature verification failed.'
            })
        }

        const isValid =
            crypto.timingSafeEqual(
                receivedBuffer,
                expectedBuffer
            )

        if (!isValid) {
            return res.status(400).json({
                err:
                    'Payment signature verification failed.'
            })
        }

        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({
            status: 'success',
            msg:
                'Payment signature verified successfully.',
            payment: {
                razorpay_order_id,
                razorpay_payment_id
            }
        })

    } catch (err) {

        console.error(
            'Razorpay verification error:',
            err
        )

        return res.status(500).json({
            err:
                'Unable to verify payment.'
        })
    }
}