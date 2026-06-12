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

## 4. Discount Code Generation on Every Nth Order

The assignment specifies: "Every nth order gets a coupon code for x% discount."

**Context:** The system needs to track orders and auto-generate discount codes for customers. We chose n=3 (every 3rd order).

**Options Considered:**

- Option A: Generate code immediately after the customer places the nth order (reward them)
- Option B: Generate code after nth order completes, but make it available for ANY future customer
- Option C: Generate code for the NEXT customer (the n+1th customer gets the benefit)

**Choice:** Option B - Generate after nth order, available for any future customer

**Why:**

- Simpler implementation: no need to pre-assign codes to specific users
- More realistic: rewards increase engagement by making discount codes available to all customers
- Encourages repeat purchases: available discounts attract new customers
- Tradeoff: nth customer doesn't immediately benefit, but system stays stateless (no user accounts needed)
- Every 3rd order was chosen as a reasonable balance: frequent enough to reward customers, sparse enough to not over-issue codes

The system generates codes randomly (DISC-XXXXXX format) and marks them used when applied, preventing reuse.

## 5. Separate Manual Admin Discount Generation

The assignment requires: "Admin API to generate discount codes" plus automatic nth-order generation.

**Context:** The system auto-generates codes every 3rd order, but admins need to manually create codes too (for promotions, customer service, etc.).

**Options Considered:**

- Option A: Only auto-generate on nth order; admins can't manually create codes
- Option B: Have admins create codes separately, tracked differently from auto-generated ones
- Option C: Merge manual and auto codes into one system (treat them the same)

**Choice:** Option C - Single discount code system

**Why:**

- Simpler: one code validation/tracking system handles all codes
- Flexible: admins can fix customer issues or run promotions without code type differences
- Customers don't care where the code came from; they just want it to work
- Easier to audit: all codes tracked in one place with used/unused status

## 6. Clear Cart After Successful Checkout

**Context:** After an order completes, the customer's cart should not persist.

**Options Considered:**

- Option A: Keep cart items, let customer explicitly clear it
- Option B: Auto-clear cart after successful checkout
- Option C: Let the customer decide

**Choice:** Option B - Auto-clear on success

**Why:**

- Better UX: customer doesn't accidentally re-order the same items
- Matches real ecommerce: physical checkout clears the cart automatically
- Prevents bugs: no confusion about whether old cart persists
- Simple logic: on checkout success, always clear
- If checkout fails, cart stays for retry
