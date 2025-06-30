
-- Add a default column to api_keys table
ALTER TABLE public.api_keys ADD COLUMN is_default BOOLEAN DEFAULT false;

-- Create a unique constraint to ensure only one default key exists
CREATE UNIQUE INDEX idx_api_keys_unique_default ON public.api_keys (is_default) WHERE is_default = true;

-- Update the get_api_key_by_name function to get the default key
CREATE OR REPLACE FUNCTION public.get_default_api_key()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT key_value
  FROM public.api_keys
  WHERE is_default = true
    AND is_active = true
  LIMIT 1;
$$;

-- Update the log_api_key_usage function to work with default key
CREATE OR REPLACE FUNCTION public.log_default_api_key_usage(_endpoint text, _success boolean DEFAULT true, _error_message text DEFAULT null)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO public.api_key_usage (api_key_id, endpoint, success, error_message)
  SELECT ak.id, _endpoint, _success, _error_message
  FROM public.api_keys ak
  WHERE ak.is_default = true
    AND ak.is_active = true;
$$;
