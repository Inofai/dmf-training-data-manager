
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import ApiKeyManager from "@/components/ApiKeyManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key } from "lucide-react";

const ApiKeys = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  console.log('ApiKeys page - user:', user?.email, 'loading:', loading, 'isAdmin:', isAdmin);

  useEffect(() => {
    if (!loading && !user) {
      console.log('Redirecting to / - no user');
      navigate("/");
    } else if (!loading && user && !isAdmin) {
      console.log('Redirecting to dashboard - user not admin');
      navigate("/dashboard");
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, should redirect');
    return null;
  }

  if (!isAdmin) {
    console.log('User is not admin, should redirect');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Access denied. Admin privileges required.</p>
          <p className="text-gray-600">User: {user.email}</p>
          <p className="text-gray-600">Admin status: {isAdmin ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
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
            <p className="text-gray-600">
              Manage API keys for your application. Add, view, and delete API keys as needed.
              Only administrators can access this functionality.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Logged in as: {user.email} (Admin: {isAdmin ? 'Yes' : 'No'})
            </p>
          </CardContent>
        </Card>

        <ApiKeyManager />
      </div>
    </div>
  );
};

export default ApiKeys;
