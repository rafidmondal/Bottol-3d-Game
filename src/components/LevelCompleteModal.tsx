import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, ArrowRight, Home, Coins } from 'lucide-react';
import { audio } from '../services/audio';

interface LevelCompleteModalProps {
  levelNumber: number;
  score: number;
  starsEarned: number;
  coinsEarned: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelNumber,
  score,
  starsEarned,
  coinsEarned,
  onNextLevel,
  onReplay,
  onHome,
}) => {
  useEffect(() => {
    audio.playWinFanfare();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Stars Display */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`p-2 rounded-2xl ${
                s <= starsEarned
                  ? 'bg-amber-500/20 border-2 border-amber-400 scale-110 shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800 border border-slate-700 opacity-40'
              }`}
            >
              <Star
                className={`w-8 h-8 ${
                  s <= starsEarned ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'
                }`}
              />
            </div>
          ))}
        </div>

        <h3 className="text-2xl font-black text-white tracking-wide font-['Fredoka'] mt-2">
          LEVEL {levelNumber} COMPLETE!
        </h3>

        {levelNumber === 20 ? (
          <div className="w-full my-2 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/60 shadow-lg">
            <div className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1">
              <span>🏆 CHAPTER 1 COMPLETED!</span>
            </div>
            <div className="text-[11px] font-bold text-yellow-200 mt-0.5">
              🎉 UNLIMITED ENDLESS MODE UNLOCKED!
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              Level 21+ infinite challenges are now unlocked in Page 2.
            </div>
          </div>
        ) : levelNumber > 20 ? (
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mt-0.5 flex items-center justify-center gap-1">
            <span>♾️ ENDLESS STAGE CONQUERED</span>
          </div>
        ) : (
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-0.5">
            STAGE CONQUERED
          </div>
        )}

        {/* Score & Coins Awarded Card */}
        <div className="w-full grid grid-cols-2 gap-3 my-4">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Score</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{score} PTS</div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40">
            <div className="text-[10px] uppercase font-bold text-amber-300">Reward</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5 flex items-center justify-center gap-1">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>+{coinsEarned}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            id="level-next-btn"
            onClick={() => {
              audio.playButton();
              onNextLevel();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-black text-lg tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 font-['Fredoka']"
          >
            <span>{levelNumber === 20 ? 'ENTER LEVEL 21 (ENDLESS)' : `NEXT LEVEL (${levelNumber + 1})`}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            id="level-replay-btn"
            onClick={() => {
              audio.playButton();
              onReplay();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm tracking-wider border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REPLAY LEVEL</span>
          </button>

          <button
            id="level-home-btn"
            onClick={() => {
              audio.playButton();
              onHome();
            }}
            className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold text-xs tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>RETURN TO MAP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
