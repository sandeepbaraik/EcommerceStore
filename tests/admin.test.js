const request = require('supertest');
const createApp = require('../src/app');
const cartService = require('../src/services/cart.service');
const discountService = require('../src/services/discount.service');

describe('Admin API', () => {
    beforeEach(() => {
        cartService.clearCart();
        discountService.reset();
    });

    describe('POST /admin/discounts/generate', () => {
        it('generates a new discount code', async () => {
            const app = createApp();

            const response = await request(app)
                .post('/admin/discounts/generate')
                .send({});

            expect(response.status).toBe(200);
            expect(response.body.code).toBeDefined();
            expect(response.body.code).toMatch(/^DISC-[A-Z0-9]{6}$/);
            expect(response.body.discountPercent).toBe(10);
        });

        it('generates multiple unique codes', async () => {
            const app = createApp();

            const response1 = await request(app)
                .post('/admin/discounts/generate')
                .send({});

            const response2 = await request(app)
                .post('/admin/discounts/generate')
                .send({});

            expect(response1.body.code).not.toBe(response2.body.code);
        });
    });

    describe('GET /admin/stats', () => {
        it('returns stats with no orders', async () => {
            const app = createApp();

            const response = await request(app)
                .get('/admin/stats');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                totalOrders: 0,
                totalRevenue: 0,
                availableDiscountCodes: [],
                usedDiscountCodes: 0,
                totalDiscountAmount: 0
            });
        });

        it('returns stats after orders', async () => {
            const app = createApp();

            // Create 2 orders
            await request(app)
                .post('/cart/items')
                .send({ productId: 'prod_keyboard', quantity: 1 }); // 2500
            await request(app)
                .post('/checkout')
                .send({});

            await request(app)
                .post('/cart/items')
                .send({ productId: 'prod_mouse', quantity: 2 }); // 2400
            await request(app)
                .post('/checkout')
                .send({});

            const response = await request(app)
                .get('/admin/stats');

            expect(response.status).toBe(200);
            expect(response.body.totalOrders).toBe(2);
            expect(response.body.totalRevenue).toBe(4900); // 2500 + 2400
        });

        it('shows available codes when generated', async () => {
            const app = createApp();

            // Generate 3 orders to create a discount code
            for (let i = 0; i < 3; i++) {
                await request(app)
                    .post('/cart/items')
                    .send({ productId: 'prod_mouse', quantity: 1 });
                await request(app)
                    .post('/checkout')
                    .send({});
            }

            const response = await request(app)
                .get('/admin/stats');

            expect(response.status).toBe(200);
            expect(response.body.availableDiscountCodes.length).toBe(1);
            expect(response.body.usedDiscountCodes).toBe(0);
        });

        it('tracks used discount codes', async () => {
            const app = createApp();

            // Generate discount
            for (let i = 0; i < 3; i++) {
                await request(app)
                    .post('/cart/items')
                    .send({ productId: 'prod_mouse', quantity: 1 });
                await request(app)
                    .post('/checkout')
                    .send({});
            }

            const statsBeforeUse = await request(app)
                .get('/admin/stats');
            const code = statsBeforeUse.body.availableDiscountCodes[0].code;

            // Use the code
            await request(app)
                .post('/cart/items')
                .send({ productId: 'prod_keyboard', quantity: 1 });
            await request(app)
                .post('/checkout')
                .send({ discountCode: code });

            const statsAfterUse = await request(app)
                .get('/admin/stats');

            expect(statsAfterUse.body.availableDiscountCodes.length).toBe(0);
            expect(statsAfterUse.body.usedDiscountCodes).toBe(1);
        });

        it('counts revenue correctly with discounts', async () => {
            const app = createApp();

            // Generate discount code
            for (let i = 0; i < 3; i++) {
                await request(app)
                    .post('/cart/items')
                    .send({ productId: 'prod_mouse', quantity: 1 }); // 1200 each
                await request(app)
                    .post('/checkout')
                    .send({});
            }

            const stats1 = await request(app).get('/admin/stats');
            const code = stats1.body.availableDiscountCodes[0].code;

            // Order with 10% discount
            await request(app)
                .post('/cart/items')
                .send({ productId: 'prod_keyboard', quantity: 1 }); // 2500
            await request(app)
                .post('/checkout')
                .send({ discountCode: code }); // 10% = 250 discount, so 2250 revenue

            const stats2 = await request(app).get('/admin/stats');

            // Total revenue = 3 * 1200 + 2250 = 5850
            expect(stats2.body.totalRevenue).toBe(5850);
        });
    });
});
