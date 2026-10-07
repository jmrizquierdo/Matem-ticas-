import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import mascotFoxImg from '../assets/images/mascot_division_fox_1791392004408.jpg';
import bannerMathImg from '../assets/images/banner_math_adventure_1791392022574.jpg';
import { DivisionProblem, DetailedStep } from '../types/division';
import { calculateDivision, PRESET_PROBLEMS, ProblemPreset, generateRandomProblem } from '../utils/divisionEngine';
import { GalleyDivisionView } from './GalleyDivisionView';
import { MultiplicationTableHelper } from './MultiplicationTableHelper';
import { playPop, playStep, playSuccess, playGentleRetry, playFanfare } from '../utils/audio';
import { recordSolvedProblem, getActiveStudent, GAME_LEVELS } from '../utils/gamificationStore';
import { Badge, GameLevel, StudentProfile } from '../types/gamification';
import { BadgeModal } from './BadgeModal';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Layers,
  Presentation,
  UserCheck,
  Shuffle,
  Settings2,
  Lock,
  Trophy,
} from 'lucide-react';

interface StepByStepTutorialProps {
  initialProblem?: { dividend: number; divisor: number };
  onProblemChange?: (dividend: number, divisor: number) => void;
  onGoToLeaderboard?: () => void;
}

export const StepByStepTutorial: React.FC<StepByStepTutorialProps> = ({
  initialProblem = { dividend: 75, divisor: 3 },
  onGoToLeaderboard,
}) => {
  // Student profile state
  const [activeStudent, setActiveStudent] = useState<StudentProfile>(() => getActiveStudent());
  const [unlockedBadgeCelebration, setUnlockedBadgeCelebration] = useState<Badge | null>(null);
  const [unlockedLevelCelebration, setUnlockedLevelCelebration] = useState<GameLevel | null>(null);

  // Core problem state
  const [dividend, setDividend] = useState(initialProblem.dividend);
  const [divisor, setDivisor] = useState(initialProblem.divisor);
  const [problem, setProblem] = useState<DivisionProblem>(() =>
    calculateDivision(initialProblem.dividend, initialProblem.divisor)
  );

  // Subtraction presentation mode
  const [showExplicitSubtraction, setShowExplicitSubtraction] = useState(true);

  // Learning mode: 'interactive' (student answers) vs 'autoplay' (teacher projection)
  const [interactionMode, setInteractionMode] = useState<'interactive' | 'presentation'>('interactive');

  // Step index
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Autoplay controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1800); // ms per step

  // Interactive student feedback
  const [studentInput, setStudentInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'incorrect' | 'hint' | null;
    message: string;
  }>({ status: null, message: '' });

  // Multiplication table helper open
  const [isTableHelperOpen, setIsTableHelperOpen] = useState(false);

  // Custom problem modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDividend, setCustomDividend] = useState('75');
  const [customDivisor, setCustomDivisor] = useState('3');
  const [customError, setCustomError] = useState('');

  const currentStep: DetailedStep = problem.allSteps[Math.min(currentStepIndex, problem.allSteps.length - 1)];
  const isFinished = currentStepIndex >= problem.allSteps.length - 1;

  // Re-calculate problem when dividend or divisor changes
  const applyNewProblem = (newD: number, newd: number) => {
    try {
      const p = calculateDivision(newD, newd);
      setDividend(newD);
      setDivisor(newd);
      setProblem(p);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      setFeedback({ status: null, message: '' });
      setStudentInput('');
      playPop();
    } catch {
      // Ignore
    }
  };

  // Autoplay timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isFinished) {
      timer = setTimeout(() => {
        handleNextStep();
      }, playbackSpeed);
    } else if (isFinished && isPlaying) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, isFinished, playbackSpeed]);

  // Trigger celebration on finish & record gamification rewards
  const hasCelebratedRef = useRef(false);
  useEffect(() => {
    if (isFinished && !hasCelebratedRef.current) {
      hasCelebratedRef.current = true;
      playFanfare();
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 },
      });

      // Calculate achievements
      const hadZeroInQuotient = problem.cycles.some(c => c.isZeroToQuotient);
      const isExact = problem.isExact;
      const hasRemainder = problem.remainder > 0;

      const { updatedProfile, newBadges, leveledUp } = recordSolvedProblem({
        isExact,
        hasRemainder,
        hadZeroInQuotient,
        scoreEarned: 25,
      });

      setActiveStudent(updatedProfile);

      if (leveledUp) {
        const lvl = GAME_LEVELS.find(l => l.levelNumber === updatedProfile.currentLevel) || null;
        setUnlockedLevelCelebration(lvl);
      } else if (newBadges.length > 0) {
        setUnlockedBadgeCelebration(newBadges[0]);
      }
    } else if (!isFinished) {
      hasCelebratedRef.current = false;
    }
  }, [isFinished, problem]);

  // Handlers for progression
  const handleNextStep = () => {
    if (currentStepIndex < problem.allSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setFeedback({ status: null, message: '' });
      setStudentInput('');
      playStep();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setFeedback({ status: null, message: '' });
      setStudentInput('');
      setIsPlaying(false);
      playPop();
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setFeedback({ status: null, message: '' });
    setStudentInput('');
    playPop();
  };

  // Student answer verification
  const handleVerifyStudentAnswer = (answer: number) => {
    const expected = currentStep.targetExpectedValue;

    if (answer === expected) {
      playSuccess();
      setFeedback({
        status: 'correct',
        message: '¡Excelente! Respuesta correcta.',
      });
      setTimeout(() => {
        handleNextStep();
      }, 700);
    } else {
      playGentleRetry();
      let hint = '';
      if (currentStep.type === 'INITIAL_SELECTION') {
        const firstDigit = parseInt(dividend.toString()[0], 10);
        hint = firstDigit < divisor
          ? `¡Cuidado! La primera cifra es ${firstDigit}, que es menor que el divisor ${divisor}. Por eso debes coger 2 cifras.`
          : `¡Observa bien! La primera cifra es ${firstDigit}, que ya es mayor o igual que ${divisor}. Con 1 cifra es suficiente.`;
      } else if (currentStep.type === 'FIND_QUOTIENT') {
        hint = `Revisa la tabla del ${divisor}: buscamos el número que multiplicado por ${divisor} dé ${currentStep.currentWorkingNumber} o se acerque sin pasarse.`;
      } else if (currentStep.type === 'MULTIPLY_SUBTRACT') {
        hint = `Resta despacio: ${currentStep.currentWorkingNumber} menos ${currentStep.product}.`;
      } else if (currentStep.type === 'BRING_DOWN') {
        hint = `Mira el dividendo: la cifra que toca bajar es la que está justo a continuación.`;
      }

      setFeedback({
        status: 'incorrect',
        message: hint || 'Inténtalo de nuevo, ¡tú puedes!',
      });
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dVal = parseInt(customDividend.trim(), 10);
    const divVal = parseInt(customDivisor.trim(), 10);

    if (isNaN(dVal) || isNaN(divVal) || divVal <= 0 || dVal < 0) {
      setCustomError('Introduce números válidos (divisor mayor que 0).');
      return;
    }
    if (dVal > 999999) {
      setCustomError('Para una mejor visualización, usa un dividendo de hasta 6 cifras.');
      return;
    }
    if (divVal > 99) {
      setCustomError('El divisor debe ser de 1 o 2 cifras (máximo 99).');
      return;
    }
    setCustomError('');
    setShowCustomModal(false);
    applyNewProblem(dVal, divVal);
  };

  return (
    <div className="space-y-6">
      {/* Colorful Kid Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-md border-2 border-indigo-300 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-5 md:p-6 flex items-center justify-between">
        <div className="relative z-10 max-w-lg space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider text-amber-300">
            <span>⭐ ¡Aventura Matemática para 3º y 4º de Primaria!</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-sans tracking-tight text-white drop-shadow-xs">
            ¡Aprende a Dividir con la Galera Mágica! 🚀
          </h2>
          <p className="text-xs md:text-sm text-indigo-100 font-medium leading-relaxed">
            Sigue los pasos con Profe Zorrito: pon el arquito, busca en la tabla, resta y baja las cifras como un campeón.
          </p>
        </div>
        <div className="hidden sm:block relative z-10 shrink-0">
          <img
            src={bannerMathImg}
            alt="Mundo Mágico de los Números"
            className="w-40 h-24 object-cover rounded-2xl shadow-lg border-2 border-white/40 transform hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/40 via-purple-900/20 to-transparent pointer-events-none" />
      </div>

      {/* Top Banner / Student status & Mode Segmented Controller */}
      <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Active Player badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xl shrink-0 shadow-2xs">
            {activeStudent.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-800">{activeStudent.name}</span>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                Nivel {activeStudent.currentLevel}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {activeStudent.score} pts · {activeStudent.totalSolved} resueltas · {activeStudent.unlockedBadges.length} 🎖️
            </div>
          </div>
        </div>

        {/* Preset selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Niveles:
          </span>
          {PRESET_PROBLEMS.slice(0, 5).map((preset, pIdx) => {
            const isSelected = preset.dividend === dividend && preset.divisor === divisor;
            // Level lock logic: level 1 is open, level 2 needs 2 solves, level 3 needs 5, level 4 needs 8...
            const requiredSolves = pIdx * 2;
            const isLocked = activeStudent.totalSolved < requiredSolves && pIdx > 1;

            return (
              <button
                key={preset.id}
                type="button"
                disabled={isLocked}
                onClick={() => applyNewProblem(preset.dividend, preset.divisor)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isLocked
                    ? 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                    : 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-700'
                }`}
                title={isLocked ? `Desbloquea este nivel resolviendo ${requiredSolves} divisiones` : preset.name}
              >
                {isLocked && <Lock className="w-3 h-3" />}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onGoToLeaderboard && (
            <button
              type="button"
              onClick={onGoToLeaderboard}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Ver Salón de la Fama y medallas"
            >
              <Trophy className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ranking</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const rand = generateRandomProblem('medium');
              applyNewProblem(rand.dividend, rand.divisor);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Generar división al azar"
          >
            <Shuffle className="w-3.5 h-3.5 text-slate-500" />
            <span>Aleatoria</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCustomDividend(dividend.toString());
              setCustomDivisor(divisor.toString());
              setShowCustomModal(true);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Escribir números personalizados"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Personalizar</span>
          </button>
        </div>
      </div>

      {/* Main Two-Zone Learning Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Stage: The Galley View (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <GalleyDivisionView
            problem={problem}
            currentStepIndex={currentStepIndex}
            showExplicitSubtraction={showExplicitSubtraction}
            onToggleSubtraction={() => setShowExplicitSubtraction(prev => !prev)}
          />

          {/* Table helper collapsible */}
          <MultiplicationTableHelper
            divisor={divisor}
            targetNumber={currentStep?.currentWorkingNumber}
            isOpen={isTableHelperOpen}
            onToggle={() => setIsTableHelperOpen(prev => !prev)}
            onSelectMultiple={
              interactionMode === 'interactive' && currentStep?.type === 'FIND_QUOTIENT'
                ? factor => handleVerifyStudentAnswer(factor)
                : undefined
            }
          />
        </div>

        {/* Right / Control Deck: The Pedagogical Guide & Interactive Step (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Presentation vs Student Mode Switcher */}
          <div className="bg-slate-200/70 p-1 rounded-xl flex items-center">
            <button
              type="button"
              onClick={() => {
                setInteractionMode('interactive');
                setIsPlaying(false);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                interactionMode === 'interactive'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Modo Alumno (Interactivo)</span>
            </button>

            <button
              type="button"
              onClick={() => setInteractionMode('presentation')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                interactionMode === 'presentation'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Presentation className="w-4 h-4 text-indigo-600" />
              <span>Modo Profe (Pizarra)</span>
            </button>
          </div>

          {/* Current Step Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            {/* Step Progress Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  {currentStepIndex + 1}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  de {problem.allSteps.length} pasos
                </span>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                {currentStep.title}
              </span>
            </div>

            {/* Teacher's Voice / Step Explanation with Zorrito Mascot */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50/40 to-yellow-50 border-2 border-amber-300 rounded-2xl p-4 text-slate-800 shadow-xs relative overflow-hidden">
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={mascotFoxImg}
                    alt="Zorrito Matemático"
                    className="w-13 h-13 rounded-2xl object-cover shadow-sm border-2 border-amber-300 ring-2 ring-amber-100"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-1 -right-1 text-xs">🎓</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-900 uppercase tracking-wider">
                      Profe Zorrito dice:
                    </span>
                    <span className="text-[10px] bg-amber-200/90 text-amber-950 font-bold px-1.5 py-0.2 rounded-full">
                      ¡Tú puedes! 🦊
                    </span>
                  </div>
                  <p className="text-xs md:text-sm font-semibold leading-relaxed text-slate-700 bg-white/70 p-2.5 rounded-xl border border-amber-200/60 shadow-2xs">
                    {currentStep.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Question Zone (Only in 'interactive' mode and before finish) */}
            {interactionMode === 'interactive' && !isFinished && (
              <div className="pt-2 border-t-2 border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Tu turno: {currentStep.question}</span>
                  </h4>
                </div>

                {/* Question Type 1: INITIAL SELECTION */}
                {currentStep.type === 'INITIAL_SELECTION' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleVerifyStudentAnswer(1)}
                      className="py-3.5 px-4 rounded-2xl border-2 border-indigo-200 hover:border-indigo-500 bg-gradient-to-b from-indigo-50 to-white font-extrabold text-indigo-950 text-sm transition-all shadow-xs hover:scale-102 active:scale-95 cursor-pointer text-center"
                    >
                      <div className="text-lg">☝️ 1 Cifra</div>
                      <div className="text-xs font-mono text-indigo-600">({dividend.toString()[0]})</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyStudentAnswer(2)}
                      className="py-3.5 px-4 rounded-2xl border-2 border-indigo-200 hover:border-indigo-500 bg-gradient-to-b from-indigo-50 to-white font-extrabold text-indigo-950 text-sm transition-all shadow-xs hover:scale-102 active:scale-95 cursor-pointer text-center"
                    >
                      <div className="text-lg">✌️ 2 Cifras</div>
                      <div className="text-xs font-mono text-indigo-600">({dividend.toString().slice(0, 2)})</div>
                    </button>
                  </div>
                )}

                {/* Question Type 2: FIND QUOTIENT */}
                {currentStep.type === 'FIND_QUOTIENT' && (
                  <div className="space-y-2 pt-1">
                    <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
                      <span>Pulsa el número del cociente:</span>
                      <span className="text-[11px] text-amber-600 font-bold">¡Usa la chuleta si dudas!</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleVerifyStudentAnswer(num)}
                          className="h-12 rounded-xl border-2 border-slate-200 hover:border-emerald-500 bg-gradient-to-b from-white to-slate-50 hover:bg-emerald-50 font-mono font-black text-xl text-slate-800 transition-all shadow-xs active:scale-90 hover:scale-105 cursor-pointer hover:text-emerald-900"
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question Type 3: MULTIPLY & SUBTRACT */}
                {currentStep.type === 'MULTIPLY_SUBTRACT' && (
                  <div className="space-y-2 pt-1">
                    <div className="text-xs text-slate-700 font-mono font-bold bg-slate-100 p-2 rounded-xl text-center">
                      ¿Cuánto es <span className="text-indigo-700">{currentStep.currentWorkingNumber}</span> menos <span className="text-rose-600">{currentStep.product}</span>?
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={studentInput}
                        onChange={e => setStudentInput(e.target.value)}
                        placeholder="Resto..."
                        className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 font-mono font-black text-xl text-center"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && studentInput.trim()) {
                            handleVerifyStudentAnswer(parseInt(studentInput.trim(), 10));
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (studentInput.trim()) {
                            handleVerifyStudentAnswer(parseInt(studentInput.trim(), 10));
                          }
                        }}
                        className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-transform active:scale-95 cursor-pointer shadow-sm"
                      >
                        Comprobar ✨
                      </button>
                    </div>
                  </div>
                )}

                {/* Question Type 4: BRING DOWN */}
                {currentStep.type === 'BRING_DOWN' && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleVerifyStudentAnswer(currentStep.targetExpectedValue)}
                      className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 hover:shadow-lg animate-wiggle"
                    >
                      <span>⬇️ ¡Bajar el {currentStep.targetExpectedValue} al resto! 🚀</span>
                    </button>
                  </div>
                )}

                {/* Instant Feedback Message */}
                {feedback.status && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
                      feedback.status === 'correct'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {feedback.status === 'correct' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{feedback.message}</span>
                  </div>
                )}
              </div>
            )}

            {/* Finished Celebration Card */}
            {isFinished && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-950 space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm">¡División terminada con éxito!</h4>
                <p className="text-xs text-emerald-800">
                  Has completado todos los pasos. El cociente final es <strong>{problem.quotient}</strong> y el resto es <strong>{problem.remainder}</strong>.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Repetir esta división
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = generateRandomProblem('easy');
                      applyNewProblem(rand.dividend, rand.divisor);
                    }}
                    className="px-4 py-2 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Siguiente reto
                  </button>
                </div>
              </div>
            )}

            {/* Teacher / Navigation Controls */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                ◀ Paso Anterior
              </button>

              {interactionMode === 'presentation' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(prev => !prev)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                    title={isPlaying ? 'Pausar' : 'Reproducir automáticamente'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <select
                    value={playbackSpeed}
                    onChange={e => setPlaybackSpeed(Number(e.target.value))}
                    className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-700 cursor-pointer"
                    title="Velocidad de reproducción"
                  >
                    <option value={2800}>Despacio</option>
                    <option value={1800}>Normal</option>
                    <option value={1000}>Rápido</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
                  title="Reiniciar al paso 1"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isFinished}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Paso Siguiente</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Custom Problem */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Escribir División Personalizada
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Introduce cualquier dividendo y divisor para que el simulador lo resuelva paso a paso con el método de galera.
            </p>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dividendo (D)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="999999"
                    required
                    value={customDividend}
                    onChange={e => setCustomDividend(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-lg text-slate-800"
                    placeholder="Ej. 846"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Divisor (d)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={customDivisor}
                    onChange={e => setCustomDivisor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-lg text-amber-800"
                    placeholder="Ej. 6"
                  />
                </div>
              </div>

              {customError && (
                <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {customError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Resolver esta división
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Badge / Level-Up Celebration Modal */}
      <BadgeModal
        badge={unlockedBadgeCelebration}
        level={unlockedLevelCelebration}
        onClose={() => {
          setUnlockedBadgeCelebration(null);
          setUnlockedLevelCelebration(null);
        }}
      />
    </div>
  );
};
