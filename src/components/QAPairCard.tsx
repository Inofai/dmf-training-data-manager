
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

interface QAPair {
  question: string;
  answer: string;
}

interface QAPairCardProps {
  qa: QAPair;
  index: number;
  isEditing: boolean;
  canDelete: boolean;
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onRemove: () => void;
}

const QAPairCard = ({
  qa,
  index,
  isEditing,
  canDelete,
  onQuestionChange,
  onAnswerChange,
  onRemove
}: QAPairCardProps) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <Badge variant="secondary">Q{index + 1}</Badge>
        {isEditing && canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question
          </label>
          {isEditing ? (
            <Textarea
              value={qa.question}
              onChange={(e) => onQuestionChange(e.target.value)}
              className="w-full"
              rows={2}
              placeholder="Enter your question here..."
            />
          ) : (
            <p className="text-gray-900 bg-white p-3 rounded border">{qa.question}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Answer
          </label>
          {isEditing ? (
            <Textarea
              value={qa.answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="w-full"
              rows={3}
              placeholder="Enter your answer here..."
            />
          ) : (
            <p className="text-gray-900 bg-white p-3 rounded border">{qa.answer}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QAPairCard;
