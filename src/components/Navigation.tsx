
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, LogOut, Edit, Crown, Key, Users, Settings, MessageCircle } from "lucide-react";

const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">AI Training Platform</h1>
            {isAdmin && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Admin
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/editor")}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editor
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate("/chat")}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
            
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/user-manager")}
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Users
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => navigate("/api-keys")}
                  className="flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  API Keys
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => navigate("/apis-manager")}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  APIs
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
