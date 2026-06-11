const express = require('express');
const healthRoutes = require('./routes/health.routes');

function createApp() {
  const app = express();

  app.use(express.json());

  app.use('/health', healthRoutes);

  app.use((req, res) => {
    res.status(404).json({
      error: 'Route not found'
    });
  });

  return app;
}

module.exports = createApp;
