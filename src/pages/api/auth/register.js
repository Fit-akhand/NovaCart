import crypto from 'crypto'
import connectDB from '../../../../utils/connectDB'
import Users from '../../../../models/userModel'
import valid, {
    validAccountType,
    validAdminCodePresent,
    validCustomerDetails,
} from '@/validators/auth'
import bcrypt from 'bcrypt'

connectDB()

export default async (req, res) => {
    switch (req.method) {
        case "POST":
            await register(req, res)
            break
        default:
            return res.status(405).json({ err: 'Method not allowed.' })
    }
}

const timingSafeEqualString = (submitted, expected) => {
    if (typeof submitted !== 'string' || typeof expected !== 'string') {
        return false
    }

    const submittedBuffer = Buffer.from(submitted)
    const expectedBuffer = Buffer.from(expected)

    if (submittedBuffer.length !== expectedBuffer.length) {
        return false
    }

    return crypto.timingSafeEqual(submittedBuffer, expectedBuffer)
}

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            cf_password,
            accountType = 'customer',
            adminCode,
            address,
            city,
            state,
            pincode,
            phone,
        } = req.body

        const accountTypeErr = validAccountType(accountType)
        if (accountTypeErr) {
            return res.status(400).json({ err: accountTypeErr })
        }

        const errMsg = valid(name, email, password, cf_password)
        if (errMsg) {
            return res.status(400).json({ err: errMsg })
        }

        // Role is assigned only on the server. Never persist a client-supplied role.
        let role = 'user'

        if (accountType === 'customer') {
            const customerErr = validCustomerDetails(
                address,
                city,
                state,
                pincode,
                phone
            )
            if (customerErr) {
                return res.status(400).json({ err: customerErr })
            }
        }

        if (accountType === 'admin') {
            const adminCodeErr = validAdminCodePresent(adminCode)
            if (adminCodeErr) {
                return res.status(400).json({ err: adminCodeErr })
            }

            const expectedCode = process.env.ADMIN_REGISTRATION_CODE
            if (!expectedCode || !timingSafeEqualString(adminCode, expectedCode)) {
                return res.status(403).json({
                    err: 'Invalid admin registration code.'
                })
            }

            role = 'admin'
        }

        const normalizedEmail = email.trim().toLowerCase()

        const user = await Users.findOne({
            email: normalizedEmail
        })

        if (user) {
            return res.status(400).json({
                err: 'This email already exists.'
            })
        }

        const passwordHash = await bcrypt.hash(password, 12)

        const newUser = new Users({
            name: name.trim(),
            email: normalizedEmail,
            password: passwordHash,
            role,
            address: accountType === 'customer' ? String(address).trim() : '',
            city: accountType === 'customer' ? String(city).trim() : '',
            state: accountType === 'customer' ? String(state).trim() : '',
            pincode: accountType === 'customer' ? String(pincode).trim() : '',
            phone: accountType === 'customer' ? String(phone).trim() : '',
        })

        await newUser.save()

        res.json({
            msg: "Register Success!",
            role
        })

    } catch (err) {
        return res.status(500).json({
            err: 'Something went wrong.'
        })
    }
}
