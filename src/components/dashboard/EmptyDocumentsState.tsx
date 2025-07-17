
import React from 'react';
import { FileText } from "lucide-react";

const EmptyDocumentsState = () => {
  return (
    <div className="text-center py-8">
      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
      <p className="text-gray-600">Create your first training document using the editor.</p>
    </div>
  );
};

export default EmptyDocumentsState;
