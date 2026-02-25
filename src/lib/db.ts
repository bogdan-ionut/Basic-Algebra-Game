import { get, set } from 'idb-keyval';

export interface DailyStats {
  date: string;
  timeSpentSeconds: number;
  correctAnswers: number;
  totalAttempts: number;
  fastGuesses: number;
}

export interface UserProfile {
  score: number;
  streak: number;
  lastPlayedDate: string;
  difficultyLevel: number;
}

export const getTodayDateString = () => {
  const today = new Date();
  // Adjust for local timezone to avoid UTC date shifting issues
  const offset = today.getTimezoneOffset() * 60000;
  const localDate = new Date(today.getTime() - offset);
  return localDate.toISOString().split('T')[0];
};

export const loadDailyStats = async (): Promise<DailyStats> => {
  const today = getTodayDateString();
  const stats = await get<DailyStats>(`dailyStats_${today}`);
  return stats || {
    date: today,
    timeSpentSeconds: 0,
    correctAnswers: 0,
    totalAttempts: 0,
    fastGuesses: 0,
  };
};

export const saveDailyStats = async (stats: DailyStats) => {
  await set(`dailyStats_${stats.date}`, stats);
};

export const loadUserProfile = async (): Promise<UserProfile> => {
  const profile = await get<UserProfile>('userProfile');
  return profile || {
    score: 0,
    streak: 0,
    lastPlayedDate: '',
    difficultyLevel: 1,
  };
};

export const saveUserProfile = async (profile: UserProfile) => {
  await set('userProfile', profile);
};
