
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AIChatConfig {
  id: string;
  base_url: string;
  temperature: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const useAIChatConfig = () => {
  const { user } = useAuth();
  const [chatConfig, setChatConfig] = useState<AIChatConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setChatConfig(null);
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('ai_chat_config')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching AI chat config:', error);
          setError(error.message);
          return;
        }

        setChatConfig(data);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [user]);

  return { chatConfig, loading, error };
};
