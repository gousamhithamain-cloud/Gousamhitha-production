-- Check the orders table structure and status values
SELECT 
    id,
    customer_name,
    status,
    order_status,
    created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- Also check what columns exist in orders table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;
