import jwt from 'jsonwebtoken'
import Users from '../models/userModel'

const auth = async (req, res) => {
    try {

        // =====================================================
        // GET ACCESS TOKEN
        // =====================================================

        const authorization =
            req.headers.authorization

        let token = null


        // =====================================================
        // AUTHORIZATION HEADER
        // =====================================================

        if (authorization) {

            token =
                authorization.startsWith('Bearer ')
                    ? authorization.slice(7)
                    : authorization
        }


        // =====================================================
        // OPTIONAL COOKIE FALLBACK
        // =====================================================

        if (
            !token &&
            req.cookies?.accesstoken
        ) {

            token =
                req.cookies.accesstoken
        }


        // =====================================================
        // TOKEN REQUIRED
        // =====================================================

        if (!token) {

            return res.status(401).json({
                err:
                    'Invalid Authentication.'
            })
        }


        // =====================================================
        // VERIFY TOKEN
        // =====================================================

        const decoded =
            jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET
            )


        if (!decoded?.id) {

            return res.status(401).json({
                err:
                    'Invalid Authentication.'
            })
        }


        // =====================================================
        // FIND USER
        // =====================================================

        const user =
            await Users.findById(
                decoded.id
            )


        if (!user) {

            return res.status(401).json({
                err:
                    'Invalid Authentication.'
            })
        }


        // =====================================================
        // AUTHENTICATED USER
        // =====================================================

        return {
            id:
                user._id,

            role:
                user.role,

            root:
                user.root
        }

    } catch (err) {

        console.error(
            'Authentication error:',
            err.message
        )


        return res.status(401).json({
            err:
                'Invalid Authentication.'
        })
    }
}


// =============================================================
// SELLER
// =============================================================

export const isSeller = (
    user
) => {

    return (
        user?.role ===
        'seller'
    )
}


// =============================================================
// SUPER ADMIN
// =============================================================

export const isSuperAdmin = (
    user
) => {

    return (
        user?.role ===
            'admin' &&
        user?.root === true
    )
}


export default auth