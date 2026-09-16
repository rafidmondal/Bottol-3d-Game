import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, Star, Sparkles } from 'lucide-react';
import { getLevels, getTotalStars, isEndlessUnlocked, getMaxUnlockedLevel } from '../services/storage';
import { audio } from '../services/audio';

interface LevelsGridScreenProps {
  onBack: () => void;
  onSelectLevel: (levelNum: number) => void;
}

const LEVELS_PER_PAGE = 20;

export const LevelsGridScreen: React.FC<LevelsGridScreenProps> = ({
  onBack,
  onSelectLevel,
}) => {
  const levels = getLevels();
  const totalStars = getTotalStars();
  const endlessUnlocked = isEndlessUnlocked();
  const maxUnlocked = getMaxUnlockedLevel();

  // Start on the page containing the player's highest unlocked level
  const initialPage = Math.max(1, Math.ceil(maxUnlocked / LEVELS_PER_PAGE));
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Maximum page user can navigate to: at least 1 page ahead of highest unlocked
  const maxViewablePage = Math.max(
    currentPage + 1,
    Math.ceil((maxUnlocked + LEVELS_PER_PAGE) / LEVELS_PER_PAGE)
  );

  const startLevel = (currentPage - 1) * LEVELS_PER_PAGE + 1;
  const endLevel = currentPage * LEVELS_PER_PAGE;

  // Generate 20 level items for current page
  const pageLevelItems = [];
  for (let i = startLevel; i <= endLevel; i++) {
    const isLevelUnlocked =
      i === 1 || (levels[i]?.unlocked ?? false);
    const data = levels[i] || {
      level: i,
      bestScore: 0,
      stars: 0,
      unlocked: isLevelUnlocked,
    };
    pageLevelItems.push(data);
  }

  const isCurrentLevelOnThisPage =
    maxUnlocked >= startLevel && maxUnlocked <= endLevel;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-5 max-w-2xl mx-auto select-none">
      {/* 1. TOP HEADER */}
      <div className="flex items-center justify-between w-full shrink-0">
        <button
          id="levels-back-btn"
          onClick={() => {
            audio.playButton();
            onBack();
          }}
          className="w-11 h-11 rounded-2xl bg-slate-900/85 hover:bg-slate-800 flex items-center justify-center text-white border border-slate-700 shadow-lg active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-['Fredoka'] drop-shadow">
            LEVELS
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-amber-300 mt-0.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{totalStars} Total Stars Earned</span>
          </div>
        </div>

        <div className="w-11" />
      </div>

      {/* 2. PAGINATION CONTROLS (< >) */}
      <div className="w-full flex flex-col items-center gap-1.5 mt-2 mb-1 shrink-0">
        <div className="flex items-center justify-between w-full max-w-md px-2">
          {/* Previous Page Button (<) */}
          <button
            id="levels-prev-page-btn"
            disabled={currentPage <= 1}
            onClick={() => {
              if (currentPage > 1) {
                audio.playButton();
                setCurrentPage((p) => p - 1);
              }
            }}
            className={`flex items-center justify-center w-10 h-10 rounded-2xl border transition-all active:scale-95 ${
              currentPage <= 1
                ? 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-white cursor-pointer shadow-md hover:border-slate-500'
            }`}
            title="Previous 20 Levels"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Page Title & Chapter Badge */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-white font-['Fredoka'] tracking-wide">
                PAGE {currentPage}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-300">
                (Levels {startLevel}–{endLevel})
              </span>
            </div>

            {/* Stage Category Indicator */}
            {currentPage === 1 ? (
              <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-widest mt-0.5">
                HAND-AUTHORED CAMPAIGN (1–20)
              </span>
            ) : (
              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>UNLIMITED ENDLESS STAGES</span>
              </div>
            )}
          </div>

          {/* Next Page Button (>) */}
          <button
            id="levels-next-page-btn"
            disabled={currentPage >= maxViewablePage}
            onClick={() => {
              if (currentPage < maxViewablePage) {
                audio.playButton();
                setCurrentPage((p) => p + 1);
              }
            }}
            className={`flex items-center justify-center w-10 h-10 rounded-2xl border transition-all active:scale-95 ${
              currentPage >= maxViewablePage
                ? 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-white cursor-pointer shadow-md hover:border-slate-500'
            }`}
            title="Next 20 Levels"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Quick jump to current active level if player browsed elsewhere */}
        {!isCurrentLevelOnThisPage && (
          <button
            id="levels-jump-current-btn"
            onClick={() => {
              audio.playButton();
              setCurrentPage(Math.max(1, Math.ceil(maxUnlocked / LEVELS_PER_PAGE)));
            }}
            className="text-[11px] font-bold text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Jump to current progress (Level {maxUnlocked})
          </button>
        )}

        {/* Locked Endless Mode Notice on Page 2+ */}
        {currentPage >= 2 && !endlessUnlocked && (
          <div className="w-full max-w-md py-1 px-3 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-300 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Complete Level 20 to unlock Endless Levels 21+!</span>
          </div>
        )}
      </div>

      {/* 3. 20 LEVELS GRID (4 Columns x 5 Rows matching design) */}
      <div className="my-auto py-2 overflow-y-auto max-h-[64vh] pr-1 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          {pageLevelItems.map((item) => {
            const isUnlocked = item.unlocked;
            return (
              <button
                key={item.level}
                id={`level-card-${item.level}`}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    audio.playButton();
                    onSelectLevel(item.level);
                  }
                }}
                className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 transition-all font-['Fredoka'] aspect-square shadow-xl ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-emerald-400 to-emerald-700 border-white text-white hover:scale-105 active:scale-95 cursor-pointer shadow-emerald-950/50'
                    : 'bg-slate-900/90 border-slate-700/80 text-slate-400 cursor-not-allowed opacity-80'
                }`}
              >
                {/* Level Number */}
                <span className="text-2xl sm:text-3xl font-black mb-0.5 drop-shadow">
                  {item.level}
                </span>

                {/* Stars or Lock Icon */}
                {isUnlocked ? (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= (item.stars || 3)
                            ? 'text-yellow-300 fill-yellow-300 drop-shadow'
                            : 'text-emerald-900 fill-emerald-900'
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  <Lock className="w-5 h-5 text-slate-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FOOTER NOTE */}
      <div className="w-full pt-1 pb-1 text-center text-xs text-slate-400 font-medium shrink-0">
        {currentPage === 1
          ? 'Conquer all 20 handcrafted levels to unlock endless procedural progression.'
          : 'Infinite level loop: Each stage dynamically scales in difficulty until you stop!'}
      </div>
    </div>
  );
};
