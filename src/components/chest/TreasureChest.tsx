import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ChestProgress } from '../../lib/chestProgress';
import { ChestShell, ChestPhase } from './ChestShell';
import { ChestVFX } from './ChestVFX';
import { LootItem, TREASURE_ITEMS } from './LootItem';
import { getRarityTier, RARITY_CONFIG } from './chestStyleGuide';
import { RarityReveal } from './RarityReveal';

function playRaritySfx(score: number) {
  const rarity = getRarityTier(score);
  const notes = RARITY_CONFIG[rarity].sfxFrequencies;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    notes.forEach((frequency, idx) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = rarity === 'legendary' ? 'square' : rarity === 'epic' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + idx * 0.08);
      gainNode.gain.setValueAtTime(0.09, audioCtx.currentTime + idx * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.08 + 0.35);
      oscillator.start(audioCtx.currentTime + idx * 0.08);
      oscillator.stop(audioCtx.currentTime + idx * 0.08 + 0.35);
    });
  } catch {
    console.log('Audio not supported or blocked');
  }
}

export function TreasureChest({ progress, latestItem }: { progress: ChestProgress; latestItem: number | null }) {
  const [justCompleted, setJustCompleted] = useState(false);
  const [phase, setPhase] = useState<ChestPhase>('idle');
  const prevScoreRef = useRef(progress.score);
  const rarity = getRarityTier(progress.score);

  useEffect(() => {
    if (progress.score > prevScoreRef.current && progress.itemsCount === 0 && progress.score > 0) {
      setJustCompleted(true);
      setPhase('anticipation');
      playRaritySfx(progress.score);

      const anticipation = setTimeout(() => setPhase('impact'), 250);
      const settle = setTimeout(() => setPhase('settle'), 620);
      const backIdle = setTimeout(() => setPhase('idle'), 1600);
      const hideBanner = setTimeout(() => setJustCompleted(false), 2300);

      confetti({
        particleCount: 180,
        spread: 120,
        origin: { y: 0.7 },
        colors: ['#FFD700', '#A855F7', '#3B82F6', '#F59E0B', '#FFFFFF'],
      });

      return () => {
        clearTimeout(anticipation);
        clearTimeout(settle);
        clearTimeout(backIdle);
        clearTimeout(hideBanner);
      };
    }

    prevScoreRef.current = progress.score;
    return undefined;
  }, [progress]);

  const lootDelay = useMemo(() => RARITY_CONFIG[rarity].openingDuration / 4, [rarity]);

  return (
    <div className="relative w-full max-w-md mx-auto mt-16 h-72 flex items-end justify-center perspective-[2000px] overflow-hidden">
      <ChestVFX rarity={rarity} openingBurst={phase === 'impact'} />

      <ChestShell phase={phase}>
        <AnimatePresence>
          {!justCompleted && Array.from({ length: progress.itemsCount }).map((_, i) => {
            const item = TREASURE_ITEMS[i % TREASURE_ITEMS.length];
            const isLatest = latestItem === i && progress.score > 0;
            return (
              <React.Fragment key={`${progress.totalChests}-${i}`}>
                <LootItem
                  item={item}
                  rarity={rarity}
                  isLatest={isLatest}
                  delay={i * lootDelay}
                />
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </ChestShell>

      <motion.div
        animate={justCompleted ? { scale: [1, 1.5, 1], rotate: [0, -20, 20, 0] } : {}}
        transition={{ duration: 0.8 }}
        className="absolute bottom-4 -right-6 md:-right-12 bg-gradient-to-br from-purple-600 to-indigo-900 px-6 py-3 rounded-3xl font-black text-white shadow-[0_20px_40px_rgba(76,29,149,0.6)] border-4 border-yellow-400 flex items-center gap-4 z-50"
      >
        <div className="w-10 h-8 bg-amber-600 rounded-md border-2 border-amber-900 relative shadow-inner">
          <div className="absolute -top-4 -inset-x-1 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-t-xl border-2 border-amber-900" />
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-3 bg-zinc-800 rounded-full" />
        </div>
        <span className="text-4xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">x {progress.totalChests}</span>
      </motion.div>

      <RarityReveal rarity={rarity} visible={justCompleted} />
    </div>
  );
}
