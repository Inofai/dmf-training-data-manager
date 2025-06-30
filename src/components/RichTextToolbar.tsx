
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useState, useEffect } from "react";

interface RichTextToolbarProps {
  textDirection: 'ltr' | 'rtl';
  characterCount: number;
  onExecuteCommand: (command: string, value?: string) => void;
  onHandleAlignment: (alignment: 'left' | 'center' | 'right') => void;
  onToggleTextDirection: () => void;
  editorRef: React.RefObject<HTMLDivElement>;
}

const RichTextToolbar = ({
  textDirection,
  characterCount,
  onExecuteCommand,
  onHandleAlignment,
  onToggleTextDirection,
  editorRef
}: RichTextToolbarProps) => {
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false
  });

  const updateActiveFormats = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Check for active formatting
    const isBold = document.queryCommandState('bold');
    const isItalic = document.queryCommandState('italic');
    const isUnderline = document.queryCommandState('underline');
    
    // Check alignment
    const isAlignLeft = document.queryCommandState('justifyLeft');
    const isAlignCenter = document.queryCommandState('justifyCenter');
    const isAlignRight = document.queryCommandState('justifyRight');

    setActiveFormats({
      bold: isBold,
      italic: isItalic,
      underline: isUnderline,
      alignLeft: isAlignLeft,
      alignCenter: isAlignCenter,
      alignRight: isAlignRight
    });
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      updateActiveFormats();
    };

    const handleMouseUp = () => {
      setTimeout(updateActiveFormats, 10);
    };

    const handleKeyUp = () => {
      setTimeout(updateActiveFormats, 10);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    if (editorRef.current) {
      editorRef.current.addEventListener('mouseup', handleMouseUp);
      editorRef.current.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (editorRef.current) {
        editorRef.current.removeEventListener('mouseup', handleMouseUp);
        editorRef.current.removeEventListener('keyup', handleKeyUp);
      }
    };
  }, [editorRef]);

  const handleFormatToggle = (command: string) => {
    onExecuteCommand(command);
    setTimeout(updateActiveFormats, 10);
  };

  const handleAlignmentClick = (alignment: 'left' | 'center' | 'right') => {
    onHandleAlignment(alignment);
    setTimeout(updateActiveFormats, 10);
  };

  return (
    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
      {/* Text Formatting */}
      <Toggle
        size="sm"
        pressed={activeFormats.bold}
        onPressedChange={() => handleFormatToggle('bold')}
        aria-label="Bold"
      >
        <Bold className="w-4 h-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        pressed={activeFormats.italic}
        onPressedChange={() => handleFormatToggle('italic')}
        aria-label="Italic"
      >
        <Italic className="w-4 h-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        pressed={activeFormats.underline}
        onPressedChange={() => handleFormatToggle('underline')}
        aria-label="Underline"
      >
        <Underline className="w-4 h-4" />
      </Toggle>
      
      <div className="h-6 w-px bg-gray-300 mx-2" />
      
      {/* Text Alignment */}
      <Toggle
        size="sm"
        pressed={activeFormats.alignLeft}
        onPressedChange={() => handleAlignmentClick('left')}
        aria-label="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        pressed={activeFormats.alignCenter}
        onPressedChange={() => handleAlignmentClick('center')}
        aria-label="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        pressed={activeFormats.alignRight}
        onPressedChange={() => handleAlignmentClick('right')}
        aria-label="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </Toggle>
      
      <div className="h-6 w-px bg-gray-300 mx-2" />
      
      {/* Text Direction */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-3"
        type="button"
        onClick={onToggleTextDirection}
      >
        {textDirection === 'ltr' ? 'LTR' : 'RTL'}
      </Button>
      
      <div className="h-6 w-px bg-gray-300 mx-2" />
      
      <span className="text-sm text-gray-500">
        {characterCount} characters
      </span>
    </div>
  );
};

export default RichTextToolbar;
