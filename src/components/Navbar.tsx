import React from 'react';
import mascotFoxImg from '../assets/images/mascot_division_fox_1791392004408.jpg';
import { AppMode } from '../types/division';
import { Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { setAudioMuted, getAudioMuted, playPop } from '../utils/audio';

interface NavbarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const [isMuted, setIsMuted] = React.useState<boolean>(() => getAudioMuted());

  const handleToggleAudio = () => {
    const next = !isMuted;
    setIsMuted(next);
    setAudioMuted(next);
    if (!next) {
      playPop();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-indigo-100 px-4 md:px-8 py-3.5 print:hidden shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand Zone with Mascot Icon */}
        <div className="flex items-center gap-2.5">
          <img
            src={mascotFoxImg}
            alt="Mascota Zorrito"
            className="w-9 h-9 rounded-xl object-cover border-2 border-amber-300 shadow-xs shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-xl md:text-2xl font-black tracking-tight text-indigo-950 font-sans">
              Aprende a Dividir
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold hidden sm:inline-block border border-amber-200">
              3º y 4º Primaria 🦊
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links / Segmented Buttons */}
        <nav className="flex items-center gap-1 md:gap-1.5 overflow-x-auto scrollbar-none py-1">
          <button
            type="button"
            onClick={() => onSelectMode('step-by-step')}
            className={`px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              currentMode === 'step-by-step'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Paso a Paso
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('visual-sharing')}
            className={`px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              currentMode === 'visual-sharing'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Reparto Visual
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('game-missions')}
            className={`px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              currentMode === 'game-missions'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Misiones
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('two-player-duel')}
            className={`px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
              currentMode === 'two-player-duel'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Duelo 1 vs 1</span>
            <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1 py-0.2 rounded font-bold">2P</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('leaderboard')}
            className={`px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              currentMode === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Ranking
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('teacher-hub')}
            className={`px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              currentMode === 'teacher-hub'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Rincón Docente
          </button>
        </nav>

        {/* Zone 3: 1-2 Primary Action controls */}
        <div className="flex items-center gap-2">
          {/* Audio toggle button */}
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isMuted
                ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
            title={isMuted ? 'Activar efectos de sonido' : 'Silenciar sonido (Modo Aula)'}
            aria-label="Alternar sonido"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen for Interactive Whiteboard (PDI) */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors hidden sm:flex cursor-pointer"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa (Pizarra Digital)'}
            aria-label="Alternar pantalla completa"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
