export const toSafeUser = (user) => {
  if (!user) return null

  return {
    _id: user._id?.toString() || '',
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'user',
    avatar: user.avatar || '',
    root: Boolean(user.root),
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    pincode: user.pincode || '',
    phone: user.phone || '',
    createdAt: user.createdAt || null,
  }
}
