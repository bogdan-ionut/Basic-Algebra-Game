import React from 'react';
import { motion } from 'motion/react';

interface DailyRingProps {
  currentSeconds: number;
  targetSeconds: number;
}

export function DailyRing({ currentSeconds, targetSeconds }: DailyRingProps) {
  const progress = Math.min(currentSeconds / targetSeconds, 1);
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;
  
  const minutes = Math.floor(currentSeconds / 60);

  return (
    <div className="relative flex items-center justify-center w-16 h-16 bg-white/50 rounded-full shadow-sm border-2 border-white/60 backdrop-blur-sm">
      <svg className="transform -rotate-90 w-16 h-16 absolute inset-0">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-sky-200/50"
        />
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={progress >= 1 ? "text-green-400" : "text-sky-400"}
          strokeLinecap="round"
        />
      </svg>
      <div className="flex flex-col items-center justify-center z-10">
        <span className="text-sm font-bold text-slate-700">{minutes}m</span>
      </div>
    </div>
  );
}
