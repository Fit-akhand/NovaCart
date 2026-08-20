import bcrypt from 'bcryptjs'

import connectDB from '../../../../utils/connectDB'
import Users from '../../../../models/userModel'

connectDB()

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            err: 'Method not allowed.'
        })
    }

    try {
        const {
            name,
            email,
            password,
            cf_password,

            phone,
            address,
            city,
            state,
            pincode,

            accountType,
            adminCode,
            sellerCode
        } = req.body

        // --------------------------------
        // BASIC VALIDATION
        // --------------------------------

        if (
            !name ||
            !email ||
            !password ||
            !cf_password
        ) {
            return res.status(400).json({
                err: 'Please add all required fields.'
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                err: 'Password must be at least 6 characters.'
            })
        }

        if (password !== cf_password) {
            return res.status(400).json({
                err: 'Passwords do not match.'
            })
        }

        // --------------------------------
        // ACCOUNT TYPE
        // --------------------------------

        const type = accountType || 'user'

        if (!['user', 'seller', 'admin'].includes(type)) {
            return res.status(400).json({
                err: 'Invalid account type.'
            })
        }

        // --------------------------------
        // CHECK EXISTING USER
        // --------------------------------

        const existingUser = await Users.findOne({
            email: email.toLowerCase().trim()
        })

        if (existingUser) {
            return res.status(400).json({
                err: 'This email is already registered.'
            })
        }

        // --------------------------------
        // DEFAULT ROLE
        // --------------------------------

        let role = 'user'
        let root = false

        // --------------------------------
        // CUSTOMER
        // --------------------------------

        if (type === 'user') {
            role = 'user'
            root = false
        }

        // --------------------------------
        // SELLER
        // --------------------------------

        if (type === 'seller') {

            if (!sellerCode) {
                return res.status(400).json({
                    err: 'Seller verification code is required.'
                })
            }

            const serverSellerCode =
                process.env.SELLER_REGISTRATION_CODE

            if (!serverSellerCode) {
                return res.status(500).json({
                    err: 'Seller registration is not configured on the server.'
                })
            }

            if (
                sellerCode.trim() !==
                serverSellerCode.trim()
            ) {
                return res.status(400).json({
                    err: 'Invalid seller verification code.'
                })
            }

            role = 'seller'
            root = false
        }

        // --------------------------------
        // ADMIN
        // --------------------------------
        //
        // Admin registration is still protected.
        // Nobody can simply send:
        //
        // role: "admin"
        //
        // from the browser.
        //

        if (type === 'admin') {

            const serverAdminCode =
                process.env.ADMIN_REGISTRATION_CODE

            if (!serverAdminCode) {
                return res.status(500).json({
                    err: 'Admin registration is not configured on the server.'
                })
            }

            if (
                !adminCode ||
                adminCode.trim() !==
                serverAdminCode.trim()
            ) {
                return res.status(400).json({
                    err: 'Invalid admin registration code.'
                })
            }

            role = 'admin'
            root = false
        }

        // --------------------------------
        // HASH PASSWORD
        // --------------------------------

        const passwordHash = await bcrypt.hash(
            password,
            12
        )

        // --------------------------------
        // CREATE USER
        // --------------------------------

        const newUser = new Users({
            name: name.trim(),

            email: email
                .toLowerCase()
                .trim(),

            password: passwordHash,

            role,

            root,

            phone:
                typeof phone === 'string'
                    ? phone.trim()
                    : '',

            address:
                typeof address === 'string'
                    ? address.trim()
                    : '',

            city:
                typeof city === 'string'
                    ? city.trim()
                    : '',

            state:
                typeof state === 'string'
                    ? state.trim()
                    : '',

            pincode:
                typeof pincode === 'string'
                    ? pincode.trim()
                    : ''
        })

        await newUser.save()

        // --------------------------------
        // RESPONSE
        // --------------------------------

        return res.status(201).json({
            msg:
                role === 'seller'
                    ? 'Seller account created successfully.'
                    : role === 'admin'
                        ? 'Admin account created successfully.'
                        : 'Account created successfully.'
        })

    } catch (err) {

        console.error(
            'REGISTER ERROR:',
            err
        )

        return res.status(500).json({
            err: err.message
        })
    }
}