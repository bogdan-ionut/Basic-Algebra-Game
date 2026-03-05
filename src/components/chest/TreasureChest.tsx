/**
 * TreasureChest.tsx — AAA-style game chest component
 *
 * Key insight: the lid uses a controlled hinge squash (scaleY + subtle scaleX)
 * to fake backward opening without the extreme flattening distortion.
 * Gems pile up in the opening (y ≈ 60-98) and become visible as the lid
 * compresses / opens.
 *
 * Z-order (bottom → top in SVG):
 *   1. Drop shadow ellipse
 *   2. Chest body (rect y=98, gold bands, latch)
 *   3. Gem pile (y ≈ 60-98, above body rim but below lid when closed)
 *   4. Lid (dome shape, scaleY 1→0 as chest fills)
 *   5. Dropping gem animation overlay
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChestProgress {
  filled?: number;
  total?: number;
  chestCount?: number;
  // legacy API compat
  itemsCount?: number;
  totalChests?: number;
}

interface Props {
  progress: ChestProgress;
  latestItem: number | null;
  visualStyle?: 'treasure' | 'minecraft';
}

const MINECRAFT_LOOT = [
  'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/diamond.png',
  'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/emerald.png',
  'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/gold_ingot.png',
  'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/redstone.png',
  'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/golden_apple.png',
  'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/iron_ingot.png',
];

// ─── Gem palette ─────────────────────────────────────────────────────────────

const GEM_COLORS: Array<{ light: string; mid: string; dark: string }> = [
  { light: '#80FFFF', mid: '#00BBDD', dark: '#004455' }, // cyan
  { light: '#FFB0FF', mid: '#CC00BB', dark: '#440044' }, // magenta
  { light: '#FFFF80', mid: '#FFCC00', dark: '#664400' }, // gold
  { light: '#A0FFB0', mid: '#00CC55', dark: '#004422' }, // green
  { light: '#D0A0FF', mid: '#8822FF', dark: '#220055' }, // purple
  { light: '#FFB0B0', mid: '#FF2222', dark: '#550000' }, // red
  { light: '#FFCC80', mid: '#FF8800', dark: '#552200' }, // orange
];

// Fixed gem pile positions (x, y) — clustered at the chest opening area.
// y < 101 means they're at/above the body top rim, visible when lid opens.
const GEM_SLOTS: ReadonlyArray<readonly [number, number]> = [
  [100,  95] as const, // center-bottom
  [ 84,  92] as const, // left of centre
  [116,  92] as const, // right of centre
  [100,  79] as const, // mid-centre
  [ 85,  77] as const, // mid-left
  [115,  77] as const, // mid-right
  [ 71,  89] as const, // far-left
  [129,  89] as const, // far-right
  [100,  64] as const, // top-centre
  [ 85,  63] as const, // top-left
];

const LOOT_REVEAL_LEVELS = {
  coins: 0.1,
  crown: 0.22,
  queenCrown: 0.34,
  sword: 0.48,
  relics: 0.62,
} as const;

// ─── Gem shape ───────────────────────────────────────────────────────────────

let _gradId = 0;

function Gem({
  cx, cy, colorIdx, size = 9,
}: {
  cx: number;
  cy: number;
  colorIdx: number;
  size?: number;
  key?: React.Key;
}) {
  const c = GEM_COLORS[colorIdx % GEM_COLORS.length];
  // Stable id scoped to this component instance
  const id = useRef(`gem-grad-${++_gradId}`).current;
  const s = size;

  // 6-sided faceted gem polygon
  const pts = [
    `${cx},${cy - s}`,
    `${cx + s * 0.85},${cy - s * 0.3}`,
    `${cx + s * 0.85},${cy + s * 0.45}`,
    `${cx},${cy + s}`,
    `${cx - s * 0.85},${cy + s * 0.45}`,
    `${cx - s * 0.85},${cy - s * 0.3}`,
  ].join(' ');

  // Inner facet line for depth
  const facetPts = [
    `${cx},${cy - s * 0.55}`,
    `${cx + s * 0.45},${cy}`,
    `${cx},${cy + s * 0.55}`,
    `${cx - s * 0.45},${cy}`,
  ].join(' ');

  return (
    <g>
      <defs>
        <radialGradient id={id} cx="33%" cy="28%" r="70%">
          <stop offset="0%"   stopColor={c.light} />
          <stop offset="50%"  stopColor={c.mid}   />
          <stop offset="100%" stopColor={c.dark}  />
        </radialGradient>
      </defs>
      {/* Main gem body */}
      <polygon
        points={pts}
        fill={`url(#${id})`}
        stroke={c.dark}
        strokeWidth="0.7"
      />
      {/* Inner facet */}
      <polygon
        points={facetPts}
        fill="none"
        stroke={c.light}
        strokeWidth="0.5"
        opacity="0.5"
      />
      {/* Specular highlight */}
      <ellipse
        cx={cx - s * 0.22}
        cy={cy - s * 0.32}
        rx={s * 0.28}
        ry={s * 0.18}
        fill="white"
        opacity="0.75"
      />
    </g>
  );
}

