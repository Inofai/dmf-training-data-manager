
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import ApiKeyManager from "@/components/ApiKeyManager";
import ApiKeyUsageStats from "@/components/ApiKeyUsageStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Info } from "lucide-react";

const ApiKeys = () => {
  const { user, loading, isAdmin, adminCheckComplete } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔐 ApiKeys page - Auth state:', {
      user: user?.id,
      loading,
      isAdmin,
      adminCheckComplete
    });

    // Only make navigation decisions when loading is complete AND admin check is complete
    if (!loading && adminCheckComplete) {
      if (!user) {
        console.log('🚫 No user found, redirecting to home');
        navigate("/");
      } else if (!isAdmin) {
        console.log('🚫 User is not admin, redirecting to dashboard');
        navigate("/dashboard");
      } else {
        console.log('✅ User is admin, showing API keys page');
      }
    }
  }, [user, loading, isAdmin, adminCheckComplete, navigate]);

  // Show loading while auth is being determined OR admin check is in progress
  if (loading || !adminCheckComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            {loading ? 'Loading...' : 'Checking permissions...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render the page content if user is not authenticated or not admin
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-blue-700">
              <Key className="w-6 h-6" />
              API Key Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Manage API keys for your application. Add, view, and delete API keys as needed.
              Only administrators can access this functionality.
            </p>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> The system now uses API keys stored in the database instead of environment variables. 
                Make sure to add an API key named <code className="bg-gray-100 px-1 rounded">OPENAI_API_KEY</code> for the content processing feature to work.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="grid gap-8">
          <ApiKeyManager />
          <ApiKeyUsageStats />
        </div>
      </div>
    </div>
  );
};

export default ApiKeys;
