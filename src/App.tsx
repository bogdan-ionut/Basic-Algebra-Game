/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Star, Settings, Snail, ShieldAlert, Trophy, PlayCircle, UserCircle2, LogOut, Anchor, Waves, Skull, Venus, Mars, Pencil } from 'lucide-react';
import { loadDailyStats, saveDailyStats, loadUserProfile, saveUserProfile, DailyStats, UserProfile, getTodayDateString, getDateStringDaysAgo, GameUser, loadUsers, createUser, updateUser, setLastActiveUserId, getLastActiveUserId, createDefaultDailyStats, createDefaultUserProfile, resetUserProgress } from './lib/db';
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

type VisualStack = 'treasure' | 'minecraft';

type CountItemKind = 'gem' | 'coin' | 'crown' | 'potion' | 'star';
type MinecraftItemKind = 'diamond' | 'emerald' | 'gold_ingot' | 'redstone' | 'grass_block' | 'apple' | 'iron_sword' | 'diamond_pickaxe' | 'cake' | 'pig' | 'cow' | 'chicken' | 'sheep' | 'villager' | 'zombie' | 'enderman' | 'creeper';

type MinecraftAsset = {
  label: string;
  family: 'resource' | 'tool' | 'food' | 'mob';
  url: string;
};

const MINECRAFT_ASSETS: Record<MinecraftItemKind, MinecraftAsset> = {
  diamond: { label: 'Diamond', family: 'resource', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/diamond.png' },
  emerald: { label: 'Emerald', family: 'resource', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/emerald.png' },
  gold_ingot: { label: 'Gold Ingot', family: 'resource', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/gold_ingot.png' },
  redstone: { label: 'Redstone', family: 'resource', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/redstone.png' },
  grass_block: { label: 'Grass Block', family: 'resource', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/block/grass_block_side.png' },
  apple: { label: 'Apple', family: 'food', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/apple.png' },
  iron_sword: { label: 'Iron Sword', family: 'tool', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/iron_sword.png' },
  diamond_pickaxe: { label: 'Diamond Pickaxe', family: 'tool', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/diamond_pickaxe.png' },
  cake: { label: 'Cake', family: 'food', url: 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.2/assets/minecraft/textures/item/cake.png' },
  pig: { label: 'Pig', family: 'mob', url: 'https://mc-heads.net/avatar/MHF_Pig/100.png' },
  cow: { label: 'Cow', family: 'mob', url: 'https://mc-heads.net/avatar/MHF_Cow/100.png' },
  chicken: { label: 'Chicken', family: 'mob', url: 'https://mc-heads.net/avatar/MHF_Chicken/100.png' },
  sheep: { label: 'Sheep', family: 'mob', url: 'https://mc-heads.net/avatar/MHF_Sheep/100.png' },
  villager: { label: 'Villager', family: 'mob', url: 'https://mc-heads.net/avatar/MHF_Villager/100.png' },
  zombie: { label: 'Zombie', family: 'mob', url: 'https://mc-heads.net/avatar/MHF_Zombie/100.png' },
  enderman: { label: 'Enderman', family: 'mob', url: 'https://mc-heads.net/avatar/MHF_Enderman/100.png' },
  creeper: { label: 'Creeper', family: 'mob', url: 'https://mc-heads.net/avatar/MHF_Creeper/100.png' },
};

const VISUAL_STACK_OPTIONS: { id: VisualStack; label: string; hint: string }[] = [
  { id: 'treasure', label: 'Comori clasice', hint: 'geme, monede și relicve' },
  { id: 'minecraft', label: 'Minecraft', hint: 'resurse, animale, NPC-uri' },
];

const COUNT_ITEM_THEMES: CountItemTheme[] = [
  { name: 'Ruby', base: '#ef4444', dark: '#991b1b', light: '#fecaca', glow: '#fca5a5' },
  { name: 'Sapphire', base: '#3b82f6', dark: '#1e3a8a', light: '#bfdbfe', glow: '#93c5fd' },
  { name: 'Emerald', base: '#10b981', dark: '#14532d', light: '#a7f3d0', glow: '#6ee7b7' },
  { name: 'Amethyst', base: '#a855f7', dark: '#581c87', light: '#e9d5ff', glow: '#d8b4fe' },
  { name: 'Topaz', base: '#f59e0b', dark: '#78350f', light: '#fef3c7', glow: '#fcd34d' },
];

function DetailedToken({ theme, delay, shapeIndex, stack }: { theme: CountItemTheme; delay: number; shapeIndex: number; stack: VisualStack }) {
  const gradId = `gem-${theme.name}-${shapeIndex}-grad`;
  const glowId = `gem-${theme.name}-${shapeIndex}-glow`;
  const tokenKinds: CountItemKind[] = ['gem', 'coin', 'crown', 'potion', 'star'];
  const minecraftKinds: MinecraftItemKind[] = [
    'diamond', 'pig', 'diamond_pickaxe', 'emerald', 'cow',
    'gold_ingot', 'chicken', 'apple', 'redstone', 'sheep',
    'cake', 'grass_block', 'villager', 'iron_sword',
    'zombie', 'enderman', 'creeper'
  ];
  const tokenKind = tokenKinds[shapeIndex % tokenKinds.length];
  const minecraftKind = minecraftKinds[shapeIndex % minecraftKinds.length];
  const minecraftAsset = MINECRAFT_ASSETS[minecraftKind];

  const renderToken = () => {
    if (stack === 'minecraft') {
      const frameColorByFamily: Record<MinecraftAsset['family'], string> = {
        resource: '#38bdf8',
        tool: '#f59e0b',
        food: '#22c55e',
        mob: '#a855f7',
      };
      const frameColor = frameColorByFamily[minecraftAsset.family];

      return (
        <>
          <rect x="4" y="4" width="92" height="92" rx="20" fill="url(#minecraftCardGrad)" stroke="#0f172a" strokeWidth="4" />
          <rect x="10" y="10" width="80" height="80" rx="16" fill="#050d1f" stroke={frameColor} strokeWidth="3.5" />
          <rect x="12" y="12" width="76" height="24" rx="10" fill="white" opacity="0.08" />
          <image
            href={minecraftAsset.url}
            x="18"
            y="18"
            width="64"
            height="64"
            style={{
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0px 14px 10px rgba(0, 0, 0, 0.55)) drop-shadow(0px 4px 5px rgba(0, 0, 0, 0.4))'
            }}
          />
        </>
      );
    }

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
      title={stack === 'minecraft' ? `Minecraft • ${minecraftAsset.label}` : `Gemă ${theme.name}`}
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
          <linearGradient id="minecraftCardGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        {renderToken()}
      </motion.svg>

      {stack === 'minecraft' ? (
        <div className="pointer-events-none absolute inset-0">
          {[
            { x: '-12%', y: '16%', d: 0, c: '#34d399' },
            { x: '82%', y: '22%', d: 0.07, c: '#facc15' },
            { x: '76%', y: '80%', d: 0.11, c: '#60a5fa' },
            { x: '3%', y: '75%', d: 0.15, c: '#a78bfa' },
          ].map((pixel, i) => (
            <motion.span
              key={`${minecraftKind}-pixel-${shapeIndex}-${i}`}
              className="absolute h-1.5 w-1.5"
              style={{ left: pixel.x, top: pixel.y, backgroundColor: pixel.c, boxShadow: '0 0 0 1px rgba(15,23,42,0.45)' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 0], opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.48, delay: delay + pixel.d }}
            />
          ))}
        </div>
      ) : (
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
      )}
    </motion.div>
  );
}

function CaptainIdentityCard({
  user,
  chestCount,
  compact = false,
}: {
  user: GameUser;
  chestCount: number;
  compact?: boolean;
}) {
  const epauletteLevel = Math.min(5, Math.max(1, chestCount + 1));
  const stripeCount = Math.min(5, chestCount + 1);

  return (
    <div className={`rounded-[1.75rem] border-2 border-amber-300/80 bg-gradient-to-b from-[#fff9ea] via-[#f8eed9] to-[#f0e0bf] shadow-[0_10px_26px_rgba(120,76,15,0.28)] ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
      <div className="flex items-center gap-3">
        <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
          <div className={`rounded-xl bg-gradient-to-b from-[#ffe8a0] to-[#eec15a] border border-amber-500 px-1.5 py-1 min-w-[1.7rem] flex justify-center gap-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ${compact ? 'h-8' : 'h-10'}`}>
            {Array.from({ length: stripeCount }).map((_, index) => (
              <span key={`left-${index}`} className="w-0.5 bg-amber-700 rounded-full" />
            ))}
          </div>

          <div className="relative">
            {user.avatarDataUrl ? (
              <img src={user.avatarDataUrl} alt={user.name} className={`${compact ? 'w-12 h-12' : 'w-14 h-14'} rounded-full object-cover border-2 border-amber-300 shadow-[0_4px_10px_rgba(44,31,17,0.25)]`} />
            ) : (
              <div className={`${compact ? 'w-12 h-12' : 'w-14 h-14'} rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center`}>
                <UserCircle2 className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} text-amber-700`} />
              </div>
            )}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-t-full bg-slate-800" />
          </div>

          <div className={`rounded-xl bg-gradient-to-b from-[#ffe8a0] to-[#eec15a] border border-amber-500 px-1.5 py-1 min-w-[1.7rem] flex justify-center gap-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ${compact ? 'h-8' : 'h-10'}`}>
            {Array.from({ length: stripeCount }).map((_, index) => (
              <span key={`right-${index}`} className="w-0.5 bg-amber-700 rounded-full" />
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <p className={`font-black text-amber-950 truncate ${compact ? 'text-sm' : 'text-base'}`}>{user.name}</p>
          <p className={`text-amber-700/90 truncate ${compact ? 'text-[11px]' : 'text-xs'}`}>
            Căpitan • {chestCount} cufere • rang {epauletteLevel}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [num1, setNum1] = useState(1);
  const [num2, setNum2] = useState(1);
  const [answerInput, setAnswerInput] = useState('');
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
  const [visualStack, setVisualStack] = useState<VisualStack>('treasure');

  const [users, setUsers] = useState<GameUser[]>([]);
  const [activeUser, setActiveUser] = useState<GameUser | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserChestCount, setSelectedUserChestCount] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    age: '',
    sex: 'Masculin',
    location: '',
    pin: '',
    avatarDataUrl: '',
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    age: '',
    sex: '',
    location: '',
    pin: '',
    avatarDataUrl: '',
  });

  const generateProblem = (level: number) => {
    // Level 1: sum up to 5. Level 2: sum up to 10.
    const maxSum = level === 1 ? 5 : 10;
    const createCandidate = () => {
      const sum = Math.floor(Math.random() * (maxSum - 1)) + 2; // 2 to maxSum
      const n1 = Math.floor(Math.random() * (sum - 1)) + 1; // 1 to sum - 1
      const n2 = sum - n1;
      return { n1, n2 };
    };

    // Avoid repeating the exact same exercise twice in a row.
    let candidate = createCandidate();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const isSameProblem = candidate.n1 === num1 && candidate.n2 === num2;
      if (!isSameProblem) break;
      candidate = createCandidate();
    }

    const { n1, n2 } = candidate;

    setNum1(n1);
    setNum2(n2);

    setAnswerInput('');
    setIconIndex(Math.floor(Math.random() * COUNT_ITEM_THEMES.length));
    setShowSuccess(false);
    setWrongAnswer(null);
    setProblemStartTime(Date.now());
  };


  const getCurrentChapterLabel = () => {
    if (!userProfile) return 'Matematică distractivă';
    if (userProfile.difficultyLevel <= 1) return 'Capitol: Adunări până la 5';
    if (userProfile.difficultyLevel === 2) return 'Capitol: Adunări până la 10';
    return `Capitol: Adunări (nivel ${userProfile.difficultyLevel})`;
  };

  const handleResetActiveUserProgress = async () => {
    if (!activeUser) return;

    await resetUserProgress(activeUser.id);

    const resetStats = createDefaultDailyStats();
    const resetProfile = createDefaultUserProfile();

    setDailyStats(resetStats);
    setUserProfile(resetProfile);
    setHasStarted(false);
    setIsSessionComplete(false);
    setSessionLimit(600);
    setConsecutiveCorrect(0);
    setConsecutiveMistakes(0);
    setLatestItemIndex(null);
    setLevelNotification(null);
    generateProblem(resetProfile.difficultyLevel);

    await saveDailyStats(activeUser.id, resetStats);
    await saveUserProfile(activeUser.id, resetProfile);
  };

  const initializeUserData = async (user: GameUser) => {
    const stats = await loadDailyStats(user.id);
    const profile = await loadUserProfile(user.id);

    const today = getTodayDateString();
    if (profile.lastPlayedDate !== today) {
      const yesterdayStr = getDateStringDaysAgo(1);

      if (profile.lastPlayedDate === yesterdayStr) {
        profile.streak += 1;
      } else if (profile.lastPlayedDate !== '') {
        profile.streak = 1;
      } else {
        profile.streak = 1;
      }
      profile.lastPlayedDate = today;
      await saveUserProfile(user.id, profile);
    }

    if (stats.timeSpentSeconds >= 600) {
      setSessionLimit(Math.ceil((stats.timeSpentSeconds + 1) / 600) * 600);
    } else {
      setSessionLimit(600);
    }

    setDailyStats(stats);
    setUserProfile(profile);
    setConsecutiveMistakes(0);
    setConsecutiveCorrect(0);
    setIsSessionComplete(false);
    setHasStarted(false);
    generateProblem(profile.difficultyLevel);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setNewUserForm(prev => ({ ...prev, avatarDataUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleEditAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setEditUserForm(prev => ({ ...prev, avatarDataUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const validateAge = (ageRaw: string) => {
    const age = Number(ageRaw);
    return Number.isInteger(age) && age >= 1 && age <= 99;
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.age.trim() || !newUserForm.sex.trim() || !newUserForm.location.trim()) {
      setAuthError('Completează toate câmpurile.');
      return;
    }

    if (!validateAge(newUserForm.age)) {
      setAuthError('Vârsta trebuie să fie între 1 și 99 ani.');
      return;
    }

    if (!/^\d{4}$/.test(newUserForm.pin)) {
      setAuthError('PIN-ul trebuie să aibă exact 4 cifre.');
      return;
    }

    const created = await createUser({
      name: newUserForm.name.trim(),
      age: Number(newUserForm.age),
      sex: newUserForm.sex.trim() === 'Feminin' ? 'Feminin' : 'Masculin',
      location: newUserForm.location.trim(),
      pin: newUserForm.pin,
      avatarDataUrl: newUserForm.avatarDataUrl || undefined,
    });

    const updatedUsers = await loadUsers();
    setUsers(updatedUsers);
    setActiveUser(created);
    await setLastActiveUserId(created.id);
    setIsRegistering(false);
    setAuthError(null);
    setNewUserForm({ name: '', age: '', sex: 'Masculin', location: '', pin: '', avatarDataUrl: '' });
    await initializeUserData(created);
  };

  const startEditingUser = (user: GameUser) => {
    setEditingUserId(user.id);
    setEditUserForm({
      name: user.name,
      age: String(user.age),
      sex: user.sex === 'Feminin' ? 'Feminin' : 'Masculin',
      location: user.location,
      pin: user.pin,
      avatarDataUrl: user.avatarDataUrl || '',
    });
    setAuthError(null);
  };

  const cancelEditingUser = () => {
    setEditingUserId(null);
    setEditUserForm({ name: '', age: '', sex: '', location: '', pin: '', avatarDataUrl: '' });
  };

  const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingUserId) return;

    if (!editUserForm.name.trim() || !editUserForm.age.trim() || !editUserForm.sex.trim() || !editUserForm.location.trim()) {
      setAuthError('Completează toate câmpurile pentru editare.');
      return;
    }

    if (!validateAge(editUserForm.age)) {
      setAuthError('Vârsta trebuie să fie între 1 și 99 ani.');
      return;
    }

    if (!/^\d{4}$/.test(editUserForm.pin)) {
      setAuthError('PIN-ul trebuie să aibă exact 4 cifre.');
      return;
    }

    const currentUser = users.find(user => user.id === editingUserId);
    if (!currentUser) {
      setAuthError('Profilul nu a fost găsit.');
      return;
    }

    const updatedUser: GameUser = {
      ...currentUser,
      name: editUserForm.name.trim(),
      age: Number(editUserForm.age),
      sex: editUserForm.sex.trim() === 'Feminin' ? 'Feminin' : 'Masculin',
      location: editUserForm.location.trim(),
      pin: editUserForm.pin,
      avatarDataUrl: editUserForm.avatarDataUrl || undefined,
    };

    await updateUser(updatedUser);
    const refreshedUsers = await loadUsers();
    setUsers(refreshedUsers);

    if (activeUser?.id === updatedUser.id) {
      setActiveUser(updatedUser);
    }

    if (selectedUserId === updatedUser.id) {
      setSelectedUserId(updatedUser.id);
    }

    setAuthError(null);
    cancelEditingUser();
  };

  const handleLogin = async () => {
    const found = users.find(user => user.id === selectedUserId);
    if (!found) {
      setAuthError('Selectează un user.');
      return;
    }

    if (found.pin !== enteredPin) {
      setAuthError('PIN greșit.');
      return;
    }

    setActiveUser(found);
    await setLastActiveUserId(found.id);
    setAuthError(null);
    setEnteredPin('');
    await initializeUserData(found);
  };

  const handleSwitchUser = () => {
    setActiveUser(null);
    setDailyStats(null);
    setUserProfile(null);
    setHasStarted(false);
    setEnteredPin('');
    setSelectedUserId(null);
    setAuthError(null);
  };

  useEffect(() => {
    const loadSelectedUserProgress = async () => {
      if (!selectedUserId) {
        setSelectedUserChestCount(0);
        return;
      }

      const profile = await loadUserProfile(selectedUserId);
      setSelectedUserChestCount(Math.floor(profile.score / 10));
    };

    loadSelectedUserProgress();
  }, [selectedUserId]);


  // Load users on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUsers = await loadUsers();
      setUsers(storedUsers);

      const lastActiveId = await getLastActiveUserId();
      if (!lastActiveId) return;

      const rememberedUser = storedUsers.find(user => user.id === lastActiveId);
      if (!rememberedUser) return;

      setSelectedUserId(rememberedUser.id);
    };
    initAuth();
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
        if (activeUser) {
          saveDailyStats(activeUser.id, updated);
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, isSessionComplete, sessionLimit, activeUser]);

  const handleAnswer = async (ans: number) => {
    if (!dailyStats || !userProfile || !activeUser || isSpeedBumpActive) return;

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
      await saveUserProfile(activeUser.id, newProfile);

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
      await saveUserProfile(activeUser.id, newProfile);
    }

    setConsecutiveMistakes(newMistakes);
    setConsecutiveCorrect(newCorrect);
    setDailyStats(updatedStats);
    await saveDailyStats(activeUser.id, updatedStats);
  };

  const handleAnswerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (showSuccess || isSpeedBumpActive) return;

    const trimmedAnswer = answerInput.trim();
    if (!trimmedAnswer) return;

    const parsedAnswer = Number(trimmedAnswer);
    if (!Number.isFinite(parsedAnswer)) {
      setWrongAnswer(-1);
      setTimeout(() => setWrongAnswer(null), 500);
      return;
    }

    await handleAnswer(parsedAnswer);
    setAnswerInput('');
  };


  if (!activeUser || !dailyStats || !userProfile) {
    const selectedUser = users.find(user => user.id === selectedUserId);

    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#c8eeff_0%,_#eff9ff_48%,_#fff9ef_100%)] p-4 md:p-8 font-sans flex items-center justify-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-28 left-1/4 h-72 w-72 rounded-full bg-cyan-300/35 blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-amber-200/45 blur-3xl" />
        </div>
        <div className="absolute top-6 left-6 text-cyan-800/55">
          <Waves className="w-10 h-10" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-6xl rounded-[2.25rem] border border-cyan-100/80 bg-white/85 shadow-[0_32px_90px_rgba(8,47,73,0.2)] backdrop-blur-xl overflow-hidden relative z-10"
        >
          <div className="relative bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-600 px-6 py-7 md:px-10 md:py-10 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.24),_transparent_62%)]" />
            <div className="relative flex items-center justify-center gap-3 mb-3">
              <Skull className="w-7 h-7" />
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-center">Portul Piraților Matematicieni</h1>
              <Anchor className="w-7 h-7" />
            </div>
            <p className="relative text-center text-cyan-50/95 text-base md:text-lg font-medium max-w-3xl mx-auto">
              Selectează un profil existent sau creează un căpitan nou în mai puțin de 30 secunde.
            </p>

            {selectedUser && (
              <div className="relative mt-6 flex justify-center">
                <CaptainIdentityCard user={selectedUser} chestCount={selectedUserChestCount} compact />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <section className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-white/90">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-slate-900">Echipaj existent</h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 font-bold">Login rapid</span>
              </div>

              {users.length ? (
                <>
                  <div className="grid grid-cols-1 gap-3 mb-5 max-h-[320px] overflow-y-auto pr-1">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setAuthError(null);
                            setIsRegistering(false);
                          }}
                          className={`group flex-1 p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all duration-200 ${selectedUserId === user.id
                            ? 'border-cyan-400 bg-cyan-50/90 shadow-[0_12px_24px_rgba(6,182,212,0.22)]'
                            : 'border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/40 hover:-translate-y-0.5'
                            }`}
                        >
                          {user.avatarDataUrl ? (
                            <img src={user.avatarDataUrl} alt={user.name} className="w-14 h-14 rounded-full object-cover border-2 border-cyan-200" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-cyan-100 border-2 border-cyan-200 flex items-center justify-center">
                              <UserCircle2 className="w-8 h-8 text-cyan-600" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-black text-slate-800 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.age} ani • {user.sex} • {user.location}</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditingUser(user)}
                          className="h-11 w-11 rounded-xl border border-cyan-200 text-cyan-700 bg-white hover:bg-cyan-50 flex items-center justify-center"
                          title={`Editează profilul lui ${user.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <label className="block text-sm font-bold text-slate-700 mb-2">PIN de acces (4 cifre)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={enteredPin}
                    onChange={e => setEnteredPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-xl tracking-[0.45em] text-center font-black text-slate-800 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    placeholder="••••"
                  />
                  <button
                    onClick={handleLogin}
                    className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white py-3.5 rounded-xl font-black shadow-[0_12px_26px_rgba(16,185,129,0.32)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Intră în aventură
                  </button>
                </>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-cyan-200 bg-cyan-50/70 p-6 text-center">
                  <p className="font-bold text-cyan-800">Nu există încă niciun echipaj salvat.</p>
                  <p className="text-cyan-700 text-sm mt-1">Creează primul căpitan în panoul din dreapta.</p>
                </div>
              )}
            </section>

            <section className="p-6 md:p-8 bg-gradient-to-b from-slate-50 via-white to-amber-50/60">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Căpitan nou</h2>
                  <p className="text-sm text-slate-500">Date clare, formular simplu, setup instant.</p>
                </div>
                <button
                  onClick={() => {
                    setIsRegistering(prev => !prev);
                    setAuthError(null);
                  }}
                  className="text-sm font-bold px-3 py-1.5 rounded-lg bg-white border border-cyan-200 text-cyan-700 hover:text-cyan-600 hover:border-cyan-300"
                >
                  {isRegistering ? 'Ascunde formularul' : 'Arată formularul'}
                </button>
              </div>

              {(isRegistering || users.length === 0) && (
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={newUserForm.name} onChange={e => setNewUserForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Nume" className="border-2 border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" />
                  <input type="number" min={1} max={99} value={newUserForm.age} onChange={e => setNewUserForm(prev => ({ ...prev, age: e.target.value }))} placeholder="Vârstă" className="border-2 border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" />
                  <label className="border-2 border-slate-200 rounded-xl px-3 py-2.5 bg-white focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100 flex items-center gap-2 text-slate-700">
                    {newUserForm.sex === 'Feminin' ? <Venus className="w-4 h-4 text-pink-500" /> : <Mars className="w-4 h-4 text-sky-500" />}
                    <select value={newUserForm.sex} onChange={e => setNewUserForm(prev => ({ ...prev, sex: e.target.value }))} className="w-full bg-transparent focus:outline-none">
                      <option value="Masculin">Masculin</option>
                      <option value="Feminin">Feminin</option>
                    </select>
                  </label>
                  <input value={newUserForm.location} onChange={e => setNewUserForm(prev => ({ ...prev, location: e.target.value }))} placeholder="Loc" className="border-2 border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" />
                  <input type="password" maxLength={4} value={newUserForm.pin} onChange={e => setNewUserForm(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="PIN 4 cifre" className="border-2 border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" />
                  <label className="border-2 border-dashed border-cyan-200 rounded-xl px-3 py-2.5 text-sm text-cyan-700 bg-cyan-50 cursor-pointer font-semibold hover:bg-cyan-100 transition-colors">
                    Poză profil rotundă
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                  <button type="submit" className="sm:col-span-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white py-3 rounded-xl font-black shadow-[0_12px_26px_rgba(14,165,233,0.3)]">
                    Salvează căpitanul
                  </button>
                </form>
              )}

              {editingUserId && (
                <form onSubmit={handleUpdateUser} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border border-cyan-200 bg-cyan-50/50 p-3 rounded-2xl">
                  <p className="sm:col-span-2 text-sm font-bold text-cyan-800">Editezi profilul selectat</p>
                  <input value={editUserForm.name} onChange={e => setEditUserForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Nume" className="border-2 border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" />
                  <input type="number" min={1} max={99} value={editUserForm.age} onChange={e => setEditUserForm(prev => ({ ...prev, age: e.target.value }))} placeholder="Vârstă" className="border-2 border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" />
                  <label className="border-2 border-slate-200 rounded-xl px-3 py-2.5 bg-white focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100 flex items-center gap-2 text-slate-700">
                    {editUserForm.sex === 'Feminin' ? <Venus className="w-4 h-4 text-pink-500" /> : <Mars className="w-4 h-4 text-sky-500" />}
                    <select value={editUserForm.sex} onChange={e => setEditUserForm(prev => ({ ...prev, sex: e.target.value }))} className="w-full bg-transparent focus:outline-none">
                      <option value="Masculin">Masculin</option>
                      <option value="Feminin">Feminin</option>
                    </select>
                  </label>
                  <input value={editUserForm.location} onChange={e => setEditUserForm(prev => ({ ...prev, location: e.target.value }))} placeholder="Loc" className="border-2 border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" />
                  <input type="password" maxLength={4} value={editUserForm.pin} onChange={e => setEditUserForm(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="PIN 4 cifre" className="border-2 border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" />
                  <label className="border-2 border-dashed border-cyan-200 rounded-xl px-3 py-2.5 text-sm text-cyan-700 bg-cyan-50 cursor-pointer font-semibold hover:bg-cyan-100 transition-colors">
                    Actualizează poza de profil
                    <input type="file" accept="image/*" onChange={handleEditAvatarUpload} className="hidden" />
                  </label>
                  <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-black">Salvează editarea</button>
                  <button type="button" onClick={cancelEditingUser} className="bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-xl font-black">Renunță</button>
                </form>
              )}

              {(newUserForm.avatarDataUrl || editUserForm.avatarDataUrl) && (
                <div className="mt-4 flex items-center gap-3 bg-white rounded-xl p-3 border border-sky-100 shadow-sm">
                  <img src={editingUserId ? editUserForm.avatarDataUrl : newUserForm.avatarDataUrl} alt="preview" className="w-12 h-12 rounded-full object-cover border-2 border-cyan-200" />
                  <p className="text-sm text-slate-600 font-semibold">Previzualizare avatar gata de salvat.</p>
                </div>
              )}
            </section>
          </div>

          {authError && (
            <p className="text-red-700 font-bold px-6 pb-6 pt-1 text-sm bg-red-50/80 border-t border-red-100">{authError}</p>
          )}
        </motion.div>
      </div>
    );
  }
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
          <div className="flex justify-center mb-6">
            <CaptainIdentityCard user={activeUser} chestCount={chestProgress.totalChests} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Salut, {activeUser.name}!</h1>
          <p className="text-slate-600 mb-8">Ești gata pentru 10 minute de aventură matematică?</p>
          <div className="mb-6 text-left bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <label htmlFor="visual-stack-start" className="block text-sm font-bold text-slate-700 mb-1">Obiecte de numărat</label>
            <select
              id="visual-stack-start"
              value={visualStack}
              onChange={(event) => setVisualStack(event.target.value as VisualStack)}
              className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:border-sky-400"
            >
              {VISUAL_STACK_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label} — {option.hint}</option>
              ))}
            </select>
          </div>
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
          <button
            onClick={handleSwitchUser}
            className="w-full mt-3 bg-white text-slate-600 border-2 border-slate-200 py-3 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Schimbă user
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
            Bravo, {activeUser.name}! Ai învățat super bine azi. Acum ai timp liber să te joci, să construiești sau să desenezi!
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
            onClick={handleSwitchUser}
            className="w-full mb-4 bg-white text-slate-600 border-2 border-slate-200 py-3 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Schimbă user
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
            onResetProgress={handleResetActiveUserProgress}
            activeUserName={activeUser.name}
            dailyStats={dailyStats}
            userProfile={userProfile}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#3aa9e6_0%,#216ca5_42%,#0b3b6a_100%)] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute inset-[6%] rounded-full border border-sky-100/45" />
        <div className="absolute inset-[14%] rounded-full border border-sky-100/30" />
        <div className="absolute inset-[24%] rounded-full border border-sky-100/20" />
      </div>
      {/* Top Bar with Daily Ring and Parent Access */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 gap-3">
        <DailyRing currentSeconds={dailyStats.timeSpentSeconds} targetSeconds={sessionLimit} />
        <CaptainIdentityCard user={activeUser} chestCount={chestProgress.totalChests} compact />
        <div className="flex items-center gap-2">
          <button
            onClick={handleSwitchUser}
            className="p-3 bg-amber-100/85 rounded-full shadow-[0_4px_12px_rgba(60,32,6,0.32)] border-2 border-amber-300/80 backdrop-blur-sm text-amber-700 hover:text-amber-900 transition-colors"
            title="Schimbă user"
          >
            <LogOut className="w-6 h-6" />
          </button>
          <button
            onClick={() => setIsParentDashboardOpen(true)}
            className="p-3 bg-amber-100/85 rounded-full shadow-[0_4px_12px_rgba(60,32,6,0.32)] border-2 border-amber-300/80 backdrop-blur-sm text-amber-700 hover:text-amber-900 transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-gradient-to-b from-[#f8f3e8] via-[#f2ebdd] to-[#efe6d8] rounded-[2rem] shadow-[0_26px_65px_rgba(2,17,47,0.45)] overflow-hidden border-[5px] border-[#d7b67a] relative mt-16 z-10 mb-4">

        {/* Header */}
        <div className="bg-gradient-to-b from-[#fefcf7] via-[#f6efe3] to-[#efe2cb] border-b-4 border-[#d9bf90] p-6 text-center relative">
          <div className="absolute top-1/2 left-5 -translate-y-1/2 w-3 h-3 rotate-45 bg-blue-500 border border-blue-800/50" />
          <div className="absolute top-1/2 right-5 -translate-y-1/2 w-3 h-3 rotate-45 bg-blue-500 border border-blue-800/50" />
          <h1 className="text-4xl font-black text-amber-900 drop-shadow-sm tracking-wide">
            {activeUser.name} • {getCurrentChapterLabel()}
          </h1>
        </div>

        {/* Game Area */}
        <div className="p-6 sm:p-8 flex flex-col items-center gap-7 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9),rgba(245,234,217,0.92))]">
          <div className="w-full max-w-md bg-white/75 border-2 border-amber-200 rounded-2xl px-4 py-3">
            <label htmlFor="visual-stack-in-game" className="block text-sm font-bold text-amber-900 mb-1">Tematică obiecte</label>
            <select
              id="visual-stack-in-game"
              value={visualStack}
              onChange={(event) => setVisualStack(event.target.value as VisualStack)}
              className="w-full rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 focus:outline-none focus:border-amber-500"
            >
              {VISUAL_STACK_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label} — {option.hint}</option>
              ))}
            </select>
          </div>

          {/* Visual Representation */}
          <div className="flex items-center justify-center gap-4 text-4xl font-bold text-amber-900 w-full rounded-3xl border-2 border-amber-200 bg-white/70 p-5 shadow-inner">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-wrap justify-center gap-1.5 min-h-[5rem]">
                {Array.from({ length: num1 }).map((_, i) => (
                  <div key={`n1-${i}`}>
                    <DetailedToken
                      theme={COUNT_ITEM_THEMES[(iconIndex + i) % COUNT_ITEM_THEMES.length]}
                      delay={i * 0.07}
                      shapeIndex={i}
                      stack={visualStack}
                    />
                  </div>
                ))}
              </div>
              <span className="text-5xl text-[#b45309]">{num1}</span>
            </div>

            <span className="text-5xl text-blue-500 pb-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.35)]">+</span>

            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-wrap justify-center gap-1.5 min-h-[5rem]">
                {Array.from({ length: num2 }).map((_, i) => (
                  <div key={`n2-${i}`}>
                    <DetailedToken
                      theme={COUNT_ITEM_THEMES[(iconIndex + i + 2) % COUNT_ITEM_THEMES.length]}
                      delay={i * 0.07}
                      shapeIndex={i + 20}
                      stack={visualStack}
                    />
                  </div>
                ))}
              </div>
              <span className="text-5xl text-[#b45309]">{num2}</span>
            </div>
          </div>

          <div className="text-6xl font-black text-slate-700">
            =
          </div>

          {/* Answer Input */}
          <motion.form
            onSubmit={handleAnswerSubmit}
            animate={wrongAnswer !== null ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[220px]"
          >
            <label htmlFor="answer-input" className="sr-only">Scrie răspunsul</label>
            <input
              id="answer-input"
              type="number"
              inputMode="numeric"
              autoComplete="off"
              value={answerInput}
              onChange={(event) => setAnswerInput(event.target.value)}
              placeholder=""
              disabled={isSpeedBumpActive || showSuccess}
              className={`w-full rounded-xl border-4 px-3 py-2 text-center text-2xl font-black shadow-[0_8px_18px_rgba(120,76,15,0.2)] outline-none transition-colors ${isSpeedBumpActive
                ? 'cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500'
                : wrongAnswer !== null
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : showSuccess
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-amber-400 bg-white text-amber-900 focus:border-blue-500'
                }`}
            />
          </motion.form>

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
          <div className="w-full rounded-[1.5rem] bg-gradient-to-b from-[#255b85] via-[#1c476a] to-[#163654] p-3 border-2 border-[#d2b47d] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
            <TreasureChest progress={chestProgress} latestItem={latestItemIndex} />
          </div>

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
                className={`absolute top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 whitespace-nowrap ${levelNotification === 'up' ? 'bg-green-500 text-white' : 'bg-sky-500 text-white'
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
          onResetProgress={handleResetActiveUserProgress}
          activeUserName={activeUser.name}
          dailyStats={dailyStats}
          userProfile={userProfile}
        />
      )}
    </div>
  );
}
