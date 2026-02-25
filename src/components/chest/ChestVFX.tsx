import React from 'react';
import { motion } from 'motion/react';
import { CHEST_STYLE_GUIDE, RarityTier, RARITY_CONFIG } from './chestStyleGuide';

const ambientSparkles = [
  { left: '12%', bottom: '55%', size: 8, delay: 0 },
  { left: '25%', bottom: '80%', size: 5, delay: 0.2 },
  { left: '40%', bottom: '68%', size: 6, delay: 0.7 },
  { left: '57%', bottom: '82%', size: 4, delay: 1.1 },
  { left: '74%', bottom: '72%', size: 7, delay: 0.4 },
  { left: '88%', bottom: '60%', size: 5, delay: 0.9 },
];

export function ChestVFX({ rarity, openingBurst }: { rarity: RarityTier; openingBurst: boolean }) {
  const rarityCfg = RARITY_CONFIG[rarity];
  return (
    <>
      <motion.div
        animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.08, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 w-96 h-64 blur-[60px] rounded-full"
        style={{ backgroundColor: `${CHEST_STYLE_GUIDE.palette.bgGlowPrimary}66` }}
      />
      <motion.div
        animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 0.95, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 w-80 h-48 blur-[40px] rounded-full"
        style={{ backgroundColor: `${CHEST_STYLE_GUIDE.palette.bgGlowSecondary}66` }}
      />

      <div className="absolute inset-0 pointer-events-none z-0">
        {ambientSparkles.map((sparkle, index) => (
          <motion.div
            key={`sparkle-${index}`}
            className="absolute rounded-full bg-white"
            style={{ left: sparkle.left, bottom: sparkle.bottom, width: sparkle.size, height: sparkle.size }}
            animate={{ opacity: [0.1, 0.9, 0.1], y: [0, -10, 0], scale: [0.7, 1.1, 0.7] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: sparkle.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none z-40"
        style={{ background: `radial-gradient(circle at 50% 55%, transparent 40%, ${CHEST_STYLE_GUIDE.palette.vignette} 100%)` }}
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {openingBurst && (
        <motion.div
          className="absolute bottom-16 w-80 h-80 rounded-full z-50 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${rarityCfg.glow} 0%, transparent 60%)` }}
          initial={{ opacity: 0.95, scale: 0.3 }}
          animate={{ opacity: 0, scale: 1.8 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </>
  );
}
