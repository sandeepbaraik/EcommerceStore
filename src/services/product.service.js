const products = [
  {
    id: 'prod_keyboard',
    name: 'Keyboard',
    price: 2500
  },
  {
    id: 'prod_mouse',
    name: 'Mouse',
    price: 1200
  },
  {
    id: 'prod_monitor',
    name: 'Monitor',
    price: 15000
  }
];

function getProducts() {
  return products;
}

function getProductById(productId) {
  return products.find((product) => product.id === productId);
}

module.exports = {
  getProductById,
  getProducts
};
