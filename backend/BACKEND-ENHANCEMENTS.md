# Backend Enhancement Guide

## Overview

This document outlines all the security, validation, and error handling improvements made to the Gousamhitha backend API.

## Table of Contents

1. [Validation & Input Sanitization](#validation--input-sanitization)
2. [Error Handling](#error-handling)
3. [Standardized Responses](#standardized-responses)
4. [HTTP Status Codes](#http-status-codes)
5. [Security Features](#security-features)
6. [Rate Limiting](#rate-limiting)
7. [Best Practices](#best-practices)
8. [API Examples](#api-examples)

---

## Validation & Input Sanitization

### Request Validation

All API endpoints now use **Joi** for comprehensive request validation:

- **Body Validation**: Validates POST/PUT request bodies
- **Query Validation**: Validates URL query parameters
- **Parameter Validation**: Validates URL path parameters (e.g., IDs)

### Validation Features

✅ **Type Checking**: Ensures data types are correct (string, number, UUID, email, etc.)
✅ **Format Validation**: Validates email, phone, pincode formats
✅ **Range Validation**: Checks min/max values for quantities, prices
✅ **Required Fields**: Enforces mandatory fields
✅ **Custom Error Messages**: User-friendly validation error messages
✅ **Automatic Sanitization**: Trims strings, removes unknown fields

### Example: Product Creation Validation

```javascript
// Request body must have:
{
  "name": "Organic Tomatoes",              // string, 2-200 chars
  "category": "Vegetables",                 // string, 2-100 chars
  "price": 45.50,                          // positive number
  "stock": 100,                             // non-negative integer
  "image_url": "https://example.com/img",  // optional, must be URL
  "unit": "kg",                             // optional
  "unit_quantity": "500g",                  // optional
  "display_unit": "1 kg"                    // optional
}
```

If validation fails, request is rejected with 400 status and detailed error message.

---

## Error Handling

### Global Error Handler

All errors are caught via Express error middleware:

1. **Synchronous Errors**: Caught naturally by Express
2. **Async Errors**: Caught by `asyncHandler` wrapper
3. **Uncaught Errors**: Fall through to global error handler

### Error Classes

```javascript
// AppError - Operational errors (expected failures)
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // We know about this error
  }
}

// Usage in controllers:
throw new AppError('Product not found', 404);
throw new AppError('Insufficient stock', 422);
throw new AppError('Duplicate email', 409);
```

### Error Logging

Comprehensive error logging includes:
- Timestamp
- Error message
- HTTP status code
- Request path and method
- Client IP address
- Stack trace (development only)

### Example Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Product name is required",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

---

## Standardized Responses

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Invalid email format",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

### Batch Response (for lists)

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [...],
    "total": 150,
    "count": 20
  },
  "message": "Products fetched successfully",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

### Response Helper Functions

```javascript
// utils/response.js
successResponse(res, 200, data, message);      // 200 OK
createdResponse(res, data, message);           // 201 Created
errorResponse(res, 400, message);              // Error response
batchResponse(res, 200, items, total, msg);    // List response
paginatedResponse(res, items, page, limit, total, msg);
```

---

## HTTP Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, PUT, or DELETE |
| 201 | Created | Successful POST |
| 204 | No Content | DELETE without response body |
| 400 | Bad Request | Validation error or invalid input |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User lacks permission (not admin) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate record (email, product name) |
| 422 | Unprocessable Entity | Business logic error (out of stock) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error (database failure) |

### Examples

```javascript
// 200 - Success
return successResponse(res, 200, product, 'Product retrieved successfully');

// 201 - Created
return createdResponse(res, product, 'Product created successfully');

// 400 - Validation error (from Joi)
throw new AppError('Email is required', 400);

// 401 - Unauthorized
throw new AppError('Invalid or expired token', 401);

// 404 - Not found
throw new AppError('Product not found', 404);

// 409 - Conflict
throw new AppError('Email already registered', 409);

// 422 - Business logic error
throw new AppError('Only 10 units available in stock', 422);
```

---

## Security Features

### 1. Helmet.js - Security Headers

Protects against common vulnerabilities:

```javascript
- X-Frame-Options: Prevents clickjacking
- X-Content-Type-Options: Prevents MIME sniffing
- Strict-Transport-Security: Enforces HTTPS
- Content-Security-Policy: Prevents XSS attacks
```

### 2. XSS Protection

- Sanitizes all string inputs
- Removes dangerous HTML/JavaScript
- Applied to body and query parameters

### 3. CORS - Cross-Origin Resource Sharing

Configured origins:
```javascript
- http://localhost:3000
- http://127.0.0.1:3000
- http://localhost:5500
- http://127.0.0.1:5500
- process.env.FRONTEND_URL
```

### 4. Input Sanitization

All inputs are automatically sanitized:
- Strings are trimmed (leading/trailing whitespace removed)
- Unknown fields are stripped from requests
- Email and phone formats are validated

### 5. Rate Limiting

Prevents abuse and DDoS attacks:

```javascript
// General API: 100 requests per 15 minutes
apiLimiter: 100 / 15 min

// Authentication: 5 attempts per 15 minutes (strict)
authLimiter: 5 / 15 min

// Write operations: 20 requests per 15 minutes
writeLimiter: 20 / 15 min
```

---

## Rate Limiting

### Endpoint-Specific Rate Limits

```javascript
// Auth endpoints (5 requests per 15 minutes)
POST   /api/auth/signup
POST   /api/auth/signin

// All other API endpoints (100 requests per 15 minutes)
GET    /api/products
POST   /api/cart
GET    /api/orders
PUT    /api/users/:id

// Write operations (if needed, 20 per 15 minutes)
POST   /api/products (admin)
PUT    /api/orders/:id/status (admin)
DELETE /api/products/:id (admin)
```

### Rate Limit Response

```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later",
  "statusCode": 429
}
```

### Reset Rate Limits (Development)

```bash
# Check Redis for rate limit keys
redis-cli KEYS "ratelimit:*"

# Clear all rate limits
redis-cli FLUSHDB
```

---

## Best Practices

### 1. Always Use asyncHandler

```javascript
// ✅ CORRECT
const getProduct = asyncHandler(async (req, res) => {
    // errors are automatically caught
    const { data } = await supabase.from('products').select();
    return successResponse(res, 200, data);
});

// ❌ WRONG - Don't use bare try-catch
async function getProduct(req, res) {
    try {
        // ...
    } catch (err) {
        res.json({ error: 'Error' }); // Silent failure
    }
}
```

### 2. Throw Errors Instead of Returning Them

```javascript
// ✅ CORRECT
if (!product) {
    throw new AppError('Product not found', 404);
}

// ❌ WRONG
if (!product) {
    return res.status(404).json({ error: 'Not found' });
}
```

### 3. Validate Before DB Operations

```javascript
// ✅ CORRECT
const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // ID is already validated by validateParams middleware
    
    const { data } = await supabase.from('products').select().eq('id', id);
    return successResponse(res, 200, data);
});

// ❌ WRONG - Don't re-validate
const getProductById = (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'ID required' });
    // ...
};
```

### 4. Use Standardized Response Functions

```javascript
// ✅ CORRECT
return successResponse(res, 200, product);
return createdResponse(res, order);
return batchResponse(res, 200, products, total);

// ❌ WRONG
res.json({ success: true, data: product });
res.status(201).json({ product });
res.json({ products: [], count });
```

### 5. Document Errors and Edge Cases

```javascript
/**
 * Add item to cart
 * @route POST /api/cart
 * @param {string} user_id - User UUID
 * @param {string} product_id - Product UUID
 * @param {number} quantity - Quantity (1-100)
 * @returns {200} Item added
 * @throws {404} - Product not found
 * @throws {422} - Insufficient stock
 */
const addToCart = asyncHandler(async (req, res) => {
    // ...
});
```

---

## API Examples

### Product Management

#### Get All Products

```bash
curl -X GET "http://localhost:4000/api/products?category=Vegetables&search=tomato&page=1&limit=20"
```

Success Response (200):
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Organic Tomatoes",
        "category": "Vegetables",
        "price": 45.50,
        "stock": 100,
        "in_stock": true
      }
    ],
    "total": 1,
    "count": 1
  },
  "message": "Products fetched successfully"
}
```

#### Create Product (Admin)

```bash
curl -X POST "http://localhost:4000/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Organic Tomatoes",
    "category": "Vegetables",
    "price": 45.50,
    "stock": 100,
    "image_url": "https://example.com/tomato.jpg",
    "unit": "kg",
    "unit_quantity": "500g",
    "display_unit": "500g"
  }'
```

Success Response (201):
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Organic Tomatoes",
    "created_at": "2024-04-05T10:30:00.000Z"
  },
  "message": "Product created successfully"
}
```

Error Response (400 - Validation):
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Product name must be at least 2 characters, Price must be positive"
}
```

### Order Management

#### Create Order

```bash
curl -X POST "http://localhost:4000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "9876543210",
    "delivery_address": "123 Main St, Apartment 4B, New York",
    "city": "New York",
    "pincode": "100001",
    "subtotal": 500,
    "delivery_charge": 50,
    "total_amount": 550,
    "payment_method": "UPI",
    "items": [
      {
        "product_id": "prod-uuid",
        "product_name": "Organic Tomatoes",
        "quantity": 5,
        "price": 100
      }
    ]
  }'
