import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ChestProgress } from '../../lib/chestProgress';

type TreasureChestProps = {
  progress: ChestProgress;
  latestItem: number | null;
};

type GemColor = {
  base: string;
  dark: string;
  light: string;
};

const GEM_COLORS: GemColor[] = [
  { base: '#ef4444', dark: '#991b1b', light: '#fecaca' },
  { base: '#3b82f6', dark: '#1e3a8a', light: '#bfdbfe' },
  { base: '#10b981', dark: '#14532d', light: '#bbf7d0' },
  { base: '#a855f7', dark: '#581c87', light: '#e9d5ff' },
  { base: '#f59e0b', dark: '#78350f', light: '#fef3c7' },
];

const GemPileToken: React.FC<{ index: number; latestItem: number | null; filled: number }> = ({ index, latestItem, filled }) => {
  const color = GEM_COLORS[index % GEM_COLORS.length];
  const x = -52 + (index % 5) * 26 + (Math.floor(index / 5) % 2) * 8;
  const y = 12 - Math.floor(index / 5) * 15;
  const isNewest = latestItem === index && filled > 0;

  return (
    <motion.g
      initial={isNewest ? { y: -120, opacity: 0, scale: 0.6 } : { y: 0, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={
        isNewest
          ? { type: 'spring', damping: 12, stiffness: 260, mass: 0.7 }
          : { duration: 0.28, delay: index * 0.03 }
      }
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    >
      <g transform={`translate(${x} ${y})`}>
        <polygon points="0,-13 12,-4 8,11 -8,11 -12,-4" fill={color.base} stroke={color.dark} strokeWidth="1.8" />
        <polygon points="0,-13 12,-4 0,0" fill={color.light} opacity="0.65" />
        <polygon points="0,0 12,-4 8,11" fill={color.dark} opacity="0.36" />
        <polygon points="0,0 -12,-4 -8,11" fill={color.light} opacity="0.3" />
        <ellipse cx="-3.3" cy="-5.1" rx="3.6" ry="2.2" fill="white" opacity="0.48" />
      </g>
    </motion.g>
  );
};

function MiniChestIcon({ highlight }: { highlight: boolean }) {
  return (
    <div
      className={`relative w-10 h-8 rounded-md border-2 ${highlight ? 'border-yellow-200 shadow-[0_0_16px_rgba(250,204,21,0.75)]' : 'border-amber-800'} bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800`}
    >
      <div className="absolute -top-3 left-0 right-0 h-4 rounded-t-md border-2 border-amber-900 bg-gradient-to-b from-amber-300 to-amber-700" />
      <div className="absolute left-1 right-1 top-3 h-[3px] rounded-full bg-amber-900/60" />
      <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-2 h-2.5 rounded-full bg-zinc-800 border border-yellow-100/40" />
    </div>
  );
}

export function TreasureChest({ progress, latestItem }: TreasureChestProps) {
  const [burstActive, setBurstActive] = useState(false);
  const [snapShut, setSnapShut] = useState(false);
  const prevChestCount = useRef(progress.totalChests);

  const filled = (progress as ChestProgress & { filled?: number }).filled ?? progress.itemsCount;
  const total = (progress as ChestProgress & { total?: number }).total ?? 10;
  const fillRatio = total === 0 ? 0 : filled / total;
  const lidAngle = useMemo(() => {
    if (burstActive) return -96;
    if (fillRatio >= 0.8) return -72;
    return -12 - fillRatio * 24;
  }, [burstActive, fillRatio]);

  useEffect(() => {
    if (progress.totalChests > prevChestCount.current) {
      setBurstActive(true);
      confetti({
        particleCount: 180,
        spread: 125,
        startVelocity: 52,
        origin: { y: 0.58 },
        colors: ['#fde047', '#a855f7', '#60a5fa', '#34d399', '#ffffff'],
      });

      const settleTimer = setTimeout(() => {
        setBurstActive(false);
        setSnapShut(true);
      }, 980);
      const snapTimer = setTimeout(() => setSnapShut(false), 1320);

      prevChestCount.current = progress.totalChests;
      return () => {
        clearTimeout(settleTimer);
        clearTimeout(snapTimer);
      };
    }

    prevChestCount.current = progress.totalChests;
    return undefined;
  }, [progress.totalChests]);

  const visibleChestHistory = Math.min(progress.totalChests, 6);

  return (
    <div className="relative w-full max-w-xl mx-auto mt-8 h-[23rem] flex items-end justify-center overflow-visible">
      <motion.svg
        viewBox="0 0 420 290"
        className="w-[20rem] md:w-[24rem] drop-shadow-[0_28px_36px_rgba(0,0,0,0.45)]"
        animate={snapShut ? { scaleX: [1.02, 0.95, 1], y: [0, 7, 0] } : { scaleX: 1, y: 0 }}
        transition={{ duration: 0.36 }}
      >
        <defs>
          <linearGradient id="woodFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b97433" />
            <stop offset="50%" stopColor="#8f4f1f" />
            <stop offset="100%" stopColor="#6f3b17" />
          </linearGradient>
          <linearGradient id="woodTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d5964e" />
            <stop offset="100%" stopColor="#8a4f1d" />
          </linearGradient>
          <linearGradient id="woodDepth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#603114" />
            <stop offset="100%" stopColor="#3f1f0c" />
          </linearGradient>
          <linearGradient id="brass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe9a1" />
            <stop offset="45%" stopColor="#cb9b35" />
            <stop offset="100%" stopColor="#77521d" />
          </linearGradient>
          <radialGradient id="innerGlow" cx="50%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity={0.3 + fillRatio * 0.55} />
            <stop offset="55%" stopColor="#c084fc" stopOpacity={0.22 + fillRatio * 0.45} />
            <stop offset="100%" stopColor="#581c87" stopOpacity="0" />
          </radialGradient>
          <pattern id="woodGrain" width="18" height="18" patternUnits="userSpaceOnUse">
            <rect width="18" height="18" fill="transparent" />
            <path d="M-1 4 C4 0, 9 8, 19 4" stroke="#74411b" strokeOpacity="0.42" strokeWidth="1.3" fill="none" />
            <path d="M-2 11 C5 8, 9 16, 20 12" stroke="#c7833f" strokeOpacity="0.3" strokeWidth="1" fill="none" />
            <path d="M-2 16 C4 13, 11 19, 22 16" stroke="#5a2f14" strokeOpacity="0.24" strokeWidth="0.9" fill="none" />
          </pattern>
          <radialGradient id="shadowFloor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="210" cy="260" rx="140" ry="24" fill="url(#shadowFloor)" />

        <g>
          <path d="M112 118 L308 118 L286 224 L134 224 Z" fill="url(#woodDepth)" />
          <rect x="98" y="104" width="224" height="116" rx="14" fill="url(#woodFront)" stroke="#4b250f" strokeWidth="6" />
          <rect x="98" y="104" width="224" height="116" rx="14" fill="url(#woodGrain)" opacity="0.7" />

          <rect x="116" y="112" width="188" height="18" rx="7" fill="url(#brass)" stroke="#6f4b13" strokeWidth="3" />
          <rect x="116" y="172" width="188" height="18" rx="7" fill="url(#brass)" stroke="#6f4b13" strokeWidth="3" />

          {[126, 168, 252, 294].map((x) => (
            <g key={`rivet-${x}`}>
              <circle cx={x} cy="122" r="3.8" fill="#f8d271" stroke="#6f4b13" strokeWidth="1.2" />
              <circle cx={x} cy="182" r="3.8" fill="#f8d271" stroke="#6f4b13" strokeWidth="1.2" />
            </g>
          ))}

          <rect x="194" y="137" width="32" height="44" rx="8" fill="url(#brass)" stroke="#5e3d14" strokeWidth="3" />
          <path d="M210 149 C205 149 201 153 201 158 C201 162 203 164 206 166 L206 172 L214 172 L214 166 C217 164 219 162 219 158 C219 153 215 149 210 149 Z" fill="#3f2b12" />

          <rect x="102" y="98" width="14" height="124" rx="6" fill="url(#brass)" stroke="#6f4b13" strokeWidth="3" />
          <rect x="304" y="98" width="14" height="124" rx="6" fill="url(#brass)" stroke="#6f4b13" strokeWidth="3" />
        </g>

        <g transform="translate(210 122)">
          <ellipse cx="0" cy="-2" rx="78" ry="36" fill="url(#innerGlow)" />
          {Array.from({ length: filled }).map((_, index) => (
            <GemPileToken key={`gem-${progress.totalChests}-${index}`} index={index} latestItem={latestItem} filled={filled} />
          ))}
        </g>

        <motion.g
          animate={{ rotate: lidAngle }}
          transition={burstActive ? { type: 'spring', stiffness: 190, damping: 12 } : { type: 'spring', stiffness: 130, damping: 16 }}
          style={{ transformBox: 'fill-box', transformOrigin: '104px 112px' }}
        >
          <path d="M88 106 C92 68 124 40 168 32 L244 32 C288 40 320 68 324 106 Z" fill="url(#woodTop)" stroke="#4b250f" strokeWidth="6" />
          <path d="M88 106 C92 68 124 40 168 32 L244 32 C288 40 320 68 324 106" fill="url(#woodGrain)" opacity="0.65" />
          <rect x="112" y="82" width="188" height="16" rx="7" fill="url(#brass)" stroke="#6f4b13" strokeWidth="3" />
          {[126, 168, 252, 294].map((x) => (
            <circle key={`lid-rivet-${x}`} cx={x} cy="90" r="3.8" fill="#f8d271" stroke="#6f4b13" strokeWidth="1.2" />
          ))}
        </motion.g>

        <AnimatePresence>
          {burstActive && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {Array.from({ length: 10 }).map((_, idx) => {
                const angle = (idx / 10) * Math.PI * 2;
                const x2 = 210 + Math.cos(angle) * 118;
                const y2 = 116 + Math.sin(angle) * 96;
                return (
                  <motion.line
                    key={`ray-${idx}`}
                    x1="210"
                    y1="116"
                    x2={x2}
                    y2={y2}
                    stroke="#fef08a"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: [0, 1, 0], pathLength: [0, 1, 0.6] }}
                    transition={{ duration: 0.62, delay: idx * 0.03 }}
                  />
                );
              })}
            </motion.g>
          )}
        </AnimatePresence>
      </motion.svg>

      <motion.div
        animate={burstActive ? { scale: [1, 1.18, 1], rotate: [0, -10, 8, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.85 }}
        className="absolute top-0 right-0 md:-right-5 bg-gradient-to-br from-purple-600 via-indigo-700 to-indigo-950 px-5 py-3 rounded-3xl font-black text-white shadow-[0_20px_40px_rgba(76,29,149,0.55)] border-4 border-yellow-400 flex items-center gap-3 z-50"
      >
        <MiniChestIcon highlight={burstActive} />
        <span className="text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">x {progress.totalChests}</span>
      </motion.div>

      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-[70] bg-slate-900/70 backdrop-blur-sm border border-slate-200/20 rounded-2xl px-4 py-2 flex items-end gap-2 shadow-xl">
        {Array.from({ length: visibleChestHistory }).map((_, i) => (
          <motion.div
            key={`mini-history-${i}`}
            initial={i === visibleChestHistory - 1 ? { y: 10, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
          >
            <MiniChestIcon highlight={i === visibleChestHistory - 1 && burstActive} />
          </motion.div>
        ))}
        {progress.totalChests > visibleChestHistory && (
          <span className="text-sm font-bold text-white/90 pl-1">+{progress.totalChests - visibleChestHistory}</span>
        )}
      </div>
    </div>
  );
}
