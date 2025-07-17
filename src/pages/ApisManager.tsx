
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import ApiManagement from "@/components/ApiManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Info } from "lucide-react";

const ApisManager = () => {
  const { user, loading, isAdminOrDeveloper, adminCheckComplete } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔐 ApisManager page - Auth state:', {
      user: user?.id,
      loading,
      isAdminOrDeveloper,
      adminCheckComplete
    });

    // Only make navigation decisions when loading is complete AND admin check is complete
    if (!loading && adminCheckComplete) {
      if (!user) {
        console.log('🚫 No user found, redirecting to home');
        navigate("/");
      } else if (!isAdminOrDeveloper) {
        console.log('🚫 User is not admin or developer, redirecting to dashboard');
        navigate("/dashboard");
      } else {
        console.log('✅ User is admin or developer, showing APIs manager page');
      }
    }
  }, [user, loading, isAdminOrDeveloper, adminCheckComplete, navigate]);

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

  // Don't render the page content if user is not authenticated or not admin/developer
  if (!user || !isAdminOrDeveloper) {
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
