import React from 'react';
import { CAT_META, type ActivityCategory } from './theme';

export function CategoryBadge({ category, showLabel = true, className = '' }: { category: ActivityCategory; showLabel?: boolean; className?: string }) {
  const meta = CAT_META[category];
  const Icon = meta.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${meta.badge} ${className}`}>
      <Icon className="w-3 h-3" />
      {showLabel && meta.label}
    </span>
  );
}
