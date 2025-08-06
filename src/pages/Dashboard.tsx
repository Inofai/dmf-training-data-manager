
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
import { useDebounce } from "@/hooks/useDebounce";
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
  
  // State for "All Documents" tab
  const [allCurrentPage, setAllCurrentPage] = useState(1);
  const [allSearchTerm, setAllSearchTerm] = useState("");
  const debouncedAllSearchTerm = useDebounce(allSearchTerm, 300);

  // State for "Trained Only" tab
  const [trainedCurrentPage, setTrainedCurrentPage] = useState(1);
  const [trainedSearchTerm, setTrainedSearchTerm] = useState("");
  const debouncedTrainedSearchTerm = useDebounce(trainedSearchTerm, 300);

  // Current active tab
  const [activeTab, setActiveTab] = useState("all");

  // Fetch documents for "All Documents" tab
  const {
    documents: allDocuments,
    totalPages: allTotalPages,
    documentsLoading: allLoading,
    fetchDocuments: refetchAllDocuments
  } = useDocuments({
    page: allCurrentPage,
    limit: ITEMS_PER_PAGE,
    searchTerm: debouncedAllSearchTerm,
    trainedOnly: false
  });

  // Fetch documents for "Trained Only" tab
  const {
    documents: trainedDocuments,
    totalPages: trainedTotalPages,
    documentsLoading: trainedLoading,
    fetchDocuments: refetchTrainedDocuments
  } = useDocuments({
    page: trainedCurrentPage,
    limit: ITEMS_PER_PAGE,
    searchTerm: debouncedTrainedSearchTerm,
    trainedOnly: true
  });

  // Fetch all documents for stats (we'll use the first hook's result for stats)
  const {
    documents: statsDocuments,
    documentsLoading: statsLoading
  } = useDocuments({
    page: 1,
    limit: 1000, // Get more for stats calculation
    searchTerm: "",
    trainedOnly: false
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Reset page to 1 when search term changes
  useEffect(() => {
    setAllCurrentPage(1);
  }, [debouncedAllSearchTerm]);

  useEffect(() => {
    setTrainedCurrentPage(1);
  }, [debouncedTrainedSearchTerm]);

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

  const handleAllPageChange = (page: number) => {
    setAllCurrentPage(page);
  };

  const handleTrainedPageChange = (page: number) => {
    setTrainedCurrentPage(page);
  };

  const handleAllSearchChange = (value: string) => {
    setAllSearchTerm(value);
  };

  const handleTrainedSearchChange = (value: string) => {
    setTrainedSearchTerm(value);
  };

  const handleDocumentDeleted = () => {
    refetchAllDocuments();
    refetchTrainedDocuments();
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

  // Calculate start index for table numbering
  const allStartIndex = (allCurrentPage - 1) * ITEMS_PER_PAGE;
  const trainedStartIndex = (trainedCurrentPage - 1) * ITEMS_PER_PAGE;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DashboardHeader />
        <DocumentStats documents={statsDocuments} />

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Your Training Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    value={allSearchTerm}
                    onChange={(e) => handleAllSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {allLoading ? (
                  <LoadingState />
                ) : allDocuments.length === 0 ? (
                  debouncedAllSearchTerm ? (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No documents found matching "{debouncedAllSearchTerm}"</p>
                    </div>
                  ) : (
                    <EmptyDocumentsState />
                  )
                ) : (
                  <>
                    <DocumentsTable 
                      documents={allDocuments}
                      onDocumentClick={handleDocumentClick}
                      onDocumentDeleted={handleDocumentDeleted}
                      startIndex={allStartIndex}
                    />
                    <DashboardPagination
                      currentPage={allCurrentPage}
                      totalPages={allTotalPages}
                      onPageChange={handleAllPageChange}
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

                {trainedLoading ? (
                  <LoadingState />
                ) : trainedDocuments.length === 0 ? (
                  debouncedTrainedSearchTerm ? (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No trained documents found matching "{debouncedTrainedSearchTerm}"</p>
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
                      documents={trainedDocuments}
                      onDocumentClick={handleDocumentClick}
                      onDocumentDeleted={handleDocumentDeleted}
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
