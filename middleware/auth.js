import jwt from 'jsonwebtoken'
import Users from '../models/userModel'

const auth = async (req, res) => {
  const token = req.headers.authorization

  if (!token) {
    res.status(401).json({ err: 'Invalid Authentication.' })
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await Users.findOne({ _id: decoded.id })

    if (!user) {
      res.status(401).json({ err: 'Invalid Authentication.' })
      return null
    }

    return { id: user._id, role: user.role, root: user.root }
  } catch {
    res.status(401).json({ err: 'Invalid Authentication.' })
    return null
  }
}

export default auth
