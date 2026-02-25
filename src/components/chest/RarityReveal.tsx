import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RarityTier, RARITY_CONFIG } from './chestStyleGuide';

export function RarityReveal({ rarity, visible }: { rarity: RarityTier; visible: boolean }) {
  const rarityCfg = RARITY_CONFIG[rarity];
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.6 }}
          animate={{ opacity: 1, y: -150, scale: 1 }}
          exit={{ opacity: 0, y: -210, scale: 1.2 }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-32 z-50 flex flex-col items-center pointer-events-none"
        >
          <div
            className="px-4 py-2 rounded-2xl text-white font-black tracking-wide"
            style={{ background: `linear-gradient(135deg, ${rarityCfg.color}, ${rarityCfg.glow})` }}
          >
            {rarityCfg.label.toUpperCase()}
          </div>
          <motion.div
            className="mt-2 h-1 w-32 rounded-full"
            style={{ backgroundColor: rarityCfg.trailColor }}
            animate={{ width: [20, 130, 40], opacity: [0.2, 1, 0.15] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
