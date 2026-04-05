# Backend API Development Guide

## 🎯 Quick Start

```bash
# Navigate to backend directory
cd backend

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

## 📝 File Structure

```
backend/
├── controllers/              # Business logic for each resource
│   ├── authController.js    # Authentication (signup, signin, token refresh)
│   ├── productController.js # Product CRUD operations
│   ├── cartController.js    # Shopping cart operations
│   ├── orderController.js   # Order management
│   └── userController.js    # User profile management
│
├── routes/                  # API route definitions
│   ├── auth.js             # Auth routes
│   ├── products.js         # Product routes
│   ├── cart.js             # Cart routes
│   ├── orders.js           # Order routes
│   └── users.js            # User routes
│
├── middleware/             # Express middleware
│   ├── errorHandler.js     # Global error handling & asyncHandler
│   ├── security.js         # Helmet, CORS, rate limiting, XSS
│   └── validators.js       # Joi validation schemas
│
├── utils/                  # Utility functions
│   ├── response.js         # Standardized response formatters
│   └── config/
│       └── supabase.js     # Database configuration
│
├── config/                 # Configuration files
│   └── supabase.js         # Supabase client setup
│
├── server.js              # Express app setup and middleware
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (local)
└── .env.example          # Environment variables template
```

---

## 🔧 Technologies Used

- **Express.js** - Web framework
- **Joi** - Request validation library
- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting
- **xss-clean** - XSS attack prevention
- **Supabase** - Database (PostgreSQL)
- **nodemon** - Development server (hot reload)

---

## 🧩 Creating a New Endpoint

### Step 1: Define Validation Schema

```javascript
// In middleware/validators.js
const schemas = {
    // Add your validation schema
    createItem: Joi.object({
        name: Joi.string().trim().min(2).max(100).required(),
        value: Joi.number().positive().required()
    }),
    updateItem: Joi.object({
        name: Joi.string().trim().min(2).max(100).optional(),
        value: Joi.number().positive().optional()
    }).min(1),
    ItemID: Joi.object({
        itemId: Joi.string().guid({ version: 'uuidv4' }).required()
    })
};
```

### Step 2: Create Controller

```javascript
// In controllers/itemController.js
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { successResponse, createdResponse } = require('../utils/response');
const supabase = require('../config/supabase');

const getItem = asyncHandler(async (req, res) => {
    const { id } = req.params;  // Already validated by middleware
    
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error || !data) {
        throw new AppError('Item not found', 404);
    }
    
    return successResponse(res, 200, data, 'Item retrieved');
});

const createItem = asyncHandler(async (req, res) => {
    const { name, value } = req.body;  // Already validated by middleware
    
    const { data, error } = await supabase
        .from('items')
        .insert({ name, value })
        .select()
        .single();
    
    if (error) {
        if (error.code === '23505') {
            throw new AppError('Item with this name already exists', 409);
        }
        throw new AppError('Failed to create item', 500);
    }
    
    return createdResponse(res, data, 'Item created successfully');
});

module.exports = { getItem, createItem };
```

### Step 3: Create Routes

```javascript
// In routes/items.js
const router = require('express').Router();
const { getItem, createItem } = require('../controllers/itemController');
const { validate, validateParams, schemas } = require('../middleware/validators');

// All validation happens in middleware
router.get('/:itemId', validateParams(schemas.ItemID), getItem);
router.post('/', validate(schemas.createItem), createItem);

