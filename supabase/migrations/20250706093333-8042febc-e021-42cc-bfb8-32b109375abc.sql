
-- Phase 1: Database Schema Enhancements
-- Add version tracking and metadata columns to training_data table
ALTER TABLE public.training_data 
ADD COLUMN version INTEGER NOT NULL DEFAULT 1,
ADD COLUMN is_current BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN parent_id UUID NULL,
ADD COLUMN change_reason TEXT NULL,
ADD COLUMN changed_by UUID NULL,
ADD COLUMN changed_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create history table for tracking all changes
CREATE TABLE public.training_data_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_data_id UUID NOT NULL,
  version INTEGER NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  change_reason TEXT,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for parent_id (self-referencing)
ALTER TABLE public.training_data 
ADD CONSTRAINT fk_training_data_parent 
FOREIGN KEY (parent_id) REFERENCES public.training_data(id);

-- Add foreign key constraint for history table
ALTER TABLE public.training_data_history 
ADD CONSTRAINT fk_history_training_data 
FOREIGN KEY (training_data_id) REFERENCES public.training_data(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_training_data_version ON public.training_data(training_document_id, version);
CREATE INDEX idx_training_data_current ON public.training_data(training_document_id, is_current) WHERE is_current = true;
CREATE INDEX idx_training_data_parent ON public.training_data(parent_id);
CREATE INDEX idx_history_training_data ON public.training_data_history(training_data_id, version);

-- Enable Row Level Security for the history table
ALTER TABLE public.training_data_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for training_data_history
CREATE POLICY "Users can view history for their documents" 
  ON public.training_data_history 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM training_data td 
      JOIN training_documents doc ON td.training_document_id = doc.id
      WHERE td.id = training_data_history.training_data_id 
      AND (doc.submitter_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

CREATE POLICY "Only system can insert history" 
  ON public.training_data_history 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create function to automatically create history entries
CREATE OR REPLACE FUNCTION public.create_training_data_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert history record for the old version when updating
  IF TG_OP = 'UPDATE' AND (OLD.question != NEW.question OR OLD.answer != NEW.answer) THEN
    INSERT INTO public.training_data_history (
      training_data_id,
      version,
      question,
      answer,
      change_reason,
      changed_by,
      changed_at
    ) VALUES (
      OLD.id,
      OLD.version,
      OLD.question,
      OLD.answer,
      NEW.change_reason,
      NEW.changed_by,
      OLD.updated_at
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create history entries
CREATE TRIGGER trigger_create_training_data_history
  BEFORE UPDATE ON public.training_data
  FOR EACH ROW
  EXECUTE FUNCTION public.create_training_data_history();

-- Create function to get Q&A pair history
CREATE OR REPLACE FUNCTION public.get_qa_history(qa_id UUID)
RETURNS TABLE (
  version INTEGER,
  question TEXT,
  answer TEXT,
  change_reason TEXT,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.version,
    h.question,
    h.answer,
    h.change_reason,
    h.changed_by,
    h.changed_at
  FROM public.training_data_history h
  WHERE h.training_data_id = qa_id
  ORDER BY h.version DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
