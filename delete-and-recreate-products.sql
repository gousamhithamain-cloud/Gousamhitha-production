-- ============================================
-- COMPLETE PRODUCTS TABLE RESET
-- This handles all dependencies properly
-- ============================================

-- Step 1: Drop all dependent constraints and tables
-- Drop order_items first (depends on products)
DROP TABLE IF EXISTS order_items CASCADE;

-- Drop cart (depends on products)
DROP TABLE IF EXISTS cart CASCADE;

-- Step 2: Now drop products table
DROP TABLE IF EXISTS products CASCADE;

-- Step 3: Create new products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price > 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    unit TEXT NOT NULL DEFAULT 'piece',
    unit_quantity NUMERIC(10,2),
    display_unit TEXT,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    image_url TEXT,
    description TEXT,
    in_stock BOOLEAN GENERATED ALWAYS AS (stock > 0) STORED,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 4: Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_name ON products(name);

-- Step 5: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- Step 6: Recreate cart table
CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cart_customer ON cart(customer_id);
CREATE INDEX idx_cart_product ON cart(product_id);

-- Trigger for cart updated_at
CREATE OR REPLACE FUNCTION update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cart_updated_at
    BEFORE UPDATE ON cart
    FOR EACH ROW
    EXECUTE FUNCTION update_cart_updated_at();

-- Step 7: Recreate order_items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) GENERATED ALWAYS AS (quantity * price) STORED
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Step 8: Insert sample products
INSERT INTO products (name, category, price, stock, unit, display_unit, image_url, description) VALUES
('Fresh Tomatoes', 'Fruits & Vegetables', 40.00, 100, 'kg', '1kg', 'https://images.unsplash.com/photo-1546470427-227e9e3e0e4e', 'Fresh organic tomatoes'),
('Basmati Rice', 'Daily Staples', 120.00, 50, 'kg', '1kg', 'https://images.unsplash.com/photo-1586201375761-83865001e31c', 'Premium basmati rice'),
('Fresh Milk', 'Bakery & Dairy', 60.00, 80, 'l', '1L', 'https://images.unsplash.com/photo-1550583724-b2692b85b150', 'Fresh dairy milk'),
('Whole Wheat Bread', 'Bakery & Dairy', 45.00, 30, 'piece', '1 loaf', 'https://images.unsplash.com/photo-1509440159596-0249088772ff', 'Freshly baked whole wheat bread'),
('Organic Apples', 'Fruits & Vegetables', 180.00, 60, 'kg', '1kg', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6', 'Fresh organic apples'),
('Green Beans', 'Fruits & Vegetables', 50.00, 40, 'kg', '500g', 'https://images.unsplash.com/photo-1587411768941-1c0d0c5e1c3c', 'Fresh green beans'),
('Toor Dal', 'Daily Staples', 140.00, 70, 'kg', '1kg', 'https://images.unsplash.com/photo-1596797038530-2c107229654b', 'Premium toor dal'),
('Paneer', 'Bakery & Dairy', 90.00, 25, 'kg', '200g', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7', 'Fresh paneer'),
('Potato Chips', 'Snacks & More', 30.00, 100, 'pack', '100g', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b', 'Crispy potato chips'),
('Banana', 'Fruits & Vegetables', 50.00, 120, 'dozen', '1 dozen', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e', 'Fresh bananas');

-- ============================================
-- COMPLETE! Products table recreated with all dependencies
-- ============================================

SELECT 'Products table recreated successfully!' as status;
SELECT COUNT(*) as product_count FROM products;
