/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AppMode } from './types/division';
import { Navbar } from './components/Navbar';
import { StepByStepTutorial } from './components/StepByStepTutorial';
import { VisualSharingLab } from './components/VisualSharingLab';
import { GameMissions } from './components/GameMissions';
import { TwoPlayerDuel } from './components/TwoPlayerDuel';
import { LeaderboardView } from './components/LeaderboardView';
import { TeacherPanel } from './components/TeacherPanel';
import { BadgeModal } from './components/BadgeModal';
import { Badge } from './types/gamification';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('step-by-step');
  const [activeProblem, setActiveProblem] = useState<{ dividend: number; divisor: number }>({
    dividend: 75,
    divisor: 3,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [globalBadgeUnlocked, setGlobalBadgeUnlocked] = useState<Badge | null>(null);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleLoadInSimulator = (d: number, div: number) => {
    setActiveProblem({ dividend: d, divisor: div });
    setCurrentMode('step-by-step');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Bar adhering to the Constitution */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-8">
        {currentMode === 'step-by-step' && (
          <StepByStepTutorial
            key={`${activeProblem.dividend}-${activeProblem.divisor}`}
            initialProblem={activeProblem}
            onGoToLeaderboard={() => setCurrentMode('leaderboard')}
          />
        )}

        {currentMode === 'visual-sharing' && <VisualSharingLab />}

        {currentMode === 'game-missions' && <GameMissions />}

        {currentMode === 'two-player-duel' && (
          <TwoPlayerDuel onBadgeUnlocked={b => setGlobalBadgeUnlocked(b)} />
        )}

        {currentMode === 'leaderboard' && <LeaderboardView />}

        {currentMode === 'teacher-hub' && (
          <TeacherPanel onLoadInSimulator={handleLoadInSimulator} />
        )}
      </main>

      {/* Global Badge celebration modal */}
      {globalBadgeUnlocked && (
        <BadgeModal
          badge={globalBadgeUnlocked}
          level={null}
          onClose={() => setGlobalBadgeUnlocked(null)}
        />
      )}

      {/* Clean Educational Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 px-4 md:px-8 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Aprende a Dividir</span>
            <span aria-hidden="true">·</span>
            <span>Didáctica de las Matemáticas en Educación Primaria</span>
            <span aria-hidden="true">·</span>
            <span>Algoritmo tradicional de Galera</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>D = d × c + r</span>
            <span aria-hidden="true">·</span>
            <span>Recurso interactivo para aula y PDI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
