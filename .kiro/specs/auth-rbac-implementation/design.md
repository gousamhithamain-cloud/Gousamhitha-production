# Authentication & RBAC - Design Document

## Architecture Overview

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request + Token
       ▼
┌─────────────────────────────────────┐
│         Express Server              │
│  ┌───────────────────────────────┐ │
│  │  Security Middleware          │ │
│  │  (Helmet, CORS, Rate Limit)   │ │
│  └───────────┬───────────────────┘ │
│              ▼                      │
│  ┌───────────────────────────────┐ │
│  │  Authentication Middleware    │ │
│  │  - Verify JWT Token           │ │
│  │  - Extract User Info          │ │
│  │  - Attach to req.user         │ │
│  └───────────┬───────────────────┘ │
│              ▼                      │
│  ┌───────────────────────────────┐ │
│  │  Authorization Middleware     │ │
│  │  - Check User Role            │ │
│  │  - Verify Permissions         │ │
│  └───────────┬───────────────────┘ │
│              ▼                      │
│  ┌───────────────────────────────┐ │
│  │  Route Handler                │ │
│  │  - Business Logic             │ │
│  │  - Database Operations        │ │
│  └───────────┬───────────────────┘ │
└──────────────┼─────────────────────┘
               ▼
       ┌───────────────┐
       │   Supabase    │
       │   - Auth      │
       │   - Database  │
       │   - RLS       │
       └───────────────┘
