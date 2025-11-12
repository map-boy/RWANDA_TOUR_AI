import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
  isLoading?: boolean;
}

const UserIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
        Y
    </div>
);

const ModelIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0">
        AI
    </div>
);


const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isLoading = false }) => {
  const { role, text, imageUrl, isLoadingImage } = message;
  const isUser = role === 'user';

  const bubbleClasses = isUser
    ? 'bg-blue-500 text-white'
    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  
  const containerClasses = isUser
    ? 'flex items-end justify-end gap-2'
    : 'flex items-end gap-2';

  const LoadingIndicator = () => (
    <div className="flex items-center justify-center space-x-1">
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
    </div>
  );
  
  const ImageLoader: React.FC = () => (
      <div className="mt-3 rounded-lg bg-gray-200 dark:bg-gray-600 animate-pulse w-full aspect-video"></div>
  );

  // A simple markdown-to-html converter
  const renderMarkdown = (mdText: string) => {
    let html = mdText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-600 rounded px-1 py-0.5 text-sm">$1</code>') // Inline code
      .replace(/(\r\n|\n|\r)/g, '<br />'); // Newlines

    // Lists
    html = html.replace(/^\s*\*\s+(.*)/gm, (match, content) => {
        return `<li>${content.trim()}</li>`;
    });
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul><br \/><ul>/g, ''); // Fix consecutive lists

    return { __html: html };
  };

  return (
    <div className={containerClasses}>
      {!isUser && <ModelIcon />}
      <div
        className={`max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl shadow-md transition-all duration-300 ${bubbleClasses} ${isUser ? 'rounded-br-none' : 'rounded-bl-none'}`}
      >
        {isLoading ? <LoadingIndicator /> : <div dangerouslySetInnerHTML={renderMarkdown(text)} />}
        {isLoadingImage && <ImageLoader />}
        {imageUrl && !isLoadingImage && (
            <img 
                src={imageUrl} 
                alt="Travel inspiration"
                className="mt-3 rounded-lg shadow-lg w-full object-cover"
            />
        )}
      </div>
      {isUser && <UserIcon />}
    </div>
  );
};

export default ChatBubble;
