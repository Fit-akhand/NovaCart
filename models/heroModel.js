import mongoose from 'mongoose'

const HeroSchema = new mongoose.Schema(
    {
        // =========================
        // HERO IMAGE
        // =========================

        image: {
            type: String,
            required: true,
            trim: true
        },

        // =========================
        // HERO CONTENT
        // =========================

        title: {
            type: String,
            default: '',
            trim: true
        },

        subtitle: {
            type: String,
            default: '',
            trim: true
        },

        // =========================
        // BUTTON
        // =========================

        buttonText: {
            type: String,
            default: 'Shop Now',
            trim: true
        },

        buttonLink: {
            type: String,
            default: '/products',
            trim: true
        },

        // =========================
        // STATUS
        // =========================

        isActive: {
            type: Boolean,
            default: true,
            index: true
        },

        // =========================
        // DISPLAY ORDER
        // =========================

        order: {
            type: Number,
            default: 0,
            index: true
        }
    },
    {
        timestamps: true
    }
)

const Hero =
    mongoose.models.heroes ||
    mongoose.model('heroes', HeroSchema)

export default Hero