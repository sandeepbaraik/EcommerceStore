/**
 * Admin Service
 * 
 * Provides admin-only functionality:
 * 1. Manually generate discount codes
 * 2. Get system statistics
 */

const discountService = require('./discount.service');

/**
 * Manually generate a discount code (admin only)
 * This is separate from auto-generation on nth order
 * 
 * @returns {{ code: string, discountPercent: number }}
 */
function generateDiscountCode() {
    const result = discountService.addManualDiscountCode();

    return {
        code: result.code,
        discountPercent: result.discountPercent,
        message: `Admin generated discount code: ${result.code}`
    };
}

/**
 * Get admin statistics
 * 
 * @returns {{ totalOrders: number, totalRevenue: number, totalItemsSold: number, availableDiscounts: number, usedDiscounts: number, totalDiscountAmount: number }}
 */
function getAdminStats() {
    const stats = discountService.getStats();

    return {
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
        availableDiscountCodes: stats.availableDiscountCodes,
        usedDiscountCodes: stats.usedDiscountCodes,
        totalDiscountAmount: stats.totalDiscountAmount
    };
}

module.exports = {
    generateDiscountCode,
    getAdminStats
};
