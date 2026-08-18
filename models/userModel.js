import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['user', 'seller', 'admin'],
        default: 'user'
    },

    root: {
        type: Boolean,
        default: false
    },

    avatar: {
        type: String,
        default:
            'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png'
    },

    address: {
        type: String,
        default: ''
    },

    city: {
        type: String,
        default: ''
    },

    state: {
        type: String,
        default: ''
    },

    pincode: {
        type: String,
        default: ''
    },

    phone: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
})

let Dataset =
    mongoose.models.user ||
    mongoose.model('user', userSchema)

export default Dataset