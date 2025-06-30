
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
import { Eye } from "lucide-react";
import DeleteApiKeyDialog from "./DeleteApiKeyDialog";

interface ApiKey {
  id: string;
  name: string;
  key_value: string;
  description: string | null;
  created_at: string;
  is_active: boolean;
  is_default?: boolean;
}

interface ApiKeyTableProps {
  apiKeys: ApiKey[];
  onApiKeyDeleted: () => void;
}

const ApiKeyTable = ({ apiKeys, onApiKeyDeleted }: ApiKeyTableProps) => {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [deletingKeys, setDeletingKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleDeleteApiKey = async (id: string) => {
    setDeletingKeys(prev => new Set(prev).add(id));
    
    try {
      console.log('Starting API key deletion process for ID:', id);
      
      // Use a more robust approach - delete with CASCADE behavior simulation
      // First, get the count of usage records to delete
      const { count: usageCount } = await supabase
        .from('api_key_usage')
        .select('*', { count: 'exact', head: true })
        .eq('api_key_id', id);

      console.log(`Found ${usageCount || 0} usage records to delete`);

      // Delete usage records in batches if there are many
      if (usageCount && usageCount > 0) {
        let deletedCount = 0;
        const batchSize = 1000;
        
        while (deletedCount < usageCount) {
          const { error: batchDeleteError } = await supabase
            .from('api_key_usage')
            .delete()
            .eq('api_key_id', id)
            .limit(batchSize);

          if (batchDeleteError) {
            console.error('Error deleting usage records batch:', batchDeleteError);
            throw new Error(`Failed to delete usage records: ${batchDeleteError.message}`);
          }

          deletedCount += batchSize;
          console.log(`Deleted batch of usage records, progress: ${Math.min(deletedCount, usageCount)}/${usageCount}`);
        }
      }

      console.log('All usage records deleted successfully');

      // Now delete the API key itself
      const { error: keyDeleteError } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (keyDeleteError) {
        console.error('Error deleting API key:', keyDeleteError);
        throw new Error(`Failed to delete API key: ${keyDeleteError.message}`);
      }

      console.log('API key deleted successfully');
      
      toast({
        title: "Success",
        description: "API key and all associated usage records deleted successfully.",
      });

      onApiKeyDeleted();
    } catch (error) {
      console.error('Complete error during deletion:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
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
        No OpenAI API key found. Add your OpenAI API key to get started.
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
              {deletingKeys.has(key.id) ? (
                <div className="text-sm text-gray-500">Deleting...</div>
              ) : (
                <DeleteApiKeyDialog 
                  onConfirm={() => handleDeleteApiKey(key.id)}
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ApiKeyTable;
