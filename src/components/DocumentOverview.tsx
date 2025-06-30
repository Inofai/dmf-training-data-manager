
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, LinkIcon, Plus, Trash2 } from "lucide-react";

interface DocumentOverviewProps {
  title: string;
  qaCount: number;
  sourceLinks: string[];
  isEditing: boolean;
  newSourceLink: string;
  onTitleChange: (title: string) => void;
  onSourceLinkChange: (index: number, value: string) => void;
  onAddSourceLink: () => void;
  onRemoveSourceLink: (index: number) => void;
  onNewSourceLinkChange: (value: string) => void;
}

const DocumentOverview = ({
  title,
  qaCount,
  sourceLinks,
  isEditing,
  newSourceLink,
  onTitleChange,
  onSourceLinkChange,
  onAddSourceLink,
  onRemoveSourceLink,
  onNewSourceLinkChange
}: DocumentOverviewProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAddSourceLink();
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-white mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="w-5 h-5 text-blue-600" />
          Document Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Title
          </label>
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full"
            />
          ) : (
            <p className="text-lg font-semibold text-gray-900">{title}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Q&A Pairs Generated:</span>
            <p className="text-lg font-semibold text-blue-600">{qaCount}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Source Links:</span>
            <p className="text-lg font-semibold text-green-600">{sourceLinks.length}</p>
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium text-gray-700 mb-2 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Source Links
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddSourceLink}
                className="ml-auto flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Link
              </Button>
            )}
          </h3>
          
          {isEditing && (
            <div className="mb-3 flex gap-2">
              <Input
                placeholder="Enter new source link URL..."
                value={newSourceLink}
                onChange={(e) => onNewSourceLinkChange(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={onAddSourceLink} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="space-y-2">
            {sourceLinks.length > 0 ? (
              sourceLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Input
                        value={link}
                        onChange={(e) => onSourceLinkChange(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveSourceLink(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800 underline break-all flex-1"
                    >
                      {link}
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No source links available</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentOverview;
