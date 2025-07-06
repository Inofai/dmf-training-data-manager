
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface DocumentStatusActionsProps {
  documentId: string;
  currentStatus: string;
  onStatusUpdate: () => void;
}

const DocumentStatusActions = ({ documentId, currentStatus, onStatusUpdate }: DocumentStatusActionsProps) => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  const updateDocumentStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('training_documents')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Document ${newStatus} successfully.`,
      });

      onStatusUpdate();
    } catch (error) {
      console.error('Error updating document status:', error);
      toast({
        title: "Error",
        description: "Failed to update document status.",
        variant: "destructive",
      });
    }
  };

  // Show approve/reject buttons for pending documents
  if (currentStatus === 'pending') {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            updateDocumentStatus('approved');
          }}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
          data-action-button
        >
          <CheckCircle className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            updateDocumentStatus('rejected');
          }}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          data-action-button
        >
          <XCircle className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Show revert options for approved documents
  if (currentStatus === 'approved') {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            updateDocumentStatus('pending');
          }}
          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
          data-action-button
        >
          <Clock className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            updateDocumentStatus('rejected');
          }}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          data-action-button
        >
          <XCircle className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Show revert options for rejected documents
  if (currentStatus === 'rejected') {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            updateDocumentStatus('approved');
          }}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
          data-action-button
        >
          <CheckCircle className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            updateDocumentStatus('pending');
          }}
          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
          data-action-button
        >
          <Clock className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return null;
};

export default DocumentStatusActions;
