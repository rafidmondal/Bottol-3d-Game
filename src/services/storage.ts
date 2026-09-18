import {
  UserProfile,
  GameSettings,
  UserSkinsState,
  AchievementProgress,
  MatchRecord,
  LevelRecord,
  PracticeStats,
  OverallStats,
  DailyRewardState,
} from '../types';
import { updateDailyMissionProgress } from './dailyMissions';

const STORAGE_KEYS = {
  PROFILE: 'bf3d_profile',
  COINS: 'bf3d_coins',
  STARS: 'bf3d_stars_total',
  LEVELS: 'bf3d_levels',
  SKINS: 'bf3d_skins',
  ACHIEVEMENTS: 'bf3d_achievements',
  MATCHES: 'bf3d_matches',
  PRACTICE: 'bf3d_practice',
  SETTINGS: 'bf3d_settings',
  DAILY: 'bf3d_daily',
  STATS: 'bf3d_stats',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Player',
  avatar: 'bottle',
  avatarColor: '#3B82F6',
};

const DEFAULT_SETTINGS: GameSettings = {
  soundFx: true,
  music: true,
  volume: 80,
  sensitivity: 10,
  slowmo: true,
  quality: 'Auto',
  shadows: true,
  particles: true,
  handedness: 'Right',
};

const DEFAULT_SKINS: UserSkinsState = {
  owned: ['classic', 'blue', 'capRed', 'trailSparkle'],
  equippedBottle: 'classic',
  equippedCap: 'capRed',
  equippedTrail: 'trailSparkle',
};

const DEFAULT_PRACTICE: PracticeStats = {
  timeBest: 0,
  targetBest: 0,
  totalFlips: 0,
  perfects: 0,
};

const DEFAULT_STATS: OverallStats = {
  totalFlips: 0,
  winsFriend: 0,
  winsAi: 0,
  perfects: 0,
  edgeBalances: 0,
};

// Initial levels state: level 1 is unlocked
function createInitialLevels(): Record<number, LevelRecord> {
  const levels: Record<number, LevelRecord> = {};
  for (let i = 1; i <= 20; i++) {
    levels[i] = {
      level: i,
      bestScore: 0,
      stars: 0,
      unlocked: i === 1,
    };
  }
  return levels;
}

// Storage change listeners
type StorageListener = () => void;
const listeners = new Set<StorageListener>();

export function subscribeStorage(callback: StorageListener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Storage listener error:', e);
    }
  });
}

// PROFILE
export function getProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: Partial<UserProfile>): UserProfile {
  const current = getProfile();
  const updated = { ...current, ...profile };
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    notifyListeners();
  } catch (e) {
    console.error(e);
  }
  return updated;
}

export function isPhotoCustomizationUnlocked(): boolean {
  try {
    return localStorage.getItem('bottleflip_photo_unlocked') === 'true';
  } catch (e) {
    return false;
  }
}

export function unlockPhotoCustomization(): void {
  try {
    localStorage.setItem('bottleflip_photo_unlocked', 'true');
    notifyListeners();
  } catch (e) {
    console.error(e);
  }
}

export function isNameCustomizationUnlocked(): boolean {
  try {
    return getRenameCredits() > 0;
  } catch (e) {
    return false;
  }
}

export function getRenameCredits(): number {
  try {
    const raw = localStorage.getItem('bottleflip_rename_credits');
    if (raw !== null) {
      const val = parseInt(raw, 10);
      return isNaN(val) ? 0 : val;
    }
  } catch (e) {
    console.error(e);
  }
  return 0;
}

export function addRenameCredit(): number {
  const current = getRenameCredits();
  const next = current + 1;
  try {
    localStorage.setItem('bottleflip_rename_credits', next.toString());
    localStorage.setItem('bottleflip_name_unlocked', 'true');
    notifyListeners();
  } catch (e) {
    console.error(e);
  }
  return next;
}

export function consumeRenameCredit(): boolean {
  const current = getRenameCredits();
  if (current > 0) {
    try {
      const next = current - 1;
      localStorage.setItem('bottleflip_rename_credits', next.toString());
      if (next === 0) {
        localStorage.removeItem('bottleflip_name_unlocked');
      }
      notifyListeners();
    } catch (e) {
      console.error(e);
    }
    return true;
  }
  return false;
}

export function unlockNameCustomization(): void {
  addRenameCredit();
}

// COINS
export function getCoins(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COINS);
    if (raw !== null) return parseInt(raw, 10) || 0;
  } catch (e) {
    console.error(e);
  }
  return 150; // Welcome starting bonus coins!
}

