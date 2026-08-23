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

        /*
         * SELLER OWNERSHIP
         *
         * For seller-created products:
         * seller = seller's user ID
         *
         * For Super Admin-created products:
         * seller = null
         */
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            default: null
        },

        /*
         * PRODUCT OWNER TYPE
         *
         * seller -> created/owned by a seller
         * admin  -> created/owned by Super Admin
         */
        ownerType: {
            type: String,
            enum: ['seller', 'admin'],
            default: 'seller',
            required: true
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