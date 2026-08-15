const valid = (name, email, password, cf_password) => {
    if(!name || !email || !password)
    return 'Please add all fields.'

    if(!validateEmail(email))
    return 'Invalid emails.'

    if(password.length < 6)
    return 'Password must be at least 6 characters.'

    if(password !== cf_password)
    return 'Confirm password did not match.'
}

export const validLogin = (email, password) => {
    if(!email || !password)
    return 'Please add all fields.'

    if(!validateEmail(email))
    return 'Invalid emails.'

    return null
}

export const validAccountType = (accountType) => {
    if (accountType !== 'customer' && accountType !== 'admin')
    return 'Invalid account type.'

    return null
}

export const validCustomerDetails = (address, city, state, pincode, phone) => {
    if(!address || !city || !state || !pincode || !phone)
    return 'Please add all fields.'

    if(!/^\d{6}$/.test(String(pincode).trim()))
    return 'Pincode must be 6 digits.'

    if(!/^\d{10}$/.test(String(phone).trim()))
    return 'Phone number must be 10 digits.'

    return null
}

export const validAdminCodePresent = (adminCode) => {
    if(!adminCode || !String(adminCode).trim())
    return 'Please enter the admin registration code.'

    return null
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

export default valid
