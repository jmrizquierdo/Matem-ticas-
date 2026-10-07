import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { StudentMetricsSummary, StudentHistoryPoint } from '../types/gamification';
import { TrendingUp, Clock, Target, Users, AlertTriangle, CheckCircle2, Award } from 'lucide-react';

// Realistic classroom analytics data showing progressive evolution across sessions
const CLASS_ANALYTICS_DATA: StudentMetricsSummary[] = [
  {
    studentId: 'student-1',
    studentName: 'Lucía M.',
    avatar: '🦊',
    avgAccuracy: 94,
    avgResponseTimeSec: 6.8,
    totalSolved: 14,
    history: [
      { sessionLabel: 'Sesión 1', date: 'Lun', accuracy: 72, avgResponseTimeSec: 14.5, problemsSolved: 2, category: '1 Cifra' },
      { sessionLabel: 'Sesión 2', date: 'Mar', accuracy: 80, avgResponseTimeSec: 11.2, problemsSolved: 3, category: '1 Cifra' },
      { sessionLabel: 'Sesión 3', date: 'Mié', accuracy: 88, avgResponseTimeSec: 9.4, problemsSolved: 3, category: 'Con Resto' },
      { sessionLabel: 'Sesión 4', date: 'Jue', accuracy: 92, avgResponseTimeSec: 7.6, problemsSolved: 3, category: 'Cero Cociente' },
      { sessionLabel: 'Sesión 5', date: 'Hoy', accuracy: 96, avgResponseTimeSec: 6.8, problemsSolved: 3, category: '2 Cifras' },
    ],
  },
  {
    studentId: 'student-2',
    studentName: 'Mateo R.',
    avatar: '🦉',
    avgAccuracy: 88,
    avgResponseTimeSec: 8.2,
    totalSolved: 10,
    history: [
      { sessionLabel: 'Sesión 1', date: 'Lun', accuracy: 65, avgResponseTimeSec: 16.0, problemsSolved: 2, category: '1 Cifra' },
      { sessionLabel: 'Sesión 2', date: 'Mar', accuracy: 74, avgResponseTimeSec: 13.1, problemsSolved: 2, category: '1 Cifra' },
      { sessionLabel: 'Sesión 3', date: 'Mié', accuracy: 82, avgResponseTimeSec: 10.5, problemsSolved: 2, category: 'Con Resto' },
      { sessionLabel: 'Sesión 4', date: 'Jue', accuracy: 86, avgResponseTimeSec: 9.0, problemsSolved: 2, category: 'Cero Cociente' },
      { sessionLabel: 'Sesión 5', date: 'Hoy', accuracy: 91, avgResponseTimeSec: 8.2, problemsSolved: 2, category: '2 Cifras' },
    ],
  },
  {
    studentId: 'student-3',
    studentName: 'Sara P.',
    avatar: '🚀',
    avgAccuracy: 84,
    avgResponseTimeSec: 9.5,
    totalSolved: 8,
    history: [
      { sessionLabel: 'Sesión 1', date: 'Lun', accuracy: 60, avgResponseTimeSec: 18.2, problemsSolved: 1, category: '1 Cifra' },
      { sessionLabel: 'Sesión 2', date: 'Mar', accuracy: 70, avgResponseTimeSec: 14.8, problemsSolved: 2, category: '1 Cifra' },
      { sessionLabel: 'Sesión 3', date: 'Mié', accuracy: 78, avgResponseTimeSec: 12.0, problemsSolved: 2, category: 'Con Resto' },
      { sessionLabel: 'Sesión 4', date: 'Jue', accuracy: 82, avgResponseTimeSec: 10.4, problemsSolved: 2, category: 'Cero Cociente' },
      { sessionLabel: 'Sesión 5', date: 'Hoy', accuracy: 86, avgResponseTimeSec: 9.5, problemsSolved: 1, category: '2 Cifras' },
    ],
  },
  {
    studentId: 'student-4',
    studentName: 'Hugo T.',
    avatar: '🦁',
    avgAccuracy: 79,
    avgResponseTimeSec: 11.2,
    totalSolved: 7,
    history: [
      { sessionLabel: 'Sesión 1', date: 'Lun', accuracy: 55, avgResponseTimeSec: 20.0, problemsSolved: 1, category: '1 Cifra' },
      { sessionLabel: 'Sesión 2', date: 'Mar', accuracy: 62, avgResponseTimeSec: 16.5, problemsSolved: 1, category: '1 Cifra' },
      { sessionLabel: 'Sesión 3', date: 'Mié', accuracy: 72, avgResponseTimeSec: 14.0, problemsSolved: 2, category: 'Con Resto' },
      { sessionLabel: 'Sesión 4', date: 'Jue', accuracy: 76, avgResponseTimeSec: 12.5, problemsSolved: 2, category: 'Cero Cociente' },
      { sessionLabel: 'Sesión 5', date: 'Hoy', accuracy: 81, avgResponseTimeSec: 11.2, problemsSolved: 1, category: '2 Cifras' },
    ],
  },
  {
    studentId: 'student-5',
    studentName: 'Elena G.',
    avatar: '🐬',
    avgAccuracy: 91,
    avgResponseTimeSec: 7.4,
    totalSolved: 11,
    history: [
      { sessionLabel: 'Sesión 1', date: 'Lun', accuracy: 68, avgResponseTimeSec: 15.0, problemsSolved: 2, category: '1 Cifra' },
      { sessionLabel: 'Sesión 2', date: 'Mar', accuracy: 78, avgResponseTimeSec: 12.0, problemsSolved: 2, category: '1 Cifra' },
      { sessionLabel: 'Sesión 3', date: 'Mié', accuracy: 85, avgResponseTimeSec: 9.8, problemsSolved: 3, category: 'Con Resto' },
      { sessionLabel: 'Sesión 4', date: 'Jue', accuracy: 89, avgResponseTimeSec: 8.2, problemsSolved: 2, category: 'Cero Cociente' },
      { sessionLabel: 'Sesión 5', date: 'Hoy', accuracy: 93, avgResponseTimeSec: 7.4, problemsSolved: 2, category: '2 Cifras' },
    ],
  },
];

