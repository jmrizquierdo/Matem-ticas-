import { Badge, GameLevel, StudentProfile } from '../types/gamification';

export const GAME_LEVELS: GameLevel[] = [
  {
    levelNumber: 1,
    name: 'Nivel 1: Aprendiz de la Galera',
    subtitle: '1 Cifra en Divisor (Exactas)',
    requiredSolvesToUnlock: 0,
    difficulty: 'easy',
    icon: '🌱',
    colorClass: 'emerald',
    description: 'Aprende los fundamentos del algoritmo de división con números sencillos sin residuo.',
  },
  {
    levelNumber: 2,
    name: 'Nivel 2: Explorador del Resto',
    subtitle: 'Divisiones Enteras con Residuo',
    requiredSolvesToUnlock: 3,
    difficulty: 'medium',
    icon: '🔍',
    colorClass: 'indigo',
    description: 'Domina qué ocurre cuando sobran unidades y comprueba con la prueba de la división.',
  },
  {
    levelNumber: 3,
    name: 'Nivel 3: El Guardián del Cero al Cociente',
    subtitle: 'Casos especiales con ceros intermedios',
    requiredSolvesToUnlock: 7,
    difficulty: 'zero-quotient',
    icon: '⚡',
    colorClass: 'amber',
    description: 'Aprende la regla de oro: ¡cero al cociente y baja la cifra siguiente!',
  },
  {
    levelNumber: 4,
    name: 'Nivel 4: Mago de las 2 Cifras',
    subtitle: 'Divisores de dos dígitos (12, 15, 25...)',
    requiredSolvesToUnlock: 12,
    difficulty: 'two-digit',
    icon: '🏆',
    colorClass: 'purple',
    description: 'Entrena el cálculo y la estimación con divisores de dos cifras como los mayores de primaria.',
  },
  {
    levelNumber: 5,
    name: 'Nivel 5: Gran Maestro Matemático',
    subtitle: 'Desafíos completos sin ayuda',
    requiredSolvesToUnlock: 18,
    difficulty: 'two-digit',
    icon: '👑',
    colorClass: 'rose',
    description: 'Demuestra tu maestría resolviendo cualquier división en tiempo récord.',
  },
];

export const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'badge-exact-master',
    title: 'Maestro de la División Exacta',
    description: 'Resuelve 3 divisiones exactas sin residuo.',
    iconName: 'Sparkles',
    category: 'exact',
    targetCount: 3,
  },
  {
    id: 'badge-remainder-expert',
    title: 'Experto en Residuo',
    description: 'Resuelve 3 divisiones enteras con residuo correctamente.',
    iconName: 'PieChart',
    category: 'remainder',
    targetCount: 3,
  },
  {
    id: 'badge-arch-falcon',
    title: 'Ojo de Halcón del Arquito',
    description: 'Acierta la selección inicial de cifras 5 veces.',
    iconName: 'Eye',
    category: 'arch',
    targetCount: 5,
  },
  {
    id: 'badge-zero-tamer',
    title: 'El Domador del Cero',
    description: 'Supera con éxito 2 divisiones con cero al cociente.',
    iconName: 'ShieldAlert',
    category: 'zero',
    targetCount: 2,
  },
  {
    id: 'badge-streak-fire',
    title: 'Racha Imparable',
    description: 'Consigue una racha de 5 aciertos seguidos.',
    iconName: 'Flame',
    category: 'streak',
    targetCount: 5,
  },
  {
    id: 'badge-duel-champion',
    title: 'Gladiador del Duelo',
    description: 'Gana tu primer duelo 1 vs 1 contra un compañero de clase.',
    iconName: 'Swords',
    category: 'duel',
    targetCount: 1,
  },
];

const STORAGE_KEY_PROFILES = 'aprende_dividir_profiles_v1';
const STORAGE_KEY_ACTIVE = 'aprende_dividir_active_id_v1';

export const DEFAULT_AVATARS = ['🦊', '🦉', '🦁', '🚀', '🐬', '🐼', '🐯', '🌟'];

const INITIAL_PROFILES: StudentProfile[] = [
  {
    id: 'student-1',
    name: 'Lucía M.',
    avatar: '🦊',
    score: 340,
    currentLevel: 3,
    totalSolved: 9,
    exactSolved: 5,
    remainderSolved: 4,
    zeroQuotientSolved: 2,
    archMasterCount: 9,
    currentStreak: 4,
    maxStreak: 6,
    duelWins: 3,
    unlockedBadges: ['badge-exact-master', 'badge-arch-falcon', 'badge-zero-tamer'],
  },
  {
    id: 'student-2',
    name: 'Mateo R.',
    avatar: '🦉',
    score: 280,
    currentLevel: 2,
    totalSolved: 6,
    exactSolved: 3,
    remainderSolved: 3,
    zeroQuotientSolved: 1,
    archMasterCount: 6,
    currentStreak: 2,
    maxStreak: 4,
    duelWins: 2,
    unlockedBadges: ['badge-exact-master', 'badge-remainder-expert'],
  },
  {
    id: 'student-3',
    name: 'Sara P.',
    avatar: '🚀',
    score: 190,
    currentLevel: 2,
    totalSolved: 4,
    exactSolved: 2,
    remainderSolved: 2,
    zeroQuotientSolved: 0,
    archMasterCount: 4,
    currentStreak: 3,
    maxStreak: 3,
    duelWins: 1,
    unlockedBadges: ['badge-exact-master'],
  },
];

export function getStoredProfiles(): StudentProfile[] {
  if (typeof window === 'undefined') return INITIAL_PROFILES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(INITIAL_PROFILES));
      return INITIAL_PROFILES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROFILES;
  }
}

