import React from 'react';
import { Map, Calendar, Settings } from 'lucide-react';

export function PlanSidebarLeft() {
  return (
    <aside className="hidden md:flex w-64 border-r border-white/10 flex-col bg-black/20 backdrop-blur-md shrink-0">
      <div className="p-6 flex-1 flex flex-col gap-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Navigation</p>
        <button className="flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group">
          <Map className="w-5 h-5" /> <span className="font-medium">All Trips</span>
        </button>
        <button className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#C1272D]/20 to-transparent border-l-2 border-[#C1272D] text-white transition-all shadow-[inset_0_0_20px_rgba(193,39,45,0.05)]">
          <Calendar className="w-5 h-5 text-[#C1272D]" /> <span className="font-medium">Morocco Escape</span>
        </button>
        <button className="flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group">
          <Settings className="w-5 h-5" /> <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
