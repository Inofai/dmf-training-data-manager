
-- Update the app_role enum to include developer
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'developer';
