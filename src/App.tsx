/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Star, Apple, Heart, Smile, Settings, Snail, ShieldAlert, Rocket, Trophy, PlayCircle } from 'lucide-react';
import { loadDailyStats, saveDailyStats, loadUserProfile, saveUserProfile, DailyStats, UserProfile, getTodayDateString } from './lib/db';
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
  <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.4))' }}>
    <circle cx="50" cy="50" r="45" fill="#F59E0B" stroke="#B45309" strokeWidth="4" />
    <circle cx="50" cy="50" r="35" fill="#FBBF24" />
    <path d="M50 25 L55 45 L75 50 L55 55 L50 75 L45 55 L25 50 L45 45 Z" fill="#FEF08A" opacity="0.8" />
    <circle cx="35" cy="35" r="8" fill="#FEF08A" opacity="0.6" />
  </svg>
);

const RubyGem = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.4))' }}>
    <polygon points="50,95 10,40 30,10 70,10 90,40" fill="#E11D48" stroke="#881337" strokeWidth="3" strokeLinejoin="round" />
    <polygon points="50,95 10,40 50,40" fill="#BE123C" />
    <polygon points="50,95 90,40 50,40" fill="#9F1239" />
    <polygon points="10,40 30,10 50,40" fill="#F43F5E" />
    <polygon points="90,40 70,10 50,40" fill="#FB7185" />
    <polygon points="30,10 70,10 50,40" fill="#FDA4AF" />
    <polygon points="35,15 65,15 50,35" fill="#FFF1F2" opacity="0.7" />
  </svg>
);

const EmeraldGem = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.4))' }}>
    <polygon points="50,10 90,50 50,90 10,50" fill="#10B981" stroke="#064E3B" strokeWidth="3" strokeLinejoin="round" />
    <polygon points="50,10 90,50 50,50" fill="#34D399" />
    <polygon points="90,50 50,90 50,50" fill="#059669" />
    <polygon points="50,90 10,50 50,50" fill="#047857" />
    <polygon points="10,50 50,10 50,50" fill="#6EE7B7" />
    <polygon points="40,25 60,25 60,45 40,45" fill="#D1FAE5" opacity="0.8" transform="rotate(45 50 35)" />
  </svg>
);

const SapphireGem = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.4))' }}>
    <polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="3" strokeLinejoin="round" />
    <polygon points="30,10 70,10 50,50" fill="#60A5FA" />
    <polygon points="70,10 90,30 50,50" fill="#2563EB" />
    <polygon points="90,30 90,70 50,50" fill="#1D4ED8" />
    <polygon points="90,70 70,90 50,50" fill="#1E40AF" />
    <polygon points="70,90 30,90 50,50" fill="#1E3A8A" />
    <polygon points="30,90 10,70 50,50" fill="#172554" />
    <polygon points="10,70 10,30 50,50" fill="#3B82F6" />
    <polygon points="10,30 30,10 50,50" fill="#93C5FD" />
    <circle cx="35" cy="35" r="10" fill="#DBEAFE" opacity="0.8" />
  </svg>
);

const RoyalCrown = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 5px 8px rgba(0,0,0,0.5))' }}>
    <path d="M10,80 L90,80 L90,90 L10,90 Z" fill="#B45309" />
    <path d="M15,70 L85,70 L90,80 L10,80 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
    <path d="M15,70 L10,30 L30,50 L50,15 L70,50 L90,30 L85,70 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />
    <path d="M15,70 L10,30 L30,50 L50,15 L70,50 L90,30 L85,70 Z" fill="url(#gold-gradient)" opacity="0.5" />
    <circle cx="10" cy="30" r="6" fill="#E11D48" />
    <circle cx="50" cy="15" r="8" fill="#3B82F6" />
    <circle cx="90" cy="30" r="6" fill="#E11D48" />
    <circle cx="30" cy="60" r="5" fill="#10B981" />
    <circle cx="50" cy="60" r="6" fill="#E11D48" />
    <circle cx="70" cy="60" r="5" fill="#10B981" />
    <defs>
      <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="transparent" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
    </defs>
  </svg>
);

