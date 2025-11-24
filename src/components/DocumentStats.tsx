import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock, XCircle, Download } from "lucide-react";
import { useDocumentStats } from "@/hooks/useDocumentStats";
import { fetchDocumentsForExport, exportToCSV, exportToJSON, exportToPDF, exportToWord } from "@/lib/document-export";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DocumentStats = () => {
  const { stats, loading } = useDocumentStats();
  const { toast } = useToast();
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  const handleDownload = async (type: string, format: 'csv' | 'json' | 'pdf' | 'word' = 'csv') => {
    try {
      setDownloadingType(type);
      
      const statusFilter = type === 'all' ? undefined : type;
      const documents = await fetchDocumentsForExport(statusFilter);
      
      if (documents.length === 0) {
        toast({
          title: "No documents to export",
          description: `There are no ${type === 'all' ? '' : type} documents to download.`,
          variant: "destructive",
        });
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'word' ? 'docx' : format;
      const filename = `documents_${type}_${timestamp}.${extension}`;
      
      if (format === 'csv') {
        exportToCSV(documents, filename);
      } else if (format === 'json') {
        exportToJSON(documents, filename);
      } else if (format === 'pdf') {
        exportToPDF(documents, filename);
      } else {
        await exportToWord(documents, filename);
      }
      
      toast({
        title: "Export successful",
        description: `Downloaded ${documents.length} document(s) with their Q&A pairs.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingType(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{stats.total}</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={downloadingType === 'all' || stats.total === 0}
                  className="h-8 w-8"
                  title="Download all documents"
                >
                  <Download className={`h-4 w-4 ${downloadingType === 'all' ? 'animate-pulse' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload('all', 'csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('all', 'json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('all', 'pdf')}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('all', 'word')}>
                  Export as Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={downloadingType === 'approved' || stats.approved === 0}
                  className="h-8 w-8"
                  title="Download approved documents"
                >
                  <Download className={`h-4 w-4 ${downloadingType === 'approved' ? 'animate-pulse' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload('approved', 'csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('approved', 'json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('approved', 'pdf')}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('approved', 'word')}>
                  Export as Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={downloadingType === 'pending' || stats.pending === 0}
                  className="h-8 w-8"
                  title="Download pending documents"
                >
                  <Download className={`h-4 w-4 ${downloadingType === 'pending' ? 'animate-pulse' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload('pending', 'csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('pending', 'json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('pending', 'pdf')}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('pending', 'word')}>
                  Export as Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={downloadingType === 'rejected' || stats.rejected === 0}
                  className="h-8 w-8"
                  title="Download rejected documents"
                >
                  <Download className={`h-4 w-4 ${downloadingType === 'rejected' ? 'animate-pulse' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload('rejected', 'csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('rejected', 'json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('rejected', 'pdf')}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('rejected', 'word')}>
                  Export as Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentStats;
