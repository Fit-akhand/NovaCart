import {
    clearRefreshTokenCookie
} from '../../../../utils/authCookies'

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({
            err: 'Method not allowed.'
        })
    }

    try {
        clearRefreshTokenCookie(res)

        return res.status(200).json({
            msg: 'Logged out!'
        })

    } catch (error) {

        console.error(
            'Logout error:',
            error
        )

        return res.status(500).json({
            err: 'Logout failed.'
        })
    }
}