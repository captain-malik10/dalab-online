# Ashal Market API Documentation

This document provides a detailed overview of all available API endpoints for the Ashal Market application, categorized by function and required authorization.

---

## 1. Public Endpoints

These endpoints are open and do not require any authentication.

### 1.1. Get All Categories

- **Endpoint:** `GET /api/categories`
- **Purpose:** Fetches a list of all product categories.
- **Response (200 OK):** An array of category objects.
  ```json
  [
    { "id": 1, "name": "Electronics", "image_url": "..." },
    { "id": 2, "name": "Books", "image_url": "..." }
  ]
  ```

### 1.2. Get All Products (Public)

- **Endpoint:** `GET /api/products`
- **Purpose:** Fetches all products with optional filtering.
- **Query Parameters:**
  - `categoryName` - Filter by category name
  - `vendorName` - Filter by vendor/store name
  - `minPrice` - Minimum price filter
  - `maxPrice` - Maximum price filter
  - `featured` - Filter featured products (true/false)
- **Response (200 OK):** An array of product objects with vendor and category information.

### 1.3. Get Product Details (Public)

- **Endpoint:** `GET /api/products/:id`
- **Purpose:** Fetches detailed information about a specific product including store info and reviews.
- **Response (200 OK):** A comprehensive product object.

### 1.4. Get All Vendors (Public)

- **Endpoint:** `GET /api/vendors-public`
- **Purpose:** Fetches a list of all approved vendors.
- **Response (200 OK):** An array of vendor objects.

### 1.5. Get Vendor Details (Public)

- **Endpoint:** `GET /api/vendors-public/:id`
- **Purpose:** Fetches detailed information about a specific vendor, including their products.
- **Response (200 OK):** A comprehensive vendor object with a list of products.

---

## 2. Contact Endpoints

### 2.1. Send Message to Store

- **Endpoint:** `POST /api/contact/store-contact`
- **Purpose:** Sends a contact message from a user to a specific store.
- **Body:** `{ "storeId": 1, "senderName": "...", "senderEmail": "...", "message": "..." }`
- **Response (200 OK):** `{ "message": "Contact message sent successfully!" }`

### 2.2. Send Message to Admin

- **Endpoint:** `POST /api/contact/admin-contact`
- **Purpose:** Sends a contact message from a user to the platform administrator.
- **Body:** `{ "senderName": "...", "senderEmail": "...", "message": "..." }`
- **Response (200 OK):** `{ "message": "Contact message sent successfully!" }`

---

## 3. Authentication Endpoints

These endpoints handle user and vendor registration and login.

### 3.1. Register a New User

- **Endpoint:** `POST /api/auth/register`
- **Purpose:** Creates a new user account (customer or vendor).
- **Body:** `{ "name": "...", "email": "...", "password": "...", "phone": "...", "role": "customer" }`
- **Response (201 Created):** `{ "message": "User registered successfully", "userId": 1 }`
- **Error (409 Conflict):** `{ "error": "Email already registered" }`

### 3.2. Login as a User

- **Endpoint:** `POST /api/auth/login`
- **Purpose:** Authenticates a user and returns a JWT token.
- **Body:** `{ "email": "...", "password": "..." }`
- **Response (200 OK):** `{ "token": "..." }`
- **Error (401 Unauthorized):** `{ "error": "Invalid email or password" }`

### 3.3. Login as a Vendor/Store

- **Endpoint:** `POST /api/vendors/login`
- **Purpose:** Authenticates a vendor and returns a JWT token.
- **Body:** `{ "email": "...", "password": "..." }`
- **Response (200 OK):** `{ "token": "...", "store_name": "..." }`
- **Error (401 Unauthorized):** `{ "error": "Invalid credentials" }`

---

## 4. User Management Endpoints

Endpoints for managing user profiles. Requires a **User Token**.

### 4.1. Get All Users

- **Endpoint:** `GET /api/users`
- **Purpose:** Retrieves all users (authenticated users only).
- **Response (200 OK):** An array of user objects.

### 4.2. Get Current User Profile

- **Endpoint:** `GET /api/users/me`
- **Purpose:** Retrieves the profile of the currently authenticated user.
- **Response (200 OK):** A user object.

### 4.3. Update Current User Profile

- **Endpoint:** `PUT /api/users/me`
- **Purpose:** Updates the profile of the currently authenticated user.
- **Body:** `{ "name": "...", "phone": "...", "email": "...", "password": "..." }`
- **Response (200 OK):** `{ "message": "User profile updated successfully." }`

### 4.4. Delete Current User Account

- **Endpoint:** `DELETE /api/users/me`
- **Purpose:** Deletes the account of the currently authenticated user.
- **Response (200 OK):** `{ "message": "User deleted successfully" }`

---

## 5. Shopping Cart & Wishlist Endpoints

Endpoints for managing a user's shopping cart and wishlist. Requires a **User Token**.

### 5.1. Cart Management

