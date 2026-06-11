/**
 * Admin Controller
 * 
 * Handles HTTP requests for admin operations.
 */

const adminService = require('../services/admin.service');

/**
 * POST /admin/discounts/generate
 * 
 * Generate a manual discount code
 */
function generateDiscountCode(req, res) {
    const result = adminService.generateDiscountCode();
    return res.status(200).json(result);
}

/**
 * GET /admin/stats
 * 
 * Get system statistics: orders, revenue, discounts
 */
function getStats(req, res) {
    const stats = adminService.getAdminStats();
    return res.status(200).json(stats);
}

module.exports = {
    generateDiscountCode,
    getStats
};
