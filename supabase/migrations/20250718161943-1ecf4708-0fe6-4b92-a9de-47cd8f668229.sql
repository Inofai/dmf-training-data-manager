
-- Create a table for AI chat configurations
CREATE TABLE public.ai_chat_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base_url TEXT NOT NULL DEFAULT 'https://46675d18caba.ngrok-free.app',
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users NOT NULL
);

-- Add Row Level Security (RLS) to ensure only developers can manage AI chat config
ALTER TABLE public.ai_chat_config ENABLE ROW LEVEL SECURITY;

-- Create policy that allows only developers to SELECT AI chat config
CREATE POLICY "Only developers can view AI chat config" 
  ON public.ai_chat_config 
  FOR SELECT 
  USING (has_role(auth.uid(), 'developer'::app_role));

-- Create policy that allows only developers to INSERT AI chat config
CREATE POLICY "Only developers can create AI chat config" 
  ON public.ai_chat_config 
  FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'developer'::app_role));

-- Create policy that allows only developers to UPDATE AI chat config
CREATE POLICY "Only developers can update AI chat config" 
  ON public.ai_chat_config 
  FOR UPDATE 
  USING (has_role(auth.uid(), 'developer'::app_role));

-- Create policy that allows only developers to DELETE AI chat config
CREATE POLICY "Only developers can delete AI chat config" 
  ON public.ai_chat_config 
  FOR DELETE 
  USING (has_role(auth.uid(), 'developer'::app_role));

-- Insert default AI chat configuration
INSERT INTO public.ai_chat_config (base_url, temperature, created_by)
SELECT 'https://46675d18caba.ngrok-free.app', 0.7, id
FROM auth.users 
WHERE email = 'developer@inofai.com'
LIMIT 1;

-- Update API key policies to allow only developers (not admins)
DROP POLICY IF EXISTS "Only admins and developers can view API key" ON public.api_key;
DROP POLICY IF EXISTS "Only admins and developers can insert API key" ON public.api_key;
DROP POLICY IF EXISTS "Only admins and developers can update API key" ON public.api_key;
DROP POLICY IF EXISTS "Only admins and developers can delete API key" ON public.api_key;

CREATE POLICY "Only developers can view API key"
ON public.api_key
FOR SELECT
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Only developers can insert API key"
ON public.api_key
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Only developers can update API key"
ON public.api_key
FOR UPDATE
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Only developers can delete API key"
ON public.api_key
FOR DELETE
USING (has_role(auth.uid(), 'developer'::app_role));
