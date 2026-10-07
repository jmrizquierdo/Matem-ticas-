import React, { useState } from 'react';
import {
  getStoredProfiles,
  getActiveStudent,
  setActiveStudentId,
  createStudentProfile,
  DEFAULT_AVATARS,
  BADGE_DEFINITIONS,
  GAME_LEVELS,
} from '../utils/gamificationStore';
import { StudentProfile } from '../types/gamification';
import { playPop, playSuccess } from '../utils/audio';
import {
  Trophy,
  Award,
  Star,
  Flame,
  UserPlus,
  Users,
  CheckCircle2,
  Lock,
  Sparkles,
  PieChart,
  Eye,
  ShieldAlert,
  Swords,
} from 'lucide-react';

interface LeaderboardViewProps {
  onProfileChanged?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onProfileChanged }) => {
  const [profiles, setProfiles] = useState<StudentProfile[]>(() => getStoredProfiles());
  const [activeStudent, setActiveStudent] = useState<StudentProfile>(() => getActiveStudent());
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);

  // Sort profiles by score descending
  const sortedProfiles = [...profiles].sort((a, b) => b.score - a.score);

  const handleSelectStudent = (id: string) => {
    setActiveStudentId(id);
    const updated = getActiveStudent();
    setActiveStudent(updated);
    playPop();
    onProfileChanged?.();
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const created = createStudentProfile(newName.trim(), selectedAvatar);
    setProfiles(getStoredProfiles());
    setActiveStudent(created);
    setNewName('');
    setShowNewModal(false);
    playSuccess();
    onProfileChanged?.();
  };

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'PieChart':
        return <PieChart className="w-5 h-5 text-indigo-500" />;
      case 'Eye':
        return <Eye className="w-5 h-5 text-emerald-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'Swords':
        return <Swords className="w-5 h-5 text-purple-500" />;
      default:
        return <Award className="w-5 h-5 text-indigo-500" />;
    }
  };

  // Next level progress
  const currentLevelObj = GAME_LEVELS.find(l => l.levelNumber === activeStudent.currentLevel) || GAME_LEVELS[0];
  const nextLevelObj = GAME_LEVELS.find(l => l.levelNumber === activeStudent.currentLevel + 1);
  const currentSolves = activeStudent.totalSolved;
  const currentFloor = currentLevelObj.requiredSolvesToUnlock;
  const nextCeiling = nextLevelObj ? nextLevelObj.requiredSolvesToUnlock : currentFloor + 10;
  const progressPercent = nextLevelObj
    ? Math.min(100, Math.max(0, Math.round(((currentSolves - currentFloor) / (nextCeiling - currentFloor)) * 100)))
    : 100;

  return (
    <div className="space-y-6">
      {/* Active Student Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-3xl shadow-inner shrink-0">
            {activeStudent.avatar}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Alumno en juego:
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Activo
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 font-sans">
              {activeStudent.name}
            </h3>
            <div className="text-xs text-slate-500 font-medium">
              {currentLevelObj.name} · <strong className="text-indigo-700">{activeStudent.score} puntos</strong>
            </div>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div className="flex-1 max-w-sm space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600">
              {nextLevelObj ? `Hacia ${nextLevelObj.name}` : '¡Nivel Máximo Alcanzado!'}
            </span>
            <span className="font-mono text-slate-400 font-bold">
              {activeStudent.totalSolved} / {nextLevelObj ? nextCeiling : currentSolves} resueltas
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Racha actual: {activeStudent.currentStreak} 🔥</span>
            <span>Insignias: {activeStudent.unlockedBadges.length} / {BADGE_DEFINITIONS.length} 🎖️</span>
          </div>
        </div>

        {/* Change / Add Student button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Nuevo Alumno</span>
          </button>
        </div>
      </div>

      {/* Grid: Badges Showcase (Left) and Leaderboard Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Badges Collection (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-sm text-slate-900">
                  Muro de Insignias y Logros
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {activeStudent.unlockedBadges.length} de {BADGE_DEFINITIONS.length} conseguidas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BADGE_DEFINITIONS.map(badge => {
                const isUnlocked = activeStudent.unlockedBadges.includes(badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isUnlocked
                        ? 'bg-amber-50/50 border-amber-200 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isUnlocked ? 'bg-amber-100' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isUnlocked ? renderBadgeIcon(badge.iconName) : <Lock className="w-5 h-5" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${isUnlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                          {badge.title}
                        </span>
                        {isUnlocked && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Levels Unlocked Reference */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              Escala de Niveles del Algoritmo
            </h4>
            <div className="space-y-2">
              {GAME_LEVELS.map(lvl => {
                const isCurrent = activeStudent.currentLevel === lvl.levelNumber;
                const isPassed = activeStudent.currentLevel > lvl.levelNumber;

                return (
                  <div
                    key={lvl.levelNumber}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      isCurrent
                        ? 'border-indigo-400 bg-indigo-50/50 ring-1 ring-indigo-300 font-bold'
                        : isPassed
                        ? 'border-emerald-200 bg-emerald-50/30 text-emerald-950'
                        : 'border-slate-200 bg-slate-50/50 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{lvl.icon}</span>
                      <div>
                        <div className="font-bold">{lvl.name}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{lvl.subtitle}</div>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono">
                      {isCurrent ? (
                        <span className="text-indigo-700 font-bold">Nivel Actual</span>
                      ) : isPassed ? (
                        <span className="text-emerald-700">✓ Superado</span>
                      ) : (
                        <span>Requiere {lvl.requiredSolvesToUnlock} divisiones</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Class Leaderboard (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  Ranking de la Clase (Salón de la Fama)
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {profiles.length} alumnos
              </span>
            </div>

            {/* Podium for Top 3 */}
            <div className="grid grid-cols-3 gap-2 text-center py-2 border-b border-slate-100">
              {/* 2nd place */}
              {sortedProfiles[1] && (
                <div
                  onClick={() => handleSelectStudent(sortedProfiles[1].id)}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-end cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className="text-lg">🥈</span>
                  <span className="text-2xl mt-1">{sortedProfiles[1].avatar}</span>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[80px]">
                    {sortedProfiles[1].name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {sortedProfiles[1].score} pts
                  </span>
                </div>
              )}

              {/* 1st place */}
              {sortedProfiles[0] && (
                <div
                  onClick={() => handleSelectStudent(sortedProfiles[0].id)}
                  className="p-3 rounded-xl bg-amber-50/70 border-2 border-amber-300 flex flex-col items-center justify-end -mt-2 cursor-pointer shadow-xs hover:bg-amber-100/70 transition-colors"
                >
                  <span className="text-xl">👑 🥇</span>
                  <span className="text-3xl mt-1">{sortedProfiles[0].avatar}</span>
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[85px]">
                    {sortedProfiles[0].name}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-900">
                    {sortedProfiles[0].score} pts
                  </span>
                </div>
              )}

              {/* 3rd place */}
              {sortedProfiles[2] && (
                <div
                  onClick={() => handleSelectStudent(sortedProfiles[2].id)}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-end cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className="text-lg">🥉</span>
                  <span className="text-2xl mt-1">{sortedProfiles[2].avatar}</span>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[80px]">
                    {sortedProfiles[2].name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {sortedProfiles[2].score} pts
                  </span>
                </div>
              )}
            </div>

            {/* Complete Class List */}
            <div className="space-y-1.5 pt-1">
              {sortedProfiles.map((student, rankIdx) => {
                const isActive = student.id === activeStudent.id;

                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleSelectStudent(student.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-300'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-slate-400 w-4 text-center">
                        #{rankIdx + 1}
                      </span>
                      <span className="text-lg">{student.avatar}</span>
                      <div>
                        <div className="font-bold text-slate-800">
                          {student.name}
                          {isActive && (
                            <span className="text-[10px] text-indigo-700 ml-1.5 font-normal">
                              (Tú)
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Nivel {student.currentLevel} · {student.totalSolved} resueltas
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-indigo-700">
                        {student.score} pts
                      </div>
                      <div className="text-[10px] text-amber-600">
                        {student.unlockedBadges.length} 🎖️
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for creating a new student profile */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Nuevo Alumno / Alumna
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Alumno:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lucas G."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Elige un Avatar:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {DEFAULT_AVATARS.map(avatar => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`h-12 rounded-xl border-2 text-2xl flex items-center justify-center transition-all cursor-pointer ${
                        selectedAvatar === avatar
                          ? 'border-indigo-600 bg-indigo-50 shadow-xs scale-105'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Guardar y Jugar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
