-- Update user address with correct pincode
-- Replace the email with your actual email

UPDATE public.users
SET address = 'Medak Road, Dundigal mandal, Telangana, 500043'
WHERE email = 'k.sairuthvikreddy880@gmail.com';

-- Verify the update
SELECT email, address FROM public.users WHERE email = 'k.sairuthvikreddy880@gmail.com';
