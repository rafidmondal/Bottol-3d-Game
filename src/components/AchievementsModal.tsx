import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Trophy,
  Star,
  Check,
  Coins,
  Sparkles,
  Calendar,
  Clock,
  Flame,
  Target,
  Zap,
  Bot,
  Layers,
  Dumbbell,
  ShieldCheck,
  Gift,
} from 'lucide-react';
import { ACHIEVEMENTS_LIST } from '../data/achievementsData';
import {
  getAchievementsState,
  claimAchievement,
  getCoins,
} from '../services/storage';
import {
  getDailyMissionsState,
  claimDailyMission,
  claimDailyAllBonus,
  subscribeDailyMissions,
  getTimeUntilNextDailyReset,
  DailyMission,
  DailyMissionsState,
} from '../services/dailyMissions';
import { audio } from '../services/audio';

interface AchievementsModalProps {
  onBack: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'badges'>('daily');
  const [dailyState, setDailyState] = useState<DailyMissionsState>(getDailyMissionsState());
  const [achievementsState, setAchievementsState] = useState(getAchievementsState());
  const [coins, setCoins] = useState(getCoins());
  const [claimToast, setClaimToast] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextDailyReset());

  // Subscribe to updates (flips in game automatically update missions)
  useEffect(() => {
    const unsub = subscribeDailyMissions(() => {
      setDailyState(getDailyMissionsState());
      setCoins(getCoins());
    });
    return unsub;
  }, []);

  // Timer countdown to midnight reset
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilNextDailyReset());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute lifetime achievements stats
  let unlockedCount = 0;
  let totalRewardCoinsEarned = 0;
  ACHIEVEMENTS_LIST.forEach((def) => {
    const item = achievementsState[def.id];
    const isCompleted = item && item.progress >= def.target;
    if (isCompleted) unlockedCount += 1;
    if (item && item.claimed) totalRewardCoinsEarned += def.reward;
  });

  // Daily stats
  const completedDailyCount = dailyState.missions.filter((m) => m.completed).length;
  const totalDailyMissions = dailyState.missions.length;
  const allDailyCompleted = totalDailyMissions > 0 && completedDailyCount === totalDailyMissions;
  const unclaimedDailyCount = dailyState.missions.filter((m) => m.completed && !m.claimed).length;

  const handleClaimAchievement = (id: string, reward: number, name: string) => {
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

  const handleClaimDailyMission = (mission: DailyMission) => {
    audio.playButton();
    const success = claimDailyMission(mission.id);
    if (success) {
      audio.playCoin();
      setDailyState(getDailyMissionsState());
      setCoins(getCoins());
      setClaimToast(`+${mission.rewardCoins} Coins Claimed!`);
      setTimeout(() => setClaimToast(null), 3000);
    }
  };

  const handleClaimDailyBonus = () => {
    audio.playButton();
    const success = claimDailyAllBonus();
    if (success) {
      audio.playPerfect();
      setTimeout(() => audio.playCoin(), 150);
      setDailyState(getDailyMissionsState());
      setCoins(getCoins());
      setClaimToast(`Daily Master Bonus Claimed: +${dailyState.bonusCoins} Coins!`);
      setTimeout(() => setClaimToast(null), 3500);
    }
  };

  const renderMissionIcon = (iconName: DailyMission['iconName']) => {
    switch (iconName) {
      case 'perfect':
        return <Target className="w-5 h-5 text-amber-400" />;
      case 'double':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'ai':
        return <Bot className="w-5 h-5 text-purple-400" />;
      case 'level':
        return <Layers className="w-5 h-5 text-emerald-400" />;
      case 'practice':
        return <Dumbbell className="w-5 h-5 text-rose-400" />;
      case 'edge':
        return <ShieldCheck className="w-5 h-5 text-yellow-300" />;
      case 'throw':
        return <Flame className="w-5 h-5 text-orange-400" />;
      default:
        return <Star className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-4 max-w-2xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full shrink-0">
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

        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Fredoka'] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span>BADGES & MISSIONS</span>
          </h2>
        </div>

        {/* Coins display */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/80 border border-amber-500/50 rounded-full text-amber-300 font-extrabold text-xs">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>{coins}</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="mt-2.5 flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-2xl shrink-0">
        <button
          id="tab-daily-missions"
          onClick={() => {
            audio.playButton();
            setActiveTab('daily');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all font-['Fredoka'] ${
            activeTab === 'daily'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className={`w-4 h-4 ${activeTab === 'daily' ? 'text-slate-950' : 'text-orange-400'}`} />
          <span>DAILY MISSIONS</span>
          {unclaimedDailyCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-black rounded-full animate-bounce">
              {unclaimedDailyCount}
            </span>
          )}
        </button>

        <button
          id="tab-lifetime-badges"
          onClick={() => {
            audio.playButton();
            setActiveTab('badges');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all font-['Fredoka'] ${
            activeTab === 'badges'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Star className={`w-4 h-4 ${activeTab === 'badges' ? 'text-yellow-300 fill-yellow-300' : 'text-slate-400'}`} />
          <span>LIFETIME BADGES</span>
        </button>
      </div>

      {/* Toast Alert */}
      {claimToast && (
        <div className="text-center text-xs font-bold text-amber-300 bg-amber-950/95 border border-amber-500/60 py-1.5 px-3 rounded-full mx-auto my-1 shadow-lg shadow-amber-500/20 animate-bounce z-20">
          {claimToast}
        </div>
      )}

      {/* TAB CONTENT */}
      {activeTab === 'daily' ? (
        <div className="flex-1 flex flex-col justify-between overflow-hidden my-2">
          {/* Daily Timer & Progress Bar Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-orange-950/60 border border-amber-500/40 shadow-lg shrink-0 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-amber-200 uppercase tracking-wide">
                  Today's Quest Board
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-700/60">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>
                  Resets in {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold font-['Fredoka']">
                Missions Done: {completedDailyCount} / {totalDailyMissions}
              </span>
              <span className="text-[11px] text-amber-400 font-extrabold">
                Auto-Refreshes Daily at Midnight
              </span>
            </div>

            <div className="w-full h-2 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                style={{ width: `${(completedDailyCount / totalDailyMissions) * 100}%` }}
              />
            </div>
          </div>

          {/* Daily Missions List (Scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {dailyState.missions.map((mission) => {
              const progress = Math.min(mission.progress, mission.target);
              const pct = Math.round((progress / mission.target) * 100);

              return (
                <div
                  key={mission.id}
                  id={`daily-mission-${mission.id}`}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    mission.claimed
                      ? 'bg-slate-900/50 border-slate-800/80 opacity-75'
                      : mission.completed
                      ? 'bg-gradient-to-r from-amber-950/80 to-slate-900 border-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        mission.claimed
                          ? 'bg-slate-800 text-slate-400'
                          : mission.completed
                          ? 'bg-amber-500/20 border border-amber-400 text-amber-300 shadow-sm'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {mission.claimed ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        renderMissionIcon(mission.iconName)
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white font-['Fredoka']">
                          {mission.title}
                        </span>
                        <span className="text-[10px] font-extrabold text-amber-300 bg-amber-950/90 border border-amber-500/40 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Coins className="w-2.5 h-2.5 text-amber-400" />+{mission.rewardCoins}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{mission.description}</div>

                      {/* Progress Bar */}
                      {!mission.claimed && (
                        <div className="w-36 sm:w-48 h-1.5 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              mission.completed ? 'bg-amber-400' : 'bg-sky-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Claim Action */}
                  <div className="shrink-0 ml-2">
                    {mission.claimed ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/50 border border-emerald-500/30">
                        <Check className="w-3.5 h-3.5" /> CLAIMED
                      </span>
                    ) : mission.completed ? (
                      <button
                        onClick={() => handleClaimDailyMission(mission)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-1.5 animate-pulse"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> CLAIM
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        {progress} / {mission.target}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daily All-Complete Super Bonus Card */}
          <div className="mt-2 p-3 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-yellow-950/60 border border-yellow-500/40 flex items-center justify-between shrink-0 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-amber-300 font-['Fredoka'] flex items-center gap-1.5">
                  <span>DAILY MASTER BONUS</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-black text-[10px]">
                    +{dailyState.bonusCoins} COINS
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Complete all 4 missions today to unlock the grand reward!
                </div>
              </div>
            </div>

            <div>
              {dailyState.allCompletedBonusClaimed ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-950/50 border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5" /> BONUS CLAIMED
                </span>
              ) : allDailyCompleted ? (
                <button
                  onClick={handleClaimDailyBonus}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-1.5 animate-bounce"
                >
                  <Sparkles className="w-3.5 h-3.5" /> CLAIM +{dailyState.bonusCoins}
                </button>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800">
                  {completedDailyCount} / {totalDailyMissions} Completed
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TAB: LIFETIME BADGES */
        <div className="flex-1 flex flex-col justify-between overflow-hidden my-2">
          {/* Summary Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-500/40 flex items-center justify-between shrink-0 mb-2">
            <div>
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                Lifetime Progression
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

          {/* Achievements List (Scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
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
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isClaimed
                      ? 'bg-slate-900/60 border-slate-800 opacity-75'
                      : isCompleted
                      ? 'bg-gradient-to-r from-amber-950/70 to-slate-900 border-amber-400/80 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
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
                        <div className="w-36 sm:w-48 h-1.5 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
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
                  <div className="shrink-0 ml-2">
                    {isClaimed ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                        <Check className="w-3.5 h-3.5" /> CLAIMED
                      </span>
                    ) : isCompleted ? (
                      <button
                        id={`claim-btn-${ach.id}`}
                        onClick={() => handleClaimAchievement(ach.id, ach.reward, ach.name)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-1.5 animate-pulse"
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
        </div>
      )}

      {/* Footer hint */}
      <div className="text-center text-xs text-slate-400 font-medium pt-1 shrink-0">
        New random daily missions appear every day — complete them all for massive coin rewards!
      </div>
    </div>
  );
};
