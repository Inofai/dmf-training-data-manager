
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, FileText, MessageSquare, ExternalLink } from "lucide-react";

interface ProcessingResult {
  success: boolean;
  title?: string;
  qa_count?: number;
  source_links?: string[];
  error?: string;
}

interface ProcessingResultsScreenProps {
  result: ProcessingResult;
  onGoBack: () => void;
}

const ProcessingResultsScreen = ({ result, onGoBack }: ProcessingResultsScreenProps) => {
  if (!result.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-700">Processing Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{result.error || "An error occurred during processing."}</p>
            <Button onClick={onGoBack} className="mt-6">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-4 flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-700">Processing Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Document Created Successfully</h3>
            <p className="text-gray-600">Your content has been processed and training data has been generated.</p>
          </div>

          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Document Title</p>
                  <p className="text-sm text-gray-600">{result.title || "Untitled Document"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Q&A Pairs Generated</p>
                  <p className="text-sm text-gray-600">{result.qa_count || 0} pairs</p>
                </div>
              </div>
            </div>
            
            {result.source_links && result.source_links.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-3 mb-2">
                  <ExternalLink className="w-5 h-5 text-purple-500" />
                  <p className="font-medium">Source Links ({result.source_links.length})</p>
                </div>
                <div className="space-y-1">
                  {result.source_links.slice(0, 3).map((link, index) => (
                    <a 
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {link}
                    </a>
                  ))}
                  {result.source_links.length > 3 && (
                    <p className="text-sm text-gray-500">
                      +{result.source_links.length - 3} more links
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={onGoBack} variant="outline">
              Process Another Document
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'}>
              View Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingResultsScreen;
