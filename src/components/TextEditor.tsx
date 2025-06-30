
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Send, Bold, Italic, Underline } from "lucide-react";

const TextEditor = () => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty Document",
        description: "Please enter some text before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission process
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Document Submitted",
        description: "Your text has been successfully submitted!",
      });
      setText(""); // Clear the text after submission
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Text Editor</h1>
          <p className="text-gray-600">Create and submit your document</p>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-blue-600" />
              Document Editor
            </CardTitle>
            
            {/* Toolbar - Word-like styling */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                type="button"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                type="button"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                type="button"
              >
                <Underline className="w-4 h-4" />
              </Button>
              <div className="h-6 w-px bg-gray-300 mx-2" />
              <span className="text-sm text-gray-500">
                {text.length} characters
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="p-6">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing your document here..."
                className="min-h-[400px] border-0 resize-none focus-visible:ring-0 text-base leading-relaxed"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: "16px",
                  lineHeight: "1.6",
                }}
              />
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Auto-saved • Last saved just now
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !text.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Submit Document</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TextEditor;
