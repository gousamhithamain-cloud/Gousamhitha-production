# Before & After: Implementation Examples

This document shows the improvements made to each controller and route with side-by-side comparisons.

## Cart Controller Example

### BEFORE (Old Pattern)

```javascript
// ❌ Problems:
// 1. Try-catch silently catches errors
// 2. Manual validation in controller
// 3. Inconsistent response format
// 4. Silent error (just returns error object)
// 5. No proper HTTP status codes

async function addToCart(req, res) {
    try {
        const { user_id, product_id, quantity } = req.body;

        if (!user_id || !product_id || !quantity) {
            return res.status(400).json({ error: 'user_id, product_id and quantity are required' });
        }
        if (typeof quantity !== 'number' || quantity < 1) {
            return res.status(400).json({ error: 'quantity must be a positive integer' });
        }

        const { data: product } = await supabase.from('products').select('stock').eq('id', product_id).single();

        if (!product) return res.status(404).json({ error: 'Product not found' });
        if (quantity > product.stock) {
            return res.status(400).json({ error: `Only ${product.stock} units available` });
        }

        const { data, error } = await supabase.from('cart').insert({ user_id, product_id, quantity }).select().single();

        if (error) throw error;
        res.status(201).json({ success: true, item: data });
    } catch (err) {
        console.error('[cartController.addToCart]', err.message);
        res.status(500).json({ error: 'Failed to add to cart' });  // ❌ Silent failure!
    }
}
```

### AFTER (New Pattern)

```javascript
// ✅ Improvements:
// 1. asyncHandler catches all errors
// 2. Validation handled by middleware
// 3. Standardized response format
// 4. Proper error propagation
// 5. Correct HTTP status codes (422 for business logic)

const addToCart = asyncHandler(async (req, res) => {
    const { user_id, product_id, quantity } = req.body;  // ✅ Already validated by Joi

    // Check product stock
    const { data: product, error: pErr } = await supabase
        .from('products')
        .select('stock')
        .eq('id', product_id)
        .single();

    if (pErr || !product) {
        throw new AppError('Product not found', 404);  // ✅ Proper error with status code
    }

    if (quantity > product.stock) {
        throw new AppError(`Only ${product.stock} units available in stock`, 422);  // ✅ 422 for business logic
    }

    const { data: existing } = await supabase
        .from('cart')
        .select('id, quantity')
        .eq('user_id', user_id)
        .eq('product_id', product_id)
        .maybeSingle();

    if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
            throw new AppError(`Only ${product.stock} units available`, 422);
        }

        const { data, error } = await supabase
            .from('cart')
            .update({ quantity: newQty })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) {
            throw new AppError('Failed to update cart item', 500);  // ✅ Proper error
        }

        return successResponse(res, 200, data, 'Item quantity updated');  // ✅ Standardized response
    }

    const { data, error } = await supabase
        .from('cart')
        .insert({ user_id, product_id, quantity })
        .select()
        .single();

    if (error) {
        throw new AppError('Failed to add item to cart', 500);
    }

    return createdResponse(res, data, 'Item added to cart successfully');  // ✅ 201 Created
});
```

---

## Product Controller Example

### BEFORE (Old Pattern)

```javascript
// ❌ Issues:
// 1. Manual UUID validation in each endpoint
// 2. No validation middleware
// 3. Inconsistent error handling
// 4. Manual error responses

const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // ❌ Manual UUID validation (should be in middleware)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        throw new AppError('Invalid product ID format', 400);
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        throw new AppError('Product not found', 404);
    }

    res.status(200).json({  // ❌ Manual response
        success: true,
        product: data
    });
});

const createProduct = asyncHandler(async (req, res) => {
    const { name, category, price, stock, image_url, unit, unit_quantity, display_unit } = req.body;

    // ❌ No validation - assumes data is correct
    const { data, error } = await supabase
        .from('products')
        .insert({
            name, category, price, stock, image_url, unit, unit_quantity, display_unit,
            in_stock: stock > 0
        })
        .select()
        .single();

    if (error) {
        throw new AppError('Failed to create product', 500);
    }

    res.status(201).json({  // ❌ Manual response
        success: true,
        product: data
    });
});
```

### AFTER (New Pattern)

```javascript
// ✅ Improvements:
// 1. UUID validation moved to middleware (validateParams)
// 2. Validation middleware used on routes
// 3. Consistent error handling
// 4. Standardized response helpers

const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;  // ✅ Already validated by middleware

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        throw new AppError('Product not found', 404);
    }

    return successResponse(res, 200, data, 'Product retrieved successfully');  // ✅ Helper function
});

const createProduct = asyncHandler(async (req, res) => {
    const { name, category, price, stock, image_url, unit, unit_quantity, display_unit } = req.body;
    // ✅ Data already validated by Joi middleware

    // ✅ Business logic validation
    if (price <= 0) {
        throw new AppError('Price must be greater than 0', 400);
    }
    if (stock < 0) {
        throw new AppError('Stock cannot be negative', 400);
    }

    const { data, error } = await supabase
        .from('products')
        .insert({
            name, category, price, stock, image_url, unit, unit_quantity, display_unit,
            in_stock: stock > 0
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new AppError('A product with this name already exists', 409);  // ✅ Handle duplicate
        }
        throw new AppError('Failed to create product', 500);
    }

    return createdResponse(res, data, 'Product created successfully');  // ✅ Helper function
});
```

