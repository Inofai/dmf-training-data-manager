
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import LoginForm from "@/components/LoginForm";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, loading } = useAuth();
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

  const displayName = profile?.display_name || profile?.first_name || user.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {displayName}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Create training content and let AI extract question-answer pairs automatically.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/editor")}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-blue-600 text-lg sm:text-xl">
                <FileText className="w-5 h-5" />
                Content Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Create rich text documents with formatting, links, and structure. Our AI will automatically extract training questions and answers.
              </p>
              <Button className="w-full">Start Creating</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/dashboard")}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-green-600 text-lg sm:text-xl">
                <BarChart3 className="w-5 h-5" />
                Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                View all your processed training documents, manage question-answer pairs, and track the status of your submissions.
              </p>
              <Button variant="outline" className="w-full">View Dashboard</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-blue-700 text-lg sm:text-xl">
              <Brain className="w-5 h-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
              <p className="text-sm sm:text-base text-gray-700">Write or paste your training content in the rich text editor</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</div>
              <p className="text-sm sm:text-base text-gray-700">AI processes your content and extracts relevant question-answer pairs</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</div>
              <p className="text-sm sm:text-base text-gray-700">Review and manage your training data in the dashboard</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