module.exports = router;
```

### Step 4: Register Routes

```javascript
// In server.js
const itemRoutes = require('./routes/items');
app.use('/api/items', itemRoutes);
```

---

## ✅ Best Practices Checklist

When creating new endpoints, follow this checklist:

- [ ] **Validation**: Define Joi schema for all inputs (body, params, query)
- [ ] **Error Handling**: Use `asyncHandler` wrapper, throw `AppError`
- [ ] **Status Codes**: Use correct codes (201, 204, 400, 404, 409, 422, 500)
- [ ] **Responses**: Use `successResponse()`, `createdResponse()`, `batchResponse()`
- [ ] **Logging**: Let middleware handle logging (don't use `res.status().end()`)
- [ ] **Security**: Validate before DB operations, sanitize strings
- [ ] **Business Logic**: Check constraints before database operations
- [ ] **Transactions**: Handle rollback on multi-step operations
- [ ] **Documentation**: Add JSDoc comments explaining parameters and errors

---

## 📊 API Response Examples

### Success Response (200)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "price": 100
  },
  "message": "Product retrieved successfully",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

### Created Response (201)
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "new-uuid",
    "name": "New Product",
    "price": 100
  },
  "message": "Product created successfully",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

### Batch Response (200)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      { "id": "uuid1", "name": "Product 1" },
      { "id": "uuid2", "name": "Product 2" }
    ],
    "total": 50,
    "count": 2
  },
  "message": "Products fetched successfully",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

### Error Response (400)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Product name is required",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

### Not Found Response (404)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Not found",
  "error": "Product not found",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

### Conflict Response (409)
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Conflict",
  "error": "Email already registered",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

### Business Logic Error (422)
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Unprocessable entity",
  "error": "Only 5 units available in stock",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

### Rate Limited Response (429)
```json
{
  "success": false,
  "statusCode": 429,
  "error": "Too many authentication attempts, please try again later",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

### Server Error Response (500)
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error",
  "error": "An unexpected error occurred",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

---

## 🔐 Authentication

### Getting a Token

```bash
curl -X POST http://localhost:4000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

Response:
```json
{
  "success": true,
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
  }
}
```

### Using Token in Requests

```bash
curl -X GET http://localhost:4000/api/users/user-uuid \
  -H "Authorization: Bearer eyJhbGc..."
```

### Refreshing Token

```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "refresh..."}'
```

---

## 🚨 Common Errors & Solutions

### 1. "Invalid request body"
**Cause:** JSON parsing error
**Solution:** Ensure body is valid JSON
```bash
# ❌ Wrong
curl -X POST http://localhost:4000/api/products -d '{name: "test"}'

# ✅ Correct
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}'
```

### 2. "Validation failed"
**Cause:** Request validation error
**Solution:** Check error message and provide correct data
```bash
# ❌ Missing required field
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"category": "Vegetables"}'

# ✅ Provide all required fields
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tomatoes",
    "category": "Vegetables",
    "price": 50,
    "stock": 100
  }'
```

### 3. "Invalid ID format"
**Cause:** ID is not a valid UUID
**Solution:** Use valid UUID format
```bash
# ❌ Invalid ID
curl http://localhost:4000/api/products/not-uuid

# ✅ Valid UUID
curl http://localhost:4000/api/products/550e8400-e29b-41d4-a716-446655440000
```

### 4. "Too many requests"
**Cause:** Rate limit exceeded
**Solution:** Wait 15 minutes or use different IP
```
Status: 429
Error: "Too many requests from this IP, please try again later"
```

### 5. "Product not found"
**Cause:** ID doesn't exist in database
**Solution:** Check if product exists
```json
{
  "statusCode": 404,
  "error": "Product not found"
}
```

---

## 🧪 Testing Endpoints

### Using cURL

```bash
# Health check
curl http://localhost:4000/api/health

# Get all products
curl http://localhost:4000/api/products

# Get a single product
curl http://localhost:4000/api/products/550e8400-e29b-41d4-a716-446655440000

# Create product (with validation)
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Organic Tomatoes",
    "category": "Vegetables",
    "price": 45.50,
    "stock": 100
  }'

# Update product
curl -X PUT http://localhost:4000/api/products/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"price": 50}'

# Delete product
curl -X DELETE http://localhost:4000/api/products/550e8400-e29b-41d4-a716-446655440000
```

### Using Postman

1. **Import collection** - Create new request
2. **Set method** - GET, POST, PUT, DELETE
3. **Set URL** - http://localhost:4000/api/products
4. **Add headers** - Content-Type: application/json
5. **Add body** - JSON data for POST/PUT
6. **Send request** - View response

### Using JavaScript/Fetch

```javascript
// GET request
async function getProducts() {
    const response = await fetch('http://localhost:4000/api/products');
    const result = await response.json();
    console.log(result);
}

// POST request
async function createProduct(name, category, price, stock) {
    const response = await fetch('http://localhost:4000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, price, stock })
    });
    const result = await response.json();
    console.log(result);
}

