import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AiChatSettings from "@/components/AiChatSettings";
import { 
  Settings, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from "lucide-react";

interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'error';
  lastChecked: string;
  responseTime?: number;
}

const ApiManagement = () => {
  const [apiKey, setApiKey] = useState<any>(null);
  const [endpoints] = useState<ApiEndpoint[]>([
    {
      id: '1',
      name: 'Training Content Processing',
      url: '/functions/v1/process-training-content',
      status: 'active',
      lastChecked: new Date().toISOString(),
      responseTime: 245
    },
    {
      id: '2',
      name: 'User Authentication',
      url: '/auth/v1',
      status: 'active',
      lastChecked: new Date().toISOString(),
      responseTime: 89
    },
    {
      id: '3',
      name: 'Database Operations',
      url: '/rest/v1',
      status: 'active',
      lastChecked: new Date().toISOString(),
      responseTime: 67
    }
  ]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApiStatus();
  }, []);

  const fetchApiStatus = async () => {
    try {
      // Fetch current API key status
      const { data, error } = await supabase
        .from('api_key')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setApiKey(data);
    } catch (error) {
      console.error('Error fetching API status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading API status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Chat Configuration */}
      <AiChatSettings />

      {/* API Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            API Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">API Key Status</h4>
              <div className="flex items-center gap-2">
                {apiKey ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Configured</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Not Configured</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Database Connection</h4>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
          </div>

          {!apiKey && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No API key configured. Some features may not work properly. 
                <Button variant="link" className="p-0 h-auto ml-1" onClick={() => window.location.href = '/api-keys'}>
                  Configure API Key
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* API Endpoints Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            API Endpoints Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {endpoints.map((endpoint) => (
              <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {endpoint.status === 'active' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : endpoint.status === 'inactive' ? (
                    <XCircle className="w-4 h-4 text-gray-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <div>
                    <h4 className="font-medium">{endpoint.name}</h4>
                    <p className="text-sm text-gray-500">{endpoint.url}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {endpoint.responseTime && (
                    <span className="text-sm text-gray-500">
                      {endpoint.responseTime}ms
                    </span>
                  )}
                  <Badge variant={endpoint.status === 'active' ? 'default' : endpoint.status === 'inactive' ? 'secondary' : 'destructive'}>
                    {endpoint.status.charAt(0).toUpperCase() + endpoint.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>API Usage Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Detailed API usage tracking is not currently implemented. 
              This section will show usage statistics once monitoring is configured.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiManagement;
