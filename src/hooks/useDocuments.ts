
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
  trained: boolean;
  profiles: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
  training_data: { id: string; question: string; answer: string }[];
}

interface UseDocumentsParams {
  page: number;
  limit: number;
  searchTerm: string;
  trainedOnly: boolean;
  status?: string;
}

export const useDocuments = ({ page, limit, searchTerm, trainedOnly, status }: UseDocumentsParams) => {
  const [documents, setDocuments] = useState<TrainingDocument[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [countLoading, setCountLoading] = useState(true);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);

      // Calculate range for pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Build the query
      let query = supabase
        .from('training_documents')
        .select(`
          id,
          title,
          status,
          created_at,
          source_links,
          submitter_id,
          submitter_email,
          trained,
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
        .eq('training_data.is_current', true);

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      // Apply trained filter
      if (trainedOnly) {
        query = query.eq('trained', true);
      }

      // Apply status filter
      if (status) {
        query = query.eq('status', status);
      }

      // Apply pagination and ordering
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

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

  const fetchCount = async () => {
    try {
      setCountLoading(true);

      // Build count query with same filters
      let countQuery = supabase
        .from('training_documents')
        .select('id', { count: 'exact', head: true });

      // Apply search filter
      if (searchTerm.trim()) {
        countQuery = countQuery.ilike('title', `%${searchTerm}%`);
      }

      // Apply trained filter
      if (trainedOnly) {
        countQuery = countQuery.eq('trained', true);
      }

      // Apply status filter
      if (status) {
        countQuery = countQuery.eq('status', status);
      }

      const { count, error } = await countQuery;

      if (error) {
        console.error('Error fetching count:', error);
        throw error;
      }

      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching count:', error);
      toast({
        title: "Error",
        description: "Failed to load document count.",
        variant: "destructive",
      });
    } finally {
      setCountLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchCount();
  }, [page, limit, searchTerm, trainedOnly, status]);

  const totalPages = Math.ceil(totalCount / limit);
  const loading = documentsLoading || countLoading;

  return {
    documents,
    totalCount,
    totalPages,
    documentsLoading: loading,
    fetchDocuments: () => {
      fetchDocuments();
      fetchCount();
    }
  };
};
