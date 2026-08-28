export const ACTIONS = {
    NOTIFY: 'NOTIFY',
    AUTH: 'AUTH',
    ADD_CART: 'ADD_CART',
    ADD_MODAL: 'ADD_MODAL',
    ADD_ORDERS: 'ADD_ORDERS',
    ADD_USERS: 'ADD_USERS',
    ADD_CATEGORIES: 'ADD_CATEGORIES'
}


// ==========================================
// ADD TO CART
// ==========================================

export const addToCart = (product, cart = []) => {
    const currentCart = Array.isArray(cart) ? cart : []

    const existingIndex = currentCart.findIndex(
        item => String(item._id) === String(product._id)
    )

    // Product already exists → increase quantity
    if (existingIndex !== -1) {

        const newCart = [...currentCart]

        const existingProduct = newCart[existingIndex]

        newCart[existingIndex] = {
            ...existingProduct,
            quantity:
                (Number(existingProduct.quantity) || 1) + 1
        }

        return {
            type: ACTIONS.ADD_CART,
            payload: newCart
        }
    }

    // New product → add it
    return {
        type: ACTIONS.ADD_CART,
        payload: [
            ...currentCart,
            {
                ...product,
                quantity: Number(product.quantity) || 1
            }
        ]
    }
}


// ==========================================
// INCREASE QUANTITY
// ==========================================

export const increase = (product, cart = []) => {

    const currentCart = Array.isArray(cart)
        ? cart
        : []

    const newCart = currentCart.map(item => {

        if (
            String(item._id) ===
            String(product._id)
        ) {
            return {
                ...item,
                quantity:
                    (Number(item.quantity) || 1) + 1
            }
        }

        return item
    })

    return {
        type: ACTIONS.ADD_CART,
        payload: newCart
    }
}


// ==========================================
// DECREASE QUANTITY
// ==========================================

export const decrease = (
    product,
    cart = []
) => {

    const currentCart =
        Array.isArray(cart)
            ? cart
            : []

    const newCart = currentCart
        .map(item => {

            if (
                String(item._id) !==
                String(product._id)
            ) {
                return item
            }

            return {
                ...item,
                quantity:
                    Math.max(
                        Number(item.quantity || 1) - 1,
                        0
                    )
            }
        })
        .filter(
            item =>
                Number(item.quantity) > 0
        )

    return {
        type: ACTIONS.ADD_CART,
        payload: newCart
    }
}


// ==========================================
// DELETE ITEM FROM CART
// ==========================================

export const deleteItem = (
    productId,
    cart = []
) => {

    const currentCart = Array.isArray(cart)
        ? cart
        : []

    const newCart = currentCart.filter(
        item =>
            String(item._id) !==
            String(productId)
    )

    return {
        type: ACTIONS.ADD_CART,
        payload: newCart
    }
}

// ==========================================
// UPDATE ITEM
// ==========================================

export const updateItem = (productId, cart = [], quantity) => {
    const currentCart = Array.isArray(cart)
        ? cart
        : []

    const newCart = currentCart.map(item => {

        if (
            String(item._id) ===
            String(productId)
        ) {
            return {
                ...item,
                quantity:
                    Number(quantity) || 1
            }
        }

        return item
    })

    return {
        type: ACTIONS.ADD_CART,
        payload: newCart
    }
}