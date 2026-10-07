import React from 'react';
import { DivisionProblem } from '../types/division';
import { CheckCircle2, ArrowDown } from 'lucide-react';

interface GalleyDivisionViewProps {
  problem: DivisionProblem;
  currentStepIndex: number;
  showExplicitSubtraction: boolean;
  onToggleSubtraction?: () => void;
  interactiveActiveTarget?: {
    type: 'QUOTIENT' | 'REMAINDER' | 'BRING_DOWN';
    cycleIndex: number;
  };
}

export const GalleyDivisionView: React.FC<GalleyDivisionViewProps> = ({
  problem,
  currentStepIndex,
  showExplicitSubtraction,
  onToggleSubtraction,
}) => {
  const { dividend, divisor, quotient, remainder, isExact, cycles, allSteps } = problem;
  const currentStep = allSteps[Math.min(currentStepIndex, allSteps.length - 1)];
  const isFinished = currentStepIndex >= allSteps.length - 1;

  const dividendStr = dividend.toString();
  const quotientStr = quotient.toString();

  // Determine how many quotient digits have been revealed up to currentStepIndex
  const currentCycleIdx = currentStep ? currentStep.cycleIndex : cycles.length;
  
  // A quotient digit is revealed once we pass the FIND_QUOTIENT step of that cycle
  const revealedQuotientDigits: (number | null)[] = [];
  for (let c = 0; c < cycles.length; c++) {
    // Check if any step up to currentStepIndex corresponds to a completed quotient or past it
    const findQStepIdx = allSteps.findIndex(s => s.cycleIndex === c && s.type === 'FIND_QUOTIENT');
    if (currentStepIndex > findQStepIdx || isFinished) {
      revealedQuotientDigits.push(cycles[c].quotientDigit);
    } else {
      revealedQuotientDigits.push(null);
    }
  }

  // Which cycle's subtraction is revealed
  const isSubtractionRevealed = (cycleIdx: number) => {
    const subStepIdx = allSteps.findIndex(s => s.cycleIndex === cycleIdx && s.type === 'MULTIPLY_SUBTRACT');
    return currentStepIndex >= subStepIdx || isFinished;
  };

  // Which cycle's brought down digit is revealed
  const isBringDownRevealed = (cycleIdx: number) => {
    const bdStepIdx = allSteps.findIndex(s => s.cycleIndex === cycleIdx && s.type === 'BRING_DOWN');
    return currentStepIndex >= bdStepIdx || isFinished;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 md:p-7 relative overflow-hidden">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
            Formato Clásico de Galera
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs font-semibold text-slate-600">
            {problem.initialDigitsCount === 1 ? '1 cifra inicial' : '2 cifras iniciales'}
          </span>
        </div>

        {onToggleSubtraction && (
          <button
            type="button"
            onClick={onToggleSubtraction}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Resta:</span>
            <span className="font-bold text-indigo-700">
              {showExplicitSubtraction ? 'Escrita paso a paso' : 'Directa (mental)'}
            </span>
          </button>
        )}
      </div>

      {/* Galley Division Grid */}
      <div className="overflow-x-auto py-2">
        <div className="min-w-[340px] max-w-xl mx-auto font-mono select-none">
          {/* Main Top Row: Dividend and Divisor */}
          <div className="flex items-start">
            {/* Left Box: Dividend with Arch */}
            <div className="relative pr-4 pb-2">
              {/* Arch (Sombrerito) over selected initial digits */}
              <div className="h-6 flex items-end">
                <div
                  className="border-t-3 border-indigo-600 rounded-t-full transition-all duration-300 shadow-xs"
                  style={{
                    width: `${problem.initialDigitsCount * 32}px`,
                    marginLeft: '2px',
                    height: '12px',
                  }}
                  title={`Arquito sobre las primeras ${problem.initialDigitsCount} cifras`}
                />
              </div>

              {/* Dividend Digits */}
              <div className="flex text-3xl md:text-4xl font-extrabold tracking-widest text-slate-900">
                {dividendStr.split('').map((char, idx) => {
                  const isInitiallyArch = idx < problem.initialDigitsCount;
                  const isCurrentBroughtDown =
                    currentStep?.type === 'BRING_DOWN' &&
                    currentStep.highlightDigits.dividendIndices.includes(idx);

                  return (
                    <div
                      key={idx}
                      className={`w-8 text-center transition-all duration-300 relative py-1 rounded-lg ${
                        isCurrentBroughtDown
                          ? 'text-amber-600 bg-amber-100 font-black scale-110 ring-2 ring-amber-400'
                          : isInitiallyArch && currentStep?.type === 'INITIAL_SELECTION'
                          ? 'text-indigo-700 bg-indigo-50/80 ring-2 ring-indigo-300'
                          : isInitiallyArch
                          ? 'text-indigo-950'
                          : 'text-slate-800'
                      }`}
                    >
                      {char}
                      {isCurrentBroughtDown && (
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                          <ArrowDown className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Sub-rows under Dividend: intermediate steps */}
              <div className="mt-5 space-y-1.5 text-2xl md:text-3xl font-extrabold tracking-widest">
                {cycles.map((cycle, cIdx) => {
                  const showSub = isSubtractionRevealed(cIdx);
                  const showBd = isBringDownRevealed(cIdx);
                  const isCurrentCycle = currentStep?.cycleIndex === cIdx;

                  if (!showSub && !isCurrentCycle) return null;

                  // Indentation offset for columns
                  const columnOffset = cIdx === 0
                    ? Math.max(0, problem.initialDigitsCount - 1)
                    : problem.initialDigitsCount - 1 + cIdx;

                  const padSpaces = ' '.repeat(Math.max(0, columnOffset - 1));

                  return (
                    <div key={cIdx} className="transition-all duration-300">
                      {/* Explicit subtraction row if enabled */}
                      {showExplicitSubtraction && showSub && cycle.product > 0 && (
                        <div className="text-slate-400 text-xl md:text-2xl flex items-center font-bold">
                          <span className="text-rose-400 select-none mr-1">-</span>
                          <span>{padSpaces}{cycle.product}</span>
                        </div>
                      )}

                      {/* Line divider if explicit subtraction */}
                      {showExplicitSubtraction && showSub && cycle.product > 0 && (
                        <div className="border-b-2 border-slate-300 w-28 my-1"></div>
                      )}

                      {/* Remainder row */}
                      {showSub && (
                        <div
                          className={`flex items-center ${
                            cIdx === cycles.length - 1 && isFinished
                              ? 'text-violet-700 font-black'
                              : isCurrentCycle
                              ? 'text-slate-900 bg-indigo-50/60 px-1 rounded-md'
                              : 'text-slate-700'
                          }`}
                        >
                          <span>{padSpaces}{cycle.subtractionResult}</span>
                          
                          {/* Brought down digit */}
                          {showBd && cycle.broughtDownDigit !== null && (
                            <span className="text-amber-600 ml-1 bg-amber-100 px-1 rounded-md animate-pulse font-black ring-1 ring-amber-300">
                              {cycle.broughtDownDigit}
                            </span>
                          )}

                          {/* Final remainder marker */}
                          {cIdx === cycles.length - 1 && isFinished && (
                            <span className="ml-3 text-violet-700 text-base md:text-lg font-bold font-sans px-2.5 py-1 bg-violet-100 rounded-lg border border-violet-300 shadow-2xs">
                              Resto final: {remainder}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Box: The Divisor and Quotient Galley */}
            <div className="border-l-4 border-slate-800 pl-5 pb-2 min-w-[130px]">
              {/* Divisor row */}
              <div className="text-3xl md:text-4xl font-extrabold tracking-widest text-amber-700 pb-2">
                {divisor}
              </div>

              {/* Horizontal bar separating Divisor and Quotient */}
              <div className="border-t-4 border-slate-800 -ml-5 pl-5 pt-2">
                {/* Quotient row */}
                <div className="text-3xl md:text-4xl font-extrabold tracking-widest text-emerald-700 flex items-center min-h-[48px]">
                  {cycles.map((_, idx) => {
                    const digitVal = revealedQuotientDigits[idx];
                    const isTargetNow =
                      currentStep?.type === 'FIND_QUOTIENT' &&
                      currentStep.cycleIndex === idx;

                    return (
                      <span
                        key={idx}
                        className={`w-8 text-center transition-all ${
                          digitVal !== null
                            ? 'text-emerald-700'
                            : isTargetNow
                            ? 'bg-emerald-100 text-emerald-800 rounded-lg border-2 border-dashed border-emerald-500 animate-pulse font-black'
                            : 'text-slate-300'
                        }`}
                      >
                        {digitVal !== null ? digitVal : isTargetNow ? '?' : '·'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Color Legend */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex flex-wrap items-center gap-4 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
            <span>Dividendo (D): <strong>{dividend}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-600"></span>
            <span>Divisor (d): <strong>{divisor}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
            <span>Cociente (c): <strong>{revealedQuotientDigits.filter(d => d !== null).join('') || '...'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-violet-600"></span>
            <span>Resto (r): <strong>{isFinished ? remainder : '...'}</strong></span>
          </div>
        </div>

        {isFinished && (
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isExact ? 'División Exacta' : 'División Entera (con resto)'}</span>
          </div>
        )}
      </div>

      {/* Proof of division box at finish */}
      {isFinished && (
        <div className="mt-4 p-3.5 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-xl border border-indigo-100 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold text-indigo-900">Prueba de la División: </span>
            <span className="font-mono text-slate-800 font-semibold">
              Dividendo = (Divisor × Cociente) + Resto
            </span>
          </div>
          <div className="font-mono font-bold text-indigo-700 bg-white px-3 py-1 rounded-lg border border-indigo-200 shadow-xs">
            {dividend} = ({divisor} × {quotient}) + {remainder} = {divisor * quotient + remainder} ✓
          </div>
        </div>
      )}
    </div>
  );
};