```

## Component Design

### 1. Authentication Middleware (`middleware/auth.js`)

#### `authenticate` Middleware
```javascript
Purpose: Verify JWT token and extract user information
Input: req.headers.authorization
Output: req.user = { id, email, role }
Errors: 401 if no token, invalid token, or expired token
```

**Flow:**
1. Extract token from Authorization header
2. Verify token with Supabase Auth
3. Extract user ID from token
4. Fetch user details from database (including role)
5. Attach user to req.user
6. Call next()

#### `requireRole` Middleware Factory
```javascript
Purpose: Restrict access based on user role
Input: allowedRoles (array of strings)
Output: Middleware function
Errors: 403 if user role not in allowedRoles
```

**Flow:**
1. Check if req.user exists (must run after authenticate)
2. Check if req.user.role is in allowedRoles
3. If yes, call next()
4. If no, throw AppError(403)

### 2. Auth Controller Updates (`controllers/authController.js`)

#### Enhanced Signup
```javascript
Changes:
- Add role field to user creation (default: 'customer')
- Ensure role is stored in both auth metadata and users table
- Return user with role in response
```

#### Enhanced Signin
```javascript
Changes:
- Fetch user role from database
- Include role in response
- Ensure role is in JWT token metadata
```

### 3. Route Protection (`routes/*.js`)

#### Product Routes
```javascript
GET /api/products          → Public
GET /api/products/:id      → Public
POST /api/products         → Admin only
PUT /api/products/:id      → Admin only
DELETE /api/products/:id   → Admin only
```

#### Cart Routes
```javascript
GET /api/cart/:userId      → Authenticated (own data only)
POST /api/cart             → Authenticated
PUT /api/cart/:itemId      → Authenticated (own data only)
DELETE /api/cart/:itemId   → Authenticated (own data only)
DELETE /api/cart/user/:userId → Authenticated (own data only)
```

#### Order Routes
```javascript
GET /api/orders            → Admin only
POST /api/orders           → Authenticated
GET /api/orders/user/:userId → Authenticated (own data only)
GET /api/orders/:id        → Authenticated (own data only)
PUT /api/orders/:id/status → Admin only
DELETE /api/orders/:id     → Admin only
```

### 4. Database Schema Updates

#### Users Table
```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';

-- Valid roles: 'customer', 'admin'
-- Add check constraint
ALTER TABLE users
ADD CONSTRAINT check_role CHECK (role IN ('customer', 'admin'));
```

### 5. Row-Level Security (RLS)

#### Cart Table RLS
```sql
-- Enable RLS
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own cart
CREATE POLICY "Users can view own cart"
ON cart FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart"
ON cart FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
ON cart FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart"
ON cart FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Admins can access all carts
CREATE POLICY "Admins can view all carts"
ON cart FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

#### Orders Table RLS
```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own orders
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can access all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete all orders"
ON orders FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

#### Order Items Table RLS
```sql
-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view items of their own orders
CREATE POLICY "Users can view own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Policy: Admins can access all order items
CREATE POLICY "Admins can view all order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

#### Users Table RLS
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Policy: Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- Policy: Admins can update all users
CREATE POLICY "Admins can update all users"
ON users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);
```

## Data Flow

### Authentication Flow
```
1. User sends POST /api/auth/signin with credentials
2. authController.signin validates credentials
3. Supabase Auth creates session and returns JWT
4. Backend fetches user role from database
5. Backend returns JWT + user info (including role)
6. Client stores JWT (localStorage or cookie)
```

### Authorization Flow
```
1. Client sends request with Authorization: Bearer <token>
2. authenticate middleware extracts and verifies token
3. authenticate middleware fetches user from database
4. authenticate middleware attaches user to req.user
5. requireRole middleware checks req.user.role
6. If authorized, request proceeds to controller
7. If not authorized, 403 error returned
```

### Data Access Flow (with RLS)
```
1. Client sends authenticated request
2. Middleware verifies token and role
3. Controller executes database query
4. Supabase applies RLS policies
5. Only authorized data is returned
6. Response sent to client
```

## Security Considerations

### Token Security
- Tokens signed with secret key (from env)
- Tokens expire after 1 hour
- Refresh tokens supported
- Tokens transmitted over HTTPS only
- HTTP-only cookies prevent XSS

### Password Security
- Passwords hashed by Supabase Auth
- Minimum 6 characters required
- Never logged or exposed in responses
- Password reset via email

### Role Security
- Roles stored in database
- Roles verified on every request
- Role changes require admin privileges
- Default role is 'customer'

### RLS Security
- Enabled on all user-specific tables
- Policies enforce data isolation
- Admin bypass requires explicit role check
- Policies tested thoroughly

## Error Handling

### Authentication Errors
```javascript
401 Unauthorized:
- No token provided
- Invalid token
- Expired token
- Token verification failed
```

### Authorization Errors
```javascript
403 Forbidden:
- Valid token but insufficient role
- Attempting to access other user's data
- Admin-only route accessed by user
```

### Consistent Error Format
```javascript
{
  success: false,
  statusCode: 401 | 403,
  error: "Error message",
  message: "Detailed message",
  timestamp: "ISO timestamp"
}
```

## Testing Strategy

### Unit Tests
- Test authenticate middleware with valid/invalid tokens
- Test requireRole middleware with different roles
- Test RLS policies with different users

### Integration Tests
- Test complete auth flow (signup → signin → access)
- Test role-based access to all protected routes
- Test data isolation between users

### Security Tests
- Test token tampering
- Test role escalation attempts
- Test cross-user data access
- Test RLS bypass attempts

## Performance Considerations

### Token Verification
- Cache user data for token lifetime
- Use Supabase connection pooling
- Minimize database queries in middleware

### Database Queries
- Add indexes on user_id columns
- Add indexes on role column
- Optimize RLS policy queries

### Caching
- Consider caching user roles
- Consider caching RLS policy results
- Invalidate cache on role changes

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies created and tested
- [ ] Indexes created
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting configured
- [ ] Error logging configured
- [ ] Monitoring configured
- [ ] Documentation updated

## Rollback Plan

If issues arise:
1. Disable RLS on affected tables
2. Remove authentication middleware from routes
3. Revert to previous version
4. Investigate and fix issues
5. Re-deploy with fixes

## Success Metrics

- 100% of protected routes require authentication
- 100% of admin routes require admin role
- 0 unauthorized data access incidents
- <10ms token verification time
- <50ms middleware overhead
- 100% RLS policy coverage
