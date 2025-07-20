
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import DeveloperSidebar from "@/components/DeveloperSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { isDeveloper, loading, roleCheckComplete } = useAuth();

  // Show loading state while auth is being determined
  if (loading || !roleCheckComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Developer layout with sidebar
  if (isDeveloper) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DeveloperSidebar />
          <SidebarInset className="flex-1">
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Regular layout with top navigation for non-developers
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Navigation />
      {children}
    </div>
  );
};

export default AppLayout;
