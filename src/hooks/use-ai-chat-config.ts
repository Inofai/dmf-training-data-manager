import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AIChatConfig {
  id: string;
  user_id: string;
  model: string | null;
  temperature: number | null;
  system_prompt: string | null;
  // Add more fields if needed
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
          .eq('user_id', user.id)
          .single();

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
