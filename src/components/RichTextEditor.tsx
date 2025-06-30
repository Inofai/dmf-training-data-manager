
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, Send, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
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
    
    if (!plainText.trim()) {
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
        description: "Your formatted text has been successfully submitted!",
      });
      setContent(""); // Clear the content after submission
    }, 1500);
  };

  const getCharacterCount = () => {
    return editorRef.current?.textContent?.length || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rich Text Editor</h1>
          <p className="text-gray-600">Create and submit your formatted document</p>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-blue-600" />
              Document Editor
            </CardTitle>
            
            {/* Functional Toolbar */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              {/* Text Formatting */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => executeCommand('bold')}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => executeCommand('italic')}
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => executeCommand('underline')}
              >
                <Underline className="w-4 h-4" />
              </Button>
              
              <div className="h-6 w-px bg-gray-300 mx-2" />
              
              {/* Text Alignment */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => handleAlignment('left')}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => handleAlignment('center')}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => handleAlignment('right')}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
              
              <div className="h-6 w-px bg-gray-300 mx-2" />
              
              {/* Text Direction */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
                type="button"
                onClick={toggleTextDirection}
              >
                {textDirection === 'ltr' ? 'LTR' : 'RTL'}
              </Button>
              
              <div className="h-6 w-px bg-gray-300 mx-2" />
              
              <span className="text-sm text-gray-500">
                {getCharacterCount()} characters
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="p-6">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                className="min-h-[400px] border-0 outline-none text-base leading-relaxed p-4 rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  direction: textDirection,
                }}
                data-placeholder="Start typing your document here... You can paste formatted content from other applications."
                suppressContentEditableWarning={true}
              />
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Auto-saved • Last saved just now
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || getCharacterCount() === 0}
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

export default RichTextEditor;
