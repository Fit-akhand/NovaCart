import connectDB from '../../../../utils/connectDB'
import Address from '../../../../models/addressModel'
import auth from '../../../../middleware/auth'

connectDB()

export default async function handler(req, res) {

    const result = await auth(req, res)

    if (!result) return

    switch (req.method) {

        case 'GET':
            return getAddresses(req, res, result)

        case 'POST':
            return createAddress(req, res, result)

        default:
            return res.status(405).json({
                err: 'Method not allowed.'
            })
    }
}


// ===============================
// GET USER ADDRESSES
// ===============================

const getAddresses = async (req, res, result) => {

    try {

        const addresses = await Address
            .find({
                user: result.id
            })
            .sort({
                isDefault: -1,
                createdAt: -1
            })

        return res.json({
            addresses
        })

    } catch (err) {

        return res.status(500).json({
            err: err.message
        })
    }
}


// ===============================
// CREATE ADDRESS
// ===============================

const createAddress = async (req, res, result) => {

    try {

        const {
            label,
            fullName,
            phone,
            address,
            city,
            state,
            pincode,
            isDefault
        } = req.body


        if (
            !fullName ||
            !phone ||
            !address ||
            !city ||
            !state ||
            !pincode
        ) {

            return res.status(400).json({
                err: 'Please complete all address fields.'
            })
        }


        if (!/^\d{10}$/.test(phone.trim())) {

            return res.status(400).json({
                err: 'Please enter a valid 10-digit phone number.'
            })
        }


        if (!/^\d{6}$/.test(pincode.trim())) {

            return res.status(400).json({
                err: 'Please enter a valid 6-digit pincode.'
            })
        }


        const existingCount = await Address.countDocuments({
            user: result.id
        })


        // First address automatically becomes default.
        const shouldBeDefault =
            existingCount === 0 || Boolean(isDefault)


        if (shouldBeDefault) {

            await Address.updateMany(
                {
                    user: result.id
                },
                {
                    $set: {
                        isDefault: false
                    }
                }
            )
        }


        const newAddress = new Address({

            user: result.id,

            label:
                label === 'Office' ||
                label === 'Other'
                    ? label
                    : 'Home',

            fullName: fullName.trim(),

            phone: phone.trim(),

            address: address.trim(),

            city: city.trim(),

            state: state.trim(),

            pincode: pincode.trim(),

            isDefault: shouldBeDefault
        })


        await newAddress.save()


        return res.status(201).json({

            msg: 'Address added successfully.',

            address: newAddress
        })


    } catch (err) {

        return res.status(500).json({
            err: err.message
        })
    }
}