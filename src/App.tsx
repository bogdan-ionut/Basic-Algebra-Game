/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Star, Apple, Heart, Smile, Settings, Snail, ShieldAlert, Rocket, Trophy, PlayCircle } from 'lucide-react';
import { loadDailyStats, saveDailyStats, loadUserProfile, saveUserProfile, DailyStats, UserProfile, getTodayDateString, getDateStringDaysAgo } from './lib/db';
import { DailyRing } from './components/DailyRing';
import { ParentDashboard } from './components/ParentDashboard';

// Audio Context for Multi-sensory feedback
const playSound = (type: 'success' | 'error' | 'levelUp' | 'speedBump') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'success') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); // C6
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'error') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'levelUp') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      oscillator.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.1); // C#5
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2); // E5
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'speedBump') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    }
  } catch (e) {
    console.log('Audio not supported or blocked');
  }
};

const ICONS = [Star, Apple, Heart, Smile, Rocket];
const COLORS = ['text-yellow-400', 'text-red-500', 'text-pink-500', 'text-blue-500', 'text-purple-500'];

// High-Fidelity SVG Components for Treasures
const GoldCoin = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 6px 8px rgba(0,0,0,0.5))' }}>
    <circle cx="50" cy="50" r="45" fill="url(#coin-edge)" />
    <circle cx="50" cy="50" r="38" fill="url(#coin-face)" />
    <path d="M50 25 L55 45 L75 50 L55 55 L50 75 L45 55 L25 50 L45 45 Z" fill="#FFFBEB" opacity="0.9" />
    <circle cx="35" cy="35" r="8" fill="#FFFFFF" opacity="0.8" />
    <defs>
      <linearGradient id="coin-edge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#B45309" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <linearGradient id="coin-face" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

const RubyGem = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 8px 12px rgba(225,29,72,0.6))' }}>
    <polygon points="50,95 10,40 30,10 70,10 90,40" fill="url(#ruby-dark)" />
    <polygon points="50,95 10,40 50,40" fill="url(#ruby-mid)" />
    <polygon points="50,95 90,40 50,40" fill="url(#ruby-darker)" />
    <polygon points="10,40 30,10 50,40" fill="url(#ruby-light)" />
    <polygon points="90,40 70,10 50,40" fill="url(#ruby-mid)" />
    <polygon points="30,10 70,10 50,40" fill="url(#ruby-highlight)" />
    <polygon points="35,15 65,15 50,35" fill="#FFFFFF" opacity="0.9" />
    <defs>
      <linearGradient id="ruby-dark" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#BE123C"/><stop offset="100%" stopColor="#4C0519"/></linearGradient>
      <linearGradient id="ruby-mid" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#E11D48"/><stop offset="100%" stopColor="#9F1239"/></linearGradient>
      <linearGradient id="ruby-darker" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#9F1239"/><stop offset="100%" stopColor="#4C0519"/></linearGradient>
      <linearGradient id="ruby-light" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FB7185"/><stop offset="100%" stopColor="#E11D48"/></linearGradient>
      <linearGradient id="ruby-highlight" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#FDA4AF"/><stop offset="100%" stopColor="#F43F5E"/></linearGradient>
    </defs>
  </svg>
);

const EmeraldGem = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 8px 12px rgba(16,185,129,0.6))' }}>
    <polygon points="50,10 90,50 50,90 10,50" fill="url(#emerald-bg)" />
    <polygon points="50,10 90,50 50,50" fill="url(#emerald-light)" />
    <polygon points="90,50 50,90 50,50" fill="url(#emerald-dark)" />
    <polygon points="50,90 10,50 50,50" fill="url(#emerald-darker)" />
    <polygon points="10,50 50,10 50,50" fill="url(#emerald-mid)" />
    <polygon points="40,25 60,25 60,45 40,45" fill="#FFFFFF" opacity="0.9" transform="rotate(45 50 35)" />
    <defs>
      <linearGradient id="emerald-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#059669"/><stop offset="100%" stopColor="#022C22"/></linearGradient>
      <linearGradient id="emerald-light" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6EE7B7"/><stop offset="100%" stopColor="#10B981"/></linearGradient>
      <linearGradient id="emerald-mid" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#34D399"/><stop offset="100%" stopColor="#059669"/></linearGradient>
      <linearGradient id="emerald-dark" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#059669"/><stop offset="100%" stopColor="#064E3B"/></linearGradient>
      <linearGradient id="emerald-darker" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#047857"/><stop offset="100%" stopColor="#022C22"/></linearGradient>
    </defs>
  </svg>
);

