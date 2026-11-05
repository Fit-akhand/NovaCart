import jwt from 'jsonwebtoken'

export const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
}

// The refresh token is stored in an HttpOnly cookie and
// is the only credential available to Next.js middleware,
// which uses its role/root claims to protect page routes.
//
// Claims are deliberately minimal:
// id      -> user identity
// role    -> 'user' | 'seller' | 'admin'
// root    -> boolean super-admin flag
//
// No email, password, or other sensitive data is embedded.
export const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}