
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import RichTextToolbar from "./RichTextToolbar";
import RichTextEditorContent from "./RichTextEditorContent";
import RichTextSubmissionControls from "./RichTextSubmissionControls";
import "./RichTextEditor.css";

const RichTextEditor = () => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [textDirection, setTextDirection] = useState<'ltr' | 'rtl'>('ltr');
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Sync content state with editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    // Get both HTML and plain text from clipboard
    const clipboardData = e.clipboardData;
    const htmlData = clipboardData.getData('text/html');
    const plainData = clipboardData.getData('text/plain');
    
    // Use HTML if available, otherwise fall back to plain text
    const contentToPaste = htmlData || plainData;
    
    // Insert content at cursor position
    if (document.getSelection) {
      const selection = document.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentToPaste;
        
        // Insert each node from the parsed HTML
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        
        range.insertNode(fragment);
        
        // Move cursor to end of inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    
    // Update content state
    handleInput();
  };

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleAlignment = (alignment: 'left' | 'center' | 'right') => {
    const alignmentMap = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight'
    };
    executeCommand(alignmentMap[alignment]);
  };

  const toggleTextDirection = () => {
    const newDirection = textDirection === 'ltr' ? 'rtl' : 'ltr';
    setTextDirection(newDirection);
    if (editorRef.current) {
      editorRef.current.style.direction = newDirection;
    }
  };

  const handleSubmit = async () => {
    const plainText = editorRef.current?.textContent || "";
    const htmlContent = editorRef.current?.innerHTML || "";
    
    if (!plainText.trim()) {
      toast({
        title: "Empty Document",
        description: "Please enter some text before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to process and submit documents.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting content for processing...');
      
      // Call the edge function to process the content
      const { data, error } = await supabase.functions.invoke('process-training-content', {
        body: { 
          content: htmlContent // Send the full HTML content
        }
      });

      if (error) {
        console.error('Error processing content:', error);
        throw error;
      }

      console.log('Processing result:', data);

      if (data.success) {
        toast({
          title: "Document Processed Successfully!",
          description: `Created "${data.title}" with ${data.qa_count} Q&A pairs${data.source_links?.length ? ` and ${data.source_links.length} source links` : ''}.`,
        });
        
        // Clear the content after successful submission
        setContent("");
        if (editorRef.current) {
          editorRef.current.innerHTML = "";
        }
      } else {
        throw new Error(data.error || 'Processing failed');
      }

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCharacterCount = () => {
    return editorRef.current?.textContent?.length || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Training Content Processor</h1>
          <p className="text-gray-600">Create content and let AI extract training questions and answers</p>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-blue-600" />
              Document Editor
            </CardTitle>
            
            <RichTextToolbar
              textDirection={textDirection}
              characterCount={getCharacterCount()}
              onExecuteCommand={executeCommand}
              onHandleAlignment={handleAlignment}
              onToggleTextDirection={toggleTextDirection}
              editorRef={editorRef}
            />
          </CardHeader>

          <CardContent className="p-0">
            <RichTextEditorContent
              editorRef={editorRef}
              textDirection={textDirection}
              onInput={handleInput}
              onPaste={handlePaste}
            />

            <RichTextSubmissionControls
              isSubmitting={isSubmitting}
              characterCount={getCharacterCount()}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RichTextEditor;
