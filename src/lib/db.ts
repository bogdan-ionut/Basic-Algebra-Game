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

export interface GameUser {
  id: string;
  name: string;
  age: number;
  sex: string;
  location: string;
  pin: string;
  avatarDataUrl?: string;
  createdAt: string;
}

const USERS_KEY = 'gameUsers';
const LAST_ACTIVE_USER_KEY = 'lastActiveUserId';

export const getTodayDateString = () => {
  return getDateStringForLocalTimezone(new Date());
};

export const getDateStringDaysAgo = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return getDateStringForLocalTimezone(date);
};

const getDateStringForLocalTimezone = (date: Date) => {
  // Adjust for local timezone to avoid UTC date shifting issues
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().split('T')[0];
};

const getDailyStatsKey = (userId: string, date: string) => `dailyStats_${userId}_${date}`;
const getProfileKey = (userId: string) => `userProfile_${userId}`;

export const loadUsers = async (): Promise<GameUser[]> => {
  const users = await get<GameUser[]>(USERS_KEY);
  return users || [];
};

export const saveUsers = async (users: GameUser[]) => {
  await set(USERS_KEY, users);
};

export const createUser = async (payload: Omit<GameUser, 'id' | 'createdAt'>): Promise<GameUser> => {
  const users = await loadUsers();
  const newUser: GameUser = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveUsers(users);
  await set(LAST_ACTIVE_USER_KEY, newUser.id);
  return newUser;
};

export const getLastActiveUserId = async (): Promise<string | null> => {
  return (await get<string>(LAST_ACTIVE_USER_KEY)) || null;
};

export const setLastActiveUserId = async (userId: string) => {
  await set(LAST_ACTIVE_USER_KEY, userId);
};

export const loadDailyStats = async (userId: string): Promise<DailyStats> => {
  const today = getTodayDateString();
  const stats = await get<DailyStats>(getDailyStatsKey(userId, today));
  return (
    stats || {
      date: today,
      timeSpentSeconds: 0,
      correctAnswers: 0,
      totalAttempts: 0,
      fastGuesses: 0,
    }
  );
};

export const saveDailyStats = async (userId: string, stats: DailyStats) => {
  await set(getDailyStatsKey(userId, stats.date), stats);
};

export const loadUserProfile = async (userId: string): Promise<UserProfile> => {
  const profile = await get<UserProfile>(getProfileKey(userId));
  return (
    profile || {
      score: 0,
      streak: 0,
      lastPlayedDate: '',
      difficultyLevel: 1,
    }
  );
};

export const saveUserProfile = async (userId: string, profile: UserProfile) => {
  await set(getProfileKey(userId), profile);
};
