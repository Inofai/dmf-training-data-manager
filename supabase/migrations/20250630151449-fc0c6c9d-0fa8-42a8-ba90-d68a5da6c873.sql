
-- Drop the functions that were created for default API key functionality
DROP FUNCTION IF EXISTS public.get_default_api_key();
DROP FUNCTION IF EXISTS public.log_default_api_key_usage(_endpoint text, _success boolean, _error_message text);

-- Drop the unique index for default keys
DROP INDEX IF EXISTS idx_api_keys_unique_default;

-- Remove the is_default column from api_keys table
ALTER TABLE public.api_keys DROP COLUMN IF EXISTS is_default;
