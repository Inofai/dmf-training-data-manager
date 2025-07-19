import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, Clock, AlertCircle } from "lucide-react";
import { JwtConfig } from "@/types/jwt-config";

const JwtConfigManager = () => {
  const [config, setConfig] = useState<JwtConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timeoutMinutes, setTimeoutMinutes] = useState(60);
  const [refreshThresholdMinutes, setRefreshThresholdMinutes] = useState(15);
  const { toast } = useToast();

  useEffect(() => {
    fetchJwtConfig();
  }, []);

  const fetchJwtConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('jwt_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setConfig(data as JwtConfig);
        setTimeoutMinutes(data.timeout_minutes);
        setRefreshThresholdMinutes(data.refresh_threshold_minutes);
      }
    } catch (error) {
      console.error('Error fetching JWT config:', error);
      toast({
        title: "Error",
        description: "Failed to fetch JWT configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveJwtConfig = async () => {
    if (timeoutMinutes < 1 || refreshThresholdMinutes < 1) {
      toast({
        title: "Error",
        description: "Timeout and refresh threshold must be at least 1 minute.",
        variant: "destructive",
      });
      return;
    }

    if (refreshThresholdMinutes >= timeoutMinutes) {
      toast({
        title: "Error",
        description: "Refresh threshold must be less than timeout duration.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const { data: userData } = await supabase.auth.getUser();
      
      if (config) {
        // Update existing config
        const { error } = await supabase
          .from('jwt_config')
          .update({
            timeout_minutes: timeoutMinutes,
            refresh_threshold_minutes: refreshThresholdMinutes,
          })
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Create new config
        const { error } = await supabase
          .from('jwt_config')
          .insert({
            timeout_minutes: timeoutMinutes,
            refresh_threshold_minutes: refreshThresholdMinutes,
            created_by: userData.user?.id
          });

        if (error) throw error;
      }

      await fetchJwtConfig();

      toast({
        title: "Success",
        description: "JWT configuration saved successfully.",
      });
    } catch (error) {
      console.error('Error saving JWT config:', error);
      toast({
        title: "Error",
        description: "Failed to save JWT configuration.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Configure JWT token timeout and refresh settings. Changes may require users to re-authenticate.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              Timeout Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="timeoutMinutes">Session Timeout (minutes)</Label>
              <Input
                id="timeoutMinutes"
                type="number"
                min="1"
                max="1440"
                value={timeoutMinutes}
                onChange={(e) => setTimeoutMinutes(parseInt(e.target.value) || 60)}
                disabled={saving}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                How long a user session stays active (1-1440 minutes)
              </p>
            </div>

            <div>
              <Label htmlFor="refreshThreshold">Refresh Threshold (minutes)</Label>
              <Input
                id="refreshThreshold"
                type="number"
                min="1"
                max={timeoutMinutes - 1}
                value={refreshThresholdMinutes}
                onChange={(e) => setRefreshThresholdMinutes(parseInt(e.target.value) || 15)}
                disabled={saving}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                When to refresh the token before expiry (must be less than timeout)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {config ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Timeout:</span>
                  <span className="font-medium">{config.timeout_minutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Refresh Threshold:</span>
                  <span className="font-medium">{config.refresh_threshold_minutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {config.updated_at ? new Date(config.updated_at).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No configuration found. Set your preferences and save.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={saveJwtConfig}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
};

export default JwtConfigManager;
