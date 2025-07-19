import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface AIChatConfig {
  id: string;
  base_url: string;
  temperature: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const useGlobalAIChatConfig = () => {
  const [chatConfig, setChatConfig] = useState<AIChatConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from<AIChatConfig>('ai_chat_config')
          .select('*')
          .order('created_at', { ascending: false }) // Just in case there are multiple rows
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching global AI chat config:', error);
          setError(error.message);
          return;
        }

        setChatConfig(data || null);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { chatConfig, loading, error };
};
