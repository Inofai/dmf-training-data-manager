
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Edit,
  MessageCircle,
  Users,
  Key,
  Settings,
  Shield,
  Code,
  Crown,
  LogOut,
} from "lucide-react";

const DeveloperSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isDeveloper } = useAuth();
  const { toast } = useToast();

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

  const isActivePath = (path: string) => location.pathname === path;

  const mainNavItems = [
    { title: "Editor", url: "/editor", icon: Edit },
    { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    { title: "Chat", url: "/chat", icon: MessageCircle },
  ];

  const managementItems = [
    { title: "Users", url: "/user-manager", icon: Users },
    { title: "API Keys", url: "/api-keys", icon: Key },
    { title: "APIs", url: "/apis-manager", icon: Settings },
    { title: "Permissions", url: "/role-permissions", icon: Shield },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">AI Training Platform</h1>
          <SidebarTrigger />
        </div>
        <div className="flex items-center gap-2 mt-2">
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
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={isActivePath(item.url)}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={isActivePath(item.url)}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DeveloperSidebar;
