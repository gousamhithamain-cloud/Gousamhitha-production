-- Check order_items data to see if product_id is being saved
SELECT 
    oi.id,
    oi.order_id,
    oi.product_id,
    oi.product_name,
    oi.quantity,
    oi.price,
    p.name as actual_product_name,
    p.image_url as product_image
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
ORDER BY oi.created_at DESC
LIMIT 10;
