import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  User,
  Users,
} from 'lucide-react'

// Browse links: the same for everyone, always in the main bar.
export const MAIN_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories', adminOnly: true },
  { href: '/deals', label: 'Deals' },
]

// Account menu entries depend on the role, so customers never
// see seller/admin links that would only bounce them away.
export const getAccountLinks = (role) => {
  if (role === 'admin') {
    return [
      { href: '/admin', label: 'Admin dashboard', icon: LayoutDashboard },
      { href: '/users', label: 'Users', icon: Users },
      { href: '/profile', label: 'Profile', icon: User },
    ]
  }

  if (role === 'seller') {
    return [
      { href: '/seller', label: 'Seller dashboard', icon: LayoutDashboard },
      { href: '/seller/products', label: 'My products', icon: Package },
      { href: '/seller/orders', label: 'My orders', icon: ShoppingBag },
      { href: '/profile', label: 'Profile', icon: User },
    ]
  }

  return [
    { href: '/profile#orders', label: 'My orders', icon: Package },
    { href: '/profile', label: 'Profile', icon: User },
  ]
}

export const getMainLinks = (role) =>
  MAIN_LINKS.filter((link) => !link.adminOnly || role === 'admin')
