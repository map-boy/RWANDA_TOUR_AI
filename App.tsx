import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { Message } from './types';
import { startChat, getInspirationIdea, generateInspirationImage } from './services/geminiService';
import ChatBubble from './components/ChatBubble';
import MessageInput from './components/MessageInput';

const SUGGESTIONS = [
  "Best gorilla trekking spots 🦍",
  "Top hotels in Kigali 🏨",
  "Kigali to Akagera route 🚗",
  "Rwanda culture & traditions 🎭",
  "Nyungwe Forest activities 🌿",
  "Lake Kivu travel tips 🌊",
];

const RwandaLogo: React.FC = () => (
  <div style={{
    width: 44, height: 44, borderRadius: '50%',
    background: 'linear-gradient(135deg, #00C896 0%, #007A5E 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 20px rgba(0,200,150,0.4)', flexShrink: 0, fontSize: 22,
  }}>🌍</div>
);

const ThinkingBubble: React.FC<{ text: string; collapsed: boolean; onToggle: () => void }> = ({ text, collapsed, onToggle }) => (
  <div style={{
    background: '#0f0f0f', border: '1px solid #1e1e1e',
    borderRadius: 12, overflow: 'hidden', maxWidth: 480,
  }}>
    <button onClick={onToggle} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', background: 'transparent', border: 'none',
      cursor: 'pointer', color: '#555',
    }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: '#00C896',
            animation: 'pulse 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
      <span style={{ fontSize: 12, flex: 1, textAlign: 'left', color: '#555' }}>
        {collapsed ? 'Thought process — click to expand' : text}
      </span>
      <span style={{ fontSize: 11, color: '#333', transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
    </button>
    {!collapsed && (
      <div style={{ padding: '0 14px 12px', borderTop: '1px solid #181818', color: '#444', fontSize: 12, fontStyle: 'italic', lineHeight: 1.6 }}>
        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#00C896,transparent)', marginBottom: 8, animation: 'scan 1.5s linear infinite' }} />
        {text}
      </div>
    )}
  </div>
);

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [thinkingText, setThinkingText] = useState('');
  const [thinkingCollapsed, setThinkingCollapsed] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);
  const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      chatRef.current = startChat();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Initialization failed');
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const startThinking = (steps: string[]) => {
    setShowThinking(true);
    setThinkingCollapsed(false);
    setThinkingText(steps[0]);
    let i = 1;
    thinkingIntervalRef.current = setInterval(() => {
      if (i < steps.length) setThinkingText(steps[i++]);
    }, 900);
  };

  const stopThinking = () => {
    if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current);
    setThinkingCollapsed(true);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!chatRef.current) return;
    if (!hasStarted) setHasStarted(true);
    setIsLoading(true);
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text }]);
    startThinking(['Understanding your question...', 'Searching destinations...', 'Gathering local insights...', 'Crafting your answer...']);
    try {
      const response = await chatRef.current.sendMessage({ message: text });
      stopThinking();
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch {
      stopThinking();
      const msg = 'Sorry, I encountered an error. Please try again.';
      setError(msg);
      setMessages(prev => [...prev, { role: 'model', text: msg }]);
    } finally {
      setIsLoading(false);
    }
  }, [hasStarted]);

  const handleGenerateInspiration = useCallback(async () => {
    if (!hasStarted) setHasStarted(true);
    setIsLoading(true);
    setError(null);
    const messageId = Date.now();
    setMessages(prev => [...prev,
      { role: 'user', text: '✨ Inspire me with a travel idea!' },
      { id: messageId, role: 'model', text: 'Finding a hidden gem for you...', isLoadingImage: false },
    ]);
    startThinking(['Exploring hidden gems...', 'Crafting the perfect destination...', 'Generating a stunning image...']);
    try {
      const idea = await getInspirationIdea();
      stopThinking();
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, text: `**${idea.destinationName}**\n\n${idea.description}`, isLoadingImage: true } : m
      ));
      const imageUrl = await generateInspirationImage(idea.imagePrompt);
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, imageUrl, isLoadingImage: false } : m
      ));
    } catch {
      stopThinking();
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, text: 'Could not generate inspiration. Try again!', isLoadingImage: false } : m
      ));
    } finally {
      setIsLoading(false);
    }
  }, [hasStarted]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a', color: '#e8e8e8', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#0a0a0a;}
        ::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:2px;}
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8);}50%{opacity:1;transform:scale(1);}}
        @keyframes scan{0%{transform:translateX(-100%);}100%{transform:translateX(200%);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(0,200,150,.2);}50%{box-shadow:0 0 40px rgba(0,200,150,.5);}}
        .chip{transition:all .2s ease;padding:8px 16px;border-radius:20px;background:#111;border:1px solid #1e1e1e;color:#666;font-size:13px;cursor:pointer;font-family:inherit;}
        .chip:hover{background:#0f2420!important;border-color:#00C896!important;color:#00C896!important;transform:translateY(-2px);}
        .chip:disabled{opacity:.4;cursor:not-allowed;}
      `}</style>

      {/* Header */}
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', borderBottom:'1px solid #141414', background:'rgba(10,10,10,0.97)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <RwandaLogo />
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, letterSpacing:1.5, color:'#fff' }}>NSUURA AI</div>
            <div style={{ fontSize:11, color:'#333', letterSpacing:.5 }}>Powered by VAF UBWENGE TECH · East Africa Guide</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#333' }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#00C896', animation:'pulse 2s infinite' }} />
          Online
        </div>
      </header>

      {/* Main */}
      <main style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column' }} ref={chatContainerRef}>
        {!hasStarted ? (
          /* Landing */
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px', animation:'fadeUp .6s ease' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#00C896,#007A5E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:38, marginBottom:28, animation:'glow 3s ease-in-out infinite' }}>🌍</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(22px,5vw,36px)', color:'#fff', textAlign:'center', marginBottom:12, lineHeight:1.2 }}>
              Where would you like<br/>to explore?
            </h2>
            <p style={{ color:'#444', fontSize:15, textAlign:'center', marginBottom:40, maxWidth:400, lineHeight:1.7 }}>
              Ask Nsuura anything about Rwanda & East Africa — destinations, hotels, routes, culture and more.
            </p>
            <div style={{ width:'100%', maxWidth:640, marginBottom:28 }}>
              <MessageInput onSendMessage={handleSendMessage} onGenerateInspiration={handleGenerateInspiration} isLoading={isLoading} />
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:9, justifyContent:'center', maxWidth:600 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="chip" onClick={() => handleSendMessage(s)} disabled={isLoading}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat */
          <div style={{ flex:1, padding:'28px 24px', maxWidth:760, width:'100%', margin:'0 auto' }}>
            {messages.map((msg, i) => (
              <div key={msg.id || i} style={{ marginBottom:18, animation:'fadeUp .3s ease' }}>
                <ChatBubble message={msg} />
              </div>
            ))}

            {isLoading && showThinking && (
              <div style={{ marginBottom:12, animation:'fadeUp .3s ease' }}>
                <ThinkingBubble text={thinkingText} collapsed={thinkingCollapsed} onToggle={() => setThinkingCollapsed(c => !c)} />
              </div>
            )}

            {isLoading && (
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#00C896,#007A5E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>🌍</div>
                <div style={{ display:'flex', gap:5 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#00C896', animation:'pulse 1s ease-in-out infinite', animationDelay:`${i*.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ background:'#150a0a', border:'1px solid #2e1010', borderRadius:10, padding:'12px 16px', color:'#ff6b6b', fontSize:13, marginBottom:16 }}>
                ⚠️ {error}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer — only after chat starts */}
      {hasStarted && (
        <footer style={{ padding:'14px 24px', borderTop:'1px solid #141414', background:'rgba(10,10,10,0.98)', backdropFilter:'blur(12px)', position:'sticky', bottom:0 }}>
          <div style={{ maxWidth:760, margin:'0 auto' }}>
            <MessageInput onSendMessage={handleSendMessage} onGenerateInspiration={handleGenerateInspiration} isLoading={isLoading} />
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;