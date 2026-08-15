import connectDB from '../../../../utils/connectDB'
import Users from '../../../../models/userModel'
import auth from '../../../../middleware/auth'
import bcrypt from 'bcrypt'

connectDB()

export default async (req, res) => {
    switch(req.method){
        case "PATCH":
            await resetPassword(req, res)
            break;
        default:
            return res.status(405).json({ err: 'Method not allowed.' })
    }
}


const resetPassword = async (req, res) => {
    try {
        const result = await auth(req, res)
        if (!result) return

        const { password } = req.body

        if (!password || password.length < 6) {
            return res.status(400).json({ err: 'Password must be at least 6 characters.' })
        }

        const passwordHash = await bcrypt.hash(password, 12)

        await Users.findOneAndUpdate({_id: result.id}, {password: passwordHash})

        res.json({ msg: "Update Success!"})
        
    } catch (err) {
        return res.status(500).json({err: 'Something went wrong.'})
    }   
}
