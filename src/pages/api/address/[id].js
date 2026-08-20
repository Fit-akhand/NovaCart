import connectDB from '../../../../utils/connectDB'
import Address from '../../../../models/addressModel'
import auth from '../../../../middleware/auth'

connectDB()

export default async function handler(req, res) {

    const result = await auth(req, res)

    if (!result) return

    switch (req.method) {

        case 'PUT':
            return updateAddress(req, res, result)

        case 'DELETE':
            return deleteAddress(req, res, result)

        default:
            return res.status(405).json({
                err: 'Method not allowed.'
            })
    }
}


// ===============================
// UPDATE ADDRESS
// ===============================

const updateAddress = async (req, res, result) => {

    try {

        const { id } = req.query

        const existingAddress =
            await Address.findOne({
                _id: id,
                user: result.id
            })

        if (!existingAddress) {

            return res.status(404).json({
                err: 'Address not found.'
            })
        }


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


        if (isDefault) {

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


        existingAddress.label =
            label === 'Office' ||
            label === 'Other'
                ? label
                : 'Home'

        existingAddress.fullName = fullName.trim()

        existingAddress.phone = phone.trim()

        existingAddress.address = address.trim()

        existingAddress.city = city.trim()

        existingAddress.state = state.trim()

        existingAddress.pincode = pincode.trim()

        existingAddress.isDefault =
            Boolean(isDefault)


        await existingAddress.save()


        return res.json({

            msg: 'Address updated successfully.',

            address: existingAddress
        })


    } catch (err) {

        return res.status(500).json({
            err: err.message
        })
    }
}


// ===============================
// DELETE ADDRESS
// ===============================

const deleteAddress = async (req, res, result) => {

    try {

        const { id } = req.query


        const address =
            await Address.findOne({
                _id: id,
                user: result.id
            })


        if (!address) {

            return res.status(404).json({
                err: 'Address not found.'
            })
        }


        const wasDefault = address.isDefault


        await Address.findOneAndDelete({
            _id: id,
            user: result.id
        })


        // If default address was deleted,
        // make another address default.

        if (wasDefault) {

            const nextAddress =
                await Address.findOne({
                    user: result.id
                }).sort({
                    createdAt: -1
                })


            if (nextAddress) {

                nextAddress.isDefault = true

                await nextAddress.save()
            }
        }


        return res.json({
            msg: 'Address deleted successfully.'
        })


    } catch (err) {

        return res.status(500).json({
            err: err.message
        })
    }
}