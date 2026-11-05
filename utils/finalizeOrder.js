import Orders from '../models/orderModel'
import Products from '../models/productModel'

// Idempotently marks a pending order as paid and deducts stock.
// Safe to call from both the browser callback (verify-payment) and
// the Razorpay webhook: only the first caller wins the paid:false
// -> paid:true transition, so stock is deducted exactly once.
export async function finalizeOrder(orderId, { paymentId, signature }) {
    const order = await Orders.findOneAndUpdate(
        { _id: orderId, paid: false },
        {
            paid: true,
            paymentStatus: 'paid',
            dateOfPayment: new Date(),
            paymentId,
            razorpayPaymentId: paymentId,
            ...(signature ? { razorpaySignature: signature } : {})
        },
        { new: true }
    )

    // Already finalized by another request.
    if (!order) return Orders.findById(orderId)

    const done = []
    let shortage = false

    for (const item of order.cart) {
        const updated = await Products.findOneAndUpdate(
            { _id: item._id, inStock: { $gte: item.quantity } },
            { $inc: { inStock: -item.quantity, sold: item.quantity } }
        )

        if (!updated) {
            shortage = true
            continue
        }
        done.push(item)
    }

    // Payment is already captured, so we keep the order and flag it
    // for manual follow-up (restock or refund) instead of losing it.
    order.stockDeducted = !shortage
    order.needsReview = shortage
    await order.save()

    if (shortage) {
        console.error(
            `Order ${order._id} paid but stock short for some items.`
        )
    }

    return order
}
