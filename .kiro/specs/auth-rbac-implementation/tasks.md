# Authentication & RBAC - Implementation Tasks

## Phase 1: Database Setup

### Task 1.1: Update Users Table Schema
- [ ] Add role column to users table
- [ ] Set default role to 'customer'
- [ ] Add check constraint for valid roles
- [ ] Create migration script

### Task 1.2: Create Database Indexes
- [ ] Add index on users.role
- [ ] Add index on cart.user_id
- [ ] Add index on orders.user_id
- [ ] Verify index performance

## Phase 2: Authentication Middleware

### Task 2.1: Create Authentication Middleware
- [x] Create `middleware/auth.js`
- [x] Implement `authenticate` middleware
  - [x] Extract token from Authorization header
  - [x] Verify token with Supabase Auth
  - [x] Fetch user details from database
  - [x] Attach user to req.user
  - [x] Handle errors (401)
- [x] Add comprehensive error handling
- [x] Add logging for auth failures

### Task 2.2: Create Authorization Middleware
- [x] Implement `requireRole` middleware factory
  - [x] Check req.user exists
  - [x] Verify user role matches allowed roles
  - [x] Return 403 if unauthorized
- [x] Implement `requireOwnership` middleware
  - [x] Verify user owns the resource
  - [x] Allow admin bypass
- [ ] Add unit tests

## Phase 3: Update Auth Controller

### Task 3.1: Enhance Signup Function
- [ ] Add role field to user creation
- [ ] Set default role to 'customer'
- [ ] Store role in users table
- [ ] Store role in auth metadata
- [ ] Return role in response
- [ ] Add validation for role field

### Task 3.2: Enhance Signin Function
- [ ] Fetch user role from database
- [ ] Include role in JWT token
- [ ] Return role in response
- [ ] Handle missing role gracefully

### Task 3.3: Add Admin Assignment Endpoint
- [ ] Create POST /api/auth/assign-admin
- [ ] Require admin role
- [ ] Update user role in database
- [ ] Update user role in auth metadata
- [ ] Add validation
- [ ] Add audit logging

## Phase 4: Protect Routes

### Task 4.1: Protect Product Routes
- [ ] Add authenticate + requireRole('admin') to POST /api/products
- [ ] Add authenticate + requireRole('admin') to PUT /api/products/:id
- [ ] Add authenticate + requireRole('admin') to DELETE /api/products/:id
- [ ] Keep GET routes public
- [ ] Test with user and admin roles

### Task 4.2: Protect Cart Routes
- [ ] Add authenticate to GET /api/cart/:userId
- [ ] Add authenticate to POST /api/cart
- [ ] Add authenticate to PUT /api/cart/:itemId
- [ ] Add authenticate to DELETE /api/cart/:itemId
- [ ] Add authenticate to DELETE /api/cart/user/:userId
- [ ] Add ownership verification
- [ ] Test with different users

### Task 4.3: Protect Order Routes
- [ ] Add authenticate + requireRole('admin') to GET /api/orders
- [ ] Add authenticate to POST /api/orders
- [ ] Add authenticate to GET /api/orders/user/:userId
- [ ] Add authenticate to GET /api/orders/:id
- [ ] Add authenticate + requireRole('admin') to PUT /api/orders/:id/status
- [ ] Add authenticate + requireRole('admin') to DELETE /api/orders/:id
- [ ] Add ownership verification for user routes
- [ ] Test with user and admin roles

### Task 4.4: Protect User Routes
- [ ] Add authenticate to GET /api/users/:id
- [ ] Add authenticate to PUT /api/users/:id
- [ ] Add authenticate + requireRole('admin') to DELETE /api/users/:id
- [ ] Add ownership verification
- [ ] Test with different users

## Phase 5: Row-Level Security (RLS)

### Task 5.1: Enable RLS on Tables
- [ ] Enable RLS on cart table
- [ ] Enable RLS on orders table
- [ ] Enable RLS on order_items table
- [ ] Enable RLS on users table
- [ ] Create SQL migration script

### Task 5.2: Create Cart RLS Policies
- [ ] Create policy: Users can view own cart
- [ ] Create policy: Users can insert own cart
- [ ] Create policy: Users can update own cart
- [ ] Create policy: Users can delete own cart
- [ ] Create policy: Admins can view all carts
- [ ] Test policies with different users

### Task 5.3: Create Orders RLS Policies
- [ ] Create policy: Users can view own orders
- [ ] Create policy: Users can insert own orders
- [ ] Create policy: Admins can view all orders
- [ ] Create policy: Admins can update all orders
- [ ] Create policy: Admins can delete all orders
- [ ] Test policies with different users

### Task 5.4: Create Order Items RLS Policies
- [ ] Create policy: Users can view own order items
- [ ] Create policy: Admins can view all order items
- [ ] Test policies with different users

