import React from 'react';
import { ArrowLeft, Gamepad2, RotateCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { audio } from '../services/audio';

interface HowToPlayModalProps {
  onBack: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onBack }) => {
  const steps = [
    {
      num: 1,
      title: 'Press & Hold',
      desc: 'Touch or click near the base of the bottle to grab it.',
    },
    {
      num: 2,
      title: 'Aim & Power',
      desc: 'Drag upward. Flick distance and speed determine launch impulse.',
    },
    {
      num: 3,
      title: 'Spin & Rotation',
      desc: 'Crisp upward release imparts angular spin velocity. Curve the flick for precision spin.',
    },
    {
      num: 4,
      title: 'Rotation Rule (Mandatory)',
      desc: 'The bottle MUST complete full 360° rotation(s). Insufficient spin will tip over on contact!',
    },
    {
      num: 5,
      title: 'Stick the Landing',
      desc: 'Wait for the bottle to settle completely to register your points and coin rewards.',
    },
  ];

  const scoringRules = [
    { name: 'Normal Upright', pts: '+1 Pt', desc: 'Clean vertical landing on table' },
    { name: 'Perfect Upright', pts: '+2 Pts', desc: 'Dead center with minimal wobble' },
    { name: 'Edge Balance', pts: '+3 Pts', desc: 'Perched on the extreme rim of the surface' },
    { name: 'Double Rotation', pts: '+3 Pts', desc: 'Completed two full 360° airborne flips' },
    { name: 'Triple Rotation', pts: '+5 Pts', desc: 'Completed three breathtaking flips' },
    { name: 'Bounce to Upright', pts: '+3 Pts', desc: 'Rebounded off the wood and stuck upright' },
    { name: 'Side / Cap Down', pts: '0 Pts', desc: 'Under-rotated or knocked off balance' },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 max-w-xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button
          id="how-to-play-back-btn"
          onClick={() => {
            audio.playButton();
            onBack();
          }}
          className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 flex items-center justify-center text-white border border-slate-700 shadow-md active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-['Fredoka'] flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-sky-400" />
          <span>HOW TO PLAY</span>
        </h2>

        <div className="w-10" />
      </div>

      {/* Content Scrollable */}
      <div className="my-auto py-2 overflow-y-auto max-h-[66vh] pr-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 w-full">
        {/* Animated Gesture Diagram */}
        <div className="w-full bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="w-16 h-20 relative flex flex-col items-center justify-center my-2">
            <span className="text-4xl animate-bounce">🍾</span>
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-sky-400 animate-spin absolute -top-1" />
          </div>
          <div className="text-sm font-black text-sky-300 font-['Fredoka']">
            SWIPE UPWARD & FLICK WITH SPEED
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-sm">
            Drag upward fast to achieve sufficient spin. Insufficient rotation can never land upright!
          </p>
        </div>

        {/* Step-by-Step Guide */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
            CORE CONTROLS & RULES
          </div>

          {steps.map((s) => (
            <div key={s.num} className="flex items-start gap-3 text-left">
              <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                {s.num}
              </span>
              <div>
                <div className="text-xs font-extrabold text-white">{s.title}</div>
                <div className="text-[11px] text-slate-400 leading-snug">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Scoring Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="text-xs font-black text-amber-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>SCORING & REWARDS TABLE</span>
            <span>POINTS</span>
          </div>

          {scoringRules.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 border-b border-slate-800/80 last:border-none"
            >
              <div>
                <div className="text-xs font-bold text-slate-200">{rule.name}</div>
                <div className="text-[10px] text-slate-400">{rule.desc}</div>
              </div>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-md font-mono ${
                  rule.pts.includes('0')
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {rule.pts}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 font-medium pb-1">
        Physics dictates every landing — practice makes a pro!
      </div>
    </div>
  );
};
