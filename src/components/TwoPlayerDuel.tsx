import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import mascotFoxImg from '../assets/images/mascot_division_fox_1791392004408.jpg';
import { playPop, playStep, playSuccess, playGentleRetry, playFanfare } from '../utils/audio';
import { recordDuelWin } from '../utils/gamificationStore';
import { Badge } from '../types/gamification';
import { Swords, Trophy, RotateCcw, Zap, CheckCircle2, XCircle } from 'lucide-react';

interface DuelQuestion {
  id: number;
  dividend: number;
  divisor: number;
  questionText: string;
  phase: 'arch' | 'quotient' | 'remainder';
  correctValue: number;
  options: number[];
  hint: string;
}

export const TwoPlayerDuel: React.FC<{ onBadgeUnlocked?: (b: Badge) => void }> = ({ onBadgeUnlocked }) => {
  // Players configuration
  const [p1Name, setP1Name] = useState('Jugador 1');
  const [p2Name, setP2Name] = useState('Jugador 2');
  const [roundsCount, setRoundsCount] = useState(5);

  // Match state
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'round-result' | 'finished'>('lobby');
  const [roundWinner, setRoundWinner] = useState<'p1' | 'p2' | 'tie' | null>(null);

  // Active question set
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);

  // Cooldown / disable per round
  const [p1Answered, setP1Answered] = useState<number | null>(null);
  const [p2Answered, setP2Answered] = useState<number | null>(null);

  // Generate dynamic questions for duel
  const generateDuelQuestions = (count: number): DuelQuestion[] => {
    const list: DuelQuestion[] = [];
    for (let i = 0; i < count; i++) {
      // Rotate between arch questions, quotient lookup, and remainder calculation
      const type = i % 3 === 0 ? 'arch' : i % 3 === 1 ? 'quotient' : 'remainder';

      if (type === 'arch') {
        const div = Math.floor(Math.random() * 5) + 3; // 3..7
        const firstDigit = Math.random() > 0.5 ? Math.floor(Math.random() * (div - 1)) + 1 : div + Math.floor(Math.random() * 2);
        const dividend = firstDigit * 100 + Math.floor(Math.random() * 80) + 10;
        const correct = firstDigit < div ? 2 : 1;
        list.push({
          id: i + 1,
          dividend,
          divisor: div,
          questionText: `¿Cuántas cifras tomas con el arquito para ${dividend} ÷ ${div}?`,
          phase: 'arch',
          correctValue: correct,
          options: [1, 2],
          hint: firstDigit < div ? `Como ${firstDigit} < ${div}, tomas 2 cifras` : `Como ${firstDigit} ≥ ${div}, tomas 1 cifra`,
        });
      } else if (type === 'quotient') {
        const div = Math.floor(Math.random() * 6) + 3; // 3..8
        const q = Math.floor(Math.random() * 7) + 2; // 2..8
        const target = div * q + (Math.floor(Math.random() * (div - 1)));
        const options = Array.from(new Set([q, q - 1, q + 1, q + 2].filter(x => x >= 0))).slice(0, 4);
        list.push({
          id: i + 1,
          dividend: target,
          divisor: div,
          questionText: `¿Qué número va al cociente para ${target} ÷ ${div}?`,
          phase: 'quotient',
          correctValue: q,
          options: options.sort((a, b) => a - b),
          hint: `${div} × ${q} = ${div * q}`,
        });
      } else {
        const div = Math.floor(Math.random() * 5) + 3; // 3..7
        const q = Math.floor(Math.random() * 6) + 2;
        const rem = Math.floor(Math.random() * (div - 1)) + 1;
        const dividend = div * q + rem;
        const options = Array.from(new Set([rem, rem + 1, Math.max(0, rem - 1), rem + 2])).slice(0, 4);
        list.push({
          id: i + 1,
          dividend,
          divisor: div,
          questionText: `¿Cuánto sobra (resto) en ${dividend} ÷ ${div}?`,
          phase: 'remainder',
          correctValue: rem,
          options: options.sort((a, b) => a - b),
          hint: `${div} × ${q} = ${div * q}; sobran ${rem}`,
        });
      }
    }
    return list;
  };

  const handleStartDuel = () => {
    const qList = generateDuelQuestions(roundsCount);
    setQuestions(qList);
    setCurrentRoundIdx(0);
    setP1Score(0);
    setP2Score(0);
    setP1Answered(null);
    setP2Answered(null);
    setRoundWinner(null);
    setGameState('playing');
    playPop();
  };

  const currentQ = questions[currentRoundIdx];

  // Evaluate answer when a player clicks
  const handlePlayerAnswer = (player: 'p1' | 'p2', val: number) => {
    if (gameState !== 'playing' || !currentQ) return;

    if (player === 'p1' && p1Answered === null) {
      setP1Answered(val);
      if (val === currentQ.correctValue) {
        // Player 1 got it right first!
        playSuccess();
        setP1Score(s => s + 20);
        setRoundWinner('p1');
        setGameState('round-result');
      } else {
        playGentleRetry();
      }
    } else if (player === 'p2' && p2Answered === null) {
      setP2Answered(val);
      if (val === currentQ.correctValue) {
        // Player 2 got it right first!
        playSuccess();
        setP2Score(s => s + 20);
        setRoundWinner('p2');
        setGameState('round-result');
      } else {
        playGentleRetry();
      }
    }
  };

  // Next round transition
  const handleNextRound = () => {
    if (currentRoundIdx + 1 < questions.length) {
      setCurrentRoundIdx(r => r + 1);
      setP1Answered(null);
      setP2Answered(null);
      setRoundWinner(null);
      setGameState('playing');
      playStep();
    } else {
      // Match finished!
      setGameState('finished');
      playFanfare();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      const badge = recordDuelWin();
      if (badge && onBadgeUnlocked) {
        onBadgeUnlocked(badge);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Swords className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Duelo Matemático: Competición 1 vs 1 a Pantalla Dividida
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Dos alumnos compiten en tiempo real en la misma pantalla o pizarra digital por resolver antes los pasos de la división.
          </p>
        </div>

        {gameState !== 'lobby' && (
          <button
            type="button"
            onClick={() => setGameState('lobby')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Volver a configurar</span>
          </button>
        )}
      </div>

      {/* LOBBY SETUP */}
      {gameState === 'lobby' && (
        <div className="bg-white rounded-3xl border-2 border-indigo-200 shadow-md p-6 md:p-8 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="relative inline-block mx-auto">
              <img
                src={mascotFoxImg}
                alt="Profe Zorrito Árbitro"
                className="w-20 h-20 rounded-3xl object-cover border-4 border-amber-300 shadow-md mx-auto"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-2 -right-1 text-2xl">📢</span>
            </div>
            <h4 className="text-xl font-black text-slate-900 font-sans">
              ¡Duelo de Matemáticos: Cara a Cara!
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Profe Zorrito arbitra la partida: cada alumno compite por pulsar la respuesta correcta antes que su rival.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2">
              <span className="text-xs font-bold text-indigo-900 block">
                🔵 Jugador 1 (Lado Izquierdo)
              </span>
              <input
                type="text"
                value={p1Name}
                onChange={e => setP1Name(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-indigo-300 font-semibold text-sm text-indigo-950"
                placeholder="Nombre jugador 1"
              />
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
              <span className="text-xs font-bold text-amber-900 block">
                🟠 Jugador 2 (Lado Derecho)
              </span>
              <input
                type="text"
                value={p2Name}
                onChange={e => setP2Name(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-amber-300 font-semibold text-sm text-amber-950"
                placeholder="Nombre jugador 2"
              />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <label className="text-xs font-bold text-slate-700 block">
              Número de Rondas:
            </label>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
              {[3, 5, 7].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoundsCount(r)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    roundsCount === r
                      ? 'bg-white shadow-xs text-indigo-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r} Rondas
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartDuel}
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>¡Comenzar el Duelo!</span>
          </button>
        </div>
      )}

      {/* ACTIVE DUEL SCREEN */}
      {(gameState === 'playing' || gameState === 'round-result') && currentQ && (
        <div className="space-y-4">
          {/* Central Live Scoreboard */}
          <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-md flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
              <span className="font-bold text-sm text-indigo-200">{p1Name}</span>
              <span className="font-mono text-2xl font-extrabold text-white ml-2">
                {p1Score}
              </span>
            </div>

            <div className="text-center font-mono text-xs uppercase tracking-wider text-slate-400">
              Ronda {currentRoundIdx + 1} de {questions.length}
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-extrabold text-white mr-2">
                {p2Score}
              </span>
              <span className="font-bold text-sm text-amber-200">{p2Name}</span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            </div>
          </div>

          {/* Central Question Display */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Desafío de Velocidad y Precisión
            </span>
            <h4 className="text-base font-bold text-slate-900">
              {currentQ.questionText}
            </h4>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-100 font-mono text-xl font-extrabold text-slate-800">
              <span>{currentQ.dividend}</span>
              <span>÷</span>
              <span>{currentQ.divisor}</span>
            </div>
          </div>

          {/* SPLIT SCREEN SIDES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PLAYER 1 CONTROLLER (AZUL) */}
            <div className="bg-indigo-50/60 rounded-2xl border-2 border-indigo-200 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-200/80">
                <span className="font-bold text-sm text-indigo-950 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  {p1Name}
                </span>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                  {p1Score} pts
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {currentQ.options.map(opt => {
                  const isSelected = p1Answered === opt;
                  const isCorrect = isSelected && opt === currentQ.correctValue;
                  const isWrong = isSelected && opt !== currentQ.correctValue;

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={p1Answered !== null || gameState === 'round-result'}
                      onClick={() => handlePlayerAnswer('p1', opt)}
                      className={`h-16 rounded-xl border-2 text-2xl font-mono font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer active:scale-95 ${
                        isCorrect
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : isWrong
                          ? 'bg-rose-500 border-rose-600 text-white opacity-60'
                          : 'bg-white border-indigo-200 hover:border-indigo-500 text-indigo-950'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {p1Answered !== null && p1Answered !== currentQ.correctValue && (
                <div className="text-xs text-rose-700 font-semibold text-center flex items-center justify-center gap-1">
                  <XCircle className="w-4 h-4" /> ¡Fallaste! Dale paso a tu rival
                </div>
              )}
            </div>

            {/* PLAYER 2 CONTROLLER (NARANJA) */}
            <div className="bg-amber-50/60 rounded-2xl border-2 border-amber-200 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/80">
                <span className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                  {p2Name}
                </span>
                <span className="text-xs font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                  {p2Score} pts
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {currentQ.options.map(opt => {
                  const isSelected = p2Answered === opt;
                  const isCorrect = isSelected && opt === currentQ.correctValue;
                  const isWrong = isSelected && opt !== currentQ.correctValue;

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={p2Answered !== null || gameState === 'round-result'}
                      onClick={() => handlePlayerAnswer('p2', opt)}
                      className={`h-16 rounded-xl border-2 text-2xl font-mono font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer active:scale-95 ${
                        isCorrect
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : isWrong
                          ? 'bg-rose-500 border-rose-600 text-white opacity-60'
                          : 'bg-white border-amber-200 hover:border-amber-500 text-amber-950'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {p2Answered !== null && p2Answered !== currentQ.correctValue && (
                <div className="text-xs text-rose-700 font-semibold text-center flex items-center justify-center gap-1">
                  <XCircle className="w-4 h-4" /> ¡Fallaste! Dale paso a tu rival
                </div>
              )}
            </div>
          </div>

          {/* ROUND RESULT BAR */}
          {gameState === 'round-result' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center space-y-3 animate-in fade-in">
              <div className="text-sm font-bold text-slate-800 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>
                  ¡Punto para {roundWinner === 'p1' ? p1Name : p2Name}! ({currentQ.hint})
                </span>
              </div>
              <button
                type="button"
                onClick={handleNextRound}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                {currentRoundIdx + 1 < questions.length ? 'Siguiente Ronda ▶' : 'Ver Ganador Final 🏆'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* FINISHED PODIUM SCREEN */}
      {gameState === 'finished' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-lg mx-auto text-center space-y-5 animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 mx-auto flex items-center justify-center text-4xl shadow-inner border border-amber-200">
            🏆
          </div>

          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
              Fin del Duelo
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {p1Score > p2Score
                ? `¡Victoria para ${p1Name}!`
                : p2Score > p1Score
                ? `¡Victoria para ${p2Name}!`
                : '¡Empate Legendario!'}
            </h3>
          </div>

          <div className="flex justify-center gap-6 py-3 font-mono text-xl font-extrabold">
            <div className="text-indigo-700">
              <div className="text-xs font-sans text-slate-400 font-normal">{p1Name}</div>
              <div>{p1Score} pts</div>
            </div>
            <div className="text-slate-300">vs</div>
            <div className="text-amber-700">
              <div className="text-xs font-sans text-slate-400 font-normal">{p2Name}</div>
              <div>{p2Score} pts</div>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            ¡Ambos alumnos han demostrado una gran destreza calculando cocientes y restos! Se ha sumado progreso para la insignia &quot;Gladiador del Duelo&quot;.
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleStartDuel}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Revancha Inmediata ⚔️
            </button>
            <button
              type="button"
              onClick={() => setGameState('lobby')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cambiar Jugadores
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
