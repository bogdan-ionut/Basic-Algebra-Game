import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ChestProgress } from '../../lib/chestProgress';

type TreasureChestProps = {
  progress: ChestProgress;
  latestItem: number | null;
};

type GemPalette = {
  base: string;
  dark: string;
  light: string;
};

const GEM_COLORS: GemPalette[] = [
  { base: '#00e5ff', dark: '#0088a0', light: '#b8f9ff' },
  { base: '#ff00cc', dark: '#93006f', light: '#ffc2f2' },
  { base: '#ffd700', dark: '#9b7f00', light: '#fff2aa' },
  { base: '#00ff88', dark: '#008f51', light: '#baffdf' },
  { base: '#cc44ff', dark: '#6c1c90', light: '#efc7ff' },
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

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

const GemShape: React.FC<{ x: number; y: number; size: number; colorId: number; sparkle?: boolean }> = ({ x, y, size, colorId, sparkle = false }) => {
  const color = GEM_COLORS[colorId % GEM_COLORS.length];
  const h = size;
  const w = size * 0.8;

  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={`gemGrad-${x}-${y}-${colorId}`} cx="50%" cy="42%" r="70%">
          <stop offset="0%" stopColor={color.light} />
          <stop offset="55%" stopColor={color.base} />
          <stop offset="100%" stopColor={color.dark} />
        </radialGradient>
      </defs>
      <polygon
        points={`${-w},0 ${-w * 0.35},${-h * 0.6} ${w * 0.35},${-h * 0.6} ${w},0 ${w * 0.35},${h * 0.6} ${-w * 0.35},${h * 0.6}`}
        fill={`url(#gemGrad-${x}-${y}-${colorId})`}
        stroke={color.dark}
        strokeWidth="1"
      />
      <polygon points={`${-w * 0.35},${-h * 0.6} 0,0 ${w * 0.35},${-h * 0.6}`} fill="white" opacity="0.18" />
      <ellipse cx={-w * 0.2} cy={-h * 0.2} rx={w * 0.2} ry={h * 0.12} fill="white" opacity="0.6" />
      {sparkle && <circle cx={w * 0.95} cy={-h * 0.65} r="1.5" fill="white" opacity="0.7" />}
    </g>
  );
};

