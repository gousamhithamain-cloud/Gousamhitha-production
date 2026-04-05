-- Fix Order Update Policy for Admin Users
-- Run this in Supabase SQL Editor

-- Step 1: Check current policies
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Step 2: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to update orders" ON orders;
DROP POLICY IF EXISTS "Allow admin to update orders" ON orders;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable update for all users" ON orders;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON orders;
DROP POLICY IF EXISTS "Allow public read access" ON orders;
DROP POLICY IF EXISTS "Allow public insert access" ON orders;

-- Step 3: Make sure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Step 4: Create comprehensive policies for all operations

-- SELECT policy (read orders)
CREATE POLICY "Enable read for authenticated users" 
ON orders 
FOR SELECT 
TO authenticated 
USING (true);

-- INSERT policy (create orders)
CREATE POLICY "Enable insert for authenticated users" 
ON orders 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- UPDATE policy (modify orders) - THIS IS THE KEY ONE
CREATE POLICY "Enable update for authenticated users" 
ON orders 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- DELETE policy (remove orders)
CREATE POLICY "Enable delete for authenticated users" 
ON orders 
FOR DELETE 
TO authenticated 
USING (true);

-- Step 5: Also fix order_items table policies
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for authenticated users" ON order_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON order_items;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON order_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON order_items;

CREATE POLICY "Enable read for authenticated users" 
ON order_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON order_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
ON order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" 
ON order_items FOR DELETE TO authenticated USING (true);

-- Step 6: Verify all policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, cmd;

