import { useAuth } from "@/hooks/useAuth";
import { useDocumentVerification } from "@/hooks/useDocumentVerification";
import Navigation from "@/components/Navigation";
import DocumentVerificationHeader from "@/components/DocumentVerificationHeader";
import DocumentOverview from "@/components/DocumentOverview";
import QAPairsSection from "@/components/QAPairsSection";
import DocumentStatusActions from "@/components/DocumentStatusActions";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DocumentVerification = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const {
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
  } = useDocumentVerification();

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
        <DocumentVerificationHeader />

        <DocumentOverview
          title={editedTitle}
          qaCount={editedQAPairs.length}
          sourceLinks={editedSourceLinks}
          isEditing={isEditing}
          newSourceLink={newSourceLink}
          onTitleChange={setEditedTitle}
          onSourceLinkChange={handleSourceLinkChange}
          onAddSourceLink={addSourceLink}
          onRemoveSourceLink={removeSourceLink}
          onNewSourceLinkChange={setNewSourceLink}
        />

        <QAPairsSection
          qaPairs={editedQAPairs}
          isEditing={isEditing}
          onToggleEditing={() => setIsEditing(!isEditing)}
          onAddQAPair={addNewQAPair}
          onQAChange={handleQAChange}
          onRemoveQAPair={removeQAPair}
        />

        <div className="mt-6 flex justify-center gap-4">
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg flex items-center gap-2"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </Button>

          {isAdmin && documentData && (
            <DocumentStatusActions
              documentId={documentData.id}
              currentStatus={documentData.status || 'pending'}
              onStatusUpdate={() => {
                // Refresh the page or update state as needed
                window.location.reload();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentVerification;
