# Design Decisions

This file records the reasoning behind implementation choices so the project shows how the system was built, not just the final code.

## 1. Keep Storage In Memory

The assignment asks for in-memory storage, so the app keeps cart and product data in JavaScript modules instead of using a database or JSON file.

This keeps the implementation lightweight and easy to review. The tradeoff is that data resets whenever the server restarts.

## 2. Use a Route Controller Service Flow

Each API follows this flow:

```text
routes -> controller -> service
```

- Routes define URLs and HTTP methods.
- Controllers validate request input and return HTTP responses.
- Services contain business logic and manage in-memory data.

This separation keeps the code simple while still making each layer easy to explain in an interview.

## 3. Add Products Before Checkout

The cart should not trust the client to send item names or prices, because a client could modify the price before calling the API.

Instead, the API exposes a small in-memory product catalog. Customers add items to the cart using `productId` and `quantity`; the backend looks up the product name and price.

This is closer to a real ecommerce flow while staying within the assignment scope.
