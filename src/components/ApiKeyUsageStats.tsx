
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Activity, CheckCircle, XCircle } from "lucide-react";

interface ApiKeyUsage {
  id: string;
  api_key_id: string;
  used_at: string;
  endpoint: string;
  success: boolean;
  error_message: string | null;
  api_key_name: string;
}

const ApiKeyUsageStats = () => {
  const [usageData, setUsageData] = useState<ApiKeyUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const { data, error } = await supabase
        .from('api_key_usage')
        .select(`
          id,
          api_key_id,
          used_at,
          endpoint,
          success,
          error_message,
          api_keys!inner(name)
        `)
        .order('used_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedData = (data || []).map(item => ({
        ...item,
        api_key_name: (item as any).api_keys.name
      }));

      setUsageData(formattedData);
    } catch (error) {
      console.error('Error fetching usage data:', error);
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
            API Key Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading usage data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const successfulCalls = usageData.filter(item => item.success).length;
  const failedCalls = usageData.filter(item => !item.success).length;
  const totalCalls = usageData.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          API Key Usage Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalCalls}</div>
            <div className="text-sm text-gray-600">Total Calls</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{successfulCalls}</div>
            <div className="text-sm text-gray-600">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{failedCalls}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>

        {usageData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No API usage data available yet.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>API Key</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Used At</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageData.map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell className="font-medium">{usage.api_key_name}</TableCell>
                    <TableCell>{usage.endpoint}</TableCell>
                    <TableCell>
                      <Badge variant={usage.success ? "default" : "destructive"} className="flex items-center gap-1 w-fit">
                        {usage.success ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {usage.success ? 'Success' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(usage.used_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {usage.error_message ? (
                        <span className="text-red-600 text-sm">
                          {usage.error_message.length > 50 
                            ? `${usage.error_message.substring(0, 50)}...`
                            : usage.error_message
                          }
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiKeyUsageStats;
