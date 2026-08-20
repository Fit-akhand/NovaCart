export const formatPrice = (price) => {
  const value = Number(price)

  if (!Number.isFinite(value)) {
    return '₹0'
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}