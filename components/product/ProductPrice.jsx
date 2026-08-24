import { formatPrice } from '@/lib/formatPrice'

const ProductPrice = ({
  price,
  className = '',
}) => {
  const value = Number(price)

  return (
    <span
      className={`
        inline-block

        text-base
        font-bold
        leading-none
        tracking-[-0.01em]

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