import {
    createContext,
    useEffect,
    useReducer,
    useRef,
    useState
} from 'react'

import reducers from './Reducers'

export const DataContext = createContext()

// ============================================================
// STORAGE KEYS
// ============================================================

const GUEST_CART_KEY = '__novacart_guest_cart'

const getUserCartKey = (userId) =>
    `__novacart_cart_${userId}`


// ============================================================
// STORAGE HELPERS
// ============================================================

const getStoredCart = (key) => {

    if (typeof window === 'undefined') {
        return []
    }

    try {

        const value =
            localStorage.getItem(key)

        if (!value) {
            return []
        }

        const parsed =
            JSON.parse(value)

        return Array.isArray(parsed)
            ? parsed
            : []

    } catch (error) {

        console.error(
            'NovaCart: failed to read cart',
            error
        )

        return []
    }
}


const setStoredCart = (
    key,
    cart
) => {

    if (typeof window === 'undefined') {
        return
    }

    try {

        localStorage.setItem(
            key,
            JSON.stringify(
                Array.isArray(cart)
                    ? cart
                    : []
            )
        )

    } catch (error) {

        console.error(
            'NovaCart: failed to save cart',
            error
        )
    }
}


// ============================================================
// CART MERGE
// ============================================================

const mergeCarts = (
    accountCart,
    guestCart
) => {

    const account =
        Array.isArray(accountCart)
            ? accountCart
            : []

    const guest =
        Array.isArray(guestCart)
            ? guestCart
            : []

    const result = account.map(
        item => ({
            ...item,
            quantity:
                Math.max(
                    1,
                    Number(item.quantity) || 1
                )
        })
    )


    for (const guestItem of guest) {

        if (!guestItem?._id) {
            continue
        }


        const existingIndex =
            result.findIndex(
                item =>
                    String(item._id) ===
                    String(guestItem._id)
            )


        // ====================================================
        // NEW PRODUCT
        // ====================================================

        if (existingIndex === -1) {

            const quantity =
                Math.max(
                    1,
                    Number(
                        guestItem.quantity
                    ) || 1
                )

            const stock =
                Number(
                    guestItem.inStock
                ) || 0


            result.push({
                ...guestItem,

                quantity:
                    stock > 0
                        ? Math.min(
                            quantity,
                            stock
                        )
                        : quantity
            })

            continue
        }


        // ====================================================
        // EXISTING PRODUCT
        // ====================================================

        const existing =
            result[existingIndex]


        const accountQuantity =
            Math.max(
                1,
                Number(
                    existing.quantity
                ) || 1
            )


        const guestQuantity =
            Math.max(
                1,
                Number(
                    guestItem.quantity
                ) || 1
            )


        let quantity =
            accountQuantity +
            guestQuantity


        const stock =
            Number(
                existing.inStock ??
                guestItem.inStock
            ) || 0


        if (stock > 0) {
            quantity =
                Math.min(
                    quantity,
                    stock
                )
        }


        result[existingIndex] = {
            ...existing,
            quantity
        }
    }


    return result
}


// ============================================================
// INITIAL STATE
// ============================================================

const initialState = {

    notify: {},

    auth: {},

    cart: [],

    modal: [],

    orders: [],

    users: [],

    categories: []
}


// ============================================================
// PROVIDER
// ============================================================