export function TreasureChest({ progress, latestItem }: TreasureChestProps) {
  const prevLatestRef = useRef<number | null>(null);
  const prevFillRatioRef = useRef(0);

  const [pendingGem, setPendingGem] = useState(false);
  const [burstActive, setBurstActive] = useState(false);
  const [snapShut, setSnapShut] = useState(false);
  const [hideGems, setHideGems] = useState(false);

  const filled = (progress as ChestProgress & { filled?: number }).filled ?? progress.itemsCount;
  const total = (progress as ChestProgress & { total?: number }).total ?? 10;
  const chestCount = (progress as ChestProgress & { chestCount?: number }).chestCount ?? progress.totalChests;
  const fillRatio = total === 0 ? 0 : clamp(filled / total, 0, 1);

  useEffect(() => {
    if (latestItem !== null && latestItem !== prevLatestRef.current && filled > 0) {
      setPendingGem(true);
      const timer = setTimeout(() => setPendingGem(false), 720);
      prevLatestRef.current = latestItem;
      return () => clearTimeout(timer);
    }
    prevLatestRef.current = latestItem;
    return undefined;
  }, [latestItem, filled]);

  useEffect(() => {
    const justCompleted = prevFillRatioRef.current < 1 && fillRatio >= 1;
    prevFillRatioRef.current = fillRatio;

    if (!justCompleted) {
      if (fillRatio < 1) {
        setHideGems(false);
      }
      return undefined;
    }

    setBurstActive(true);
    setSnapShut(false);
    setHideGems(false);

    confetti({
      particleCount: 170,
      spread: 122,
      startVelocity: 48,
      origin: { x: 0.5, y: 0.42 },
      colors: ['#ffd700', '#cc44ff', '#00e5ff'],
    });

    const closeTimer = setTimeout(() => {
      setSnapShut(true);
      setHideGems(true);
    }, 1500);

    const resetTimer = setTimeout(() => {
      setBurstActive(false);
      setSnapShut(false);
      setPendingGem(false);
    }, 2050);

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(resetTimer);
    };
  }, [fillRatio]);

  const lidAngle = useMemo(() => {
    if (snapShut) return 0;
    if (burstActive) return -80;
    return -70 * fillRatio;
  }, [fillRatio, burstActive, snapShut]);

  const pileLevel = hideGems ? 0 : 6 + fillRatio * 34;
  const visibleGemCount = hideGems ? 0 : Math.min(15, Math.max(0, Math.round(filled + fillRatio * 5) - (pendingGem ? 1 : 0)));
  const glowOpacity = fillRatio <= 0 ? 0 : 0.25 + fillRatio * 0.75;
  const historyCount = Math.min(chestCount, 6);
  const rightFacePath = 'M142 92 L165 108 L165 170 L142 154 Z';

  const gems = Array.from({ length: visibleGemCount }).map((_, index) => {
    const t = index / Math.max(1, visibleGemCount - 1);
    const ang = t * Math.PI * 2.2;
    const radiusX = 42 - (index % 3) * 7;
    const radiusY = 16 + (index % 4) * 3;
    const x = 97 + Math.cos(ang) * radiusX + (index % 2 ? 5 : -4);
    const y = 106 - pileLevel + Math.sin(ang) * radiusY + (index % 3) * 2;
    const size = 5.8 + (index % 4) * 1.5;
    return <GemShape key={`pile-gem-${index}`} x={x} y={y} size={size} colorId={index} sparkle />;
  });

  const overflowGems = fillRatio > 0.8 && !hideGems
    ? [
        { x: 56, y: 178, size: 7.5, colorId: 1 },
        { x: 138, y: 182, size: 7.2, colorId: 2 },
        { x: 152, y: 173, size: 6.7, colorId: 0 },
      ]
    : [];

  return (
    <div className="relative w-full max-w-xl mx-auto mt-8 h-[23rem] flex items-end justify-center overflow-visible">
      <motion.svg
        viewBox="0 0 200 220"
        className="w-48 h-52 md:w-[12.5rem] md:h-[13.5rem] overflow-visible"
        animate={snapShut ? { y: [0, 7, -2, 0], scaleY: [1, 0.93, 1] } : { y: 0, scaleY: 1 }}
        transition={{ duration: 0.45 }}
      >
        <defs>
          <linearGradient id="woodBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6b3518" />
            <stop offset="100%" stopColor="#3d1f0a" />
          </linearGradient>
          <linearGradient id="woodSide" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5d2b12" />
            <stop offset="100%" stopColor="#2f1608" />
          </linearGradient>
          <linearGradient id="metalBand" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f0c040" />
            <stop offset="100%" stopColor="#c8922a" />
          </linearGradient>
          <linearGradient id="lidWood" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#85502a" />
            <stop offset="100%" stopColor="#4d2711" />
          </linearGradient>
          <radialGradient id="insideGlow" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity={glowOpacity} />
            <stop offset="55%" stopColor="#cc44ff" stopOpacity={glowOpacity * 0.7} />
            <stop offset="100%" stopColor="#cc44ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="dropShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(255,255,210,0.8)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        <ellipse cx="100" cy="194" rx="66" ry="13" fill="url(#dropShadow)" />

        <path d="M50 98 L142 98 L142 170 L44 176 Z" fill="url(#woodBody)" stroke="#2e1608" strokeWidth="2.3" />
        <path d={rightFacePath} fill="url(#woodSide)" stroke="#241106" strokeWidth="2" />

        {[112, 126, 140, 154].map((y) => (
          <line key={`plank-${y}`} x1="49" y1={y} x2="141" y2={y - 2} stroke="#a46839" strokeOpacity="0.38" strokeWidth="1.2" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={`grain-${i}`}
            x1={53 + i * 8}
            y1="102"
            x2={53 + i * 8 + (i % 2 ? 3 : -2)}
            y2="173"
            stroke="#f0c894"
            strokeOpacity="0.1"
            strokeWidth="1"
          />
        ))}

        {[74, 113].map((x) => (
          <g key={`band-${x}`}>
            <rect x={x} y="99" width="10" height="74" fill="url(#metalBand)" stroke="#8a5e1f" strokeWidth="1.5" />
            {Array.from({ length: 5 }).map((_, n) => (
              <circle key={`rivet-${x}-${n}`} cx={x + 5} cy={105 + n * 15} r="1.8" fill="#f8dc7a" stroke="#7f561a" strokeWidth="0.8" />
            ))}
          </g>
        ))}

        <rect x="92" y="125" width="16" height="22" rx="3" fill="url(#metalBand)" stroke="#815818" strokeWidth="1.2" />
        <path d="M100 131 C97.5 131 95.7 133 95.7 135.3 C95.7 137.1 96.8 138.5 98.3 139.2 L98.3 142.8 L101.7 142.8 L101.7 139.2 C103.2 138.5 104.3 137.1 104.3 135.3 C104.3 133 102.5 131 100 131 Z" fill="#3f2a10" />

        <path d="M50 96 L142 96 L165 112 L72 112 Z" fill="url(#metalBand)" stroke="#7d551d" strokeWidth="2" />

        <ellipse cx="104" cy="111" rx="44" ry="17" fill="#2c160a" opacity="0.92" />
        <motion.ellipse
          cx="104"
          cy="111"
          rx="45"
          ry="18"
          fill="url(#insideGlow)"
          animate={fillRatio >= 1 && !hideGems ? { opacity: [0.6, 1, 0.6] } : { opacity: glowOpacity }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <g>{gems}</g>

        <AnimatePresence>
          {pendingGem && !hideGems && (
            <motion.g
              initial={{ x: 101, y: 36, scale: 0.9 }}
              animate={{ x: 100, y: 108, scale: [1.3, 0.9, 1] }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <GemShape x={0} y={0} size={9} colorId={filled + 1} sparkle />
              {Array.from({ length: 4 }).map((_, i) => {
                const angle = (i / 4) * Math.PI * 2;
                return (
                  <motion.path
                    key={`spawn-spark-${i}`}
                    d="M0 -4 L1 0 L0 4 L-1 0 Z"
                    fill="white"
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{ x: Math.cos(angle) * 9, y: Math.sin(angle) * 9, opacity: [0, 1, 0] }}
                    transition={{ duration: 0.4, delay: 0.24 + i * 0.05 }}
                  />
                );
              })}
            </motion.g>
          )}
        </AnimatePresence>

        <motion.g
          animate={{ rotate: lidAngle }}
          transition={burstActive ? { type: 'spring', stiffness: 230, damping: 10 } : { type: 'spring', stiffness: 140, damping: 16 }}
          style={{ transformBox: 'fill-box', transformOrigin: '146px 98px' }}
        >
          <circle cx="120" cy="98" r="3" fill="#c8922a" stroke="#75521c" strokeWidth="1" />
          <circle cx="140" cy="102" r="3" fill="#c8922a" stroke="#75521c" strokeWidth="1" />
          <path d="M52 96 C58 70 82 52 118 50 C145 50 162 64 168 90 L165 112 L72 112 Z" fill="url(#lidWood)" stroke="#2d1608" strokeWidth="2.3" />
          <path d="M74 112 Q118 123 164 111 L161 119 Q117 130 73 119 Z" fill="#2a1408" opacity="0.82" />
          <rect x="77" y="82" width="8" height="29" fill="url(#metalBand)" stroke="#7f561a" strokeWidth="1.2" />
          <rect x="124" y="72" width="8" height="38" fill="url(#metalBand)" stroke="#7f561a" strokeWidth="1.2" />
        </motion.g>

        <AnimatePresence>
          {burstActive && !snapShut && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {Array.from({ length: 8 }).map((_, idx) => {
                const angle = (idx / 8) * Math.PI * 2;
                const x2 = 104 + Math.cos(angle) * 68;
                const y2 = 110 + Math.sin(angle) * 52;
                return (
                  <motion.line
                    key={`ray-${idx}`}
                    x1="104"
                    y1="110"
                    x2={x2}
                    y2={y2}
                    stroke="#f6db7a"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeDasharray="6 6"
                    initial={{ opacity: 0.2, strokeDashoffset: 0 }}
                    animate={{ opacity: [0.2, 1, 0], strokeDashoffset: [0, 100] }}
                    transition={{ duration: 0.6, delay: idx * 0.02 }}
                  />
                );
              })}
            </motion.g>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {burstActive && (
            <motion.rect
              initial={{ x: -120, opacity: 0 }}
              animate={{ x: 260, opacity: [0, 0.65, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              y="84"
              width="80"
              height="80"
              transform="rotate(-8 100 120)"
              fill="url(#shimmer)"
            />
          )}
        </AnimatePresence>

        {overflowGems.map((gem, i) => (
          <motion.g key={`overflow-gem-${i}`} animate={{ y: [0, -2.5, 0], opacity: [0.95, 1, 0.95] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}>
            <GemShape x={gem.x} y={gem.y} size={gem.size} colorId={gem.colorId} sparkle />
            <motion.path
              d={`M ${gem.x + 9} ${gem.y - 11} L ${gem.x + 10.5} ${gem.y - 7} L ${gem.x + 14} ${gem.y - 6} L ${gem.x + 10.5} ${gem.y - 5} L ${gem.x + 9} ${gem.y - 1} L ${gem.x + 7.5} ${gem.y - 5} L ${gem.x + 4} ${gem.y - 6} L ${gem.x + 7.5} ${gem.y - 7} Z`}
              fill="white"
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.1 + i * 0.25 }}
            />
          </motion.g>
        ))}
      </motion.svg>

      <motion.div
        animate={burstActive ? { scale: [1, 1.2, 1], rotate: [0, -8, 7, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-0 right-0 md:-right-5 bg-gradient-to-br from-purple-600 via-indigo-700 to-indigo-950 px-5 py-3 rounded-3xl font-black text-white shadow-[0_20px_40px_rgba(76,29,149,0.55)] border-4 border-yellow-400 flex items-center gap-3 z-50"
      >
        <MiniChestIcon highlight={burstActive} />
        <span className="text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">x {chestCount}</span>
      </motion.div>

      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-[70] bg-slate-900/70 backdrop-blur-sm border border-slate-200/20 rounded-2xl px-4 py-2 flex items-end gap-2 shadow-xl">
        {Array.from({ length: historyCount }).map((_, i) => (
          <motion.div
            key={`mini-history-${i}`}
            initial={i === historyCount - 1 ? { y: 10, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
          >
            <MiniChestIcon highlight={i === historyCount - 1 && burstActive} />
          </motion.div>
        ))}
        {chestCount > historyCount && <span className="text-sm font-bold text-white/90 pl-1">+{chestCount - historyCount}</span>}
      </div>
    </div>
  );
}
