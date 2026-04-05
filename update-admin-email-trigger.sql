-- Update Admin Email in Profile Creation Trigger
-- Run this in Supabase SQL Editor

-- Drop existing function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate function with new admin email
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

-- Verify
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
