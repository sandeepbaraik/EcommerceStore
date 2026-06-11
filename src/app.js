const express = require('express');
const adminRoutes = require('./routes/admin.routes');
const cartRoutes = require('./routes/cart.routes');
const checkoutRoutes = require('./routes/checkout.routes');
const healthRoutes = require('./routes/health.routes');
const productRoutes = require('./routes/product.routes');

function createApp() {
  const app = express();

  app.use(express.json());

  app.use('/health', healthRoutes);
  app.use('/products', productRoutes);
  app.use('/cart', cartRoutes);
  app.use('/checkout', checkoutRoutes);
  app.use('/admin', adminRoutes);

  app.use((req, res) => {
    res.status(404).json({
      error: 'Route not found'
    });
  });

  return app;
}

module.exports = createApp;
