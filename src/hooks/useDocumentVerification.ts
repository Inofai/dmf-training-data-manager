
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QAPair {
  question: string;
  answer: string;
}

interface DocumentData {
  id: string;
  title: string;
  qa_count: number;
  source_links: string[];
  qa_pairs: QAPair[];
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

  const fetchQAPairs = async (docId: string) => {
    try {
      const { data, error } = await supabase
        .from('training_data')
        .select('question, answer')
        .eq('training_document_id', docId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const qaPairs = data || [];
      setEditedQAPairs(qaPairs);
      
      if (documentData) {
        setDocumentData(prev => prev ? { ...prev, qa_pairs: qaPairs } : null);
      }
    } catch (error) {
      console.error('Error fetching Q&A pairs:', error);
      toast({
        title: "Error",
        description: "Failed to load Q&A pairs.",
        variant: "destructive",
      });
    } finally {
      setDocLoading(false);
    }
  };

  const handleQAChange = (index: number, field: 'question' | 'answer', value: string) => {
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

  const handleSubmit = async () => {
    if (!documentData) return;

    // Validate that all Q&A pairs have both question and answer
    const hasEmptyFields = editedQAPairs.some(qa => !qa.question.trim() || !qa.answer.trim());
    if (hasEmptyFields) {
      toast({
        title: "Validation Error",
        description: "Please fill in all question and answer fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user to get their email
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

      // Update Q&A pairs if editing
      if (isEditing) {
        // Delete existing Q&A pairs
        const { error: deleteError } = await supabase
          .from('training_data')
          .delete()
          .eq('training_document_id', documentData.id);

        if (deleteError) throw deleteError;

        // Insert updated Q&A pairs
        const trainingDataInserts = editedQAPairs.map((qa) => ({
          training_document_id: documentData.id,
          question: qa.question,
          answer: qa.answer
        }));

        const { error: insertError } = await supabase
          .from('training_data')
          .insert(trainingDataInserts);

        if (insertError) throw insertError;
      }

      // Update document status to approved and add submitter email
      const { error: statusError } = await supabase
        .from('training_documents')
        .update({ 
          status: 'approved',
          submitter_email: user.email
        })
        .eq('id', documentData.id);

      if (statusError) throw statusError;

      toast({
        title: "Document Approved!",
        description: "The training document has been successfully approved and is now ready for use.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error('Error submitting document:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit the document. Please try again.",
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
      
      // Then fetch the Q&A pairs from the database
      fetchQAPairs(documentId);
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
    handleSubmit
  };
};
