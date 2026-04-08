-- ============================================
-- CREATE RPC FUNCTIONS FOR PRODUCTS AND VENDORS
-- These bypass any potential Supabase query issues
-- ============================================

-- Function to get all products
CREATE OR REPLACE FUNCTION get_all_products()
RETURNS TABLE (
    id UUID,
    name TEXT,
    category TEXT,
    subcategory TEXT,
    price NUMERIC,
    stock INT,
    unit TEXT,
    unit_quantity NUMERIC,
    display_unit TEXT,
    vendor_id UUID,
    image_url TEXT,
    description TEXT,
    in_stock BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.category,
        p.subcategory,
        p.price,
        p.stock,
        p.unit,
        p.unit_quantity,
        p.display_unit,
        p.vendor_id,
        p.image_url,
        p.description,
        p.in_stock,
        p.created_at,
        p.updated_at
    FROM products p
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get all vendors
CREATE OR REPLACE FUNCTION get_all_vendors()
RETURNS TABLE (
    id UUID,
    vendor_name TEXT,
    business_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    status TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.vendor_name,
        v.business_name,
        v.email,
        v.phone,
        v.address,
        v.city,
        v.state,
        v.pincode,
        v.status,
        v.created_at,
        v.updated_at
    FROM vendors v
    ORDER BY v.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Test the functions
SELECT * FROM get_all_products() LIMIT 5;
SELECT * FROM get_all_vendors() LIMIT 5;

-- ============================================
-- COMPLETE!
-- ============================================
