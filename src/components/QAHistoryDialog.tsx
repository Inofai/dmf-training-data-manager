
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { History, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HistoryEntry {
  version: number;
  question: string;
  answer: string;
  change_reason: string | null;
  changed_by: string | null;
  changed_at: string;
}

interface QAHistoryDialogProps {
  qaId: string;
  currentQuestion: string;
}

const QAHistoryDialog = ({ qaId, currentQuestion }: QAHistoryDialogProps) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const fetchHistory = async () => {
    if (!qaId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_qa_history', { qa_id: qaId });

      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching Q&A history:', error);
      toast({
        title: "Error",
        description: "Failed to load change history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open, qaId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <History className="w-4 h-4 mr-1" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Change History: {currentQuestion.substring(0, 50)}...
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No History Available</h3>
            <p className="text-gray-600">This Q&A pair hasn't been modified yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">Version {entry.version}</Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(entry.changed_at).toLocaleString()}
                    </div>
                  </div>
                  
                  {entry.change_reason && (
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>Change Reason:</strong> {entry.change_reason}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question
                      </label>
                      <div className="p-3 bg-gray-50 rounded border">
                        {entry.question}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Answer
                      </label>
                      <div className="p-3 bg-gray-50 rounded border">
                        {entry.answer}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QAHistoryDialog;
