
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DocumentVerificationHeader = () => {
  const navigate = useNavigate();

  return (
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
  );
};

export default DocumentVerificationHeader;
