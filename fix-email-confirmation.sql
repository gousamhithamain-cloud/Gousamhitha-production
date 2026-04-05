-- Fix Email Confirmation Issues in Supabase
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Confirm all existing users (mark them as email confirmed)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Specifically confirm the user with email primellax200@gmail.com
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'primellax200@gmail.com';

-- 3. Also confirm k.saruthvikreddy880@gmail.com if exists
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'k.saruthvikreddy880@gmail.com';

-- 4. Check the results
SELECT 
    id,
    email,
    email_confirmed_at,
    confirmed_at,
    created_at
FROM auth.users
ORDER BY created_at DESC;
