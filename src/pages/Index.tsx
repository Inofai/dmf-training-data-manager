
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import LoginForm from "@/components/LoginForm";
import DeveloperHome from "@/pages/DeveloperHome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, loading, isDeveloper } = useAuth();
  const { profile, profileLoading } = useProfile();
  const navigate = useNavigate();

  if (loading || profileLoading) {
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Training Platform</h1>
            <p className="text-gray-600">Sign in to create and manage training content</p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  // Show developer home for developers
  if (isDeveloper) {
    return <DeveloperHome />;
  }

  // Regular user home page
  const displayName = profile?.display_name || profile?.first_name || user.email;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {displayName}!
        </h1>
        <p className="text-gray-600">
          Create training content and let AI extract question-answer pairs automatically.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/editor")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <FileText className="w-5 h-5" />
              Content Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Create rich text documents with formatting, links, and structure. Our AI will automatically extract training questions and answers.
            </p>
            <Button className="w-full">Start Creating</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/dashboard")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              View all your processed training documents, manage question-answer pairs, and track the status of your submissions.
            </p>
            <Button variant="outline" className="w-full">View Dashboard</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Brain className="w-5 h-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <p className="text-gray-700">Write or paste your training content in the rich text editor</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <p className="text-gray-700">AI processes your content and extracts relevant question-answer pairs</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <p className="text-gray-700">Review and manage your training data in the dashboard</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
