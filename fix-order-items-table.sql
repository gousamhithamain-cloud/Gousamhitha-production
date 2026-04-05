-- Fix order_items table to properly link with products table
-- This ensures the Supabase query can join order_items with products

-- First, check if the table exists and drop it if needed (optional - only if you want to recreate)
-- DROP TABLE IF EXISTS order_items CASCADE;

-- Recreate order_items table with proper foreign key
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Enable Row Level Security
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;

-- Create RLS policies
CREATE POLICY "Users can view their own order items"
ON order_items FOR SELECT
USING (
    order_id IN (
        SELECT id FROM orders WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own order items"
ON order_items FOR INSERT
WITH CHECK (
    order_id IN (
        SELECT id FROM orders WHERE user_id = auth.uid()
    )
);

-- Grant permissions
GRANT SELECT, INSERT ON order_items TO authenticated;
GRANT SELECT, INSERT ON order_items TO anon;
