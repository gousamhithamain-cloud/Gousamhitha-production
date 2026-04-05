CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Drop existing products table if it exists
DROP TABLE IF EXISTS products CASCADE;

-- Create products table with all required columns
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    price NUMERIC(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    unit TEXT,
    unit_quantity NUMERIC(10,2),
    display_unit TEXT,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    image_url TEXT,
    description TEXT,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Enable Row Level Security (but allow all operations for now)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on products" ON products
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT,
    pincode TEXT,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    delivery_address TEXT,
    payment_method TEXT DEFAULT 'COD',
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'Pending',
    total NUMERIC(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID,
    product_name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

INSERT INTO categories (name) VALUES
('Fruits & Vegetables'),
('Daily Staples'),
('Snacks & More'),
('Bakery & Dairy'),
('Home Food'),
('Special Categories'),
('Conscious Living')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;


CREATE TABLE IF NOT EXISTS vendor_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    gross_amount NUMERIC(10,2) NOT NULL,
    commission_amount NUMERIC(10,2) NOT NULL,
    net_amount NUMERIC(10,2) NOT NULL,
    payout_status TEXT DEFAULT 'pending',
    payout_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_payouts_order ON vendor_payouts(order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payouts_vendor ON vendor_payouts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payouts_status ON vendor_payouts(payout_status);

ALTER TABLE vendor_payouts DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS vendor_payment_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('bank','upi')),
    account_holder_name TEXT,
    bank_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    upi_id TEXT,
    upi_name TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES vendors(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vendor_payment_vendor ON vendor_payment_details(vendor_id);

ALTER TABLE vendor_payment_details DISABLE ROW LEVEL SECURITY;
