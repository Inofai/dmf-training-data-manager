
import React from 'react';

interface CellRendererProps {
  content: string;
}

const CellRenderer: React.FC<CellRendererProps> = ({ content }) => {
  const processInlineFormatting = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    
    // Combined regex for bold, links, and inline code
    const regex = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]+)\))|(`([^`]+)`)/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        parts.push(beforeText);
      }
      
      if (match[1]) {
        // Bold text **text**
        parts.push(
          <strong key={match.index} className="font-bold">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Link [text](url)
        parts.push(
          <a 
            key={match.index}
            href={match[5]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {match[4]}
          </a>
        );
      } else if (match[6]) {
        // Inline code `code`
        parts.push(
          <code 
            key={match.index}
            className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono"
          >
            {match[7]}
          </code>
        );
      }
      
      lastIndex = regex.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      parts.push(remainingText);
    }
    
    return parts;
  };

  const processNewlines = (text: string) => {
    return text.split('\\n').map((line, index, array) => (
      <React.Fragment key={index}>
        {processInlineFormatting(line)}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const processedContent = processNewlines(content);
  
  return <>{processedContent}</>;
};

export default CellRenderer;
