import React from 'react';
import { motion } from 'motion/react';
import { CHEST_STYLE_GUIDE } from './chestStyleGuide';

export type ChestPhase = 'idle' | 'anticipation' | 'impact' | 'settle';

const lidAnimationByPhase: Record<ChestPhase, any> = {
  idle: { rotateX: [-104, -110, -104], y: -9 },
  anticipation: { rotateX: [-104, -98, -104], x: [0, -2, 2, 0] },
  impact: { rotateX: -14, y: -14, x: 0 },
  settle: { rotateX: -40, y: -8, x: 0 },
};

const transitionByPhase: Record<ChestPhase, any> = {
  idle: { duration: 3.1, repeat: Infinity, ease: 'easeInOut' },
  anticipation: { duration: 0.22, repeat: 2, ease: 'easeInOut' },
  impact: { type: 'spring', bounce: 0.34, duration: 0.34 },
  settle: { duration: 0.75, ease: 'easeOut' },
};

export function ChestShell({ phase, children }: { phase: ChestPhase; children?: React.ReactNode }) {
  return (
    <motion.div
      className="relative w-[22rem] h-[18rem] z-10"
      style={{ transformStyle: 'preserve-3d', transform: 'rotateX(11deg)' }}
      animate={{ y: [0, -5, 0], rotateZ: [0, 0.5, 0, -0.5, 0] }}
      transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        className="absolute -inset-10 pointer-events-none"
        animate={{ x: ['-10%', '10%', '-10%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 47%, rgba(255,255,255,0.1) 52%, transparent 66%)',
        }}
      />

      <motion.div
        animate={lidAnimationByPhase[phase]}
        transition={transitionByPhase[phase]}
        className="absolute top-0 w-full h-44 origin-bottom z-40"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg viewBox="0 0 360 170" className="w-full h-full drop-shadow-2xl overflow-visible">
          <defs>
            <linearGradient id="lidWood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D9A36B" />
              <stop offset="58%" stopColor={CHEST_STYLE_GUIDE.materials.wood.base} />
              <stop offset="100%" stopColor="#311003" />
            </linearGradient>
            <linearGradient id="lidMetal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8F5A1A" />
              <stop offset="40%" stopColor="#EEC669" />
              <stop offset="62%" stopColor="#FFF1BF" />
              <stop offset="100%" stopColor="#7A4A10" />
            </linearGradient>
            <radialGradient id="lidGlow" cx="50%" cy="35%" r="75%">
              <stop offset="0%" stopColor="rgba(255,245,210,0.45)" />
              <stop offset="100%" stopColor="rgba(255,245,210,0)" />
            </radialGradient>
          </defs>

          <path
            d="M28,158 C28,58 58,20 180,20 C302,20 332,58 332,158 Z"
            fill="url(#lidWood)"
            stroke={CHEST_STYLE_GUIDE.materials.wood.deepShadow}
            strokeWidth={CHEST_STYLE_GUIDE.contourWidth}
          />
          <path d="M38,156 C51,86 84,48 180,48 C276,48 309,86 322,156" fill="none" stroke="rgba(255,245,215,0.28)" strokeWidth={5} />
          <path
            d="M18,166 C18,49 49,10 180,10 C311,10 342,49 342,166 L328,156 C328,60 300,24 180,24 C60,24 32,60 32,156 Z"
            fill="url(#lidMetal)"
            stroke="#6B3E12"
            strokeWidth={CHEST_STYLE_GUIDE.contourWidth}
          />
          <ellipse cx="180" cy="78" rx="110" ry="48" fill="url(#lidGlow)" />
          {[58, 112, 180, 248, 302].map((x) => (
            <circle key={x} cx={x} cy={152} r={5.2} fill="#FFE39A" stroke="#6B3E12" strokeWidth={2} />
          ))}
        </svg>
      </motion.div>

      <div className="absolute bottom-[4.15rem] left-[1.3rem] right-[1.3rem] h-36 z-20" style={{ transform: 'rotateX(-8deg)' }}>
        <svg viewBox="0 0 320 120" className="w-full h-full pointer-events-none">
          <defs>
            <radialGradient id="innerGlow" cx="50%" cy="55%" r="60%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.62" />
              <stop offset="45%" stopColor={CHEST_STYLE_GUIDE.materials.gem.base} stopOpacity="0.42" />
              <stop offset="100%" stopColor={CHEST_STYLE_GUIDE.materials.gem.shadow} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="innerWood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5D2C11" />
              <stop offset="100%" stopColor="#2B1005" />
            </linearGradient>
          </defs>
          <path d="M18,102 L302,102 L278,24 L42,24 Z" fill="url(#innerWood)" />
          <ellipse cx="160" cy="60" rx="108" ry="45" fill="url(#innerGlow)" />
        </svg>
      </div>

      <div className="absolute bottom-[4.3rem] left-[1.55rem] right-[1.55rem] h-36 z-30" style={{ transform: 'rotateX(-12deg)' }}>
        {children}
      </div>

      <div className="absolute bottom-0 w-full h-40 z-50">
        <svg viewBox="0 0 360 170" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id="bodyWood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D09A60" />
              <stop offset="45%" stopColor={CHEST_STYLE_GUIDE.materials.wood.base} />
              <stop offset="100%" stopColor="#2B0E03" />
            </linearGradient>
            <linearGradient id="bodyMetal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6E420F" />
              <stop offset="30%" stopColor="#D8AB49" />
              <stop offset="65%" stopColor="#FFE6A6" />
              <stop offset="100%" stopColor="#7A4A10" />
            </linearGradient>
          </defs>

          <rect x="24" y="8" width="312" height="134" rx="18" fill="url(#bodyWood)" stroke="#2F1206" strokeWidth={3} />
          {[72, 126, 180, 234, 288].map((x) => (
            <line key={x} x1={x} y1="16" x2={x} y2="136" stroke="rgba(35,12,3,0.44)" strokeWidth={3.5} />
          ))}

          <rect x="20" y="14" width="15" height="122" rx="5" fill="url(#bodyMetal)" stroke="#6B3E12" strokeWidth={2} />
          <rect x="325" y="14" width="15" height="122" rx="5" fill="url(#bodyMetal)" stroke="#6B3E12" strokeWidth={2} />

          <rect x="148" y="16" width="64" height="70" rx="10" fill="url(#bodyMetal)" stroke="#6B3E12" strokeWidth={3} />
          <rect x="170" y="40" width="20" height="30" rx="8" fill="#111827" stroke="#FFE4A2" strokeWidth={2.4} />

          {[28, 332].map((x) => (
            <g key={x}>
              <circle cx={x} cy={24} r={4} fill="#FFE39A" stroke="#6B3E12" strokeWidth={1.8} />
              <circle cx={x} cy={70} r={4} fill="#FFE39A" stroke="#6B3E12" strokeWidth={1.8} />
              <circle cx={x} cy={126} r={4} fill="#FFE39A" stroke="#6B3E12" strokeWidth={1.8} />
            </g>
          ))}

          <path d="M26 136 Q180 168 334 136" fill="none" stroke="rgba(0,0,0,0.24)" strokeWidth={6} />
        </svg>
      </div>

      <motion.div
        className="absolute bottom-3 left-4 right-4 h-24 z-[60] pointer-events-none"
        style={{
          background: `linear-gradient(112deg, transparent 34%, ${CHEST_STYLE_GUIDE.materials.metal.sheen}88 50%, transparent 67%)`,
        }}
        animate={{ x: ['-120%', '120%'] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
      />
    </motion.div>
  );
}
