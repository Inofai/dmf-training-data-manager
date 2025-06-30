
-- Add a function to create a new user (this will be called from the edge function)
-- We'll need an edge function to handle user creation since we can't directly create auth users from the client

-- Add a function to delete a user and their associated data
CREATE OR REPLACE FUNCTION delete_user_and_data(user_id_to_delete UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete user roles
  DELETE FROM public.user_roles WHERE user_id = user_id_to_delete;
  
  -- Delete training documents associated with the user
  DELETE FROM public.training_documents WHERE submitter_id = user_id_to_delete;
  
  -- Note: We cannot delete from auth.users table directly from here
  -- The edge function will handle the auth.users deletion
  
  RETURN TRUE;
END;
$$;

-- Add a function to check if a user is an admin (for UI purposes)
CREATE OR REPLACE FUNCTION is_admin_user(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = 'admin'
  )
$$;