### Task 5.5: Create Users RLS Policies
- [ ] Create policy: Users can view own profile
- [ ] Create policy: Users can update own profile
- [ ] Create policy: Admins can view all users
- [ ] Create policy: Admins can update all users
- [ ] Test policies with different users

## Phase 6: Update Controllers

### Task 6.1: Update Cart Controller
- [ ] Add user ID verification in getCart
- [ ] Add user ID verification in addToCart
- [ ] Add user ID verification in updateCartItem
- [ ] Add user ID verification in removeCartItem
- [ ] Add user ID verification in clearCart
- [ ] Use req.user.id from middleware
- [ ] Test with different users

### Task 6.2: Update Order Controller
- [ ] Add user ID verification in getUserOrders
- [ ] Add user ID verification in getOrderById
- [ ] Add user ID verification in createOrder
- [ ] Use req.user.id from middleware
- [ ] Test with different users

### Task 6.3: Update User Controller
- [ ] Add user ID verification in getUserById
- [ ] Add user ID verification in updateUser
- [ ] Use req.user.id from middleware
- [ ] Test with different users

## Phase 7: Testing

### Task 7.1: Unit Tests
- [ ] Test authenticate middleware with valid token
- [ ] Test authenticate middleware with invalid token
- [ ] Test authenticate middleware with expired token
- [ ] Test authenticate middleware with no token
- [ ] Test requireRole middleware with correct role
- [ ] Test requireRole middleware with incorrect role
- [ ] Test requireRole middleware without authentication

### Task 7.2: Integration Tests
- [ ] Test signup flow with role assignment
- [ ] Test signin flow with role retrieval
- [ ] Test admin route access with admin role
- [ ] Test admin route access with user role (should fail)
- [ ] Test user route access with authentication
- [ ] Test user route access without authentication (should fail)
- [ ] Test cross-user data access (should fail)

### Task 7.3: RLS Tests
- [ ] Test user can access own cart
- [ ] Test user cannot access other user's cart
- [ ] Test admin can access all carts
- [ ] Test user can access own orders
- [ ] Test user cannot access other user's orders
- [ ] Test admin can access all orders
- [ ] Test RLS policies with SQL queries

### Task 7.4: Security Tests
- [ ] Test token tampering
- [ ] Test role escalation attempts
- [ ] Test SQL injection in auth
- [ ] Test XSS in auth
- [ ] Test brute force protection (rate limiting)
- [ ] Test password requirements

## Phase 8: Documentation

### Task 8.1: API Documentation
- [ ] Document authentication flow
- [ ] Document authorization flow
- [ ] Document protected routes
- [ ] Document error responses
- [ ] Document token format
- [ ] Create Postman collection

### Task 8.2: Developer Documentation
- [ ] Document middleware usage
- [ ] Document RLS policies
- [ ] Document role management
- [ ] Document testing procedures
- [ ] Create troubleshooting guide

### Task 8.3: Deployment Documentation
- [ ] Document environment variables
- [ ] Document database migrations
- [ ] Document RLS setup
- [ ] Document rollback procedures
- [ ] Create deployment checklist

## Phase 9: Deployment

### Task 9.1: Pre-Deployment
- [ ] Review all code changes
- [ ] Run all tests
- [ ] Verify environment variables
- [ ] Create database backup
- [ ] Review security checklist

### Task 9.2: Database Migration
- [ ] Run schema migration (add role column)
- [ ] Run index creation
- [ ] Run RLS policy creation
- [ ] Verify migrations successful
- [ ] Test database connectivity

### Task 9.3: Deploy Backend
- [ ] Deploy updated backend code
- [ ] Verify server starts successfully
- [ ] Test authentication endpoints
- [ ] Test protected routes
- [ ] Monitor error logs

### Task 9.4: Post-Deployment Verification
- [ ] Test signup flow
- [ ] Test signin flow
- [ ] Test admin access
- [ ] Test user access
- [ ] Test RLS policies
- [ ] Monitor performance metrics

## Phase 10: Monitoring & Maintenance

### Task 10.1: Setup Monitoring
- [ ] Monitor authentication failures
- [ ] Monitor authorization failures
- [ ] Monitor RLS policy violations
- [ ] Setup alerts for suspicious activity
- [ ] Monitor token expiration rates

### Task 10.2: Performance Monitoring
- [ ] Monitor middleware overhead
- [ ] Monitor database query performance
- [ ] Monitor RLS policy performance
- [ ] Optimize slow queries
- [ ] Add caching if needed

### Task 10.3: Security Auditing
- [ ] Review authentication logs
- [ ] Review authorization logs
- [ ] Review failed access attempts
- [ ] Review role changes
- [ ] Conduct security audit

## Success Criteria

- [ ] All protected routes require authentication
- [ ] All admin routes require admin role
- [ ] All user routes verify ownership
- [ ] RLS policies enforce data isolation
- [ ] All tests pass
- [ ] No security vulnerabilities
- [ ] Performance within acceptable limits
- [ ] Documentation complete
- [ ] Deployment successful
- [ ] Monitoring active
