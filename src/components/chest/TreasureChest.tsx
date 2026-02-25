import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ChestProgress } from '../../lib/chestProgress';

type TreasureChestProps = {
  progress: ChestProgress;
  latestItem: number | null;
};

type GemColor = {
  name: string;
  center: string;
  mid: string;
  edge: string;
};

type Position = {
  x: number;
  y: number;
};

const GEM_COLORS: GemColor[] = [
  { name: 'cyan', center: '#80FFFF', mid: '#00CCDD', edge: '#005566' },
  { name: 'magenta', center: '#FFB0FF', mid: '#DD00CC', edge: '#550055' },
  { name: 'gold', center: '#FFFF80', mid: '#FFCC00', edge: '#664400' },
  { name: 'green', center: '#A0FFB0', mid: '#00DD66', edge: '#004422' },
  { name: 'purple', center: '#D0A0FF', mid: '#9933FF', edge: '#330066' },
  { name: 'red', center: '#FFB0B0', mid: '#FF3333', edge: '#660000' },
];

const GEM_POSITIONS: Position[] = [
  { x: 0, y: 0 },
  { x: -18, y: 4 },
  { x: 18, y: 4 },
  { x: -9, y: -14 },
  { x: 9, y: -14 },
  { x: -28, y: -4 },
  { x: 28, y: -4 },
  { x: 0, y: -26 },
  { x: -20, y: -22 },
  { x: 20, y: -22 },
];

const EXTERNAL_GEMS: Array<Position & { colorIndex: number }> = [
  { x: 52, y: 194, colorIndex: 1 },
  { x: 144, y: 198, colorIndex: 2 },
  { x: 160, y: 190, colorIndex: 0 },
];

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

function MiniChestIcon({ highlight }: { highlight: boolean }) {
  return (
    <div
      className={`relative h-8 w-10 rounded-md border-2 ${highlight ? 'border-yellow-200 shadow-[0_0_16px_rgba(250,204,21,0.75)]' : 'border-amber-800'} bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800`}
    >
      <div className="absolute -top-3 left-0 right-0 h-4 rounded-t-md border-2 border-amber-900 bg-gradient-to-b from-amber-300 to-amber-700" />
      <div className="absolute left-1 right-1 top-3 h-[3px] rounded-full bg-amber-900/60" />
      <div className="absolute left-1/2 top-2.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-yellow-100/40 bg-zinc-800" />
    </div>
  );
}

const Gem: React.FC<{ x: number; y: number; colorIndex: number; scale?: number }> = ({ x, y, colorIndex, scale = 1 }) => {
  const color = GEM_COLORS[colorIndex % GEM_COLORS.length];

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <polygon
        points="0,-10 6,-3 10,4 0,8 -10,4 -6,-3"
        fill={`url(#gem-${color.name})`}
        stroke={color.edge}
        strokeWidth="1"
      />
      <ellipse cx="-3" cy="-4" rx="3" ry="2" fill="white" fillOpacity="0.8" />
    </g>
  );
};

