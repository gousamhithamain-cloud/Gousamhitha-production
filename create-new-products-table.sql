-- ============================================
-- NEW PRODUCTS TABLE CREATION
-- Run this after dropping the old products table
-- ============================================

-- Drop old products table (run this first manually)
-- DROP TABLE IF EXISTS products CASCADE;

-- Create new products table with improved structure
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

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_name ON products(name);

-- Create trigger for updated_at
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

-- Insert sample products (optional)
INSERT INTO products (name, category, price, stock, unit, display_unit, image_url, description) VALUES
('Fresh Tomatoes', 'Fruits & Vegetables', 40.00, 100, 'kg', '1kg', 'https://images.unsplash.com/photo-1546470427-227e9e3e0e4e', 'Fresh organic tomatoes'),
('Basmati Rice', 'Daily Staples', 120.00, 50, 'kg', '1kg', 'https://images.unsplash.com/photo-1586201375761-83865001e31c', 'Premium basmati rice'),
('Fresh Milk', 'Bakery & Dairy', 60.00, 80, 'l', '1L', 'https://images.unsplash.com/photo-1550583724-b2692b85b150', 'Fresh dairy milk'),
('Whole Wheat Bread', 'Bakery & Dairy', 45.00, 30, 'piece', '1 loaf', 'https://images.unsplash.com/photo-1509440159596-0249088772ff', 'Freshly baked whole wheat bread'),
('Organic Apples', 'Fruits & Vegetables', 180.00, 60, 'kg', '1kg', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6', 'Fresh organic apples');

-- ============================================
-- COMPLETE!
-- ============================================
