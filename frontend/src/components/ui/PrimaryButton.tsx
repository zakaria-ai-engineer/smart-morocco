import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export function PrimaryButton({ children, className = '', ...props }: HTMLMotionProps<"button">) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      {...props}
      className={`flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition-colors shadow-[0_0_14px_rgba(220,38,38,0.35)] ${className}`}
    >
      {children}
    </motion.button>
  );
}
