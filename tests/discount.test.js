const discountService = require('../src/services/discount.service');

describe('Discount Service', () => {
    beforeEach(() => {
        discountService.reset();
    });

    describe('validateDiscountCode', () => {
        it('rejects empty discount code', () => {
            const result = discountService.validateDiscountCode('');
            expect(result.valid).toBe(false);
            expect(result.message).toBe('Discount code is required');
        });

        it('rejects non-existent discount code', () => {
            const result = discountService.validateDiscountCode('INVALID');
            expect(result.valid).toBe(false);
            expect(result.message).toBe('Discount code not found');
        });

        it('accepts valid discount code', () => {
            // First, generate 5 orders to trigger discount code generation
            for (let i = 0; i < 5; i++) {
                discountService.recordOrder(10000);
            }

            const availableCodes = discountService.getAvailableDiscountCodes();
            const validCode = availableCodes[0].code;

            const result = discountService.validateDiscountCode(validCode);
            expect(result.valid).toBe(true);
            expect(result.discountPercent).toBe(10);
        });

        it('is case-insensitive', () => {
            // Generate discount code
            for (let i = 0; i < 5; i++) {
                discountService.recordOrder(10000);
            }

            const availableCodes = discountService.getAvailableDiscountCodes();
            const validCode = availableCodes[0].code;

            // Try lowercase version
            const result = discountService.validateDiscountCode(validCode.toLowerCase());
            expect(result.valid).toBe(true);
        });

        it('rejects used discount code', () => {
            // Generate discount code
            for (let i = 0; i < 5; i++) {
                discountService.recordOrder(10000);
            }

            const availableCodes = discountService.getAvailableDiscountCodes();
            const code = availableCodes[0].code;

            // Mark as used
            discountService.markDiscountCodeAsUsed(code);

            const result = discountService.validateDiscountCode(code);
            expect(result.valid).toBe(false);
            expect(result.message).toBe('Discount code has already been used');
        });
    });

    describe('recordOrder', () => {
        it('increments order counter', () => {
            const order1 = discountService.recordOrder(5000);
            expect(order1.orderNumber).toBe(1);

            const order2 = discountService.recordOrder(7000);
            expect(order2.orderNumber).toBe(2);
        });

        it('generates discount code on 5th order', () => {
            let result;
            for (let i = 1; i <= 5; i++) {
                result = discountService.recordOrder(10000);
                if (i < 5) {
                    expect(result.discountCodeGenerated).toBeNull();
                }
            }
            expect(result.discountCodeGenerated).not.toBeNull();
            expect(result.discountCodeGenerated).toMatch(/^DISC-[A-Z0-9]{6}$/);
        });

        it('generates discount code on 10th order', () => {
            let result;
            for (let i = 1; i <= 10; i++) {
                result = discountService.recordOrder(10000);
            }
            expect(result.discountCodeGenerated).not.toBeNull();
        });

        it('records discount code used when provided', () => {
            // Generate first discount
            for (let i = 0; i < 5; i++) {
                discountService.recordOrder(10000);
            }

            const availableCodes = discountService.getAvailableDiscountCodes();
            const code = availableCodes[0].code;

            // Record new order with discount
            const result = discountService.recordOrder(10000, code);
            expect(result.orderNumber).toBe(6);
        });
    });

    describe('getAvailableDiscountCodes', () => {
        it('returns empty list initially', () => {
            const codes = discountService.getAvailableDiscountCodes();
            expect(codes).toEqual([]);
        });

        it('returns available codes only', () => {
            // Generate codes
            for (let i = 0; i < 5; i++) {
                discountService.recordOrder(10000);
            }

            let availableCodes = discountService.getAvailableDiscountCodes();
            expect(availableCodes.length).toBe(1);

            // Mark as used
            discountService.markDiscountCodeAsUsed(availableCodes[0].code);

            availableCodes = discountService.getAvailableDiscountCodes();
            expect(availableCodes.length).toBe(0);
        });
    });

    describe('getStats', () => {
        it('returns initial stats', () => {
            const stats = discountService.getStats();
            expect(stats).toEqual({
                totalOrders: 0,
                totalRevenue: 0,
                availableDiscountCodes: [],
                usedDiscountCodes: 0,
                totalDiscountAmount: 0
            });
        });

        it('calculates stats after orders', () => {
            discountService.recordOrder(5000);
            discountService.recordOrder(3000);

            const stats = discountService.getStats();
            expect(stats.totalOrders).toBe(2);
            expect(stats.totalRevenue).toBe(8000);
        });

        it('includes generated discount codes in stats', () => {
            for (let i = 0; i < 5; i++) {
                discountService.recordOrder(10000);
            }

            const stats = discountService.getStats();
            expect(stats.availableDiscountCodes.length).toBe(1);
        });
    });
});
