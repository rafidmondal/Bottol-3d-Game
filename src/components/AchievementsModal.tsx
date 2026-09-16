import React, { useState } from 'react';
import { ArrowLeft, Trophy, Star, Check, Coins, Sparkles } from 'lucide-react';
import { ACHIEVEMENTS_LIST } from '../data/achievementsData';
import { getAchievementsState, claimAchievement, getCoins } from '../services/storage';
import { audio } from '../services/audio';

interface AchievementsModalProps {
  onBack: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onBack }) => {
  const [achievementsState, setAchievementsState] = useState(getAchievementsState());
  const [coins, setCoins] = useState(getCoins());
  const [claimToast, setClaimToast] = useState<string | null>(null);

  // Compute summary stats
  let unlockedCount = 0;
  let totalRewardCoinsEarned = 0;

  ACHIEVEMENTS_LIST.forEach((def) => {
    const item = achievementsState[def.id];
    const isCompleted = item && item.progress >= def.target;
    if (isCompleted) unlockedCount += 1;
    if (item && item.claimed) totalRewardCoinsEarned += def.reward;
  });

  const handleClaim = (id: string, reward: number, name: string) => {
    audio.playButton();
    const success = claimAchievement(id, reward);
    if (success) {
      audio.playCoin();
      setAchievementsState(getAchievementsState());
      setCoins(getCoins());
      setClaimToast(`Claimed +${reward} coins for "${name}"!`);
      setTimeout(() => setClaimToast(null), 3000);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 max-w-2xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button
          id="achievements-back-btn"
          onClick={() => {
            audio.playButton();
            onBack();
          }}
          className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 flex items-center justify-center text-white border border-slate-700 shadow-md active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-['Fredoka'] flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <span>ACHIEVEMENTS</span>
        </h2>

        {/* Coins display */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/80 border border-amber-500/50 rounded-full text-amber-300 font-extrabold text-xs">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>{coins}</span>
        </div>
      </div>

      {/* Summary Card */}
      <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border border-amber-500/40 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Progression Status
          </div>
          <div className="text-xl font-black text-white font-['Fredoka'] mt-0.5">
            {unlockedCount} / {ACHIEVEMENTS_LIST.length} Unlocked
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Total Rewards</div>
          <div className="text-base font-extrabold text-amber-400 font-mono">
            +{totalRewardCoinsEarned} Coins
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {claimToast && (
        <div className="text-center text-xs font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-500/50 py-1.5 px-3 rounded-full mx-auto my-1 animate-bounce">
          {claimToast}
        </div>
      )}

      {/* Achievements List (Scrollable) */}
      <div className="my-auto py-2.5 overflow-y-auto max-h-[58vh] pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 w-full">
        {ACHIEVEMENTS_LIST.map((ach) => {
          const item = achievementsState[ach.id] || { progress: 0, claimed: false };
          const progress = Math.min(item.progress, ach.target);
          const isCompleted = progress >= ach.target;
          const isClaimed = item.claimed;
          const pct = Math.round((progress / ach.target) * 100);

          return (
            <div
              key={ach.id}
              id={`ach-card-${ach.id}`}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                isClaimed
                  ? 'bg-slate-900/60 border-slate-800 opacity-75'
                  : isCompleted
                  ? 'bg-gradient-to-r from-amber-950/70 to-slate-900 border-amber-400/80 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    isClaimed
                      ? 'bg-slate-800 text-slate-400'
                      : isCompleted
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isClaimed ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Star className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="text-sm font-black text-white font-['Fredoka'] flex items-center gap-2">
                    <span>{ach.name}</span>
                    {ach.reward > 0 && (
                      <span className="text-[10px] text-amber-300 font-extrabold px-1.5 py-0.5 rounded-md bg-amber-950 border border-amber-500/30">
                        +{ach.reward} Coins
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{ach.desc}</div>

                  {/* Progress bar if not claimed */}
                  {!isClaimed && (
                    <div className="w-36 sm:w-48 h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-amber-400' : 'bg-blue-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isClaimed ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                    <Check className="w-3.5 h-3.5" /> CLAIMED
                  </span>
                ) : isCompleted ? (
                  <button
                    id={`claim-btn-${ach.id}`}
                    onClick={() => handleClaim(ach.id, ach.reward, ach.name)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-1.5 animate-pulse"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> CLAIM
                  </button>
                ) : (
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    {progress} / {ach.target}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-slate-400 font-medium pb-2">
        Complete accomplishments to earn rewards and unlock legendary cosmetics
      </div>
    </div>
  );
};
