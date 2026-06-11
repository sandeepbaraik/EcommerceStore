const cartService = require('../services/cart.service');

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function getCart(req, res) {
  res.status(200).json(cartService.getCart());
}

function addItem(req, res) {
  const { productId, quantity } = req.body;

  if (!isNonEmptyString(productId) || !isPositiveInteger(quantity)) {
    return res.status(400).json({
      error: 'productId and quantity are required'
    });
  }

  const result = cartService.addItem(productId.trim(), quantity);

  if (!result.success) {
    return res.status(404).json({
      error: result.error
    });
  }

  return res.status(201).json(result.cart);
}

module.exports = {
  addItem,
  getCart
};
