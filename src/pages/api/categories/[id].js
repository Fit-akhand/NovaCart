import connectDB from '../../../../utils/connectDB'
import Categories from '../../../../models/categoriesModel'
import Products from '../../../../models/productModel'
import auth, { isSuperAdmin } from '../../../../middleware/auth'

connectDB()

export default async (req, res) => {
    switch (req.method) {
        case 'PUT':
            return updateCategory(req, res)

        case 'DELETE':
            return deleteCategory(req, res)

        default:
            return res.status(405).json({
                err: 'Method not allowed.'
            })
    }
}

const createSlug = (name) => {
    return name
        .toString()
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

const updateCategory = async (req, res) => {
    try {
        const result = await auth(req, res)
        if (!result) return

        if (!isSuperAdmin(result)) {
            return res.status(403).json({
                err: 'Only Super Admin can manage categories.'
            })
        }

        const { id } = req.query
        const {
            name,
            parentCategory,
            isActive,
            image,
            discountPercent,
            discountActive
        } = req.body

        const category = await Categories.findById(id)

        if (!category) {
            return res.status(404).json({
                err: 'Category does not exist.'
            })
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    err: 'Category name cannot be blank.'
                })
            }

            category.name = name.trim()
            category.slug = createSlug(name)
        }

        if (parentCategory !== undefined) {

            // Prevent category from being its own parent
            if (
                parentCategory &&
                parentCategory.toString() === id.toString()
            ) {
                return res.status(400).json({
                    err: 'A category cannot be its own parent.'
                })
            }

            if (parentCategory) {
                const parent = await Categories.findById(parentCategory)

                if (!parent) {
                    return res.status(400).json({
                        err: 'Parent category does not exist.'
                    })
                }

                // Prevent 3-level hierarchy
                if (parent.parentCategory) {
                    return res.status(400).json({
                        err: 'A subcategory cannot have another subcategory as its parent.'
                    })
                }
            }

            category.parentCategory = parentCategory || null
        }

        if (isActive !== undefined) {
            category.isActive = Boolean(isActive)
        }

        if (image !== undefined) {
            category.image =
                typeof image === 'string'
                    ? image.trim()
                    : ''
        }

        if (discountPercent !== undefined) {
            const discount = Number(discountPercent)

            if (
                Number.isNaN(discount) ||
                discount < 0 ||
                discount > 100
            ) {
                return res.status(400).json({
                    err: 'Discount must be between 0 and 100.'
                })
            }

            category.discountPercent = discount
        }

        if (discountActive !== undefined) {
            category.discountActive =
                Boolean(discountActive)
        }

        
        await category.save()

        return res.json({
            msg: 'Successfully updated category.',
            category
        })

    } catch (err) {
        return res.status(500).json({
            err: err.message
        })
    }
}

const deleteCategory = async (req, res) => {
    try {
        const result = await auth(req, res)
        if (!result) return

        if (!isSuperAdmin(result)) {
            return res.status(403).json({
                err: 'Only Super Admin can manage categories.'
            })
        }

        const { id } = req.query

        const category = await Categories.findById(id)

        if (!category) {
            return res.status(404).json({
                err: 'Category does not exist.'
            })
        }

        // Check products using this category
        const productsWithCategory = await Products.findOne({
            category: id
        })

        if (productsWithCategory) {
            return res.status(400).json({
                err: 'Please remove or reassign products using this category first.'
            })
        }

        // Check products using this subcategory
        const productsWithSubcategory = await Products.findOne({
            subcategory: id
        })

        if (productsWithSubcategory) {
            return res.status(400).json({
                err: 'Please remove or reassign products using this subcategory first.'
            })
        }

        // Parent category cannot be deleted if it has children
        const children = await Categories.findOne({
            parentCategory: id
        })

        if (children) {
            return res.status(400).json({
                err: 'Please delete or move all subcategories first.'
            })
        }

        await Categories.findByIdAndDelete(id)

        return res.json({
            msg: 'Successfully deleted category.'
        })

    } catch (err) {
        return res.status(500).json({
            err: err.message
        })
    }
}