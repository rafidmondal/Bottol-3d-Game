import React from 'react';
import { Sparkles, Coins, Gift, Check, Flame } from 'lucide-react';
import { claimDailyReward } from '../services/storage';
import { audio } from '../services/audio';

interface DailyRewardModalProps {
  day: number;
  streak: number;
  onClaimed: (coinsEarned: number) => void;
  onClose: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  day,
  streak,
  onClaimed,
  onClose,
}) => {
  const days = [
    { day: 1, reward: 25 },
    { day: 2, reward: 50 },
    { day: 3, reward: 75 },
    { day: 4, reward: 100 },
    { day: 5, reward: 125 },
    { day: 6, reward: 125 },
    { day: 7, reward: 125 },
  ];

  const handleClaim = () => {
    audio.playButton();
    const result = claimDailyReward();
    audio.playCoin();
    onClaimed(result.reward);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center mb-3">
          <Gift className="w-9 h-9 text-slate-950" />
        </div>

        <h3 className="text-3xl font-black text-white tracking-wide font-['Fredoka']">
          DAILY REWARD!
        </h3>
        <p className="text-xs text-amber-200/90 font-bold mt-1 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
          <span>Day {day} Streak Bonus • Come back tomorrow for more!</span>
        </p>

        {/* 7 Days Preview Cards */}
        <div className="grid grid-cols-7 gap-1.5 w-full my-5">
          {days.map((d) => {
            const isToday = d.day === day;
            const isPast = d.day < day;

            return (
              <div
                key={d.day}
                className={`flex flex-col items-center justify-between py-2.5 px-1 rounded-xl border text-[10px] font-black ${
                  isToday
                    ? 'bg-amber-500 text-slate-950 border-white scale-110 shadow-lg'
                    : isPast
                    ? 'bg-slate-800/60 text-slate-400 border-slate-700'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800'
                }`}
              >
                <span>D{d.day}</span>
                <Coins className={`w-3.5 h-3.5 my-1 ${isToday ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{d.reward}</span>
              </div>
            );
          })}
        </div>

        {/* Claim Button */}
        <button
          id="claim-daily-reward-btn"
          onClick={handleClaim}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-lg tracking-wider shadow-xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 font-['Fredoka']"
        >
          <Sparkles className="w-5 h-5 text-slate-950" />
          <span>CLAIM +{days[Math.min(day - 1, 6)].reward} COINS</span>
        </button>

        <button
          onClick={onClose}
          className="mt-3 text-xs text-slate-400 hover:text-slate-200 font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
};
