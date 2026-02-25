import React from 'react';
import { motion } from 'motion/react';
import { CHEST_STYLE_GUIDE } from './chestStyleGuide';

export type ChestPhase = 'idle' | 'anticipation' | 'impact' | 'settle';

const lidAnimationByPhase: Record<ChestPhase, any> = {
  idle: { rotateX: [-106, -112, -106], y: -12 },
  anticipation: { rotateX: [-106, -101, -106], x: [0, -2, 2, 0] },
  impact: { rotateX: -18, y: -15, x: 0 },
  settle: { rotateX: -46, y: -9, x: 0 },
};

const transitionByPhase: Record<ChestPhase, any> = {
  idle: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
  anticipation: { duration: 0.24, repeat: 2, ease: 'easeInOut' },
  impact: { type: 'spring', bounce: 0.32, duration: 0.35 },
  settle: { duration: 0.8, ease: 'easeOut' },
};

export function ChestShell({ phase, children }: { phase: ChestPhase; children?: React.ReactNode }) {
  return (
    <motion.div
      className="relative w-80 h-64 z-10"
      style={{ transformStyle: 'preserve-3d', transform: 'rotateX(15deg)' }}
      animate={{ y: [0, -5, 0], rotateZ: [0, 0.6, 0, -0.6, 0] }}
      transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        className="absolute -inset-10 pointer-events-none"
        animate={{ x: ['-8%', '8%', '-8%'] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.16) 47%, rgba(255,255,255,0.08) 52%, transparent 66%)',
        }}
      />

      <motion.div
        animate={lidAnimationByPhase[phase]}
        transition={transitionByPhase[phase]}
        className="absolute top-0 w-full h-40 origin-bottom z-0"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg viewBox="0 0 320 160" className="w-full h-full drop-shadow-2xl overflow-visible">
          <defs>
            <linearGradient id="lidWood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHEST_STYLE_GUIDE.materials.wood.highlight} />
              <stop offset="55%" stopColor={CHEST_STYLE_GUIDE.materials.wood.base} />
              <stop offset="100%" stopColor={CHEST_STYLE_GUIDE.materials.wood.shadow} />
            </linearGradient>
            <linearGradient id="lidMetal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={CHEST_STYLE_GUIDE.materials.metal.shadow} />
              <stop offset="35%" stopColor={CHEST_STYLE_GUIDE.materials.metal.base} />
              <stop offset="60%" stopColor={CHEST_STYLE_GUIDE.materials.metal.highlight} />
              <stop offset="100%" stopColor={CHEST_STYLE_GUIDE.materials.metal.shadow} />
            </linearGradient>
          </defs>

          <path
            d="M20,150 C20,60 50,20 160,20 C270,20 300,60 300,150 Z"
            fill="url(#lidWood)"
            stroke={CHEST_STYLE_GUIDE.materials.wood.deepShadow}
            strokeWidth={CHEST_STYLE_GUIDE.contourWidth}
          />
          <path
            d="M10,160 C10,50 40,10 160,10 C280,10 310,50 310,160 L298,150 C298,62 270,24 160,24 C50,24 22,62 22,150 Z"
            fill="url(#lidMetal)"
            stroke={CHEST_STYLE_GUIDE.materials.metal.shadow}
            strokeWidth={CHEST_STYLE_GUIDE.contourWidth}
          />
          <path d="M42,148 C58,74 88,44 160,44 C232,44 262,74 278,148" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={5} />
          {[42, 98, 160, 222, 278].map((x) => (
            <circle key={x} cx={x} cy={146} r={4.8} fill={CHEST_STYLE_GUIDE.materials.metal.highlight} stroke={CHEST_STYLE_GUIDE.materials.metal.shadow} strokeWidth={2} />
          ))}
        </svg>
      </motion.div>

      <div className="absolute bottom-0 w-full h-48 z-10">
        <svg viewBox="0 0 320 180" className="w-full h-full">
          <defs>
            <radialGradient id="magic-pool" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor={CHEST_STYLE_GUIDE.materials.gem.highlight} stopOpacity="1" />
              <stop offset="48%" stopColor={CHEST_STYLE_GUIDE.materials.gem.base} stopOpacity="0.64" />
              <stop offset="100%" stopColor={CHEST_STYLE_GUIDE.materials.gem.shadow} stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M30,160 L290,160 L270,40 L50,40 Z" fill={CHEST_STYLE_GUIDE.materials.wood.deepShadow} />
          <path d="M40,150 L280,150 L260,50 L60,50 Z" fill="url(#magic-pool)" opacity="0.92" />
        </svg>
      </div>

      <div className="absolute bottom-8 left-8 right-8 h-40 z-20" style={{ transform: 'rotateX(-15deg)' }}>
        {children}
      </div>

      <div className="absolute bottom-0 w-full h-32 z-30">
        <svg viewBox="0 0 320 140" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id="bodyWood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHEST_STYLE_GUIDE.materials.wood.highlight} />
              <stop offset="45%" stopColor={CHEST_STYLE_GUIDE.materials.wood.base} />
              <stop offset="100%" stopColor={CHEST_STYLE_GUIDE.materials.wood.shadow} />
            </linearGradient>
            <linearGradient id="bodyMetal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={CHEST_STYLE_GUIDE.materials.metal.shadow} />
              <stop offset="30%" stopColor={CHEST_STYLE_GUIDE.materials.metal.base} />
              <stop offset="60%" stopColor={CHEST_STYLE_GUIDE.materials.metal.highlight} />
              <stop offset="100%" stopColor={CHEST_STYLE_GUIDE.materials.metal.shadow} />
            </linearGradient>
          </defs>

          <rect x="20" y="0" width="280" height="120" rx="14" fill="url(#bodyWood)" stroke={CHEST_STYLE_GUIDE.materials.wood.deepShadow} strokeWidth={CHEST_STYLE_GUIDE.contourWidth} />
          {[60, 120, 180, 240].map((x) => (
            <line key={x} x1={x} y1="6" x2={x} y2="114" stroke="rgba(38,18,6,0.45)" strokeWidth={3.5} />
          ))}

          <rect x="16" y="4" width="12" height="112" rx="4" fill="url(#bodyMetal)" stroke={CHEST_STYLE_GUIDE.materials.metal.shadow} strokeWidth={2} />
          <rect x="292" y="4" width="12" height="112" rx="4" fill="url(#bodyMetal)" stroke={CHEST_STYLE_GUIDE.materials.metal.shadow} strokeWidth={2} />
          <rect x="140" y="8" width="40" height="58" rx="8" fill="url(#bodyMetal)" stroke={CHEST_STYLE_GUIDE.materials.metal.shadow} strokeWidth={CHEST_STYLE_GUIDE.contourWidth} />
          <rect x="153" y="28" width="14" height="24" rx="6" fill="#0F172A" stroke={CHEST_STYLE_GUIDE.materials.metal.highlight} strokeWidth={2.5} />

          {[24, 296].map((x) => (
            <g key={`stud-column-${x}`}>
              <circle cx={x} cy={12} r={3.8} fill={CHEST_STYLE_GUIDE.materials.metal.highlight} stroke={CHEST_STYLE_GUIDE.materials.metal.shadow} strokeWidth={1.8} />
              <circle cx={x} cy={58} r={3.8} fill={CHEST_STYLE_GUIDE.materials.metal.highlight} stroke={CHEST_STYLE_GUIDE.materials.metal.shadow} strokeWidth={1.8} />
              <circle cx={x} cy={108} r={3.8} fill={CHEST_STYLE_GUIDE.materials.metal.highlight} stroke={CHEST_STYLE_GUIDE.materials.metal.shadow} strokeWidth={1.8} />
            </g>
          ))}
        </svg>
      </div>

      <motion.div
        className="absolute bottom-2 left-3 right-3 h-28 z-40 pointer-events-none"
        style={{
          background: `linear-gradient(112deg, transparent 34%, ${CHEST_STYLE_GUIDE.materials.metal.sheen}88 50%, transparent 67%)`,
        }}
        animate={{ x: ['-120%', '120%'] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
      />
    </motion.div>
  );
}
