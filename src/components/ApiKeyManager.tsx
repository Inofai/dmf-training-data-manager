
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApiKeyAddDialog from "./ApiKeyAddDialog";
import ApiKeyTable from "./ApiKeyTable";

interface ApiKey {
  id: string;
  key_value: string;
  description: string | null;
  created_at: string;
  created_by: string;
}

const ApiKeyManager = () => {
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('api_key')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setApiKey(data);
    } catch (error) {
      console.error('Error fetching API key:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API key.",
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
        <p className="mt-2 text-gray-600">Loading API key...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>API Key Management</CardTitle>
          {!apiKey && <ApiKeyAddDialog onApiKeyAdded={fetchApiKey} />}
        </CardHeader>
        <CardContent>
          <ApiKeyTable apiKey={apiKey} onApiKeyDeleted={fetchApiKey} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyManager;