// ─── Sparkle ─────────────────────────────────────────────────────────────────

function Sparkle({ cx, cy, delay = 0 }: { cx: number; cy: number; delay?: number }) {
  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      {/* 4-point star */}
      <polygon
        points={`${cx},${cy - 7} ${cx + 1.5},${cy - 1.5} ${cx + 7},${cy} ${cx + 1.5},${cy + 1.5} ${cx},${cy + 7} ${cx - 1.5},${cy + 1.5} ${cx - 7},${cy} ${cx - 1.5},${cy - 1.5}`}
        fill="#FFE566"
      />
    </motion.g>
  );
}

function CoinStack({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {[8, 4, 0].map((offset, i) => (
        <g key={i} transform={`translate(0 ${offset})`}>
          <ellipse cx="0" cy="0" rx="11" ry="4" fill="#7A5200" opacity="0.3" />
          <ellipse cx="0" cy="-1.2" rx="11" ry="4" fill="#FEE78D" />
          <ellipse cx="0" cy="-1.2" rx="8" ry="2.8" fill="#DAA520" />
          <circle cx="0" cy="-1.2" r="1.7" fill="#FFF3BE" />
        </g>
      ))}
    </g>
  );
}

function Crown({ x, y, scale = 1, variant = 'king' }: { x: number; y: number; scale?: number; variant?: 'king' | 'queen' }) {
  const highlight = variant === 'king' ? '#FFEFA8' : '#FFD5F6';
  const gem = variant === 'king' ? '#FF3B30' : '#B833FF';
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M -16 8 L -11 -9 L -3 -1 L 0 -12 L 3 -1 L 11 -9 L 16 8 Z" fill="url(#tc-gold-h)" stroke="#8B5B00" strokeWidth="1.3" />
      <rect x="-18" y="7" width="36" height="8" rx="3" fill="url(#tc-gold-v)" stroke="#8B5B00" strokeWidth="1.2" />
      <circle cx="0" cy="4" r="3.6" fill={gem} stroke={highlight} strokeWidth="1" />
      <circle cx="-9" cy="5" r="2.4" fill="#1DD1FF" stroke={highlight} strokeWidth="0.8" />
      <circle cx="9" cy="5" r="2.4" fill="#29E07A" stroke={highlight} strokeWidth="0.8" />
      <ellipse cx="-10.8" cy="-9.5" rx="2.8" ry="1.8" fill={highlight} />
      <ellipse cx="0" cy="-12.4" rx="2.8" ry="1.8" fill={highlight} />
      <ellipse cx="10.8" cy="-9.5" rx="2.8" ry="1.8" fill={highlight} />
    </g>
  );
}

