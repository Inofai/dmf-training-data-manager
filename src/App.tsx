
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
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
          <Route path="/editor" element={<AppLayout><Editor /></AppLayout>} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/api-keys" element={<AppLayout><ApiKeys /></AppLayout>} />
          <Route path="/user-manager" element={<AppLayout><UserManager /></AppLayout>} />
          <Route path="/apis-manager" element={<AppLayout><ApisManager /></AppLayout>} />
          <Route path="/chat" element={<AppLayout><Chat /></AppLayout>} />
          <Route path="/document-verification" element={<AppLayout><DocumentVerification /></AppLayout>} />
          <Route path="/role-permissions" element={<AppLayout><RolePermissions /></AppLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
