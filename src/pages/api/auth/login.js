import connectDB from '../../../../utils/connectDB'
import Users from '../../../../models/userModel'
import bcrypt from 'bcrypt'
import {
    createAccessToken,
    createRefreshToken
} from '../../../../utils/generateToken'
import {
    setRefreshTokenCookie
} from '../../../../utils/authCookies'
import {
    toSafeUser
} from '../../../../utils/safeUser'
import {
    validLogin
} from '@/validators/auth'

connectDB()

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            err: 'Method not allowed.'
        })
    }

    return login(req, res)
}

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body

        const errMsg =
            validLogin(
                email,
                password
            )

        if (errMsg) {
            return res.status(400).json({
                err: errMsg
            })
        }

        const normalizedEmail =
            email
                .trim()
                .toLowerCase()

        const user =
            await Users.findOne({
                email: normalizedEmail
            })

        if (!user) {
            return res.status(400).json({
                err:
                    'Invalid email or password.'
            })
        }

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            )

        if (!isMatch) {
            return res.status(400).json({
                err:
                    'Invalid email or password.'
            })
        }

        const access_token =
            createAccessToken({
                id: user._id
            })

        const refresh_token =
            createRefreshToken({
                id: user._id
            })

        // Refresh token goes ONLY into
        // the HttpOnly cookie.
        setRefreshTokenCookie(
            res,
            refresh_token
        )

        return res.status(200).json({
            msg: 'Login Success!',
            access_token,
            user: toSafeUser(user)
        })

    } catch (error) {
        console.error(
            'Login error:',
            error
        )

        return res.status(500).json({
            err:
                'Something went wrong.'
        })
    }
}