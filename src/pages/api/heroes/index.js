import connectDB from '../../../../utils/connectDB'
import Hero from '../../../../models/heroModel'
import auth, { isSuperAdmin } from '../../../../middleware/auth'

connectDB()

// ==========================================
// MAIN HANDLER
// ==========================================

export default async (req, res) => {

    switch (req.method) {

        case 'GET':
            return getHeroes(req, res)

        case 'POST':
            return createHero(req, res)

        default:
            return res.status(405).json({
                err: 'Method not allowed.'
            })
    }
}

// ==========================================
// GET HEROES
// ==========================================

const getHeroes = async (req, res) => {

    try {

        const heroes = await Hero.find()
            .sort({
                order: 1,
                createdAt: 1
            })

        return res.json({
            heroes
        })

    } catch (err) {

        console.error(
            'Get heroes error:',
            err
        )

        return res.status(500).json({
            err: 'Failed to load hero images.'
        })
    }
}

// ==========================================
// CREATE HERO
// ==========================================

const createHero = async (req, res) => {

    try {

        const result = await auth(req, res)

        if (!result) return

        if (!isSuperAdmin(result)) {

            return res.status(403).json({
                err:
                    'Only the Super Admin can manage hero images.'
            })
        }

        const {
            image,
            title,
            subtitle,
            buttonText,
            buttonLink,
            isActive,
            order
        } = req.body

        // ======================================
        // IMAGE VALIDATION
        // ======================================

        if (
            typeof image !== 'string' ||
            !image.trim()
        ) {

            return res.status(400).json({
                err:
                    'Hero image is required.'
            })
        }

        // ======================================
        // CREATE HERO
        // ======================================

        const newHero = new Hero({

            image: image.trim(),

            title:
                typeof title === 'string'
                    ? title.trim()
                    : '',

            subtitle:
                typeof subtitle === 'string'
                    ? subtitle.trim()
                    : '',

            buttonText:
                typeof buttonText === 'string' &&
                buttonText.trim()
                    ? buttonText.trim()
                    : 'Shop Now',

            buttonLink:
                typeof buttonLink === 'string' &&
                buttonLink.trim()
                    ? buttonLink.trim()
                    : '/products',

            isActive:
                isActive !== undefined
                    ? Boolean(isActive)
                    : true,

            order:
                Number.isFinite(Number(order))
                    ? Number(order)
                    : 0
        })

        await newHero.save()

        return res.status(201).json({

            msg:
                'Hero image successfully created.',

            hero: newHero
        })

    } catch (err) {

        console.error(
            'Create hero error:',
            err
        )

        return res.status(500).json({
            err:
                err.message ||
                'Failed to create hero image.'
        })
    }
}