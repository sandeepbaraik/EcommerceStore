const express = require('express');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.post('/discounts/generate', adminController.generateDiscountCode);
router.get('/stats', adminController.getStats);

module.exports = router;
