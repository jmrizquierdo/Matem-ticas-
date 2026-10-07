export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'exact' | 'remainder' | 'arch' | 'zero' | 'duel' | 'speed' | 'streak';
  unlockedAt?: string;
  targetCount: number;
}

export interface GameLevel {
  levelNumber: number;
  name: string;
  subtitle: string;
  requiredSolvesToUnlock: number; // total solves needed across app
  difficulty: 'easy' | 'medium' | 'zero-quotient' | 'two-digit';
  icon: string;
  colorClass: string;
  description: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string; // emoji or icon
  score: number;
  currentLevel: number;
  totalSolved: number;
  exactSolved: number;
  remainderSolved: number;
  zeroQuotientSolved: number;
  archMasterCount: number;
  currentStreak: number;
  maxStreak: number;
  duelWins: number;
  unlockedBadges: string[]; // badge ids
}

export interface StudentHistoryPoint {
  sessionLabel: string;
  date: string;
  accuracy: number; // percentage 0-100%
  avgResponseTimeSec: number; // in seconds
  problemsSolved: number;
  category: string;
}

export interface StudentMetricsSummary {
  studentId: string;
  studentName: string;
  avatar: string;
  avgAccuracy: number;
  avgResponseTimeSec: number;
  totalSolved: number;
  history: StudentHistoryPoint[];
}
