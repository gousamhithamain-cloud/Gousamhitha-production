-- ============================================
-- TEST DIRECT QUERIES
-- Run these to verify data exists
-- ============================================

-- Check vendors data
SELECT * FROM vendors LIMIT 5;

-- Check products data
SELECT * FROM products LIMIT 5;

-- Check table schema
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('vendors', 'products')
ORDER BY table_name, ordinal_position;

-- Check if tables are in public schema
SELECT 
    schemaname,
    tablename
FROM pg_tables
WHERE tablename IN ('vendors', 'products');

-- ============================================
-- COMPLETE!
-- ============================================
