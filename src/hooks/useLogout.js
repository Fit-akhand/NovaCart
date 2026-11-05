import { useContext } from 'react'
import { DataContext } from '../../store/GlobalState'
import { postData } from '@/lib/api-client'

// Shared sign-out used by the store header and the admin header.
export default function useLogout(onDone) {
  const { state, dispatch } = useContext(DataContext)

  return async () => {
    try {
      // GlobalState reads this flag to avoid turning the account
      // cart into the guest cart on logout. Do not clear the cart here.
      sessionStorage.setItem('__novacart_logout', 'true')

      await postData('auth/logout', null, state?.auth?.token)

      localStorage.removeItem('firstLogin')

      dispatch({ type: 'AUTH', payload: {} })
      dispatch({ type: 'ADD_ORDERS', payload: [] })
      dispatch({ type: 'ADD_USERS', payload: [] })

      onDone?.()
      window.location.href = '/'
    } catch (error) {
      dispatch({
        type: 'NOTIFY',
        payload: { error: error?.message || 'Logout failed.' },
      })
    }
  }
}
