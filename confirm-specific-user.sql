-- Confirm specific user email
-- Run this in Supabase SQL Editor

-- Confirm k.saruthvikreddy880@gmail.com
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'k.saruthvikreddy880@gmail.com'
AND email_confirmed_at IS NULL;

-- Verify it worked
SELECT 
    email,
    email_confirmed_at,
    confirmed_at
FROM auth.users
WHERE email = 'k.saruthvikreddy880@gmail.com';
