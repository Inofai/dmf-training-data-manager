
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
import { Eye, X } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key_value: string;
  description: string | null;
  created_at: string;
  is_active: boolean;
}

interface ApiKeyTableProps {
  apiKeys: ApiKey[];
  onApiKeyDeleted: () => void;
}

const ApiKeyTable = ({ apiKeys, onApiKeyDeleted }: ApiKeyTableProps) => {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

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

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No API keys found. Add your first API key to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Key Value</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {apiKeys.map((key) => (
          <TableRow key={key.id}>
            <TableCell className="font-medium">{key.name}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">
                  {visibleKeys.has(key.id) ? key.key_value : '••••••••••••••••'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleKeyVisibility(key.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
            <TableCell>{key.description || '-'}</TableCell>
            <TableCell>
              {new Date(key.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                key.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {key.is_active ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteApiKey(key.id)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ApiKeyTable;
