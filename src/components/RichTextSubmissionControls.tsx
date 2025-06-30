
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface RichTextSubmissionControlsProps {
  isSubmitting: boolean;
  characterCount: number;
  onSubmit: () => Promise<void>;
}

const RichTextSubmissionControls = ({
  isSubmitting,
  characterCount,
  onSubmit
}: RichTextSubmissionControlsProps) => {
  return (
    <div className="border-t border-gray-200 p-6 bg-gray-50">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {characterCount} characters • Ready to process with AI
        </div>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || characterCount === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing with AI...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Process & Submit</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RichTextSubmissionControls;
