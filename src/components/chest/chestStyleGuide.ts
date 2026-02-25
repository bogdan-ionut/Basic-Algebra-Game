export type RarityTier = 'common' | 'rare' | 'epic' | 'legendary';

export type RarityConfig = {
  label: string;
  color: string;
  glow: string;
  trailColor: string;
  openingDuration: number;
  sfxFrequencies: [number, number, number];
};

export const CHEST_STYLE_GUIDE = {
  contourWidth: 3,
  glowType: 'cinematic-bloom',
  materials: {
    wood: {
      base: '#8A4B1E',
      shadow: '#3A1A08',
      highlight: '#C9864A',
      deepShadow: '#241104',
    },
    metal: {
      base: '#E6B23C',
      sheen: '#FFF0B0',
      shadow: '#7A4A10',
      highlight: '#FFE39A',
    },
    gem: {
      base: '#7C3AED',
      highlight: '#E9D5FF',
      shadow: '#4C1D95',
    },
  },
  palette: {
    bgGlowPrimary: '#9333EA',
    bgGlowSecondary: '#22D3EE',
    bgGlowAccent: '#F59E0B',
    vignette: 'rgba(3, 7, 18, 0.55)',
  },
} as const;

export const RARITY_CONFIG: Record<RarityTier, RarityConfig> = {
  common: {
    label: 'Common',
    color: '#94A3B8',
    glow: '#E2E8F0',
    trailColor: 'rgba(148,163,184,0.6)',
    openingDuration: 0.8,
    sfxFrequencies: [330, 392, 494],
  },
  rare: {
    label: 'Rare',
    color: '#3B82F6',
    glow: '#93C5FD',
    trailColor: 'rgba(59,130,246,0.65)',
    openingDuration: 1,
    sfxFrequencies: [392, 494, 587],
  },
  epic: {
    label: 'Epic',
    color: '#A855F7',
    glow: '#D8B4FE',
    trailColor: 'rgba(168,85,247,0.7)',
    openingDuration: 1.2,
    sfxFrequencies: [440, 554, 659],
  },
  legendary: {
    label: 'Legendary',
    color: '#F59E0B',
    glow: '#FDE68A',
    trailColor: 'rgba(245,158,11,0.75)',
    openingDuration: 1.4,
    sfxFrequencies: [523, 659, 784],
  },
};

export function getRarityTier(score: number): RarityTier {
  const raritySeed = score % 20;
  if (raritySeed >= 18) return 'legendary';
  if (raritySeed >= 13) return 'epic';
  if (raritySeed >= 7) return 'rare';
  return 'common';
}
