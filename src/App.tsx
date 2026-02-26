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

type CountItemTheme = {
  name: 'Ruby' | 'Sapphire' | 'Emerald' | 'Amethyst' | 'Topaz';
  base: string;
  dark: string;
  light: string;
  glow: string;
};

type CountItemKind = 'gem' | 'coin' | 'crown' | 'potion' | 'star';

const COUNT_ITEM_THEMES: CountItemTheme[] = [
  { name: 'Ruby', base: '#ef4444', dark: '#991b1b', light: '#fecaca', glow: '#fca5a5' },
  { name: 'Sapphire', base: '#3b82f6', dark: '#1e3a8a', light: '#bfdbfe', glow: '#93c5fd' },
  { name: 'Emerald', base: '#10b981', dark: '#14532d', light: '#a7f3d0', glow: '#6ee7b7' },
  { name: 'Amethyst', base: '#a855f7', dark: '#581c87', light: '#e9d5ff', glow: '#d8b4fe' },
  { name: 'Topaz', base: '#f59e0b', dark: '#78350f', light: '#fef3c7', glow: '#fcd34d' },
];

function DetailedToken({ theme, delay, shapeIndex }: { theme: CountItemTheme; delay: number; shapeIndex: number }) {
  const gradId = `gem-${theme.name}-${shapeIndex}-grad`;
  const glowId = `gem-${theme.name}-${shapeIndex}-glow`;
  const tokenKinds: CountItemKind[] = ['gem', 'coin', 'crown', 'potion', 'star'];
  const tokenKind = tokenKinds[shapeIndex % tokenKinds.length];

  const renderToken = () => {
    if (tokenKind === 'coin') {
      return (
        <>
          <circle cx="50" cy="50" r="35" fill="#F59E0B" stroke="#92400E" strokeWidth="4" />
          <circle cx="50" cy="50" r="28" fill="#FCD34D" stroke="#B45309" strokeWidth="3" />
          <path d="M50 30 L57 44 L72 50 L57 56 L50 70 L43 56 L28 50 L43 44 Z" fill="#FFF7CC" opacity="0.9" />
          <ellipse cx="38" cy="36" rx="10" ry="6" fill="white" opacity="0.42" />
        </>
      );
    }

    if (tokenKind === 'crown') {
      return (
        <>
          <path d="M20 68 L26 36 L40 51 L50 28 L60 51 L74 36 L80 68 Z" fill="#F59E0B" stroke="#7C2D12" strokeWidth="3" />
          <rect x="18" y="66" width="64" height="14" rx="4" fill="#B45309" stroke="#7C2D12" strokeWidth="3" />
          <circle cx="50" cy="46" r="6" fill={theme.base} stroke={theme.dark} strokeWidth="2.5" />
        </>
      );
    }

    if (tokenKind === 'potion') {
      return (
        <>
          <rect x="40" y="18" width="20" height="14" rx="4" fill="#7C3AED" stroke="#312E81" strokeWidth="2.5" />
          <path d="M33 34 C33 27 67 27 67 34 V42 C67 47 64 52 62 55 C59 61 58 68 58 76 C58 81 54 84 50 84 C46 84 42 81 42 76 C42 68 41 61 38 55 C36 52 33 47 33 42 Z" fill="#CFFAFE" stroke="#0F172A" strokeWidth="2.8" />
          <path d="M40 52 C44 57 56 57 60 52 V72 C60 76 56 80 50 80 C44 80 40 76 40 72 Z" fill={theme.base} opacity="0.9" />
        </>
      );
    }

    if (tokenKind === 'star') {
      return (
        <>
          <circle cx="50" cy="50" r="34" fill={theme.light} stroke={theme.dark} strokeWidth="3" opacity="0.45" />
          <path d="M50 18 L57 40 L80 40 L61 54 L68 76 L50 62 L32 76 L39 54 L20 40 L43 40 Z" fill={theme.base} stroke={theme.dark} strokeWidth="3" />
          <ellipse cx="42" cy="30" rx="9" ry="5" fill="white" opacity="0.35" />
        </>
      );
    }

    return (
      <>
        <circle cx="50" cy="50" r="40" fill={`url(#${glowId})`} opacity="0.55" />
        <polygon points="50,8 82,28 76,70 50,92 24,70 18,28" fill={`url(#${gradId})`} stroke={theme.dark} strokeWidth="3" strokeLinejoin="round" />
        <polygon points="50,8 82,28 50,42 18,28" fill={theme.light} opacity="0.5" />
        <polygon points="18,28 50,42 24,70" fill={theme.dark} opacity="0.3" />
        <polygon points="82,28 50,42 76,70" fill={theme.dark} opacity="0.36" />
        <polygon points="50,42 76,70 50,92" fill={theme.light} opacity="0.22" />
        <polygon points="50,42 24,70 50,92" fill="white" opacity="0.15" />
        <ellipse cx="38" cy="28" rx="11" ry="6" fill="white" opacity="0.52" />
      </>
    );
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -35, opacity: 0 }}
      animate={{ scale: [0, 1.2, 1], rotate: [-35, 10, 0], opacity: 1 }}
      transition={{ delay, duration: 0.6, times: [0, 0.7, 1], ease: 'easeOut' }}
      className="relative"
      title={`Gemă ${theme.name}`}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_10px_12px_rgba(15,23,42,0.45)]"
        animate={{ y: [0, -1.5, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 + delay }}
      >
        <defs>
          <radialGradient id={gradId} cx="30%" cy="25%" r="72%">
            <stop offset="0%" stopColor={theme.light} />
            <stop offset="56%" stopColor={theme.base} />
            <stop offset="100%" stopColor={theme.dark} />
          </radialGradient>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.glow} stopOpacity="0.72" />
            <stop offset="100%" stopColor={theme.glow} stopOpacity="0" />
          </radialGradient>
        </defs>
        {renderToken()}
      </motion.svg>

      <div className="pointer-events-none absolute inset-0">
        {[
          { x: '-18%', y: '20%', d: 0 },
          { x: '78%', y: '10%', d: 0.06 },
          { x: '82%', y: '72%', d: 0.12 },
          { x: '4%', y: '78%', d: 0.16 },
        ].map((star, i) => (
          <motion.svg
            key={`${theme.name}-sparkle-${shapeIndex}-${i}`}
            viewBox="0 0 20 20"
            className="absolute w-3 h-3"
            style={{ left: star.x, top: star.y }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.15, 0], opacity: [0, 0.95, 0] }}
            transition={{ duration: 0.52, delay: delay + star.d }}
          >
            <path d="M10 1 L12 8 L19 10 L12 12 L10 19 L8 12 L1 10 L8 8 Z" fill="white" />
          </motion.svg>
        ))}
      </div>
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
    setIconIndex(Math.floor(Math.random() * COUNT_ITEM_THEMES.length));
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
              <div className="flex flex-wrap justify-center gap-1.5 min-h-[5rem]">
                {Array.from({ length: num1 }).map((_, i) => (
                  <div key={`n1-${i}`}>
                    <DetailedToken
                      theme={COUNT_ITEM_THEMES[(iconIndex + i) % COUNT_ITEM_THEMES.length]}
                      delay={i * 0.07}
                      shapeIndex={i}
                    />
                  </div>
                ))}
              </div>
              <span className="text-5xl text-sky-500">{num1}</span>
            </div>

            <span className="text-5xl text-slate-400 pb-10">+</span>

            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-wrap justify-center gap-1.5 min-h-[5rem]">
                {Array.from({ length: num2 }).map((_, i) => (
                  <div key={`n2-${i}`}>
                    <DetailedToken
                      theme={COUNT_ITEM_THEMES[(iconIndex + i + 2) % COUNT_ITEM_THEMES.length]}
                      delay={i * 0.07}
                      shapeIndex={i + 20}
                    />
                  </div>
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
