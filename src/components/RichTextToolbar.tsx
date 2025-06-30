
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface RichTextToolbarProps {
  textDirection: 'ltr' | 'rtl';
  characterCount: number;
  onExecuteCommand: (command: string, value?: string) => void;
  onHandleAlignment: (alignment: 'left' | 'center' | 'right') => void;
  onToggleTextDirection: () => void;
}

const RichTextToolbar = ({
  textDirection,
  characterCount,
  onExecuteCommand,
  onHandleAlignment,
  onToggleTextDirection
}: RichTextToolbarProps) => {
  return (
    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
      {/* Text Formatting */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        type="button"
        onClick={() => onExecuteCommand('bold')}
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        type="button"
        onClick={() => onExecuteCommand('italic')}
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        type="button"
        onClick={() => onExecuteCommand('underline')}
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
        onClick={() => onHandleAlignment('left')}
      >
        <AlignLeft className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        type="button"
        onClick={() => onHandleAlignment('center')}
      >
        <AlignCenter className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        type="button"
        onClick={() => onHandleAlignment('right')}
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