export function addCoins(amount: number): number {
  const current = getCoins();
  const next = Math.max(0, current + amount);
  try {
    localStorage.setItem(STORAGE_KEYS.COINS, next.toString());
    checkAchievementProgress('rich', next);
    notifyListeners();
  } catch (e) {
    console.error(e);
  }
  return next;
}

export function spendCoins(amount: number): boolean {
  const current = getCoins();
  if (current >= amount) {
    addCoins(-amount);
    return true;
  }
  return false;
}

// TOTAL STARS
export function getTotalStars(): number {
  const levels = getLevels();
  let total = 0;
  Object.values(levels).forEach((l) => {
    total += l.stars || 0;
  });
  return total;
}

// Check if Endless Mode (Level 21+) is unlocked (unlocked after conquering Level 20)
export function isEndlessUnlocked(): boolean {
  const levels = getLevels();
  return (levels[20]?.stars || 0) >= 1 || !!levels[21]?.unlocked;
}

// Get the highest level currently unlocked by the player
export function getMaxUnlockedLevel(): number {
  const levels = getLevels();
  const unlocked = Object.values(levels)
    .filter((l) => l.unlocked)
    .map((l) => l.level);
  return Math.max(1, ...unlocked);
}

// LEVELS
export function getLevels(): Record<number, LevelRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEVELS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }
  const initial = createInitialLevels();
  try {
    localStorage.setItem(STORAGE_KEYS.LEVELS, JSON.stringify(initial));
  } catch (e) {
    console.error(e);
  }
  return initial;
}

export function recordLevelSuccess(level: number, score: number, starsEarned: number): void {
  const levels = getLevels();
  const current = levels[level] || { level, bestScore: 0, stars: 0, unlocked: true };
  
  const newStars = Math.max(current.stars, starsEarned);
  const newBest = Math.max(current.bestScore, score);

  levels[level] = {
    level,
    bestScore: newBest,
    stars: newStars,
    unlocked: true,
  };

  // Unlock next level
  const nextLevel = level + 1;
  if (!levels[nextLevel]) {
    levels[nextLevel] = {
      level: nextLevel,
      bestScore: 0,
      stars: 0,
      unlocked: true,
    };
  } else {
    levels[nextLevel].unlocked = true;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.LEVELS, JSON.stringify(levels));
    // Reward coins: 20 + 10 * stars
    addCoins(20 + 10 * starsEarned);
    
    // Check level achievements
    if (level >= 10) incrementAchievement('level10', 1);
    if (level >= 20) incrementAchievement('level20', 1);
    if (level >= 50) incrementAchievement('level50', 1);

    // Daily mission progression
    updateDailyMissionProgress('level_clear', 1);

    notifyListeners();
  } catch (e) {
    console.error(e);
  }
}

export function skipLevel(level: number): void {
  // Mark current level complete and advance
  recordLevelSuccess(level, 100, 1);
}

// SKINS
export function getSkinsState(): UserSkinsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SKINS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_SKINS;
}

export function saveSkinsState(skins: Partial<UserSkinsState>): UserSkinsState {
  const current = getSkinsState();
  const updated = { ...current, ...skins };
  try {
    localStorage.setItem(STORAGE_KEYS.SKINS, JSON.stringify(updated));
    checkAchievementProgress('collector', updated.owned.length);
    notifyListeners();
  } catch (e) {
    console.error(e);
  }
  return updated;
}

// SETTINGS
export function getSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      // If user had previous uncustomized default of 50, adjust to requested default 10
      if (parsed && (parsed.sensitivity === undefined || parsed.sensitivity === 50)) {
        parsed.sensitivity = 10;
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Partial<GameSettings>): GameSettings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    notifyListeners();
  } catch (e) {
    console.error(e);
  }
  return updated;
}

// STATS
export function getStats(): OverallStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_STATS;
}

export function recordFlip(isSuccessful: boolean, isPerfect: boolean, isEdge = false, rotations = 1): void {
  const stats = getStats();
  stats.totalFlips += 1;
  if (isPerfect) stats.perfects += 1;
  if (isEdge) stats.edgeBalances += 1;

  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error(e);
  }

  // Daily missions progression
  updateDailyMissionProgress('total_throws', 1);
  if (isSuccessful) {
    updateDailyMissionProgress('flips', 1);
    if (rotations >= 2) {
      updateDailyMissionProgress('double', 1);
    }
  }
  if (isPerfect) {
    updateDailyMissionProgress('perfect', 1);
  }
  if (isEdge) {
    updateDailyMissionProgress('edge', 1);
  }

  // Achievement triggers
  incrementAchievement('flips100', 1);
  incrementAchievement('flips1000', 1);
  if (isSuccessful) {
    incrementAchievement('firstFlip', 1);
  }
  if (isPerfect) {
    incrementAchievement('perfect10', 1);
  }
  if (isEdge) {
    incrementAchievement('edgeMaster', 1);
  }

  notifyListeners();
}

