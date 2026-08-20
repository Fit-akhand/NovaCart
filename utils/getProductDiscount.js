export const getProductDiscount = (product) => {
    const subcategory = product.subcategory
    const category = product.category

    // Subcategory discount overrides parent
    if (
        subcategory &&
        subcategory.discountActive
    ) {
        return Number(subcategory.discountPercent) || 0
    }

    // Otherwise inherit parent category discount
    if (
        category &&
        category.discountActive
    ) {
        return Number(category.discountPercent) || 0
    }

    return 0
}

export const getDiscountedPrice = (price, discount) => {
    const originalPrice = Number(price) || 0
    const discountPercent = Number(discount) || 0

    return Math.round(
        originalPrice * (1 - discountPercent / 100) * 100
    ) / 100
}