import {
  FolderTree,
  Images,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react'

// Sidebar, grouped. `exact` items only match their own path so the
// Dashboard is not highlighted on every /admin/* page.
export const ADMIN_NAV = [
  {
    group: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    group: 'Catalog',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/categories', label: 'Categories', icon: FolderTree },
      { href: '/admin/heroes', label: 'Hero banners', icon: Images },
    ],
  },
  {
    group: 'People & sales',
    items: [
      { href: '/users', label: 'Users', icon: Users },
      { href: '/profile#orders', label: 'Orders', icon: ShoppingBag },
    ],
  },
]

export const isNavActive = (item, pathname) =>
  item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href.split('#')[0])

// Page title and parent for the breadcrumb/back bar.
const PAGES = {
  '/admin': { title: 'Dashboard' },
  '/admin/products': { title: 'Products', parent: '/admin' },
  '/admin/heroes': { title: 'Hero banners', parent: '/admin' },
  '/categories': { title: 'Categories', parent: '/admin' },
  '/users': { title: 'Users', parent: '/admin' },
  '/edit_user/[id]': { title: 'Edit user', parent: '/users' },
  '/create/[[...id]]': { title: 'Product editor', parent: '/admin/products' },
}

export const getBreadcrumbs = (pathname) => {
  const trail = []
  let current = pathname

  while (current && PAGES[current]) {
    trail.unshift({ href: current, title: PAGES[current].title })
    current = PAGES[current].parent
  }

  if (trail[0]?.href !== '/admin') {
    trail.unshift({ href: '/admin', title: 'Dashboard' })
  }

  return trail
}
