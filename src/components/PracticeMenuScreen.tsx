import React from 'react';
import { ArrowLeft, Infinity, Target, Box, Clock } from 'lucide-react';
import { PracticeSubMode } from '../types';
import { getPracticeStats } from '../services/storage';
import { audio } from '../services/audio';

interface PracticeMenuScreenProps {
  onBack: () => void;
  onSelectSubMode: (subMode: PracticeSubMode) => void;
}

export const PracticeMenuScreen: React.FC<PracticeMenuScreenProps> = ({
  onBack,
  onSelectSubMode,
}) => {
  const stats = getPracticeStats();

  const options: {
    id: PracticeSubMode;
    title: string;
    sub: string;
    icon: React.ReactNode;
    bg: string;
    badge?: string;
  }[] = [
    {
      id: 'free',
      title: 'FREE PLAY',
      sub: 'Practice without any target',
      icon: <Infinity className="w-8 h-8 text-sky-300" />,
      bg: 'from-slate-900 via-slate-800 to-slate-950',
    },
    {
      id: 'target',
      title: 'TARGET PRACTICE',
      sub: 'Hit specific spots',
      icon: <Target className="w-8 h-8 text-emerald-300" />,
      bg: 'from-slate-900 via-slate-800 to-slate-950',
      badge: stats.targetBest > 0 ? `Best: ${stats.targetBest} pts` : undefined,
    },
    {
      id: 'obstacle',
      title: 'OBSTACLE MODE',
      sub: 'Flip on different objects',
      icon: <Box className="w-8 h-8 text-amber-300" />,
      bg: 'from-slate-900 via-slate-800 to-slate-950',
    },
    {
      id: 'time',
      title: 'TIME CHALLENGE',
      sub: 'How many in 1 minute?',
      icon: <Clock className="w-8 h-8 text-rose-300" />,
      bg: 'from-slate-900 via-slate-800 to-slate-950',
      badge: stats.timeBest > 0 ? `Best: ${stats.timeBest}` : undefined,
    },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 max-w-xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full">
        <button
          id="practice-back-btn"
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
            PRACTICE
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-0.5">
            No limits. Just flip.
          </p>
        </div>
        <div className="w-11" />
      </div>

      {/* 4 Practice Options matching Screen 8 */}
      <div className="my-auto py-3 flex flex-col gap-3.5 w-full">
        {options.map((opt) => (
          <button
            key={opt.id}
            id={`practice-opt-${opt.id}`}
            onClick={() => {
              audio.playButton();
              onSelectSubMode(opt.id);
            }}
            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-r ${opt.bg} p-5 text-white shadow-xl border-2 border-slate-700/80 hover:border-sky-400 hover:scale-[1.02] active:scale-98 transition-all text-left flex items-center justify-between`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                {opt.icon}
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black tracking-wide font-['Fredoka'] group-hover:text-sky-300 transition-colors">
                  {opt.title}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
                  {opt.sub}
                </div>
              </div>
            </div>

            {opt.badge && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs">
                {opt.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="w-full pb-2 text-center text-xs text-slate-400 font-medium">
        Train your rotation control and landing consistency.
      </div>
    </div>
  );
};