// With authentication
async function getUserProfile(userId, token) {
    const response = await fetch(`http://localhost:4000/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    console.log(result);
}
```

---

## 🔍 Debugging

### Enable Debug Logging

```javascript
// In development, errors are logged with full context:
console.error('❌ Error:', {
    timestamp: '2024-04-05T10:30:00.000Z',
    message: 'Product not found',
    statusCode: 404,
    path: '/api/products/invalid-id',
    method: 'GET',
    ip: '127.0.0.1',
    stack: '...'  // Full stack trace
});
```

### Check Database Connection

```bash
# Test Supabase connection
curl -H "Authorization: Bearer ${SUPABASE_KEY}" \
  https://your-project.supabase.co/rest/v1/products?select=id&limit=1
```

### Monitor Request/Response

```javascript
// Request logging middleware (already in server.js)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
```

---

## 📦 Environment Variables

Create `.env` file in backend directory:

```
# Server
PORT=4000
NODE_ENV=development

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Frontend
FRONTEND_URL=http://localhost:3000

# Auth
RESET_PASSWORD_URL=http://localhost:3000/reset-password
```

---

## 🎓 Code Examples by Scenario

### List with Pagination

```javascript
const getItems = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    
    // Get total count
    const { count } = await supabase
        .from('items')
        .select('id', { count: 'exact', head: true });
    
    // Paginate
    const offset = (page - 1) * limit;
    const { data } = await supabase
        .from('items')
        .select('*')
        .range(offset, offset + limit - 1);
    
    return paginatedResponse(res, data, page, limit, count);
});
```

### Create with Related Records

```javascript
const createOrder = asyncHandler(async (req, res) => {
    const { user_id, items, total_amount } = req.body;
    
    // Verify stock before creating order
    for (const item of items) {
        const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();
        
        if (!product || item.quantity > product.stock) {
            throw new AppError('Insufficient stock', 422);
        }
    }
    
    // Create order
    const { data: order, error } = await supabase
        .from('orders')
        .insert({ user_id, total_amount, status: 'Pending' })
        .select()
        .single();
    
    if (error) throw new AppError('Failed to create order', 500);
    
    // Create order items
    const orderItems = items.map(item => ({
        order_id: order.id,
        ...item
    }));
    
    const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItems);
    
    if (itemsErr) {
        // Rollback: delete order
        await supabase.from('orders').delete().eq('id', order.id);
        throw new AppError('Failed to create order items', 500);
    }
    
    return createdResponse(res, order);
});
```

### Update with Validation

```javascript
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    // Prevent ID override
    delete updates.id;
    
    // Validate business logic
    if (updates.price && updates.price <= 0) {
        throw new AppError('Price must be greater than 0', 400);
    }
    
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

---

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Update environment variables for production
- [ ] Enable HTTPS
- [ ] Configure rate limiting for production loads
- [ ] Set up error tracking (Sentry)
- [ ] Enable database backups
- [ ] Test all endpoints in production
- [ ] Monitor server logs
- [ ] Set up SSL certificates
- [ ] Configure CDN for static assets
- [ ] Test security headers
- [ ] Verify CORS settings

---

## 📚 Additional Resources

- Express.js Documentation: https://expressjs.com/
- Joi Documentation: https://joi.dev/
- Helmet.js Documentation: https://helmetjs.github.io/
- Supabase Documentation: https://supabase.com/docs
- REST API Best Practices: https://restfulapi.net/

---

## 💡 Tips & Tricks

### 1. Quick Test Script

```bash
#!/bin/bash
# test-api.sh - Test all endpoints

BASE_URL="http://localhost:4000/api"

echo "Testing health check..."
curl $BASE_URL/health | jq

echo "Testing products..."
curl $BASE_URL/products | jq

echo "Testing validation error..."
curl -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -d '{}' | jq
```

### 2. Mock Data Generator

```javascript
// Generate test products
const generateProducts = (count = 10) => {
    return Array.from({ length: count }, (_, i) => ({
        name: `Product ${i + 1}`,
        category: ['Vegetables', 'Fruits', 'Dairy'][i % 3],
        price: Math.random() * 1000,
        stock: Math.floor(Math.random() * 1000)
    }));
};
```

### 3. Error Tracking

```javascript
// Log all errors to file (future enhancement)
const fs = require('fs');

app.use((err, req, res, next) => {
    const errorLog = {
        timestamp: new Date().toISOString(),
        message: err.message,
        stack: err.stack,
        path: req.path
    };
    
    fs.appendFileSync('error.log', JSON.stringify(errorLog) + '\n');
    next(err);
});
```

---

## 🤝 Contributing

When adding new features:

1. Follow the established patterns
2. Add validation schemas
3. Use asyncHandler for controllers
4. Throw AppError for failures
5. Use response helpers
6. Add JSDoc comments
7. Update documentation
8. Test all scenarios

---

## 📞 Support

For issues or questions:
1. Check `BACKEND-ENHANCEMENTS.md` for detailed documentation
2. See `QUICK-REFERENCE.md` for quick answers
3. Review `EXAMPLES-BEFORE-AFTER.md` for code patterns
4. Check error logs for detailed error information

Happy coding! 🎉
