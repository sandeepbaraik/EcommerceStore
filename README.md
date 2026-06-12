# Ecommerce Discount Store API

Express.js backend for an ecommerce store where customers can add items to a cart, checkout, and apply discount codes generated from every nth order.

## Features

- **Cart Management**: Add items, view cart with automatic calculations
- **Product Catalog**: 3 sample products with server-side price lookup
- **Checkout**: Complete orders with optional discount code validation
- **Discount System**: Auto-generates coupon codes every 3rd order (10% discount)
- **Admin APIs**: Generate discount codes manually and view system statistics
- **In-Memory Storage**: No database required, perfect for testing

## Tech Stack

- Node.js
- Express.js
- Jest + Supertest
- In-memory storage

## Setup

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

The API starts on `http://localhost:3000` by default.

## Test

```bash
npm test
```

All 37 tests pass covering cart, checkout, discount, and admin APIs.

## Project Architecture

The API follows a clean separation:

```text
routes -> controller -> service
```

- **Routes**: Define endpoint paths and HTTP methods
- **Controllers**: Validate requests and build HTTP responses
- **Services**: Contain business logic and manage in-memory data

## Available Endpoints

### Health Check

```http
GET /health
```

Check API status.

**Response:**

```json
{
  "status": "ok",
  "service": "ecommerce-discount-store"
}
```

### Products

#### Get All Products

```http
GET /products
```

Returns the available product catalog.

**Response:**

```json
{
  "products": [
    {
      "id": "prod_keyboard",
      "name": "Keyboard",
      "price": 2500
    },
    {
      "id": "prod_mouse",
      "name": "Mouse",
      "price": 1200
    },
    {
      "id": "prod_monitor",
      "name": "Monitor",
      "price": 15000
    }
  ]
}
```

### Cart

#### Get Cart

```http
GET /cart
```

View current cart with item count and subtotal.

**Response:**

```json
{
  "items": [
    {
      "productId": "prod_keyboard",
      "name": "Keyboard",
      "price": 2500,
      "quantity": 2,
      "lineTotal": 5000
    }
  ],
  "itemCount": 2,
  "subtotal": 5000
}
```

#### Add Item to Cart

```http
POST /cart/items
Content-Type: application/json

{
  "productId": "prod_keyboard",
  "quantity": 2
}
```

Adds item to cart or increases quantity if already present.

**Response:** Updated cart object (see above)

### Checkout

#### Complete Purchase

```http
POST /checkout
Content-Type: application/json

{
  "discountCode": "DISC-ABC123"
}
```

Complete checkout with optional discount code. Cart is automatically cleared on success.

**Request fields:**

- `discountCode` (optional): Valid discount code for 10% off

**Response (Success - 200):**

```json
{
  "orderNumber": 1,
  "items": [...],
  "subtotal": 5000,
  "discountCode": "DISC-ABC123",
  "discountPercent": 10,
  "discountAmount": 500,
  "total": 4500,
  "generatedDiscountCode": null,
  "message": "Order placed successfully!"
}
```

**Response (Error - 400):**

```json
{
  "error": "Cart is empty. Cannot checkout."
}
```

### Admin

#### Generate Discount Code (Manual)

```http
POST /admin/discounts/generate
```

Admin endpoint to manually generate a discount code (10% off).

**Response:**

```json
{
  "code": "DISC-K7M2P5",
  "discountPercent": 10,
  "message": "Admin generated discount code: DISC-K7M2P5"
}
```

#### Get System Statistics

```http
GET /admin/stats
```

View system-wide statistics: orders, revenue, discount codes.

**Response:**

```json
{
  "totalOrders": 5,
  "totalRevenue": 12500,
  "availableDiscountCodes": [
    {
      "code": "DISC-K7M2P5",
      "discountPercent": 10,
      "generatedAfterOrder": 5
    }
  ],
  "usedDiscountCodes": 2,
  "totalDiscountAmount": 1500
}
```

## How the Discount System Works

1. **Automatic Generation**: Every 3rd completed order generates a discount code
2. **Manual Generation**: Admins can generate codes anytime via `/admin/discounts/generate`
3. **Application**: Customers can apply a code at checkout for 10% discount
4. **One-Time Use**: Each code can only be used once, then marked as used
5. **Tracking**: Admin stats show available, used, and total discount amounts

## Testing with Postman

Import `postman_collection.json` into Postman to test all endpoints.

Example workflow:

1. Get products: `GET /products`
2. Add items to cart: `POST /cart/items`
3. View cart: `GET /cart`
4. Checkout: `POST /checkout`
5. Generate discount (admin): `POST /admin/discounts/generate`
6. View stats (admin): `GET /admin/stats`

## Design Decisions

See [DECISIONS.md](./DECISIONS.md) for detailed design reasoning on:

- In-memory storage
- Route/Controller/Service architecture
- Product catalog approach
- Discount code generation strategy
- Manual admin discount generation
- Cart auto-clear on checkout
