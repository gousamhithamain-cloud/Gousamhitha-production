-- Verify if users table exists and check its structure
-- Run this in Supabase SQL Editor

-- Check if users table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
) as users_table_exists;

-- Show table structure if it exists
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Check existing users in public.users table
SELECT * FROM public.users LIMIT 5;
