-- ============================================
-- COMPLETE SUPABASE DATABASE RESTORATION
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Profiles table (links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
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
    created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_email TEXT,
    customer_id UUID REFERENCES auth.users(id),
    total NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'Pending',
    payment_status TEXT DEFAULT 'pending',
    delivery_address TEXT,
    delivery_charges NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name TEXT,
    quantity INT NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

-- Delivery charges table
CREATE TABLE IF NOT EXISTS delivery_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_order_value NUMERIC(10,2) NOT NULL,
    max_order_value NUMERIC(10,2),
    charge NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- 3. INSERT DEFAULT CATEGORIES
-- ============================================

INSERT INTO categories (name) VALUES
('Fruits & Vegetables'),
('Daily Staples'),
('Snacks & More'),
('Bakery & Dairy'),
('Home Food'),
('Special Categories'),
('Conscious Living')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 4. INSERT DEFAULT DELIVERY CHARGES
-- ============================================

INSERT INTO delivery_charges (min_order_value, max_order_value, charge) VALUES
(0, 500, 50),
(500, 1000, 30),
(1000, NULL, 0)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_charges ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CREATE RLS POLICIES
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Products policies (public read, admin write)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products" 
ON products FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products" 
ON products FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products" 
ON products FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Orders policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" 
ON orders FOR SELECT 
USING (
    customer_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
CREATE POLICY "Users can create their own orders" 
ON orders FOR INSERT 
WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" 
ON orders FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Order items policies
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
CREATE POLICY "Users can view their order items" 
ON order_items FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.customer_id = auth.uid() OR
             EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
    )
);

DROP POLICY IF EXISTS "Users can insert their order items" ON order_items;
CREATE POLICY "Users can insert their order items" 
ON order_items FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.customer_id = auth.uid()
    )
);

-- Categories policies (public read, admin write)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" 
ON categories FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" 
ON categories FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Vendors policies (public read, admin write)
DROP POLICY IF EXISTS "Vendors are viewable by everyone" ON vendors;
CREATE POLICY "Vendors are viewable by everyone" 
ON vendors FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can manage vendors" ON vendors;
CREATE POLICY "Admins can manage vendors" 
ON vendors FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Delivery charges policies (public read, admin write)
DROP POLICY IF EXISTS "Delivery charges are viewable by everyone" ON delivery_charges;
CREATE POLICY "Delivery charges are viewable by everyone" 
ON delivery_charges FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can manage delivery charges" ON delivery_charges;
CREATE POLICY "Admins can manage delivery charges" 
ON delivery_charges FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- ============================================
-- 7. CREATE ADMIN USER TRIGGER
-- ============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN NEW.email = 'admin@123.com' THEN 'admin'
            ELSE 'customer'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- RESTORATION COMPLETE!
-- ============================================

-- To verify, run these queries:
-- SELECT * FROM profiles;
-- SELECT * FROM categories;
-- SELECT * FROM products;
-- SELECT * FROM delivery_charges;
