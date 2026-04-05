# Backend Enhancement - Quick Reference & Setup

## Overview of Changes

This file contains quick reference information and setup instructions for the enhanced backend with validation, error handling, and security features.

## Key Files Modified/Created

| File | Purpose | Changes |
|------|---------|---------|
| `server.js` | Main app entry | Updated to use `globalErrorHandler` |
| `middleware/errorHandler.js` | Error handling | Enhanced with logging, better error types |
| `middleware/validators.js` | Input validation | Added query & param validators |
| `middleware/security.js` | Security | Already comprehensive |
| `utils/response.js` | Response formatting | NEW - Standardized responses |
| `controllers/*.js` | Business logic | Updated to use asyncHandler & standardized responses |
| `routes/*.js` | API routes | Updated with validation middleware |

## Middleware Stack (Applied in Order)

```
Request
  ↓
helmet()                    ← Security headers
  ↓
cors()                      ← Cross-origin requests
  ↓
xssProtection()             ← XSS attack prevention
  ↓
express.json()              ← Parse JSON body
  ↓
express.urlencoded()        ← Parse form data
  ↓
sanitizeInput()             ← Trim/sanitize strings
  ↓
requestLogger()             ← Log request
  ↓
apiLimiter                  ← Rate limiting (100/15min)
  ↓
Routes (with validation)    ← validateParams, validateQuery, validate
  ↓
Controllers                 ← Business logic (asyncHandler catches errors)
  ↓
notFound (404 handler)      ← Route not found
  ↓
globalErrorHandler()        ← Catch all errors (LAST)
  ↓
Response
```

## Quick Integration Guide

### 1. Update Server Entry Point

```javascript
// ✅ Use globalErrorHandler instead of errorHandler
const { globalErrorHandler, notFound } = require('./middleware/errorHandler');

app.use(notFound);
app.use(globalErrorHandler);  // Must be last middleware
```

### 2. Add validationMiddleware to Routes

```javascript
// ✅ Example: products.js route
const { validate, validateParams, schemas } = require('../middleware/validators');

router.get('/', validateQuery(schemas.getProducts), getProducts);
router.get('/:id', validateParams(schemas.UUID), getProductById);
router.post('/', validate(schemas.createProduct), createProduct);
```

### 3. Use asyncHandler in Controllers

```javascript
// ✅ Wrap async functions with asyncHandler
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/response');

const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;  // Already validated by middleware
    const { data } = await supabase.from('products').select().eq('id', id);
    return successResponse(res, 200, data);
});
```

### 4. Throw AppError for Failures

```javascript
// ✅ Use AppError for expected failures
const { AppError } = require('../middleware/errorHandler');

if (!product) {
    throw new AppError('Product not found', 404);
}
if (quantity > stock) {
    throw new AppError(`Only ${stock} units available`, 422);
}
```

### 5. Use Response Formatters

```javascript
// ✅ Import and use response helpers
const { 
    successResponse, 
    createdResponse, 
    batchResponse 
} = require('../utils/response');

// Success
return successResponse(res, 200, data, 'Success');

// Created
return createdResponse(res, data, 'Item created');

// List with pagination
return batchResponse(res, 200, items, total);
```

## Validation Schema Reference

### Common Schemas

```javascript
schemas.UUID              // Validate UUID in params: { id: UUID }
schemas.UserID            // Validate user UUID: { userId: UUID }
schemas.ItemID            // Validate item UUID: { itemId: UUID }

schemas.createProduct     // POST /products validation
schemas.updateProduct     // PUT /products/:id validation
schemas.getProducts       // Query params: category, search, page, limit, sort

schemas.addToCart         // POST /cart validation: user_id, product_id, quantity
schemas.updateCartItem    // PUT /cart/:itemId validation: quantity

schemas.createOrder       // POST /orders validation
schemas.updateOrderStatus // PUT /orders/:id/status validation: status

schemas.createUser        // POST /users validation
schemas.updateUser        // PUT /users/:id validation

schemas.signup            // POST /auth/signup validation
schemas.signin            // POST /auth/signin validation
```

## Error Codes Quick Reference

| Status | Code | When to Use |
|--------|------|------------|
| 200 | OK | Successful GET/PUT/DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | No/invalid auth token |
| 403 | Forbidden | No permission (not admin) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate (email, product) |
| 422 | Unprocessable | Business error (out of stock) |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Unexpected database/server error |

## Examples by Endpoint Type

### Get Single Item

```javascript
const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;  // UUID already validated

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        throw new AppError('Product not found', 404);
    }

    return successResponse(res, 200, data);
});
```

### Get List (with Pagination)

```javascript
const getProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    let query = supabase.from('products').select('*');

    // Get total count
    const { count } = await query.select('id', { count: 'exact', head: true });

    // Paginate
    const offset = (page - 1) * limit;
    const { data } = await query.range(offset, offset + limit - 1);

    return batchResponse(res, 200, data || [], count || 0);
});
```

