import connectDB from '../../../../utils/connectDB'
import Users from '../../../../models/userModel'
import bcrypt from 'bcrypt'
import { createAccessToken, createRefreshToken } from '../../../../utils/generateToken'
import { setRefreshTokenCookie } from '../../../../utils/authCookies'
import { validLogin } from '../../../../utils/valid'

connectDB()

export default async (req, res) => {
    switch(req.method){
        case "POST":
            await login(req, res)
            break;
        default:
            return res.status(405).json({ err: 'Method not allowed.' })
    }
}

const login = async (req, res) => {
    try{
        const { email, password } = req.body

        const errMsg = validLogin(email, password)
        if(errMsg) return res.status(400).json({err: errMsg})

        const normalizedEmail = email.trim().toLowerCase()

        const user = await Users.findOne({ email: normalizedEmail })
        if(!user) return res.status(400).json({err: 'Invalid email or password.'})

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) return res.status(400).json({err: 'Invalid email or password.'})

        const access_token = createAccessToken({id: user._id})
        const refresh_token = createRefreshToken({id: user._id})

        setRefreshTokenCookie(res, refresh_token)
        
        res.json({
            msg: "Login Success!",
            refresh_token,
            access_token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                root: user.root
            }
        })

    }catch(err){
        return res.status(500).json({err: 'Something went wrong.'})
    }
}