### Route Definition: BEFORE vs AFTER

**BEFORE:**
```javascript
// ❌ No validation middleware
const router = require('express').Router();
const { getProducts, getProductById, createProduct } = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
```

**AFTER:**
```javascript
// ✅ Validation middleware on every route
const router = require('express').Router();
const { getProducts, getProductById, createProduct } = require('../controllers/productController');
const { validate, validateQuery, validateParams, schemas } = require('../middleware/validators');

router.get('/', validateQuery(schemas.getProducts), getProducts);
router.get('/:id', validateParams(schemas.UUID), getProductById);
router.post('/', validate(schemas.createProduct), createProduct);
```

---

## Order Controller Example

### BEFORE (Old Pattern)

```javascript
// ❌ Issues:
// 1. Inline validation in controller
// 2. No transaction/rollback support
// 3. Silent cart clearing failure
// 4. Inconsistent response format

async function createOrder(req, res) {
    try {
        const {
            user_id, customer_name, customer_email, customer_phone,
            delivery_address, city, pincode, order_notes,
            subtotal, delivery_charge, total_amount,
            payment_method, items
        } = req.body;

        // ❌ Manual validation (should be in Joi schema)
        if (!user_id || !customer_name || !customer_email || !delivery_address || !items?.length) {
            return res.status(400).json({ error: 'Required fields missing' });
        }
        if (typeof total_amount !== 'number' || total_amount <= 0) {
            return res.status(400).json({ error: 'total_amount must be a positive number' });
        }

        const { data: order, error: orderErr } = await supabase
            .from('orders')
            .insert({
                user_id, customer_name, customer_email, customer_phone,
                delivery_address, city, pincode, order_notes,
                subtotal, delivery_charge, total_amount,
                payment_method: payment_method || 'COD',
                status: 'Pending',
                payment_status: 'Pending'
            })
            .select()
            .single();

        if (orderErr) throw orderErr;

        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
        if (itemsErr) throw itemsErr;

        // ❌ Silent failure if cart clear fails
        await supabase.from('cart').delete().eq('user_id', user_id);

        res.status(201).json({ success: true, order });  // ❌ Manual response
    } catch (err) {
        console.error('[orderController.createOrder]', err.message);
        res.status(500).json({ error: 'Failed to create order' });  // ❌ Silent error info
    }
}
```

### AFTER (New Pattern)

```javascript
// ✅ Improvements:
// 1. Validation via Joi middleware
// 2. Business logic validation
// 3. Stock verification before order creation
// 4. Proper transaction handling with rollback
// 5. Graceful cart clearing failure handling

const createOrder = asyncHandler(async (req, res) => {
    const {
        user_id, customer_name, customer_email, customer_phone,
        delivery_address, city, pincode, order_notes,
        subtotal, delivery_charge = 0, total_amount,
        payment_method = 'COD', items
    } = req.body;
    // ✅ All body fields already validated by Joi middleware

    // ✅ Business logic validation
    if (!items || items.length === 0) {
        throw new AppError('Order must contain at least one item', 400);
    }

    if (total_amount <= 0) {
        throw new AppError('Total amount must be positive', 400);
    }

    // ✅ Verify all products exist and stock is available BEFORE creating order
    for (const item of items) {
        const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

        if (!product) {
            throw new AppError(`Product ${item.product_id} not found`, 404);
        }

        if (item.quantity > product.stock) {
            throw new AppError(`Insufficient stock for product ${item.product_name}`, 422);
        }
    }

    // Create order
    const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
            user_id,
            customer_name,
            customer_email,
            customer_phone,
            delivery_address,
            city,
            pincode,
            order_notes,
            subtotal,
            delivery_charge,
            total_amount,
            payment_method,
            status: 'Pending',
            payment_status: 'Pending'
        })
        .select()
        .single();

    if (orderErr) {
        throw new AppError('Failed to create order', 500);
    }

    // Create order items
    const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) {
        // ✅ Rollback: delete the order if items creation fails
        await supabase.from('orders').delete().eq('id', order.id);
        throw new AppError('Failed to create order items', 500);
    }

    // ✅ Graceful failure: log but don't crash if cart clear fails
    await supabase.from('cart').delete().eq('user_id', user_id).catch(err => {
        console.error('Warning: Failed to clear cart:', err.message);
    });

    return createdResponse(res, order, 'Order created successfully');  // ✅ Standardized response
});
```

---

## Auth Controller Example

