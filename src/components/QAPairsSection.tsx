
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus } from "lucide-react";
import QAPairCard from "./QAPairCard";

interface QAPair {
  question: string;
  answer: string;
}

interface QAPairsSectionProps {
  qaPairs: QAPair[];
  isEditing: boolean;
  onToggleEditing: () => void;
  onAddQAPair: () => void;
  onQAChange: (index: number, field: 'question' | 'answer', value: string) => void;
  onRemoveQAPair: (index: number) => void;
}

const QAPairsSection = ({
  qaPairs,
  isEditing,
  onToggleEditing,
  onAddQAPair,
  onQAChange,
  onRemoveQAPair
}: QAPairsSectionProps) => {
  return (
    <Card className="shadow-xl border-0 bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Question & Answer Pairs</CardTitle>
        <div className="flex gap-2">
          {isEditing && (
            <Button
              variant="outline"
              onClick={onAddQAPair}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Q&A Pair
            </Button>
          )}
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={onToggleEditing}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            {isEditing ? "Stop Editing" : "Edit Content"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {qaPairs.map((qa, index) => (
          <QAPairCard
            key={index}
            qa={qa}
            index={index}
            isEditing={isEditing}
            canDelete={qaPairs.length > 1}
            onQuestionChange={(value) => onQAChange(index, 'question', value)}
            onAnswerChange={(value) => onQAChange(index, 'answer', value)}
            onRemove={() => onRemoveQAPair(index)}
          />
        ))}
        
        {qaPairs.length === 0 && isEditing && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No Q&A pairs yet. Add your first one!</p>
            <Button onClick={onAddQAPair} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add First Q&A Pair
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QAPairsSection;
