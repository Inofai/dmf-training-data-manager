import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QAPair {
  id?: string;
  question: string;
  answer: string;
  version?: number;
  change_reason?: string;
}

interface DocumentData {
  id: string;
  title: string;
  qa_count: number;
  source_links: string[];
  qa_pairs: QAPair[];
  status?: string;
}

export const useDocumentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [docLoading, setDocLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedQAPairs, setEditedQAPairs] = useState<QAPair[]>([]);
  const [editedSourceLinks, setEditedSourceLinks] = useState<string[]>([]);
  const [newSourceLink, setNewSourceLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const documentId = searchParams.get('id');
  const title = searchParams.get('title');
  const qaCount = searchParams.get('qa_count');
  const sourceLinks = searchParams.get('source_links');

  const fetchDocumentData = async (docId: string) => {
    try {
      const { data: docData, error: docError } = await supabase
        .from('training_documents')
        .select('*')
        .eq('id', docId)
        .single();

      if (docError) throw docError;

      const { data: qaData, error: qaError } = await supabase
        .from('training_data')
        .select('id, question, answer, version')
        .eq('training_document_id', docId)
        .eq('is_current', true)
        .order('created_at', { ascending: true });

      if (qaError) throw qaError;

      const updatedDocData: DocumentData = {
        id: docData.id,
        title: docData.title,
        qa_count: qaData?.length || 0,
        source_links: docData.source_links || [],
        qa_pairs: qaData || [],
        status: docData.status
      };

      setDocumentData(updatedDocData);
      setEditedTitle(docData.title);
      setEditedSourceLinks(docData.source_links || []);
      setEditedQAPairs(qaData || []);
    } catch (error) {
      console.error('Error fetching document data:', error);
      toast({
        title: "Error",
        description: "Failed to load document data.",
        variant: "destructive",
      });
    } finally {
      setDocLoading(false);
    }
  };

  const handleQAChange = (index: number, field: 'question' | 'answer' | 'change_reason', value: string) => {
    const updatedQAPairs = [...editedQAPairs];
    updatedQAPairs[index] = { ...updatedQAPairs[index], [field]: value };
    setEditedQAPairs(updatedQAPairs);
  };

  const addNewQAPair = () => {
    const newQAPair: QAPair = {
      question: "",
      answer: ""
    };
    setEditedQAPairs([...editedQAPairs, newQAPair]);
  };

  const removeQAPair = (index: number) => {
    const updatedQAPairs = editedQAPairs.filter((_, i) => i !== index);
    setEditedQAPairs(updatedQAPairs);
  };

  const handleSourceLinkChange = (index: number, value: string) => {
    const updatedLinks = [...editedSourceLinks];
    updatedLinks[index] = value;
    setEditedSourceLinks(updatedLinks);
  };

  const addSourceLink = () => {
    if (newSourceLink.trim()) {
      setEditedSourceLinks([...editedSourceLinks, newSourceLink.trim()]);
      setNewSourceLink("");
    }
  };

  const removeSourceLink = (index: number) => {
    const updatedLinks = editedSourceLinks.filter((_, i) => i !== index);
    setEditedSourceLinks(updatedLinks);
  };

  const handleSave = async () => {
    if (!documentData) return;

    const hasEmptyFields = editedQAPairs.some(qa => !qa.question.trim() || !qa.answer.trim());
    if (hasEmptyFields) {
      toast({
        title: "Validation Error",
        description: "Please fill in all question and answer fields before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("User email not found");
      }

      // Update the document title and source links if changed
      if (editedTitle !== documentData.title || JSON.stringify(editedSourceLinks.sort()) !== JSON.stringify(documentData.source_links.sort())) {
        const { error: updateError } = await supabase
          .from('training_documents')
          .update({ 
            title: editedTitle,
            source_links: editedSourceLinks
          })
          .eq('id', documentData.id);

        if (updateError) throw updateError;
      }

      // Handle Q&A pairs updates with change tracking
      if (isEditing) {
        for (const [index, qa] of editedQAPairs.entries()) {
          if (qa.id) {
            // Update existing Q&A pair with version tracking
            const { error: updateError } = await supabase
              .from('training_data')
              .update({
                question: qa.question,
                answer: qa.answer,
                version: (qa.version || 1) + 1,
                change_reason: qa.change_reason || 'Updated during verification',
                changed_by: user.id,
                changed_at: new Date().toISOString()
              })
              .eq('id', qa.id);

            if (updateError) throw updateError;
          } else {
            // Insert new Q&A pair
            const { error: insertError } = await supabase
              .from('training_data')
              .insert({
                training_document_id: documentData.id,
                question: qa.question,
                answer: qa.answer,
                version: 1,
                is_current: true
              });

            if (insertError) throw insertError;
          }
        }

        // Handle deleted Q&A pairs by marking them as not current
        const originalQAPairs = documentData.qa_pairs || [];
        const deletedPairs = originalQAPairs.filter(
          original => !editedQAPairs.some(edited => edited.id === original.id)
        );

        for (const deletedPair of deletedPairs) {
          if (deletedPair.id) {
            const { error: deleteError } = await supabase
              .from('training_data')
              .update({
                is_current: false,
                change_reason: 'Removed during verification',
                changed_by: user.id,
                changed_at: new Date().toISOString()
              })
              .eq('id', deletedPair.id);

            if (deleteError) throw deleteError;
          }
        }
      }

      toast({
        title: "Changes Saved!",
        description: "All changes have been saved successfully.",
      });

      // Refresh the document data
      await fetchDocumentData(documentData.id);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (documentId && title && qaCount) {
      // Get data from URL parameters first
      const initialData: DocumentData = {
        id: documentId,
        title: title,
        qa_count: parseInt(qaCount),
        source_links: sourceLinks ? JSON.parse(decodeURIComponent(sourceLinks)) : [],
        qa_pairs: []
      };
      
      setDocumentData(initialData);
      setEditedTitle(title);
      setEditedSourceLinks(initialData.source_links);
      
      // Then fetch the complete document data from the database
      fetchDocumentData(documentId);
    } else {
      toast({
        title: "Error",
        description: "Invalid document data. Please try processing the document again.",
        variant: "destructive",
      });
      navigate("/editor");
    }
  }, [documentId, title, qaCount, sourceLinks, navigate]);

  return {
    documentData,
    docLoading,
    isEditing,
    setIsEditing,
    editedTitle,
    setEditedTitle,
    editedQAPairs,
    editedSourceLinks,
    newSourceLink,
    setNewSourceLink,
    isSubmitting,
    handleQAChange,
    addNewQAPair,
    removeQAPair,
    handleSourceLinkChange,
    addSourceLink,
    removeSourceLink,
    handleSave
  };
};
