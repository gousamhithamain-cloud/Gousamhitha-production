-- ============================================
-- FIX RLS POLICIES FOR PRODUCTS AND VENDORS
-- This allows the service role to read all data
-- ============================================

-- Disable RLS on vendors table (or create proper policies)
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;

-- Disable RLS on products table (or create proper policies)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled, create policies that allow service role access
-- DROP POLICY IF EXISTS "Enable read access for service role" ON vendors;
-- CREATE POLICY "Enable read access for service role" ON vendors
--     FOR SELECT
--     USING (true);

-- DROP POLICY IF EXISTS "Enable read access for service role" ON products;
-- CREATE POLICY "Enable read access for service role" ON products
--     FOR SELECT
--     USING (true);

-- Verify RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('vendors', 'products');

-- ============================================
-- COMPLETE!
-- ============================================
