import React, { useState } from 'react';
import { playPop, playSuccess, playGentleRetry, playFanfare } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Star,
  Award,
  ArrowRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';

type MissionType = 'arch-detective' | 'quotient-duel' | 'zero-quotient' | 'full-challenge';

interface ArchQuestion {
  dividend: number;
  divisor: number;
  correctAnswer: 1 | 2;
  explanation: string;
}

interface DuelQuestion {
  portion: number;
  divisor: number;
  options: number[];
  correctAnswer: number;
  explanation: string;
}

interface ZeroQuotientQuestion {
  scenario: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const GameMissions: React.FC = () => {
  const [activeMission, setActiveMission] = useState<MissionType>('arch-detective');
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);

  // Mission 1: Arch Detective questions
  const [archIndex, setArchIndex] = useState(0);
  const archQuestions: ArchQuestion[] = [
    {
      dividend: 742,
      divisor: 3,
      correctAnswer: 1,
      explanation: '¡Exacto! Como 7 es mayor que 3 (7 ≥ 3), cogemos 1 sola cifra: el 7.',
    },
    {
      dividend: 285,
      divisor: 4,
      correctAnswer: 2,
      explanation: '¡Muy bien! Como 2 es menor que 4 (2 < 4), necesitamos coger 2 cifras: el 28.',
    },
    {
      dividend: 512,
      divisor: 5,
      correctAnswer: 1,
      explanation: '¡Genial! Como 5 es igual a 5 (5 ≥ 5), cogemos 1 cifra: el 5.',
    },
    {
      dividend: 198,
      divisor: 6,
      correctAnswer: 2,
      explanation: '¡Correcto! Como 1 es menor que 6, cogemos 2 cifras: el 19.',
    },
    {
      dividend: 904,
      divisor: 8,
      correctAnswer: 1,
      explanation: '¡Perfecto! Como 9 es mayor que 8, cogemos 1 cifra: el 9.',
    },
  ];

  // Mission 2: Quotient Duel questions
  const [duelIndex, setDuelIndex] = useState(0);
  const duelQuestions: DuelQuestion[] = [
    {
      portion: 27,
      divisor: 4,
      options: [5, 6, 7, 8],
      correctAnswer: 6,
      explanation: '4 × 6 = 24 (se acerca sin pasarse). 4 × 7 = 28 (se pasaría).',
    },
    {
      portion: 38,
      divisor: 5,
      options: [6, 7, 8, 9],
      correctAnswer: 7,
      explanation: '5 × 7 = 35. Con 8 daría 40 (se pasa).',
    },
    {
      portion: 53,
      divisor: 8,
      options: [5, 6, 7, 8],
      correctAnswer: 6,
      explanation: '8 × 6 = 48. Con 7 daría 56 (se pasa).',
    },
    {
      portion: 65,
      divisor: 7,
      options: [8, 9, 7, 6],
      correctAnswer: 9,
      explanation: '7 × 9 = 63. ¡Queda muy cerca y no se pasa!',
    },
    {
      portion: 19,
      divisor: 3,
      options: [5, 6, 7, 8],
      correctAnswer: 6,
      explanation: '3 × 6 = 18. 3 × 7 = 21 (se pasa).',
    },
  ];

