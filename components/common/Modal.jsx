import { useContext } from 'react'
import { useRouter } from 'next/router'
import { DataContext } from '../../store/GlobalState'
import { deleteItem } from '../../store/Actions'
import { deleteData } from '@/lib/api-client'
import ConfirmDialog from './ConfirmDialog'

const Modal = () => {
  const { state, dispatch } = useContext(DataContext)
  const { modal, auth } = state
  const router = useRouter()

  const item = modal?.[0]
  const open = Boolean(item)

  const deleteUser = (target) => {
    dispatch(deleteItem(target.data, target.id, target.type))
    deleteData(`user/${target.id}`, auth.token).then((res) => {
      if (res.err) return dispatch({ type: 'NOTIFY', payload: { error: res.err } })
      return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
    })
  }

  const deleteCategories = (target) => {
    deleteData(`categories/${target.id}`, auth.token).then((res) => {
      if (res.err) return dispatch({ type: 'NOTIFY', payload: { error: res.err } })
      dispatch(deleteItem(target.data, target.id, target.type))
      return dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
    })
  }

  const deleteProduct = (target) => {
    dispatch({ type: 'NOTIFY', payload: { loading: true } })
    deleteData(`product/${target.id}`, auth.token).then((res) => {
      if (res.err) return dispatch({ type: 'NOTIFY', payload: { error: res.err } })
      dispatch({ type: 'NOTIFY', payload: { success: res.msg } })
      return router.push('/')
    })
  }

  const handleConfirm = () => {
    if (!modal?.length) return

    for (const target of modal) {
      if (target.type === 'ADD_CART') {
        dispatch(deleteItem(target.id, target.data))
      }
      if (target.type === 'ADD_USERS') deleteUser(target)
      if (target.type === 'ADD_CATEGORIES') deleteCategories(target)
      if (target.type === 'DELETE_PRODUCT') deleteProduct(target)
    }

    dispatch({ type: 'ADD_MODAL', payload: [] })
  }

  return (
    <ConfirmDialog
      open={open}
      title={item?.title || 'Confirm'}
      description="Do you want to delete this item?"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={handleConfirm}
      onCancel={() => dispatch({ type: 'ADD_MODAL', payload: [] })}
    />
  )
}

export default Modal
