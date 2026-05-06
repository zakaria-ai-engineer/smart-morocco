import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trash2, Plus } from 'lucide-react';
import { CATEGORIES, type ActivityCategory, CAT_META } from './ui/theme';
import { PrimaryButton } from './ui/PrimaryButton';
import { GlassCard } from './ui/GlassCard';

export interface Activity {
  id: string;
  text: string;
  category: ActivityCategory;
  upvotes: number;
  downvotes: number;
  userVoted: 'up' | 'down' | null;
}

export interface DayPlan {
  id: number;
  title: string;
  activities: Activity[];
}

interface PlanItineraryTabProps {
  days: DayPlan[];
  onAddActivity: (dayId: number, text: string, category: ActivityCategory) => void;
  onDeleteActivity: (dayId: number, activityId: string) => void;
}

export function PlanItineraryTab({ days, onAddActivity, onDeleteActivity }: PlanItineraryTabProps) {
  const [newActivity, setNewActivity] = useState('');
  const [newActCategory, setNewActCategory] = useState<ActivityCategory>('Experience');
  const [selectedDay, setSelectedDay] = useState(1);
  const [votes, setVotes] = useState<Record<string, { up: number; down: number; userVoted: 'up' | 'down' | null }>>({});

  const getVotes = (actId: string) => votes[actId] ?? { up: 0, down: 0, userVoted: null };

  const handleVote = (actId: string, dir: 'up' | 'down') => {
    setVotes(prev => {
      const current = prev[actId] ?? { up: 0, down: 0, userVoted: null };
      // Toggle off if same vote
      if (current.userVoted === dir) {
        return { ...prev, [actId]: { ...current, [dir === 'up' ? 'up' : 'down']: current[dir === 'up' ? 'up' : 'down'] - 1, userVoted: null } };
      }
      // Remove previous opposite vote, then add new
      const wasOpposite = current.userVoted !== null;
      return {
        ...prev,
        [actId]: {
          up: dir === 'up' ? current.up + 1 : current.up - (wasOpposite && current.userVoted === 'up' ? 1 : 0),
          down: dir === 'down' ? current.down + 1 : current.down - (wasOpposite && current.userVoted === 'down' ? 1 : 0),
          userVoted: dir,
        },
      };
    });
  };

  const handleAdd = () => {
    if (!newActivity.trim()) return;
    onAddActivity(selectedDay, newActivity.trim(), newActCategory);
    setNewActivity('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Add Activity Controls */}
      <GlassCard className="p-5 flex flex-col md:flex-row gap-4 items-end mb-8 shadow-lg">
        <div className="flex-1 w-full">
          <label className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-2 block">Day</label>
          <select
            value={selectedDay}
            onChange={e => setSelectedDay(Number(e.target.value))}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C1272D] transition-colors appearance-none"
          >
            {days.map(d => <option key={d.id} value={d.id}>Day {d.id}</option>)}
          </select>
        </div>
        <div className="flex-[1.5] w-full">
          <label className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-2 block">Category</label>
          <select
            value={newActCategory}
            onChange={e => setNewActCategory(e.target.value as ActivityCategory)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C1272D] transition-colors appearance-none"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-[2] w-full">
          <label className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-2 block">New Activity</label>
          <input
            value={newActivity}
            onChange={e => setNewActivity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="E.g., CTM Premium Bus"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-[#C1272D] transition-colors"
          />
        </div>
        <PrimaryButton onClick={handleAdd} disabled={!newActivity.trim()} className="w-full md:w-auto px-6 py-3">
          Add
        </PrimaryButton>
      </GlassCard>

      {/* Days List */}
      <div className="space-y-6">
        {days.map((day) => (
          <GlassCard key={day.id} className="p-6 hover:border-[#C1272D]/40 transition-all duration-300">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {day.title}
            </h3>

            {day.activities.length === 0 ? (
              <p className="text-slate-500 italic text-sm py-4">No activities yet. Add one above!</p>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {day.activities.map((act) => {
                    const style = CAT_META[act.category];
                    const Icon = style.icon;
                    const v = getVotes(act.id);
                    return (
                      <motion.div
                        key={act.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="group flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 hover:bg-black/40 transition-colors"
                      >
                        <span className="text-slate-200 text-sm flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg border ${style.badge}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {act.text}
                        </span>
                        <div className="flex items-center gap-1">
                          {/* 👍 Upvote */}
                          <button
                            onClick={() => handleVote(act.id, 'up')}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                              v.userVoted === 'up'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent'
                            }`}
                          >
                            👍 <span>{v.up}</span>
                          </button>
                          {/* 👎 Downvote */}
                          <button
                            onClick={() => handleVote(act.id, 'down')}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                              v.userVoted === 'down'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent'
                            }`}
                          >
                            👎 <span>{v.down}</span>
                          </button>
                          {/* Delete */}
                          <button onClick={() => onDeleteActivity(day.id, act.id)} className="text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-md hover:bg-red-500/10 ml-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
