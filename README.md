# Ecommerce Discount Store API

Express.js backend for an ecommerce store where customers can add items to a cart, checkout, and apply discount codes generated from every nth order.

## Current Status

This first setup commit establishes the project foundation:

- Express.js application entrypoint
- Health check route
- Jest and Supertest test setup
- Basic project scripts
- Documentation and decision log placeholders

Feature APIs for cart, checkout, discount generation, and admin stats will be added in focused follow-up commits.

## Tech Stack

- Node.js
- Express.js
- Jest
- Supertest
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

## Available Endpoint

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "ecommerce-discount-store"
}
```

## Planned APIs

### Customer APIs

- `POST /cart/items` - add item to cart
- `POST /checkout` - place order and optionally apply a discount code

### Admin APIs

- `POST /admin/discount-code` - generate a discount code when the nth-order condition is satisfied
- `GET /admin/stats` - list total items purchased, revenue, discount codes, and total discounts given
