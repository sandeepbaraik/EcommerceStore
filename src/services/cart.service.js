const productService = require('./product.service');

const cart = {
  items: []
};

function formatCart() {
  const items = cart.items.map((item) => ({
    ...item,
    lineTotal: item.price * item.quantity
  }));

  return {
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.lineTotal, 0)
  };
}

function getCart() {
  return formatCart();
}

function addItem(productId, quantity) {
  const product = productService.getProductById(productId);

  if (!product) {
    return {
      success: false,
      error: 'Product not found'
    };
  }

  const existingItem = cart.items.find((item) => item.productId === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity
    });
  }

  return {
    success: true,
    cart: formatCart()
  };
}

function clearCart() {
  cart.items = [];
}

module.exports = {
  addItem,
  clearCart,
  getCart
};
