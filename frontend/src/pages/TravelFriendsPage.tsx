import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, DollarSign, MessageSquare, Users, UserPlus, Send, Plus, ThumbsUp, ThumbsDown, Trash2, X, Copy, Check } from "lucide-react";

interface ActivityItem {
  id: string;
  text: string;
  upvotes: number;
  downvotes: number;
  myVote: 'up' | 'down' | null;
}

interface Activity {
  id: number;
  day: number;
  title: string;
  activities: ActivityItem[];
}

interface Expense {
  id: number;
  item: string;
  payer: string;
  amount: number;
}

interface Message {
  id: number;
  sender: string;
  text: string;
  isMe: boolean;
}

export function TravelFriendsPage() {
  const [activeTab, setActiveTab] = useState<"itinerary" | "budget" | "chat">("itinerary");

  // Mock roles
  const currentUserRole = "Admin"; 
  const tripId = "mrx-2026-xyz";

  // ── Functional State for Members ──
  const [activeMembers, setActiveMembers] = useState([
    { id: 'm1', name: 'Sarah', role: 'Admin' },
    { id: 'm2', name: 'Mike', role: 'Member' },
    { id: 'm3', name: 'Jessica', role: 'Member' },
    { id: 'm4', name: 'Me', role: 'Member' },
  ]);

  // ── Functional State for Itinerary ──
  const [itinerary, setItinerary] = useState<Activity[]>([
    { 
      id: 1, day: 1, title: "Arrival in Marrakech", 
      activities: [
        { id: "a1", text: "Riad Check-in", upvotes: 2, downvotes: 0, myVote: 'up' },
        { id: "a2", text: "Jemaa el-Fna dinner", upvotes: 4, downvotes: 1, myVote: null }
      ] 
    },
    { 
      id: 2, day: 2, title: "Medina Exploration", 
      activities: [
        { id: "a3", text: "Bahia Palace", upvotes: 3, downvotes: 1, myVote: null },
        { id: "a4", text: "Souk Shopping", upvotes: 4, downvotes: 0, myVote: null },
        { id: "a5", text: "Mint Tea Break", upvotes: 1, downvotes: 0, myVote: null }
      ] 
    },
    { 
      id: 3, day: 3, title: "Atlas Mountains Day Trip", 
      activities: [
        { id: "a6", text: "Agafay Desert", upvotes: 5, downvotes: 0, myVote: 'up' },
        { id: "a7", text: "Camel Ride", upvotes: 2, downvotes: 2, myVote: 'down' }
      ] 
    },
  ]);
  const [newActivityText, setNewActivityText] = useState("");
  const [selectedDayToAdd, setSelectedDayToAdd] = useState<number>(1);

  const handleAddActivity = () => {
    if (!newActivityText.trim()) return;
    setItinerary(prev => prev.map(day => {
      if (day.day === selectedDayToAdd) {
        return { 
          ...day, 
          activities: [
            ...day.activities, 
            { id: Date.now().toString(), text: newActivityText.trim(), upvotes: 0, downvotes: 0, myVote: null }
          ] 
        };
      }
      return day;
    }));
    setNewActivityText("");
  };

  const handleVote = (dayId: number, activityId: string, type: 'up' | 'down') => {
    setItinerary(prev => prev.map(day => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        activities: day.activities.map(act => {
          if (act.id !== activityId) return act;
          
          let { upvotes, downvotes, myVote } = act;

          // Remove previous vote
          if (myVote === 'up') upvotes--;
          if (myVote === 'down') downvotes--;

          // If clicking the same button, it's a toggle off (already removed above)
          if (myVote === type) {
            myVote = null;
          } else {
            // Apply new vote
            myVote = type;
            if (type === 'up') upvotes++;
            if (type === 'down') downvotes++;
          }

          return { ...act, upvotes, downvotes, myVote };
        })
      };
    }));
  };

  const handleDeleteActivity = (dayId: number, activityId: string) => {
    setItinerary(prev => prev.map(day => {
      if (day.id !== dayId) return day;
      return { ...day, activities: day.activities.filter(a => a.id !== activityId) };
    }));
    showToastMsg("Activity removed ✓");
  };

  // ── Functional State for Budget ──
  const TOTAL_BUDGET = 2400;
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, item: "Riad Reservation", payer: "Sarah", amount: 800 },
    { id: 2, item: "Car Rental", payer: "Mike", amount: 250 },
    { id: 3, item: "Sahara Tour Deposit", payer: "Jessica", amount: 100 },
  ]);
  const [newExpenseItem, setNewExpenseItem] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [expenseError, setExpenseError] = useState<string | null>(null);

  const spentSoFar = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const groupMembers = activeMembers.map(m => m.name);
  const fairShare = spentSoFar / (groupMembers.length || 1);
  
  const splitSummary = groupMembers.map(member => {
    const paid = expenses.filter(e => e.payer === member).reduce((sum, e) => sum + e.amount, 0);
    const balance = paid - fairShare;
    return { member, paid, balance };
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError(null);
    const amount = Number(newExpenseAmount);

    if (!newExpenseItem.trim() || !newExpenseAmount || isNaN(amount)) return;

    if (amount <= 0) {
      setExpenseError("Amount must be greater than 0");
      return;
    }

    if (spentSoFar + amount > TOTAL_BUDGET) {
      setExpenseError("Amount exceeds remaining budget");
      return;
    }

    const newExpense: Expense = {
      id: Date.now(),
      item: newExpenseItem.trim(),
      payer: "Me",
      amount: amount
    };
    setExpenses([...expenses, newExpense]);
    setNewExpenseItem("");
    setNewExpenseAmount("");
  };

  // ── Functional State for Chat ──
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "Sarah", text: "Hey guys! I just confirmed the Riad in Marrakech. It looks amazing!", isMe: false },
    { id: 2, sender: "Me", text: "Perfect! Should I book the car rental for Thursday then?", isMe: true },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "Me", text: newMessage.trim(), isMe: true }]);
    setNewMessage("");
  };

  // ── Toast & Modal State ──
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{id: string, name: string} | null>(null);

  const showToastMsg = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`travelmorocco.com/trip/${tripId}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const executeRemoveMember = () => {
    if (!memberToRemove) return;
    setActiveMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
    showToastMsg(`${memberToRemove.name} removed from trip`);
    setMemberToRemove(null);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white font-sans relative">

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#E63946] text-white px-6 py-3 rounded-full shadow-lg font-bold tracking-wide"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Friends Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 rounded-full bg-[#E63946]/10 flex items-center justify-center mb-6 border border-[#E63946]/20 mx-auto">
                <UserPlus className="w-8 h-8 text-[#E63946]" />
              </div>
              
              <h3 className="text-2xl font-bold text-white text-center mb-2">Invite Friends</h3>
              <p className="text-slate-400 text-center text-sm mb-8">
                Share this link with your friends so they can join, vote, and plan with you.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-3 mb-6">
                <span className="text-slate-300 text-sm flex-1 font-mono truncate">travelmorocco.com/trip/{tripId}</span>
              </div>

              <button
                onClick={handleCopyLink}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isCopied ? "bg-green-500 text-white" : "bg-[#E63946] hover:bg-red-700 text-white shadow-[0_0_20px_rgba(230,57,70,0.3)]"
                }`}
              >
                {isCopied ? <><Check className="w-5 h-5" /> Copied!</> : <><Copy className="w-5 h-5" /> Copy Link</>}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Remove Member Confirmation Modal */}
      <AnimatePresence>
        {memberToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMemberToRemove(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white text-center mb-2">Remove Member</h3>
              <p className="text-slate-400 text-center text-sm mb-8">
                Remove {memberToRemove.name} from trip?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setMemberToRemove(null)}
                  className="flex-1 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={executeRemoveMember}
                  className="flex-1 py-3 rounded-xl font-bold bg-[#E63946] hover:bg-red-700 text-white shadow-[0_0_20px_rgba(230,57,70,0.3)] transition-all"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1 ▸ HERO SECTION */}
      <section className="pt-32 pb-16 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <span className="inline-block bg-white/5 border border-white/10 text-slate-300 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
            Group Travel Planner
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white">
            Plan Together, Travel Together
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Collaborate with your friends in real-time to build the perfect Moroccan itinerary.
          </p>
        </motion.div>
      </section>

      {/* 2 ▸ DASHBOARD TABS */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
          {[
            { id: "itinerary", label: "Shared Itinerary", icon: Calendar },
            { id: "budget", label: "Group Budget", icon: DollarSign },
            { id: "chat", label: "Discussion Board", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${isActive
                    ? "bg-[#E63946] text-white shadow-[0_0_20px_rgba(230,57,70,0.3)]"
                    : "bg-transparent text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon className="w-5 h-5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 ▸ DASHBOARD CONTENT */}
      <main className="max-w-7xl mx-auto px-6 pb-24">

        {/* ── ITINERARY VIEW ── */}
        {activeTab === "itinerary" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                Trip Timeline
              </h2>

              <div className="space-y-6">
                {itinerary.map((day) => (
                  <div key={day.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold shadow-inner">
                        Day {day.day}
                      </div>
                      <h3 className="font-bold text-lg text-white">{day.title}</h3>
                    </div>
                    
                    <ul className="space-y-3 ml-16">
                      <AnimatePresence>
                        {day.activities.map((act) => (
                          <motion.li 
                            key={act.id} 
                            initial={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0, overflow: "hidden", marginTop: 0, marginBottom: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-between group p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                              <div className="w-2 h-2 rounded-full bg-[#E63946] shadow-[0_0_8px_rgba(230,57,70,0.5)] shrink-0" /> 
                              <span className="font-medium">{act.text}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-4">
                              {/* Vote Controls */}
                              <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1 border border-white/5">
                                <button 
                                  onClick={() => handleVote(day.id, act.id, 'up')}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold transition-colors ${
                                    act.myVote === 'up' ? 'bg-[#E63946]/20 text-[#E63946]' : 'text-slate-400 hover:text-white hover:bg-white/10'
                                  }`}
                                >
                                  <ThumbsUp className="w-3 h-3" /> {act.upvotes}
                                </button>
                                <button 
                                  onClick={() => handleVote(day.id, act.id, 'down')}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold transition-colors ${
                                    act.myVote === 'down' ? 'bg-[#E63946]/20 text-[#E63946]' : 'text-slate-400 hover:text-white hover:bg-white/10'
                                  }`}
                                >
                                  <ThumbsDown className="w-3 h-3" /> {act.downvotes}
                                </button>
                              </div>

                              {/* Delete Control (Admin Only) */}
                              {currentUserRole === "Admin" && (
                                <button 
                                  onClick={() => handleDeleteActivity(day.id, act.id)}
                                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-[#E63946] hover:bg-[#E63946]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                  title="Remove Activity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </div>
                ))}
              </div>

              {/* Add Activity Form */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mt-8 flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">New Activity</label>
                  <input
                    type="text"
                    value={newActivityText}
                    onChange={(e) => setNewActivityText(e.target.value)}
                    placeholder="e.g. Visit Majorelle Garden"
                    className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946]"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Day</label>
                  <select
                    value={selectedDayToAdd}
                    onChange={(e) => setSelectedDayToAdd(Number(e.target.value))}
                    className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946] appearance-none"
                  >
                    {itinerary.map(d => <option key={d.day} value={d.day} className="bg-slate-900">Day {d.day}</option>)}
                  </select>
                </div>
                <button
                  onClick={handleAddActivity}
                  className="w-full sm:w-auto bg-[#E63946] hover:bg-red-700 text-white rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-6 flex items-center justify-between">
                  Group Members
                  <span className="text-xs bg-white/5 text-white px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> {activeMembers.length} Active
                  </span>
                </h3>
                <div className="space-y-4">
                  <AnimatePresence>
                    {activeMembers.map((m) => (
                      <motion.div 
                        key={m.id} 
                        initial={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0, overflow: "hidden", marginTop: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between group py-1 -mx-2 px-2 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-black/40 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                            {m.name.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-white/80">{m.name} {m.role === 'Admin' && <span className="text-slate-500 text-xs ml-1">(Admin)</span>}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {m.role === 'Admin' && <span className="text-[10px] text-[#E63946] border border-[#E63946]/30 px-2 py-0.5 rounded uppercase font-bold bg-[#E63946]/10">Admin</span>}
                          {currentUserRole === 'Admin' && m.role !== 'Admin' && (
                            <button 
                              onClick={() => setMemberToRemove(m)}
                              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-[#E63946] hover:bg-[#E63946]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                              title="Remove Member"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="w-full mt-4 py-3 rounded-xl border border-[#E63946]/30 bg-[#E63946]/5 text-[#E63946] text-sm font-bold hover:bg-[#E63946]/10 hover:border-[#E63946]/50 transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> Invite Friends
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── BUDGET VIEW ── */}
        {activeTab === "budget" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Total Budget</p>
                <h4 className="text-3xl font-extrabold text-white">${TOTAL_BUDGET.toLocaleString()}</h4>
              </div>
              <div className="bg-[#E63946]/5 border border-[#E63946]/30 rounded-2xl p-8 text-center relative overflow-hidden">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 relative z-10">Spent So Far</p>
                <h4 className="text-3xl font-extrabold text-[#E63946] relative z-10">${spentSoFar.toLocaleString()}</h4>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Remaining</p>
                <h4 className="text-3xl font-extrabold text-white">${(TOTAL_BUDGET - spentSoFar).toLocaleString()}</h4>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-black/20 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Expense</th>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Paid By</th>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {expenses.map((row) => (
                      <tr key={row.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-200">{row.item}</td>
                        <td className="px-6 py-4 text-sm text-slate-400 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">{row.payer.charAt(0)}</div>
                          {row.payer}
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-[#E63946] text-right">${row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Expense Form */}
              <div className="border-t border-slate-800 bg-black/20 p-6">
                <form onSubmit={handleAddExpense} className="flex flex-col sm:flex-row gap-4 mb-2">
                  <input
                    type="text"
                    required
                    placeholder="Expense description..."
                    value={newExpenseItem}
                    onChange={(e) => setNewExpenseItem(e.target.value)}
                    className="flex-1 bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946]"
                  />
                  <div className="relative w-full sm:w-48">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      required
                      placeholder="Amount"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                      className={`w-full bg-black/40 border rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:ring-1 ${
                        expenseError ? "border-[#E63946] focus:ring-[#E63946]" : "border-slate-700 focus:border-[#E63946] focus:ring-[#E63946]"
                      }`}
                    />
                  </div>
                  <button type="submit" className="bg-[#E63946] hover:bg-red-700 border border-[#E63946] text-white rounded-xl px-6 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 shrink-0">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </form>
                {expenseError && (
                  <p className="text-[#E63946] text-xs font-semibold mt-2 animate-in fade-in">{expenseError}</p>
                )}
              </div>
            </div>

            {/* Split Summary */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-2">Split Summary</h3>
              <p className="text-slate-400 text-sm mb-6">
                Fair share per person: <span className="text-white font-bold">${fairShare.toFixed(2)}</span>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {splitSummary.map((summary) => (
                  <div key={summary.member} className="bg-black/20 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-lg">{summary.member}</span>
                      <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        Paid ${summary.paid}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      {summary.balance > 0 ? (
                        <span className="text-green-400 font-black text-lg">
                          +${summary.balance.toFixed(2)}
                        </span>
                      ) : summary.balance < 0 ? (
                        <span className="text-[#E63946] font-black text-lg">
                          -${Math.abs(summary.balance).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-black text-lg">$0.00</span>
                      )}
                      <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        {summary.balance > 0 ? "Receives" : summary.balance < 0 ? "Owes" : "Settled"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── DISCUSSION VIEW ── */}
        {activeTab === "chat" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 bg-black/20 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#E63946]" /> Group Chat
              </h3>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)] animate-pulse" />
                <span className="text-[10px] text-green-400 font-bold uppercase tracking-[0.1em]">4 Online</span>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {messages.map(msg => (
                <div key={msg.id} className={`flex items-start gap-4 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-sm ${msg.isMe ? 'bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30' : 'bg-white/10 text-slate-300 border border-white/20'}`}>
                    {msg.sender.charAt(0)}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-md ${msg.isMe ? 'bg-[#E63946] rounded-tr-none text-white' : 'bg-black/40 rounded-tl-none border border-slate-800 text-slate-200'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${msg.isMe ? 'text-white/60' : 'text-slate-500'}`}>{msg.sender}</p>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-black/20 flex gap-4 items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-black/40 border border-slate-700 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946] transition-all"
              />
              <button
                type="submit"
                className="bg-[#E63946] hover:bg-red-700 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(230,57,70,0.3)] transition-all"
              >
                <Send className="w-5 h-5 -ml-1" />
              </button>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  );
}
