import { formatPrice } from '@/lib/formatPrice'

const ProductPrice = ({
  price,
  className = '',
}) => {
  const value = Number(price)

  return (
    <span
      className={`
        text-base font-semibold
        text-[var(--nova-text)]
        ${className}
      `}
    >
      {formatPrice(
        Number.isFinite(value)
          ? value
          : 0
      )}
    </span>
  )
}

export default ProductPrice