// MATCH RECORDS (Leaderboard)
export function getMatches(): MatchRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATCHES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveMatch(match: Omit<MatchRecord, 'id' | 'date'>): MatchRecord {
  const matches = getMatches();
  const newRecord: MatchRecord = {
    ...match,
    id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    date: new Date().toISOString(),
  };
  matches.unshift(newRecord);
  if (matches.length > 50) matches.pop(); // keep recent 50

  try {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    const stats = getStats();
    if (match.mode === 'friend') {
      if (match.winner === 'p1') stats.winsFriend += 1;
      incrementAchievement('winFriend', 1);
    } else if (match.mode === 'ai') {
      if (match.winner === 'p1') {
        stats.winsAi += 1;
        updateDailyMissionProgress('ai_win', 1);
        if (match.difficulty === 'hard') {
          incrementAchievement('beatHard', 1);
        }
      }
    }
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    notifyListeners();
  } catch (e) {
    console.error(e);
  }
  return newRecord;
}

// PRACTICE STATS
export function getPracticeStats(): PracticeStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRACTICE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_PRACTICE;
}

export function savePracticeStats(update: Partial<PracticeStats>): void {
  const current = getPracticeStats();
  const next: PracticeStats = {
    ...current,
    timeBest: Math.max(current.timeBest, update.timeBest ?? 0),
    targetBest: Math.max(current.targetBest, update.targetBest ?? 0),
    totalFlips: current.totalFlips + (update.totalFlips ?? 0),
    perfects: current.perfects + (update.perfects ?? 0),
  };
  try {
    localStorage.setItem(STORAGE_KEYS.PRACTICE, JSON.stringify(next));
    if (update.timeBest || update.targetBest) {
      updateDailyMissionProgress('practice_score', Math.max(update.timeBest ?? 0, update.targetBest ?? 0));
    }
    notifyListeners();
  } catch (e) {
    console.error(e);
  }
}

// ACHIEVEMENTS
export function getAchievementsState(): Record<string, AchievementProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return {};
}

export function incrementAchievement(id: string, delta = 1): void {
  const state = getAchievementsState();
  const item = state[id] || { progress: 0, claimed: false };
  item.progress += delta;
  state[id] = item;
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(state));
    notifyListeners();
  } catch (e) {
    console.error(e);
  }
}

export function checkAchievementProgress(id: string, currentVal: number): void {
  const state = getAchievementsState();
  const item = state[id] || { progress: 0, claimed: false };
  if (currentVal > item.progress) {
    item.progress = currentVal;
    state[id] = item;
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(state));
      notifyListeners();
    } catch (e) {
      console.error(e);
    }
  }
}

export function claimAchievement(id: string, reward: number): boolean {
  const state = getAchievementsState();
  const item = state[id];
  if (item && !item.claimed) {
    item.claimed = true;
    state[id] = item;
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(state));
      addCoins(reward);
      notifyListeners();
      return true;
    } catch (e) {
      console.error(e);
    }
  }
  return false;
}

// DAILY REWARD
export function getDailyRewardState(): { canClaim: boolean; currentDay: number; streak: number } {
  const todayStr = new Date().toISOString().split('T')[0];
  let state: DailyRewardState = { lastClaimDate: '', streak: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY);
    if (raw) state = JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  if (state.lastClaimDate === todayStr) {
    return { canClaim: false, currentDay: Math.min(state.streak, 7), streak: state.streak };
  }

  // Check if yesterday or older
  if (!state.lastClaimDate) {
    return { canClaim: true, currentDay: 1, streak: 0 };
  }

  const lastDate = new Date(state.lastClaimDate);
  const now = new Date();
  const diffDays = Math.round((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { canClaim: true, currentDay: Math.min(state.streak + 1, 7), streak: state.streak };
  } else {
    // streak reset
    return { canClaim: true, currentDay: 1, streak: 0 };
  }
}

export function claimDailyReward(): { reward: number; streak: number } {
  const status = getDailyRewardState();
  if (!status.canClaim) return { reward: 0, streak: status.streak };

  const todayStr = new Date().toISOString().split('T')[0];
  const newStreak = status.currentDay;
  const reward = 25 * Math.min(newStreak, 5); // caps at x5 multiplier

  const newState: DailyRewardState = {
    lastClaimDate: todayStr,
    streak: newStreak,
  };

  try {
    localStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(newState));
    addCoins(reward);
    if (newStreak >= 3) {
      incrementAchievement('daily3', 1);
    }
    notifyListeners();
  } catch (e) {
    console.error(e);
  }

  return { reward, streak: newStreak };
}

// RESET ALL PROGRESS
export function resetAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  notifyListeners();
}
