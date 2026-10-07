import React from 'react';
import { Badge, GameLevel } from '../types/gamification';
import { Sparkles, Trophy, Award, Flame, Eye, PieChart, ShieldAlert, Swords } from 'lucide-react';

interface BadgeModalProps {
  badge: Badge | null;
  level: GameLevel | null;
  onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ badge, level, onClose }) => {
  if (!badge && !level) return null;

  const renderBadgeIcon = (name: string) => {
    switch (name) {
      case 'Sparkles':
        return <Sparkles className="w-10 h-10 text-amber-500" />;
      case 'PieChart':
        return <PieChart className="w-10 h-10 text-indigo-500" />;
      case 'Eye':
        return <Eye className="w-10 h-10 text-emerald-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-10 h-10 text-amber-500" />;
      case 'Flame':
        return <Flame className="w-10 h-10 text-rose-500" />;
      case 'Swords':
        return <Swords className="w-10 h-10 text-purple-500" />;
      default:
        return <Award className="w-10 h-10 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
        {level ? (
          <>
            <div className="w-20 h-20 rounded-2xl bg-amber-100 mx-auto flex items-center justify-center text-4xl shadow-inner border border-amber-200">
              {level.icon}
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
                ¡Nuevo Nivel Desbloqueado!
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 font-sans">
                {level.name}
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {level.subtitle}
              </p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {level.description}
            </p>
          </>
        ) : badge ? (
          <>
            <div className="w-20 h-20 rounded-2xl bg-amber-50 mx-auto flex items-center justify-center shadow-inner border border-amber-200">
              {renderBadgeIcon(badge.iconName)}
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
                ¡Nueva Insignia Conseguida!
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 font-sans">
                {badge.title}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {badge.description}
            </p>
          </>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
        >
          ¡Continuar Aprendiendo! 🚀
        </button>
      </div>
    </div>
  );
};
