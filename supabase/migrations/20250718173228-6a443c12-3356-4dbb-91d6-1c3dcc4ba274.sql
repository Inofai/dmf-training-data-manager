
-- First, let's create a backup of current user roles
CREATE TABLE user_roles_backup AS SELECT * FROM user_roles;

-- Drop the existing table and recreate with better design
DROP TABLE user_roles CASCADE;

-- Recreate the user_roles table with one role per user
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Recreate the RLS policies
CREATE POLICY "Users can view their own roles and non-developer roles"
ON public.user_roles
FOR SELECT
USING (
  auth.uid() = user_id OR 
  (has_role(auth.uid(), 'admin'::app_role) AND role != 'developer'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role)
);

CREATE POLICY "Only admins and developers can manage roles"
ON public.user_roles
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'developer'::app_role)
);

-- Migrate data from backup, keeping the highest priority role per user
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT DISTINCT ON (user_id) 
    user_id,
    CASE 
        WHEN 'developer' = ANY(array_agg(role)) THEN 'developer'::app_role
        WHEN 'admin' = ANY(array_agg(role)) THEN 'admin'::app_role
        ELSE 'user'::app_role
    END as role,
    min(created_at) as created_at
FROM user_roles_backup 
GROUP BY user_id;

-- Recreate the trigger for new users
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Clean up backup table
DROP TABLE user_roles_backup;
