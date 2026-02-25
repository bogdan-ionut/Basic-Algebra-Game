import React from 'react';
import { motion } from 'motion/react';
import { RarityTier, RARITY_CONFIG } from './chestStyleGuide';

type LootItemDef = {
  kind: 'coin' | 'gem' | 'crown';
  left: string;
  bottom: string;
  rotate: number;
  size: string;
};

export const TREASURE_ITEMS: LootItemDef[] = [
  { kind: 'coin', left: '15%', bottom: '10%', rotate: -15, size: 'w-16 h-16' },
  { kind: 'gem', left: '55%', bottom: '5%', rotate: 20, size: 'w-14 h-14' },
  { kind: 'crown', left: '30%', bottom: '20%', rotate: -5, size: 'w-20 h-20' },
  { kind: 'gem', left: '10%', bottom: '35%', rotate: 45, size: 'w-14 h-14' },
  { kind: 'coin', left: '70%', bottom: '30%', rotate: -20, size: 'w-16 h-16' },
  { kind: 'coin', left: '25%', bottom: '45%', rotate: 10, size: 'w-16 h-16' },
  { kind: 'gem', left: '50%', bottom: '55%', rotate: -30, size: 'w-14 h-14' },
  { kind: 'crown', left: '15%', bottom: '65%', rotate: 15, size: 'w-20 h-20' },
  { kind: 'coin', left: '65%', bottom: '70%', rotate: -45, size: 'w-16 h-16' },
  { kind: 'gem', left: '40%', bottom: '80%', rotate: 0, size: 'w-14 h-14' },
];

const lootLanguageStyle = { stroke: '#1E293B', strokeWidth: 3, strokeLinejoin: 'round' as const };

function LootShape({ kind, rarity }: { kind: LootItemDef['kind']; rarity: RarityTier }) {
  const rarityCfg = RARITY_CONFIG[rarity];
  if (kind === 'coin') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="44" fill="#FDE047" {...lootLanguageStyle} />
        <circle cx="50" cy="50" r="30" fill="#F59E0B" {...lootLanguageStyle} />
        <polygon points="50,28 57,45 75,50 57,55 50,72 43,55 25,50 43,45" fill={rarityCfg.glow} />
      </svg>
    );
  }
  if (kind === 'crown') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M12 72 L20 24 L36 44 L50 18 L64 44 L80 24 L88 72 Z" fill="#F59E0B" {...lootLanguageStyle} />
        <rect x="12" y="68" width="76" height="16" rx="5" fill="#D97706" {...lootLanguageStyle} />
        <circle cx="50" cy="34" r="7" fill={rarityCfg.color} {...lootLanguageStyle} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="50,8 90,40 70,92 30,92 10,40" fill={rarityCfg.color} {...lootLanguageStyle} />
      <polygon points="50,24 72,42 62,76 38,76 28,42" fill={rarityCfg.glow} opacity="0.7" />
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
      style={{ left: item.left, bottom: item.bottom, filter: `drop-shadow(0 0 14px ${rarityCfg.trailColor})` }}
      initial={isLatest ? { y: -300, scale: 1.8, rotate: 180, opacity: 0 } : false}
      animate={isLatest ? { y: 0, scale: 1, rotate: item.rotate, opacity: 1 } : { rotate: item.rotate }}
      transition={isLatest ? { type: 'spring', damping: 12, stiffness: 180, delay } : { duration: 2.6, repeat: Infinity, repeatType: 'mirror' }}
    >
      <LootShape kind={item.kind} rarity={rarity} />
    </motion.div>
  );
}