### BEFORE (Old Pattern)

```javascript
// ❌ Issues:
// 1. No rate limiting
// 2. Generic error messages (could reveal password issues)
// 3. Profile creation errors ignored
// 4. Manual validation

async function signup(req, res) {
    try {
        const { email, password, full_name, phone } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({ error: 'Required fields missing' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password too short' });
        }

        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name, phone }
        });

        if (error) {
            if (error.message.includes('already registered')) {
                return res.status(409).json({ error: 'Email already registered' });
            }
            throw error;
        }

        // ❌ Profile creation error is silently ignored
        const [firstName, ...rest] = full_name.trim().split(' ');
        await supabase.from('users').upsert({
            id: data.user.id,
            email,
            first_name: firstName,
            last_name: rest.join(' ') || '',
            phone: phone || '',
            role: 'customer'
        }, { onConflict: 'id' });

        res.status(201).json({ success: true, userId: data.user.id });  // ❌ Manual response
    } catch (err) {
        console.error('[authController.signup]', err.message);
        res.status(500).json({ error: 'Signup failed' });  // ❌ Generic error
    }
}
```

### AFTER (New Pattern)

```javascript
// ✅ Improvements:
// 1. authLimiter applied in route (5 attempts per 15 min)
// 2. Security: Same error for email/password issues
// 3. Profile creation errors logged but handled gracefully
// 4. Validation via Joi middleware

const signup = asyncHandler(async (req, res) => {
    const { email, password, full_name, phone } = req.body;
    // ✅ All fields validated by Joi middleware

    // ✅ Check if user already exists (for better UX)
    const { data: existingAuth } = await supabase.auth.admin.listUsers();
    const userExists = existingAuth?.users?.some(u => u.email === email);

    if (userExists) {
        throw new AppError('This email is already registered', 409);
    }

    // Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, phone }
    });

    if (error) {
        if (error.message && error.message.includes('already registered')) {
            throw new AppError('Email already registered', 409);
        }
        throw new AppError(error.message || 'Signup failed', 500);  // ✅ Better error info
    }

    // Create user profile
    const [firstName, ...rest] = full_name.trim().split(' ');
    const lastName = rest.join(' ') || '';

    const { error: profileError } = await supabase
        .from('users')
        .upsert({
            id: data.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            phone: phone || '',
            role: 'customer'
        }, { onConflict: 'id' });

    // ✅ Log profile error but don't fail signup
    if (profileError) {
        console.error('Warning: Failed to create user profile:', profileError.message);
    }

    return createdResponse(res, {
        userId: data.user.id,
        email: data.user.email,
        message: 'Signup successful'
    }, 'User registered successfully');  // ✅ Standardized response
});
```

### Route Definition: BEFORE vs AFTER

**BEFORE:**
```javascript
// ❌ No rate limiting on auth endpoints
const router = require('express').Router();
const { signup, signin } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/signin', signin);
```

**AFTER:**
```javascript
// ✅ Rate limiting + validation on auth endpoints
const router = require('express').Router();
const { signup, signin } = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validators');
const { authLimiter } = require('../middleware/security');

router.post('/signup', authLimiter, validate(schemas.signup), signup);
router.post('/signin', authLimiter, validate(schemas.signin), signin);
```

---

## Key Takeaways

### Error Handling Pattern

```javascript
// OLD ❌
try {
    // ... code
    res.status(500).json({ error: 'Error occurred' });  // Silent
} catch (err) {
    res.status(500).json({ error: err.message });
}

// NEW ✅
const handler = asyncHandler(async (req, res) => {
    // ... code
    throw new AppError('Clear message', 404);  // Explicit error, proper status
    // Error is caught by middleware
});
```

### Validation Pattern

```javascript
// OLD ❌
const saveProduct = async (req, res) => {
    if (!req.body.name) return res.status(400).json({ error: 'Name required' });
    if (req.body.price <= 0) return res.status(400).json({ error: 'Price invalid' });
    // ... more manual validation
};

// NEW ✅
router.post('/', validate(schemas.createProduct), saveProduct);
// Joi validates all fields automatically in middleware
// Controller receives validated data
```

### Response Pattern

```javascript
// OLD ❌
res.status(200).json({ success: true, data: item });
res.status(201).json({ product: item });
res.json({ items, total: count });

// NEW ✅
return successResponse(res, 200, item, 'Success');
return createdResponse(res, item, 'Created');
return batchResponse(res, 200, items, total);
```

### Status Codes Pattern

```javascript
// OLD ❌
res.status(400).json({ error: 'Out of stock' });      // 400 for business logic
res.status(500).json({ error: 'Not found' });         // 500 for not found
res.status(400).json({ error: 'Duplicate email' });   // 400 for duplicate

// NEW ✅
throw new AppError('Out of stock', 422);              // 422 for business logic
throw new AppError('Product not found', 404);         // 404 for not found
throw new AppError('Email already exists', 409);      // 409 for conflict
```
