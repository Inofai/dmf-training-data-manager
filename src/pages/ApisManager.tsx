
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import ApiManagement from "@/components/ApiManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Info } from "lucide-react";

const ApisManager = () => {
  const { user, loading, isDeveloper, roleCheckComplete } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔐 ApisManager page - Auth state:', {
      user: user?.id,
      loading,
      isDeveloper,
      roleCheckComplete
    });

    // Only make navigation decisions when loading is complete AND role check is complete
    if (!loading && roleCheckComplete) {
      if (!user) {
        console.log('🚫 No user found, redirecting to home');
        navigate("/");
      } else if (!isDeveloper) {
        console.log('🚫 User is not developer, redirecting to dashboard');
        navigate("/dashboard");
      } else {
        console.log('✅ User is developer, showing APIs manager page');
      }
    }
  }, [user, loading, isDeveloper, roleCheckComplete, navigate]);

  // Show loading while auth is being determined OR role check is in progress
  if (loading || !roleCheckComplete) {
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

  // Don't render the page content if user is not authenticated or not developer
  if (!user || !isDeveloper) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-blue-700">
              <Settings className="w-6 h-6" />
              APIs Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Manage API configurations, endpoints, and integrations. Monitor API health and performance.
              Only developers can access this functionality.
            </p>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Changes to API configurations may affect system functionality. 
                Test thoroughly before applying changes to production.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="grid gap-8">
          <ApiManagement />
        </div>
      </div>
    </div>
  );
};

export default ApisManager;
