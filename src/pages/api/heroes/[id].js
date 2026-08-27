import connectDB from '../../../../utils/connectDB'
import Hero from '../../../../models/heroModel'
import auth, { isSuperAdmin } from '../../../../middleware/auth'

connectDB()

// ==========================================
// MAIN HANDLER
// ==========================================

export default async (req, res) => {

    switch (req.method) {

        case 'PUT':
            return updateHero(req, res)

        case 'DELETE':
            return deleteHero(req, res)

        default:
            return res.status(405).json({
                err: 'Method not allowed.'
            })
    }
}

// ==========================================
// UPDATE HERO
// ==========================================

const updateHero = async (req, res) => {

    try {

        const result = await auth(req, res)

        if (!result) return

        if (!isSuperAdmin(result)) {

            return res.status(403).json({
                err:
                    'Only the Super Admin can manage hero images.'
            })
        }

        const { id } = req.query

        const hero =
            await Hero.findById(id)

        if (!hero) {

            return res.status(404).json({
                err:
                    'Hero image does not exist.'
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
        // IMAGE
        // ======================================

        if (image !== undefined) {

            if (
                typeof image !== 'string' ||
                !image.trim()
            ) {

                return res.status(400).json({
                    err:
                        'Hero image cannot be empty.'
                })
            }

            hero.image =
                image.trim()
        }

        // ======================================
        // CONTENT
        // ======================================

        if (title !== undefined) {

            hero.title =
                typeof title === 'string'
                    ? title.trim()
                    : ''
        }

        if (subtitle !== undefined) {

            hero.subtitle =
                typeof subtitle === 'string'
                    ? subtitle.trim()
                    : ''
        }

        // ======================================
        // BUTTON
        // ======================================

        if (buttonText !== undefined) {

            hero.buttonText =
                typeof buttonText === 'string' &&
                buttonText.trim()
                    ? buttonText.trim()
                    : 'Shop Now'
        }

        if (buttonLink !== undefined) {

            hero.buttonLink =
                typeof buttonLink === 'string' &&
                buttonLink.trim()
                    ? buttonLink.trim()
                    : '/products'
        }

        // ======================================
        // STATUS
        // ======================================

        if (isActive !== undefined) {

            hero.isActive =
                Boolean(isActive)
        }

        // ======================================
        // DISPLAY ORDER
        // ======================================

        if (order !== undefined) {

            hero.order =
                Number.isFinite(Number(order))
                    ? Number(order)
                    : 0
        }

        await hero.save()

        return res.json({

            msg:
                'Hero image successfully updated.',

            hero
        })

    } catch (err) {

        console.error(
            'Update hero error:',
            err
        )

        return res.status(500).json({
            err:
                err.message ||
                'Failed to update hero image.'
        })
    }
}

// ==========================================
// DELETE HERO
// ==========================================

const deleteHero = async (req, res) => {

    try {

        const result = await auth(req, res)

        if (!result) return

        if (!isSuperAdmin(result)) {

            return res.status(403).json({
                err:
                    'Only the Super Admin can manage hero images.'
            })
        }

        const { id } = req.query

        const hero =
            await Hero.findById(id)

        if (!hero) {

            return res.status(404).json({
                err:
                    'Hero image does not exist.'
            })
        }

        await Hero.findByIdAndDelete(id)

        return res.json({

            msg:
                'Hero image successfully deleted.'
        })

    } catch (err) {

        console.error(
            'Delete hero error:',
            err
        )

        return res.status(500).json({
            err:
                err.message ||
                'Failed to delete hero image.'
        })
    }
}