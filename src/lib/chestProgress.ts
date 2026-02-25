export type ChestProgress = {
  score: number;
  itemsCount: number;
  totalChests: number;
};

export function getChestProgress(score: number): ChestProgress {
  return {
    score,
    itemsCount: score % 10,
    totalChests: Math.floor(score / 10),
  };
}