const SapphireGem = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 8px 12px rgba(59,130,246,0.6))' }}>
    <polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" fill="url(#sapphire-bg)" />
    <polygon points="30,10 70,10 50,50" fill="url(#sapphire-light)" />
    <polygon points="70,10 90,30 50,50" fill="url(#sapphire-mid)" />
    <polygon points="90,30 90,70 50,50" fill="url(#sapphire-dark)" />
    <polygon points="90,70 70,90 50,50" fill="url(#sapphire-darker)" />
    <polygon points="70,90 30,90 50,50" fill="url(#sapphire-darkest)" />
    <polygon points="30,90 10,70 50,50" fill="url(#sapphire-darker)" />
    <polygon points="10,70 10,30 50,50" fill="url(#sapphire-mid)" />
    <polygon points="10,30 30,10 50,50" fill="url(#sapphire-light)" />
    <circle cx="35" cy="35" r="10" fill="#FFFFFF" opacity="0.9" />
    <defs>
      <linearGradient id="sapphire-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1D4ED8"/><stop offset="100%" stopColor="#172554"/></linearGradient>
      <linearGradient id="sapphire-light" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#93C5FD"/><stop offset="100%" stopColor="#3B82F6"/></linearGradient>
      <linearGradient id="sapphire-mid" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#2563EB"/></linearGradient>
      <linearGradient id="sapphire-dark" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#1D4ED8"/></linearGradient>
      <linearGradient id="sapphire-darker" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1E40AF"/><stop offset="100%" stopColor="#1E3A8A"/></linearGradient>
      <linearGradient id="sapphire-darkest" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1E3A8A"/><stop offset="100%" stopColor="#172554"/></linearGradient>
    </defs>
  </svg>
);

const RoyalCrown = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.6))' }}>
    {/* Back of crown */}
    <path d="M15,70 L85,70 L90,80 L10,80 Z" fill="url(#crown-dark)" />
    {/* Front of crown */}
    <path d="M15,70 L10,20 L30,45 L50,10 L70,45 L90,20 L85,70 Z" fill="url(#crown-gold)" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />
    {/* Highlights */}
    <path d="M15,70 L10,20 L30,45 L50,10 L70,45 L90,20 L85,70 Z" fill="url(#crown-highlight)" opacity="0.6" />
    {/* Base rim */}
    <rect x="10" y="70" width="80" height="15" rx="5" fill="url(#crown-gold)" stroke="#B45309" strokeWidth="2" />
    <rect x="12" y="72" width="76" height="5" fill="#FEF08A" opacity="0.5" rx="2" />
    
    {/* Jewels */}
    <circle cx="10" cy="20" r="8" fill="url(#ruby-mid)" stroke="#FEF08A" strokeWidth="2" />
    <circle cx="50" cy="10" r="10" fill="url(#sapphire-mid)" stroke="#FEF08A" strokeWidth="2" />
    <circle cx="90" cy="20" r="8" fill="url(#ruby-mid)" stroke="#FEF08A" strokeWidth="2" />
    
    <circle cx="30" cy="77" r="5" fill="url(#emerald-mid)" />
    <circle cx="50" cy="77" r="6" fill="url(#ruby-mid)" />
    <circle cx="70" cy="77" r="5" fill="url(#emerald-mid)" />
    
    <defs>
      <linearGradient id="crown-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="crown-dark" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#92400E" />
        <stop offset="100%" stopColor="#451A03" />
      </linearGradient>
      <linearGradient id="crown-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
  </svg>
);

