import connectDB from '../../../../utils/connectDB'
import Products from '../../../../models/productModel'
import Categories from '../../../../models/categoriesModel'
import auth, {
    isSeller,
    isSuperAdmin
} from '../../../../middleware/auth'

connectDB()

// ============================================================
// HELPERS
// ============================================================

const getEffectiveDiscount = (category, subcategory) => {
    // Subcategory discount overrides parent category discount
    if (
        subcategory &&
        subcategory.discountActive === true
    ) {
        return Number(subcategory.discountPercent) || 0
    }

    // Otherwise inherit parent category discount
    if (
        category &&
        category.discountActive === true
    ) {
        return Number(category.discountPercent) || 0
    }

    return 0
}

const calculateDiscountedPrice = (price, discountPercent) => {
    const originalPrice = Number(price) || 0
    const discount = Number(discountPercent) || 0

    return Math.round(
        originalPrice * (1 - discount / 100) * 100
    ) / 100
}

const formatProduct = (product) => {
    const productObject =
        typeof product.toObject === 'function'
            ? product.toObject()
            : product

    const category = productObject.category
    const subcategory = productObject.subcategory

    const discountPercent = getEffectiveDiscount(
        category,
        subcategory
    )

    const originalPrice =
        Number(productObject.price) || 0

    const discountedPrice =
        calculateDiscountedPrice(
            originalPrice,
            discountPercent
        )

    return {
        ...productObject,

        originalPrice,

        discountPercent,

        discountedPrice
    }
}

// ============================================================
// MAIN HANDLER
// ============================================================

export default async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            return getProducts(req, res)

        case 'POST':
            return createProduct(req, res)

        default:
            return res.status(405).json({
                err: 'Method not allowed.'
            })
    }
}

// ============================================================
// API FEATURES
// ============================================================

class APIfeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    filtering() {
        const queryObj = {
            ...this.queryString
        }

        const excludeFields = [
            'page',
            'sort',
            'limit',
            'deals'
        ]

        excludeFields.forEach((el) => {
            delete queryObj[el]
        })

        // CATEGORY
        if (
            queryObj.category &&
            queryObj.category !== 'all'
        ) {
            this.query = this.query.find({
                category: queryObj.category
            })
        }

        // SUBCATEGORY
        if (
            queryObj.subcategory &&
            queryObj.subcategory !== 'all'
        ) {
            this.query = this.query.find({
                subcategory: queryObj.subcategory
            })
        }

        // TITLE SEARCH
        if (
            queryObj.title &&
            queryObj.title !== 'all'
        ) {
            this.query = this.query.find({
                title: {
                    $regex: String(queryObj.title),
                    $options: 'i'
                }
            })
        }

        // SELLER
        if (
            queryObj.seller &&
            queryObj.seller !== 'all'
        ) {
            this.query = this.query.find({
                seller: queryObj.seller
            })
        }

        return this
    }

    sorting() {
        if (this.queryString.sort) {
            const sortBy =
                this.queryString.sort
                    .split(',')
                    .join(' ')

            this.query = this.query.sort(sortBy)
        } else {
            this.query =
                this.query.sort('-createdAt')
        }

        return this
    }

    paginating() {
        const page =
            Number(this.queryString.page) || 1

        const limit =
            Number(this.queryString.limit) || 6

        const skip =
            (page - 1) * limit

        this.query = this.query
            .skip(skip)
            .limit(limit)

        return this
    }
}

// ============================================================
// GET PRODUCTS
// ============================================================

const getProducts = async (req, res) => {
    try {
        const features =
            new APIfeatures(
                Products.find(),
                req.query
            )
                .filtering()
                .sorting()
                .paginating()

        const products = await features.query
            .populate('category')
            .populate('subcategory')

        let formattedProducts =
            products.map(formatProduct)

        // ====================================================
        // DEALS FILTER
        // ====================================================

        if (
            req.query.deals === 'true'
        ) {
            formattedProducts =
                formattedProducts.filter(
                    (product) =>
                        product.discountPercent > 0
                )
        }

        return res.json({
            status: 'success',

            result:
                formattedProducts.length,

            products:
                formattedProducts
        })

    } catch (err) {
        console.error(
            'Get products error:',
            err
        )

        return res.status(500).json({
            err: err.message
        })
    }
}

// ============================================================
// CREATE PRODUCT
// ============================================================