export function saveProfiles(profiles: StudentProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  } catch {
    // Ignore storage errors
  }
}

export function getActiveStudentId(): string {
  if (typeof window === 'undefined') return INITIAL_PROFILES[0].id;
  try {
    const id = localStorage.getItem(STORAGE_KEY_ACTIVE);
    return id || INITIAL_PROFILES[0].id;
  } catch {
    return INITIAL_PROFILES[0].id;
  }
}

export function setActiveStudentId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE, id);
  } catch {
    // Ignore
  }
}

export function getActiveStudent(): StudentProfile {
  const profiles = getStoredProfiles();
  const activeId = getActiveStudentId();
  const found = profiles.find(p => p.id === activeId);
  return found || profiles[0] || INITIAL_PROFILES[0];
}

export function createStudentProfile(name: string, avatar: string): StudentProfile {
  const profiles = getStoredProfiles();
  const newProfile: StudentProfile = {
    id: `student-${Date.now()}`,
    name: name.trim() || 'Nuevo Alumno',
    avatar: avatar || '🌟',
    score: 0,
    currentLevel: 1,
    totalSolved: 0,
    exactSolved: 0,
    remainderSolved: 0,
    zeroQuotientSolved: 0,
    archMasterCount: 0,
    currentStreak: 0,
    maxStreak: 0,
    duelWins: 0,
    unlockedBadges: [],
  };
  const updated = [...profiles, newProfile];
  saveProfiles(updated);
  setActiveStudentId(newProfile.id);
  return newProfile;
}

/**
 * Checks which badges are unlocked after a solved division and updates profile.
 * Returns newly unlocked badge objects (if any) to show celebratory modals.
 */
export function recordSolvedProblem(params: {
  isExact: boolean;
  hasRemainder: boolean;
  hadZeroInQuotient: boolean;
  scoreEarned: number;
}): { updatedProfile: StudentProfile; newBadges: Badge[]; leveledUp: boolean } {
  const profiles = getStoredProfiles();
  const current = getActiveStudent();

  const newTotalSolved = current.totalSolved + 1;
  const newExactSolved = current.exactSolved + (params.isExact ? 1 : 0);
  const newRemainderSolved = current.remainderSolved + (params.hasRemainder ? 1 : 0);
  const newZeroQuotient = current.zeroQuotientSolved + (params.hadZeroInQuotient ? 1 : 0);
  const newArchCount = current.archMasterCount + 1;
  const newStreak = current.currentStreak + 1;
  const newMaxStreak = Math.max(current.maxStreak, newStreak);
  const newScore = current.score + params.scoreEarned;

  // Determine level
  let newLevel = 1;
  for (let i = GAME_LEVELS.length - 1; i >= 0; i--) {
    if (newTotalSolved >= GAME_LEVELS[i].requiredSolvesToUnlock) {
      newLevel = GAME_LEVELS[i].levelNumber;
      break;
    }
  }
  const leveledUp = newLevel > current.currentLevel;

  // Check badges
  const currentlyUnlocked = new Set(current.unlockedBadges);
  const newlyUnlockedBadges: Badge[] = [];

  BADGE_DEFINITIONS.forEach(b => {
    if (currentlyUnlocked.has(b.id)) return;

    let qualifies = false;
    if (b.id === 'badge-exact-master' && newExactSolved >= b.targetCount) qualifies = true;
    if (b.id === 'badge-remainder-expert' && newRemainderSolved >= b.targetCount) qualifies = true;
    if (b.id === 'badge-arch-falcon' && newArchCount >= b.targetCount) qualifies = true;
    if (b.id === 'badge-zero-tamer' && newZeroQuotient >= b.targetCount) qualifies = true;
    if (b.id === 'badge-streak-fire' && newStreak >= b.targetCount) qualifies = true;

    if (qualifies) {
      currentlyUnlocked.add(b.id);
      newlyUnlockedBadges.push(b);
    }
  });

  const updatedProfile: StudentProfile = {
    ...current,
    score: newScore,
    currentLevel: newLevel,
    totalSolved: newTotalSolved,
    exactSolved: newExactSolved,
    remainderSolved: newRemainderSolved,
    zeroQuotientSolved: newZeroQuotient,
    archMasterCount: newArchCount,
    currentStreak: newStreak,
    maxStreak: newMaxStreak,
    unlockedBadges: Array.from(currentlyUnlocked),
  };

  const updatedList = profiles.map(p => (p.id === current.id ? updatedProfile : p));
  saveProfiles(updatedList);

  return { updatedProfile, newBadges: newlyUnlockedBadges, leveledUp };
}

export function recordDuelWin(winnerProfileId?: string): Badge | null {
  const profiles = getStoredProfiles();
  const current = getActiveStudent();
  const targetId = winnerProfileId || current.id;
  const target = profiles.find(p => p.id === targetId) || current;

  const newDuelWins = (target.duelWins || 0) + 1;
  const currentlyUnlocked = new Set(target.unlockedBadges);
  let newBadge: Badge | null = null;

  if (!currentlyUnlocked.has('badge-duel-champion')) {
    currentlyUnlocked.add('badge-duel-champion');
    const bDef = BADGE_DEFINITIONS.find(b => b.id === 'badge-duel-champion');
    if (bDef) newBadge = bDef;
  }

  const updated: StudentProfile = {
    ...target,
    duelWins: newDuelWins,
    score: target.score + 50,
    unlockedBadges: Array.from(currentlyUnlocked),
  };

  const updatedList = profiles.map(p => (p.id === target.id ? updated : p));
  saveProfiles(updatedList);

  return newBadge;
}
