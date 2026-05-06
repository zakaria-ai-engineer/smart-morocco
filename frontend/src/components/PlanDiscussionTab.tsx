import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send } from 'lucide-react';
import { Avatar } from './ui/Avatar';

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
}

interface PlanDiscussionTabProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export function PlanDiscussionTab({ messages, onSendMessage }: PlanDiscussionTabProps) {
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="max-w-3xl mx-auto h-[70vh] flex flex-col bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      <div className="px-6 py-4 border-b border-white/10 bg-black/20 shrink-0">
        <h3 className="font-bold text-white flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#C1272D]" /> Group Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map(msg => {
            const isMe = msg.user === 'You';
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <Avatar name={msg.user} size="sm" />
                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-1 px-1">
                    {!isMe && <span className="text-[11px] font-medium text-slate-400">{msg.user}</span>}
                    <span className="text-[10px] text-slate-600">{msg.time}</span>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${isMe ? 'bg-[#C1272D] text-white rounded-br-sm' : 'bg-white/10 border border-white/5 text-slate-200 rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-black/40 border-t border-white/10 shrink-0">
        <div className="relative flex items-center">
          <input
            value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#C1272D]/50 focus:bg-white/10 transition-all"
          />
          <button onClick={handleSend} disabled={!chatInput.trim()} className="absolute right-2 p-2 text-white bg-[#C1272D] hover:bg-red-600 rounded-lg disabled:opacity-0 disabled:scale-90 transition-all shadow-[0_0_10px_rgba(193,39,45,0.4)]">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
