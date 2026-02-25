import React, { useId } from 'react';
import { motion } from 'motion/react';
import { RarityTier, RARITY_CONFIG } from './chestStyleGuide';

type LootKind = 'coin' | 'ruby' | 'emerald' | 'sapphire' | 'crown' | 'potion';

type LootItemDef = {
  kind: LootKind;
  left: string;
  bottom: string;
  rotate: number;
  size: string;
  depth: number;
};

export const TREASURE_ITEMS: LootItemDef[] = [
  { kind: 'coin', left: '4%', bottom: '-2%', rotate: -18, size: 'w-14 h-14', depth: 5 },
  { kind: 'ruby', left: '20%', bottom: '0%', rotate: 9, size: 'w-14 h-14', depth: 4 },
  { kind: 'coin', left: '36%', bottom: '1%', rotate: -10, size: 'w-14 h-14', depth: 6 },
  { kind: 'emerald', left: '52%', bottom: '0%', rotate: 14, size: 'w-14 h-14', depth: 5 },
  { kind: 'crown', left: '66%', bottom: '2%', rotate: -4, size: 'w-16 h-16', depth: 7 },
  { kind: 'sapphire', left: '82%', bottom: '2%', rotate: 20, size: 'w-14 h-14', depth: 4 },
  { kind: 'potion', left: '12%', bottom: '20%', rotate: -20, size: 'w-14 h-14', depth: 5 },
  { kind: 'coin', left: '28%', bottom: '21%', rotate: 8, size: 'w-14 h-14', depth: 6 },
  { kind: 'ruby', left: '44%', bottom: '22%', rotate: -15, size: 'w-14 h-14', depth: 6 },
  { kind: 'crown', left: '58%', bottom: '22%', rotate: 7, size: 'w-16 h-16', depth: 7 },
  { kind: 'emerald', left: '76%', bottom: '20%', rotate: -10, size: 'w-14 h-14', depth: 5 },
  { kind: 'sapphire', left: '24%', bottom: '40%', rotate: 16, size: 'w-14 h-14', depth: 4 },
  { kind: 'coin', left: '42%', bottom: '40%', rotate: -10, size: 'w-14 h-14', depth: 6 },
  { kind: 'potion', left: '60%', bottom: '39%', rotate: 14, size: 'w-14 h-14', depth: 5 },
];

const outline = { stroke: '#0F172A', strokeWidth: 2.2, strokeLinejoin: 'round' as const };

function GemShape({ palette, gradientId }: { palette: [string, string, string]; gradientId: string }) {
  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette[0]} />
          <stop offset="45%" stopColor={palette[1]} />
          <stop offset="100%" stopColor={palette[2]} />
        </linearGradient>
      </defs>
      <polygon points="50,7 91,34 76,89 24,89 9,34" fill={`url(#${gradientId})`} {...outline} />
      <polygon points="50,12 75,33 50,52 25,33" fill="rgba(255,255,255,0.42)" />
      <polygon points="50,52 62,86 38,86" fill="rgba(255,255,255,0.2)" />
      <polygon points="25,33 50,52 38,86" fill="rgba(255,255,255,0.24)" />
      <polygon points="75,33 50,52 62,86" fill="rgba(0,0,0,0.16)" />
    </>
  );
}

