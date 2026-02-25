import React from 'react';
import { motion } from 'motion/react';
import { CHEST_STYLE_GUIDE, RarityTier, RARITY_CONFIG } from './chestStyleGuide';

const ambientSparkles = [
  { left: '8%', bottom: '50%', size: 7, delay: 0 },
  { left: '18%', bottom: '76%', size: 4, delay: 0.2 },
  { left: '34%', bottom: '66%', size: 6, delay: 0.7 },
  { left: '46%', bottom: '86%', size: 5, delay: 1.1 },
  { left: '63%', bottom: '72%', size: 6, delay: 0.4 },
  { left: '78%', bottom: '84%', size: 5, delay: 0.9 },
  { left: '92%', bottom: '58%', size: 6, delay: 0.6 },
];

const rays = [
  { left: '28%', rotation: -20, delay: 0 },
  { left: '42%', rotation: -8, delay: 0.18 },
  { left: '58%', rotation: 10, delay: 0.35 },
  { left: '72%', rotation: 22, delay: 0.5 },
];

export function ChestVFX({ rarity, openingBurst }: { rarity: RarityTier; openingBurst: boolean }) {
  const rarityCfg = RARITY_CONFIG[rarity];
  return (
    <>
      <motion.div
        animate={{ opacity: [0.5, 0.82, 0.5], scale: [1, 1.12, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 w-[26rem] h-64 blur-[68px] rounded-full"
        style={{ backgroundColor: `${CHEST_STYLE_GUIDE.palette.bgGlowPrimary}66` }}
      />
      <motion.div
        animate={{ opacity: [0.32, 0.62, 0.32], scale: [1, 0.94, 1] }}
        transition={{ duration: 2.9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 w-80 h-52 blur-[44px] rounded-full"
        style={{ backgroundColor: `${CHEST_STYLE_GUIDE.palette.bgGlowSecondary}66` }}
      />
      <motion.div
        animate={{ opacity: [0.2, 0.45, 0.2], scale: [1, 1.08, 1] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-2 w-64 h-36 blur-[34px] rounded-full"
        style={{ backgroundColor: `${CHEST_STYLE_GUIDE.palette.bgGlowAccent}66` }}
      />

      <div className="absolute inset-0 pointer-events-none z-0">
        {rays.map((ray, index) => (
          <motion.div
            key={`ray-${index}`}
            className="absolute bottom-20 w-4 h-36 rounded-full blur-sm"
            style={{
              left: ray.left,
              transform: `rotate(${ray.rotation}deg)`,
              background: `linear-gradient(to top, transparent 0%, ${rarityCfg.glow}AA 45%, transparent 100%)`,
            }}
            animate={{ opacity: [0.18, 0.65, 0.18], scaleY: [0.9, 1.2, 0.9] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: ray.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none z-0">
        {ambientSparkles.map((sparkle, index) => (
          <motion.div
            key={`sparkle-${index}`}
            className="absolute rounded-full bg-white"
            style={{ left: sparkle.left, bottom: sparkle.bottom, width: sparkle.size, height: sparkle.size }}
            animate={{ opacity: [0.12, 0.95, 0.12], y: [0, -12, 0], scale: [0.7, 1.2, 0.7] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: sparkle.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none z-40"
        style={{ background: `radial-gradient(circle at 50% 55%, transparent 38%, ${CHEST_STYLE_GUIDE.palette.vignette} 100%)` }}
        animate={{ opacity: [0.78, 1, 0.78] }}
        transition={{ duration: 5.4, repeat: Infinity }}
      />

      {openingBurst && (
        <>
          <motion.div
            className="absolute bottom-16 w-80 h-80 rounded-full z-50 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${rarityCfg.glow} 0%, transparent 62%)` }}
            initial={{ opacity: 0.95, scale: 0.32 }}
            animate={{ opacity: 0, scale: 1.85 }}
            transition={{ duration: 0.62 }}
          />
          <motion.div
            className="absolute bottom-12 w-64 h-64 rounded-full z-50 pointer-events-none"
            style={{ border: `2px solid ${rarityCfg.glow}` }}
            initial={{ opacity: 0.9, scale: 0.3 }}
            animate={{ opacity: 0, scale: 1.9 }}
            transition={{ duration: 0.72 }}
          />
        </>
      )}
    </>
  );
}
