import { addCoins } from './storage';

export type MissionType =
  | 'flips'
  | 'perfect'
  | 'double'
  | 'ai_win'
  | 'level_clear'
  | 'practice_score'
  | 'edge'
  | 'total_throws';

export interface DailyMission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  target: number;
  progress: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
  iconName: 'flips' | 'perfect' | 'double' | 'ai' | 'level' | 'practice' | 'edge' | 'throw';
}

export interface DailyMissionsState {
  date: string; // 'YYYY-MM-DD'
  missions: DailyMission[];
  allCompletedBonusClaimed: boolean;
  bonusCoins: number;
}

const STORAGE_KEY = 'bf3d_daily_missions';
const ALL_BONUS_COINS = 500;

// Mission Templates Pool
interface MissionTemplate {
  type: MissionType;
  title: string;
  description: string;
  target: number;
  rewardCoins: number;
  iconName: DailyMission['iconName'];
}

const MISSION_POOL: MissionTemplate[] = [
  {
    type: 'flips',
    title: 'Flip Novice',
    description: 'Land 5 successful bottle flips',
    target: 5,
    rewardCoins: 150,
    iconName: 'flips',
  },
  {
    type: 'flips',
    title: 'Flip Maestro',
    description: 'Land 10 successful bottle flips',
    target: 10,
    rewardCoins: 250,
    iconName: 'flips',
  },
  {
    type: 'perfect',
    title: 'Perfectionist',
    description: 'Land 2 Perfect 10 standing flips',
    target: 2,
    rewardCoins: 200,
    iconName: 'perfect',
  },
  {
    type: 'perfect',
    title: 'Laser Precision',
    description: 'Score 4 Perfect 10 standings',
    target: 4,
    rewardCoins: 350,
    iconName: 'perfect',
  },
  {
    type: 'double',
    title: 'Double Trouble',
    description: 'Perform 2 Double Flips in the air',
    target: 2,
    rewardCoins: 250,
    iconName: 'double',
  },
  {
    type: 'double',
    title: 'Sky Acrobat',
    description: 'Pull off 4 Double or Triple rotations',
    target: 4,
    rewardCoins: 400,
    iconName: 'double',
  },
  {
    type: 'ai_win',
    title: 'Robot Slayer',
    description: 'Win 1 match against the AI in AI Battle',
    target: 1,
    rewardCoins: 250,
    iconName: 'ai',
  },
  {
    type: 'level_clear',
    title: 'Level Climber',
    description: 'Successfully complete 2 Levels in Level Mode',
    target: 2,
    rewardCoins: 300,
    iconName: 'level',
  },
  {
    type: 'practice_score',
    title: 'Practice Grind',
    description: 'Score 120+ points in Practice Mode',
    target: 120,
    rewardCoins: 200,
    iconName: 'practice',
  },
  {
    type: 'edge',
    title: 'Cap Balancer',
    description: 'Land on the Cap or Edge 1 time',
    target: 1,
    rewardCoins: 350,
    iconName: 'edge',
  },
  {
    type: 'total_throws',
    title: 'Throwing Machine',
    description: 'Launch the bottle 20 times in any mode',
    target: 20,
    rewardCoins: 150,
    iconName: 'throw',
  },
];

// Listeners
type DailyListener = () => void;
const listeners = new Set<DailyListener>();

export function subscribeDailyMissions(cb: DailyListener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function notify() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error(e);
    }
  });
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Deterministic or pseudo-random shuffle based on date string
function generateDailyMissions(todayStr: string): DailyMission[] {
  // Simple seed hash from date string
  let seed = 0;
  for (let i = 0; i < todayStr.length; i++) {
    seed = (seed * 31 + todayStr.charCodeAt(i)) >>> 0;
  }

  const shuffled = [...MISSION_POOL];
  // Fisher-Yates with seed
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const rnd = seed / 233280;
    const j = Math.floor(rnd * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Pick 4 diverse missions with unique types where possible
  const selected: MissionTemplate[] = [];
  const usedTypes = new Set<string>();

  for (const item of shuffled) {
    if (!usedTypes.has(item.type)) {
      selected.push(item);
      usedTypes.add(item.type);
      if (selected.length === 4) break;
    }
  }

  // Fallback if not enough unique types
  if (selected.length < 4) {
    for (const item of shuffled) {
      if (!selected.includes(item)) {
        selected.push(item);
        if (selected.length === 4) break;
      }
    }
  }

  return selected.map((tpl, idx) => ({
    id: `mission_${todayStr}_${idx}_${tpl.type}`,
    type: tpl.type,
    title: tpl.title,
    description: tpl.description,
    target: tpl.target,
    progress: 0,
    rewardCoins: tpl.rewardCoins,
    completed: false,
    claimed: false,
    iconName: tpl.iconName,
  }));
}

export function getDailyMissionsState(): DailyMissionsState {
  const todayStr = getTodayKey();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: DailyMissionsState = JSON.parse(raw);
      if (parsed && parsed.date === todayStr && Array.isArray(parsed.missions) && parsed.missions.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading daily missions:', e);
  }

  // Generate fresh missions for today
  const fresh: DailyMissionsState = {
    date: todayStr,
    missions: generateDailyMissions(todayStr),
    allCompletedBonusClaimed: false,
    bonusCoins: ALL_BONUS_COINS,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch (e) {
    console.error(e);
  }

  return fresh;
}

export function updateDailyMissionProgress(type: MissionType, amount = 1): void {
  const state = getDailyMissionsState();
  let changed = false;

  state.missions = state.missions.map((m) => {
    if (m.type === type && !m.completed) {
      const nextProg = Math.min(m.progress + amount, m.target);
      if (nextProg !== m.progress) {
        changed = true;
        const isCompleted = nextProg >= m.target;
        return {
          ...m,
          progress: nextProg,
          completed: isCompleted,
        };
      }
    }
    return m;
  });

  if (changed) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      notify();
    } catch (e) {
      console.error(e);
    }
  }
}

export function claimDailyMission(missionId: string): boolean {
  const state = getDailyMissionsState();
  let rewardClaimed = 0;

  state.missions = state.missions.map((m) => {
    if (m.id === missionId && m.completed && !m.claimed) {
      rewardClaimed = m.rewardCoins;
      return { ...m, claimed: true };
    }
    return m;
  });

  if (rewardClaimed > 0) {
    addCoins(rewardClaimed);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      notify();
    } catch (e) {
      console.error(e);
    }
    return true;
  }
  return false;
}

export function claimDailyAllBonus(): boolean {
  const state = getDailyMissionsState();
  const allComplete = state.missions.every((m) => m.completed);

  if (allComplete && !state.allCompletedBonusClaimed) {
    state.allCompletedBonusClaimed = true;
    addCoins(state.bonusCoins);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      notify();
    } catch (e) {
      console.error(e);
    }
    return true;
  }
  return false;
}

export function getUnclaimedDailyMissionsCount(): number {
  const state = getDailyMissionsState();
  let count = state.missions.filter((m) => m.completed && !m.claimed).length;
  if (state.missions.every((m) => m.completed) && !state.allCompletedBonusClaimed) {
    count += 1;
  }
  return count;
}

export function getTimeUntilNextDailyReset(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diff = Math.max(0, midnight.getTime() - now.getTime());

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}
