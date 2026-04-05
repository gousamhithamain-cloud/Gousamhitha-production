-- Update Admin Credentials
-- New Email: admin@123.com
-- New Password: [set via Supabase Dashboard - do not store passwords in code]

-- Step 1: Update the email in auth.users table
-- Run this in Supabase SQL Editor

-- Update email
-- UPDATE auth.users 
-- SET email = 'admin@123.com',
--     raw_user_meta_data = jsonb_set(
--         COALESCE(raw_user_meta_data, '{}'::jsonb),
--         '{email}',
--         '"admin@123.com"'
--     )
-- WHERE email = 'gowsamhitha123@gmail.com';

-- Step 2: Update password via Supabase Dashboard
-- Go to Authentication → Users → Find admin@123.com → Reset Password

-- Step 3: Update users table if it exists
UPDATE users 
SET email = 'admin@123.com'
WHERE email = 'gowsamhitha123@gmail.com';

-- Verify the update
SELECT id, email, created_at FROM auth.users WHERE email = 'admin@123.com';
