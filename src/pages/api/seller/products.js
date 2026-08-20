import connectDB from '../../../../utils/connectDB'
import Products from '../../../../models/productModel'
import auth, { isSeller } from '../../../../middleware/auth'

connectDB()

export default async function handler(req, res) {
    try {
        const result = await auth(req, res)

        if (!result) return

        if (!isSeller(result)) {
            return res.status(403).json({
                err: 'Seller access required.'
            })
        }

        const sellerId = result.id

        // ==========================================
        // GET MY PRODUCTS
        // ==========================================

        if (req.method === 'GET') {
            const products = await Products.find({
                seller: sellerId
            })
                .sort('-createdAt')

            return res.status(200).json({
                status: 'success',
                result: products.length,
                products
            })
        }

        // ==========================================
        // DELETE MY PRODUCT
        // ==========================================

        if (req.method === 'DELETE') {
            const { id } = req.query

            if (!id) {
                return res.status(400).json({
                    err: 'Product ID is required.'
                })
            }

            const product = await Products.findOne({
                _id: id,
                seller: sellerId
            })

            if (!product) {
                return res.status(404).json({
                    err: 'Product not found or you do not own this product.'
                })
            }

            await Products.findByIdAndDelete(id)

            return res.status(200).json({
                msg: 'Product deleted successfully.'
            })
        }

        return res.status(405).json({
            err: 'Method not allowed.'
        })
    } catch (err) {
        console.error('Seller products API error:', err)

        return res.status(500).json({
            err: err.message || 'Something went wrong.'
        })
    }
}