const TREASURE_ITEMS = [
  { component: GoldCoin, left: '20%', bottom: '20%', rotate: -15, size: 'w-16 h-16' },
  { component: EmeraldGem, left: '60%', bottom: '15%', rotate: 20, size: 'w-14 h-14' },
  { component: RoyalCrown, left: '35%', bottom: '30%', rotate: 0, size: 'w-20 h-20' },
  { component: SapphireGem, left: '15%', bottom: '45%', rotate: 45, size: 'w-14 h-14' },
  { component: RubyGem, left: '70%', bottom: '40%', rotate: -20, size: 'w-14 h-14' },
  { component: GoldCoin, left: '30%', bottom: '55%', rotate: 10, size: 'w-16 h-16' },
  { component: SapphireGem, left: '55%', bottom: '65%', rotate: -30, size: 'w-14 h-14' },
  { component: RoyalCrown, left: '20%', bottom: '75%', rotate: 15, size: 'w-20 h-20' },
  { component: GoldCoin, left: '65%', bottom: '80%', rotate: -45, size: 'w-16 h-16' },
  { component: RubyGem, left: '45%', bottom: '85%', rotate: 0, size: 'w-14 h-14' },
];

function TreasureChest({ score, latestItem }: { score: number, latestItem: number | null }) {
  const itemsCount = score % 10;
  const totalChests = Math.floor(score / 10);
  const [justCompleted, setJustCompleted] = useState(false);
  const prevScoreRef = useRef(score);

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
    <div className="relative w-full max-w-md mx-auto mt-16 h-64 flex items-end justify-center perspective-[1500px]">
      
      {/* Background Glow */}
      <div className="absolute bottom-0 w-80 h-48 bg-yellow-400/40 blur-[50px] rounded-full"></div>

      {/* The Chest Container - Isometric Top-Down View */}
      <div className="relative w-80 h-56 z-10" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(20deg)' }}>
        
        {/* Chest Lid (Animated) */}
        <motion.div 
          animate={{ 
            rotateX: justCompleted ? 0 : -120,
            y: justCompleted ? 0 : -20,
            z: justCompleted ? 0 : -40
          }}
          transition={{ type: "spring", bounce: 0.3, duration: 1 }}
          className="absolute top-0 w-full h-32 origin-bottom z-0"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <svg viewBox="0 0 320 140" className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Inner Lid (Visible when open) */}
            <path d="M20,130 C20,50 50,20 160,20 C270,20 300,50 300,130 Z" fill="#5C2E00" stroke="#3E1F00" strokeWidth="4" />
            
            {/* Inner Wood Planks */}
            <path d="M25,110 C40,60 70,40 160,40 C250,40 280,60 295,110" fill="none" stroke="#3E1F00" strokeWidth="2" opacity="0.5" />
            <path d="M35,90 C60,50 90,60 160,60 C230,60 260,50 285,90" fill="none" stroke="#3E1F00" strokeWidth="2" opacity="0.5" />
            
            {/* Outer Lid Edge (Thickness) */}
            <path d="M10,140 C10,40 40,10 160,10 C280,10 310,40 310,140 L300,130 C300,50 270,20 160,20 C50,20 20,50 20,130 Z" fill="#8B4513" stroke="#3E1F00" strokeWidth="2" />
          </svg>
        </motion.div>

        {/* Chest Base (Back & Bottom Inside) */}
        <div className="absolute bottom-0 w-full h-40 z-10">
          <svg viewBox="0 0 320 160" className="w-full h-full">
            {/* Inside Bottom (Floor of the chest) */}
            <path d="M30,140 L290,140 L270,40 L50,40 Z" fill="#4A2500" stroke="#2D1600" strokeWidth="2" />
            {/* Inside Back Wall */}
            <path d="M50,40 L270,40 L270,10 L50,10 Z" fill="#3E1F00" />
            {/* Inside Left Wall */}
            <path d="M30,140 L50,40 L50,10 L30,110 Z" fill="#2D1600" />
            {/* Inside Right Wall */}
            <path d="M290,140 L270,40 L270,10 L290,110 Z" fill="#2D1600" />
          </svg>
        </div>

        {/* Accumulated Treasures (Placed inside the 3D space) */}
        <div className="absolute bottom-6 left-10 right-10 h-32 z-20" style={{ transform: 'rotateX(-20deg)' }}>
          <AnimatePresence>
            {!justCompleted && Array.from({ length: itemsCount }).map((_, i) => {
              const item = TREASURE_ITEMS[i % TREASURE_ITEMS.length];
              const ItemComponent = item.component;
              const isLatest = latestItem === i && score > 0;
              
              return (
                <motion.div
                  key={`${totalChests}-${i}`}
                  initial={isLatest ? { y: -500, scale: 2, rotate: 180, opacity: 0 } : false}
                  animate={isLatest ? { y: 0, scale: 1, rotate: item.rotate, opacity: 1 } : { rotate: item.rotate }}
                  transition={isLatest ? { type: "spring", bounce: 0.4, duration: 1.5 } : { duration: 0 }}
                  className={`absolute`}
                  style={{ left: item.left, bottom: item.bottom, zIndex: i }}
                >
                  {/* Glow effect for the latest item */}
                  {isLatest && (
                    <motion.div 
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{ opacity: 0, scale: 2 }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="absolute inset-0 bg-white rounded-full blur-xl"
                    />
                  )}
                  <ItemComponent className={`${item.size} drop-shadow-2xl`} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Chest Front Wall (Outer) */}
        <div className="absolute bottom-0 w-full h-24 z-30 drop-shadow-[0_30px_30px_rgba(0,0,0,0.7)]">
          <svg viewBox="0 0 320 100" className="w-full h-full overflow-visible">
            {/* Front Wood Panel */}
            <path d="M20,0 L300,0 L310,90 C310,95 305,100 300,100 L20,100 C15,100 10,95 10,90 Z" fill="#A0522D" stroke="#3E1F00" strokeWidth="4" />
            
            {/* Wood Planks Lines */}
            <line x1="15" y1="25" x2="305" y2="25" stroke="#5C2E00" strokeWidth="3" opacity="0.6" />
            <line x1="12" y1="55" x2="308" y2="55" stroke="#5C2E00" strokeWidth="3" opacity="0.6" />
            <line x1="10" y1="85" x2="310" y2="85" stroke="#5C2E00" strokeWidth="3" opacity="0.6" />
            
            {/* Metal Bands */}
            <path d="M50,0 L90,0 L92,100 L48,100 Z" fill="url(#metal-grad-front)" stroke="#111" strokeWidth="2" />
            <path d="M230,0 L270,0 L272,100 L228,100 Z" fill="url(#metal-grad-front)" stroke="#111" strokeWidth="2" />
            
            {/* Rivets */}
            <circle cx="70" cy="15" r="4" fill="#333" />
            <circle cx="70" cy="50" r="4" fill="#333" />
            <circle cx="70" cy="85" r="4" fill="#333" />
            
            <circle cx="250" cy="15" r="4" fill="#333" />
            <circle cx="250" cy="50" r="4" fill="#333" />
            <circle cx="250" cy="85" r="4" fill="#333" />

            {/* Lock Base */}
            <path d="M135,0 L185,0 L185,40 C185,60 135,60 135,40 Z" fill="url(#metal-grad-front)" stroke="#111" strokeWidth="3" />
            
            {/* Keyhole */}
            <circle cx="160" cy="25" r="6" fill="#111" />
            <path d="M157,25 L163,25 L165,40 L155,40 Z" fill="#111" />
            
            <defs>
              <linearGradient id="metal-grad-front" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#71717A" />
                <stop offset="50%" stopColor="#E4E4E7" />
                <stop offset="100%" stopColor="#52525B" />
              </linearGradient>
            </defs>
          </svg>
        </div>

      </div>
      
      {/* Completed Chests Counter Badge */}
      <motion.div 
        animate={justCompleted ? { scale: [1, 1.4, 1], rotate: [0, -15, 15, 0] } : {}}
        transition={{ duration: 0.6 }}
        className="absolute bottom-0 -right-8 bg-gradient-to-br from-yellow-300 to-yellow-500 px-5 py-3 rounded-2xl font-black text-amber-900 shadow-[0_15px_30px_rgba(0,0,0,0.4)] border-4 border-white flex items-center gap-3 z-50"
      >
        <div className="w-8 h-6 bg-amber-600 rounded-sm border-2 border-amber-900 relative">
          <div className="absolute -top-3 -inset-x-0.5 h-4 bg-amber-500 rounded-t-lg border-2 border-amber-900"></div>
        </div>
        <span className="text-3xl drop-shadow-sm">x {totalChests}</span>
      </motion.div>

      {/* Chest Complete Animation Overlay */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -120, scale: 1.2 }}
            exit={{ opacity: 0, y: -150, scale: 1.5 }}
            className="absolute bottom-24 z-50 text-4xl font-black text-yellow-300 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] whitespace-nowrap flex flex-col items-center"
          >
            <span className="text-white text-xl mb-1 drop-shadow-md">Cufăr Nou!</span>
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
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
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