- **Get Cart Contents:** `GET /api/cart`
- **Add Item to Cart:** `POST /api/cart/items`
  - **Body:** `{ "productId": 15, "quantity": 1 }`
- **Update Item Quantity:** `PUT /api/cart/items/:itemId`
  - **Body:** `{ "quantity": 3 }`
- **Remove Item from Cart:** `DELETE /api/cart/items/:itemId`
- **Clear Cart:** `DELETE /api/cart`

### 5.2. Wishlist Management

- **Get Wishlist Contents:** `GET /api/wishlist`
- **Add Item to Wishlist:** `POST /api/wishlist/items`
  - **Body:** `{ "productId": 22 }`
- **Remove Item from Wishlist:** `DELETE /api/wishlist/items/:itemId`
- **Move Wishlist Item to Cart:** `POST /api/wishlist/items/:itemId/move-to-cart`

---

## 6. Product Review Endpoints

Endpoints for managing product reviews. Requires a **User Token**.

### 6.1. Create a Review

- **Endpoint:** `POST /api/reviews`
- **Purpose:** Creates a new review for a product.
- **Body:** `{ "product_id": 1, "rating": 5, "comment": "..." }`
- **Response (201 Created):** The new review object.

### 6.2. Get My Reviews

- **Endpoint:** `GET /api/reviews/me`
- **Purpose:** Retrieves all reviews written by the authenticated user.
- **Response (200 OK):** An array of review objects.

### 6.3. Delete a Review

- **Endpoint:** `DELETE /api/reviews/:id`
- **Purpose:** Deletes a review written by the authenticated user.
- **Response (200 OK):** `{ "message": "Review deleted successfully." }`

---

## 7. Vendor (Store) Management Endpoints

Endpoints for managing stores, products, and orders. Requires a **Vendor Token** unless specified otherwise.

### 7.1. Register a New Store

- **Endpoint:** `POST /api/vendors/register`
- **Purpose:** Creates a new store, linked to the authenticated user. Requires a **User Token**.
- **Body:** `{ "email": "...", "password": "...", "store_name": "...", "description": "...", "country": "...", "city": "...", "district": "..." }`
- **Response (201 Created):** `{ "message": "Vendor details saved.", "vendorId": 1 }`

### 7.2. Upload Store Documents

- **Endpoint:** `PUT /api/vendors/register/uploads/:vendorId`
- **Purpose:** Uploads store logo and license documents. Requires a **User Token**.
- **Content-Type:** `multipart/form-data`
- **Body:** Form data with `logo` and `license` files.

### 7.3. Get Current Store Profile

- **Endpoint:** `GET /api/vendors/me`
- **Purpose:** Retrieves the profile of the currently authenticated store.

### 7.4. Update Current Store Profile

- **Endpoint:** `PUT /api/vendors/me`
- **Purpose:** Updates the profile of the currently authenticated store.
- **Body:** `{ "store_name": "...", "description": "...", "country": "...", "city": "...", "district": "..." }`

### 7.5. Get Store Dashboard Data

- **Endpoint:** `GET /api/vendors/dashboard`
- **Purpose:** Gets a summary of dashboard data for the logged-in store.

---

## 8. Product Management Endpoints (for Vendors)

Endpoints for managing products. Requires a **Vendor Token**.

### 8.1. Get All Products for Store

- **Endpoint:** `GET /api/vendors/products`
- **Purpose:** Gets all products listed by the logged-in store.

### 8.2. Create a New Product

- **Endpoint:** `POST /api/vendors/products`
- **Purpose:** Creates a new product for the logged-in store.
- **Content-Type:** `multipart/form-data`
- **Body:** Form data with product details (`category_id`, `name`, `price`, `stock`, etc.) and `images` files.

### 8.3. Get a Single Product

- **Endpoint:** `GET /api/vendors/products/:id`
- **Purpose:** Gets a single product's details for the logged-in store.

### 8.4. Update a Product

- **Endpoint:** `PUT /api/vendors/products/:id`
- **Purpose:** Updates a product for the logged-in store.
- **Content-Type:** `multipart/form-data`
- **Body:** Form data with product details and optional new `images` files.

### 8.5. Delete a Product

- **Endpoint:** `DELETE /api/vendors/products/:id`
- **Purpose:** Deletes a product for the logged-in store.

---

## 9. Customer Order Management Endpoints

Endpoints for managing customer orders. Requires a **User Token**.

### 9.1. Create Order from Cart

- **Endpoint:** `POST /api/orders`
- **Purpose:** Creates a new order from the customer's shopping cart.
- **Body:** `{ "shipping_address": "..." }`
- **Response (201 Created):** `{ "message": "Order created successfully", "orderId": 1, "total": 299.99 }`

### 9.2. Get All Customer Orders

- **Endpoint:** `GET /api/orders`
- **Purpose:** Retrieves all orders for the authenticated customer.
- **Query Parameters:** `status`, `page`, `limit`