export const TeacherAnalyticsCharts: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [activeMetricTab, setActiveMetricTab] = useState<'both' | 'accuracy' | 'time'>('both');

  // Compute class averages per session
  const sessionLabels = ['Sesión 1', 'Sesión 2', 'Sesión 3', 'Sesión 4', 'Sesión 5'];
  const classEvolutionData = sessionLabels.map((lbl, idx) => {
    let accSum = 0;
    let timeSum = 0;
    let count = 0;

    CLASS_ANALYTICS_DATA.forEach(s => {
      const pt = s.history[idx];
      if (pt) {
        accSum += pt.accuracy;
        timeSum += pt.avgResponseTimeSec;
        count++;
      }
    });

    return {
      session: lbl,
      precisionClass: Math.round(accSum / count),
      tiempoClass: Number((timeSum / count).toFixed(1)),
    };
  });

  // Selected student history or class average history
  const activeStudent = CLASS_ANALYTICS_DATA.find(s => s.studentId === selectedStudentId);

  const displayLineData = selectedStudentId === 'all'
    ? classEvolutionData.map(d => ({
        session: d.session,
        precision: d.precisionClass,
        tiempo: d.tiempoClass,
      }))
    : (activeStudent?.history || []).map(h => ({
        session: h.sessionLabel,
        precision: h.accuracy,
        tiempo: h.avgResponseTimeSec,
        categoria: h.category,
      }));

  // Student comparison data for Bar Chart
  const comparisonData = CLASS_ANALYTICS_DATA.map(s => ({
    name: `${s.avatar} ${s.studentName}`,
    precision: s.avgAccuracy,
    tiempo: s.avgResponseTimeSec,
    resueltas: s.totalSolved,
  }));

  // Overall class averages
  const classAvgPrecision = Math.round(
    CLASS_ANALYTICS_DATA.reduce((acc, s) => acc + s.avgAccuracy, 0) / CLASS_ANALYTICS_DATA.length
  );
  const classAvgTime = (
    CLASS_ANALYTICS_DATA.reduce((acc, s) => acc + s.avgResponseTimeSec, 0) / CLASS_ANALYTICS_DATA.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Analytics KPI Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Precisión Media</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-700 font-mono">
            {classAvgPrecision}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +24% desde la 1ª sesión
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Tiempo / Paso</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-amber-700 font-mono">
            {classAvgTime}s
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            Reducción de 17.5s a 8.6s
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Alumnos Activos</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-indigo-700 font-mono">
            {CLASS_ANALYTICS_DATA.length}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            50 divisiones completadas
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Punto a Reforzar</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-sm font-extrabold text-slate-900 mt-1">
            Cero al Cociente
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            68% acierto en primer intento
          </div>
        </div>
      </div>

      {/* Main Evolution Chart Card with Dual Axes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>Curva de Aprendizaje: Precisión vs Tiempo de Respuesta</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              A mayor dominio del algoritmo de galera, la precisión aumenta y los segundos de vacilación disminuyen.
            </p>
          </div>

          {/* Student Filter Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Ver:</span>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
            >
              <option value="all">Toda la Clase (Media)</option>
              {CLASS_ANALYTICS_DATA.map(s => (
                <option key={s.studentId} value={s.studentId}>
                  {s.avatar} {s.studentName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dual Axis Evolution Line Chart */}
        <div className="h-[300px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayLineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="precisionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="session" stroke="#94A3B8" fontSize={12} tickLine={false} />
              
              {/* Left YAxis: Precision (%) */}
              <YAxis
                yAxisId="left"
                stroke="#10B981"
                domain={[40, 100]}
                fontSize={12}
                tickFormatter={v => `${v}%`}
              />

              {/* Right YAxis: Time (sec) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#F59E0B"
                domain={[0, 25]}
                fontSize={12}
                tickFormatter={v => `${v}s`}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
                formatter={(val, name) => {
                  if (name === 'precision') return [`${val}%`, 'Precisión'];
                  if (name === 'tiempo') return [`${val} seg`, 'Tiempo / paso'];
                  return [val, name];
                }}
              />
              <Legend
                formatter={val => (val === 'precision' ? 'Precisión de Aciertos (%)' : 'Tiempo de Respuesta (segundos)')}
              />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="precision"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#precisionGradient)"
                activeDot={{ r: 6 }}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="tiempo"
                stroke="#F59E0B"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#F59E0B' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              Línea Verde: Precisión de aciertos (sube con la práctica)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              Línea Punteada Ámbar: Tiempo por paso en segundos (baja al automatizar)
            </span>
          </div>
          <span className="font-semibold text-indigo-700">
            {selectedStudentId === 'all' ? 'Datos consolidados del grupo' : `Histórico de ${activeStudent?.studentName}`}
          </span>
        </div>
      </div>

      {/* Comparison Bar Chart: All Students */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Comparativa de Rendimiento por Alumno</span>
            </h4>
            <p className="text-xs text-slate-500">
              Precisión media (%) alcanzada frente a segundos empleados por paso.
            </p>
          </div>
        </div>

        <div className="h-[260px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
                formatter={(val, name) => {
                  if (name === 'precision') return [`${val}%`, 'Precisión'];
                  if (name === 'tiempo') return [`${val} seg`, 'Tiempo'];
                  return [val, name];
                }}
              />
              <Legend formatter={val => (val === 'precision' ? 'Precisión Media (%)' : 'Tiempo Medio (s)')} />
              <Bar dataKey="precision" fill="#6366F1" radius={[6, 6, 0, 0]} barSize={26} />
              <Bar dataKey="tiempo" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Teacher Actionable Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-emerald-50/50 rounded-2xl border border-indigo-100 p-5 space-y-3">
        <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Diagnóstico Pedagógico Automático</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
          <div className="p-3 bg-white/80 rounded-xl border border-indigo-100">
            <strong className="text-indigo-900 block mb-1">1. Automatización lograda:</strong>
            El 100% de los alumnos domina el arquito inicial (comparación primer dígito vs divisor).
          </div>
          <div className="p-3 bg-white/80 rounded-xl border border-indigo-100">
            <strong className="text-amber-900 block mb-1">2. Velocidad en tablas:</strong>
            El tiempo de búsqueda del cociente bajó un 48% gracias a la chuleta interactiva.
          </div>
          <div className="p-3 bg-white/80 rounded-xl border border-indigo-100">
            <strong className="text-rose-900 block mb-1">3. Recomendación de aula:</strong>
            Asignar a Hugo y Sara 3 problemas de &quot;Cero al Cociente&quot; en el modo interactivo.
          </div>
        </div>
      </div>
    </div>
  );
};
