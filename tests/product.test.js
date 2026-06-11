const request = require('supertest');
const createApp = require('../src/app');

describe('Products API', () => {
  it('returns available products', async () => {
    const app = createApp();

    const response = await request(app).get('/products');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      products: [
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
      ]
    });
  });
});
