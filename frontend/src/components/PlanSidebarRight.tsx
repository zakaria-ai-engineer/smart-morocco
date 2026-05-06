import React from 'react';
import { Users, MapPin } from 'lucide-react';
import { Avatar } from './ui/Avatar';

const MEMBERS = [
  { name: 'Sarah', role: 'Admin', isOnline: true },
  { name: 'Mike', role: 'Member', isOnline: true },
  { name: 'Jess', role: 'Member', isOnline: false },
  { name: 'You', role: 'Member', isOnline: true },
];

export function PlanSidebarRight() {
  return (
    <aside className="hidden xl:flex w-80 border-l border-white/10 flex-col bg-[#050B14]/80 backdrop-blur-xl shrink-0">
      <div className="p-8">
        <h3 className="text-sm font-bold tracking-wider text-slate-400 mb-6 flex items-center gap-2">
          <Users className="w-4 h-4" /> Group Members
        </h3>
        <div className="flex flex-col gap-4 mb-10">
          {MEMBERS.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-default">
              <Avatar name={m.name} size="lg" isOnline={m.isOnline} />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{m.name}</p>
                <p className="text-xs text-slate-500">{m.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 bg-gradient-to-br from-[#C1272D]/10 to-transparent border border-[#C1272D]/20 rounded-2xl">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C1272D]" /> Next Stop
          </h4>
          <p className="text-sm text-slate-300">Arrival in Marrakech</p>
          <p className="text-xs text-slate-500 mt-1">Oct 12, 2026</p>
        </div>
      </div>
    </aside>
  );
}
