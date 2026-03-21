import React, { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onGenerateInspiration: () => void;
  isLoading: boolean;
}

const SendIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

const LightbulbIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.166 6.106a.75.75 0 0 0-1.06 1.06l1.59 1.591a.75.75 0 0 0 1.06-1.06l-1.59-1.591Z" />
  </svg>
);

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onGenerateInspiration, isLoading }) => {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = text.trim().length > 0 && !isLoading;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#0f0f0f',
      border: `1px solid ${focused ? '#00C896' : '#1e1e1e'}`,
      borderRadius: 16,
      padding: '8px 10px',
      transition: 'border-color 0.2s ease',
      boxShadow: focused ? '0 0 0 3px rgba(0,200,150,0.08)' : 'none',
    }}>
      {/* Inspiration button */}
      <button
        type="button"
        onClick={onGenerateInspiration}
        disabled={isLoading}
        title="Generate travel inspiration"
        style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: isLoading ? '#1a1a1a' : '#1a2e28',
          color: isLoading ? '#333' : '#00C896',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#1e3a30'; }}
        onMouseLeave={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#1a2e28'; }}
      >
        <LightbulbIcon />
      </button>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Ask about Rwanda & East Africa..."
        rows={1}
        disabled={isLoading}
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          color: '#e8e8e8', fontSize: 14, lineHeight: 1.6, resize: 'none',
          fontFamily: "'DM Sans','Segoe UI',sans-serif",
          maxHeight: 160, overflowY: 'auto',
          padding: '4px 0', verticalAlign: 'middle',
        }}
      />

      {/* Send button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSend}
        style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: canSend ? 'linear-gradient(135deg,#00C896,#007A5E)' : '#1a1a1a',
          color: canSend ? '#fff' : '#333',
          cursor: canSend ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all 0.2s ease',
          boxShadow: canSend ? '0 4px 12px rgba(0,200,150,0.3)' : 'none',
        }}
      >
        {isLoading ? (
          <div style={{ width: 16, height: 16, border: '2px solid #333', borderTopColor: '#00C896', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        ) : (
          <SendIcon />
        )}
      </button>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
};

export default MessageInput;