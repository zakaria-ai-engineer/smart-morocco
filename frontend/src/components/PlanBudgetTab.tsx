import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { CATEGORIES, type ActivityCategory, CAT_META } from './ui/theme';
import { GlassCard } from './ui/GlassCard';

export interface Expense {
  id: string;
  label: string;
  amount: number;
  category: ActivityCategory;
}

interface PlanBudgetTabProps {
  expenses: Expense[];
  onAddExpense: (label: string, amount: number, category: ActivityCategory) => void;
  onDeleteExpense: (id: string) => void;
}

export function PlanBudgetTab({ expenses, onAddExpense, onDeleteExpense }: PlanBudgetTabProps) {
  const [newExpLabel, setNewExpLabel] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpCategory, setNewExpCategory] = useState<ActivityCategory>('Food');
  const [memberCount, setMemberCount] = useState(3);

  const totalBudget = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = memberCount > 0 ? totalBudget / memberCount : 0;

  // Mock members for Splitwise-style display
  const MOCK_MEMBERS = ['Sarah', 'Mike', 'You'].slice(0, memberCount);
  const mockDebts: { from: string; to: string; amount: number }[] = [];
  if (memberCount >= 2 && totalBudget > 0) {
    const paidByFirst = totalBudget * 0.6;
    const share = perPerson;
    if (paidByFirst - share > 0) {
      MOCK_MEMBERS.slice(1).forEach(m => mockDebts.push({ from: m, to: MOCK_MEMBERS[0], amount: Math.round(share) }));
    }
  }

  const handleAdd = () => {
    if (!newExpLabel.trim() || !newExpAmount) return;
    onAddExpense(newExpLabel.trim(), Number(newExpAmount), newExpCategory);
    setNewExpLabel('');
    setNewExpAmount('');
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total */}
        <div className="bg-gradient-to-br from-[#C1272D]/20 to-black/40 border border-[#C1272D]/30 rounded-3xl p-6 text-center relative overflow-hidden col-span-1 md:col-span-1">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C1272D] to-transparent opacity-50"></div>
          <p className="text-red-400 font-bold tracking-widest text-xs uppercase mb-2">Total Expenses</p>
          <motion.h2 key={totalBudget} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black text-white tracking-tight">
            ${totalBudget.toLocaleString()}
          </motion.h2>
        </div>
        {/* Per Person */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
          <p className="text-slate-400 font-bold tracking-widest text-xs uppercase mb-2">Per Person</p>
          <p className="text-4xl font-black text-[#D4AF37]">${perPerson.toFixed(0)}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-slate-500 text-xs">Members:</span>
            <div className="flex gap-1">
              <button onClick={() => setMemberCount(m => Math.max(1, m - 1))} className="w-6 h-6 rounded-md bg-white/10 text-white text-xs hover:bg-white/20 transition-colors">−</button>
              <span className="w-6 text-center text-white text-sm font-bold">{memberCount}</span>
              <button onClick={() => setMemberCount(m => m + 1)} className="w-6 h-6 rounded-md bg-white/10 text-white text-xs hover:bg-white/20 transition-colors">+</button>
            </div>
          </div>
        </div>
        {/* Who Owes Who */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-slate-400 font-bold tracking-widest text-xs uppercase mb-3">Who Owes Whom</p>
          {mockDebts.length === 0 ? (
            <p className="text-slate-600 text-xs italic">Add more expenses to calculate splits.</p>
          ) : (
            <div className="space-y-2">
              {mockDebts.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-6 h-6 rounded-full bg-[#C1272D]/30 text-white flex items-center justify-center font-bold text-[10px]">{d.from[0]}</span>
                  <span className="text-slate-300">{d.from}</span>
                  <span className="text-slate-500">owes</span>
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">{d.to[0]}</span>
                  <span className="text-slate-300">{d.to}</span>
                  <span className="ml-auto font-bold text-emerald-400">${d.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense */}
      <GlassCard className="p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-[1.5] w-full">
          <label className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-2 block">Category</label>
          <select
            value={newExpCategory}
            onChange={e => setNewExpCategory(e.target.value as ActivityCategory)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C1272D] transition-colors appearance-none"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-[2] w-full">
          <label className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-2 block">Expense Label</label>
          <input value={newExpLabel} onChange={e => setNewExpLabel(e.target.value)} placeholder="e.g. Train ticket" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C1272D] transition-colors" />
        </div>
        <div className="flex-1 w-full">
          <label className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-2 block">Amount ($)</label>
          <input type="number" value={newExpAmount} onChange={e => setNewExpAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C1272D] transition-colors" />
        </div>
        <button onClick={handleAdd} disabled={!newExpLabel || !newExpAmount} className="w-full md:w-auto bg-white/10 hover:bg-[#C1272D] disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors border border-white/10 hover:border-transparent">
          Add
        </button>
      </GlassCard>

      {/* Expenses List */}
      <div className="space-y-3">
        <AnimatePresence>
          {expenses.map(exp => {
            const style = CAT_META[exp.category];
            const Icon = style.icon;
            return (
              <motion.div key={exp.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full border ${style.badge} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-slate-200 block">{exp.label}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-bold`}>{exp.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-white">${exp.amount.toLocaleString()}</span>
                  <button onClick={() => onDeleteExpense(exp.id)} className="text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-md hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
