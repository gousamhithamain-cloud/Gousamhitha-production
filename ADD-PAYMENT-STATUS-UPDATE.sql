-- Add Payment Status Update Feature for COD Orders
-- Run this in Supabase SQL Editor

-- Step 1: Check if payment_status column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'payment_status';

-- Step 2: Add payment_status column if it doesn't exist
-- (Skip this if column already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
        RAISE NOTICE 'payment_status column added';
    ELSE
        RAISE NOTICE 'payment_status column already exists';
    END IF;
END $$;

-- Step 3: Update existing orders to set payment_status based on payment_method
UPDATE orders 
SET payment_status = CASE 
    WHEN payment_method = 'Cash on Delivery' THEN 'pending'
    WHEN payment_method LIKE '%Online%' OR payment_method LIKE '%Card%' OR payment_method LIKE '%UPI%' THEN 'paid'
    ELSE 'pending'
END
WHERE payment_status IS NULL OR payment_status = '';

-- Step 4: Create a function to auto-update payment status when order is delivered
CREATE OR REPLACE FUNCTION update_cod_payment_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
    -- If order status changed to 'Delivered' and payment method is COD
    IF NEW.order_status = 'Delivered' 
       AND OLD.order_status != 'Delivered' 
       AND NEW.payment_method = 'Cash on Delivery' 
       AND NEW.payment_status = 'pending' THEN
        
        -- Automatically mark payment as received
        NEW.payment_status := 'paid';
        
        RAISE NOTICE 'COD payment marked as paid for order %', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to call the function
DROP TRIGGER IF EXISTS cod_payment_trigger ON orders;

CREATE TRIGGER cod_payment_trigger
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_cod_payment_on_delivery();

-- Step 6: Verify the trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'cod_payment_trigger';

-- Step 7: Test the setup (optional - creates a test order)
-- Uncomment to test:
/*
-- Insert test COD order
INSERT INTO orders (
    customer_name, 
    email, 
    phone, 
    address, 
    city, 
    pincode, 
    payment_method, 
    payment_status,
    order_status, 
    total
) VALUES (
    'Test Customer',
    'test@example.com',
    '9876543210',
    'Test Address',
    'Test City',
    '123456',
    'Cash on Delivery',
    'pending',
    'Pending',
    500
) RETURNING id, payment_status, order_status;

-- Update to Delivered (should auto-update payment_status to 'paid')
UPDATE orders 
SET order_status = 'Delivered' 
WHERE customer_name = 'Test Customer' 
AND email = 'test@example.com'
RETURNING id, order_status, payment_status;

-- Clean up test order
DELETE FROM orders 
WHERE customer_name = 'Test Customer' 
AND email = 'test@example.com';
*/

-- Step 8: View current orders with payment status
SELECT 
    id,
    customer_name,
    payment_method,
    payment_status,
    order_status,
    total,
    created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- Summary of what this script does:
-- 1. Adds payment_status column if missing
-- 2. Sets default payment status for existing orders
-- 3. Creates automatic trigger to mark COD as paid when delivered
-- 4. Allows manual payment status updates via admin panel
-- 5. Maintains payment tracking for all orders
