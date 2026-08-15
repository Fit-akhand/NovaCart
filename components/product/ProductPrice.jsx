const ProductPrice = ({ price, className = '' }) => {
  const value = Number(price) || 0

  return (
    <span className={`text-base font-semibold text-[var(--nova-text)] ${className}`}>
      ${value.toFixed(2)}
    </span>
  )
}

export default ProductPrice
