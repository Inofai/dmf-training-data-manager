
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import DocumentStats from "@/components/DocumentStats";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DocumentsTable from "@/components/dashboard/DocumentsTable";
import EmptyDocumentsState from "@/components/dashboard/EmptyDocumentsState";
import LoadingState from "@/components/dashboard/LoadingState";
import DashboardPagination from "@/components/dashboard/DashboardPagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocuments } from "@/hooks/useDocuments";
import { FileText } from "lucide-react";

interface TrainingDocument {
  id: string;
  title: string;
  status: string;
  created_at: string;
  source_links: string[];
  submitter_id: string;
  submitter_email: string | null;
  profiles: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
  training_data: { id: string; question: string; answer: string }[];
}

const ITEMS_PER_PAGE = 100;

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const { documents, documentsLoading, fetchDocuments } = useDocuments();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleDocumentClick = (doc: TrainingDocument, event: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((event.target as HTMLElement).closest('[data-delete-button], [data-action-button]')) {
      return;
    }

    const params = new URLSearchParams({
      id: doc.id,
      title: doc.title,
      qa_count: (doc.training_data?.length || 0).toString(),
      source_links: encodeURIComponent(JSON.stringify(doc.source_links || []))
    });
    
    navigate(`/document-verification?${params.toString()}`);
  };

  // Pagination logic
  const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDocuments = documents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DashboardHeader />
        <DocumentStats documents={documents} />

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Your Training Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documentsLoading ? (
              <LoadingState />
            ) : documents.length === 0 ? (
              <EmptyDocumentsState />
            ) : (
              <>
                <DocumentsTable 
                  documents={currentDocuments}
                  onDocumentClick={handleDocumentClick}
                  onDocumentDeleted={fetchDocuments}
                />
                <DashboardPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
