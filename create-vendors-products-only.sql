-- ============================================
-- CREATE VENDORS AND PRODUCTS TABLES ONLY
-- Simple version without dependent tables
-- ============================================

-- Step 1: Create vendors table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for vendors
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_email ON vendors(email);

-- Trigger for vendors updated_at
CREATE OR REPLACE FUNCTION update_vendors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_vendors_updated_at();

-- Step 2: Create products table
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

-- Create indexes for products
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_name ON products(name);

-- Trigger for products updated_at
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

-- Step 3: Insert sample vendors
INSERT INTO vendors (vendor_name, business_name, email, phone, address, city, state, status) VALUES
('Gousamhitha Farm', 'Gousamhitha Organic Products', 'vendor@gousamhitha.com', '+91 98765 43210', 'Farm Road 123', 'Bangalore', 'Karnataka', 'active'),
('Fresh Harvest Co', 'Fresh Harvest Suppliers', 'contact@freshharvest.com', '+91 98765 43211', 'Market Street 45', 'Mumbai', 'Maharashtra', 'active'),
('Dairy Delight', 'Dairy Delight Products', 'info@dairydelight.com', '+91 98765 43212', 'Dairy Lane 78', 'Pune', 'Maharashtra', 'active'),
('Grain Masters', 'Grain Masters Pvt Ltd', 'sales@grainmasters.com', '+91 98765 43213', 'Grain Market 90', 'Delhi', 'Delhi', 'active'),
('Snack Factory', 'Snack Factory India', 'orders@snackfactory.com', '+91 98765 43214', 'Industrial Area 12', 'Hyderabad', 'Telangana', 'active');

-- Step 4: Insert sample products
INSERT INTO products (name, category, subcategory, price, stock, unit, display_unit, vendor_id, image_url, description) VALUES
-- Fruits & Vegetables
('Fresh Tomatoes', 'Fruits & Vegetables', 'Vegetables', 40.00, 100, 'kg', '1kg', (SELECT id FROM vendors WHERE vendor_name = 'Gousamhitha Farm'), 'https://images.unsplash.com/photo-1546470427-227e9e3e0e4e', 'Fresh organic tomatoes'),
('Organic Apples', 'Fruits & Vegetables', 'Fruits', 180.00, 60, 'kg', '1kg', (SELECT id FROM vendors WHERE vendor_name = 'Fresh Harvest Co'), 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6', 'Fresh organic apples'),
('Green Beans', 'Fruits & Vegetables', 'Vegetables', 50.00, 40, 'kg', '500g', (SELECT id FROM vendors WHERE vendor_name = 'Gousamhitha Farm'), 'https://images.unsplash.com/photo-1587411768941-1c0d0c5e1c3c', 'Fresh green beans'),
('Banana', 'Fruits & Vegetables', 'Fruits', 50.00, 120, 'dozen', '1 dozen', (SELECT id FROM vendors WHERE vendor_name = 'Fresh Harvest Co'), 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e', 'Fresh bananas'),
('Carrots', 'Fruits & Vegetables', 'Vegetables', 45.00, 80, 'kg', '1kg', (SELECT id FROM vendors WHERE vendor_name = 'Gousamhitha Farm'), 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37', 'Fresh carrots'),

-- Daily Staples
('Basmati Rice', 'Daily Staples', 'Rice & Grains', 120.00, 50, 'kg', '1kg', (SELECT id FROM vendors WHERE vendor_name = 'Grain Masters'), 'https://images.unsplash.com/photo-1586201375761-83865001e31c', 'Premium basmati rice'),
('Toor Dal', 'Daily Staples', 'Pulses', 140.00, 70, 'kg', '1kg', (SELECT id FROM vendors WHERE vendor_name = 'Grain Masters'), 'https://images.unsplash.com/photo-1596797038530-2c107229654b', 'Premium toor dal'),
('Wheat Flour', 'Daily Staples', 'Flour', 50.00, 100, 'kg', '1kg', (SELECT id FROM vendors WHERE vendor_name = 'Grain Masters'), 'https://images.unsplash.com/photo-1628088062854-d1870b4553da', 'Whole wheat flour'),

-- Bakery & Dairy
('Fresh Milk', 'Bakery & Dairy', 'Dairy', 60.00, 80, 'l', '1L', (SELECT id FROM vendors WHERE vendor_name = 'Dairy Delight'), 'https://images.unsplash.com/photo-1550583724-b2692b85b150', 'Fresh dairy milk'),
('Whole Wheat Bread', 'Bakery & Dairy', 'Bakery', 45.00, 30, 'piece', '1 loaf', (SELECT id FROM vendors WHERE vendor_name = 'Dairy Delight'), 'https://images.unsplash.com/photo-1509440159596-0249088772ff', 'Freshly baked whole wheat bread'),
('Paneer', 'Bakery & Dairy', 'Dairy', 90.00, 25, 'kg', '200g', (SELECT id FROM vendors WHERE vendor_name = 'Dairy Delight'), 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7', 'Fresh paneer'),
('Butter', 'Bakery & Dairy', 'Dairy', 55.00, 40, 'pack', '100g', (SELECT id FROM vendors WHERE vendor_name = 'Dairy Delight'), 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d', 'Fresh butter'),

-- Snacks & More
('Potato Chips', 'Snacks & More', 'Chips', 30.00, 100, 'pack', '100g', (SELECT id FROM vendors WHERE vendor_name = 'Snack Factory'), 'https://images.unsplash.com/photo-1566478989037-eec170784d0b', 'Crispy potato chips'),
('Cookies', 'Snacks & More', 'Biscuits', 40.00, 80, 'pack', '200g', (SELECT id FROM vendors WHERE vendor_name = 'Snack Factory'), 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35', 'Delicious cookies'),
('Namkeen Mix', 'Snacks & More', 'Namkeen', 35.00, 60, 'pack', '150g', (SELECT id FROM vendors WHERE vendor_name = 'Snack Factory'), 'https://images.unsplash.com/photo-1601050690597-df0568f70950', 'Spicy namkeen mix');

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Tables created successfully!' as status;
SELECT COUNT(*) as vendor_count FROM vendors;
SELECT COUNT(*) as product_count FROM products;

-- Show sample data
SELECT 
    p.name as product_name, 
    p.category, 
    p.price, 
    p.stock,
    p.in_stock,
    v.vendor_name
FROM products p
LEFT JOIN vendors v ON p.vendor_id = v.id
ORDER BY p.category, p.name;

-- ============================================
-- COMPLETE!
-- ============================================
