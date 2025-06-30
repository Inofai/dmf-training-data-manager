
-- First, let's see all users and their confirmation status
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- Confirm the email for the admin user (and any other unconfirmed users)
UPDATE auth.users 
SET 
    email_confirmed_at = now(),
    updated_at = now()
WHERE email_confirmed_at IS NULL;

-- Also ensure the admin user has the admin role
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'admin@inofai.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Let's also check the user_roles table to see all role assignments
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    au.email,
    ur.created_at
FROM public.user_roles ur
JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.created_at DESC;
