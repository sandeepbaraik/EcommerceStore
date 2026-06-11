const request = require('supertest');
const createApp = require('../src/app');
const cartService = require('../src/services/cart.service');
const discountService = require('../src/services/discount.service');

describe('Checkout API', () => {
    beforeEach(() => {
        cartService.clearCart();
        discountService.reset();
    });

    describe('POST /checkout', () => {
        it('returns error when cart is empty', async () => {
            const app = createApp();

            const response = await request(app)
                .post('/checkout')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Cart is empty');
        });

        it('successfully checks out with items', async () => {
            const app = createApp();

            // Add item to cart
            await request(app)
                .post('/cart/items')
                .send({ productId: 'prod_keyboard', quantity: 2 });

            // Checkout
            const response = await request(app)
                .post('/checkout')
                .send({});

            expect(response.status).toBe(200);
            expect(response.body.orderNumber).toBe(1);
            expect(response.body.subtotal).toBe(5000); // 2 * 2500
            expect(response.body.total).toBe(5000); // No discount
            expect(response.body.discountAmount).toBe(0);
            expect(response.body.message).toBe('Order placed successfully!');
        });

        it('clears cart after successful checkout', async () => {
            const app = createApp();

            // Add item to cart
            await request(app)
                .post('/cart/items')
                .send({ productId: 'prod_keyboard', quantity: 1 });

            // Verify item in cart
            let cartResponse = await request(app).get('/cart');
            expect(cartResponse.body.itemCount).toBe(1);

            // Checkout
            await request(app)
                .post('/checkout')
                .send({});

            // Verify cart is empty
            cartResponse = await request(app).get('/cart');
            expect(cartResponse.body.itemCount).toBe(0);
        });

        it('applies valid discount code', async () => {
            const app = createApp();

            // Generate 5 orders to create a discount code
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post('/cart/items')
                    .send({ productId: 'prod_mouse', quantity: 1 });
                await request(app).post('/checkout').send({});
            }

            // Get available discount code
            const availableCodes = discountService.getAvailableDiscountCodes();
            const validCode = availableCodes[0].code;

            // Add item to cart
            await request(app)
                .post('/cart/items')
                .send({ productId: 'prod_keyboard', quantity: 2 });

            // Checkout with discount
            const response = await request(app)
                .post('/checkout')
                .send({ discountCode: validCode });

            expect(response.status).toBe(200);
            expect(response.body.discountCode).toBe(validCode);
            expect(response.body.discountPercent).toBe(10);
            expect(response.body.discountAmount).toBe(500); // 10% of 5000
            expect(response.body.total).toBe(4500); // 5000 - 500
        });

        it('rejects invalid discount code', async () => {
            const app = createApp();

            await request(app)
                .post('/cart/items')
                .send({ productId: 'prod_keyboard', quantity: 1 });

            const response = await request(app)
                .post('/checkout')
                .send({ discountCode: 'INVALID' });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Discount code not found');
        });

        it('rejects already-used discount code', async () => {
            const app = createApp();

            // Generate discount code
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post('/cart/items')
                    .send({ productId: 'prod_mouse', quantity: 1 });
                await request(app).post('/checkout').send({});
            }

            const availableCodes = discountService.getAvailableDiscountCodes();
            const code = availableCodes[0].code;

            // First checkout with code
            await request(app)
                .post('/cart/items')
                .send({ productId: 'prod_mouse', quantity: 1 });
            await request(app)
                .post('/checkout')
                .send({ discountCode: code });

            // Second checkout attempt with same code
            await request(app)
                .post('/cart/items')
                .send({ productId: 'prod_mouse', quantity: 1 });
            const response = await request(app)
                .post('/checkout')
                .send({ discountCode: code });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('already been used');
        });

        it('generates discount code on 5th order', async () => {
            const app = createApp();

            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post('/cart/items')
                    .send({ productId: 'prod_mouse', quantity: 1 });
                const response = await request(app).post('/checkout').send({});

                if (i < 4) {
                    expect(response.body.generatedDiscountCode).toBeNull();
                } else {
                    expect(response.body.generatedDiscountCode).not.toBeNull();
                    expect(response.body.generatedDiscountCode).toMatch(/^DISC-[A-Z0-9]{6}$/);
                }
            }
        });

        it('is case-insensitive for discount codes', async () => {
            const app = createApp();

            // Generate discount
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post('/cart/items')
                    .send({ productId: 'prod_mouse', quantity: 1 });
                await request(app).post('/checkout').send({});
            }

            const code = discountService.getAvailableDiscountCodes()[0].code;

            // Try with lowercase
            await request(app)
                .post('/cart/items')
                .send({ productId: 'prod_mouse', quantity: 1 });
            const response = await request(app)
                .post('/checkout')
                .send({ discountCode: code.toLowerCase() });

            expect(response.status).toBe(200);
            expect(response.body.discountPercent).toBe(10);
        });

        it('correctly calculates multiple items with discount', async () => {
            const app = createApp();

            // Generate discount
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post('/cart/items')
                    .send({ productId: 'prod_mouse', quantity: 1 });
                await request(app).post('/checkout').send({});
            }

            const code = discountService.getAvailableDiscountCodes()[0].code;

            // Add multiple items
            await request(app)
                .post('/cart/items')
                .send({ productId: 'prod_keyboard', quantity: 2 }); // 5000
            await request(app)
                .post('/cart/items')
                .send({ productId: 'prod_mouse', quantity: 3 }); // 3600
            // Subtotal: 8600

            const response = await request(app)
                .post('/checkout')
                .send({ discountCode: code });

            expect(response.status).toBe(200);
            expect(response.body.subtotal).toBe(8600);
            expect(response.body.discountAmount).toBe(860); // 10% of 8600
            expect(response.body.total).toBe(7740);
        });
    });
});
