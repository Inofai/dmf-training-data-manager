import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, LogOut, Edit, Crown, Key, Users, Settings, MessageCircle, Code, Shield, Menu } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isDeveloper } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  if (!user) return null;

  const NavigationLinks = () => (
    <>
      <Button
        variant="ghost"
        onClick={() => handleNavClick("/editor")}
        className="flex items-center gap-2 w-full md:w-auto justify-start"
      >
        <Edit className="w-4 h-4" />
        <span>Editor</span>
      </Button>
      
      <Button
        variant="ghost"
        onClick={() => handleNavClick("/dashboard")}
        className="flex items-center gap-2 w-full md:w-auto justify-start"
      >
        <BarChart3 className="w-4 h-4" />
        <span>Dashboard</span>
      </Button>
      
      <Button
        variant="ghost"
        onClick={() => handleNavClick("/chat")}
        className="flex items-center gap-2 w-full md:w-auto justify-start"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Chat</span>
      </Button>
      
      {(isAdmin || isDeveloper) && (
        <Button
          variant="ghost"
          onClick={() => handleNavClick("/user-manager")}
          className="flex items-center gap-2 w-full md:w-auto justify-start"
        >
          <Users className="w-4 h-4" />
          <span>Users</span>
        </Button>
      )}
      
      {isDeveloper && (
        <>
          <Button
            variant="ghost"
            onClick={() => handleNavClick("/api-keys")}
            className="flex items-center gap-2 w-full md:w-auto justify-start"
          >
            <Key className="w-4 h-4" />
            <span>API Keys</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => handleNavClick("/apis-manager")}
            className="flex items-center gap-2 w-full md:w-auto justify-start"
          >
            <Settings className="w-4 h-4" />
            <span>APIs</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => handleNavClick("/role-permissions")}
            className="flex items-center gap-2 w-full md:w-auto justify-start"
          >
            <Shield className="w-4 h-4" />
            <span>Permissions</span>
          </Button>
        </>
      )}
      
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="flex items-center gap-2 w-full md:w-auto justify-start"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </Button>
    </>
  );

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and badges */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
              AI Training Platform
            </h1>
            <div className="hidden sm:flex items-center gap-2">
              {isAdmin && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 flex items-center gap-1 text-xs">
                  <Crown className="w-3 h-3" />
                  <span className="hidden md:inline">Admin</span>
                </Badge>
              )}
              {isDeveloper && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-1 text-xs">
                  <Code className="w-3 h-3" />
                  <span className="hidden md:inline">Developer</span>
                </Badge>
              )}
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <NavigationLinks />
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col gap-4 mt-8">
                {/* Mobile badges */}
                <div className="flex flex-col gap-2 pb-4 border-b">
                  {isAdmin && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 flex items-center gap-2 w-fit">
                      <Crown className="w-3 h-3" />
                      Admin
                    </Badge>
                  )}
                  {isDeveloper && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-2 w-fit">
                      <Code className="w-3 h-3" />
                      Developer
                    </Badge>
                  )}
                </div>
                
                {/* Mobile navigation links */}
                <div className="flex flex-col gap-2">
                  <NavigationLinks />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
