-- Fix order_items table foreign key relationship with products
-- This script ensures Supabase can properly join order_items with products

-- Step 1: Drop existing foreign key constraint if it exists
ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Step 2: Add the foreign key constraint with proper naming
ALTER TABLE order_items
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE SET NULL;

-- Step 3: Verify the constraint was created
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'order_items'
    AND kcu.column_name = 'product_id';
