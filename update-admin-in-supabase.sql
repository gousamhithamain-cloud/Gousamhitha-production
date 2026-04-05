-- Update Admin Email in Supabase
-- Run these commands ONE BY ONE in Supabase SQL Editor

-- Step 1: First, update the profiles table (if it exists)
UPDATE profiles 
SET email = 'admin@123.com'
WHERE email = 'gowsamhitha123@gmail.com';

-- Step 2: Update the auth.users table
UPDATE auth.users 
SET email = 'admin@123.com',
    raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{email}',
        '"admin@123.com"'
    )
WHERE email = 'gowsamhitha123@gmail.com';

-- Step 3: Verify the update
SELECT id, email, created_at FROM auth.users WHERE email = 'admin@123.com';

-- Step 4: Update the trigger function for future users
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN NEW.email = 'admin@123.com' THEN 'admin'
            ELSE 'customer'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Update password through Supabase Dashboard
-- Go to Authentication → Users → Find admin@123.com → Reset Password
