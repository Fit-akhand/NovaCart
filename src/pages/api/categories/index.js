import connectDB from '../../../../utils/connectDB'
import Categories from '../../../../models/categoriesModel'
import auth, {
    isSuperAdmin
} from '../../../../middleware/auth'

connectDB()

// ==========================================
// SLUG GENERATOR
// ==========================================

const createSlug = (name) => {
    return String(name)
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

// ==========================================
// MAIN HANDLER
// ==========================================

export default async (req, res) => {

    switch (req.method) {

        case 'GET':
            return getCategories(req, res)

        case 'POST':
            return createCategory(req, res)

        default:
            return res.status(405).json({
                err: 'Method not allowed.'
            })
    }
}

// ==========================================
// GET CATEGORIES
// ==========================================

const getCategories = async (req, res) => {

    try {

        const categories =
            await Categories.find()
                .sort({
                    parentCategory: 1,
                    name: 1
                })

        return res.json({
            categories
        })

    } catch (err) {

        console.error(
            'Get categories error:',
            err
        )

        return res.status(500).json({
            err: 'Failed to load categories.'
        })
    }
}

// ==========================================
// CREATE CATEGORY
// ==========================================

const createCategory = async (req, res) => {

    try {

        const result =
            await auth(req, res)

        if (!result) return

        // Only Super Admin
        if (!isSuperAdmin(result)) {

            return res.status(403).json({
                err:
                    'Only the Super Admin can create categories.'
            })
        }

        const {
            name,
            parentCategory,
            image
        } = req.body

        // ======================================
        // VALIDATE NAME
        // ======================================

        if (
            typeof name !== 'string' ||
            !name.trim()
        ) {

            return res.status(400).json({
                err:
                    'Category name cannot be empty.'
            })
        }

        const cleanName =
            name.trim()

        const slug =
            createSlug(cleanName)

        if (!slug) {

            return res.status(400).json({
                err:
                    'Invalid category name.'
            })
        }

        // ======================================
        // PARENT CATEGORY
        // ======================================

        let parent = null

        if (
            parentCategory &&
            parentCategory !== 'null' &&
            parentCategory !== 'all'
        ) {

            parent =
                await Categories.findById(
                    parentCategory
                )

            if (!parent) {

                return res.status(400).json({
                    err:
                        'Parent category does not exist.'
                })
            }

            /*
             * Only top-level categories can be
             * parents.
             *
             * Prevent:
             *
             * Men's Fashion
             *   → Shirts
             *       → Casual Shirts ❌
             */

            if (parent.parentCategory) {

                return res.status(400).json({
                    err:
                        'Subcategories cannot have their own subcategories.'
                })
            }

            if (!parent.isActive) {

                return res.status(400).json({
                    err:
                        'Parent category is inactive.'
                })
            }
        }

        // ======================================
        // DUPLICATE CHECK
        // ======================================

        /*
         * Important:
         *
         * The same slug can exist under
         * different parents.
         *
         * Men's Fashion → Jeans      ✅
         * Women's Fashion → Jeans    ✅
         *
         * But:
         *
         * Men's Fashion → Jeans
         * Men's Fashion → Jeans       ❌
         */

        const duplicate =
            await Categories.findOne({
                parentCategory:
                    parent
                        ? parent._id
                        : null,

                slug
            })

        if (duplicate) {

            const location =
                parent
                    ? `${parent.name} → ${cleanName}`
                    : cleanName

            return res.status(409).json({
                err:
                    `Category "${location}" already exists.`
            })
        }

        // ======================================
        // CREATE
        // ======================================

        const newCategory =
        new Categories({

            name: cleanName,

            slug,

            image:
                typeof image === 'string'
                    ? image.trim()
                    : '',

            parentCategory:
                parent
                    ? parent._id
                    : null,

            isActive: true
        })

        await newCategory.save()

        return res.status(201).json({

            msg:
                parent
                    ? 'Successfully created subcategory.'
                    : 'Successfully created category.',

            newCategory
        })

    } catch (err) {

        console.error(
            'Create category error:',
            err
        )

        /*
         * Extra protection for MongoDB
         * duplicate index errors.
         */

        if (err.code === 11000) {

            return res.status(409).json({
                err:
                    'This category already exists under the selected parent.'
            })
        }

        return res.status(500).json({
            err:
                err.message ||
                'Failed to create category.'
        })
    }
}