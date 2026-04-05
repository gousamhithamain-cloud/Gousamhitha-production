-- Reset Admin Password
-- This will allow you to set a new password for the admin account
-- Run this in Supabase SQL Editor

-- First, check if the admin user exists
SELECT id, email FROM auth.users WHERE email = 'gowsamhitha123@gmail.com';

-- To reset the password, you need to do it through Supabase Dashboard:
-- 1. Go to Authentication → Users
-- 2. Find gowsamhitha123@gmail.com
-- 3. Click the three dots → "Reset Password"
-- 4. Or click "Send Magic Link" to login without password

-- Alternatively, you can use the Supabase Dashboard to manually set a new password:
-- 1. Go to Authentication → Users
-- 2. Click on the user
-- 3. Scroll down to "Reset Password"
-- 4. Enter new password: 123456
-- 5. Click "Update User"
