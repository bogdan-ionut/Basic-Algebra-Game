import React from 'react';
import { motion } from 'motion/react';
import { CHEST_STYLE_GUIDE } from './chestStyleGuide';

export type ChestPhase = 'idle' | 'anticipation' | 'impact' | 'settle';

const lidAnimationByPhase: Record<ChestPhase, any> = {
  idle: { rotateX: [-108, -112, -108], y: -10 },
  anticipation: { rotateX: [-108, -103, -108], x: [0, -2, 2, 0] },
  impact: { rotateX: -20, y: -14, x: 0 },
  settle: { rotateX: -50, y: -8, x: 0 },
};

const transitionByPhase: Record<ChestPhase, any> = {
  idle: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
  anticipation: { duration: 0.25, repeat: 2, ease: 'easeInOut' },
  impact: { type: 'spring', bounce: 0.35, duration: 0.35 },
  settle: { duration: 0.8, ease: 'easeOut' },
};

export function ChestShell({ phase, children }: { phase: ChestPhase; children?: React.ReactNode }) {
  return (
    <motion.div
      className="relative w-80 h-64 z-10"
      style={{ transformStyle: 'preserve-3d', transform: 'rotateX(15deg)' }}
      animate={{ y: [0, -4, 0], rotateZ: [0, 0.5, 0, -0.5, 0] }}
      transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        className="absolute -inset-8 pointer-events-none"
        animate={{ x: ['-6%', '6%', '-6%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
      />

      <motion.div
        animate={lidAnimationByPhase[phase]}
        transition={transitionByPhase[phase]}
        className="absolute top-0 w-full h-40 origin-bottom z-0"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg viewBox="0 0 320 160" className="w-full h-full drop-shadow-2xl overflow-visible">
          <path d="M20,150 C20,60 50,20 160,20 C270,20 300,60 300,150 Z" fill="#4A2500" stroke="#2D1600" strokeWidth={CHEST_STYLE_GUIDE.contourWidth} opacity="0.9" />
          <path d="M10,160 C10,50 40,10 160,10 C280,10 310,50 310,160 L300,150 C300,60 270,20 160,20 C50,20 20,60 20,150 Z" fill="#D4A017" stroke="#78350F" strokeWidth={CHEST_STYLE_GUIDE.contourWidth} />
        </svg>
      </motion.div>

      <div className="absolute bottom-0 w-full h-48 z-10">
        <svg viewBox="0 0 320 180" className="w-full h-full">
          <path d="M30,160 L290,160 L270,40 L50,40 Z" fill={CHEST_STYLE_GUIDE.materials.wood.shadow} />
          <path d="M40,150 L280,150 L260,50 L60,50 Z" fill="url(#magic-pool)" opacity="0.8" />
          <defs>
            <radialGradient id="magic-pool" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={CHEST_STYLE_GUIDE.materials.gem.highlight} stopOpacity="1" />
              <stop offset="50%" stopColor={CHEST_STYLE_GUIDE.materials.gem.base} stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4C1D95" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="absolute bottom-8 left-8 right-8 h-40 z-20" style={{ transform: 'rotateX(-15deg)' }}>
        {children}
      </div>

      <div className="absolute bottom-0 w-full h-32 z-30">
        <svg viewBox="0 0 320 140" className="w-full h-full drop-shadow-xl">
          <rect x="20" y="0" width="280" height="120" rx="14" fill={CHEST_STYLE_GUIDE.materials.wood.base} stroke="#5C2E00" strokeWidth={CHEST_STYLE_GUIDE.contourWidth} />
          <rect x="140" y="8" width="40" height="58" rx="8" fill={CHEST_STYLE_GUIDE.materials.metal.base} stroke="#78350F" strokeWidth={CHEST_STYLE_GUIDE.contourWidth} />
        </svg>
      </div>

      <motion.div
        className="absolute bottom-2 left-3 right-3 h-28 z-40 pointer-events-none"
        style={{ background: `linear-gradient(110deg, transparent 35%, ${CHEST_STYLE_GUIDE.materials.metal.sheen}66 50%, transparent 65%)` }}
        animate={{ x: ['-120%', '120%'] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
      />
    </motion.div>
  );
}
