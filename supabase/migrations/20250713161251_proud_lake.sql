/*
  # Add foreign key relationship between training_documents and profiles

  1. Changes
    - Add foreign key constraint linking training_documents.submitter_id to profiles.id
    - Name the constraint 'training_documents_submitter_id_fkey' to match the query expectation

  2. Security
    - No RLS changes needed as this is just adding a foreign key constraint
*/

-- Add foreign key constraint to link training_documents.submitter_id to profiles.id
ALTER TABLE public.training_documents 
ADD CONSTRAINT training_documents_submitter_id_fkey 
FOREIGN KEY (submitter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;