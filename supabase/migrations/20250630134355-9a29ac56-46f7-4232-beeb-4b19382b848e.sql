
-- Create a function to get API key by name
CREATE OR REPLACE FUNCTION public.get_api_key_by_name(_key_name text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT key_value
  FROM public.api_keys
  WHERE name = _key_name
    AND is_active = true
  LIMIT 1;
$$;

-- Create a function to log API key usage (optional tracking)
CREATE TABLE public.api_key_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  endpoint TEXT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);

-- Enable RLS on the usage table
ALTER TABLE public.api_key_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for API key usage tracking
CREATE POLICY "Only admins can view API key usage"
  ON public.api_key_usage
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert API key usage"
  ON public.api_key_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create a function to log API key usage
CREATE OR REPLACE FUNCTION public.log_api_key_usage(_key_name text, _endpoint text, _success boolean DEFAULT true, _error_message text DEFAULT null)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO public.api_key_usage (api_key_id, endpoint, success, error_message)
  SELECT ak.id, _endpoint, _success, _error_message
  FROM public.api_keys ak
  WHERE ak.name = _key_name
    AND ak.is_active = true;
$$;
