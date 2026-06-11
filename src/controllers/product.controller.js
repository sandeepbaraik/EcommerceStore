const productService = require('../services/product.service');

function getProducts(req, res) {
  res.status(200).json({
    products: productService.getProducts()
  });
}

module.exports = {
  getProducts
};
