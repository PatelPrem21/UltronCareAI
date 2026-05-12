import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Mic, BrainCircuit, User, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const Chat = () => {
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: `Hello ${user?.name}. I am UltronCare AI, your clinical assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickActions = [
    "Find nearby hospitals",
    "Search Medicines",
    "Check my Health Vitals"
  ];

  const handleSend = async (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    // Add user message
    const newUserMsg = { id: Date.now(), type: 'user', text: messageText };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI Response (Since no specific backend route was provided for chat)
    setTimeout(() => {
      let botReply = "I understand. Let me check your medical records to provide the best advice.";
      if (messageText.toLowerCase().includes('hospital')) {
        botReply = "I've located 3 UltronCare certified hospitals within a 5-mile radius. Would you like me to book an appointment?";
      } else if (messageText.toLowerCase().includes('medicine')) {
        botReply = "Your current active prescription is Amoxicillin. Make sure to take it after meals. Are you looking for another medicine?";
      } else if (messageText.toLowerCase().includes('health')) {
        botReply = "Your last recorded vitals were stable. Blood pressure was 120/80 and heart rate 72 bpm. Is there a specific symptom you are worried about?";
      }

      setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: botReply }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col glass-card rounded-2xl overflow-hidden relative border border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-space-800/80 backdrop-blur-md flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-violet/20 flex items-center justify-center text-brand-violet shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          <BrainCircuit size={20} />
        </div>
        <div>
          <h2 className="font-bold text-white tracking-wide">UltronCare AI</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs text-slate-400">Online • Secure Session</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-space-900/50">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 max-w-[80%] ${msg.type === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.type === 'user' ? 'bg-space-600 text-slate-300' : 'bg-brand-violet/20 text-brand-violet'
              }`}>
                {msg.type === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.type === 'user' 
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-tr-sm' 
                  : 'bg-space-800 border border-white/5 text-slate-300 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 max-w-[80%]">
             <div className="w-8 h-8 rounded-full bg-brand-violet/20 text-brand-violet flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-space-800 border border-white/5 rounded-tl-sm flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-brand-violet animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-brand-violet animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-brand-violet animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-space-800 border-t border-white/10">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleSend(action)}
              className="whitespace-nowrap px-4 py-2 bg-space-700 hover:bg-space-600 text-slate-300 text-xs font-medium rounded-full border border-white/5 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
        
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
          className="flex items-center gap-2 bg-space-900 border border-white/10 p-2 rounded-2xl"
        >
          <button type="button" className="p-3 text-slate-500 hover:text-teal-400 transition-colors">
            <Mic size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms or ask a question..."
            className="flex-1 bg-transparent text-white outline-none placeholder:text-slate-600 text-sm"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-teal-500 to-brand-violet text-white rounded-xl hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] disabled:opacity-50 transition-all"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
