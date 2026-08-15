import ProductCard from './ProductCard'

const ProductGrid = ({ products = [], handleCheck }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          handleCheck={handleCheck}
        />
      ))}
    </div>
  )
}

export default ProductGrid
