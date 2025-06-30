
-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all existing tables and their dependencies
DROP TABLE IF EXISTS public.api_key_usage CASCADE;
DROP TABLE IF EXISTS public.training_data CASCADE;
DROP TABLE IF EXISTS public.training_documents CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_api_key_by_name(_key_name text);
DROP FUNCTION IF EXISTS public.log_api_key_usage(_key_name text, _endpoint text, _success boolean, _error_message text);
DROP FUNCTION IF EXISTS public.has_role(_user_id uuid, _role app_role);
DROP FUNCTION IF EXISTS public.handle_new_user_role();

-- Drop existing types
DROP TYPE IF EXISTS public.app_role;

-- Create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create a user_roles table to manage user roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create a function to automatically assign 'user' role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign user role on signup
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Create a single API key table (only one active key at a time)
CREATE TABLE public.api_key (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_value TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.api_key ENABLE ROW LEVEL SECURITY;

-- Create policies - only admins can manage the API key
CREATE POLICY "Only admins can view API key"
  ON public.api_key
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert API key"
  ON public.api_key
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update API key"
  ON public.api_key
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete API key"
  ON public.api_key
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create training documents table (for final submissions after review)
CREATE TABLE public.training_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  original_content TEXT NOT NULL,
  processed_content JSONB, -- Store the AI-processed output
  source_links TEXT[],
  submitter_id UUID NOT NULL, -- Store user ID directly, no foreign key
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.training_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for training documents
CREATE POLICY "Users can view their own documents"
  ON public.training_documents
  FOR SELECT
  USING (submitter_id::text = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own documents"
  ON public.training_documents
  FOR INSERT
  WITH CHECK (submitter_id::text = auth.uid()::text);

CREATE POLICY "Only admins can update documents"
  ON public.training_documents
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete documents"
  ON public.training_documents
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create training data table (Q&A pairs)
CREATE TABLE public.training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_document_id UUID REFERENCES public.training_documents(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.training_data ENABLE ROW LEVEL SECURITY;

-- Create policies for training data
CREATE POLICY "Users can view training data for their documents"
  ON public.training_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.training_documents td 
      WHERE td.id = training_document_id 
      AND (td.submitter_id::text = auth.uid()::text OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can insert training data for their documents"
  ON public.training_data
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.training_documents td 
      WHERE td.id = training_document_id 
      AND td.submitter_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Only admins can update training data"
  ON public.training_data
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete training data"
  ON public.training_data
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create a function to get the active API key
CREATE OR REPLACE FUNCTION public.get_api_key()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT key_value
  FROM public.api_key
  ORDER BY created_at DESC
  LIMIT 1;
$$;
