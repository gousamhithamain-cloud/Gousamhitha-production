-- ============================================
-- NHOST PERMISSIONS SETUP
-- Run these commands in Nhost SQL Editor AFTER creating tables
-- ============================================

-- These permissions allow users to access their own data through GraphQL

-- ============================================
-- 1. USERS TABLE PERMISSIONS
-- ============================================
-- Users can read their own profile
-- Users can update their own profile
-- System can insert new users on signup

-- Note: In Nhost Console, go to "Data" > "users" table > "Permissions"
-- Add these rules:

-- SELECT (Read own profile):
-- Role: user
-- Custom check: {"id": {"_eq": "X-Hasura-User-Id"}}
-- Columns: all

-- UPDATE (Update own profile):
-- Role: user
-- Custom check: {"id": {"_eq": "X-Hasura-User-Id"}}
-- Columns: first_name, last_name, phone, address, city, state, pincode, latitude, longitude

-- INSERT (Create profile on signup):
-- Role: user
-- Custom check: {"id": {"_eq": "X-Hasura-User-Id"}}
-- Columns: id, email, first_name, last_name, phone, role

-- ============================================
-- 2. CART TABLE PERMISSIONS
-- ============================================
-- Users can manage their own cart

-- SELECT (Read own cart):
-- Role: user
-- Custom check: {"customer_id": {"_eq": "X-Hasura-User-Id"}}
-- Columns: all

-- INSERT (Add to cart):
-- Role: user
-- Custom check: {"customer_id": {"_eq": "X-Hasura-User-Id"}}
-- Columns: customer_id, product_id, quantity

-- UPDATE (Update cart quantity):
-- Role: user
-- Custom check: {"customer_id": {"_eq": "X-Hasura-User-Id"}}
-- Columns: quantity

-- DELETE (Remove from cart):
-- Role: user
-- Custom check: {"customer_id": {"_eq": "X-Hasura-User-Id"}}

-- ============================================
-- 3. ORDERS TABLE PERMISSIONS
-- ============================================
-- Users can read their own orders
-- Users can create new orders

-- SELECT (Read own orders):
-- Role: user
-- Custom check: {"customer_id": {"_eq": "X-Hasura-User-Id"}}
-- Columns: all

-- INSERT (Create order):
-- Role: user
-- Custom check: {"customer_id": {"_eq": "X-Hasura-User-Id"}}
-- Columns: id, customer_id, customer_email, customer_name, customer_phone, total, status, payment_status, payment_method, delivery_address, delivery_city, delivery_state, delivery_pincode, delivery_latitude, delivery_longitude, delivery_charges

-- ============================================
-- 4. ORDER_ITEMS TABLE PERMISSIONS
-- ============================================
-- Users can read their order items
-- Users can create order items

-- SELECT (Read order items):
-- Role: user
-- Custom check: {"order": {"customer_id": {"_eq": "X-Hasura-User-Id"}}}
-- Columns: all

-- INSERT (Create order items):
-- Role: user
-- No custom check needed (validated through order)
-- Columns: order_id, product_id, product_name, quantity, price

-- ============================================
-- 5. PRODUCTS TABLE PERMISSIONS
-- ============================================
-- Everyone can read products (public access)

-- SELECT (Read products):
-- Role: user
-- Without any checks (public)
-- Columns: all

-- Also add for anonymous users:
-- Role: public
-- Without any checks
-- Columns: all

-- ============================================
-- 6. CATEGORIES TABLE PERMISSIONS
-- ============================================
-- Everyone can read categories

-- SELECT (Read categories):
-- Role: user
-- Without any checks (public)
-- Columns: all

-- Role: public
-- Without any checks
-- Columns: all

-- ============================================
-- 7. VENDORS TABLE PERMISSIONS
-- ============================================
-- Everyone can read vendors

-- SELECT (Read vendors):
-- Role: user
-- Without any checks (public)
-- Columns: all

-- Role: public
-- Without any checks
-- Columns: all

-- ============================================
-- 8. DELIVERY_CHARGES TABLE PERMISSIONS
-- ============================================
-- Everyone can read delivery charges

-- SELECT (Read delivery charges):
-- Role: user
-- Without any checks (public)
-- Columns: all

-- Role: public
-- Without any checks
-- Columns: all

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. These permissions are set in Nhost Console UI, not SQL
-- 2. Go to: Data > [Table Name] > Permissions tab
-- 3. Add rules for "user" role as described above
-- 4. X-Hasura-User-Id is automatically set by Nhost auth
-- 5. This ensures users can only access their own data

-- ============================================
-- GRAPHQL QUERIES WILL WORK AFTER PERMISSIONS
-- ============================================

-- Example: Get user's cart
-- query GetCart {
--   cart {
--     id
--     quantity
--     product {
--       name
--       price
--       image_url
--     }
--   }
-- }

-- Example: Get user's orders
-- query GetOrders {
--   orders(order_by: {created_at: desc}) {
--     id
--     total
--     status
--     created_at
--     order_items {
--       product_name
--       quantity
--       price
--     }
--   }
-- }

-- Example: Add to cart
-- mutation AddToCart($productId: uuid!, $quantity: Int!) {
--   insert_cart_one(object: {
--     product_id: $productId,
--     quantity: $quantity
--   }) {
--     id
--   }
-- }

-- ============================================
-- SETUP COMPLETE!
-- ============================================
