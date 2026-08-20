import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        inStock: {
            type: Number,
            required: true
        },

        sold: {
            type: Number,
            default: 0
        },

        description: {
            type: String,
            required: true
        },

        content: {
            type: String,
            required: true
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'categories',
            required: true
        },

        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'categories',
            default: null
        },

        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            default: null
        },

        images: [
            {
                public_id: {
                    type: String,
                    required: true
                },

                url: {
                    type: String,
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
)

const Product =
    mongoose.models.product ||
    mongoose.model('product', productSchema)

export default Product