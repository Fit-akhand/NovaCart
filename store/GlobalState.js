import { createContext, useEffect, useRef, useState, useReducer } from 'react'
import reducers from './Reducers'

export const DataContext = createContext()

const initialState = {
    notify: {},
    auth: {},
    cart: [],
    modal: [],
    orders: [],
    users: [],
    categories: []
}

const GUEST_CART_KEY = '__novacart_guest_cart'

const getUserCartKey = (userId) =>
    `__novacart_cart_${userId}`

const normalizeCart = (cart) =>
    Array.isArray(cart)
        ? cart.filter(item => item && item._id)
        : []

const mergeCarts = (guestCart, userCart) => {

    const merged = [...normalizeCart(userCart)]

    for (const guestItem of normalizeCart(guestCart)) {

        const existingIndex = merged.findIndex(
            item =>
                String(item._id) ===
                String(guestItem._id)
        )

        if (existingIndex === -1) {

            merged.push({
                ...guestItem,
                quantity:
                    Number(guestItem.quantity) || 1
            })

            continue
        }

        const existingItem = merged[existingIndex]

        const existingQuantity =
            Number(existingItem.quantity) || 1

        const guestQuantity =
            Number(guestItem.quantity) || 1

        const requestedQuantity =
            existingQuantity + guestQuantity

        const stock =
            Number(
                guestItem.inStock ??
                existingItem.inStock
            )

        const quantity =
            stock > 0
                ? Math.min(requestedQuantity, stock)
                : requestedQuantity

        merged[existingIndex] = {
            ...existingItem,
            ...guestItem,
            quantity
        }
    }

    return merged
}

export const DataProvider = ({ children }) => {

    const [state, dispatch] = useReducer(
        reducers,
        initialState
    )

    const [cartReady, setCartReady] = useState(false)

    const authChecked = useRef(false)

    const { cart, auth } = state

    // =====================================================
    // RESTORE AUTH + CART
    // =====================================================

    useEffect(() => {

        if (typeof window === 'undefined') return

        let mounted = true

        const restoreSession = async () => {

            try {

                // -------------------------------------------------
                // Check authentication
                // -------------------------------------------------

                const tokenResponse =
                    await fetch('/api/auth/accessToken', {
                        method: 'GET',
                        credentials: 'include'
                    })

                let user = null

                if (tokenResponse.ok) {

                    const userResponse =
                        await fetch('/api/user', {
                            method: 'GET',
                            credentials: 'include'
                        })

                    if (userResponse.ok) {

                        const userData =
                            await userResponse.json()

                        user =
                            userData?.user ||
                            userData ||
                            null

                        if (!user?._id) {
                            user = null
                        }
                    }
                }

                if (!mounted) return

                // -------------------------------------------------
                // GUEST
                // -------------------------------------------------

                if (!user) {

                    const savedGuestCart =
                        localStorage.getItem(
                            GUEST_CART_KEY
                        )

                    let guestCart = []

                    try {
                        guestCart = savedGuestCart
                            ? JSON.parse(savedGuestCart)
                            : []
                    } catch {
                        guestCart = []
                    }

                    dispatch({
                        type: 'AUTH',
                        payload: {}
                    })

                    dispatch({
                        type: 'ADD_CART',
                        payload: normalizeCart(guestCart)
                    })

                    setCartReady(true)
                    authChecked.current = true

                    return
                }

                // -------------------------------------------------
                // LOGGED-IN USER
                // -------------------------------------------------

                const userCartKey =
                    getUserCartKey(user._id)

                const savedUserCart =
                    localStorage.getItem(userCartKey)

                const savedGuestCart =
                    localStorage.getItem(
                        GUEST_CART_KEY
                    )

                let userCart = []
                let guestCart = []

                try {
                    userCart = savedUserCart
                        ? JSON.parse(savedUserCart)
                        : []
                } catch {
                    userCart = []
                }

                try {
                    guestCart = savedGuestCart
                        ? JSON.parse(savedGuestCart)
                        : []
                } catch {
                    guestCart = []
                }

                // -------------------------------------------------
                // MERGE GUEST + USER CART
                // -------------------------------------------------

                const mergedCart =
                    mergeCarts(
                        guestCart,
                        userCart
                    )

                // Save merged cart to user's cart
                localStorage.setItem(
                    userCartKey,
                    JSON.stringify(mergedCart)
                )

                // Guest cart has now been transferred
                localStorage.removeItem(
                    GUEST_CART_KEY
                )

                dispatch({
                    type: 'AUTH',
                    payload: {
                        user
                    }
                })

                dispatch({
                    type: 'ADD_CART',
                    payload: mergedCart
                })

                setCartReady(true)
                authChecked.current = true

            } catch (error) {

                console.error(
                    'Session/cart restore failed:',
                    error
                )

                if (!mounted) return

                dispatch({
                    type: 'AUTH',
                    payload: {}
                })

                const savedGuestCart =
                    localStorage.getItem(
                        GUEST_CART_KEY
                    )

                let guestCart = []

                try {
                    guestCart = savedGuestCart
                        ? JSON.parse(savedGuestCart)
                        : []
                } catch {
                    guestCart = []
                }

                dispatch({
                    type: 'ADD_CART',
                    payload: normalizeCart(guestCart)
                })

                setCartReady(true)
                authChecked.current = true
            }
        }

        restoreSession()

        return () => {
            mounted = false
        }

    }, [])


    // =====================================================
    // SAVE CART
    // =====================================================

    useEffect(() => {

        if (
            typeof window === 'undefined' ||
            !cartReady
        ) {
            return
        }

        const userId =
            auth?.user?._id

        try {

            // -------------------------------------------------
            // LOGGED-IN USER
            // -------------------------------------------------

            if (userId) {

                const cartKey =
                    getUserCartKey(userId)

                localStorage.setItem(
                    cartKey,
                    JSON.stringify(cart)
                )

                return
            }

            // -------------------------------------------------
            // GUEST
            // -------------------------------------------------

            localStorage.setItem(
                GUEST_CART_KEY,
                JSON.stringify(cart)
            )

        } catch (error) {

            console.error(
                'Failed to save cart:',
                error
            )
        }

    }, [
        cart,
        auth?.user?._id,
        cartReady
    ])


    return (
        <DataContext.Provider
            value={{
                state,
                dispatch
            }}
        >
            {children}
        </DataContext.Provider>
    )
}