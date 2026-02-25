/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Star, Settings, Snail, ShieldAlert, Rocket, Trophy, PlayCircle } from 'lucide-react';
import { loadDailyStats, saveDailyStats, loadUserProfile, saveUserProfile, DailyStats, UserProfile, getTodayDateString, getDateStringDaysAgo } from './lib/db';
import { getChestProgress } from './lib/chestProgress';
import { DailyRing } from './components/DailyRing';
import { ParentDashboard } from './components/ParentDashboard';
import { TreasureChest } from './components/chest/TreasureChest';

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

type TokenTheme = {
  name: string;
  fillA: string;
  fillB: string;
  glow: string;
  stroke: string;
  accent: string;
  ornament: 'spark' | 'orb' | 'leaf';
};

const TOKEN_THEMES: TokenTheme[] = [
  { name: 'Stelar', fillA: '#fde047', fillB: '#f59e0b', glow: '#fef08a', stroke: '#7c2d12', accent: '#fff7cc', ornament: 'spark' },
  { name: 'Rubin', fillA: '#fb7185', fillB: '#e11d48', glow: '#fecdd3', stroke: '#881337', accent: '#ffe4e6', ornament: 'orb' },
  { name: 'Lagună', fillA: '#38bdf8', fillB: '#1d4ed8', glow: '#bae6fd', stroke: '#1e3a8a', accent: '#eff6ff', ornament: 'leaf' },
  { name: 'Ametist', fillA: '#c084fc', fillB: '#7e22ce', glow: '#e9d5ff', stroke: '#4c1d95', accent: '#faf5ff', ornament: 'spark' },
  { name: 'Smarald', fillA: '#4ade80', fillB: '#15803d', glow: '#bbf7d0', stroke: '#14532d', accent: '#dcfce7', ornament: 'leaf' },
];

function DetailedToken({ theme, delay }: { theme: TokenTheme; delay: number }) {
  const gradientId = `${theme.name}-grad`;
  const glowId = `${theme.name}-glow`;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -14, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 380, damping: 16 }}
      className="relative"
      title={`Figurină ${theme.name}`}
    >
      <svg viewBox="0 0 88 88" className="w-11 h-11 drop-shadow-[0_10px_10px_rgba(15,23,42,0.35)]">
        <defs>
          <radialGradient id={gradientId} cx="35%" cy="25%" r="70%">
            <stop offset="0%" stopColor={theme.fillA} />
            <stop offset="55%" stopColor={theme.fillB} />
            <stop offset="100%" stopColor={theme.stroke} />
          </radialGradient>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.glow} stopOpacity="0.95" />
            <stop offset="100%" stopColor={theme.glow} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="44" cy="44" r="40" fill={`url(#${glowId})`} opacity="0.6" />
        <path
          d="M44 7 L56 29 L81 33 L63 51 L67 78 L44 65 L21 78 L25 51 L7 33 L32 29 Z"
          fill={`url(#${gradientId})`}
          stroke={theme.stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M44 14 L52 30 L69 33 L56 46 L59 63 L44 55 L29 63 L32 46 L19 33 L36 30 Z"
          fill={theme.accent}
          opacity="0.28"
        />
        <ellipse cx="34" cy="30" rx="11" ry="6" fill="#ffffff" opacity="0.45" />
        <ellipse cx="52" cy="54" rx="13" ry="8" fill="#0f172a" opacity="0.16" />

        {theme.ornament === 'spark' && (
          <>
            <path d="M65 18 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill={theme.accent} opacity="0.8" />
            <circle cx="68" cy="58" r="2.5" fill={theme.accent} />
          </>
        )}

        {theme.ornament === 'orb' && (
          <>
            <circle cx="67" cy="22" r="6" fill={theme.accent} opacity="0.85" />
            <circle cx="63" cy="21" r="2" fill="#fff" opacity="0.8" />
            <circle cx="22" cy="61" r="4" fill={theme.glow} opacity="0.7" />
          </>
        )}

        {theme.ornament === 'leaf' && (
          <>
            <path d="M64 20 C72 18 76 28 68 34 C60 30 58 22 64 20Z" fill={theme.accent} opacity="0.9" />
            <path d="M68 34 C66 37 63 39 60 40" stroke={theme.stroke} strokeWidth="1.8" fill="none" opacity="0.65" />
            <path d="M25 66 C20 63 18 57 22 53 C27 55 29 61 25 66Z" fill={theme.glow} opacity="0.85" />
          </>
        )}
      </svg>
    </motion.div>
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
    setIconIndex(Math.floor(Math.random() * TOKEN_THEMES.length));
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

  const activeTokenTheme = TOKEN_THEMES[iconIndex];

  if (!dailyStats || !userProfile) return null;
  const chestProgress = getChestProgress(userProfile.score);

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
                  <div key={`n1-${i}`}><DetailedToken theme={activeTokenTheme} delay={i * 0.08} /></div>
                ))}
              </div>
              <span className="text-5xl text-sky-500">{num1}</span>
            </div>

            <span className="text-5xl text-slate-400 pb-10">+</span>

            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-wrap justify-center gap-1 min-h-[4rem]">
                {Array.from({ length: num2 }).map((_, i) => (
                  <div key={`n2-${i}`}><DetailedToken theme={activeTokenTheme} delay={i * 0.08} /></div>
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
          <TreasureChest progress={chestProgress} latestItem={latestItemIndex} />

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