export const DataProvider = ({
    children
}) => {

    const [
        state,
        dispatch
    ] = useReducer(
        reducers,
        initialState
    )


    const {
        auth,
        cart
    } = state


    // ========================================================
    // AUTH READY
    // ========================================================

    const [
        authReady,
        setAuthReady
    ] = useState(false)


    // ========================================================
    // CURRENT ACCOUNT
    //
    // This is deliberately kept outside React state so we
    // can distinguish:
    //
    // LOGIN
    // LOGOUT
    // GUEST
    // ========================================================

    const currentUserId =
        useRef(null)


    // ========================================================
    // CART OWNER
    //
    // Possible values:
    //
    // null       = guest
    // userId     = account
    // ========================================================

    const cartOwner =
        useRef(null)


    // ========================================================
    // CART READY
    // ========================================================

    const cartReady =
        useRef(false)


    // ========================================================
    // PREVENT CART SAVE DURING TRANSITION
    // ========================================================

    const skipNextCartSave =
        useRef(false)


    // ========================================================
    // RESTORE AUTH
    // ========================================================

    useEffect(() => {

        if (
            typeof window ===
            'undefined'
        ) {
            return
        }


        let mounted = true


        const restoreAuth =
            async () => {

                try {

                    const response =
                        await fetch(
                            '/api/auth/accessToken',
                            {
                                method:
                                    'GET',

                                credentials:
                                    'include',

                                cache:
                                    'no-store'
                            }
                        )


                    if (
                        !response.ok
                    ) {

                        if (mounted) {

                            dispatch({
                                type:
                                    'AUTH',

                                payload:
                                    {}
                            })
                        }

                        return
                    }


                    const data =
                        await response
                            .json()
                            .catch(
                                () => ({})
                            )


                    const accessToken =
                        data?.access_token ||
                        ''


                    const user =
                        data?.user


                    if (
                        mounted &&
                        user?._id
                    ) {

                        dispatch({
                            type:
                                'AUTH',

                            payload: {
                                user,
                                token:
                                    accessToken
                            }
                        })

                    } else {

                        const userResponse =
                            await fetch(
                                '/api/user',
                                {
                                    method:
                                        'GET',

                                    credentials:
                                        'include',

                                    cache:
                                        'no-store'
                                }
                            )


                        if (
                            !userResponse.ok
                        ) {

                            if (mounted) {

                                dispatch({
                                    type:
                                        'AUTH',

                                    payload:
                                        {}
                                })
                            }

                            return
                        }


                        const userData =
                            await userResponse.json()


                        const restoredUser =
                            userData?.user ||
                            userData


                        if (
                            mounted &&
                            restoredUser?._id
                        ) {

                            dispatch({
                                type:
                                    'AUTH',

                                payload: {
                                    user:
                                        restoredUser,

                                    token:
                                        accessToken
                                }
                            })

                        } else {

                            dispatch({
                                type:
                                    'AUTH',

                                payload:
                                    {}
                            })
                        }
                    }

                } catch (error) {

                    console.error(
                        'NovaCart auth restore failed:',
                        error
                    )


                    if (mounted) {

                        dispatch({
                            type:
                                'AUTH',

                            payload:
                                {}
                        })
                    }

                } finally {

                    if (mounted) {
                        setAuthReady(true)
                    }
                }
            }


        restoreAuth()


        return () => {
            mounted = false
        }

    }, [])


    // ========================================================
    // LOAD CATEGORIES
    // ========================================================

    useEffect(() => {
        let mounted = true

        const loadCategories = async () => {
            try {
                const response = await fetch(
                    '/api/categories',
                    {
                        method: 'GET',
                        credentials: 'include',
                        cache: 'no-store',
                    }
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(
                        data?.err ||
                        'Failed to load categories.'
                    )
                }

                if (!mounted) {
                    return
                }

                dispatch({
                    type: 'ADD_CATEGORIES',
                    payload:
                        Array.isArray(data?.categories)
                            ? data.categories
                            : [],
                })
            } catch (error) {
                console.error(
                    'NovaCart categories load failed:',
                    error
                )

                if (mounted) {
                    dispatch({
                        type: 'ADD_CATEGORIES',
                        payload: [],
                    })
                }
            }
        }

        loadCategories()

        return () => {
            mounted = false
        }
    }, [])


    // ========================================================
    // CART OWNER TRANSITION
    // ========================================================

    useEffect(() => {

        if (
            typeof window ===
            'undefined'
        ) {
            return
        }


        if (!authReady) {
            return
        }


        const userId =
            auth?.user?._id
                ? String(
                    auth.user._id
                )
                : null


        // ====================================================
        // SAME USER
        //
        // Nothing to reload.
        // ====================================================

        if (
            userId &&
            currentUserId.current ===
            userId
        ) {
            return
        }


        // ====================================================
        // LOGGED-IN USER
        // ====================================================

        if (userId) {

            const accountKey =
                getUserCartKey(
                    userId
                )


            const accountCart =
                getStoredCart(
                    accountKey
                )


            const guestCart =
                getStoredCart(
                    GUEST_CART_KEY
                )


            // ================================================
            // IMPORTANT
            //
            // Guest cart only exists if the user actually
            // added products while logged out.
            //
            // Account cart is NEVER treated as guest cart.
            // ================================================

            let finalCart =
                accountCart


            if (
                guestCart.length > 0
            ) {

                finalCart =
                    mergeCarts(
                        accountCart,
                        guestCart
                    )


                // Guest cart has now been consumed.
                localStorage.removeItem(
                    GUEST_CART_KEY
                )
            }


            // ================================================
            // SAVE FINAL ACCOUNT CART
            // ================================================

            setStoredCart(
                accountKey,
                finalCart
            )


            // ================================================
            // ACCOUNT IS NOW CART OWNER
            // ================================================

            currentUserId.current =
                userId

            cartOwner.current =
                userId

            cartReady.current =
                true


            dispatch({
                type:
                    'ADD_CART',

                payload:
                    finalCart
            })


            return
        }


        // ====================================================
        // LOGGED OUT
        // ====================================================

        // If we had a logged-in user before,
        // this is a logout.
        //
        // NEVER convert that account cart into guest cart.

        if (
            currentUserId.current
        ) {

            currentUserId.current =
                null

            cartOwner.current =
                null

            cartReady.current =
                false

            skipNextCartSave.current =
                true


            dispatch({
                type:
                    'ADD_CART',

                payload:
                    []
            })


            return
        }


        // ====================================================
        // REAL GUEST SESSION
        // ====================================================

        const guestCart =
            getStoredCart(
                GUEST_CART_KEY
            )


        cartOwner.current =
            null

        cartReady.current =
            true


        dispatch({
            type:
                'ADD_CART',

            payload:
                guestCart
        })

    }, [
        authReady,
        auth?.user?._id
    ])


    // ========================================================
    // SAVE CART
    // ========================================================

    useEffect(() => {

        if (
            typeof window ===
            'undefined'
        ) {
            return
        }


        if (!authReady) {
            return
        }


        if (!cartReady.current) {
            return
        }


        // ====================================================
        // LOGOUT TRANSITION
        //
        // Do not write [] into guest storage.
        // ====================================================

        if (
            skipNextCartSave.current
        ) {

            skipNextCartSave.current =
                false

            return
        }


        // ====================================================
        // LOGGED-IN USER
        // ====================================================

        if (
            cartOwner.current
        ) {

            const accountKey =
                getUserCartKey(
                    cartOwner.current
                )


            setStoredCart(
                accountKey,
                cart
            )


            return
        }


        // ====================================================
        // GUEST
        // ====================================================

        setStoredCart(
            GUEST_CART_KEY,
            cart
        )

    }, [
        cart,
        authReady
    ])


    // ========================================================
    // PROVIDER
    // ========================================================

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