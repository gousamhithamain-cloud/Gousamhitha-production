-- ============================================
-- COMPLETE REAL-TIME E-COMMERCE DATABASE SCHEMA
-- Run this in Nhost SQL Editor
-- ============================================

-- Drop existing tables if you want to start fresh
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS delivery_charges CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (Linked to Nhost Auth)
-- ============================================
-- Note: Nhost handles authentication in auth.users table
-- This table stores additional customer data linked to Nhost user ID
CREATE TABLE users (
    id UUID PRIMARY KEY,  -- This will be the Nhost auth user ID
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    first_name TEXT NOT NULL,
    last_name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. VENDORS TABLE
-- ============================================
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 4. PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    price NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    unit TEXT,
    unit_quantity NUMERIC(10,2),
    display_unit TEXT,
    vendor_id UUID REFERENCES vendors(id),
    image_url TEXT,
    description TEXT,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. ORDERS TABLE (With Real-Time Status & Location)
-- ============================================
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    total NUMERIC(10,2) NOT NULL,
    
    -- Order Status (Real-time tracking)
    status TEXT DEFAULT 'Pending',
    -- Status options: 'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'
    
    payment_status TEXT DEFAULT 'pending',
    -- Payment status: 'pending', 'paid', 'failed', 'refunded'
    
    payment_method TEXT,
    -- Payment method: 'cod', 'online', 'razorpay'
    
    -- Delivery Location (Customer's address)
    delivery_address TEXT NOT NULL,
    delivery_city TEXT,
    delivery_state TEXT,
    delivery_pincode TEXT,
    delivery_latitude DECIMAL(10, 8),
    delivery_longitude DECIMAL(11, 8),
    
    delivery_charges NUMERIC(10,2) DEFAULT 0,
    
    -- Timestamps for tracking
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Additional info
    notes TEXT,
    cancellation_reason TEXT
);

-- ============================================
-- 6. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    quantity INT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) GENERATED ALWAYS AS (quantity * price) STORED
);

-- ============================================
-- 7. CART TABLE (Per User)
-- ============================================
CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 8. DELIVERY CHARGES TABLE
-- ============================================
CREATE TABLE delivery_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_order_value NUMERIC(10,2) NOT NULL,
    max_order_value NUMERIC(10,2),
    charge NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 9. ORDER STATUS HISTORY (For Tracking)
-- ============================================
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_cart_customer ON cart(customer_id);
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);

-- ============================================
-- 11. INSERT DEFAULT DATA
-- ============================================

-- Insert default categories
INSERT INTO categories (name) VALUES
('Fruits & Vegetables'),
('Daily Staples'),
('Snacks & More'),
('Bakery & Dairy'),
('Home Food'),
('Special Categories'),
('Conscious Living');

-- Insert default delivery charges
INSERT INTO delivery_charges (min_order_value, max_order_value, charge) VALUES
(0, 500, 50),
(500, 1000, 30),
(1000, NULL, 0);

-- Insert a test vendor
INSERT INTO vendors (vendor_name, business_name, email, phone) VALUES
('Gousamhitha Farm', 'Gousamhitha Organic Products', 'vendor@gousamhitha.com', '+91 98765 43210');

-- ============================================
-- 12. CREATE FUNCTIONS FOR AUTOMATION
-- ============================================

-- Function to update order status and log history
CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id TEXT,
    p_new_status TEXT,
    p_changed_by TEXT DEFAULT 'system',
    p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $
BEGIN
    -- Update order status
    UPDATE orders 
    SET status = p_new_status,
        confirmed_at = CASE WHEN p_new_status = 'Confirmed' THEN NOW() ELSE confirmed_at END,
        shipped_at = CASE WHEN p_new_status = 'Shipped' THEN NOW() ELSE shipped_at END,
        delivered_at = CASE WHEN p_new_status = 'Delivered' THEN NOW() ELSE delivered_at END,
        cancelled_at = CASE WHEN p_new_status = 'Cancelled' THEN NOW() ELSE cancelled_at END
    WHERE id = p_order_id;
    
    -- Log status change in history
    INSERT INTO order_status_history (order_id, status, changed_by, notes)
    VALUES (p_order_id, p_new_status, p_changed_by, p_notes);
END;
$ LANGUAGE plpgsql;

-- Function to get user's order count
CREATE OR REPLACE FUNCTION get_user_order_count(p_user_id UUID)
RETURNS INTEGER AS $
DECLARE
    order_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO order_count
    FROM orders
    WHERE customer_id = p_user_id;
    
    RETURN order_count;
END;
$ LANGUAGE plpgsql;

-- Function to calculate order total
CREATE OR REPLACE FUNCTION calculate_order_total(p_order_id TEXT)
RETURNS NUMERIC AS $
DECLARE
    items_total NUMERIC;
    delivery_charge NUMERIC;
    final_total NUMERIC;
BEGIN
    -- Calculate items total
    SELECT COALESCE(SUM(quantity * price), 0) INTO items_total
    FROM order_items
    WHERE order_id = p_order_id;
    
    -- Get delivery charge from order
    SELECT delivery_charges INTO delivery_charge
    FROM orders
    WHERE id = p_order_id;
    
    final_total := items_total + COALESCE(delivery_charge, 0);
    
    RETURN final_total;
END;
$ LANGUAGE plpgsql;

-- ============================================
-- 13. CREATE TRIGGERS
-- ============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at
    BEFORE UPDATE ON cart
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 14. CREATE VIEWS FOR EASY QUERYING
-- ============================================

-- View for orders with customer details
CREATE OR REPLACE VIEW orders_with_customer AS
SELECT 
    o.id,
    o.customer_id,
    o.customer_email,
    o.customer_name,
    o.customer_phone,
    u.first_name,
    u.last_name,
    u.phone as user_phone,
    o.total,
    o.status,
    o.payment_status,
    o.payment_method,
    o.delivery_address,
    o.delivery_city,
    o.delivery_state,
    o.delivery_pincode,
    o.delivery_latitude,
    o.delivery_longitude,
    o.delivery_charges,
    o.created_at,
    o.confirmed_at,
    o.shipped_at,
    o.delivered_at,
    o.cancelled_at
FROM orders o
LEFT JOIN users u ON o.customer_id = u.id;

-- View for order items with product details
CREATE OR REPLACE VIEW order_items_detailed AS
SELECT 
    oi.id,
    oi.order_id,
    oi.product_id,
    oi.product_name,
    oi.quantity,
    oi.price,
    oi.subtotal,
    p.image_url,
    p.category,
    p.vendor_id
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id;

-- ============================================
-- SCHEMA COMPLETE!
-- ============================================