### Create Item

```javascript
const createProduct = asyncHandler(async (req, res) => {
    const { name, category, price, stock } = req.body;  // Validated by Joi

    const { data, error } = await supabase
        .from('products')
        .insert({ name, category, price, stock })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new AppError('Product already exists', 409);
        }
        throw new AppError('Failed to create product', 500);
    }

    return createdResponse(res, data);
});
```

### Update Item

```javascript
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;  // Validated by Joi

    delete updates.id;  // Prevent ID override

    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            throw new AppError('Product not found', 404);
        }
        throw new AppError('Update failed', 500);
    }

    return successResponse(res, 200, data);
});
```

### Delete Item

```javascript
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verify exists
    const { data: item } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .single();

    if (!item) {
        throw new AppError('Product not found', 404);
    }

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
        throw new AppError('Delete failed', 500);
    }

    return successResponse(res, 200, null, 'Product deleted');
});
```

## Authentication & Protected Routes

### Getting JWT Token

```bash
# Sign in to get token
curl -X POST http://localhost:4000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "pass"}'

# Response
{
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "..."
  }
}
```

### Using Token in Requests

```bash
# Use token in Authorization header
curl -X GET http://localhost:4000/api/users/user-id \
  -H "Authorization: Bearer eyJhbGc..."
```

### Creating Protected Routes

```javascript
// middleware/auth.js
const authMiddleware = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        throw new AppError('No authentication token', 401);
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        throw new AppError('Invalid or expired token', 401);
    }

    req.user = data.user;
    next();
});

// routes/orders.js
const authMiddleware = require('../middleware/auth');

// Protected route - requires valid token
router.get('/my-orders', authMiddleware, async (req, res) => {
    // req.user is now available
});
```

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:4000/api/health

# Get products with filters
curl "http://localhost:4000/api/products?category=Vegetables&page=1&limit=10"

# Create product (with validation)
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "T", "category": "V", "price": -5, "stock": -1}'
# Response: 400 with validation errors

# Invalid UUID
curl http://localhost:4000/api/products/not-a-uuid
# Response: 400 with "Invalid ID format"
```

### Using Postman

1. **Create environment variables**:
   ```
   base_url = http://localhost:4000
   token = (add after signin)
   ```

2. **Sign in request**:
   ```
   POST {{base_url}}/api/auth/signin
   Body: {"email": "user@example.com", "password": "pass"}
   ```

3. **Use token in requests**:
   ```
   Authorization: Bearer {{token}}
   ```

## Rate Limiting Details

### Limits Applied

- **Auth endpoints**: 5 requests per 15 minutes
  - POST /api/auth/signup
  - POST /api/auth/signin

- **General API**: 100 requests per 15 minutes
  - All other GET/POST/PUT/DELETE endpoints

- **Write limit** (optional): 20 requests per 15 minutes
  - Can be applied to POST/PUT/DELETE operations

### Rate Limit Headers

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1712282400
```

### When Rate Limited

```json
{
  "success": false,
  "statusCode": 429,
  "error": "Too many requests from this IP, please try again later"
}
```

## Debugging

### View Error Logs

```javascript
// In development, full errors are logged:
console.error('❌ Error:', {
    message: 'Product not found',
    statusCode: 404,
    path: '/api/products/invalid-id',
    method: 'GET',
    stack: '...'
});
```

### Check Database Errors

```javascript
// Supabase-specific errors
if (error.code === '23505') {
    // Duplicate key
}
if (error.code === 'PGRST116') {
    // No rows found
}
if (error.code === '42601') {
    // Syntax error
}
```

### Test Validation

```bash
# Missing required field
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"category": "Vegetables"}'
# Response: 400 with "Product name is required"

# Invalid format
curl -X POST http://localhost:4000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"user_id": "invalid", "product_id": "123", "quantity": "abc"}'
# Response: 400 with "Invalid user ID format, Quantity must be a number"
```

## Environment Setup

### .env File

```
PORT=4000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# CORS
FRONTEND_URL=http://localhost:3000

# Auth
RESET_PASSWORD_URL=http://localhost:3000/reset-password
```

### Package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "joi": "^17.11.0",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "xss-clean": "^0.1.4",
    "@supabase/supabase-js": "^2.39.0",
    "dotenv": "^16.4.1"
  }
}
```

## Checklist for Future Implementation

- [ ] Add JWT token verification middleware
- [ ] Implement admin role authorization
- [ ] Add database transaction support for complex operations
- [ ] Set up error tracking service (Sentry)
- [ ] Add request logging (Winston)
- [ ] Generate OpenAPI/Swagger documentation
- [ ] Add input encryption for sensitive fields
- [ ] Implement database connection pooling
- [ ] Add API versioning (/api/v1/products)
- [ ] Create integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add API performance monitoring
- [ ] Implement caching (Redis)
- [ ] Add webhook support for order notifications
- [ ] Create admin API dashboard
