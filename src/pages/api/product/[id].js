import connectDB from '../../../../utils/connectDB'
import Products from '../../../../models/productModel'
import Categories from '../../../../models/categoriesModel'
import auth, {
    isSeller,
    isSuperAdmin
} from '../../../../middleware/auth'

connectDB()

export default async (req, res) => {
    switch (req.method) {
        case 'GET':
            return getProduct(req, res)

        case 'PUT':
            return updateProduct(req, res)

        case 'DELETE':
            return deleteProduct(req, res)

        default:
            return res.status(405).json({
                err: 'Method not allowed.'
            })
    }
}

const getProduct = async (req, res) => {
    try {
        const { id } = req.query

        const product = await Products.findById(id)

        if (!product) {
            return res.status(404).json({
                err: 'This product does not exist.'
            })
        }

        return res.json({ product })

    } catch (err) {
        return res.status(500).json({
            err: 'Something went wrong.'
        })
    }
}

const updateProduct = async (req, res) => {
    try {
        const result = await auth(req, res)
        if (!result) return

        if (!isSeller(result) && !isSuperAdmin(result)) {
            return res.status(403).json({
                err: 'You are not allowed to update products.'
            })
        }

        const { id } = req.query

        const {
            title,
            price,
            inStock,
            description,
            content,
            category,
            subcategory,
            images
        } = req.body

        if (
            !title ||
            !price ||
            inStock === undefined ||
            !description ||
            !content ||
            !category ||
            category === 'all' ||
            !images ||
            images.length === 0
        ) {
            return res.status(400).json({
                err: 'Please add all the required fields.'
            })
        }

        const product = await Products.findById(id)

        if (!product) {
            return res.status(404).json({
                err: 'This product does not exist.'
            })
        }

        // Seller can only update their own product
        if (
            isSeller(result) &&
            (!product.seller ||
                product.seller.toString() !== result.id.toString())
        ) {
            return res.status(403).json({
                err: 'You can only update your own products.'
            })
        }

        // Validate parent category
        const parentCategory = await Categories.findById(category)

        if (!parentCategory) {
            return res.status(400).json({
                err: 'Selected category does not exist.'
            })
        }

        if (parentCategory.parentCategory) {
            return res.status(400).json({
                err: 'Selected category must be a parent category.'
            })
        }

        if (!parentCategory.isActive) {
            return res.status(400).json({
                err: 'Selected category is inactive.'
            })
        }

        // Validate subcategory
        let finalSubcategory = null

        if (subcategory && subcategory !== 'all') {
            const childCategory = await Categories.findById(subcategory)

            if (!childCategory) {
                return res.status(400).json({
                    err: 'Selected subcategory does not exist.'
                })
            }

            if (
                !childCategory.parentCategory ||
                childCategory.parentCategory.toString() !==
                    category.toString()
            ) {
                return res.status(400).json({
                    err: 'Selected subcategory does not belong to this category.'
                })
            }

            if (!childCategory.isActive) {
                return res.status(400).json({
                    err: 'Selected subcategory is inactive.'
                })
            }

            finalSubcategory = subcategory
        }

        product.title = title.toLowerCase()
        product.price = price
        product.inStock = inStock
        product.description = description
        product.content = content
        product.category = category
        product.subcategory = finalSubcategory
        product.images = images

        await product.save()

        return res.json({
            msg: 'Success! Updated a product.',
            product
        })

    } catch (err) {
        return res.status(500).json({
            err: err.message
        })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const result = await auth(req, res)
        if (!result) return

        if (!isSeller(result) && !isSuperAdmin(result)) {
            return res.status(403).json({
                err: 'You are not allowed to delete products.'
            })
        }

        const { id } = req.query

        const product = await Products.findById(id)

        if (!product) {
            return res.status(404).json({
                err: 'This product does not exist.'
            })
        }

        // Seller can only delete their own product
        if (
            isSeller(result) &&
            (!product.seller ||
                product.seller.toString() !== result.id.toString())
        ) {
            return res.status(403).json({
                err: 'You can only delete your own products.'
            })
        }

        await Products.findByIdAndDelete(id)

        return res.json({
            msg: 'Deleted a product.'
        })

    } catch (err) {
        return res.status(500).json({
            err: err.message
        })
    }
}