const createProduct = async (req, res) => {
    try {
        // ====================================================
        // AUTHENTICATION
        // ====================================================

        const result =
            await auth(req, res)

        if (!result) return

        // ====================================================
        // SELLER / SUPER ADMIN
        // ====================================================

        if (
            !isSeller(result) &&
            !isSuperAdmin(result)
        ) {
            return res.status(403).json({
                err:
                    'Only sellers and super admins can create products.'
            })
        }

        // ====================================================
        // REQUEST DATA
        // ====================================================

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

        // ====================================================
        // REQUIRED FIELDS
        // ====================================================

        if (
            !title ||
            price === undefined ||
            price === null ||
            inStock === undefined ||
            inStock === null ||
            !description ||
            !content ||
            !category ||
            category === 'all' ||
            !Array.isArray(images) ||
            images.length === 0
        ) {
            return res.status(400).json({
                err:
                    'Please add all the required fields.'
            })
        }

        // ====================================================
        // VALIDATE PRICE
        // ====================================================

        const numericPrice =
            Number(price)

        if (
            !Number.isFinite(numericPrice) ||
            numericPrice < 0
        ) {
            return res.status(400).json({
                err:
                    'Price must be a valid positive number.'
            })
        }

        // ====================================================
        // VALIDATE STOCK
        // ====================================================

        const numericStock =
            Number(inStock)

        if (
            !Number.isFinite(numericStock) ||
            numericStock < 0
        ) {
            return res.status(400).json({
                err:
                    'Stock quantity must be a valid number.'
            })
        }

        // ====================================================
        // VALIDATE PARENT CATEGORY
        // ====================================================

        const parentCategory =
            await Categories.findById(category)

        if (!parentCategory) {
            return res.status(400).json({
                err:
                    'Selected category does not exist.'
            })
        }

        // Product category must be a root category
        if (
            parentCategory.parentCategory
        ) {
            return res.status(400).json({
                err:
                    'Selected category must be a parent category.'
            })
        }

        // Category must be active
        if (
            !parentCategory.isActive
        ) {
            return res.status(400).json({
                err:
                    'Selected category is inactive.'
            })
        }

        // ====================================================
        // VALIDATE SUBCATEGORY
        // ====================================================

        let finalSubcategory = null

        if (
            subcategory &&
            subcategory !== 'all'
        ) {
            const childCategory =
                await Categories.findById(
                    subcategory
                )

            if (!childCategory) {
                return res.status(400).json({
                    err:
                        'Selected subcategory does not exist.'
                })
            }

            // Must actually be a child category
            if (
                !childCategory.parentCategory
            ) {
                return res.status(400).json({
                    err:
                        'Selected subcategory is not a subcategory.'
                })
            }

            // Must belong to selected parent
            if (
                childCategory
                    .parentCategory
                    .toString() !==
                category.toString()
            ) {
                return res.status(400).json({
                    err:
                        'Selected subcategory does not belong to this category.'
                })
            }

            // Must be active
            if (
                !childCategory.isActive
            ) {
                return res.status(400).json({
                    err:
                        'Selected subcategory is inactive.'
                })
            }

            finalSubcategory =
                childCategory._id
        }

        // ====================================================
        // SELLER OWNERSHIP
        // ====================================================

        const sellerId =
            isSeller(result)
                ? result.id
                : null

        // ====================================================
        // CREATE PRODUCT
        // ====================================================

        const newProduct =
            new Products({
                title:
                    title.trim().toLowerCase(),

                price:
                    numericPrice,

                inStock:
                    numericStock,

                description:
                    description.trim(),

                content:
                    content.trim(),

                category:
                    parentCategory._id,

                subcategory:
                    finalSubcategory,

                seller:
                    sellerId,

                images
            })

        await newProduct.save()

        // ====================================================
        // RETURN PRODUCT WITH DISCOUNT
        // ====================================================

        const populatedProduct =
            await Products.findById(
                newProduct._id
            )
                .populate('category')
                .populate('subcategory')

        const formattedProduct =
            formatProduct(
                populatedProduct
            )

        return res.status(201).json({
            msg:
                'Success! Created a new product.',

            product:
                formattedProduct
        })

    } catch (err) {
        console.error(
            'Create product error:',
            err
        )

        return res.status(500).json({
            err: err.message
        })
    }
}