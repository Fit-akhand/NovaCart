import connectDB from '../../../../utils/connectDB'
import Users from '../../../../models/userModel'
import auth from '../../../../middleware/auth'
import { toSafeUser } from '../../../../utils/safeUser'

connectDB()

export default async (req, res) => {
    switch(req.method){
        case "PATCH":
            await uploadInfor(req, res)
            break;
        case "GET":
            await getUsers(req, res)
            break;
    }
}

const getUsers = async (req, res) => {
    try {
       const result = await auth(req, res)
       if (!result) return
       if(result.role !== 'admin') 
       return res.status(400).json({err: "Authentication is not valid"})

        const users = await Users.find().select('-password')
        res.json({users})

    } catch (err) {
        return res.status(500).json({err: err.message})
    }
}


const uploadInfor = async (req, res) => {
    try {
        const result = await auth(req, res)
        if (!result) return
        const { name, avatar, phone, address, city, state, pincode } = req.body

        const updates = {}
        if (typeof name === 'string' && name.trim()) updates.name = name.trim()
        if (typeof avatar === 'string' && avatar) updates.avatar = avatar

        if (result.role !== 'admin') {
            if (typeof phone === 'string') updates.phone = phone.trim()
            if (typeof address === 'string') updates.address = address.trim()
            if (typeof city === 'string') updates.city = city.trim()
            if (typeof state === 'string') updates.state = state.trim()
            if (typeof pincode === 'string') updates.pincode = pincode.trim()
        }

        const newUser = await Users.findOneAndUpdate(
            { _id: result.id },
            updates,
            { new: true }
        ).select('-password')

        res.json({
            msg: "Update Success!",
            user: toSafeUser(newUser)
        })
    } catch (err) {
        return res.status(500).json({err: err.message})
    }
}