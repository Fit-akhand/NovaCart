import mongoose from 'mongoose'

const CategoriesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        image: {
            type: String,
            default: ''
        },

        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'categories',
            default: null,
            index: true
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true
        },

        // =========================
        // DISCOUNT
        // =========================

        discountPercent: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        discountActive: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

// Root categories must have unique slugs
CategoriesSchema.index(
    { slug: 1 },
    {
        unique: true,
        partialFilterExpression: {
            parentCategory: null
        }
    }
)

// Subcategories can have the same name under different parents
CategoriesSchema.index(
    { parentCategory: 1, slug: 1 },
    {
        unique: true,
        partialFilterExpression: {
            parentCategory: { $type: 'objectId' }
        }
    }
)

const Dataset =
    mongoose.models.categories ||
    mongoose.model('categories', CategoriesSchema)

export default Dataset