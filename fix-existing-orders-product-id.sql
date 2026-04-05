-- Fix existing order_items that have NULL product_id
-- This will try to match products by name

-- First, let's see what we have
SELECT 
    oi.id,
    oi.product_name,
    oi.product_id,
    p.id as matching_product_id,
    p.name as matching_product_name,
    p.image_url
FROM order_items oi
LEFT JOIN products p ON LOWER(oi.product_name) = LOWER(p.name)
WHERE oi.product_id IS NULL;

-- If the above query shows matching products, run this update:
-- UPDATE order_items oi
-- SET product_id = p.id
-- FROM products p
-- WHERE LOWER(oi.product_name) = LOWER(p.name)
-- AND oi.product_id IS NULL;

-- Verify the update
-- SELECT 
--     oi.id,
--     oi.product_name,
--     oi.product_id,
--     p.name as product_name_from_table,
--     p.image_url
-- FROM order_items oi
-- LEFT JOIN products p ON oi.product_id = p.id
-- ORDER BY oi.created_at DESC;
