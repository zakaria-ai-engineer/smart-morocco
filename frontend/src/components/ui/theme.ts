import React from 'react';
import { Utensils, Bed, Train, Sparkles } from 'lucide-react';

export type ActivityCategory = 'Food' | 'Hotel' | 'Transport' | 'Experience';

export const CATEGORIES: ActivityCategory[] = ['Food', 'Hotel', 'Transport', 'Experience'];

export const CAT_META: Record<ActivityCategory, { label: string; icon: React.ElementType; badge: string; dot: string }> = {
  Food:       { label: 'Food',       icon: Utensils, badge: 'text-orange-400 bg-orange-400/10 border-orange-400/20', dot: 'bg-orange-400' },
  Hotel:      { label: 'Hotel',      icon: Bed,      badge: 'text-purple-400 bg-purple-400/10 border-purple-400/20', dot: 'bg-purple-400' },
  Transport:  { label: 'Transport',  icon: Train,    badge: 'text-blue-400   bg-blue-400/10   border-blue-400/20',   dot: 'bg-blue-400'   },
  Experience: { label: 'Experience', icon: Sparkles, badge: 'text-amber-400  bg-amber-400/10  border-amber-400/20',  dot: 'bg-amber-400'  },
};

const AVATAR_GRADIENTS: Record<string, string> = {
  You:     'from-violet-600  to-purple-700',
  Sarah:   'from-rose-500    to-red-600',
  Mike:    'from-blue-500    to-indigo-600',
  Jess:    'from-emerald-500 to-green-600',
  Jessica: 'from-emerald-500 to-green-600',
};

const DEFAULT_GRADIENT = 'from-slate-600 to-slate-700';

export function getAvatarGradient(name: string): string {
  return AVATAR_GRADIENTS[name] ?? DEFAULT_GRADIENT;
}
