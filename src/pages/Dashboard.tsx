
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocuments } from "@/hooks/useDocuments";
import { FileText, Search, CheckCircle } from "lucide-react";

interface TrainingDocument {
  id: string;
  title: string;
  status: string;
  created_at: string;
  source_links: string[];
  submitter_id: string;
  submitter_email: string | null;
  trained: boolean;
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
  const [trainedCurrentPage, setTrainedCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [trainedSearchTerm, setTrainedSearchTerm] = useState("");
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

  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter trained documents
  const trainedDocuments = documents.filter(doc => 
    doc.trained && doc.title.toLowerCase().includes(trainedSearchTerm.toLowerCase())
  );

  // Pagination logic for all documents
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Pagination logic for trained documents
  const trainedTotalPages = Math.ceil(trainedDocuments.length / ITEMS_PER_PAGE);
  const trainedStartIndex = (trainedCurrentPage - 1) * ITEMS_PER_PAGE;
  const trainedEndIndex = trainedStartIndex + ITEMS_PER_PAGE;
  const currentTrainedDocuments = trainedDocuments.slice(trainedStartIndex, trainedEndIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTrainedPageChange = (page: number) => {
    setTrainedCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleTrainedSearchChange = (value: string) => {
    setTrainedSearchTerm(value);
    setTrainedCurrentPage(1); // Reset to first page when searching
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
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Documents</TabsTrigger>
                <TabsTrigger value="trained" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Trained Only
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search documents by title..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {documentsLoading ? (
                  <LoadingState />
                ) : filteredDocuments.length === 0 ? (
                  searchTerm ? (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No documents found matching "{searchTerm}"</p>
                    </div>
                  ) : (
                    <EmptyDocumentsState />
                  )
                ) : (
                  <>
                    <DocumentsTable 
                      documents={currentDocuments}
                      onDocumentClick={handleDocumentClick}
                      onDocumentDeleted={fetchDocuments}
                      startIndex={startIndex}
                    />
                    <DashboardPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </>
                )}
              </TabsContent>

              <TabsContent value="trained" className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search trained documents by title..."
                    value={trainedSearchTerm}
                    onChange={(e) => handleTrainedSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {documentsLoading ? (
                  <LoadingState />
                ) : trainedDocuments.length === 0 ? (
                  trainedSearchTerm ? (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No trained documents found matching "{trainedSearchTerm}"</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No trained documents yet</p>
                    </div>
                  )
                ) : (
                  <>
                    <DocumentsTable 
                      documents={currentTrainedDocuments}
                      onDocumentClick={handleDocumentClick}
                      onDocumentDeleted={fetchDocuments}
                      startIndex={trainedStartIndex}
                    />
                    <DashboardPagination
                      currentPage={trainedCurrentPage}
                      totalPages={trainedTotalPages}
                      onPageChange={handleTrainedPageChange}
                    />
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
