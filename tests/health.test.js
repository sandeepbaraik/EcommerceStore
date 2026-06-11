const request = require('supertest');
const createApp = require('../src/app');

describe('Health API', () => {
  it('returns service status', async () => {
    const app = createApp();

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'ecommerce-discount-store'
    });
  });
});
