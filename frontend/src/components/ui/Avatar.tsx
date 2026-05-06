import React from 'react';
import { getAvatarGradient } from './theme';

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isOnline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Avatar({ name, size = 'md', isOnline, className = '', style }: AvatarProps) {
  const gradient = getAvatarGradient(name);
  const initial = name[0].toUpperCase();
  
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-10 h-10 text-sm',
  }[size];

  const badgeClasses = {
    xs: 'w-1.5 h-1.5 border-[1px]',
    sm: 'w-2 h-2 border-[1px]',
    md: 'w-2.5 h-2.5 border-[1.5px]',
    lg: 'w-3 h-3 border-2',
  }[size];

  return (
    <div className={`relative shrink-0 ${className}`} style={style}>
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-black text-white shadow-md ring-1 ring-black/20`}>
        {initial}
      </div>
      {isOnline && (
        <span className={`absolute bottom-0 right-0 ${badgeClasses} rounded-full bg-emerald-500 border-[#0f172a] shadow`}>
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
        </span>
      )}
    </div>
  );
}
