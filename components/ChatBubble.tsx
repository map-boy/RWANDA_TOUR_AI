import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
  isLoading?: boolean;
}

const UserIcon: React.FC = () => (
  <div style={{
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
  }}>Y</div>
);

const ModelIcon: React.FC = () => (
  <div style={{
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg, #00C896, #007A5E)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, flexShrink: 0,
    boxShadow: '0 0 12px rgba(0,200,150,0.3)',
  }}>🌍</div>
);

const LoadingDots: React.FC = () => (
  <div style={{ display: 'flex', gap: 5, padding: '4px 0' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 7, height: 7, borderRadius: '50%', background: '#00C896',
        animation: 'pulse 1s ease-in-out infinite',
        animationDelay: `${i * 0.15}s`,
      }} />
    ))}
  </div>
);

const ImageSkeleton: React.FC = () => (
  <div style={{
    marginTop: 12, borderRadius: 10, height: 200,
    background: 'linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  }} />
);

const renderMarkdown = (text: string) => {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff;font-weight:600">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:4px;padding:1px 6px;font-size:12px;color:#00C896">$1</code>')
    .replace(/(\r\n|\n|\r)/g, '<br />');

  html = html.replace(/^\s*[-•]\s+(.*)/gm, (_m, c) => `<li>${c.trim()}</li>`);
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul style="padding-left:18px;margin:6px 0">$1</ul>');
  html = html.replace(/<\/ul><br \/><ul[^>]*>/g, '');

  return { __html: html };
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isLoading = false }) => {
  const { role, text, imageUrl, isLoadingImage } = message;
  const isUser = role === 'user';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10,
      justifyContent: isUser ? 'flex-end' : 'flex-start',
    }}>
      {!isUser && <ModelIcon />}

      <div style={{
        maxWidth: 'min(480px, 80%)',
        padding: '12px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser
          ? 'linear-gradient(135deg, #1d4ed8, #2563eb)'
          : '#111',
        border: isUser ? 'none' : '1px solid #1e1e1e',
        color: isUser ? '#fff' : '#ccc',
        fontSize: 14,
        lineHeight: 1.7,
        boxShadow: isUser
          ? '0 4px 20px rgba(37,99,235,0.25)'
          : '0 2px 12px rgba(0,0,0,0.4)',
      }}>
        {isLoading
          ? <LoadingDots />
          : <div dangerouslySetInnerHTML={renderMarkdown(text)} />
        }
        {isLoadingImage && <ImageSkeleton />}
        {imageUrl && !isLoadingImage && (
          <img
            src={imageUrl}
            alt="Travel inspiration"
            style={{ marginTop: 12, borderRadius: 10, width: '100%', objectFit: 'cover', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
          />
        )}
      </div>

      {isUser && <UserIcon />}

      <style>{`
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8);}50%{opacity:1;transform:scale(1);}}
        @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
      `}</style>
    </div>
  );
};

export default ChatBubble;