import React from 'react';
import { ArrowLeft, Zap, Flame, ShieldAlert } from 'lucide-react';
import { AiDifficulty } from '../types';
import { audio } from '../services/audio';

interface AiDifficultyScreenProps {
  onBack: () => void;
  onSelect: (difficulty: AiDifficulty) => void;
}

export const AiDifficultyScreen: React.FC<AiDifficultyScreenProps> = ({
  onBack,
  onSelect,
}) => {
  const cards: {
    id: AiDifficulty;
    bg: string;
    border: string;
    label: string;
    sub: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'easy',
      bg: 'from-emerald-500 via-teal-600 to-emerald-800',
      border: 'border-emerald-300 hover:border-white',
      label: 'EASY',
      sub: 'Relaxed and fun',
      icon: <Zap className="w-8 h-8 text-white" />,
    },
    {
      id: 'medium',
      bg: 'from-amber-500 via-orange-600 to-amber-800',
      border: 'border-amber-300 hover:border-white',
      label: 'MEDIUM',
      sub: 'Balanced challenge',
      icon: <Flame className="w-8 h-8 text-white" />,
    },
    {
      id: 'hard',
      bg: 'from-rose-500 via-red-600 to-rose-900',
      border: 'border-rose-300 hover:border-white',
      label: 'HARD',
      sub: 'For true masters',
      icon: <ShieldAlert className="w-8 h-8 text-white" />,
    },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 max-w-xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full">
        <button
          id="ai-diff-back-btn"
          onClick={() => {
            audio.playButton();
            onBack();
          }}
          className="w-11 h-11 rounded-2xl bg-slate-900/85 hover:bg-slate-800 flex items-center justify-center text-white border border-slate-700 shadow-lg active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wide font-['Fredoka'] drop-shadow">
            CHOOSE DIFFICULTY
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-0.5">
            Select the AI opponent skill tier
          </p>
        </div>
        <div className="w-11" />
      </div>

      {/* 3 Large Difficulty Cards matching Screen 4 */}
      <div className="my-auto py-4 flex flex-col gap-4 w-full">
        {cards.map((card) => (
          <button
            key={card.id}
            id={`ai-diff-${card.id}`}
            onClick={() => {
              audio.playButton();
              onSelect(card.id);
            }}
            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-r ${card.bg} p-6 text-white shadow-2xl border-2 ${card.border} hover:scale-[1.02] active:scale-98 transition-all text-left flex items-center justify-between`}
          >
            {/* Top Gloss highlight */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-3xl pointer-events-none" />

            <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                {card.icon}
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black tracking-wide font-['Fredoka'] drop-shadow">
                  {card.label}
                </div>
                <div className="text-sm font-bold text-white/90 uppercase tracking-wider mt-0.5">
                  {card.sub}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="w-full pb-2 text-center text-xs text-slate-400 font-medium">
        Higher difficulties simulate realistic physics with tighter angle tolerances.
      </div>
    </div>
  );
};