export function TreasureChest({ progress, latestItem }: TreasureChestProps) {
  const prevLatestRef = useRef<number | null>(null);
  const prevFillRatioRef = useRef(0);

  const [newGemActive, setNewGemActive] = useState(false);
  const [pulseGem, setPulseGem] = useState(false);
  const [completeRays, setCompleteRays] = useState(false);
  const [forceClose, setForceClose] = useState(false);

  const filled = (progress as ChestProgress & { filled?: number }).filled ?? progress.itemsCount;
  const total = (progress as ChestProgress & { total?: number }).total ?? 10;
  const chestCount = (progress as ChestProgress & { chestCount?: number }).chestCount ?? progress.totalChests;
  const fillRatio = total === 0 ? 0 : clamp(filled / total, 0, 1);

  useEffect(() => {
    if (fillRatio < 1) {
      setForceClose(false);
      setCompleteRays(false);
    }
  }, [fillRatio]);

  useEffect(() => {
    if (latestItem !== null && latestItem !== prevLatestRef.current && filled > 0) {
      setNewGemActive(true);
      setPulseGem(false);

      const pulseTimer = setTimeout(() => setPulseGem(true), 420);
      const clearTimer = setTimeout(() => {
        setNewGemActive(false);
        setPulseGem(false);
      }, 920);

      prevLatestRef.current = latestItem;
      return () => {
        clearTimeout(pulseTimer);
        clearTimeout(clearTimer);
      };
    }

    prevLatestRef.current = latestItem;
    return undefined;
  }, [latestItem, filled]);

  useEffect(() => {
    const justCompleted = prevFillRatioRef.current < 1 && fillRatio >= 1;
    prevFillRatioRef.current = fillRatio;

    if (!justCompleted) {
      return undefined;
    }

    setCompleteRays(true);
    confetti({
      colors: ['#FFD700', '#FF00CC', '#00FFCC'],
      particleCount: 180,
      spread: 118,
      startVelocity: 46,
      origin: { x: 0.5, y: 0.48 },
    });

    const closeTimer = setTimeout(() => {
      setForceClose(true);
    }, 1500);

    const clearRayTimer = setTimeout(() => {
      setCompleteRays(false);
    }, 1600);

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(clearRayTimer);
    };
  }, [fillRatio]);

  const lidRatio = forceClose ? 0 : fillRatio;
  const visibleGemCount = Math.ceil(fillRatio * 10);
  const showExtraGems = fillRatio >= 0.8;

  const visibleGems = useMemo(
    () => GEM_POSITIONS.slice(0, visibleGemCount).map((position, index) => ({ ...position, colorIndex: index % GEM_COLORS.length })),
    [visibleGemCount],
  );

  return (
    <div className="relative mx-auto mt-8 flex h-64 w-56 min-w-56 items-end justify-center overflow-visible">
      <motion.svg
        viewBox="0 0 200 230"
        className="h-64 w-56 overflow-visible"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="woodBody" x1="0" y1="120" x2="0" y2="210" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="55%" stopColor="#5C2E0A" />
            <stop offset="100%" stopColor="#3D1A05" />
          </linearGradient>
          <linearGradient id="goldBand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DAA520" />
            <stop offset="52%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          <linearGradient id="lidWood" x1="20" y1="58" x2="20" y2="122" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="60%" stopColor="#5C2E0A" />
            <stop offset="100%" stopColor="#3D1A05" />
          </linearGradient>
          <radialGradient id="pileGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(180,100,255,0.5)" />
            <stop offset="100%" stopColor="rgba(180,100,255,0)" />
          </radialGradient>
          {GEM_COLORS.map((gemColor) => (
            <radialGradient key={gemColor.name} id={`gem-${gemColor.name}`} cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor={gemColor.center} stopOpacity="0.6" />
              <stop offset="55%" stopColor={gemColor.mid} />
              <stop offset="100%" stopColor={gemColor.edge} />
            </radialGradient>
          ))}
        </defs>

        {completeRays && (
          <g>
            {Array.from({ length: 8 }).map((_, index) => {
              const angle = (index * Math.PI) / 4;
              const x2 = 100 + Math.cos(angle) * 50;
              const y2 = 150 + Math.sin(angle) * 50;
              return (
                <motion.line
                  key={`ray-${index}`}
                  x1="100"
                  y1="150"
                  x2={x2}
                  y2={y2}
                  stroke="#FFE58A"
                  strokeWidth="2"
                  strokeDasharray="40 40"
                  initial={{ strokeDashoffset: 40, opacity: 1 }}
                  animate={{ strokeDashoffset: 0, opacity: [1, 0] }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              );
            })}
          </g>
        )}

        {/* GROUP 1 — drop shadow */}
        <ellipse cx="100" cy="210" rx="80" ry="14" fill="rgba(0,0,0,0.25)" />

        {/* GROUP 2 — chest body */}
        <g>
          <rect x="20" y="120" width="160" height="90" rx="16" fill="url(#woodBody)" stroke="#2a1005" strokeWidth="2" />
          <path d="M20 132 L10 142 L10 200 L20 210 Z" fill="#3D1A05" />

          {[142, 164, 186].map((y) => (
            <line key={`plank-${y}`} x1="24" y1={y} x2="176" y2={y} stroke="#2a1005" strokeOpacity="0.6" strokeWidth="2" />
          ))}

          {[48, 134].map((x) => (
            <g key={`gold-column-${x}`}>
              <rect x={x} y="124" width="18" height="82" rx="6" fill="url(#goldBand)" stroke="#8B6914" strokeWidth="1.3" />
              {Array.from({ length: 6 }).map((_, rivetIndex) => (
                <circle
                  key={`rivet-${x}-${rivetIndex}`}
                  cx={x + 9}
                  cy={133 + rivetIndex * 13.2}
                  r="3"
                  fill="#FFF8DC"
                  stroke="#8B6914"
                  strokeWidth="1"
                />
              ))}
            </g>
          ))}

          <rect x="20" y="120" width="160" height="10" rx="5" fill="url(#goldBand)" />
          <rect x="20" y="198" width="160" height="12" rx="6" fill="url(#goldBand)" />

          <g>
            <rect x="85" y="168" width="30" height="20" rx="5" fill="url(#goldBand)" stroke="#8B6914" strokeWidth="1.2" />
            <circle cx="100" cy="176" r="5" fill="#1a0a00" />
            <rect x="98.5" y="176" width="3" height="7" rx="1" fill="#1a0a00" />
          </g>
        </g>

        {/* GROUP 3 — gem pile */}
        {fillRatio > 0 && (
          <g>
            <motion.ellipse
              cx="100"
              cy="110"
              rx="40"
              ry="25"
              fill="url(#pileGlow)"
              animate={fillRatio >= 0.8 ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.6 }}
              transition={fillRatio >= 0.8 ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
            />

            <g transform="translate(100 120)">
              {visibleGems.map((gem, index) => (
                <Gem key={`pile-gem-${index}`} x={gem.x} y={gem.y - 10} colorIndex={gem.colorIndex} />
              ))}
            </g>

            <AnimatePresence>
              {newGemActive && (
                <motion.g
                  initial={{ x: 100, y: 120 - 100, scale: 0, opacity: 0 }}
                  animate={{ x: 100, y: 120, scale: pulseGem ? [1, 1.4, 0.9, 1] : 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={
                    pulseGem
                      ? { duration: 0.3, times: [0, 0.35, 0.7, 1] }
                      : { type: 'spring', stiffness: 300, damping: 20 }
                  }
                >
                  <Gem x={0} y={-20} colorIndex={filled} scale={1.05} />
                  {Array.from({ length: 4 }).map((_, index) => {
                    const angle = (index * Math.PI) / 2;
                    return (
                      <motion.path
                        key={`burst-${index}`}
                        d="M0 -4 L1.5 0 L0 4 L-1.5 0 Z"
                        fill="white"
                        initial={{ x: 0, y: -20, opacity: 0 }}
                        animate={{
                          x: Math.cos(angle) * 14,
                          y: -20 + Math.sin(angle) * 14,
                          opacity: [0, 1, 0],
                        }}
                        transition={{ duration: 0.4, delay: 0.25 }}
                      />
                    );
                  })}
                </motion.g>
              )}
            </AnimatePresence>

            {showExtraGems &&
              EXTERNAL_GEMS.map((gem, index) => (
                <g key={`external-gem-${index}`}>
                  <Gem x={gem.x} y={gem.y} colorIndex={gem.colorIndex} scale={0.95} />
                  <motion.path
                    d={`M ${gem.x + 10} ${gem.y - 14} L ${gem.x + 12} ${gem.y - 10} L ${gem.x + 16} ${gem.y - 8} L ${gem.x + 12} ${gem.y - 6} L ${gem.x + 10} ${gem.y - 2} L ${gem.x + 8} ${gem.y - 6} L ${gem.x + 4} ${gem.y - 8} L ${gem.x + 8} ${gem.y - 10} Z`}
                    fill="white"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.2 }}
                  />
                </g>
              ))}
          </g>
        )}

        {/* GROUP 4 — lid */}
        <motion.g
          animate={{ rotate: -lidRatio * 75 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          style={{ transformOrigin: '100px 190px' }}
        >
          <path d="M 20,190 Q 20,130 100,125 Q 180,130 180,190 Z" fill="url(#lidWood)" stroke="#2a1005" strokeWidth="2" />
          <rect x="30" y="146" width="140" height="10" rx="5" fill="url(#goldBand)" />
          {Array.from({ length: 7 }).map((_, index) => (
            <circle
              key={`lid-rivet-${index}`}
              cx={35 + index * 22}
              cy="151"
              r="2.2"
              fill="#FFF8DC"
              stroke="#8B6914"
              strokeWidth="0.8"
            />
          ))}

          {lidRatio > 20 / 75 && (
            <g>
              <path d="M 30,186 Q 100,156 170,186 L 170,190 L 30,190 Z" fill="#2a1005" fillOpacity="0.85" />
              <path d="M 34,186 Q 100,160 166,186" stroke="#C9A227" strokeOpacity="0.45" strokeWidth="2" fill="none" />
            </g>
          )}
        </motion.g>
      </motion.svg>

      <motion.div
        className="absolute right-0 top-2 z-40 flex items-center gap-3 rounded-3xl border-4 border-yellow-400 bg-gradient-to-br from-purple-600 via-indigo-700 to-indigo-950 px-5 py-3 font-black text-white shadow-[0_20px_40px_rgba(76,29,149,0.55)]"
        animate={fillRatio >= 1 ? { scale: [1, 1.12, 1], rotate: [0, -7, 6, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.8 }}
      >
        <MiniChestIcon highlight={fillRatio >= 1} />
        <span className="text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">x {chestCount}</span>
      </motion.div>
    </div>
  );
}
