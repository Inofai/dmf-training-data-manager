
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrainingDocument {
  id: string;
  title: string;
  status: string;
  created_at: string;
  source_links: string[];
  submitter_id: string;
  submitter_email: string | null;
  profiles: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
  training_data: { id: string; question: string; answer: string }[];
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<TrainingDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('training_documents')
        .select(`
          id,
          title,
          status,
          created_at,
          source_links,
          submitter_id,
          submitter_email,
          profiles (
            display_name,
            first_name,
            last_name
          ),
          training_data!inner (
            id,
            question,
            answer
          )
        `)
        .eq('training_data.is_current', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load documents.",
        variant: "destructive",
      });
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    documentsLoading,
    fetchDocuments
  };
};
