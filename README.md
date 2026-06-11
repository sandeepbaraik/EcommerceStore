# Ecommerce Discount Store API

Express.js backend for an ecommerce store where customers can add items to a cart, checkout, and apply discount codes generated from every nth order.

## Current Status

This first setup commit establishes the project foundation:

- Express.js application entrypoint
- Health check route
- Jest and Supertest test setup
- Basic project scripts
- Documentation placeholders

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

## Project Flow

The API follows a simple request flow:

```text
routes -> controller -> service
```

- `routes` define endpoint paths.
- `controllers` validate requests and build responses.
- `services` contain business logic and manage in-memory data.

## Test

```bash
npm test
```

## Available Endpoints

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

### Products

```http
GET /products
```

Returns the available in-memory product catalog.

Response:

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

```http
GET /cart
```

Returns the current in-memory cart.

```http
POST /cart/items
```

Request:

```json
{
  "productId": "prod_keyboard",
  "quantity": 2
}
```

Response:

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

## Planned APIs

### Customer APIs

- `POST /checkout` - place order and optionally apply a discount code

### Admin APIs

- `POST /admin/discount-code` - generate a discount code when the nth-order condition is satisfied
- `GET /admin/stats` - list total items purchased, revenue, discount codes, and total discounts given
