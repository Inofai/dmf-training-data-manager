
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import RolePermissionsManager from "@/components/RolePermissionsManager";
import JwtConfigManager from "@/components/JwtConfigManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Clock, Info } from "lucide-react";

const RolePermissions = () => {
  const { user, loading, isDeveloper, roleCheckComplete } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔐 RolePermissions page - Auth state:', {
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
        console.log('✅ User is developer, showing role permissions page');
      }
    }
  }, [user, loading, isDeveloper, roleCheckComplete, navigate]);

  // Show loading while auth is being determined OR role check is in progress
  if (loading || !roleCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-blue-700">
            <Shield className="w-6 h-6" />
            Role Permissions & Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Manage role-based access permissions for different pages and configure JWT security settings. 
            Only developers can access this functionality.
          </p>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Changes to role permissions will immediately affect user access to pages. 
              JWT configuration changes may require users to re-login.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="grid gap-8">
        {/* Role Permissions Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
              <Shield className="w-5 h-5" />
              Role Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RolePermissionsManager />
          </CardContent>
        </Card>

        {/* JWT Configuration Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
              <Clock className="w-5 h-5" />
              JWT Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <JwtConfigManager />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RolePermissions;
