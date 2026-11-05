// Legacy PayPal endpoint. It let any logged-in customer mark any
// order as paid without proof of payment, so it is disabled.
// Payment is now confirmed only by /api/verify-payment and the
// Razorpay webhook (/api/razorpay-webhook).
export default function handler(req, res) {
    return res.status(410).json({
        err: 'This endpoint has been removed.'
    })
}
