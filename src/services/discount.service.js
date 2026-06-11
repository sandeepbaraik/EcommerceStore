/**
 * Discount Service
 * 
 * Manages discount code generation and validation.
 * 
 * Business Rule: Every nth completed order generates a discount code
 * for the NEXT customer.
 * 
 * Example: If nthOrderThreshold = 5, the 5th order triggers discount
 * code generation. That code is available for any future customer to apply
 * at checkout.
 */

const NTH_ORDER_THRESHOLD = 5;
const DISCOUNT_PERCENT = 10; // 10% discount

// In-memory storage
const state = {
    orders: [],
    discountCodes: [],
    orderCounter: 0
};

/**
 * Generate a random discount code
 * Format: DISC-XXXXXX (e.g., DISC-A7K3M2)
 */
function generateDiscountCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'DISC-';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Record a completed order and generate discount code if applicable
 * 
 * @param {number} cartTotal - Total amount of the order
 * @param {string} discountCodeUsed - Optional discount code that was applied (null if none)
 * @returns {{ orderNumber: number, discountCodeGenerated: string|null }}
 */
function recordOrder(cartTotal, discountCodeUsed = null) {
    state.orderCounter += 1;

    state.orders.push({
        orderNumber: state.orderCounter,
        total: cartTotal,
        discountCodeUsed,
        timestamp: new Date().toISOString()
    });

    let generatedCode = null;

    // Check if this order triggers discount code generation
    if (state.orderCounter % NTH_ORDER_THRESHOLD === 0) {
        generatedCode = generateDiscountCode();
        state.discountCodes.push({
            code: generatedCode,
            discountPercent: DISCOUNT_PERCENT,
            generatedAfterOrder: state.orderCounter,
            isUsed: false,
            usedAt: null
        });
    }

    return {
        orderNumber: state.orderCounter,
        discountCodeGenerated: generatedCode
    };
}

/**
 * Validate a discount code and return discount details
 * 
 * @param {string} code - Discount code to validate
 * @returns {{ valid: boolean, discountPercent: number|null, message: string }}
 */
function validateDiscountCode(code) {
    if (!code || typeof code !== 'string') {
        return {
            valid: false,
            discountPercent: null,
            message: 'Discount code is required'
        };
    }

    const discountCode = state.discountCodes.find(
        (dc) => dc.code === code.trim().toUpperCase()
    );

    if (!discountCode) {
        return {
            valid: false,
            discountPercent: null,
            message: 'Discount code not found'
        };
    }

    if (discountCode.isUsed) {
        return {
            valid: false,
            discountPercent: null,
            message: 'Discount code has already been used'
        };
    }

    return {
        valid: true,
        discountPercent: discountCode.discountPercent,
        message: `Valid discount code: ${discountCode.discountPercent}% off`
    };
}

/**
 * Mark a discount code as used
 * 
 * @param {string} code - Discount code to mark as used
 */
function markDiscountCodeAsUsed(code) {
    const discountCode = state.discountCodes.find(
        (dc) => dc.code === code.trim().toUpperCase()
    );

    if (discountCode && !discountCode.isUsed) {
        discountCode.isUsed = true;
        discountCode.usedAt = new Date().toISOString();
    }
}

/**
 * Get list of available (unused) discount codes
 */
function getAvailableDiscountCodes() {
    return state.discountCodes
        .filter((dc) => !dc.isUsed)
        .map((dc) => ({
            code: dc.code,
            discountPercent: dc.discountPercent,
            generatedAfterOrder: dc.generatedAfterOrder
        }));
}

/**
 * Get admin statistics
 */
function getStats() {
    const totalOrders = state.orders.length;
    const totalRevenue = state.orders.reduce((sum, order) => sum + order.total, 0);
    const usedDiscounts = state.discountCodes.filter((dc) => dc.isUsed);
    const totalDiscountsGiven = usedDiscounts.reduce(
        (sum, dc) => sum + (dc.discountPercent / 100) * state.orders.find(o => o.discountCodeUsed === dc.code)?.total || 0,
        0
    );

    return {
        totalOrders,
        totalRevenue,
        availableDiscountCodes: getAvailableDiscountCodes(),
        usedDiscountCodes: usedDiscounts.length,
        totalDiscountAmount: totalDiscountsGiven
    };
}

/**
 * Clear all data (for testing)
 */
function reset() {
    state.orders = [];
    state.discountCodes = [];
    state.orderCounter = 0;
}

module.exports = {
    recordOrder,
    validateDiscountCode,
    markDiscountCodeAsUsed,
    getAvailableDiscountCodes,
    getStats,
    reset
};