  // Mission 3: Zero in Quotient questions
  const [zeroIndex, setZeroIndex] = useState(0);
  const zeroQuestions: ZeroQuotientQuestion[] = [
    {
      scenario: 'Estamos dividiendo 816 ÷ 4. Ya hemos dividido el 8 (8 ÷ 4 = 2, resto 0). Ahora bajamos el 1. Tenemos 1 entre 4.',
      question: '¿Qué debemos hacer ahora?',
      options: [
        'Poner un 0 en el cociente y bajar la siguiente cifra (el 6)',
        'Parar la división porque ya no se puede seguir',
        'Inventar una coma decimal inmediatamente',
        'Restar 4 - 1',
      ],
      correctIndex: 0,
      explanation: '¡Regla de oro! Como 1 es menor que 4 (no cabe), ponemos 0 al cociente y bajamos la cifra siguiente.',
    },
    {
      scenario: 'En 624 ÷ 6: dividimos 6 ÷ 6 = 1, resto 0. Bajamos el 2.',
      question: 'Como 2 es menor que 6, ¿cuál es la cifra que añadimos al cociente?',
      options: ['El número 0', 'El número 1', 'El número 2', 'El número 6'],
      correctIndex: 0,
      explanation: '¡Cero al cociente! El cociente llevará un 0 antes de bajar el 4 para formar el 24.',
    },
    {
      scenario: 'Al bajar una cifra del dividendo, el número formado es MENOR que el divisor.',
      question: '¿Cuál es el lema matemático para recordar este paso?',
      options: [
        '¡Cero al cociente y bajo la cifra siguiente!',
        'Sumar el divisor al dividendo',
        'Multiplicar por 10 y borrar el número',
        'Cambiar el divisor por otro más pequeño',
      ],
      correctIndex: 0,
      explanation: '¡Esa es la famosa frase que no se te olvidará nunca en clase!',
    },
  ];

