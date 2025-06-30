
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

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    } else if (!loading && user && !isAdmin) {
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
            <p className="text-gray-600">
              Manage API keys for your application. Add, view, and delete API keys as needed.
              Only administrators can access this functionality.
            </p>
          </CardContent>
        </Card>

        <ApiKeyManager />
      </div>
    </div>
  );
};

export default ApiKeys;
