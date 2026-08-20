import jwt from 'jsonwebtoken'
import Users from '../models/userModel'

const auth = async (req, res) => {
    try {
        const authorization = req.headers.authorization

        if (!authorization) {
            return res.status(401).json({
                err: 'Invalid Authentication.'
            })
        }

        // Supports:
        // Authorization: Bearer <token>
        // OR
        // Authorization: <token>

        const token = authorization.startsWith('Bearer ')
            ? authorization.slice(7)
            : authorization

        if (!token) {
            return res.status(401).json({
                err: 'Invalid Authentication.'
            })
        }

        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        )

        if (!decoded?.id) {
            return res.status(401).json({
                err: 'Invalid Authentication.'
            })
        }

        const user = await Users.findById(decoded.id)

        if (!user) {
            return res.status(401).json({
                err: 'Invalid Authentication.'
            })
        }

        return {
            id: user._id,
            role: user.role,
            root: user.root
        }

    } catch (err) {
        console.error('Authentication error:', err.message)

        return res.status(401).json({
            err: 'Invalid Authentication.'
        })
    }
}

export const isSeller = (user) => {
    return user?.role === 'seller'
}

export const isSuperAdmin = (user) => {
    return (
        user?.role === 'admin' &&
        user?.root === true
    )
}

export default auth