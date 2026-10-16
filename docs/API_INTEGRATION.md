# Trakz Customer App - Backend API Integration Specs

This document provides the technical requirements, endpoint specifications, data contracts, and integration instructions for the **Trakz Merchant Backend Developer**.

---

## 1. Overview & Architecture

The customer application communicates with the backend via RESTful JSON APIs centralized in `/src/services/apiClient.js`.

When `VITE_USE_MOCK_DATA=false`, all requests are dispatched to `VITE_API_BASE_URL` with standard JWT Authorization headers:

```
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
```

---

## 2. Authentication Endpoints (`/auth`)

### `POST /auth/login`
- **Request Body**:
```json
{
  "login": "user@example.com",
  "password": "userPassword"
}
```
- **Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cust-101",
    "fullName": "Default User",
    "email": "user@example.com",
    "phone": "+63 917 123 4567",
    "avatar": "https://..."
  }
}
```

### `POST /auth/register`
- **Request Body**:
```json
{
  "fullName": "Maria Santos",
  "email": "maria@example.com",
  "phone": "+63 918 222 3333",
  "password": "secretPassword"
}
```

---

## 3. Merchant & Product Endpoints

### `GET /merchants`
- **Query Parameters**:
  - `category`: string (optional, e.g. `burgers`, `pizza`, `milktea`)
  - `search`: string (optional search keyword)
  - `openOnly`: boolean (`true`/`false`)
  - `minRating`: number (e.g. `4.5`)
  - `sortBy`: string (`rating`, `fastest`, `deliveryFee`)

### `GET /merchants/:id`
- **Response**:
```json
{
  "id": "merch-1",
  "name": "Burger Craft & Grills",
  "description": "Juicy smashed gourmet beef burgers...",
  "logo": "https://...",
  "coverImage": "https://...",
  "category": "burgers",
  "categoryName": "Burgers & American",
  "isOpen": true,
  "rating": 4.8,
  "reviewCount": 342,
  "deliveryFee": 49,
  "estimatedDeliveryTime": "20 - 30 min",
  "minOrderAmount": 150,
  "menuCategories": ["Popular Items", "Gourmet Burgers", "Sides & Fries"]
}
```

### `GET /merchants/:id/products`
- **Response**: Array of product objects containing variants and add-ons array.

---

## 4. Cart & Order Endpoints

### `POST /orders`
- **Request Body**:
```json
{
  "customerId": "cust-101",
  "merchantId": "merch-1",
  "items": [
    {
      "id": "prod-101",
      "name": "Trakz Supreme Double Smash Burger",
      "quantity": 2,
      "price": 289,
      "selectedVariant": { "id": "v1", "name": "Double Patty", "price": 0 },
      "selectedAddOns": [{ "id": "a1", "name": "Extra Bacon", "price": 45 }],
      "itemTotal": 334
    }
  ],
  "subtotal": 668,
  "deliveryFee": 49,
  "discount": 100,
  "voucherCode": "TRAKZ100",
  "taxAndFees": 15,
  "total": 632,
  "paymentMethod": "GCash",
  "deliveryAddress": {
    "street": "Unit 12B Tower 2",
    "barangay": "San Lorenzo",
    "city": "Makati City"
  },
  "deliveryInstructions": "Ring bell on arrival"
}
```

### `GET /orders/:id`
- Returns order details with current `orderStatus` matching one of:
  1. `Pending`
  2. `Confirmed`
  3. `Preparing`
  4. `Ready for pickup`
  5. `Rider assigned`
  6. `Picked up`
  7. `On the way`
  8. `Delivered`
  9. `Cancelled`

---

## 5. Address Management Endpoints

- `GET /addresses`: Returns customer saved address list.
- `POST /addresses`: Adds a new address.
- `PUT /addresses/:id/default`: Marks an address as default.
- `DELETE /addresses/:id`: Removes an address.

---

## 6. Security & Payment Policy

1. **Client Price Non-Authority**: Frontend order totals are calculated for display only. The backend MUST validate item prices, merchant active status, and discount voucher validity before confirming orders.
2. **Payment Processing**: For digital payments (GCash, Maya, Card), the backend must generate transaction webhooks before updating `paymentStatus` to `Paid`.
