import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

interface MultiplicationTableHelperProps {
  divisor: number;
  targetNumber?: number;
  onSelectMultiple?: (factor: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const MultiplicationTableHelper: React.FC<MultiplicationTableHelperProps> = ({
  divisor,
  targetNumber,
  onSelectMultiple,
  isOpen,
  onToggle,
}) => {
  const table = Array.from({ length: 10 }, (_, i) => ({
    factor: i,
    product: divisor * i,
  }));

  // Best factor for targetNumber without exceeding
  const bestFactor = targetNumber !== undefined
    ? table.reduce((best, curr) => (curr.product <= targetNumber ? curr.factor : best), 0)
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-amber-50/60 hover:bg-amber-100/60 flex items-center justify-between text-left transition-colors cursor-pointer"
        type="button"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span className="font-semibold text-sm text-slate-800">
            Tabla de multiplicar del {divisor}
          </span>
          <span className="text-xs text-slate-500">
            · {isOpen ? 'Ocultar chuleta' : 'Ver chuleta de apoyo'}
          </span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-200/70 text-amber-900">
          {isOpen ? 'Cerrar ▲' : 'Abrir ▼'}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
          <p className="text-xs text-slate-600 mb-3">
            {targetNumber !== undefined ? (
              <>
                Buscamos qué número multiplicado por <strong className="text-amber-700">{divisor}</strong> se acerca a <strong className="text-indigo-700">{targetNumber}</strong> sin pasarse:
              </>
            ) : (
              `Consulta los productos de la tabla del ${divisor} para ayudarte con el cociente:`
            )}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {table.map(({ factor, product }) => {
              const isBest = bestFactor === factor && targetNumber !== undefined;
              const isTooBig = targetNumber !== undefined && product > targetNumber;

              return (
                <button
                  key={factor}
                  type="button"
                  onClick={() => onSelectMultiple?.(factor)}
                  disabled={!onSelectMultiple}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    isBest
                      ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-300 text-emerald-950 font-bold shadow-sm scale-102'
                      : isTooBig
                      ? 'bg-slate-100/80 border-slate-200 text-slate-400 line-through opacity-70'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/40'
                  } ${onSelectMultiple ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="text-xs text-slate-500 font-mono">
                    {divisor} × {factor} =
                  </div>
                  <div className="text-base font-bold font-mono tabular-nums">
                    {product}
                  </div>
                  {isBest && (
                    <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-0.5 mt-0.5">
                      <Sparkles className="w-3 h-3" /> ¡Este!
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