  // Feedback state
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'wrong' | null;
    text: string;
  }>({ status: null, text: '' });

  const handleArchAnswer = (chosen: 1 | 2) => {
    const q = archQuestions[archIndex];
    if (chosen === q.correctAnswer) {
      playSuccess();
      setScore(s => s + 20);
      setStreak(st => st + 1);
      setFeedback({ status: 'correct', text: q.explanation });
      if (archIndex === archQuestions.length - 1) {
        setStars(st => st + 1);
        playFanfare();
        confetti({ particleCount: 70, spread: 60 });
      }
    } else {
      playGentleRetry();
      setStreak(0);
      setFeedback({
        status: 'wrong',
        text: `¡Casi! ${q.explanation}`,
      });
    }
  };

  const handleDuelAnswer = (chosen: number) => {
    const q = duelQuestions[duelIndex];
    if (chosen === q.correctAnswer) {
      playSuccess();
      setScore(s => s + 25);
      setStreak(st => st + 1);
      setFeedback({ status: 'correct', text: `¡Perfecto! ${q.explanation}` });
      if (duelIndex === duelQuestions.length - 1) {
        setStars(st => st + 1);
        playFanfare();
        confetti({ particleCount: 70, spread: 60 });
      }
    } else {
      playGentleRetry();
      setStreak(0);
      setFeedback({
        status: 'wrong',
        text: `Fíjate bien: ${q.explanation}`,
      });
    }
  };

  const handleZeroAnswer = (idx: number) => {
    const q = zeroQuestions[zeroIndex];
    if (idx === q.correctIndex) {
      playSuccess();
      setScore(s => s + 30);
      setStreak(st => st + 1);
      setFeedback({ status: 'correct', text: `¡Brillante! ${q.explanation}` });
      if (zeroIndex === zeroQuestions.length - 1) {
        setStars(st => st + 1);
        playFanfare();
        confetti({ particleCount: 70, spread: 60 });
      }
    } else {
      playGentleRetry();
      setStreak(0);
      setFeedback({
        status: 'wrong',
        text: `Recuerda: ${q.explanation}`,
      });
    }
  };

  const nextArch = () => {
    if (archIndex < archQuestions.length - 1) {
      setArchIndex(i => i + 1);
      setFeedback({ status: null, text: '' });
      playPop();
    }
  };

  const nextDuel = () => {
    if (duelIndex < duelQuestions.length - 1) {
      setDuelIndex(i => i + 1);
      setFeedback({ status: null, text: '' });
      playPop();
    }
  };

  const nextZero = () => {
    if (zeroIndex < zeroQuestions.length - 1) {
      setZeroIndex(i => i + 1);
      setFeedback({ status: null, text: '' });
      playPop();
    }
  };

  const resetAllMissions = () => {
    setArchIndex(0);
    setDuelIndex(0);
    setZeroIndex(0);
    setScore(0);
    setStreak(0);
    setFeedback({ status: null, text: '' });
    playPop();
  };

  return (
    <div className="space-y-6">
      {/* Gamified Header / Stats Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            La Misión de la División: Desafíos por Niveles
          </h3>
          <p className="text-xs text-slate-500">
            Supera los 3 entrenamientos clave para convertirte en Maestro de la Galera.
          </p>
        </div>

        {/* Badges and Stars */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{stars} Estrellas</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold font-mono">
            <Trophy className="w-4 h-4 text-indigo-600" />
            <span>{score} Puntos</span>
          </div>

          {streak > 1 && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Racha x{streak}!</span>
            </div>
          )}
        </div>
      </div>

      {/* Mission Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-200/70 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setActiveMission('arch-detective');
            setFeedback({ status: null, text: '' });
            playPop();
          }}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
            activeMission === 'arch-detective'
              ? 'bg-white text-indigo-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. Detective del Arquito
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMission('quotient-duel');
            setFeedback({ status: null, text: '' });
            playPop();
          }}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
            activeMission === 'quotient-duel'
              ? 'bg-white text-indigo-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. Duelo de Tablas
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMission('zero-quotient');
            setFeedback({ status: null, text: '' });
            playPop();
          }}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
            activeMission === 'zero-quotient'
              ? 'bg-white text-indigo-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3. Cero al Cociente
        </button>
      </div>

      {/* Mission 1 Content: ARCH DETECTIVE */}
      {activeMission === 'arch-detective' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Misión 1: Ronda {archIndex + 1} de {archQuestions.length}
            </span>
            <span className="text-xs text-slate-500">
              Objetivo: Saber cuántas cifras coger para empezar la división
            </span>
          </div>

          <div className="text-center py-4 space-y-4">
            <p className="text-sm font-semibold text-slate-700">
              ¿Cuántas cifras del dividendo debes tomar para empezar esta división?
            </p>

            {/* Division Card */}
            <div className="inline-flex items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-slate-200 font-mono text-4xl md:text-5xl font-bold tracking-widest text-slate-800 shadow-inner">
              <span className="text-indigo-900 pr-3">
                {archQuestions[archIndex].dividend}
              </span>
              <span className="border-l-3 border-slate-800 pl-3 text-amber-700">
                {archQuestions[archIndex].divisor}
              </span>
            </div>

            <div className="text-xs text-slate-500 max-w-sm mx-auto">
              Compara la primera cifra del dividendo (<strong className="text-indigo-900">{archQuestions[archIndex].dividend.toString()[0]}</strong>) con el divisor (<strong className="text-amber-800">{archQuestions[archIndex].divisor}</strong>).
            </div>

            {/* Answer buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => handleArchAnswer(1)}
                className="flex-1 py-3.5 px-4 rounded-xl border-2 border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 font-bold text-sm text-slate-800 transition-all shadow-xs cursor-pointer"
              >
                1 Cifra: <span className="text-indigo-600 font-mono text-base font-bold">({archQuestions[archIndex].dividend.toString()[0]})</span>
              </button>

              <button
                type="button"
                onClick={() => handleArchAnswer(2)}
                className="flex-1 py-3.5 px-4 rounded-xl border-2 border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 font-bold text-sm text-slate-800 transition-all shadow-xs cursor-pointer"
              >
                2 Cifras: <span className="text-indigo-600 font-mono text-base font-bold">({archQuestions[archIndex].dividend.toString().slice(0, 2)})</span>
              </button>
            </div>

            {/* Feedback & Next */}
            {feedback.status && (
              <div className="pt-4 max-w-md mx-auto space-y-3">
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${
                    feedback.status === 'correct'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {feedback.status === 'correct' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>

                {archIndex < archQuestions.length - 1 && feedback.status === 'correct' && (
                  <button
                    type="button"
                    onClick={nextArch}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <span>Siguiente Ronda</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mission 2 Content: QUOTIENT DUEL */}
      {activeMission === 'quotient-duel' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Misión 2: Ronda {duelIndex + 1} de {duelQuestions.length}
            </span>
            <span className="text-xs text-slate-500">
              Objetivo: Encontrar el factor que se acerca más sin pasarse
            </span>
          </div>

          <div className="text-center py-4 space-y-4">
            <p className="text-sm font-semibold text-slate-700">
              Queremos repartir <strong className="text-indigo-700 text-base">{duelQuestions[duelIndex].portion}</strong> entre <strong className="text-amber-700 text-base">{duelQuestions[duelIndex].divisor}</strong>. ¿Qué número ponemos en el cociente?
            </p>

            <div className="text-xs text-slate-500">
              Busca en la tabla del {duelQuestions[duelIndex].divisor}: ¿cuál se acerca a {duelQuestions[duelIndex].portion} sin pasarse?
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto pt-2">
              {duelQuestions[duelIndex].options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleDuelAnswer(opt)}
                  className="py-4 px-3 rounded-xl border-2 border-slate-200 hover:border-amber-500 bg-white hover:bg-amber-50/40 text-center font-mono font-bold text-2xl text-slate-800 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <div>{opt}</div>
                  <div className="text-[11px] font-sans font-normal text-slate-400 mt-1">
                    {duelQuestions[duelIndex].divisor} × {opt} = {duelQuestions[duelIndex].divisor * opt}
                  </div>
                </button>
              ))}
            </div>

            {/* Feedback & Next */}
            {feedback.status && (
              <div className="pt-4 max-w-md mx-auto space-y-3">
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${
                    feedback.status === 'correct'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {feedback.status === 'correct' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>

                {duelIndex < duelQuestions.length - 1 && feedback.status === 'correct' && (
                  <button
                    type="button"
                    onClick={nextDuel}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <span>Siguiente Ronda</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mission 3 Content: ZERO IN QUOTIENT */}
      {activeMission === 'zero-quotient' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
              Misión 3: Ronda {zeroIndex + 1} de {zeroQuestions.length}
            </span>
            <span className="text-xs text-slate-500">
              Objetivo: Dominar el caso especial de &quot;Cero al Cociente&quot;
            </span>
          </div>

          <div className="py-2 space-y-4 max-w-xl mx-auto">
            <div className="p-4 bg-violet-50/70 border border-violet-200 rounded-xl text-slate-800 text-sm">
              <span className="font-bold text-violet-900 block mb-1">Situación:</span>
              <p className="leading-relaxed">{zeroQuestions[zeroIndex].scenario}</p>
            </div>

            <p className="font-bold text-sm text-slate-900 pt-2">
              {zeroQuestions[zeroIndex].question}
            </p>

            <div className="space-y-2 pt-1">
              {zeroQuestions[zeroIndex].options.map((optText, optIdx) => (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleZeroAnswer(optIdx)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-violet-400 bg-white hover:bg-violet-50/40 text-left font-medium text-xs text-slate-800 transition-all shadow-xs flex items-center gap-3 cursor-pointer"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-600 text-xs flex items-center justify-center shrink-0">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{optText}</span>
                </button>
              ))}
            </div>

            {/* Feedback & Next */}
            {feedback.status && (
              <div className="pt-4 space-y-3">
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${
                    feedback.status === 'correct'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {feedback.status === 'correct' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>

                {zeroIndex < zeroQuestions.length - 1 && feedback.status === 'correct' && (
                  <button
                    type="button"
                    onClick={nextZero}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <span>Siguiente Ronda</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Reset Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={resetAllMissions}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar progreso de las misiones</span>
        </button>
      </div>
    </div>
  );
};
