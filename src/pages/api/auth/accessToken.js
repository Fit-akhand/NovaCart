import connectDB from '../../../../utils/connectDB'
import Users from '../../../../models/userModel'
import jwt from 'jsonwebtoken'
import { createAccessToken } from '../../../../utils/generateToken'
import { toSafeUser } from '../../../../utils/safeUser'

connectDB()

export default async (req, res) => {
    switch(req.method){
        case "GET":
            await refreshAccessToken(req, res)
            break;
        default:
            return res.status(405).json({ err: 'Method not allowed.' })
    }
}

const refreshAccessToken = async (req, res) => {
    try{
        const rf_token = req.cookies.refreshtoken;
        if(!rf_token) return res.status(401).json({err: 'Please login now!'})

        const result = jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET)

        const user = await Users.findById(result.id)
        if(!user) return res.status(401).json({err: 'User does not exist.'})

        const access_token = createAccessToken({id: user._id})
        res.json({
            access_token,
            user: toSafeUser(user)
        })
    }catch(err){
        return res.status(401).json({err: 'Your token is incorrect or has expired.'})
    }
}
