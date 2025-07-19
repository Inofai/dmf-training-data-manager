
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Editor from "./pages/Editor";
import Dashboard from "./pages/Dashboard";
import ApiKeys from "./pages/ApiKeys";
import UserManager from "./pages/UserManager";
import ApisManager from "./pages/ApisManager";
import Chat from "./pages/Chat";
import DocumentVerification from "./pages/DocumentVerification";
import RolePermissions from "./pages/RolePermissions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/api-keys" element={<ApiKeys />} />
          <Route path="/user-manager" element={<UserManager />} />
          <Route path="/apis-manager" element={<ApisManager />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/document-verification" element={<DocumentVerification />} />
          <Route path="/role-permissions" element={<RolePermissions />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