function LootShape({ kind, rarity }: { kind: LootKind; rarity: RarityTier }) {
  const rarityCfg = RARITY_CONFIG[rarity];
  const gradientId = useId().replace(/:/g, '');

  if (kind === 'coin') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id={`coin-${gradientId}`} cx="34%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFF8BF" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#92400E" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill={`url(#coin-${gradientId})`} {...outline} />
        <circle cx="50" cy="50" r="32" fill="#F59E0B" stroke="#7C2D12" strokeWidth={2} />
        <path d="M50 28 L58 43 L74 50 L58 57 L50 72 L42 57 L26 50 L42 43 Z" fill={rarityCfg.glow} opacity="0.9" />
        <ellipse cx="37" cy="34" rx="14" ry="7" fill="rgba(255,255,255,0.42)" />
      </svg>
    );
  }

  if (kind === 'crown') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id={`crown-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>
        <path d="M10 73 L18 23 L35 44 L50 14 L65 44 L82 23 L90 73 Z" fill={`url(#crown-${gradientId})`} {...outline} />
        <rect x="10" y="68" width="80" height="18" rx="6" fill="#B45309" stroke="#7C2D12" strokeWidth={2.2} />
        <circle cx="50" cy="32" r="7.5" fill={rarityCfg.color} stroke="#0F172A" strokeWidth={2} />
        <circle cx="28" cy="48" r="4" fill="#FDE68A" stroke="#7C2D12" strokeWidth={1.5} />
        <circle cx="72" cy="48" r="4" fill="#FDE68A" stroke="#7C2D12" strokeWidth={1.5} />
      </svg>
    );
  }

  if (kind === 'potion') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id={`glass-${gradientId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#DDF4FF" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <radialGradient id={`liquid-${gradientId}`} cx="35%" cy="20%" r="80%">
            <stop offset="0%" stopColor={rarityCfg.glow} />
            <stop offset="55%" stopColor={rarityCfg.color} />
            <stop offset="100%" stopColor="#312E81" />
          </radialGradient>
        </defs>
        <rect x="37" y="14" width="26" height="18" rx="5" fill="#7C3AED" stroke="#1E1B4B" strokeWidth={2.2} />
        <path d="M30 33 C30 23 70 23 70 33 V40 C70 46 66 52 64 56 C61 62 60 70 60 79 C60 84 56 88 50 88 C44 88 40 84 40 79 C40 70 39 62 36 56 C34 52 30 46 30 40 Z" fill={`url(#glass-${gradientId})`} {...outline} />
        <path d="M37 52 C41 61 59 61 63 52 V72 C63 80 57 85 50 85 C43 85 37 80 37 72 Z" fill={`url(#liquid-${gradientId})`} opacity="0.92" />
        <ellipse cx="45" cy="47" rx="6" ry="4" fill="rgba(255,255,255,0.42)" />
      </svg>
    );
  }

  const gemPalette: Record<Exclude<LootKind, 'coin' | 'crown' | 'potion'>, [string, string, string]> = {
    ruby: ['#FCA5A5', '#E11D48', '#7F1D1D'],
    emerald: ['#86EFAC', '#16A34A', '#14532D'],
    sapphire: ['#93C5FD', '#2563EB', '#1E3A8A'],
  };

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <GemShape palette={gemPalette[kind]} gradientId={`gem-${gradientId}`} />
    </svg>
  );
}

export function LootItem({
  item,
  rarity,
  isLatest,
  delay,
}: {
  item: LootItemDef;
  rarity: RarityTier;
  isLatest: boolean;
  delay: number;
}) {
  const rarityCfg = RARITY_CONFIG[rarity];

  return (
    <motion.div
      className={`absolute ${item.size}`}
      style={{
        left: item.left,
        bottom: item.bottom,
        zIndex: item.depth,
        filter: `drop-shadow(0 10px 16px rgba(0,0,0,0.45)) drop-shadow(0 0 18px ${rarityCfg.trailColor})`,
      }}
      initial={isLatest ? { y: -240, scale: 1.7, rotate: 190, opacity: 0 } : false}
      animate={
        isLatest
          ? { y: 0, scale: 1, rotate: item.rotate, opacity: 1 }
          : { rotate: [item.rotate - 2, item.rotate + 2, item.rotate - 2], y: [0, -2.5, 0] }
      }
      transition={
        isLatest
          ? { type: 'spring', damping: 12, stiffness: 170, delay }
          : { duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.15 }
      }
    >
      <LootShape kind={item.kind} rarity={rarity} />
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${rarityCfg.glow}75 0%, transparent 66%)` }}
        animate={{ opacity: [0.18, 0.6, 0.18], scale: [0.82, 1.1, 0.82] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.08 }}
      />
    </motion.div>
  );
}
