/**
 * Checkout Controller
 * 
 * Handles HTTP requests for checkout operations.
 */

const checkoutService = require('../services/checkout.service');
const cartService = require('../services/cart.service');

/**
 * POST /checkout
 * 
 * Accepts optional discount code and completes the purchase.
 * Clears the cart on successful checkout.
 */
function checkout(req, res) {
    const { discountCode } = req.body;

    // Get current cart
    const cart = cartService.getCart();

    // Attempt checkout
    const result = checkoutService.checkout(
        cart.items,
        cart.subtotal,
        discountCode || null
    );

    if (!result.success) {
        return res.status(400).json({
            error: result.error
        });
    }

    // Clear cart after successful checkout
    cartService.clearCart();

    return res.status(200).json(result.order);
}

module.exports = {
    checkout
};
