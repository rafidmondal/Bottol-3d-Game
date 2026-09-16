import React, { useState } from 'react';
import { ArrowLeft, Play, Plus, Minus } from 'lucide-react';
import { audio } from '../services/audio';

interface RoundSelectScreenProps {
  title?: string;
  subtitle?: string;
  onBack: () => void;
  onStart: (rounds: number) => void;
  themeColor?: 'blue' | 'emerald';
}

export const RoundSelectScreen: React.FC<RoundSelectScreenProps> = ({
  title = 'CHOOSE ROUNDS',
  subtitle = 'Select how many rounds you want to battle',
  onBack,
  onStart,
  themeColor = 'blue',
}) => {
  const PRESETS = [1, 2, 3, 4, 5, 6, 10];
  const [selectedRounds, setSelectedRounds] = useState<number>(5);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customVal, setCustomVal] = useState<number>(7);

  const handlePresetSelect = (r: number) => {
    audio.playButton();
    setIsCustom(false);
    setSelectedRounds(r);
  };

  const handleCustomToggle = () => {
    audio.playButton();
    setIsCustom(true);
    setSelectedRounds(customVal);
  };

  const adjustCustom = (delta: number) => {
    audio.playButton();
    const next = Math.max(1, Math.min(999, customVal + delta));
    setCustomVal(next);
    setSelectedRounds(next);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (isNaN(parsed)) {
      setCustomVal(1);
      setSelectedRounds(1);
    } else {
      const clamped = Math.max(1, Math.min(999, parsed));
      setCustomVal(clamped);
      setSelectedRounds(clamped);
    }
  };

  const handlePlay = () => {
    audio.playButton();
    onStart(selectedRounds);
  };

  const activeGrad =
    themeColor === 'emerald'
      ? 'from-emerald-500 via-teal-600 to-emerald-800'
      : 'from-sky-500 via-blue-600 to-indigo-800';

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-6 max-w-xl mx-auto select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full">
        <button
          id="round-select-back-btn"
          onClick={() => {
            audio.playButton();
            onBack();
          }}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900/85 hover:bg-slate-800 flex items-center justify-center text-white border border-slate-700 shadow-lg active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-wide font-['Fredoka'] drop-shadow">
            {title}
          </h2>
          <p className="text-[11px] sm:text-sm font-semibold text-slate-300 mt-0.5">
            {subtitle}
          </p>
        </div>
        <div className="w-10 sm:w-11" />
      </div>

      {/* Preset Numbers Grid (Row 1: 1, 2, 3, 4 | Row 2: 5, 6, 10, CUSTOM) */}
      <div className="my-auto py-2 sm:py-4 flex flex-col items-center gap-3 sm:gap-4 w-full">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full">
          {PRESETS.map((rounds) => {
            const isSelected = !isCustom && selectedRounds === rounds;
            return (
              <button
                key={rounds}
                id={`round-card-${rounds}`}
                onClick={() => handlePresetSelect(rounds)}
                className={`flex flex-col items-center justify-center py-3.5 sm:py-5 rounded-2xl border-2 transition-all font-['Fredoka'] ${
                  isSelected
                    ? `bg-gradient-to-b ${activeGrad} border-white text-white scale-105 shadow-2xl shadow-blue-500/50`
                    : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <span className="text-2xl sm:text-4xl font-black">{rounds}</span>
                <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider opacity-85 mt-0.5">
                  {rounds === 1 ? 'Round' : 'Rounds'}
                </span>
              </button>
            );
          })}

          {/* CUSTOM pill / card */}
          <button
            id="round-card-custom"
            onClick={handleCustomToggle}
            className={`flex flex-col items-center justify-center py-3.5 sm:py-5 rounded-2xl border-2 transition-all font-['Fredoka'] ${
              isCustom
                ? `bg-gradient-to-b ${activeGrad} border-white text-white scale-105 shadow-2xl shadow-blue-500/50`
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <span className="text-lg sm:text-xl font-black tracking-wider">CUSTOM</span>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 mt-0.5">
              ANY
            </span>
          </button>
        </div>

        {/* Custom Stepper Drawer (Typing + Buttons with No 20 Limit!) */}
        {isCustom && (
          <div className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col items-center gap-3 animate-fade-in">
            <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">
              Type or tap round count:
            </span>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                id="custom-stepper-minus"
                onClick={() => adjustCustom(-1)}
                disabled={customVal <= 1}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center font-bold text-xl border border-slate-600 active:scale-95 shadow-md"
              >
                <Minus className="w-5 h-5" />
              </button>

              {/* Directly editable input number field */}
              <input
                id="custom-round-input"
                type="number"
                min={1}
                max={999}
                value={customVal}
                onChange={handleCustomInputChange}
                className="w-24 sm:w-28 text-center text-3xl sm:text-4xl font-black text-white font-['Fredoka'] bg-slate-950 border-2 border-slate-600 focus:border-sky-400 rounded-2xl py-1.5 outline-none shadow-inner"
              />

              <button
                id="custom-stepper-plus"
                onClick={() => adjustCustom(1)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-xl border border-slate-600 active:scale-95 shadow-md"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Increment Pill Buttons (+5, +10, +25) */}
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => adjustCustom(5)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-sky-300 active:scale-95"
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => adjustCustom(10)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-sky-300 active:scale-95"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => adjustCustom(25)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-sky-300 active:scale-95"
              >
                +25
              </button>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Type any number or tap + / - to set rounds</span>
          </div>
        )}
      </div>

      {/* Big Bright Play Button */}
      <div className="w-full pb-2">
        <button
          id="start-match-btn"
          onClick={handlePlay}
          className="w-full py-3.5 sm:py-5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 hover:brightness-110 text-white font-black text-xl sm:text-2xl tracking-wider shadow-2xl flex items-center justify-center gap-2.5 active:scale-98 transition-all font-['Fredoka'] border border-sky-300/40"
        >
          <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
          <span>PLAY ({selectedRounds} {selectedRounds === 1 ? 'ROUND' : 'ROUNDS'})</span>
        </button>
      </div>
    </div>
  );
};
