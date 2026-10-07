import React, { useState, useEffect } from 'react';
import { playPop, playStep, playSuccess, playFanfare } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, FastForward, CheckCircle2 } from 'lucide-react';

interface ItemIconProps {
  type: 'apple' | 'candy' | 'coin' | 'star';
  className?: string;
}

const ItemEmoji: React.FC<ItemIconProps> = ({ type, className = 'text-xl' }) => {
  const emoji = {
    apple: '🍎',
    candy: '🍬',
    coin: '🪙',
    star: '⭐',
  }[type];
  return <span className={className}>{emoji}</span>;
};

export const VisualSharingLab: React.FC = () => {
  const [totalItems, setTotalItems] = useState(14);
  const [groupsCount, setGroupsCount] = useState(3);
  const [itemType, setItemType] = useState<'apple' | 'candy' | 'coin' | 'star'>('candy');

  // Distribution simulation state
  // baskets[i] has count of items in basket i
  const [baskets, setBaskets] = useState<number[]>([0, 0, 0]);
  const [unassignedItems, setUnassignedItems] = useState<number>(14);
  const [leftoverItems, setLeftoverItems] = useState<number>(0);
  const [isDistributing, setIsDistributing] = useState(false);
  const [currentBasketIndex, setCurrentBasketIndex] = useState(0);

  // Math calculated values
  const quotient = Math.floor(totalItems / groupsCount);
  const remainder = totalItems % groupsCount;
  const isFinished = unassignedItems === 0 && leftoverItems === remainder;

  // Reset when sliders change
  const handleReset = (newTotal = totalItems, newGroups = groupsCount) => {
    setIsDistributing(false);
    setTotalItems(newTotal);
    setGroupsCount(newGroups);
    setBaskets(new Array(newGroups).fill(0));
    setUnassignedItems(newTotal);
    setLeftoverItems(0);
    setCurrentBasketIndex(0);
    playPop();
  };

  // Step-by-step distribution timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isDistributing) {
      if (unassignedItems >= groupsCount) {
        // We have enough to give 1 to each basket in this round
        timer = setTimeout(() => {
          setBaskets(prev => {
            const next = [...prev];
            next[currentBasketIndex] += 1;
            return next;
          });
          setUnassignedItems(prev => prev - 1);
          playStep();

          if (currentBasketIndex + 1 < groupsCount) {
            setCurrentBasketIndex(prev => prev + 1);
          } else {
            setCurrentBasketIndex(0);
          }
        }, 220);
      } else if (unassignedItems > 0) {
        // Less than groupsCount: they cannot be shared equally! They go to remainder!
        timer = setTimeout(() => {
          setLeftoverItems(unassignedItems);
          setUnassignedItems(0);
          setIsDistributing(false);
          playSuccess();
          playFanfare();
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.7 },
          });
        }, 400);
      } else {
        // Exactly 0 remaining
        setIsDistributing(false);
        playSuccess();
        playFanfare();
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.7 },
        });
      }
    }
    return () => clearTimeout(timer);
  }, [isDistributing, unassignedItems, currentBasketIndex, groupsCount]);

  const handleInstantDistribute = () => {
    setIsDistributing(false);
    setBaskets(new Array(groupsCount).fill(quotient));
    setUnassignedItems(0);
    setLeftoverItems(remainder);
    playSuccess();
    playFanfare();
    confetti({
      particleCount: 60,
      spread: 55,
      origin: { y: 0.6 },
    });
  };

  const itemNames = {
    apple: 'manzanas',
    candy: 'caramelos',
    coin: 'monedas',
    star: 'estrellas',
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 md:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Laboratorio de Reparto Visual en Partes Iguales
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Descubre qué significa dividir antes del algoritmo: repartir equitativamente y ver el sobrante.
            </p>
          </div>

          {/* Item Emoji Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
            {(['candy', 'apple', 'star', 'coin'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setItemType(type)}
                className={`px-2.5 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                  itemType === type ? 'bg-white shadow-xs scale-105' : 'hover:bg-slate-200/60'
                }`}
                title={`Repartir ${itemNames[type]}`}
              >
                <ItemEmoji type={type} />
              </button>
            ))}
          </div>
        </div>

        {/* Sliders for Total Items and Groups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Dividendo (Cantidad a repartir):</span>
              <span className="font-mono text-base text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {totalItems} {itemNames[itemType]}
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="30"
              value={totalItems}
              disabled={isDistributing}
              onChange={e => handleReset(Number(e.target.value), groupsCount)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>4 items</span>
              <span>15 items</span>
              <span>30 items</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Divisor (Número de grupos o cajas):</span>
              <span className="font-mono text-base text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                {groupsCount} grupos
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="6"
              value={groupsCount}
              disabled={isDistributing}
              onChange={e => handleReset(totalItems, Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>2 grupos</span>
              <span>4 grupos</span>
              <span>6 grupos</span>
            </div>
          </div>
        </div>

        {/* Playback action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isDistributing || isFinished}
              onClick={() => setIsDistributing(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs disabled:opacity-40 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Repartir uno a uno</span>
            </button>

            <button
              type="button"
              disabled={isDistributing || isFinished}
              onClick={handleInstantDistribute}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FastForward className="w-4 h-4" />
              <span>Repartir todo</span>
            </button>

            <button
              type="button"
              onClick={() => handleReset()}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          </div>

          <div className="text-xs font-medium text-slate-600">
            Fórmula: <strong className="text-indigo-900 font-mono">{totalItems} ÷ {groupsCount}</strong>
          </div>
        </div>
      </div>

      {/* Main Sandbox Stage: The Sharing Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Unassigned pile & groups (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Source Pile (Dividendo) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                Montón Principal (Dividendo = {totalItems})
              </span>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                Por repartir: {unassignedItems}
              </span>
            </div>

            {unassignedItems > 0 ? (
              <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-indigo-50/30 rounded-xl border border-dashed border-indigo-200 items-center justify-center">
                {Array.from({ length: unassignedItems }).map((_, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-2xs text-lg select-none hover:scale-110 transition-transform"
                  >
                    <ItemEmoji type={itemType} />
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 font-medium">
                ¡Todos los items han sido distribuidos!
              </div>
            )}
          </div>

          {/* Target Baskets (Divisor and Quotient) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                Grupos Iguales (Divisor = {groupsCount})
              </span>
              <span className="text-xs text-slate-500">
                A cada grupo le corresponden: <strong className="text-emerald-700 font-mono text-sm">{baskets[0] || 0}</strong> items
              </span>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(groupsCount, 3)} gap-3`}>
              {baskets.map((count, bIdx) => {
                const isCurrentActive = isDistributing && currentBasketIndex === bIdx;

                return (
                  <div
                    key={bIdx}
                    className={`rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between min-h-[140px] ${
                      isCurrentActive
                        ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-300 shadow-sm scale-102'
                        : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 text-xs">
                      <span className="font-bold text-slate-700">
                        Caja #{bIdx + 1}
                      </span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {count} items
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 py-3 min-h-[60px] items-center content-center">
                      {Array.from({ length: count }).map((_, itemI) => (
                        <span
                          key={itemI}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white shadow-2xs text-base animate-in zoom-in-75"
                        >
                          <ItemEmoji type={itemType} />
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-400 text-center">
                      {count === quotient && isFinished ? '✓ Reparto completado' : 'Recibiendo...'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Resto (Remainder) & Conclusion Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Remainder Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
                Cesto de Sobrantes (Resto)
              </span>
              <span className="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md text-xs">
                {leftoverItems} sobra{leftoverItems === 1 ? '' : 'n'}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              {leftoverItems > 0 ? (
                <>
                  No se pueden repartir equitativamente porque son menos que el número de cajas ({leftoverItems} &lt; {groupsCount}).
                </>
              ) : (
                'Si el reparto es exacto, no sobra ninguno (resto = 0).'
              )}
            </p>

            <div className="p-3 bg-violet-50/40 rounded-xl border border-dashed border-violet-200 min-h-[70px] flex flex-wrap gap-2 items-center justify-center">
              {leftoverItems > 0 ? (
                Array.from({ length: leftoverItems }).map((_, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-2xs text-lg animate-in bounce-in"
                  >
                    <ItemEmoji type={itemType} />
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">
                  {isFinished ? '¡Resto 0! División exacta' : 'Sin sobrantes por ahora'}
                </span>
              )}
            </div>
          </div>

          {/* Mathematical Conclusion Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h4 className="font-bold text-sm text-indigo-200">
                Conclusión Pedagógica
              </h4>
              {isFinished && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verificado
                </span>
              )}
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Dividendo (D):</span>
                <span className="font-mono font-bold text-white text-sm">{totalItems}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Divisor (d):</span>
                <span className="font-mono font-bold text-amber-300 text-sm">{groupsCount}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Cociente (c - por caja):</span>
                <span className="font-mono font-bold text-emerald-300 text-sm">{quotient}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Resto (r - sobran):</span>
                <span className="font-mono font-bold text-violet-300 text-sm">{remainder}</span>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 space-y-1">
              <div className="text-[11px] text-indigo-300 font-semibold">
                La Regla de Oro:
              </div>
              <div className="font-mono text-xs text-white">
                {groupsCount} cajas × {quotient} items + {remainder} resto = <strong>{totalItems}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
