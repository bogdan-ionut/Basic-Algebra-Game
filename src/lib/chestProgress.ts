export type ChestProgress = {
  score: number;
  itemsCount: number;
  totalChests: number;
};

const normalizeScore = (score: number) => {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.floor(score));
};

export function getChestProgress(score: number): ChestProgress {
  const normalizedScore = normalizeScore(score);

  return {
    score: normalizedScore,
    itemsCount: normalizedScore % 10,
    totalChests: Math.floor(normalizedScore / 10),
  };
}
