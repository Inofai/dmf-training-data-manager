
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocumentStats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}

export const useDocumentStats = () => {
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get total count
      const { count: totalCount, error: totalError } = await supabase
        .from('training_documents')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get approved count
      const { count: approvedCount, error: approvedError } = await supabase
        .from('training_documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      if (approvedError) throw approvedError;

      // Get rejected count
      const { count: rejectedCount, error: rejectedError } = await supabase
        .from('training_documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');

      if (rejectedError) throw rejectedError;

      // Get pending count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('training_documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      setStats({
        total: totalCount || 0,
        approved: approvedCount || 0,
        rejected: rejectedCount || 0,
        pending: pendingCount || 0
      });
    } catch (error) {
      console.error('Error fetching document stats:', error);
      toast({
        title: "Error",
        description: "Failed to load document statistics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetchStats: fetchStats };
};
