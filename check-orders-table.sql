-- Check if orders table exists and view its structure
-- Run this in Supabase SQL Editor

-- Check if orders table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'orders'
) as orders_table_exists;

-- Show orders table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;

-- Check existing orders
SELECT COUNT(*) as total_orders FROM public.orders;

-- Show sample orders
SELECT * FROM public.orders LIMIT 5;
