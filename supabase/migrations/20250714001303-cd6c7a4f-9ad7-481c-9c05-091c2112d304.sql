
-- Add foreign key constraint to link training_documents.submitter_id to profiles.id
ALTER TABLE public.training_documents 
ADD CONSTRAINT training_documents_submitter_id_fkey 
FOREIGN KEY (submitter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
