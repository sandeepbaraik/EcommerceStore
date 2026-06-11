const request = require('supertest');
const createApp = require('../src/app');
const cartService = require('../src/services/cart.service');

describe('Cart API', () => {
  beforeEach(() => {
    cartService.clearCart();
  });

  it('returns an empty cart by default', async () => {
    const app = createApp();

    const response = await request(app).get('/cart');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: [],
      itemCount: 0,
      subtotal: 0
    });
  });

  it('adds an item to the cart', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/cart/items')
      .send({
        productId: 'prod_keyboard',
        quantity: 2
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      items: [
        {
          productId: 'prod_keyboard',
          name: 'Keyboard',
          price: 2500,
          quantity: 2,
          lineTotal: 5000
        }
      ],
      itemCount: 2,
      subtotal: 5000
    });
  });

  it('increases quantity when adding the same item again', async () => {
    const app = createApp();

    await request(app)
      .post('/cart/items')
      .send({
        productId: 'prod_keyboard',
        quantity: 2
      });

    const response = await request(app)
      .post('/cart/items')
      .send({
        productId: 'prod_keyboard',
        quantity: 1
      });

    expect(response.status).toBe(201);
    expect(response.body.itemCount).toBe(3);
    expect(response.body.subtotal).toBe(7500);
    expect(response.body.items[0].quantity).toBe(3);
  });

  it('rejects invalid cart items', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/cart/items')
      .send({
        productId: '',
        quantity: 1
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'productId and quantity are required'
    });
  });

  it('rejects unknown products', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/cart/items')
      .send({
        productId: 'prod_unknown',
        quantity: 1
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Product not found'
    });
  });
});
