
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import ApiKeyAddDialog from "./ApiKeyAddDialog";
import ApiKeyTable from "./ApiKeyTable";

interface ApiKey {
  id: string;
  name: string;
  key_value: string;
  description: string | null;
  created_at: string;
  is_active: boolean;
  is_default?: boolean;
}

const ApiKeyManager = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('name', 'OPENAI_API_KEY')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API keys.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading API keys...</p>
      </div>
    );
  }

  const hasApiKey = apiKeys.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>OpenAI API Key</CardTitle>
          <ApiKeyAddDialog onApiKeyAdded={fetchApiKeys} />
        </CardHeader>
        <CardContent>
          {!hasApiKey && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                No OpenAI API key configured. Add your OpenAI API key to enable content processing features.
              </AlertDescription>
            </Alert>
          )}
          <ApiKeyTable apiKeys={apiKeys} onApiKeyDeleted={fetchApiKeys} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyManager;
