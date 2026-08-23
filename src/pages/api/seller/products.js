import connectDB from '../../../../utils/connectDB'
import Products from '../../../../models/productModel'
import auth from '../../../../middleware/auth'

connectDB()

export default async function handler(req, res) {
    try {
        const result = await auth(req, res)

        if (!result) return

        // ==========================================
        // SUPER ADMIN
        // ==========================================

        if (
            result.role === 'admin' &&
            result.root === true
        ) {
            // ------------------------------------------
            // GET ADMIN PRODUCTS
            // ------------------------------------------

            if (req.method === 'GET') {
                const products = await Products.find({
                    ownerType: 'admin'
                })
                    .populate('category')
                    .populate('subcategory')
                    .sort('-createdAt')

                console.log(
                    'SUPER ADMIN PRODUCTS:',
                    products.length
                )

                return res.status(200).json({
                    status: 'success',
                    result: products.length,
                    products
                })
            }

            // ------------------------------------------
            // UPDATE ADMIN PRODUCT STOCK
            // ------------------------------------------

            if (req.method === 'PATCH') {
                const { id, change } = req.body

                if (!id) {
                    return res.status(400).json({
                        err: 'Product ID is required.'
                    })
                }

                const stockChange = Number(change)

                if (
                    !Number.isInteger(stockChange) ||
                    ![-1, 1].includes(stockChange)
                ) {
                    return res.status(400).json({
                        err: 'Stock change must be either +1 or -1.'
                    })
                }

                const product = await Products.findOne({
                    _id: id,
                    ownerType: 'admin'
                })

                if (!product) {
                    return res.status(404).json({
                        err:
                            'Product not found or this product does not belong to the Super Admin.'
                    })
                }

                const currentStock =
                    Number(product.inStock) || 0

                const newStock =
                    currentStock + stockChange

                // Never allow negative stock
                if (newStock < 0) {
                    return res.status(400).json({
                        err:
                            'Stock cannot be less than 0.'
                    })
                }

                product.inStock = newStock

                await product.save()

                return res.status(200).json({
                    status: 'success',
                    msg:
                        stockChange === 1
                            ? 'Stock increased successfully.'
                            : 'Stock decreased successfully.',
                    product
                })
            }

            // ------------------------------------------
            // DELETE ADMIN PRODUCT
            // ------------------------------------------

            if (req.method === 'DELETE') {
                const { id } = req.query

                if (!id) {
                    return res.status(400).json({
                        err: 'Product ID is required.'
                    })
                }

                const product =
                    await Products.findOne({
                        _id: id,
                        ownerType: 'admin'
                    })

                if (!product) {
                    return res.status(404).json({
                        err:
                            'Product not found or this product does not belong to the Super Admin.'
                    })
                }

                await Products.findByIdAndDelete(id)

                return res.status(200).json({
                    msg:
                        'Product deleted successfully.'
                })
            }

            return res.status(405).json({
                err: 'Method not allowed.'
            })
        }

        // ==========================================
        // SELLER
        // ==========================================

        if (result.role === 'seller') {
            // ------------------------------------------
            // GET SELLER PRODUCTS
            // ------------------------------------------

            if (req.method === 'GET') {
                const products =
                    await Products.find({
                        seller: result.id,
                        ownerType: 'seller'
                    })
                        .populate('category')
                        .populate('subcategory')
                        .sort('-createdAt')

                console.log(
                    'SELLER PRODUCTS:',
                    products.length
                )

                return res.status(200).json({
                    status: 'success',
                    result: products.length,
                    products
                })
            }

            // ------------------------------------------
            // UPDATE SELLER PRODUCT STOCK
            // ------------------------------------------

            if (req.method === 'PATCH') {
                const { id, change } = req.body

                if (!id) {
                    return res.status(400).json({
                        err: 'Product ID is required.'
                    })
                }

                const stockChange = Number(change)

                if (
                    !Number.isInteger(stockChange) ||
                    ![-1, 1].includes(stockChange)
                ) {
                    return res.status(400).json({
                        err: 'Stock change must be either +1 or -1.'
                    })
                }

                // IMPORTANT:
                // Seller can only change stock
                // of their own products.
                const product =
                    await Products.findOne({
                        _id: id,
                        seller: result.id,
                        ownerType: 'seller'
                    })

                if (!product) {
                    return res.status(404).json({
                        err:
                            'Product not found or you do not own this product.'
                    })
                }

                const currentStock =
                    Number(product.inStock) || 0

                const newStock =
                    currentStock + stockChange

                if (newStock < 0) {
                    return res.status(400).json({
                        err:
                            'Stock cannot be less than 0.'
                    })
                }

                product.inStock = newStock

                await product.save()

                return res.status(200).json({
                    status: 'success',
                    msg:
                        stockChange === 1
                            ? 'Stock increased successfully.'
                            : 'Stock decreased successfully.',
                    product
                })
            }

            // ------------------------------------------
            // DELETE SELLER PRODUCT
            // ------------------------------------------

            if (req.method === 'DELETE') {
                const { id } = req.query

                if (!id) {
                    return res.status(400).json({
                        err: 'Product ID is required.'
                    })
                }

                const product =
                    await Products.findOne({
                        _id: id,
                        seller: result.id,
                        ownerType: 'seller'
                    })

                if (!product) {
                    return res.status(404).json({
                        err:
                            'Product not found or you do not own this product.'
                    })
                }

                await Products.findByIdAndDelete(id)

                return res.status(200).json({
                    msg:
                        'Product deleted successfully.'
                })
            }

            return res.status(405).json({
                err: 'Method not allowed.'
            })
        }

        // ==========================================
        // NOT ALLOWED
        // ==========================================

        return res.status(403).json({
            err:
                'Seller or Super Admin access required.'
        })

    } catch (err) {
        console.error(
            'Products API error:',
            err
        )

        return res.status(500).json({
            err:
                err.message ||
                'Something went wrong.'
        })
    }
}