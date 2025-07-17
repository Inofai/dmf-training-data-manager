
-- Add 'developer' to the app_role enum
ALTER TYPE public.app_role ADD VALUE 'developer';

-- Update the RLS policy for user_roles to hide developer role from non-developer users
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles and non-developer roles"
ON public.user_roles
FOR SELECT
USING (
  auth.uid() = user_id OR 
  (has_role(auth.uid(), 'admin'::app_role) AND role != 'developer'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role)
);

-- Update the admin management policy to allow developers full access
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

CREATE POLICY "Only admins and developers can manage roles"
ON public.user_roles
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'developer'::app_role)
);

-- Update API key policies to allow developer access
DROP POLICY IF EXISTS "Only admins can view API key" ON public.api_key;
DROP POLICY IF EXISTS "Only admins can insert API key" ON public.api_key;
DROP POLICY IF EXISTS "Only admins can update API key" ON public.api_key;
DROP POLICY IF EXISTS "Only admins can delete API key" ON public.api_key;

CREATE POLICY "Only admins and developers can view API key"
ON public.api_key
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'developer'::app_role)
);

CREATE POLICY "Only admins and developers can insert API key"
ON public.api_key
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'developer'::app_role)
);

CREATE POLICY "Only admins and developers can update API key"
ON public.api_key
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'developer'::app_role)
);

CREATE POLICY "Only admins and developers can delete API key"
ON public.api_key
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'developer'::app_role)
);
