-- Check if specific email exists in auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'qwertyasd077a@gmail.com';

-- Check if it exists in public.users
SELECT 
    id,
    email,
    first_name,
    last_name,
    role
FROM public.users
WHERE email = 'qwertyasd077a@gmail.com';

-- Show all users in auth
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
ORDER BY created_at DESC;
