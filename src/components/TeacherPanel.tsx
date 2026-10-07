import React, { useState } from 'react';
import { calculateDivision } from '../utils/divisionEngine';
import { TeacherAnalyticsCharts } from './TeacherAnalyticsCharts';
import { Printer, RefreshCw, Eye, EyeOff, BookOpen, Sparkles, CheckSquare, GraduationCap, BarChart3, FileSpreadsheet } from 'lucide-react';

interface WorksheetItem {
  id: number;
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  isExact: boolean;
}

interface TeacherPanelProps {
  onLoadInSimulator: (dividend: number, divisor: number) => void;
}

export const TeacherPanel: React.FC<TeacherPanelProps> = ({ onLoadInSimulator }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'worksheets' | 'guide'>('analytics');
  const [level, setLevel] = useState<'primaria3' | 'primaria4' | 'primaria5'>('primaria4');
  const [showSolutions, setShowSolutions] = useState(false);
  const [worksheetItems, setWorksheetItems] = useState<WorksheetItem[]>(() => generateSheet('primaria4'));

  function generateSheet(selectedLevel: 'primaria3' | 'primaria4' | 'primaria5'): WorksheetItem[] {
    const items: WorksheetItem[] = [];

    for (let i = 1; i <= 6; i++) {
      let div = 3;
      let dividend = 75;

      if (selectedLevel === 'primaria3') {
        // 1 digit divisor (2-6), 2 digits dividend, simple
        div = [2, 3, 4, 5][i % 4];
        const q = Math.floor(Math.random() * 15) + 11;
        const rem = i % 2 === 0 ? 0 : Math.floor(Math.random() * (div - 1)) + 1;
        dividend = div * q + rem;
      } else if (selectedLevel === 'primaria4') {
        // 1 digit divisor (3-9), 3 digits dividend, some with zero in quotient
        div = [4, 5, 6, 7, 8][i % 5];
        if (i === 3 || i === 5) {
          // zero in quotient case
          const q = (Math.floor(Math.random() * 2) + 1) * 100 + (Math.floor(Math.random() * (div - 1)) + 1);
          dividend = div * q + (i % 2);
        } else {
          const q = Math.floor(Math.random() * 60) + 30;
          dividend = div * q + (i % 3);
        }
      } else {
        // 2 digits divisor (12, 15, 20, 24, 25)
        div = [12, 15, 20, 24, 25][i % 5];
        const q = Math.floor(Math.random() * 30) + 14;
        dividend = div * q + (i % div);
      }

      const p = calculateDivision(dividend, div);
      items.push({
        id: i,
        dividend,
        divisor: div,
        quotient: p.quotient,
        remainder: p.remainder,
        isExact: p.isExact,
      });
    }

    return items;
  }

  const handleRegenerate = () => {
    setWorksheetItems(generateSheet(level));
  };

  const handleLevelChange = (newLevel: 'primaria3' | 'primaria4' | 'primaria5') => {
    setLevel(newLevel);
    setWorksheetItems(generateSheet(newLevel));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Teacher Hub Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Rincón del Docente: Analíticas y Recursos Didácticos
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Supervisa la evolución de la clase mediante gráficos de precisión y tiempo de respuesta, o genera fichas imprimibles.
          </p>
        </div>

        {activeTab === 'worksheets' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ficha (PDF / Papel)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/70 rounded-xl print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-white text-indigo-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <span>Evolución y Analíticas (Recharts)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('worksheets')}
          className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'worksheets'
              ? 'bg-white text-indigo-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          <span>Fichas Imprimibles con Galera</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'guide'
              ? 'bg-white text-indigo-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Guía Didáctica de Primaria</span>
        </button>
      </div>

      {/* TAB 1: RECHARTS ANALYTICS */}
      {activeTab === 'analytics' && <TeacherAnalyticsCharts />}

      {/* TAB 2: PRINTABLE WORKSHEETS */}
      {activeTab === 'worksheets' && (
        <div className="space-y-6">
          {/* Level Filters & Solutions Toggle */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
                Curso escolar:
              </span>

              <button
                type="button"
                onClick={() => handleLevelChange('primaria3')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  level === 'primaria3'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                3º Primaria (Iniciación 1 cifra)
              </button>

              <button
                type="button"
                onClick={() => handleLevelChange('primaria4')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  level === 'primaria4'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                4º Primaria (3 cifras y ceros)
              </button>

              <button
                type="button"
                onClick={() => handleLevelChange('primaria5')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  level === 'primaria5'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                5º/6º Primaria (Divisor 2 cifras)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSolutions(s => !s)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {showSolutions ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSolutions ? 'Ocultar Solucionario' : 'Mostrar Solucionario'}</span>
              </button>

              <button
                type="button"
                onClick={handleRegenerate}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Nuevos ejercicios</span>
              </button>
            </div>
          </div>

      {/* Printable Worksheet Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Ficha de Práctica: La División Paso a Paso
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Nombre: ____________________________________ · Fecha: _______________ · Curso: _______
            </p>
          </div>
          <div className="text-right text-xs font-mono text-slate-400 print:text-slate-600">
            Aprende a Dividir
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {worksheetItems.map((item, index) => (
            <div
              key={item.id}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/30 flex flex-col justify-between min-h-[220px] print:bg-white print:border-slate-300"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                <span className="font-bold text-slate-600">
                  Ejercicio #{index + 1}
                </span>

                <button
                  type="button"
                  onClick={() => onLoadInSimulator(item.dividend, item.divisor)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline print:hidden cursor-pointer"
                  title="Abrir en el simulador paso a paso"
                >
                  Proyectar en Simulador ↗
                </button>
              </div>

              {/* Classic Galley Template */}
              <div className="py-4 my-auto">
                <div className="font-mono text-2xl font-bold flex items-start justify-center">
                  {/* Dividend area */}
                  <div className="pr-4 tracking-widest text-slate-800">
                    {item.dividend}
                  </div>

                  {/* Divisor and Quotient box */}
                  <div className="border-l-2 border-slate-800 pl-3 min-w-[70px]">
                    <div className="text-amber-800 pb-1.5 tracking-wider">
                      {item.divisor}
                    </div>
                    <div className="border-t-2 border-slate-800 -ml-3 pl-3 pt-1.5 min-h-[36px] text-emerald-700 tracking-wider">
                      {showSolutions ? item.quotient : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Solution Footer for Teacher */}
              {showSolutions && (
                <div className="pt-2 border-t border-slate-200/80 text-[11px] font-mono text-slate-600 flex justify-between bg-emerald-50/70 p-2 rounded-lg">
                  <span>c = {item.quotient}</span>
                  <span>r = {item.remainder}</span>
                  <span className="text-emerald-800 font-semibold font-sans">
                    {item.isExact ? 'Exacta' : 'Entera'}
                  </span>
                </div>
              )}

              {!showSolutions && (
                <div className="text-[10px] text-slate-400 text-right print:text-slate-500">
                  Prueba: D = d × c + r
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Printable Footer */}
        <div className="pt-6 border-t border-slate-100 flex justify-between text-xs text-slate-400">
          <span>Recuerda: si al bajar una cifra el número es menor que el divisor, ¡cero al cociente y baja la cifra siguiente!</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
      </div>
      )}

      {/* TAB 3: PEDAGOGICAL GUIDE */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 print:hidden">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h4 className="font-bold text-sm text-slate-900">
              Consejos Didácticos para el Aula (Secuencia de Aprendizaje en Primaria)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="p-4 bg-indigo-50/50 rounded-xl space-y-2 border border-indigo-100">
              <span className="font-bold text-indigo-950 block text-sm">
                1. Del Reparto a la Galera (Fase Enactiva)
              </span>
              <p className="leading-relaxed">
                Comienza siempre con el <em>Laboratorio de Reparto Visual</em>. Los alumnos de 9 años necesitan ver los caramelos y las cajas para asimilar el significado del cociente y del resto antes de operar en la caja.
              </p>
            </div>

            <div className="p-4 bg-amber-50/50 rounded-xl space-y-2 border border-amber-100">
              <span className="font-bold text-amber-950 block text-sm">
                2. El Ritual del Arquito (Fase Icónica)
              </span>
              <p className="leading-relaxed">
                Dedica tiempo al primer paso: comparar la primera cifra con el divisor. Si es menor, se pone el arquito sobre dos cifras. El minijuego <em>Detective del Arquito</em> ayuda a automatizar este paso decisivo.
              </p>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-xl space-y-2 border border-emerald-100">
              <span className="font-bold text-emerald-950 block text-sm">
                3. La Prueba de la División (Fase Simbólica)
              </span>
              <p className="leading-relaxed">
                Fomenta la autonomía pidiendo que cada alumno compruebe con $D = d \times c + r$. Refuerza la relación inversa entre multiplicación y división y da seguridad a los niños.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