### 9.3. Get Specific Order Details

- **Endpoint:** `GET /api/orders/:orderId`
- **Purpose:** Retrieves detailed information about a specific order.

### 9.4. Cancel an Order

- **Endpoint:** `PUT /api/orders/:orderId`
- **Purpose:** Allows customers to cancel **pending** orders only.
- **Body:** `{ "status": "cancelled" }`

### 9.5. Delete a Cancelled Order

- **Endpoint:** `DELETE /api/orders/:orderId`
- **Purpose:** Allows customers to delete an order that has already been cancelled.

### 9.6. Mark Order as Delivered

- **Endpoint:** `PUT /api/orders/:orderId/delivered`
- **Purpose:** Allows a customer to confirm they have received an order.
- **Note:** The order status must be `shipped`.

### 9.7. Create Payment for Order

- **Endpoint:** `POST /api/orders/:orderId/payment`
- **Purpose:** Initiates payment for an order.
- **Body:** `{ "method": "EVC plus", "phone_number": "+252123456789" }`

### 9.8. Get Order Statistics

- **Endpoint:** `GET /api/orders/stats/summary`
- **Purpose:** Provides order statistics for the authenticated customer.

---

## 10. Vendor Order Management Endpoints

Endpoints for managing orders from a vendor perspective. Requires a **Vendor Token**.

### 10.1. Get All Orders for Store

- **Endpoint:** `GET /api/vendors/orders`
- **Purpose:** Gets all orders containing products from the logged-in store.

### 10.2. Get a Single Order for Store

- **Endpoint:** `GET /api/vendors/orders/:id`
- **Purpose:** Gets the details of a single order if it contains an item from the logged-in store.

---

## 11. File Upload Endpoints

### 11.1. Upload Single File

- **Endpoint:** `POST /api/upload`
- **Purpose:** Uploads a single file to ImageKit storage.
- **Content-Type:** `multipart/form-data`
- **Body:** Form data with `file` field.
- **Response (200 OK):** `{ "url": "...", "fileId": "..." }`

---

## 12. Admin Management Endpoints

These endpoints are for managing the platform. All require an **Admin Token**.

### 12.1. Get Admin Dashboard Data

- **Endpoint:** `GET /api/admin/dashboard`
- **Purpose:** Gets platform-wide statistics.

### 12.2. User Management (Admin)

- **List All Users:** `GET /api/admin/users`
- **Update Any User:** `PUT /api/admin/users/:id`
- **Delete Any User:** `DELETE /api/admin/users/:id`

### 12.3. Vendor Management (Admin)

- **List All Vendors:** `GET /api/admin/vendors`
- **Get Any Vendor Details:** `GET /api/admin/vendors/:id`
- **Update Any Vendor:** `PUT /api/admin/vendors/:id`
- **Update Vendor Status:** `PUT /api/admin/vendors/:id/status`
  - **Purpose:** Approves, rejects, or sets a vendor to pending.
  - **Body:** `{ "status": "approved" }` (or `rejected`, `pending`)
- **Delete Any Vendor:** `DELETE /api/admin/vendors/:id`

### 12.4. Order Management (Admin)

- **List All Orders:** `GET /api/admin/orders`
- **Get Any Order Details:** `GET /api/admin/orders/:id`
- **Approve an Order:** `PUT /api/admin/orders/:id/approve`
- **Deny an Order:** `PUT /api/admin/orders/:id/deny`
- **Assign/Update Delivery:** `POST /api/admin/orders/:id/assign-delivery`
  - **Body:** `{ "tracking_number": "..." }`

### 12.5. Delivery Management (Admin)

- **List All Deliveries:** `GET /api/admin/deliveries`
- **Update a Delivery:** `PUT /api/admin/deliveries/:id`
  - **Body:** `{ "tracking_number": "..." }`
- **Delete/Unassign a Delivery:** `DELETE /api/admin/deliveries/:id`

### 12.6. Product Management (Admin)

- **List All Products:** `GET /api/admin/products`
- **Get Any Product Details:** `GET /api/admin/products/:id`
- **Delete Any Product:** `DELETE /api/admin/products/:id`

### 12.7. Category Management (Admin)

- **Create a New Category:** `POST /api/admin/categories`
- **Update a Category:** `PUT /api/admin/categories/:id`
- **Delete a Category:** `DELETE /api/admin/categories/:id`

---

## Authentication & Authorization

### Token Types

- **User Token:** Required for user profile management and store registration.
- **Vendor Token:** Required for store management, product operations, and order viewing.
- **Admin Token:** Required for all administrative operations.

### Token Usage

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Error Responses

Common error responses include:

- **400 Bad Request:** Invalid request data.
- **401 Unauthorized:** Invalid or missing authentication token.
- **403 Forbidden:** Insufficient permissions.
- **404 Not Found:** Resource not found.
- **409 Conflict:** Resource already exists.
- **500 Internal Server Error:** Server error.