```

Success Response (201):
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "order-uuid",
    "status": "Pending",
    "payment_status": "Pending"
  },
  "message": "Order created successfully"
}
```

Error Response (422 - Out of Stock):
```json
{
  "success": false,
  "statusCode": 422,
  "error": "Only 3 units available. You requested 5."
}
```

### Authentication

#### Sign Up

```bash
curl -X POST "http://localhost:4000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "full_name": "John Doe",
    "phone": "9876543210"
  }'
```

Success Response (201):
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "userId": "user-uuid",
    "email": "user@example.com",
    "message": "Signup successful"
  },
  "message": "User registered successfully"
}
```

Error Response (409 - Duplicate):
```json
{
  "success": false,
  "statusCode": 409,
  "error": "This email is already registered"
}
```

#### Sign In

```bash
curl -X POST "http://localhost:4000/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

Success Response (200):
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "customer"
    },
    "session": {
      "access_token": "eyJhbGc...",
      "refresh_token": "refresh...",
      "expires_at": 1712282400
    }
  },
  "message": "Login successful"
}
```

#### Rate Limit Response

```json
{
  "success": false,
  "statusCode": 429,
  "error": "Too many authentication attempts, please try again later"
}
```

---

## File Structure

```
backend/
├── controllers/           # Business logic
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   └── userController.js
├── routes/               # API routes with validation
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   ├── orders.js
│   └── users.js
├── middleware/           # Express middleware
│   ├── errorHandler.js   # Global error handling & asyncHandler
│   ├── security.js       # Helmet, CORS, Rate limiting, XSS
│   └── validators.js     # Joi validation schemas
├── utils/
│   ├── response.js       # Standardized response formatters
│   └── config/
│       └── supabase.js   # Database config
├── server.js             # Express app setup
└── package.json          # Dependencies
```

---

## Running the Backend

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Start production server
npm start

# Health check
curl http://localhost:4000/api/health
```

---

## Key Improvements Summary

✅ **Request Validation**: All endpoints validate input with Joi
✅ **Standardized Responses**: Consistent response format across all endpoints
✅ **Proper HTTP Status Codes**: 200, 201, 400, 401, 404, 409, 422, 500, etc.
✅ **Global Error Handler**: Catches all errors, prevents crashes
✅ **Removed Silent Failures**: No more try-catch blocks that hide errors
✅ **Rate Limiting**: 100 requests/15min for API, 5 for auth endpoints
✅ **Security Headers**: Helmet.js protects against common attacks
✅ **CORS**: Properly configured for specific origins
✅ **XSS Protection**: All inputs sanitized automatically
✅ **Input Sanitization**: Strings trimmed, unknown fields removed
✅ **Comprehensive Logging**: All errors logged with context
✅ **Type Safety**: UUIDs, emails, phone numbers validated

---

## Next Steps

1. Add authentication middleware for protected routes
2. Implement admin role checks
3. Add database transaction support
4. Set up error tracking (Sentry, Winston, etc.)
5. Create API documentation (Swagger/OpenAPI)
6. Add request/response logging middleware
7. Implement pagination for all list endpoints
8. Add filtering and sorting to all list endpoints
