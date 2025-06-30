
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ApiKeyUsageStats = () => {
  const [apiKeyCount, setApiKeyCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiKeyInfo();
  }, []);

  const fetchApiKeyInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('api_key')
        .select('id')
        .limit(1);

      if (error) throw error;

      setApiKeyCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching API key info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            API Key Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading API key status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          API Key Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {apiKeyCount}
          </div>
          <div className="text-sm text-gray-600">
            API Key{apiKeyCount !== 1 ? 's' : ''} Configured
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> API usage tracking is not currently implemented. 
            The system stores a single API key for content processing features.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ApiKeyUsageStats;
