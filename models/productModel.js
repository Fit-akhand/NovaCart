import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    price: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    },

    images: {
        type: Array,
        required: true
    },

    // Existing parent category
    category: {
        type: String,
        required: true
    },

    // New subcategory
    subcategory: {
        type: String,
        default: null
    },

    // Seller who owns this product
    // OPTIONAL FOR NOW because existing products don't have this field.
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null,
        index: true
    },

    checked: {
        type: Boolean,
        default: false
    },

    inStock: {
        type: Number,
        default: 0
    },

    sold: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
})

let Dataset =
    mongoose.models.product ||
    mongoose.model('product', productSchema)

export default Dataset