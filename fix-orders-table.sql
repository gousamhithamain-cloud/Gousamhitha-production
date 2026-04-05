-- Fix orders table - Add customer_id column if missing
-- Run this in Nhost SQL Editor

-- First, check current columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- If customer_id column doesn't exist, add it
-- (This will fail if column already exists, which is fine)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id);

-- If the table has a different column name like user_id or customerId, 
-- you can rename it:
-- ALTER TABLE orders RENAME COLUMN user_id TO customer_id;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
AND column_name = 'customer_id';

-- If you need to populate customer_id from customer_email
-- (assuming you have customer_email column):
-- UPDATE orders 
-- SET customer_id = (
--     SELECT id FROM auth.users 
--     WHERE email = orders.customer_email
-- )
-- WHERE customer_id IS NULL;
