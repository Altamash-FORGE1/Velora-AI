import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Activity, Sparkles } from 'lucide-react';
import api, { BACKEND_URL } from './api';
import { useAuth } from './AuthContext';
import './SymptomsAnalyser.css';

const SymptomsAnalyser = () => {
  const { theme } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I am Velora AI. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState('GREEN'); // GREEN, YELLOW, RED
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickActions = ["Mild Pain", "Started Today", "Chronic", "Worsening"];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    inputRef.current?.focus();
    setIsTyping(true);

    // Track activity for health score calculation
    const count = parseInt(localStorage.getItem('velora_chat_count') || '0');
    localStorage.setItem('velora_chat_count', (count + 1).toString());

    // Prepare placeholder for AI response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const token = localStorage.getItem('velora_token');

      // fetch does not use axios interceptors, so we must manually add the JWT and Content-Type
      const response = await fetch(`${BACKEND_URL}/api/triage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ messages: updatedMessages, stream: true }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
        accumulatedContent += chunk;

        // Update the last message in real-time
        const urgentPattern = /\b(emergency|severe|911|hospital|urgent|immediate)\b/i;
        if (urgentPattern.test(accumulatedContent)) {
          setStatus('RED');
        }

        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = accumulatedContent;
          return newMsgs;
        });
      }
      
      reader.releaseLock();

      // Save the last response as a summary for the Home page
      localStorage.setItem('velora_last_summary', accumulatedContent);

    } catch (error) {
      console.error("Triage Error:", error);
      setMessages(prev => {
        // Filter out the empty placeholder we added earlier
        const filtered = prev.filter(msg => msg.content !== '' || msg.role !== 'assistant');
        return [
          ...filtered,
          { role: 'assistant', content: `⚠️ Error: ${error.message}. Please check your connection or try again later.` }
        ];
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`flex flex-col h-full max-w-5xl mx-auto relative z-10 p-4`}>
      <div 
        className="flex-1 flex flex-col rounded-[2.5rem] overflow-hidden backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl relative"
      >
        {/* Integrated Glass Header with Neon Glow */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200/50'} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/20 rounded-2xl">
              <Sparkles className="text-sky-400" size={22} />
            </div>
            <div>
              <h2 className={`font-bold text-lg leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Velora Assistant</h2>
              <p className="text-[10px] font-bold text-sky-400/80 uppercase tracking-widest">AI Medical Triage</p>
            </div>
          </div>
          <div className={`px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] flex items-center gap-2 transition-all duration-700 ${
            status === 'GREEN' 
              ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-500/20 animate-pulse' 
              : 'bg-rose-500/10 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse border border-rose-500/20'
          }`}>
            <Activity size={14} strokeWidth={3} /> <span>STATUS: {status}</span>
          </div>
        </div>

        {/* Main Chat Flow */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start animate-fade-in-up'}`}
            >
              <div className={`max-w-[75%] flex items-end gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center transition-transform hover:rotate-12 ${
                    msg.role === 'user' ? 'bg-indigo-600 shadow-indigo-500/40' : 'bg-sky-500/20 shadow-sky-400/20'
                  } shadow-lg`}>
                    {msg.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-sky-400" />}
                  </div>
                  
                  <div className={`p-5 rounded-[1.5rem] relative transition-all duration-300 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 rounded-br-none'
                      : `backdrop-blur-md border rounded-bl-none ${
                          theme === 'dark' 
                            ? 'bg-white/10 border-sky-400/30 text-white shadow-sky-500/5' 
                            : 'bg-white/80 border-sky-200/50 text-slate-800 shadow-slate-200/50'
                        }`
                  }`}>
                    {msg.role === 'assistant' && msg.content === '' && isTyping ? (
                      <div className="w-48 h-6 rounded-lg bg-sky-400/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-400/30 to-transparent -translate-x-full animate-shimmer" />
                      </div>
                    ) : (
                      <div className="text-[0.95rem] leading-relaxed whitespace-pre-wrap font-medium">
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Smart Actions & Input Area */}
        <div className="p-8 pt-0 space-y-6">
          <div className="flex flex-wrap gap-2">
            {quickActions.map(action => (
              <button 
                key={action} 
                onClick={() => {
                  setInput(action);
                  inputRef.current?.focus();
                }} 
                className={`px-5 py-2 rounded-full text-xs font-bold border transition-all ${
                  theme === 'dark' 
                    ? 'bg-sky-500/10 border-sky-400/30 text-sky-300 hover:bg-sky-500/20' 
                    : 'bg-sky-50 border-sky-200 text-slate-900 hover:bg-sky-100'
                }`}
              >
                {action}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-3xl blur opacity-0 group-focus-within:opacity-40 transition duration-700`} />
            <div className={`relative flex items-center p-2 rounded-[2rem] backdrop-blur-3xl border transition-all duration-500 translate-y-[-4px] ${
              theme === 'dark' 
                ? 'bg-black/40 border-white/10 group-focus-within:border-sky-500/50 shadow-2xl shadow-black/50' 
                : 'bg-white/90 border-slate-200 group-focus-within:border-sky-400 shadow-xl shadow-slate-200/50'
            }`}>
              <input 
                ref={inputRef}
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Type your symptoms or questions..." 
                className={`flex-1 bg-transparent border-none outline-none px-6 py-4 text-sm font-medium ${
                  theme === 'dark' ? 'text-white placeholder-slate-400' : 'text-slate-800 placeholder-slate-400'
                }`}
              />
              <button 
                type="submit" 
                disabled={isTyping || !input.trim()} 
                className={`p-4 rounded-2xl transition-all duration-300 ${
                  input.trim() 
                    ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/40 hover:scale-110 active:scale-90' 
                    : 'bg-slate-500/10 text-slate-500 scale-90'
                }`}
              >
                {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} strokeWidth={2.5} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SymptomsAnalyser;