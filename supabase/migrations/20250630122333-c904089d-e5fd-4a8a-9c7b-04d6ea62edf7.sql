
-- Create training_documents table
CREATE TABLE public.training_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  original_content TEXT NOT NULL,
  source_links TEXT[],
  submitter_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training_data table (connected to training_documents)
CREATE TABLE public.training_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_document_id UUID REFERENCES public.training_documents(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.training_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for training_documents
CREATE POLICY "Users can view their own training documents" 
  ON public.training_documents 
  FOR SELECT 
  USING (auth.uid() = submitter_id);

CREATE POLICY "Users can create their own training documents" 
  ON public.training_documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Users can update their own training documents" 
  ON public.training_documents 
  FOR UPDATE 
  USING (auth.uid() = submitter_id);

-- RLS policies for training_data
CREATE POLICY "Users can view training data for their documents" 
  ON public.training_data 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.training_documents 
      WHERE id = training_document_id 
      AND submitter_id = auth.uid()
    )
  );

CREATE POLICY "Users can create training data for their documents" 
  ON public.training_data 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.training_documents 
      WHERE id = training_document_id 
      AND submitter_id = auth.uid()
    )
  );

CREATE POLICY "Users can update training data for their documents" 
  ON public.training_data 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.training_documents 
      WHERE id = training_document_id 
      AND submitter_id = auth.uid()
    )
  );
