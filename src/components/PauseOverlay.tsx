import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';
import { audio } from '../services/audio';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  onResume,
  onRestart,
  onHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h3 className="text-3xl font-black text-white tracking-widest font-['Fredoka'] mb-6">
          GAME PAUSED
        </h3>

        <div className="flex flex-col gap-3 w-full">
          <button
            id="pause-resume-btn"
            onClick={() => {
              audio.playButton();
              onResume();
            }}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 font-['Fredoka']"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>RESUME</span>
          </button>

          <button
            id="pause-restart-btn"
            onClick={() => {
              audio.playButton();
              onRestart();
            }}
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-black text-base tracking-wider border border-slate-700 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 font-['Fredoka']"
          >
            <RotateCcw className="w-5 h-5" />
            <span>RESTART</span>
          </button>

          <button
            id="pause-home-btn"
            onClick={() => {
              audio.playButton();
              onHome();
            }}
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-base tracking-wider border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 font-['Fredoka']"
          >
            <Home className="w-5 h-5" />
            <span>HOME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
