import connectDB from '../../../../utils/connectDB'
import Users from '../../../../models/userModel'
import jwt from 'jsonwebtoken'
import { createAccessToken, createRefreshToken } from '../../../../utils/generateToken'
import { setRefreshTokenCookie } from '../../../../utils/authCookies'
import { toSafeUser } from '../../../../utils/safeUser'

connectDB()

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            err: 'Method not allowed.'
        })
    }

    return refreshAccessToken(req, res)
}

const refreshAccessToken = async (req, res) => {
    try {
        // =====================================================
        // GET REFRESH TOKEN FROM HTTP-ONLY COOKIE
        // =====================================================

        const refreshToken =
            req.cookies?.refreshtoken

        if (!refreshToken) {
            return res.status(401).json({
                err: 'Please login now!'
            })
        }

        // =====================================================
        // VERIFY REFRESH TOKEN
        // =====================================================

        const decoded =
            jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )

        if (!decoded?.id) {
            return res.status(401).json({
                err: 'Invalid refresh token.'
            })
        }

        // =====================================================
        // FIND USER
        // =====================================================

        const user =
            await Users.findById(decoded.id)

        if (!user) {
            return res.status(401).json({
                err: 'User does not exist.'
            })
        }

        // =====================================================
        // CREATE NEW ACCESS TOKEN
        //
        // The access token remains minimal: { id } only.
        // =====================================================

        const accessToken =
            createAccessToken({
                id: user._id
            })

        // =====================================================
        // ROTATE REFRESH TOKEN
        //
        // Re-issue the refresh token so sessions created
        // before page-level protection existed (tokens
        // without role/root claims) are upgraded
        // transparently — no manual logout/login required.
        //
        // The claims come from the CURRENT database user
        // record, so a role change takes effect on the next
        // silent refresh. The token is delivered ONLY via
        // the HttpOnly cookie (same settings, same 7-day
        // lifetime). It is never included in the JSON
        // response.
        // =====================================================

        const newRefreshToken =
            createRefreshToken({
                id: user._id,

                role: user.role,

                root: Boolean(user.root)
            })

        setRefreshTokenCookie(
            res,
            newRefreshToken
        )

        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({
            access_token: accessToken,
            user: toSafeUser(user)
        })

    } catch (error) {

        console.error(
            'Refresh access token error:',
            error
        )

        return res.status(401).json({
            err:
                'Your token is incorrect or has expired.'
        })
    }
}