
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Link as LinkIcon, CheckCircle, XCircle } from "lucide-react";
import DocumentStatusActions from "@/components/DocumentStatusActions";
import DeleteDocumentDialog from "./DeleteDocumentDialog";

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

interface DocumentsTableProps {
  documents: TrainingDocument[];
  onDocumentClick: (doc: TrainingDocument, event: React.MouseEvent) => void;
  onDocumentDeleted: () => void;
  startIndex: number;
}

const DocumentsTable = ({ documents, onDocumentClick, onDocumentDeleted, startIndex }: DocumentsTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getSubmitterInitials = (profile: any, email: string | null) => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (profile?.display_name) {
      const parts = profile.display_name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return profile.display_name.substring(0, 2).toUpperCase();
    }
    if (email) {
      const parts = email.split('@')[0].split('.');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const formatSubmitterName = (profile: any, email: string | null) => {
    if (profile?.display_name) {
      return profile.display_name;
    }
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (email) {
      return email;
    }
    return 'Unknown User';
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Trained</TableHead>
            <TableHead>Q&A Pairs</TableHead>
            <TableHead>Source Links</TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc, index) => (
            <TableRow 
              key={doc.id}
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={(e) => onDocumentClick(doc, e)}
            >
              <TableCell className="font-medium text-gray-500">
                {startIndex + index + 1}
              </TableCell>
              <TableCell className="font-medium max-w-xs">
                <div className="truncate" title={doc.title}>
                  {doc.title}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(doc.status)}>
                  {doc.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {doc.trained ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={doc.trained ? "text-green-600" : "text-red-600"}>
                    {doc.trained ? "Yes" : "No"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  {doc.training_data?.length || 0}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-4 h-4 text-green-600" />
                  {doc.source_links?.length || 0}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                      {getSubmitterInitials(doc.profiles, doc.submitter_email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {formatSubmitterName(doc.profiles, doc.submitter_email)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ID: {doc.submitter_id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <DocumentStatusActions 
                    documentId={doc.id}
                    currentStatus={doc.status}
                    onStatusUpdate={onDocumentDeleted}
                  />
                  <DeleteDocumentDialog 
                    documentId={doc.id}
                    documentTitle={doc.title}
                    onDocumentDeleted={onDocumentDeleted}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentsTable;
