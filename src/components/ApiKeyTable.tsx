
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Eye, EyeOff, X } from "lucide-react";

interface ApiKey {
  id: string;
  key_value: string;
  description: string | null;
  created_at: string;
  created_by: string;
}

interface ApiKeyTableProps {
  apiKey: ApiKey | null;
  onApiKeyDeleted: () => void;
}

const ApiKeyTable = ({ apiKey, onApiKeyDeleted }: ApiKeyTableProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  const handleDeleteApiKey = async () => {
    if (!apiKey || !confirm("Are you sure you want to delete this API key?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('api_key')
        .delete()
        .eq('id', apiKey.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "API key deleted successfully.",
      });

      onApiKeyDeleted();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key.",
        variant: "destructive",
      });
    }
  };

  if (!apiKey) {
    return (
      <div className="text-center py-8 text-gray-500">
        No API key found. Add your first API key to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Key Value</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {isVisible ? apiKey.key_value : '••••••••••••••••••••••••••••••••••••••••'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </TableCell>
          <TableCell>{apiKey.description || '-'}</TableCell>
          <TableCell>
            {new Date(apiKey.created_at).toLocaleDateString()}
          </TableCell>
          <TableCell>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteApiKey}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default ApiKeyTable;
