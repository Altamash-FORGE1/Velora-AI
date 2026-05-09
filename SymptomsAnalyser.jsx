import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { BACKEND_URL } from './api';
import './SymptomsAnalyser.css';

const SymptomsAnalyser = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I am Velora AI. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    setIsTyping(true);

    // Prepare placeholder for AI response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const token = localStorage.getItem('velora_token');
      const response = await fetch(`${BACKEND_URL}/api/triage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ messages: updatedMessages, stream: true })
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
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = accumulatedContent;
          return newMsgs;
        });
      }
      
      reader.releaseLock();

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
    <div className="symptoms-container">
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            <div className="icon-box">
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="text-content">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-area">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." disabled={isTyping} />
        <button type="submit" disabled={isTyping || !input.trim()} className="send-icon">
          {isTyping ? <Loader2 className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};

export default SymptomsAnalyser;