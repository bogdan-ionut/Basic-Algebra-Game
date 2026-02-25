import React, { useId } from 'react';
import { motion } from 'motion/react';
import { RarityTier, RARITY_CONFIG } from './chestStyleGuide';

type LootItemDef = {
  kind: 'coin' | 'gem' | 'crown';
  left: string;
  bottom: string;
  rotate: number;
  size: string;
  depth: number;
};

export const TREASURE_ITEMS: LootItemDef[] = [
  { kind: 'coin', left: '6%', bottom: '4%', rotate: -18, size: 'w-16 h-16', depth: 3 },
  { kind: 'gem', left: '26%', bottom: '2%', rotate: 14, size: 'w-14 h-14', depth: 2 },
  { kind: 'coin', left: '46%', bottom: '3%', rotate: -11, size: 'w-16 h-16', depth: 4 },
  { kind: 'crown', left: '62%', bottom: '5%', rotate: -6, size: 'w-20 h-20', depth: 6 },
  { kind: 'gem', left: '80%', bottom: '8%', rotate: 24, size: 'w-14 h-14', depth: 2 },
  { kind: 'coin', left: '12%', bottom: '25%', rotate: -28, size: 'w-16 h-16', depth: 3 },
  { kind: 'gem', left: '34%', bottom: '30%', rotate: 36, size: 'w-14 h-14', depth: 3 },
  { kind: 'crown', left: '52%', bottom: '28%', rotate: 8, size: 'w-20 h-20', depth: 5 },
  { kind: 'coin', left: '73%', bottom: '31%', rotate: -20, size: 'w-16 h-16', depth: 3 },
  { kind: 'gem', left: '20%', bottom: '53%', rotate: 18, size: 'w-14 h-14', depth: 2 },
];

const lootLanguageStyle = { stroke: '#0F172A', strokeWidth: 2.8, strokeLinejoin: 'round' as const };

function LootShape({ kind, rarity }: { kind: LootItemDef['kind']; rarity: RarityTier }) {
  const rarityCfg = RARITY_CONFIG[rarity];
  const gradientId = useId().replace(/:/g, '');

  if (kind === 'coin') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id={`coin-${gradientId}`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFF7C2" />
            <stop offset="45%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#B45309" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="44" fill={`url(#coin-${gradientId})`} {...lootLanguageStyle} />
        <circle cx="50" cy="50" r="31" fill="#F59E0B" stroke="#7C2D12" strokeWidth={2.4} />
        <polygon points="50,27 58,44 76,50 58,56 50,73 42,56 24,50 42,44" fill={rarityCfg.glow} opacity="0.9" />
        <ellipse cx="40" cy="36" rx="15" ry="8" fill="rgba(255,255,255,0.35)" />
      </svg>
    );
  }

  if (kind === 'crown') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id={`crown-gold-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        <path d="M10 73 L18 22 L35 42 L50 14 L65 42 L82 22 L90 73 Z" fill={`url(#crown-gold-${gradientId})`} {...lootLanguageStyle} />
        <rect x="10" y="68" width="80" height="17" rx="6" fill="#B45309" stroke="#7C2D12" strokeWidth={2.6} />
        <circle cx="50" cy="33" r="8" fill={rarityCfg.color} stroke="#0F172A" strokeWidth={2.2} />
        <circle cx="26" cy="47" r="4" fill="#FDE68A" stroke="#7C2D12" strokeWidth={1.5} />
        <circle cx="74" cy="47" r="4" fill="#FDE68A" stroke="#7C2D12" strokeWidth={1.5} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id={`gem-main-${gradientId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={rarityCfg.glow} />
          <stop offset="45%" stopColor={rarityCfg.color} />
          <stop offset="100%" stopColor="#3B0764" />
        </linearGradient>
      </defs>
      <polygon points="50,8 89,35 74,88 26,88 11,35" fill={`url(#gem-main-${gradientId})`} {...lootLanguageStyle} />
      <polygon points="50,12 74,34 50,50 26,34" fill="rgba(255,255,255,0.35)" />
      <polygon points="26,34 50,50 39,84" fill="rgba(255,255,255,0.2)" />
      <polygon points="74,34 50,50 61,84" fill="rgba(0,0,0,0.2)" />
      <polygon points="50,50 61,84 39,84" fill="rgba(255,255,255,0.12)" />
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
        filter: `drop-shadow(0 8px 10px rgba(0,0,0,0.45)) drop-shadow(0 0 16px ${rarityCfg.trailColor})`,
      }}
      initial={isLatest ? { y: -280, scale: 1.75, rotate: 200, opacity: 0 } : false}
      animate={
        isLatest
          ? { y: 0, scale: 1, rotate: item.rotate, opacity: 1 }
          : { rotate: [item.rotate - 2, item.rotate + 2, item.rotate - 2], y: [0, -3, 0] }
      }
      transition={
        isLatest
          ? { type: 'spring', damping: 12, stiffness: 180, delay }
          : { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.2 }
      }
    >
      <LootShape kind={item.kind} rarity={rarity} />
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${rarityCfg.glow}66 0%, transparent 65%)` }}
        animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.85, 1.1, 0.85] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.1 }}
      />
    </motion.div>
  );
}
