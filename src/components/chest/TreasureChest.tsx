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

function MiniChestIcon({ highlight }: { highlight: boolean }) {
  return (
    <div
      className={`relative w-10 h-8 rounded-md border-2 ${highlight ? 'border-yellow-200 shadow-[0_0_16px_rgba(250,204,21,0.75)]' : 'border-amber-800'} bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800`}
    >
      <div className="absolute -top-3 left-0 right-0 h-4 rounded-t-md border-2 border-amber-900 bg-gradient-to-b from-amber-300 to-amber-700" />
      <div className="absolute left-1 right-1 top-3 h-[3px] rounded-full bg-amber-900/60" />
      <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-2 h-2.5 rounded-full bg-zinc-800 border border-yellow-100/40" />
    </div>
  );
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
      const settle = setTimeout(() => setPhase('settle'), 640);
      const backIdle = setTimeout(() => setPhase('idle'), 1650);
      const hideBanner = setTimeout(() => setJustCompleted(false), 2400);

      confetti({
        particleCount: 220,
        spread: 130,
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

  const lootDelay = useMemo(() => RARITY_CONFIG[rarity].openingDuration / 4.6, [rarity]);
  const visibleChestHistory = Math.min(progress.totalChests, 6);

  return (
    <div className="relative w-full max-w-xl mx-auto mt-8 h-[23rem] flex items-end justify-center perspective-[2200px] overflow-visible">
      <ChestVFX rarity={rarity} openingBurst={phase === 'impact'} />

      <ChestShell phase={phase}>
        <AnimatePresence>
          {!justCompleted &&
            Array.from({ length: progress.itemsCount }).map((_, i) => {
              const item = TREASURE_ITEMS[i % TREASURE_ITEMS.length];
              const isLatest = latestItem === i && progress.score > 0;
              return <LootItem key={`${progress.totalChests}-${i}`} item={item} rarity={rarity} isLatest={isLatest} delay={i * lootDelay} />;
            })}
        </AnimatePresence>
      </ChestShell>

      <motion.div
        animate={justCompleted ? { scale: [1, 1.18, 1], rotate: [0, -8, 8, 0] } : {}}
        transition={{ duration: 0.8 }}
        className="absolute top-0 right-0 md:-right-5 bg-gradient-to-br from-purple-600 via-indigo-700 to-indigo-950 px-5 py-3 rounded-3xl font-black text-white shadow-[0_20px_40px_rgba(76,29,149,0.55)] border-4 border-yellow-400 flex items-center gap-3 z-50"
      >
        <MiniChestIcon highlight={justCompleted} />
        <span className="text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">x {progress.totalChests}</span>
      </motion.div>

      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-[70] bg-slate-900/70 backdrop-blur-sm border border-slate-200/20 rounded-2xl px-4 py-2 flex items-end gap-2 shadow-xl">
        {Array.from({ length: visibleChestHistory }).map((_, i) => (
          <motion.div
            key={`mini-history-${i}`}
            initial={i === visibleChestHistory - 1 ? { y: 10, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
          >
            <MiniChestIcon highlight={i === visibleChestHistory - 1 && justCompleted} />
          </motion.div>
        ))}
        {progress.totalChests > visibleChestHistory && (
          <span className="text-sm font-bold text-white/90 pl-1">+{progress.totalChests - visibleChestHistory}</span>
        )}
      </div>

      <RarityReveal rarity={rarity} visible={justCompleted} />
    </div>
  );
}
