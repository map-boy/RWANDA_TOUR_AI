import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { Message } from './types';
import { startChat, getInspirationIdea, generateInspirationImage } from './services/geminiService';
import ChatBubble from './components/ChatBubble';
import MessageInput from './components/MessageInput';

const App: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = () => {
      try {
        const chatSession = startChat();
        setChat(chatSession);
        setMessages([
          {
            role: 'model',
            text: "Muraho! I'm Tura, your personal guide from RWANDA TOUR AI. I'm here to help you explore the beauty of Rwanda and East Africa. Ask me anything about your trip, or click the lightbulb for a unique travel idea!",
          },
        ]);
      } catch (e) {
        if (e instanceof Error) {
            setError(`Initialization failed: ${e.message}`);
        } else {
            setError("An unknown error occurred during initialization.");
        }
        console.error("Initialization error:", e);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!chat) {
        setError("Chat session not initialized. Please refresh the page.");
        return;
    }
    
    setIsLoading(true);
    setError(null);

    const userMessage: Message = { role: 'user', text };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await chat.sendMessage({ message: text });
      const modelMessage: Message = { role: 'model', text: response.text };
      setMessages((prevMessages) => [...prevMessages, modelMessage]);
    } catch (e) {
        const errorMessage = "Sorry, I encountered an error. Please try again.";
        setError(errorMessage);
        setMessages((prevMessages) => [...prevMessages, { role: 'model', text: errorMessage }]);
        if (e instanceof Error) {
            console.error("Gemini API error:", e.message);
        } else {
            console.error("Unknown Gemini API error:", e);
        }
    } finally {
      setIsLoading(false);
    }
  }, [chat]);

  const handleGenerateInspiration = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const userPrompt: Message = { role: 'user', text: 'Spark some inspiration for me!' };
    const messageId = Date.now();
    const placeholderMessage: Message = {
        id: messageId,
        role: 'model',
        text: 'Let me think of a wonderful place for you...',
    };
    
    setMessages(prev => [...prev, userPrompt, placeholderMessage]);

    try {
        const idea = await getInspirationIdea();
        
        setMessages(prev => prev.map(m => m.id === messageId
            ? { ...m, text: `**${idea.destinationName}**\n\n${idea.description}`, isLoadingImage: true }
            : m
        ));

        const imageUrl = await generateInspirationImage(idea.imagePrompt);
        
        setMessages(prev => prev.map(m => m.id === messageId
            ? { ...m, imageUrl: imageUrl, isLoadingImage: false }
            : m
        ));

    } catch (e) {
        const errorMessage = "Sorry, I had trouble finding inspiration. Please try again later.";
        setMessages(prev => prev.map(m => m.id === messageId
            ? { ...m, text: errorMessage, isLoadingImage: false }
            : m
        ));
        setError(errorMessage);
        if (e instanceof Error) {
            console.error("Inspiration generation error:", e.message);
        } else {
            console.error("Unknown inspiration generation error:", e);
        }
    } finally {
        setIsLoading(false);
    }
}, []);


  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400">
          RWANDA TOUR AI
        </h1>
      </header>

      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <ChatBubble key={msg.id || index} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && <ChatBubble message={{ role: 'model', text: '...' }} isLoading={true} />}
         {error && (
            <div className="flex justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative max-w-md" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 p-4 sticky bottom-0 border-t dark:border-gray-700">
        <MessageInput onSendMessage={handleSendMessage} onGenerateInspiration={handleGenerateInspiration} isLoading={isLoading} />
      </footer>
    </div>
  );
};

export default App;