const TREASURE_ITEMS = [
  { component: GoldCoin, left: '15%', bottom: '10%', rotate: -15, size: 'w-20 h-20' },
  { component: EmeraldGem, left: '55%', bottom: '5%', rotate: 20, size: 'w-16 h-16' },
  { component: RoyalCrown, left: '30%', bottom: '20%', rotate: -5, size: 'w-24 h-24' },
  { component: SapphireGem, left: '10%', bottom: '35%', rotate: 45, size: 'w-16 h-16' },
  { component: RubyGem, left: '70%', bottom: '30%', rotate: -20, size: 'w-16 h-16' },
  { component: GoldCoin, left: '25%', bottom: '45%', rotate: 10, size: 'w-20 h-20' },
  { component: SapphireGem, left: '50%', bottom: '55%', rotate: -30, size: 'w-16 h-16' },
  { component: RoyalCrown, left: '15%', bottom: '65%', rotate: 15, size: 'w-24 h-24' },
  { component: GoldCoin, left: '65%', bottom: '70%', rotate: -45, size: 'w-20 h-20' },
  { component: RubyGem, left: '40%', bottom: '80%', rotate: 0, size: 'w-16 h-16' },
];

const CHEST_VISUAL_TOKENS = {
  glowPrimary: '#A855F7',
  glowSecondary: '#FBBF24',
  woodDeep: '#3E1F00',
};

