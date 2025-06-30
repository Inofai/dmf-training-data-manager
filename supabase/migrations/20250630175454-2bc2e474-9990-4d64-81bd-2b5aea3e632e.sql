
-- Grant admin role to admin@inofai.com
-- This will work if the user has already signed up, otherwise it will be added when they sign up
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'admin@inofai.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Let's also check if the user exists and their current roles
SELECT 
    au.email,
    au.id as user_id,
    ur.role,
    au.email_confirmed_at,
    au.created_at
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
WHERE au.email = 'admin@inofai.com'
ORDER BY ur.created_at;
