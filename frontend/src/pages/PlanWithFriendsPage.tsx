import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, DollarSign, MessageSquare, Coffee, Link, Check } from 'lucide-react';
import { PlanSidebarLeft } from '../components/PlanSidebarLeft';
import { PlanSidebarRight } from '../components/PlanSidebarRight';
import { PlanItineraryTab, type DayPlan } from '../components/PlanItineraryTab';
import { PlanBudgetTab, type Expense } from '../components/PlanBudgetTab';
import { PlanDiscussionTab, type ChatMessage } from '../components/PlanDiscussionTab';
import { type ActivityCategory } from '../components/ui/theme';

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function PlanWithFriendsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const roomId = tripId ?? 'default-room';
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'discussion'>('itinerary');
  const [copied, setCopied] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // ── State ──
  const [days, setDays] = useState<DayPlan[]>([
    {
      id: 1, title: 'Day 1 — Arrival in Marrakech', activities: [
        { id: crypto.randomUUID(), text: 'Hotel check-in', category: 'Hotel', upvotes: 0, downvotes: 0, userVoted: null },
        { id: crypto.randomUUID(), text: 'Dinner at Jemaa el-Fnaa', category: 'Food', upvotes: 0, downvotes: 0, userVoted: null }
      ]
    },
    {
      id: 2, title: 'Day 2 — Medina Explore', activities: [
        { id: crypto.randomUUID(), text: 'ONCF High-Speed Train to Tangier', category: 'Transport', upvotes: 0, downvotes: 0, userVoted: null },
        { id: crypto.randomUUID(), text: 'Visit Bahia Palace', category: 'Experience', upvotes: 0, downvotes: 0, userVoted: null }
      ]
    },
    {
      id: 3, title: 'Day 3 — Atlas Mountains', activities: [
        { id: crypto.randomUUID(), text: 'Camel ride', category: 'Experience', upvotes: 0, downvotes: 0, userVoted: null }
      ]
    }
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: crypto.randomUUID(), label: 'Airbnb Booking', amount: 450, category: 'Hotel' },
    { id: crypto.randomUUID(), label: 'Flight Tickets', amount: 800, category: 'Transport' }
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: crypto.randomUUID(), user: 'Sarah', text: 'Hey guys! Super excited for Morocco! 🇲🇦', time: '10:00 AM' },
    { id: crypto.randomUUID(), user: 'Mike', text: 'Same! Just booked my flights.', time: '10:05 AM' }
  ]);

  // ── WebSocket real-time chat ──
  useEffect(() => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    const baseUrl = typeof envUrl === 'string' ? envUrl : 'http://localhost:8001';
    const wsUrl = baseUrl.replace(/^http/, 'ws') + `/group-trips/ws/${roomId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message' && data.message) {
          const msg = data.message;
          setMessages(prev => [
            ...prev,
            {
              id: msg._id ?? crypto.randomUUID(),
              user: msg.user ?? 'Someone',
              text: msg.text,
              time: new Date(msg.created_at ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } catch { /* ignore parse errors */ }
    };

    ws.onerror = () => console.warn('[WS] Connection failed — falling back to local state');

    return () => ws.close();
  }, [roomId]);

  // ── Invite link copy ──
  const handleCopyInvite = useCallback(() => {
    const link = `${window.location.origin}/friends/${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [roomId]);

  // ── Handlers ──
  const handleAddActivity = (dayId: number, text: string, category: ActivityCategory) => {
    setDays(prev => prev.map(day =>
      day.id === dayId
        ? { ...day, activities: [...day.activities, { id: crypto.randomUUID(), text, category, upvotes: 0, downvotes: 0, userVoted: null }] }
        : day
    ));
  };

  const handleDeleteActivity = (dayId: number, activityId: string) => {
    setDays(prev => prev.map(day =>
      day.id === dayId
        ? { ...day, activities: day.activities.filter(a => a.id !== activityId) }
        : day
    ));
  };

  const handleAddExpense = (label: string, amount: number, category: ActivityCategory) => {
    setExpenses(prev => [...prev, { id: crypto.randomUUID(), label, amount, category }]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleSendMessage = (text: string) => {
    const localMsg: ChatMessage = { id: crypto.randomUUID(), user: 'You', text, time: timeNow() };
    // Optimistic local update
    setMessages(prev => [...prev, localMsg]);
    // Send via WebSocket if connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        message: { text, user: 'You', avatar: 'Y', color: 'bg-[#C1272D]' },
      }));
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-white overflow-hidden font-sans pt-16 selection:bg-[#C1272D]/30">

      {/* 1) LEFT SIDEBAR */}
      <PlanSidebarLeft />

      {/* 2) MAIN PLANNER (Center) */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="px-6 md:px-10 py-8 border-b border-white/5 bg-black/10 backdrop-blur-sm shrink-0">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Coffee className="w-3 h-3" /> Plan With Friends
              </p>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                Moroccan Escape
              </h1>
              <p className="text-slate-500 text-xs mt-1 font-mono">Room: {roomId}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Invite Button */}
              <button
                onClick={handleCopyInvite}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-300 ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Invite Friends'}
              </button>

            {/* Premium Tab System */}
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md w-full md:w-auto">
              {[
                { id: 'itinerary', label: 'Itinerary', icon: Calendar },
                { id: 'budget', label: 'Budget', icon: DollarSign },
                { id: 'discussion', label: 'Discussion', icon: MessageSquare }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#C1272D] rounded-xl -z-10 shadow-[0_0_15px_rgba(193,39,45,0.4)]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                </button>
              ))}
            </div>
          </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <AnimatePresence mode="wait">
            {activeTab === 'itinerary' && (
              <motion.div key="itinerary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <PlanItineraryTab days={days} onAddActivity={handleAddActivity} onDeleteActivity={handleDeleteActivity} />
              </motion.div>
            )}
            {activeTab === 'budget' && (
              <motion.div key="budget" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <PlanBudgetTab expenses={expenses} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} />
              </motion.div>
            )}
            {activeTab === 'discussion' && (
              <motion.div key="discussion" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <PlanDiscussionTab messages={messages} onSendMessage={handleSendMessage} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* 3) ACTIVITY PANEL (Right Sidebar) */}
      <PlanSidebarRight />

    </div>
  );
}