function TreasureChest({ score, latestItem }: { score: number, latestItem: number | null }) {
  const itemsCount = score % 10;
  const totalChests = Math.floor(score / 10);
  const [justCompleted, setJustCompleted] = useState(false);
  const prevScoreRef = useRef(score);
  const ambientSparkles = useMemo(
    () => [
      { left: '12%', bottom: '55%', size: 8, delay: 0 },
      { left: '25%', bottom: '80%', size: 5, delay: 0.2 },
      { left: '40%', bottom: '68%', size: 6, delay: 0.7 },
      { left: '57%', bottom: '82%', size: 4, delay: 1.1 },
      { left: '74%', bottom: '72%', size: 7, delay: 0.4 },
      { left: '88%', bottom: '60%', size: 5, delay: 0.9 },
    ],
    []
  );

  useEffect(() => {
    if (score > prevScoreRef.current && itemsCount === 0 && score > 0) {
      setJustCompleted(true);
      playSound('levelUp');
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.7 },
        colors: ['#FFD700', '#FFA500', '#FF4500', '#00FF00', '#00FFFF']
      });
      setTimeout(() => setJustCompleted(false), 4000);
    }
    prevScoreRef.current = score;
  }, [score, itemsCount]);

  return (
    <div className="relative w-full max-w-md mx-auto mt-16 h-72 flex items-end justify-center perspective-[2000px]">
      
      {/* Magical Background Glow */}
      <motion.div
        animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.08, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 w-96 h-64 blur-[60px] rounded-full"
        style={{ backgroundColor: `${CHEST_VISUAL_TOKENS.glowPrimary}55` }}
      />
      <motion.div
        animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 0.95, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 w-80 h-48 blur-[40px] rounded-full"
        style={{ backgroundColor: `${CHEST_VISUAL_TOKENS.glowSecondary}66` }}
      />

      {/* Ambient Sparkles */}
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

      {/* The Chest Container - High Fidelity 3D */}
      <motion.div
        className="relative w-80 h-64 z-10"
        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(15deg)' }}
        animate={{ y: [0, -4, 0], rotateZ: [0, 0.5, 0, -0.5, 0] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        
        {/* Chest Lid (Animated) */}
        <motion.div 
          animate={{ 
            rotateX: justCompleted ? 0 : [-108, -112, -108],
            y: justCompleted ? 0 : -10,
          }}
          transition={justCompleted ? { type: 'spring', bounce: 0.4, duration: 1.2 } : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 w-full h-40 origin-bottom z-0"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <svg viewBox="0 0 320 160" className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Inner Lid Glow */}
            <path d="M20,150 C20,60 50,20 160,20 C270,20 300,60 300,150 Z" fill="url(#lid-glow)" />
            
            {/* Inner Lid Wood */}
            <path d="M20,150 C20,60 50,20 160,20 C270,20 300,60 300,150 Z" fill="#4A2500" stroke="#2D1600" strokeWidth="4" opacity="0.9" />
            
            {/* Inner Wood Planks */}
            <path d="M25,130 C40,70 70,40 160,40 C250,40 280,70 295,130" fill="none" stroke="#2D1600" strokeWidth="3" opacity="0.6" />
            <path d="M35,110 C60,60 90,60 160,60 C230,60 260,60 285,110" fill="none" stroke="#2D1600" strokeWidth="3" opacity="0.6" />
            
            {/* Outer Lid Edge (Gold Trim) */}
            <path d="M10,160 C10,50 40,10 160,10 C280,10 310,50 310,160 L300,150 C300,60 270,20 160,20 C50,20 20,60 20,150 Z" fill="url(#gold-trim)" stroke="#78350F" strokeWidth="2" />
            
            <defs>
              <linearGradient id="lid-glow" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="gold-trim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="20%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="80%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Chest Base (Back & Bottom Inside) */}
        <div className="absolute bottom-0 w-full h-48 z-10">
          <svg viewBox="0 0 320 180" className="w-full h-full">
            {/* Inside Bottom (Floor of the chest) */}
            <path d="M30,160 L290,160 L270,40 L50,40 Z" fill="#2D1600" />
            {/* Magical Pool inside */}
            <path d="M40,150 L280,150 L260,50 L60,50 Z" fill="url(#magic-pool)" opacity="0.8" />
            {/* Inside Back Wall */}
            <path d="M50,40 L270,40 L270,10 L50,10 Z" fill="#1A0D00" />
            {/* Inside Left Wall */}
            <path d="M30,160 L50,40 L50,10 L30,130 Z" fill="#241100" />
            {/* Inside Right Wall */}
            <path d="M290,160 L270,40 L270,10 L290,130 Z" fill="#241100" />
            
            <defs>
              <radialGradient id="magic-pool" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C084FC" stopOpacity="1" />
                <stop offset="50%" stopColor="#9333EA" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#4C1D95" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Accumulated Treasures (Placed inside the 3D space) */}
        <div className="absolute bottom-8 left-8 right-8 h-40 z-20" style={{ transform: 'rotateX(-15deg)' }}>
          <AnimatePresence>
            {!justCompleted && Array.from({ length: itemsCount }).map((_, i) => {
              const item = TREASURE_ITEMS[i % TREASURE_ITEMS.length];
              const ItemComponent = item.component;
              const isLatest = latestItem === i && score > 0;
              
              return (
                <motion.div
                  key={`${totalChests}-${i}`}
                  initial={isLatest ? { y: -600, scale: 3, rotate: 180, opacity: 0 } : false}
                  animate={isLatest ? { y: 0, scale: 1, rotate: item.rotate, opacity: 1 } : { rotate: item.rotate }}
                  transition={isLatest ? { type: "spring", bounce: 0.5, duration: 1.5 } : { duration: 0 }}
                  className={`absolute`}
                  style={{ left: item.left, bottom: item.bottom, zIndex: i }}
                >
                  {/* Intense Glow effect for the latest item */}
                  {isLatest && (
                    <motion.div 
                      initial={{ opacity: 1, scale: 0.5 }}
                      animate={{ opacity: 0, scale: 3 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="absolute inset-0 bg-white rounded-full blur-2xl"
                    />
                  )}
                  <ItemComponent className={`${item.size} drop-shadow-[0_8px_8px_rgba(0,0,0,0.55)]`} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Chest Front Wall (Outer) - High Fidelity */}
        <div className="absolute bottom-0 w-full h-32 z-30 drop-shadow-[0_35px_35px_rgba(0,0,0,0.8)]">
          <svg viewBox="0 0 320 120" className="w-full h-full overflow-visible">
            {/* Front Wood Panel */}
            <path d="M20,0 L300,0 L310,100 C310,110 305,115 295,115 L25,115 C15,115 10,110 10,100 Z" fill="url(#wood-front)" stroke={CHEST_VISUAL_TOKENS.woodDeep} strokeWidth="4" />
            
            {/* Wood Planks Lines */}
            <path d="M15,30 Q160,35 305,30" fill="none" stroke="#5C2E00" strokeWidth="4" opacity="0.7" />
            <path d="M12,65 Q160,70 308,65" fill="none" stroke="#5C2E00" strokeWidth="4" opacity="0.7" />
            <path d="M10,95 Q160,100 310,95" fill="none" stroke="#5C2E00" strokeWidth="4" opacity="0.7" />
            
            {/* Gold Edge Trim */}
            <path d="M20,0 L300,0 L300,8 L20,8 Z" fill="url(#gold-trim)" />
            <path d="M10,100 L20,0 L28,0 L18,100 Z" fill="url(#gold-trim)" />
            <path d="M310,100 L300,0 L292,0 L302,100 Z" fill="url(#gold-trim)" />
            <path d="M10,100 L310,100 L305,115 L15,115 Z" fill="url(#gold-trim)" />

            {/* Metal Bands (Gold/Brass) */}
            <path d="M60,0 L100,0 L102,115 L58,115 Z" fill="url(#gold-trim)" stroke="#78350F" strokeWidth="2" />
            <path d="M220,0 L260,0 L262,115 L218,115 Z" fill="url(#gold-trim)" stroke="#78350F" strokeWidth="2" />
            
            {/* Large Rivets */}
            <circle cx="80" cy="20" r="6" fill="url(#rivet-grad)" stroke="#78350F" strokeWidth="1" />
            <circle cx="80" cy="60" r="6" fill="url(#rivet-grad)" stroke="#78350F" strokeWidth="1" />
            <circle cx="80" cy="100" r="6" fill="url(#rivet-grad)" stroke="#78350F" strokeWidth="1" />
            
            <circle cx="240" cy="20" r="6" fill="url(#rivet-grad)" stroke="#78350F" strokeWidth="1" />
            <circle cx="240" cy="60" r="6" fill="url(#rivet-grad)" stroke="#78350F" strokeWidth="1" />
            <circle cx="240" cy="100" r="6" fill="url(#rivet-grad)" stroke="#78350F" strokeWidth="1" />

            {/* Ornate Lock Base */}
            <path d="M120,0 L200,0 L200,30 C200,80 160,90 160,90 C160,90 120,80 120,30 Z" fill="url(#gold-trim)" stroke="#78350F" strokeWidth="3" />
            <path d="M130,10 L190,10 L190,30 C190,65 160,75 160,75 C160,75 130,65 130,30 Z" fill="#8B4513" stroke="#5C2E00" strokeWidth="2" />
            
            {/* Keyhole */}
            <circle cx="160" cy="35" r="8" fill="#1A0D00" />
            <path d="M155,35 L165,35 L168,60 L152,60 Z" fill="#1A0D00" />
            
            <defs>
              <linearGradient id="wood-front" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#B45309" />
                <stop offset="50%" stopColor="#92400E" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
              <radialGradient id="rivet-grad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#B45309" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Metal Shimmer Sweep */}
        <motion.div
          className="absolute bottom-2 left-3 right-3 h-28 z-40 pointer-events-none"
          style={{ background: `linear-gradient(110deg, transparent 35%, ${CHEST_VISUAL_TOKENS.glowSecondary}66 50%, transparent 65%)` }}
          animate={{ x: ['-120%', '120%'] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
        />
      </motion.div>
      
      {/* Completed Chests Counter Badge */}
      <motion.div 
        animate={justCompleted ? { scale: [1, 1.5, 1], rotate: [0, -20, 20, 0] } : {}}
        transition={{ duration: 0.8 }}
        className="absolute bottom-4 -right-6 md:-right-12 bg-gradient-to-br from-purple-600 to-indigo-900 px-6 py-3 rounded-3xl font-black text-white shadow-[0_20px_40px_rgba(76,29,149,0.6)] border-4 border-yellow-400 flex items-center gap-4 z-50"
      >
        <div className="w-10 h-8 bg-amber-600 rounded-md border-2 border-amber-900 relative shadow-inner">
          <div className="absolute -top-4 -inset-x-1 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-t-xl border-2 border-amber-900"></div>
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-3 bg-zinc-800 rounded-full"></div>
        </div>
        <span className="text-4xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">x {totalChests}</span>
      </motion.div>

      {/* Chest Complete Animation Overlay */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -150, scale: 1.2 }}
            exit={{ opacity: 0, y: -200, scale: 1.5 }}
            className="absolute bottom-32 z-50 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] whitespace-nowrap flex flex-col items-center"
            style={{ WebkitTextStroke: '2px #78350F' }}
          >
            <span className="text-white text-2xl mb-2 drop-shadow-md" style={{ WebkitTextStroke: '1px #000' }}>Cufăr Nou!</span>
            +1 📦
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [num1, setNum1] = useState(1);
  const [num2, setNum2] = useState(1);
  const [options, setOptions] = useState<number[]>([]);
  const [iconIndex, setIconIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState<number | null>(null);

  // Alpha School State
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isParentDashboardOpen, setIsParentDashboardOpen] = useState(false);
  const [problemStartTime, setProblemStartTime] = useState<number>(Date.now());

  // Alpha School Step 2 State (AI Tutor)
  const [isSpeedBumpActive, setIsSpeedBumpActive] = useState(false);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [levelNotification, setLevelNotification] = useState<'up' | 'down' | null>(null);

  // Alpha School Step 3 State (Gamification & Pomodoro)
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionLimit, setSessionLimit] = useState(600); // 10 minutes
  const [latestItemIndex, setLatestItemIndex] = useState<number | null>(null);

  const generateProblem = (level: number) => {
    // Level 1: sum up to 5. Level 2: sum up to 10.
    const maxSum = level === 1 ? 5 : 10;
    const sum = Math.floor(Math.random() * (maxSum - 1)) + 2; // 2 to maxSum
    const n1 = Math.floor(Math.random() * (sum - 1)) + 1; // 1 to sum - 1
    const n2 = sum - n1;

    setNum1(n1);
    setNum2(n2);

    // Generate 3 options including the correct answer
    const correct = sum;
    const opts = [correct];
    while (opts.length < 3) {
      const wrong = Math.floor(Math.random() * (maxSum + 2)) + 1;
      if (!opts.includes(wrong) && wrong > 0) {
        opts.push(wrong);
      }
    }
    opts.sort(() => Math.random() - 0.5);
    setOptions(opts);
    setIconIndex(Math.floor(Math.random() * ICONS.length));
    setShowSuccess(false);
    setWrongAnswer(null);
    setProblemStartTime(Date.now());
  };

  // Load data on mount
  useEffect(() => {
    const initDB = async () => {
      const stats = await loadDailyStats();
      const profile = await loadUserProfile();
      
      // Handle streak logic
      const today = getTodayDateString();
      if (profile.lastPlayedDate !== today) {
        const yesterdayStr = getDateStringDaysAgo(1);
        
        if (profile.lastPlayedDate === yesterdayStr) {
          profile.streak += 1;
        } else if (profile.lastPlayedDate !== '') {
          profile.streak = 1; // reset streak if missed a day
        } else {
          profile.streak = 1; // first time playing
        }
        profile.lastPlayedDate = today;
        await saveUserProfile(profile);
      }

      if (stats.timeSpentSeconds >= 600) {
        setSessionLimit(Math.ceil((stats.timeSpentSeconds + 1) / 600) * 600);
      }

      setDailyStats(stats);
      setUserProfile(profile);
      generateProblem(profile.difficultyLevel);
    };
    initDB();
  }, []);

  // Timer logic for timeSpentSeconds
  useEffect(() => {
    if (!hasStarted || isSessionComplete) return;

    const timer = setInterval(() => {
      setDailyStats(prev => {
        if (!prev) return prev;
        const newTime = prev.timeSpentSeconds + 1;
        
        // Pomodoro Session Limit Check
        if (newTime >= sessionLimit && !isSessionComplete) {
          setIsSessionComplete(true);
          playSound('levelUp');
          confetti({
            particleCount: 200,
            spread: 160,
            origin: { y: 0.3 },
            colors: ['#FFD700', '#FF6347', '#FF69B4', '#87CEEB', '#9370DB']
          });
        }

        const updated = { ...prev, timeSpentSeconds: newTime };
        saveDailyStats(updated);
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, isSessionComplete, sessionLimit]);

  const handleAnswer = async (ans: number) => {
    if (!dailyStats || !userProfile || isSpeedBumpActive) return;

    const timeTaken = Date.now() - problemStartTime;
    const isFastGuess = timeTaken < 1000; // less than 1 second

    let updatedStats = { ...dailyStats };
    updatedStats.totalAttempts += 1;
    
    if (isFastGuess) {
      updatedStats.fastGuesses += 1;
      setIsSpeedBumpActive(true);
      playSound('speedBump');
      setTimeout(() => setIsSpeedBumpActive(false), 3000);
    }

    let newProfile = { ...userProfile };
    let newMistakes = consecutiveMistakes;
    let newCorrect = consecutiveCorrect;

    if (ans === num1 + num2) {
      playSound('success');
      updatedStats.correctAnswers += 1;
      newProfile.score += 1;
      newMistakes = 0;
      newCorrect += 1;
      
      // Track the latest item for animation
      setLatestItemIndex((newProfile.score - 1) % 10);

      // Level up logic (Mastery)
      if (newCorrect >= 5 && newProfile.difficultyLevel === 1) {
        newProfile.difficultyLevel = 2;
        newCorrect = 0;
        setLevelNotification('up');
        playSound('levelUp');
        setTimeout(() => setLevelNotification(null), 3000);
      }

      setUserProfile(newProfile);
      await saveUserProfile(newProfile);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6347', '#FF69B4', '#87CEEB']
      });
      setShowSuccess(true);
      setTimeout(() => {
        generateProblem(newProfile.difficultyLevel);
      }, 2000);
    } else {
      playSound('error');
      newMistakes += 1;
      newCorrect = 0;
      setWrongAnswer(ans);
      setTimeout(() => setWrongAnswer(null), 500);

      // Struggle detector: level down
      if (newMistakes >= 2 && newProfile.difficultyLevel > 1) {
        newProfile.difficultyLevel = 1;
        newMistakes = 0;
        setLevelNotification('down');
        setTimeout(() => setLevelNotification(null), 3000);
        
        // Immediately generate an easier problem
        setTimeout(() => {
          generateProblem(1);
        }, 1000);
      }
      
      setUserProfile(newProfile);
      await saveUserProfile(newProfile);
    }

    setConsecutiveMistakes(newMistakes);
    setConsecutiveCorrect(newCorrect);
    setDailyStats(updatedStats);
    await saveDailyStats(updatedStats);
  };

  const Icon = ICONS[iconIndex];
  const iconColor = COLORS[iconIndex];

  if (!dailyStats || !userProfile) return null;

  // Start Screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border-4 border-sky-300"
        >
          <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-12 h-12 text-sky-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Salut, Osea!</h1>
          <p className="text-slate-600 mb-8">Ești gata pentru 10 minute de aventură matematică?</p>
          <button
            onClick={() => {
              setHasStarted(true);
              setProblemStartTime(Date.now());
            }}
            className="w-full bg-green-500 hover:bg-green-400 text-white text-2xl font-bold py-4 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-8 h-8" />
            START
          </button>
        </motion.div>
      </div>
    );
  }

  // Session Complete Screen (The Gift of Time)
  if (isSessionComplete) {
    return (
      <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border-4 border-green-400"
        >
          <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-16 h-16 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold text-green-500 mb-4">Misiune Îndeplinită!</h1>
          <p className="text-xl text-slate-600 mb-8">
            Bravo, Osea! Ai învățat super bine azi. Acum ai timp liber să te joci, să construiești sau să desenezi!
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl mb-8 flex flex-col items-center">
            <p className="text-slate-500 text-sm uppercase tracking-wider font-bold mb-4">Comoara ta de azi</p>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-10 bg-amber-600 rounded-sm border-4 border-amber-900 flex items-center justify-center">
                  <div className="w-3 h-2 bg-zinc-300 border-2 border-amber-900"></div>
                </div>
                <div className="absolute -top-3 -inset-x-1 h-5 bg-amber-700 rounded-t-md border-4 border-amber-900"></div>
              </div>
              <div className="text-5xl font-black text-slate-800">x {Math.floor(userProfile.score / 10)}</div>
            </div>
            <p className="text-amber-600 font-bold mt-4">și {userProfile.score % 10} bogății extra!</p>
          </div>

          <button
            onClick={() => {
              setIsSessionComplete(false);
              setSessionLimit(prev => prev + 600);
            }}
            className="w-full bg-sky-500 hover:bg-sky-400 text-white text-xl font-bold py-4 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 mb-4"
          >
            Vreau să mă mai joc! 🚀
          </button>

          <button
            onClick={() => setIsParentDashboardOpen(true)}
            className="text-slate-400 hover:text-slate-600 text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <Settings className="w-4 h-4" />
            Acces Părinți
          </button>
        </motion.div>

        {isParentDashboardOpen && (
          <ParentDashboard 
            onClose={() => setIsParentDashboardOpen(false)} 
            dailyStats={dailyStats} 
            userProfile={userProfile} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Top Bar with Daily Ring and Parent Access */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <DailyRing currentSeconds={dailyStats.timeSpentSeconds} targetSeconds={sessionLimit} />
        <button 
          onClick={() => setIsParentDashboardOpen(true)}
          className="p-3 bg-white/50 rounded-full shadow-sm border-2 border-white/60 backdrop-blur-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-sky-300 relative mt-16 z-10 mb-4">
        
        {/* Header */}
        <div className="bg-sky-400 p-6 text-center">
          <h1 className="text-3xl font-bold text-white drop-shadow-md">
            Bravo, Osea!
          </h1>
        </div>

        {/* Game Area */}
        <div className="p-8 flex flex-col items-center gap-8">
          
          {/* Visual Representation */}
          <div className="flex items-center justify-center gap-4 text-4xl font-bold text-slate-700 w-full">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-wrap justify-center gap-1 min-h-[4rem]">
                {Array.from({ length: num1 }).map((_, i) => (
                  <motion.div
                    key={`n1-${i}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Icon className={`w-8 h-8 ${iconColor} fill-current`} />
                  </motion.div>
                ))}
              </div>
              <span className="text-5xl text-sky-500">{num1}</span>
            </div>

            <span className="text-5xl text-slate-400 pb-10">+</span>

            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-wrap justify-center gap-1 min-h-[4rem]">
                {Array.from({ length: num2 }).map((_, i) => (
                  <motion.div
                    key={`n2-${i}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Icon className={`w-8 h-8 ${iconColor} fill-current`} />
                  </motion.div>
                ))}
              </div>
              <span className="text-5xl text-sky-500">{num2}</span>
            </div>
          </div>

          <div className="text-6xl font-bold text-slate-700">
            =
          </div>

          {/* Options */}
          <div className="flex gap-4 w-full justify-center relative">
            {options.map((opt, i) => (
              <motion.button
                key={`${opt}-${i}`}
                whileHover={!isSpeedBumpActive ? { scale: 1.1 } : {}}
                whileTap={!isSpeedBumpActive ? { scale: 0.9 } : {}}
                animate={wrongAnswer === opt ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                onClick={() => !showSuccess && !isSpeedBumpActive && handleAnswer(opt)}
                className={`
                  w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-4xl sm:text-5xl font-bold shadow-lg flex items-center justify-center
                  transition-colors duration-200
                  ${isSpeedBumpActive ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 border-b-4 border-slate-400' : 'cursor-pointer'}
                  ${!isSpeedBumpActive && showSuccess && opt === num1 + num2 
                    ? 'bg-green-400 text-white border-b-4 border-green-600' 
                    : !isSpeedBumpActive && wrongAnswer === opt
                    ? 'bg-red-400 text-white border-b-4 border-red-600'
                    : !isSpeedBumpActive
                    ? 'bg-yellow-400 text-white border-b-4 border-yellow-600 hover:bg-yellow-300'
                    : ''
                  }
                `}
              >
                {opt}
              </motion.button>
            ))}
          </div>

          {/* Success Message - Moved up so it doesn't block the chest */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-40 pointer-events-none"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-3xl shadow-2xl border-4 border-green-400 flex flex-col items-center"
                >
                  <Star className="w-16 h-16 text-yellow-400 fill-yellow-400 mb-2 drop-shadow-lg" />
                  <h2 className="text-4xl font-black text-green-500 drop-shadow-sm">Corect!</h2>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Treasure Chest Reward System */}
          <TreasureChest score={userProfile.score} latestItem={latestItemIndex} />

          {/* Speed Bump Overlay */}
          <AnimatePresence>
            {isSpeedBumpActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4 w-[90%] max-w-sm"
              >
                <Snail className="w-12 h-12 animate-pulse" />
                <div>
                  <h3 className="text-xl font-bold">Prea repede!</h3>
                  <p className="text-orange-100 font-medium text-sm">Gândește-te puțin la răspuns...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level Notification */}
          <AnimatePresence>
            {levelNotification && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`absolute top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 whitespace-nowrap ${
                  levelNotification === 'up' ? 'bg-green-500 text-white' : 'bg-sky-500 text-white'
                }`}
              >
                <ShieldAlert className="w-6 h-6" />
                <span className="font-bold">
                  {levelNotification === 'up' ? 'Nivel Nou Deblocat! 🚀' : 'Hai să exersăm mai ușor! 🎈'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isParentDashboardOpen && (
        <ParentDashboard 
          onClose={() => setIsParentDashboardOpen(false)} 
          dailyStats={dailyStats} 
          userProfile={userProfile} 
        />
      )}
    </div>
  );
}
