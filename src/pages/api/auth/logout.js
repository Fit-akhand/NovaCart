import { clearRefreshTokenCookie } from '../../../../utils/authCookies'

export default async (req, res) => {
    switch(req.method){
        case "POST":
            clearRefreshTokenCookie(res)
            return res.json({ msg: 'Logged out!' })
        default:
            return res.status(405).json({ err: 'Method not allowed.' })
    }
}
