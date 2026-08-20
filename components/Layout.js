import { useRouter } from 'next/router'
import { useContext, useState } from 'react'
import { DataContext } from '../store/GlobalState'
import Notify from './Notify'
import Modal from './common/Modal'
import StoreHeader from './layout/StoreHeader'
import StoreFooter from './layout/StoreFooter'
import AdminHeader from './layout/AdminHeader'
import AdminSidebar from './layout/AdminSidebar'

const ADMIN_PREFIXES = [
  '/admin',
  '/create',
  '/users',
  '/edit_user',
  '/categories',
]

const AUTH_PAGES = ['/signin', '/register']

function Layout({ children }) {
  const router = useRouter()
  const { state } = useContext(DataContext)

  const role = state?.auth?.user?.role
  const isAdmin = role === 'admin'

  const [adminMenuOpen, setAdminMenuOpen] = useState(false)

  const isAuthPage =
    AUTH_PAGES.includes(router.pathname)

  const isAdminRoute =
    ADMIN_PREFIXES.some((prefix) =>
      router.pathname.startsWith(prefix)
    )

  if (isAuthPage) {
    return (
      <div className="min-h-screen min-w-0 w-full bg-[var(--nova-bg)] text-[var(--nova-text)]">
        <Notify />
        <Modal />
        {children}
      </div>
    )
  }

  if (isAdmin && isAdminRoute) {
    return (
      <div className="flex min-h-screen min-w-0 w-full flex-col bg-[var(--nova-bg)] text-[var(--nova-text)]">

        <AdminHeader
          onMenuClick={() =>
            setAdminMenuOpen(true)
          }
        />

        <Notify />
        <Modal />

        <div className="flex min-h-0 flex-1">

          <AdminSidebar
            open={adminMenuOpen}
            onClose={() =>
              setAdminMenuOpen(false)
            }
          />

          <main className="min-w-0 flex-1">
            {children}
          </main>

        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen min-w-0 w-full flex-col bg-[var(--nova-bg)] text-[var(--nova-text)]">

      <StoreHeader />

      <Notify />
      <Modal />

      <div className="min-w-0 w-full flex-1">
        {children}
      </div>

      <StoreFooter />

    </div>
  )
}

export default Layout