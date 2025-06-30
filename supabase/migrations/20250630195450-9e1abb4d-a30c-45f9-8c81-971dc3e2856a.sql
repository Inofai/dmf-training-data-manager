
-- Add the missing submitter_email column to training_documents table
ALTER TABLE public.training_documents 
ADD COLUMN submitter_email TEXT;

-- Add a comment to document the column purpose
COMMENT ON COLUMN public.training_documents.submitter_email IS 'Email of the user who submitted/approved the training document';
