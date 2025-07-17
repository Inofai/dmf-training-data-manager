
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface DeleteDocumentDialogProps {
  documentId: string;
  documentTitle: string;
  onDocumentDeleted: () => void;
}

const DeleteDocumentDialog = ({ documentId, documentTitle, onDocumentDeleted }: DeleteDocumentDialogProps) => {
  const { toast } = useToast();

  const deleteDocument = async () => {
    try {
      // First delete training data associated with the document
      const { error: trainingDataError } = await supabase
        .from('training_data')
        .delete()
        .eq('training_document_id', documentId);

      if (trainingDataError) throw trainingDataError;

      // Then delete the document itself
      const { error: documentError } = await supabase
        .from('training_documents')
        .delete()
        .eq('id', documentId);

      if (documentError) throw documentError;

      toast({
        title: "Success",
        description: "Document deleted successfully.",
      });

      // Refresh the documents list
      onDocumentDeleted();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-delete-button
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Document</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{documentTitle}"? This action cannot be undone.
            All associated Q&A pairs will also be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.stopPropagation();
              deleteDocument();
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Document
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDocumentDialog;
