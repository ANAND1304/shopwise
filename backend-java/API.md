# ShopWise Java Backend API

Base URL: `http://localhost:8080`

All authenticated endpoints require header: `Authorization: Bearer <jwt_token>`

## Auth

### POST /api/auth/register
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "SecurePass123" }
```
Returns `{ token, type, id, name, email, roles }`

### POST /api/auth/login
```json
{ "email": "jane@example.com", "password": "SecurePass123" }
```
Returns same shape as register.

## Products (public read, admin write)

| Method | Path | Description |
|---|---|---|
| GET | `/api/products?page=0&size=12&category=electronics&sort=newest` | Paginated product list |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/search?q=running+shoes` | Keyword (regex) search, fallback for AI search |
| GET | `/api/products/{id}` | Product by ID |
| GET | `/api/products/slug/{slug}` | Product by slug |
| POST | `/api/products` | **ADMIN** — create product (triggers async AI indexing) |
| PUT | `/api/products/{id}` | **ADMIN** — update product (triggers re-indexing) |
| DELETE | `/api/products/{id}` | **ADMIN** — soft delete |

`sort` options: `newest`, `price_asc`, `price_desc`, `rating`

### Product create/update body
```json
{
  "title": "Wireless Headphones",
  "description": "Premium noise-cancelling headphones...",
  "price": 199.99,
  "category": "electronics",
  "brand": "SoundWave",
  "stock": 50,
  "images": ["https://..."],
  "tags": ["audio", "wireless"],
  "featured": true
}
```

## Categories

| Method | Path | Description |
|---|---|---|
| GET | `/api/categories` | Distinct list of active product categories |

## Cart (authenticated)

| Method | Path | Description |
|---|---|---|
| GET | `/api/cart` | Get current user's cart |
| POST | `/api/cart/items` | Add item `{ productId, quantity }` |
| PUT | `/api/cart/items/{productId}?quantity=N` | Update quantity (0 removes item) |
| DELETE | `/api/cart/items/{productId}` | Remove item |
| DELETE | `/api/cart` | Clear cart |

## Orders (authenticated)

| Method | Path | Description |
|---|---|---|
| POST | `/api/orders` | Place order — see body below |
| GET | `/api/orders?page=0&size=10` | Current user's orders |
| GET | `/api/orders/{orderId}` | Order detail (must belong to user) |

### Order create body
```json
{
  "items": [{ "productId": "...", "quantity": 2 }],
  "shippingAddress": {
    "fullName": "Jane Doe",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "Springfield",
    "state": "IL",
    "postalCode": "62704",
    "country": "USA",
    "phone": "+1-555-0100"
  }
}
```

## Admin (ADMIN role required)

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/orders?page=0&size=20` | All orders |
| PATCH | `/api/admin/orders/{orderId}/status?status=SHIPPED` | Update order status |
| POST | `/api/admin/reindex` | Trigger AI embedding reindex (proxies to Node service) |

Order statuses: `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`

## Error format

```json
{ "success": false, "message": "Product not found with id: 123", "data": null }
```

Validation errors (400) return a field-keyed map instead:
```json
{ "title": "Title is required", "price": "Price must be positive" }
```

## HTTP status codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | No content (delete/clear) |
| 400 | Validation / bad request |
| 401 | Invalid credentials / missing token |
| 403 | Insufficient role |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Unexpected server error |
