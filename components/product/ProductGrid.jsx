import ProductCard from './ProductCard'

const ProductGrid = ({
  products = [],
  handleCheck,
}) => {
  return (
    <div
      className="
        grid
        min-w-0

        grid-cols-2
        gap-3

        sm:grid-cols-2
        sm:gap-5

        lg:grid-cols-3
        lg:gap-6

        xl:grid-cols-4
      "
    >
      {products.map((product) => (
        <div
          key={product._id}
          className="
            min-w-0
          "
        >
          <ProductCard
            product={product}
            handleCheck={handleCheck}
          />
        </div>
      ))}
    </div>
  )
}

export default ProductGrid