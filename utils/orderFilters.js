// Checkout creates a pending order before the customer pays.
// Until payment is confirmed it is just a placeholder, so it must
// never show up in order lists, counts or dashboards.
export const CONFIRMED_ORDERS = {
    $nor: [
        { paid: false, razorpayOrderId: { $type: 'string' } }
    ]
}
