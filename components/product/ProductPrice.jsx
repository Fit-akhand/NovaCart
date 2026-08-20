import { formatPrice } from '@/lib/formatPrice'

const ProductPrice = ({ price, className = '' }) => {
  const value = Number(price) || 0

  return (
    <span
      className={`text-base font-semibold text-[var(--nova-text)] ${className}`}
    >
      {formatPrice(value)}
    </span>
  )
}

export default ProductPrice