function Sword({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-16) scale(${scale})`}>
      <rect x="-1.9" y="-30" width="3.8" height="24" rx="1.8" fill="#DDF5FF" stroke="#7EA2B3" strokeWidth="0.9" />
      <path d="M -1.9 -30 L 0 -40 L 1.9 -30 Z" fill="#BCE4FA" stroke="#7EA2B3" strokeWidth="0.8" />
      <rect x="-9" y="-7" width="18" height="4" rx="1.7" fill="#C89800" stroke="#7A4F00" strokeWidth="0.9" />
      <rect x="-2.8" y="-4" width="5.6" height="11" rx="2" fill="#91531E" stroke="#5A2D0F" strokeWidth="0.9" />
      <circle cx="0" cy="8" r="2" fill="#F6D75A" stroke="#7A4F00" strokeWidth="0.8" />
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

let _dropKey = 0;

export function TreasureChest({ progress, latestItem, visualStyle = 'treasure' }: Props) {
  // Support both API shapes
  const filled     = progress.filled     ?? (progress as any).itemsCount  ?? 0;
  const total      = progress.total      ?? 10;
  const chestCount = progress.chestCount ?? (progress as any).totalChests ?? 0;

  const fillRatio   = Math.min(Math.max(filled / total, 0), 1);
  const gemsVisible = Math.round(fillRatio * 10);

  // Lid opening: keep it centered on the hinge to avoid drifting sideways.
  // Gentle squash keeps shape readable without the old extreme flattening.
  const lidScaleY = Math.max(0.48, 1 - fillRatio * 0.52);
  const lidScaleX = 1 - (1 - lidScaleY) * 0.03;
  const isOpen    = fillRatio > 0.03;

  // Inner glow intensity
  const glowAlpha = fillRatio * 0.9;

  // ── Dropping gem state ────────────────────────────────────────────────────
  const [drops, setDrops] = useState<Array<{ id: number; slotIdx: number; sparkles: boolean }>>([]);
  const prevLatestRef = useRef<number | null>(null);

  useEffect(() => {
    if (latestItem !== null && latestItem !== prevLatestRef.current) {
      prevLatestRef.current = latestItem;
      const id = ++_dropKey;
      setDrops(prev => [...prev, { id, slotIdx: latestItem % 10, sparkles: false }]);

      // Show sparkles after gem lands (~450ms)
      setTimeout(() => {
        setDrops(prev => prev.map(d => d.id === id ? { ...d, sparkles: true } : d));
      }, 450);

      // Remove after animation completes
      setTimeout(() => {
        setDrops(prev => prev.filter(d => d.id !== id));
      }, 1200);
    }
  }, [latestItem]);

  // ── Completion confetti ───────────────────────────────────────────────────
  const prevFillRef = useRef(fillRatio);
  useEffect(() => {
    if (fillRatio >= 1.0 && prevFillRef.current < 1.0) {
      confetti({
        particleCount: 180,
        spread: 130,
        colors: ['#FFD700', '#FF00CC', '#00FFCC', '#FF6600', '#9933FF'],
        origin: { y: 0.65 },
      });
    }
    prevFillRef.current = fillRatio;
  }, [fillRatio]);

  const minecraftLootVisible = filled;
  const isMinecraft = visualStyle === 'minecraft';

  return (
    <div className="relative flex flex-col items-center">

      {/* ── Chest counter badge ────────────────────────────────────────────── */}
      {chestCount > 0 && (
        <motion.div
          className="absolute -top-3 right-2 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
            border: '2.5px solid #FACC15',
          }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Tiny chest icon */}
          <svg viewBox="0 0 20 16" className="w-5 h-4">
            <rect x="1" y="6" width="18" height="9" rx="2" fill="#c8721a" />
            <rect x="0" y="5" width="20" height="4" rx="2" fill="#f09030" />
            <rect x="8" y="8" width="4" height="4" rx="1" fill="#7a3a0a" />
            <circle cx="10" cy="9" r="1.5" fill="#FACC15" />
          </svg>
          <span className="text-white font-black text-sm tracking-wide">x {chestCount}</span>
        </motion.div>
      )}

      {/* ── Idle float wrapper ────────────────────────────────────────────── */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {isMinecraft ? (
          <div className="relative w-72 h-56 sm:w-80 sm:h-64">
            <div className="absolute inset-x-5 bottom-2 h-7 rounded-[8px] border-2 border-[#7f95b1] bg-gradient-to-b from-[#2a3d56] to-[#17283e] shadow-[0_12px_18px_rgba(0,0,0,0.45)]" />

            <div className="absolute inset-x-2 top-3 bottom-10 rounded-[4px] border-[4px] border-[#0b111c] bg-[#5f3a1f] shadow-[inset_0_0_0_3px_#9a6736,inset_0_0_0_7px_#3b2412,0_14px_20px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-x-0 top-0 h-[44%] border-b-[4px] border-[#130b05] bg-[repeating-linear-gradient(90deg,#b07a42_0px,#b07a42_16px,#946436_16px,#946436_32px)]" />
              <div className="absolute inset-x-0 bottom-0 h-[56%] bg-[repeating-linear-gradient(90deg,#8c5b31_0px,#8c5b31_16px,#734928_16px,#734928_32px)]" />
              <div className="absolute inset-x-0 top-[44%] h-[4px] bg-[#120a05]" />

              <div className="absolute left-2 top-1 bottom-1 w-[6px] bg-[#1a120c]" />
              <div className="absolute right-2 top-1 bottom-1 w-[6px] bg-[#1a120c]" />

              <div className="absolute left-1/2 top-[42%] -translate-x-1/2 h-[62px] w-[44px] border-[3px] border-[#201108] bg-gradient-to-b from-[#f0d589] via-[#b98537] to-[#7d541f] shadow-[0_4px_0_#2f1b0a]" />
              <div className="absolute left-1/2 top-[54%] -translate-x-1/2 h-[16px] w-[16px] border-[3px] border-[#2a1a0c] bg-gradient-to-b from-[#b5b9bf] to-[#6f7784]" />

              <div className="absolute left-0 right-0 top-[37%] grid grid-cols-5 gap-1 px-5">
                {Array.from({ length: minecraftLootVisible }).map((_, index) => (
                  <div key={`minecraft-loot-${index}`} className="h-9 w-9 rounded-[4px] border-2 border-[#101822] bg-[#091526] shadow-[0_0_0_2px_#1e3a5a,0_6px_10px_rgba(0,0,0,0.35)] p-0.5">
                    <img
                      src={MINECRAFT_LOOT[index % MINECRAFT_LOOT.length]}
                      alt="Minecraft loot"
                      className="h-full w-full object-contain [image-rendering:pixelated]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute inset-x-2 top-0 h-24 rounded-[4px] border-[4px] border-[#0b111c] bg-[repeating-linear-gradient(90deg,#c18c4d_0px,#c18c4d_16px,#a9753e_16px,#a9753e_32px)] shadow-[inset_0_0_0_3px_#d39f5f,inset_0_-5px_0_#5a351a]" />
            <div className="absolute inset-x-2 top-[90px] h-[4px] bg-[#0b111c]" />
          </div>
        ) : (
        <svg
          viewBox="0 0 200 175"
          className="w-72 h-56 sm:w-80 sm:h-64"
          style={{ overflow: 'visible' }}
          aria-label="Treasure chest"
        >
          <defs>
            {/* ── Gradients ─────────────────────────────────────────────── */}
            <linearGradient id="tc-wood-body" x1="5%" y1="0%" x2="15%" y2="100%">
              <stop offset="0%"   stopColor="#9B6030" />
              <stop offset="35%"  stopColor="#7A4418" />
              <stop offset="100%" stopColor="#3E1A06" />
            </linearGradient>

            <linearGradient id="tc-wood-lid" x1="10%" y1="0%" x2="20%" y2="100%">
              <stop offset="0%"   stopColor="#B07035" />
              <stop offset="45%"  stopColor="#7A4418" />
              <stop offset="100%" stopColor="#3E1A06" />
            </linearGradient>

            <linearGradient id="tc-gold-v" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#FFE870" />
              <stop offset="30%"  stopColor="#DAA520" />
              <stop offset="75%"  stopColor="#AA8010" />
              <stop offset="100%" stopColor="#886600" />
            </linearGradient>

            <linearGradient id="tc-gold-h" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#AA8010" />
              <stop offset="25%"  stopColor="#FFE870" />
              <stop offset="50%"  stopColor="#DAA520" />
              <stop offset="75%"  stopColor="#FFE870" />
              <stop offset="100%" stopColor="#AA8010" />
            </linearGradient>

            <radialGradient id="tc-glow" cx="50%" cy="90%" r="65%">
              <stop offset="0%"  stopColor="#FFD700" stopOpacity={glowAlpha}       />
              <stop offset="45%" stopColor="#CC44FF" stopOpacity={glowAlpha * 0.6} />
              <stop offset="100%" stopColor="#CC44FF" stopOpacity="0"              />
            </radialGradient>

            <radialGradient id="tc-lid-inner" cx="50%" cy="70%" r="70%">
              <stop offset="0%"   stopColor="#FF9900" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FF9900" stopOpacity="0"    />
            </radialGradient>

            <linearGradient id="tc-floor-top" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1C4E80" />
              <stop offset="20%" stopColor="#1B6D99" />
              <stop offset="50%" stopColor="#2A84B6" />
              <stop offset="80%" stopColor="#1B6D99" />
              <stop offset="100%" stopColor="#1C4E80" />
            </linearGradient>

            <linearGradient id="tc-floor-front" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9AA1AA" />
              <stop offset="40%" stopColor="#70757F" />
              <stop offset="100%" stopColor="#42464D" />
            </linearGradient>

            <linearGradient id="tc-floor-trim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#795007" />
              <stop offset="25%" stopColor="#F6DA7A" />
              <stop offset="55%" stopColor="#C89624" />
              <stop offset="80%" stopColor="#F6DA7A" />
              <stop offset="100%" stopColor="#795007" />
            </linearGradient>

            <linearGradient id="tc-floor-marble" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A9AFB7" />
              <stop offset="45%" stopColor="#7D848D" />
              <stop offset="100%" stopColor="#5A6068" />
            </linearGradient>

            <linearGradient id="tc-floor-rim-dark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#30200A" />
              <stop offset="50%" stopColor="#6C4B13" />
              <stop offset="100%" stopColor="#30200A" />
            </linearGradient>

            <radialGradient id="tc-floor-glow" cx="50%" cy="35%" r="70%">
              <stop offset="0%" stopColor="rgba(255, 239, 154, 0.75)" />
              <stop offset="60%" stopColor="rgba(255, 214, 94, 0.3)" />
              <stop offset="100%" stopColor="rgba(255, 214, 94, 0)" />
            </radialGradient>

            <filter id="tc-shadow">
              <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="rgba(0,0,0,0.45)" />
            </filter>
          </defs>

          {/* ── Decorative floor / pedestal ─────────────────────────────── */}
          <g>
            <ellipse cx="100" cy="173" rx="106" ry="11" fill="rgba(0,0,0,0.28)" />
            <ellipse cx="100" cy="168" rx="94" ry="7" fill="rgba(20,53,85,0.28)" />

            {/* Massive velvet top deck */}
            <path
              d="M 6 160 Q 100 136 194 160 Q 185 170 15 170 Z"
              fill="url(#tc-floor-top)"
              stroke="#D1A33F"
              strokeWidth="2.2"
            />
            <path d="M 16 160 Q 100 142 184 160" stroke="rgba(255,240,180,0.58)" strokeWidth="1.1" fill="none" />
            <path d="M 20 164 Q 100 148 180 164" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
            <ellipse cx="100" cy="160.5" rx="66" ry="11.5" fill="url(#tc-floor-glow)" />

            {/* Front stone and brass fascia for more depth */}
            <rect x="8" y="170" width="184" height="15" rx="4" fill="url(#tc-floor-marble)" />
            <rect x="12" y="170.4" width="176" height="4" rx="2" fill="url(#tc-floor-trim)" />
            <rect x="10" y="184" width="180" height="3.8" rx="1.9" fill="url(#tc-floor-rim-dark)" opacity="0.8" />
            <path d="M 16 183 H 184" stroke="rgba(0,0,0,0.34)" strokeWidth="1" />

            {/* Floor panel seams */}
            {[24, 44, 64, 84, 104, 124, 144, 164, 184].map((x) => (
              <line key={`floor-seam-${x}`} x1={x} y1="170" x2={x} y2="185" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
            ))}

            {/* Decorative studs */}
            {[24, 58, 92, 126, 160, 176].map((x) => (
              <g key={`floor-stud-${x}`}>
                <circle cx={x} cy="172.8" r="1.8" fill="#FFEFA8" />
                <circle cx={x} cy="172.8" r="1.1" fill="#C88A08" />
              </g>
            ))}
          </g>

          {/* ═══════════════════════════════════════════════════════════════
              LAYER 1 — CHEST BODY (static)
          ═══════════════════════════════════════════════════════════════ */}
          <g transform="translate(100 103) scale(1.12) translate(-100 -103)" filter="url(#tc-shadow)">

            {/* Main wooden body */}
            <rect x="22" y="97" width="156" height="66" rx="5" fill="url(#tc-wood-body)" />

            {/* Horizontal plank lines */}
            <line x1="22"  y1="119" x2="178" y2="119" stroke="#2a1005" strokeWidth="1.3" opacity="0.55" />
            <line x1="22"  y1="141" x2="178" y2="141" stroke="#2a1005" strokeWidth="1.3" opacity="0.55" />

            {/* Subtle vertical grain */}
            {([65, 80, 120, 135] as const).map(x => (
              <line key={x} x1={x} y1="98" x2={x} y2="162" stroke="#2a1005" strokeWidth="0.6" opacity="0.18" />
            ))}

            {/* Inner glow at top of body (shows when open) */}
            <rect x="22" y="97" width="156" height="45" rx="5" fill="url(#tc-glow)" />

            {/* Bottom gold rim */}
            <rect x="13" y="153" width="174" height="14" rx="5" fill="url(#tc-gold-v)" />
            <line x1="13" y1="159" x2="187" y2="159" stroke="rgba(255,240,120,0.4)" strokeWidth="1" />

            {/* Top gold rim (body) */}
            <rect x="13" y="93" width="174" height="11" rx="4" fill="url(#tc-gold-h)" />
            <line x1="13" y1="96" x2="187" y2="96" stroke="rgba(255,248,180,0.5)" strokeWidth="1" />

            {/* Left vertical gold band */}
            <rect x="45" y="93" width="18" height="74" fill="url(#tc-gold-v)" />
            <line x1="49" y1="94" x2="49" y2="166" stroke="rgba(255,248,180,0.45)" strokeWidth="1.2" />

            {/* Right vertical gold band */}
            <rect x="137" y="93" width="18" height="74" fill="url(#tc-gold-v)" />
            <line x1="141" y1="94" x2="141" y2="166" stroke="rgba(255,248,180,0.45)" strokeWidth="1.2" />

            {/* Rivets — left band */}
            {([108, 124, 140, 155] as const).map(y => (
              <g key={`rl-${y}`}>
                <circle cx="54" cy={y} r="4.2" fill="#FFF5C0" />
                <circle cx="54" cy={y} r="2.8" fill="#C89800" />
                <circle cx="53" cy={y - 1} r="1.1" fill="rgba(255,255,200,0.75)" />
              </g>
            ))}

            {/* Rivets — right band */}
            {([108, 124, 140, 155] as const).map(y => (
              <g key={`rr-${y}`}>
                <circle cx="146" cy={y} r="4.2" fill="#FFF5C0" />
                <circle cx="146" cy={y} r="2.8" fill="#C89800" />
                <circle cx="145" cy={y - 1} r="1.1" fill="rgba(255,255,200,0.75)" />
              </g>
            ))}

            {/* Center latch plate */}
            <rect x="84" y="111" width="32" height="24" rx="5" fill="url(#tc-gold-v)" />
            <line x1="85" y1="114" x2="115" y2="114" stroke="rgba(255,248,160,0.6)" strokeWidth="1" />
            {/* Keyhole */}
            <circle cx="100" cy="119" r="6"   fill="#1a0800" />
            <rect   x="97"  y="119" width="6" height="9" rx="1.5" fill="#1a0800" />
          </g>

          {/* ═══════════════════════════════════════════════════════════════
              LAYER 2 — GEM PILE
              Sits above body rim (y ≈ 60–98) but UNDER the lid.
              Revealed as the lid scaleY → 0.
          ═══════════════════════════════════════════════════════════════ */}
          {gemsVisible > 0 && (
            <g>
              {/* Glow aura behind pile */}
              <motion.ellipse
                cx="100"
                cy="84"
                rx="52"
                ry="30"
                fill="url(#tc-glow)"
                animate={fillRatio >= 0.7
                  ? { opacity: [0.75, 1, 0.75] }
                  : { opacity: [0.65, 0.9, 0.65] }
                }
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Gem pile */}
              {GEM_SLOTS.slice(0, gemsVisible).map(([gx, gy], i) => (
                <Gem key={i} cx={gx} cy={gy} colorIdx={i} size={10.5} />
              ))}

              {/* Detailed loot variety: coins, crowns, swords & relic gems */}
              {fillRatio >= LOOT_REVEAL_LEVELS.coins && (
                <>
                  <CoinStack x={68} y={90} scale={0.84} />
                  <CoinStack x={130} y={88} scale={0.8} />
                </>
              )}

              {fillRatio >= LOOT_REVEAL_LEVELS.crown && (
                <motion.g
                  animate={{ y: [0, -1.5, 0] }}
                  transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Crown x={78} y={78} scale={0.78} variant="king" />
                </motion.g>
              )}

              {fillRatio >= LOOT_REVEAL_LEVELS.queenCrown && (
                <motion.g
                  animate={{ y: [0, -1.2, 0] }}
                  transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
                >
                  <Crown x={124} y={77} scale={0.74} variant="queen" />
                </motion.g>
              )}

              {fillRatio >= LOOT_REVEAL_LEVELS.sword && (
                <motion.g
                  animate={{ rotate: [-2, 1.5, -2] }}
                  transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ transformOrigin: '109px 88px' }}
                >
                  <Sword x={109} y={88} scale={0.72} />
                </motion.g>
              )}

              {fillRatio >= LOOT_REVEAL_LEVELS.relics && (
                <>
                  <Gem cx={151} cy={82} colorIdx={2} size={9.2} />
                  <Gem cx={54} cy={81} colorIdx={4} size={8.8} />
                </>
              )}

              {/* Overflow gems at base when very full */}
              {fillRatio >= 0.8 && (
                <>
                  <Gem cx={27}  cy={157} colorIdx={2} size={7} />
                  <Gem cx={172} cy={154} colorIdx={4} size={7} />
                  <Gem cx={18}  cy={145} colorIdx={0} size={5.5} />
                  <Gem cx={182} cy={144} colorIdx={5} size={5.5} />
                </>
              )}
            </g>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              LAYER 3 — LID  (centered hinge squash)
              Symmetric transform around center hinge avoids left/right drift
              and keeps the lid visually connected to the chest rim.
          ═══════════════════════════════════════════════════════════════ */}
          <motion.g
            style={{ transformOrigin: '100px 101px' }}
            transform="translate(100 103) scale(1.12) translate(-100 -103)"
            animate={{ scaleY: lidScaleY, scaleX: lidScaleX }}
            transition={{ type: 'spring', stiffness: 130, damping: 15 }}
          >
            {/* Dome shape */}
            <path
              d="M 17,101 Q 17,30 100,26 Q 183,30 183,101 Z"
              fill="url(#tc-wood-lid)"
            />

            {/* Lid inner warm glow (subtle baked-in lighting) */}
            <path
              d="M 25,101 Q 25,38 100,34 Q 175,38 175,101 Z"
              fill="url(#tc-lid-inner)"
            />

            {/* Lid plank curve lines */}
            <path d="M 28,91 Q 100,77 172,91" stroke="#2a1005" strokeWidth="1.2" fill="none" opacity="0.55" />
            <path d="M 34,79 Q 100,62 166,79" stroke="#2a1005" strokeWidth="1.2" fill="none" opacity="0.45" />
            <path d="M 42,67 Q 100,50 158,67" stroke="#2a1005" strokeWidth="1"   fill="none" opacity="0.35" />

            {/* Sheen highlight on dome */}
            <path
              d="M 50,62 Q 100,43 150,62"
              stroke="rgba(255,255,255,0.17)"
              strokeWidth="11"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 60,55 Q 100,40 140,55"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Lid vertical gold bands */}
            <path d="M 45,101 Q 46,52 54,42 L 63,42 Q 63,52 63,101 Z" fill="url(#tc-gold-v)" />
            <path d="M 137,101 Q 137,52 145,42 L 154,42 Q 154,52 155,101 Z" fill="url(#tc-gold-v)" />

            {/* Lid top arc gold trim */}
            <path
              d="M 17,101 Q 17,30 100,26 Q 183,30 183,101"
              fill="none"
              stroke="url(#tc-gold-h)"
              strokeWidth="9"
              strokeLinecap="round"
            />

            {/* Lid rivets */}
            {([84, 65] as const).map((y, i) => (
              <g key={`lid-l-${i}`}>
                <circle cx="54"  cy={y} r="4.2" fill="#FFF5C0" />
                <circle cx="54"  cy={y} r="2.8" fill="#C89800" />
                <circle cx="53"  cy={y - 1} r="1.1" fill="rgba(255,255,200,0.75)" />
              </g>
            ))}
            {([84, 65] as const).map((y, i) => (
              <g key={`lid-r-${i}`}>
                <circle cx="146" cy={y} r="4.2" fill="#FFF5C0" />
                <circle cx="146" cy={y} r="2.8" fill="#C89800" />
                <circle cx="145" cy={y - 1} r="1.1" fill="rgba(255,255,200,0.75)" />
              </g>
            ))}

          </motion.g>


          {/* Static hinge bridge (always attached to chest body) */}
          <g transform="translate(100 103) scale(1.12) translate(-100 -103)">
            <rect x="13" y="96" width="174" height="8" rx="3" fill="url(#tc-gold-h)" />
            <line x1="16" y1="98" x2="184" y2="98" stroke="rgba(255,248,160,0.6)" strokeWidth="1" />
            <ellipse cx="65"  cy="101" rx="6" ry="4" fill="#C89800" stroke="#886600" strokeWidth="1" />
            <ellipse cx="135" cy="101" rx="6" ry="4" fill="#C89800" stroke="#886600" strokeWidth="1" />
          </g>

          {/* ═══════════════════════════════════════════════════════════════
              LAYER 4 — DROPPING GEM ANIMATION
          ═══════════════════════════════════════════════════════════════ */}
          <AnimatePresence>
            {drops.map(drop => {
              const [tx, ty] = GEM_SLOTS[drop.slotIdx];
              return (
                <React.Fragment key={drop.id}>
                  {/* Falling gem */}
                  <motion.g
                    initial={{ y: -70, opacity: 0, scale: 0 }}
                    animate={{ y: 0, opacity: 1, scale: [0, 1.3, 0.9, 1] }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    <Gem cx={tx} cy={ty - 22} colorIdx={drop.slotIdx} size={12} />
                  </motion.g>

                  {/* Landing sparkles */}
                  {drop.sparkles && (
                    <>
                      <Sparkle cx={tx - 14} cy={ty - 28} delay={0}    />
                      <Sparkle cx={tx + 14} cy={ty - 28} delay={0.1}  />
                      <Sparkle cx={tx}      cy={ty - 42} delay={0.05} />
                      <Sparkle cx={tx - 8}  cy={ty - 44} delay={0.15} />
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </AnimatePresence>

        </svg>
        )}
      </motion.div>

      {/* ── Fill progress bar (subtle) ──────────────────────────────────── */}
      <div className="flex gap-1.5 mt-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-2 rounded-full transition-all duration-300"
            style={{
              background: i < filled
                ? 'linear-gradient(135deg, #FFE566, #FFAA00)'
                : 'rgba(0,0,0,0.12)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default TreasureChest;
