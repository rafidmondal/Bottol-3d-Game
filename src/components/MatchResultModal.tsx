import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { audio } from '../services/audio';

interface MatchResultModalProps {
  mode: 'friend' | 'ai';
  p1Score: number;
  p2Score: number;
  rounds: number;
  winner: 'p1' | 'p2' | 'tie';
  onPlayAgain: () => void;
  onHome: () => void;
  onSuddenFlip?: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  mode,
  p1Score,
  p2Score,
  winner,
  onPlayAgain,
  onHome,
}) => {
  useEffect(() => {
    audio.playWinFanfare();
    if (winner !== 'tie') {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.55 },
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [winner]);

  let winnerText = "IT'S A TIE!";
  let winnerBadgeBg = 'from-purple-600 to-indigo-700';

  if (mode === 'friend') {
    if (winner === 'p1') {
      winnerText = 'PLAYER 1 WINS!';
      winnerBadgeBg = 'from-sky-500 via-blue-600 to-indigo-700';
    } else if (winner === 'p2') {
      winnerText = 'PLAYER 2 WINS!';
      winnerBadgeBg = 'from-rose-500 via-red-600 to-rose-800';
    }
  } else {
    // AI Mode
    if (winner === 'p1') {
      winnerText = 'YOU WIN!';
      winnerBadgeBg = 'from-emerald-500 via-teal-600 to-emerald-800';
    } else if (winner === 'p2') {
      winnerText = 'AI WINS!';
      winnerBadgeBg = 'from-rose-500 via-red-600 to-rose-800';
    }
  }

  const p1Display = p1Score < 10 ? `0${p1Score}` : `${p1Score}`;
  const p2Display = p2Score < 10 ? `0${p2Score}` : `${p2Score}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Golden Trophy Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 shadow-2xl shadow-amber-500/40 flex items-center justify-center mb-3">
          <Trophy className="w-12 h-12 text-slate-950" />
        </div>

        {/* Heading */}
        <h3 className="text-2xl font-black text-slate-300 tracking-widest font-['Fredoka'] uppercase drop-shadow">
          MATCH RESULT
        </h3>

        {/* Winner Banner */}
        <div
          className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r ${winnerBadgeBg} my-3 shadow-xl border-2 border-white/30`}
        >
          <div className="text-3xl sm:text-4xl font-black text-white font-['Fredoka'] tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
            {winnerText}
          </div>
        </div>

        {/* Score Board: Final Score 06 : 04 (matching Screen 10) */}
        <div className="w-full flex flex-col items-center justify-center py-4 px-6 bg-slate-950/80 rounded-2xl border border-slate-800 my-3">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
            Final Score
          </span>
          <div className="flex items-center gap-4 text-4xl sm:text-5xl font-black font-['Fredoka']">
            <span className="text-blue-400">{p1Display}</span>
            <span className="text-slate-600">:</span>
            <span className="text-rose-400">{p2Display}</span>
          </div>
        </div>

        {/* Buttons: PLAY AGAIN (Blue), HOME (Dark) */}
        <div className="w-full flex flex-col gap-3 mt-3">
          <button
            id="modal-play-again-btn"
            onClick={() => {
              audio.playButton();
              onPlayAgain();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 hover:brightness-110 text-white font-black text-xl tracking-wider shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all font-['Fredoka'] border border-sky-300/40"
          >
            <RotateCcw className="w-6 h-6" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            id="modal-home-btn"
            onClick={() => {
              audio.playButton();
              onHome();
            }}
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-black text-lg tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all font-['Fredoka'] border border-slate-600"
          >
            <Home className="w-5 h-5" />
            <span>HOME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
