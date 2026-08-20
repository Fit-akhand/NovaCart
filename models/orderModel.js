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

const Dataset =
    mongoose.models.order ||
    mongoose.model('order', orderSchema)

export default Dataset