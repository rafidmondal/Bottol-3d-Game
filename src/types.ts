export type Screen =
  | 'HOME'
  | 'ROUND_SELECT'
  | 'FRIEND_GAME'
  | 'FRIEND_RESULT'
  | 'AI_DIFFICULTY'
  | 'AI_ROUND_SELECT'
  | 'AI_GAME'
  | 'AI_RESULT'
  | 'LEVELS_GRID'
  | 'LEVEL_GAME'
  | 'PRACTICE_MENU'
  | 'PRACTICE_GAME'
  | 'SKINS'
  | 'LEADERBOARD'
  | 'ACHIEVEMENTS'
  | 'SETTINGS'
  | 'PROFILE'
  | 'HOW_TO_PLAY'
  | 'ABOUT';

export type AiDifficulty = 'easy' | 'medium' | 'hard';

export type PracticeSubMode = 'free' | 'target' | 'obstacle' | 'time';

export interface UserProfile {
  name: string;
  avatar: string;
  avatarColor: string;
}

export interface GameSettings {
  soundFx: boolean;
  music: boolean;
  volume: number; // 0-100
  sensitivity: number; // 0-100
  slowmo: boolean;
  quality: 'Auto' | 'Low' | 'Medium' | 'High';
  shadows: boolean;
  particles: boolean;
  handedness: 'Right' | 'Left';
}

export interface SkinItem {
  id: string;
  name: string;
  cost: number;
  starsRequired: number;
  category: 'bottles' | 'caps' | 'trails';
  color: string;
  accentColor?: string;
  roughness?: number;
  metalness?: number;
  transmission?: number;
  emissive?: string;
  description?: string;
}

export interface UserSkinsState {
  owned: string[];
  equippedBottle: string;
  equippedCap: string;
  equippedTrail: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  reward: number;
  target: number;
}

export interface AchievementProgress {
  progress: number;
  claimed: boolean;
}

export interface MatchRecord {
  id: string;
  date: string;
  mode: 'friend' | 'ai';
  rounds: number;
  p1: number;
  p2: number;
  winner: 'p1' | 'p2' | 'tie';
  difficulty?: AiDifficulty;
}

export interface LevelRecord {
  level: number;
  bestScore: number;
  stars: number;
  unlocked: boolean;
}

export interface PracticeStats {
  timeBest: number;
  targetBest: number;
  totalFlips: number;
  perfects: number;
}

export interface OverallStats {
  totalFlips: number;
  winsFriend: number;
  winsAi: number;
  perfects: number;
  edgeBalances: number;
}

export interface DailyRewardState {
  lastClaimDate: string;
  streak: number;
}

export type FlipLandingOutcome =
  | 'PERFECT'
  | 'UPRIGHT'
  | 'EDGE'
  | 'BOUNCE_UPRIGHT'
  | 'DOUBLE_UPRIGHT'
  | 'TRIPLE_UPRIGHT'
  | 'FAIL_ROTATION'
  | 'FAIL_TIPPED'
  | 'FAIL_OFF_TABLE';

export interface FlipFeedback {
  outcome: FlipLandingOutcome;
  points: number;
  text: string;
  color: string;
  flipsCompleted: number;
}

export type ObstacleType =
  | 'none'
  | 'stool'
  | 'box'
  | 'books'
  | 'moving'
  | 'tv'
  | 'fridge'
  | 'minibox'
  | 'microwave'
  | 'speaker'
  | 'washer'
  | 'nightstand'
  | 'crate';

export interface TargetObstacle {
  type: ObstacleType;
  position: { x: number; y: number; z: number };
  size: { x: number; y: number; z: number };
  radius?: number;
  halfWidth?: number;
  halfDepth?: number;
  topY?: number;
  bottomY?: number;
  mesh?: any;
  speed?: number;
  direction?: number;
  movingSpeed?: number;
  movingDistance?: number;
  initialX?: number;
}

export interface LevelConfig {
  id: number;
  title: string;
  description: string;
  targetHeight: number;
  targetDistance: number;
  targetRadius: number;
  targetX?: number;
  obstacleType?: ObstacleType;
  movingSpeed?: number;
  movingDistance?: number;
  wind?: number;
  minFlips?: number;
  starsScoreRequirement: [number, number, number]; // e.g. [1, 2, 3] points required
}
