
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

interface ApiKeyAddDialogProps {
  onApiKeyAdded: () => void;
}

const ApiKeyAddDialog = ({ onApiKeyAdded }: ApiKeyAddDialogProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [newKey, setNewKey] = useState({
    key_value: "",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    checkExistingKey();
  }, []);

  const checkExistingKey = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id')
        .eq('name', 'OPENAI_API_KEY')
        .limit(1);

      if (error) throw error;
      setHasExistingKey(data && data.length > 0);
    } catch (error) {
      console.error('Error checking existing key:', error);
    }
  };

  const handleAddApiKey = async () => {
    if (!newKey.key_value.trim()) {
      toast({
        title: "Error",
        description: "API key value is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .insert({
          name: 'OPENAI_API_KEY',
          key_value: newKey.key_value.trim(),
          description: newKey.description.trim() || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "OpenAI API key added successfully.",
      });

      setNewKey({ key_value: "", description: "" });
      setIsAddDialogOpen(false);
      setHasExistingKey(true);
      onApiKeyAdded();
    } catch (error) {
      console.error('Error adding API key:', error);
      toast({
        title: "Error",
        description: "Failed to add API key.",
        variant: "destructive",
      });
    }
  };

  if (hasExistingKey) {
    return null; // Don't show the add button if key already exists
  }

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add OpenAI API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add OpenAI API Key</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Name:</strong> OPENAI_API_KEY (fixed)
            </p>
          </div>
          <div>
            <Label htmlFor="key_value">API Key Value *</Label>
            <Input
              id="key_value"
              type="password"
              value={newKey.key_value}
              onChange={(e) => setNewKey({ ...newKey, key_value: e.target.value })}
              placeholder="Enter your OpenAI API key"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newKey.description}
              onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
              placeholder="Enter description (optional)"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddApiKey}>
              Add API Key
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyAddDialog;
