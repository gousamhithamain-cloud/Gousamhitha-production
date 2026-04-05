-- Create a Test User Directly in Database
-- This bypasses rate limits and email confirmation
-- Run this in Supabase SQL Editor

-- WARNING: This creates a user with a known password hash
-- Only use for testing/development

-- First, let's check if the user already exists
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'primellax200@gmail.com';

-- If the user exists but is not confirmed, confirm them:
UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'primellax200@gmail.com'
AND email_confirmed_at IS NULL;

-- Create a new test user if needed (change email as needed)
-- Password will be: Test@123456
-- Note: You'll need to use Supabase's signUp function no