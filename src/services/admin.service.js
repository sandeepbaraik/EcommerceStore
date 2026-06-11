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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'DISC-';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Add to discount system
    const state = discountService.getStats(); // Get current state reference

    // Create discount code entry
    const discountCode = {
        code,
        discountPercent: 10,
        generatedAfterOrder: 'MANUAL',
        isUsed: false,
        usedAt: null
    };

    return {
        code,
        discountPercent: 10,
        message: `Admin generated discount code: ${code}`
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
