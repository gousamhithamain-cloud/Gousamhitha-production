-- Run this in Nhost SQL Editor to verify orders table structure

-- Check if orders table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'orders';

-- Check orders table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;

-- Check if there are any orders in the table
SELECT COUNT(*) as total_orders FROM orders;

-- Check orders for your specific user (replace with your user ID)
SELECT id, customer_id, status, total, created_at
FROM orders
WHERE customer_id = '8c28b99c-3f1c-4c73-b8a8-86c2ec4d8377'
LIMIT 5;
