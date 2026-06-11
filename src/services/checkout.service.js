/**
 * Checkout Service
 * 
 * Handles the order completion flow:
 * 1. Validate cart is not empty
 * 2. Validate discount code (if provided)
 * 3. Calculate order total with discount
 * 4. Record order in discount system
 * 5. Return order confirmation
 */

const discountService = require('./discount.service');

/**
 * Process checkout and complete the order
 * 
 * @param {Array} cartItems - Array of cart items with product details
 * @param {number} cartSubtotal - Subtotal before discount
 * @param {string} discountCode - Optional discount code to apply
 * @returns {{ success: boolean, error?: string, order?: object }}
 */
function checkout(cartItems, cartSubtotal, discountCode = null) {
    // Validate cart is not empty
    if (!cartItems || cartItems.length === 0) {
        return {
            success: false,
            error: 'Cart is empty. Cannot checkout.'
        };
    }

    // Validate cart has valid total
    if (!Number.isFinite(cartSubtotal) || cartSubtotal <= 0) {
        return {
            success: false,
            error: 'Invalid cart total'
        };
    }

    let discountAmount = 0;
    let discountPercent = 0;
    let finalTotal = cartSubtotal;

    // Validate and apply discount if provided
    if (discountCode) {
        const validation = discountService.validateDiscountCode(discountCode);

        if (!validation.valid) {
            return {
                success: false,
                error: validation.message
            };
        }

        discountPercent = validation.discountPercent;
        discountAmount = Math.round((cartSubtotal * discountPercent) / 100);
        finalTotal = cartSubtotal - discountAmount;
    }

    // Record the order and check if discount code should be generated
    const orderRecord = discountService.recordOrder(finalTotal, discountCode || null);

    // Mark discount code as used if it was applied
    if (discountCode) {
        discountService.markDiscountCodeAsUsed(discountCode);
    }

    return {
        success: true,
        order: {
            orderNumber: orderRecord.orderNumber,
            items: cartItems,
            subtotal: cartSubtotal,
            discountCode: discountCode || null,
            discountPercent: discountPercent,
            discountAmount: discountAmount,
            total: finalTotal,
            generatedDiscountCode: orderRecord.discountCodeGenerated,
            message: orderRecord.discountCodeGenerated
                ? `Order placed! Next customer can use code: ${orderRecord.discountCodeGenerated}`
                : 'Order placed successfully!'
        }
    };
}

module.exports = {
    checkout
};
