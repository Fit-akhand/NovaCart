import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({

    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },

    shippingAddress: {
        fullName: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String
    },

    cart: Array,

    total: Number,

    paymentId: String,

    method: String,

    razorpayOrderId: {
        type: String
    },

    razorpayPaymentId: {
        type: String
    },

    razorpaySignature: {
        type: String
    },

    // Set once stock has been deducted for a paid order.
    // Guards against double deduction when the browser
    // callback and the webhook both finalize the same order.
    stockDeducted: {
        type: Boolean,
        default: false
    },

    // Paid, but stock could not be fully deducted
    // (e.g. item sold out in between). Needs manual review.
    needsReview: {
        type: Boolean,
        default: false
    },

    paymentStatus: {
        type: String,
        enum: [
            'pending',
            'paid',
            'failed'
        ],
        default: 'pending'
    },

    delivered: {
        type: Boolean,
        default: false
    },

    paid: {
        type: Boolean,
        default: false
    },

    dateOfPayment: Date

}, {
    timestamps: true
})

// One DB order per Razorpay order. A partial index is used so
// legacy documents that stored null do not collide.
orderSchema.index(
    { razorpayOrderId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            razorpayOrderId: { $type: 'string' }
        }
    }
)

const Dataset =
    mongoose.models.order ||
    mongoose.model('order', orderSchema)

export default Dataset