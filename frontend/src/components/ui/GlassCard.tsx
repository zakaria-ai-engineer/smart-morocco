import React from 'react';

export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 ${className}`}>
      {children}
    </div>
  );
}
