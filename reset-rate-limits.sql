-- Reset Rate Limits for Authentication
-- Run this in Supabase SQL Editor

-- Note: Rate limits are managed by Supabase's API, not directly in the database
-- However, we can clear any rate limit tracking data

-- Clear any rate limit entries (if they exist in your schema)
-- This is a safety check - these tables may not exist in all Supabase projects
DO $$
BEGIN
    -- Try to truncate rate limit tables if they exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'rate_limits') THEN
        TRUNCATE TABLE auth.rate_limits;
    END IF;
END $$;

-- Show current auth configuration
SELECT 
    'Total Users' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Confirmed Users' as metric,
    COUNT(*) as count
FROM auth.users
WHERE email_confirmed_at IS NOT NULL
UNION ALL
SELECT 
    'Unconfirmed Users' as metric,
    COUNT(*) as count
FROM auth.users
WHERE email_confirmed_at IS NULL;
