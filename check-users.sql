-- Check if users exist in Supabase
-- Run this in Supabase SQL Editor to see all users

SELECT 
    id,
    email,
    email_confirmed_at,
    confirmed_at,
    created_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- Check specifically for your email
SELECT 
    id,
    email,
    email_confirmed_at,
    confirmed_at,
    created_at
FROM auth.users
WHERE email = 'k.saruthvikreddy880@gmail.com';
