
import React from 'react';
import { detectLanguage } from '@/lib/language-utils';

interface MessageRendererProps {
  content: string;
  className?: string;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ content, className = '' }) => {
  const language = detectLanguage(content);
  const isRTL = language === 'ar' || language === 'he' || language === 'fa';
  
  // Split content into blocks for processing
  const blocks = content.split('\n\n').filter(block => block.trim());
  
  return (
    <div 
      className={`message-renderer ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ textAlign: isRTL ? 'right' : 'left' }}
    >
      {blocks.map((block, index) => (
        <BlockRenderer key={index} content={block.trim()} isRTL={isRTL} />
      ))}
    </div>
  );
};

interface BlockRendererProps {
  content: string;
  isRTL: boolean;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ content, isRTL }) => {
  // Check if block is a heading
  const headingMatch = content.match(/^(#{1,6})\s+(.+)/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    const text = headingMatch[2];
    return <HeadingRenderer level={level} content={text} isRTL={isRTL} />;
  }
  
  // Check if block is a YouTube video
  const youtubeMatch = content.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/);
  if (youtubeMatch) {
    return <YouTubeRenderer url={content} />;
  }
  
  // Check if block is an image URL
  const imageMatch = content.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i);
  if (imageMatch) {
    return <ImageRenderer url={content} />;
  }
  
  // Regular text block with inline formatting
  return <TextRenderer content={content} isRTL={isRTL} />;
};

interface HeadingRendererProps {
  level: number;
  content: string;
  isRTL: boolean;
}

const HeadingRenderer: React.FC<HeadingRendererProps> = ({ level, content, isRTL }) => {
  const Tag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
  const sizeClasses = {
    1: 'text-2xl font-bold',
    2: 'text-xl font-bold',
    3: 'text-lg font-semibold',
    4: 'text-base font-semibold',
    5: 'text-sm font-medium',
    6: 'text-sm font-medium'
  };
  
  return (
    <Tag 
      className={`${sizeClasses[level as keyof typeof sizeClasses]} mb-3 mt-4 first:mt-0`}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <InlineFormatter content={content} />
    </Tag>
  );
};

interface YouTubeRendererProps {
  url: string;
}

const YouTubeRenderer: React.FC<YouTubeRendererProps> = ({ url }) => {
  const getEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) return null;
    
    const videoId = videoIdMatch[1];
    const urlParams = new URLSearchParams(url.split('?')[1]);
    
    let embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const params = [];
    
    // Handle start time
    const startTime = urlParams.get('t') || urlParams.get('start');
    if (startTime) {
      const timeInSeconds = startTime.includes('s') ? parseInt(startTime) : parseInt(startTime);
      if (!isNaN(timeInSeconds)) {
        params.push(`start=${timeInSeconds}`);
      }
    }
    
    // Handle end time
    const endTime = urlParams.get('end');
    if (endTime) {
      const timeInSeconds = parseInt(endTime);
      if (!isNaN(timeInSeconds)) {
        params.push(`end=${timeInSeconds}`);
      }
    }
    
    if (params.length > 0) {
      embedUrl += `?${params.join('&')}`;
    }
    
    return embedUrl;
  };
  
  const embedUrl = getEmbedUrl(url);
  
  if (!embedUrl) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {url}
      </a>
    );
  }
  
  return (
    <div className="my-4">
      <iframe
        src={embedUrl}
        width="100%"
        height="315"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-lg shadow-md max-w-full"
      />
    </div>
  );
};

interface ImageRendererProps {
  url: string;
}

const ImageRenderer: React.FC<ImageRendererProps> = ({ url }) => {
  return (
    <div className="my-4">
      <img 
        src={url} 
        alt="Embedded image"
        className="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => window.open(url, '_blank')}
      />
    </div>
  );
};

interface TextRendererProps {
  content: string;
  isRTL: boolean;
}

const TextRenderer: React.FC<TextRendererProps> = ({ content, isRTL }) => {
  return (
    <p 
      className="mb-3 leading-relaxed"
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <InlineFormatter content={content} />
    </p>
  );
};

interface InlineFormatterProps {
  content: string;
}

const InlineFormatter: React.FC<InlineFormatterProps> = ({ content }) => {
  // Process the content to handle inline formatting
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
        parts.push(processEmojis(beforeText));
      }
      
      if (match[1]) {
        // Bold text **text**
        parts.push(
          <strong key={match.index} className="font-bold">
            {processEmojis(match[2])}
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
            {processEmojis(match[4])}
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
      parts.push(processEmojis(remainingText));
    }
    
    return parts;
  };
  
  const processEmojis = (text: string) => {
    // Enhanced emoji regex that includes more emoji ranges
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    
    return text.split(emojiRegex).map((part, index) => {
      const emoji = text.match(emojiRegex)?.[index];
      return (
        <React.Fragment key={index}>
          {part}
          {emoji && (
            <span className="font-emoji text-lg leading-none align-text-bottom">
              {emoji}
            </span>
          )}
        </React.Fragment>
      );
    });
  };
  
  const formatted = processInlineFormatting(content);
  
  return <>{formatted}</>;
};

export default MessageRenderer;
