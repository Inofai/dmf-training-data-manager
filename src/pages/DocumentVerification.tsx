import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, CheckCircle, Edit, Send, ArrowLeft, Link as LinkIcon } from "lucide-react";

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

const DocumentVerification = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [docLoading, setDocLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedQAPairs, setEditedQAPairs] = useState<QAPair[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const documentId = searchParams.get('id');
  const title = searchParams.get('title');
  const qaCount = searchParams.get('qa_count');
  const sourceLinks = searchParams.get('source_links');

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
      return;
    }

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
  }, [documentId, title, qaCount, sourceLinks, user, loading, navigate]);

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

  const handleSubmit = async () => {
    if (!documentData) return;

    setIsSubmitting(true);
    try {
      // Get current user to get their email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("User email not found");
      }

      // Update the document title if changed
      if (editedTitle !== documentData.title) {
        const { error: titleError } = await supabase
          .from('training_documents')
          .update({ title: editedTitle })
          .eq('id', documentData.id);

        if (titleError) throw titleError;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (docLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <Navigation />
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading document...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <Navigation />
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Not Found</h1>
            <Button onClick={() => navigate("/editor")}>Return to Editor</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Navigation />
      
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/editor")}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-600 mb-2 flex items-center justify-center gap-2">
              <CheckCircle className="w-8 h-8" />
              Document Processed Successfully!
            </h1>
            <p className="text-gray-600">Review the extracted content below and make any necessary edits before final submission.</p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-blue-600" />
              Document Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title
              </label>
              {isEditing ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">{documentData.title}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Q&A Pairs Generated:</span>
                <p className="text-lg font-semibold text-blue-600">{documentData.qa_count}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Source Links:</span>
                <p className="text-lg font-semibold text-green-600">{documentData.source_links.length}</p>
              </div>
            </div>

            {documentData.source_links.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Source Links
                </h3>
                <div className="space-y-2">
                  {documentData.source_links.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Question & Answer Pairs</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? "Stop Editing" : "Edit Content"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {editedQAPairs.map((qa, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">Q{index + 1}</Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question
                    </label>
                    {isEditing ? (
                      <Textarea
                        value={qa.question}
                        onChange={(e) => handleQAChange(index, 'question', e.target.value)}
                        className="w-full"
                        rows={2}
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
                        onChange={(e) => handleQAChange(index, 'answer', e.target.value)}
                        className="w-full"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-900 bg-white p-3 rounded border">{qa.answer}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg flex items-center gap-2"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="w-5 h-5" />
                Approve & Submit Document
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerification;
