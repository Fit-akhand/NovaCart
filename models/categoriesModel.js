import mongoose from 'mongoose'

const CategoriesSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
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
    }

}, {
    timestamps: true
})

let Dataset =
    mongoose.models.categories ||
    mongoose.model('categories', CategoriesSchema)

export default Dataset