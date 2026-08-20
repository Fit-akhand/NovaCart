import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { DataContext } from '../../store/GlobalState'

const AuthGuard = ({
    children,
    roles = []
}) => {
    const router = useRouter()
    const { state } = useContext(DataContext)

    const auth = state?.auth
    const user = auth?.user

    useEffect(() => {
        // Wait until router is ready
        if (!router.isReady) return

        // Auth is not loaded yet
        if (auth === undefined || auth === null) return

        // User is not logged in
        if (!user) {
            router.replace({
                pathname: '/signin',
                query: {
                    redirect: router.asPath
                }
            })

            return
        }

        // Role restriction
        if (
            roles.length > 0 &&
            !roles.includes(user.role)
        ) {
            router.replace('/')
        }
    }, [
        router.isReady,
        router,
        user,
        auth,
        roles
    ])

    // Don't render protected page while checking auth
    if (!user) {
        return null
    }

    // Check role
    if (
        roles.length > 0 &&
        !roles.includes(user.role)
    ) {
        return null
    }

    return children
}

export default AuthGuard