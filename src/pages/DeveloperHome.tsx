
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Key, 
  Settings, 
  Shield, 
  BarChart3, 
  Database, 
  Code, 
  Crown,
  MessageCircle,
  Edit
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DeveloperHome = () => {
  const { user, isAdmin, isDeveloper } = useAuth();
  const { profile, profileLoading } = useProfile();
  const navigate = useNavigate();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || profile?.first_name || user?.email;

  const quickActions = [
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      action: () => navigate("/user-manager")
    },
    {
      title: "API Configuration",
      description: "Configure API keys and external integrations",
      icon: Key,
      color: "text-green-600",
      bgColor: "bg-green-50",
      action: () => navigate("/api-keys")
    },
    {
      title: "System APIs",
      description: "Monitor and manage system API endpoints",
      icon: Settings,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      action: () => navigate("/apis-manager")
    },
    {
      title: "Role Permissions",
      description: "Configure access control and security settings",
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50",
      action: () => navigate("/role-permissions")
    }
  ];

  const devTools = [
    {
      title: "Content Editor",
      description: "Create and edit training content",
      icon: Edit,
      action: () => navigate("/editor")
    },
    {
      title: "Analytics Dashboard",
      description: "View system metrics and user activity",
      icon: BarChart3,
      action: () => navigate("/dashboard")
    },
    {
      title: "AI Chat Interface",
      description: "Test and interact with AI models",
      icon: MessageCircle,
      action: () => navigate("/chat")
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {displayName}!
            </h1>
            <p className="text-gray-600 mt-1">
              Developer Control Panel - Manage system configuration and user access
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Admin
              </Badge>
            )}
            {isDeveloper && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-1">
                <Code className="w-3 h-3" />
                Developer
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Management</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card 
              key={action.title} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={action.action}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-2`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">{action.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  Access
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Development Tools */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Development Tools</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {devTools.map((tool) => (
            <Card 
              key={tool.title}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={tool.action}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <tool.icon className="w-5 h-5 text-blue-600" />
                  {tool.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{tool.description}</p>
                <Button className="w-full">Open Tool</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* System Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Database className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Online</div>
              <div className="text-sm text-gray-600">System Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">Active</div>
              <div className="text-sm text-gray-600">API Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Secured</div>
              <div className="text-sm text-gray-600">Authentication</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeveloperHome;
