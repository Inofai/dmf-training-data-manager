
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Save, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AiChatConfig {
  id?: string;
  base_url: string;
  temperature: number;
}

const AiChatSettings = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AiChatConfig>({
    base_url: 'https://46675d18caba.ngrok-free.app',
    temperature: 0.7
  });
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_chat_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          id: data.id,
          base_url: data.base_url,
          temperature: data.temperature
        });
      }
    } catch (error) {
      console.error('Error loading AI chat config:', error);
      toast({
        title: "Error",
        description: "Failed to load AI chat configuration.",
        variant: "destructive",
      });
    } finally {
      setInitialLoad(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (config.id) {
        // Update existing config
        const { error } = await supabase
          .from('ai_chat_config')
          .update({
            base_url: config.base_url,
            temperature: config.temperature,
            updated_at: new Date().toISOString()
          })
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Create new config
        const { data, error } = await supabase
          .from('ai_chat_config')
          .insert({
            base_url: config.base_url,
            temperature: config.temperature,
            created_by: user.id
          })
          .select()
          .single();

        if (error) throw error;
        setConfig(prev => ({ ...prev, id: data.id }));
      }
      
      toast({
        title: "Settings Saved",
        description: "AI Chat settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setConfig({
      id: config.id,
      base_url: 'https://46675d18caba.ngrok-free.app',
      temperature: 0.7
    });
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const url = new URL(`${config.base_url}/chat`);
      url.searchParams.append('query', 'Hello');
      url.searchParams.append('temperature', config.temperature.toString());

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
        body: ''
      });

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the AI Chat API.",
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to the AI Chat API. Please check the base URL.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading AI chat configuration...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          AI Chat Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              value={config.base_url}
              onChange={(e) => setConfig(prev => ({ ...prev, base_url: e.target.value }))}
              placeholder="https://example.com"
            />
            <p className="text-sm text-gray-500">
              The base URL for the AI Chat API endpoint
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature</Label>
            <Input
              id="temperature"
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0 }))}
            />
            <p className="text-sm text-gray-500">
              Controls randomness in responses (0.0 - 2.0)
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
          
          <Button variant="outline" onClick={testConnection} disabled={loading}>
            Test Connection
          </Button>
          
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">API Endpoint Information</h4>
          <p className="text-sm text-blue-700">
            Current endpoint: <code className="bg-blue-100 px-1 rounded">{config.base_url}/chat</code>
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Temperature: <code className="bg-blue-100 px-1 rounded">{config.temperature}</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AiChatSettings;
