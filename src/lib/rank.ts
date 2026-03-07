import { getChestProgress } from './chestProgress';

export type RankTier = {
  key: 'cadet' | 'mate' | 'pilot' | 'commander' | 'admiral' | 'legend';
  label: string;
  minChests: number;
  accentFrom: string;
  accentTo: string;
  glow: string;
  emblem: string;
};

export const RANK_TIERS: RankTier[] = [
  { key: 'cadet', label: 'Cadet', minChests: 0, accentFrom: '#4f8cbf', accentTo: '#67b7ff', glow: 'rgba(103,183,255,0.4)', emblem: '⬢' },
  { key: 'mate', label: 'Secund', minChests: 2, accentFrom: '#3f9e6f', accentTo: '#5ce3a0', glow: 'rgba(92,227,160,0.38)', emblem: '◆' },
  { key: 'pilot', label: 'Pilot', minChests: 5, accentFrom: '#7b64e5', accentTo: '#b491ff', glow: 'rgba(180,145,255,0.42)', emblem: '✦' },
  { key: 'commander', label: 'Comandor', minChests: 9, accentFrom: '#b45f1f', accentTo: '#ffba5a', glow: 'rgba(255,186,90,0.45)', emblem: '✪' },
  { key: 'admiral', label: 'Amiral', minChests: 14, accentFrom: '#a24053', accentTo: '#ff7d9a', glow: 'rgba(255,125,154,0.45)', emblem: '✹' },
  { key: 'legend', label: 'Legendă', minChests: 20, accentFrom: '#8a791b', accentTo: '#ffe984', glow: 'rgba(255,233,132,0.5)', emblem: '👑' },
];

export type RankSummary = {
  chestCount: number;
  tier: RankTier;
  rankNumber: number;
  progressInTier: number;
  chestsToNextTier: number;
  nextTier: RankTier | null;
};

export const getRankSummary = (score: number): RankSummary => {
  const chestCount = getChestProgress(score).totalChests;

  let tier = RANK_TIERS[0];
  for (const candidate of RANK_TIERS) {
    if (chestCount >= candidate.minChests) {
      tier = candidate;
    }
  }

  const nextTierIndex = RANK_TIERS.findIndex((entry) => entry.key === tier.key) + 1;
  const nextTier = nextTierIndex < RANK_TIERS.length ? RANK_TIERS[nextTierIndex] : null;

  const currentTierIndex = RANK_TIERS.findIndex((entry) => entry.key === tier.key);
  const previousThreshold = tier.minChests;
  const nextThreshold = nextTier?.minChests ?? previousThreshold + 5;
  const tierSpan = Math.max(1, nextThreshold - previousThreshold);
  const progressInTier = Math.min(1, Math.max(0, (chestCount - previousThreshold) / tierSpan));

  return {
    chestCount,
    tier,
    rankNumber: currentTierIndex + 1,
    progressInTier,
    chestsToNextTier: nextTier ? Math.max(0, nextThreshold - chestCount) : 0,
    nextTier,
  };
};
