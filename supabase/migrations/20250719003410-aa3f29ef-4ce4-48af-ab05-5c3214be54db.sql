
-- Create a table to store role permissions for different pages/routes
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  page_route TEXT NOT NULL,
  can_access BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, page_route)
);

-- Create a table to store JWT configuration
CREATE TABLE public.jwt_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timeout_minutes INTEGER NOT NULL DEFAULT 60,
  refresh_threshold_minutes INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on both tables
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jwt_config ENABLE ROW LEVEL SECURITY;

-- Only developers can manage role permissions
CREATE POLICY "Only developers can view role permissions"
ON public.role_permissions
FOR SELECT
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Only developers can insert role permissions"
ON public.role_permissions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Only developers can update role permissions"
ON public.role_permissions
FOR UPDATE
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Only developers can delete role permissions"
ON public.role_permissions
FOR DELETE
USING (has_role(auth.uid(), 'developer'::app_role));

-- Only developers can manage JWT config
CREATE POLICY "Only developers can view JWT config"
ON public.jwt_config
FOR SELECT
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Only developers can insert JWT config"
ON public.jwt_config
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Only developers can update JWT config"
ON public.jwt_config
FOR UPDATE
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Only developers can delete JWT config"
ON public.jwt_config
FOR DELETE
USING (has_role(auth.uid(), 'developer'::app_role));

-- Insert default role permissions for existing pages
INSERT INTO public.role_permissions (role, page_route, can_access) VALUES
('admin', '/dashboard', true),
('admin', '/editor', true),
('admin', '/chat', true),
('admin', '/user-manager', true),
('admin', '/document-verification', true),
('user', '/dashboard', true),
('user', '/editor', true),
('user', '/chat', true),
('user', '/user-manager', false),
('user', '/document-verification', false),
('developer', '/dashboard', true),
('developer', '/editor', true),
('developer', '/chat', true),
('developer', '/user-manager', true),
('developer', '/api-keys', true),
('developer', '/apis-manager', true),
('developer', '/document-verification', true);

-- Insert default JWT config
INSERT INTO public.jwt_config (timeout_minutes, refresh_threshold_minutes) VALUES (60, 15);

-- Add updated_at trigger for role_permissions
CREATE TRIGGER role_permissions_updated_at
  BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add updated_at trigger for jwt_config  
CREATE TRIGGER jwt_config_updated_at
  BEFORE UPDATE ON public.jwt_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
