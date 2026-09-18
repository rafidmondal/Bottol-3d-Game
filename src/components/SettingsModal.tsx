import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Music,
  Sliders,
  Sparkles,
  Eye,
  Hand,
  Trash2,
  Check,
} from 'lucide-react';
import { GameSettings } from '../types';
import { getSettings, saveSettings, resetAllData } from '../services/storage';
import { audio } from '../services/audio';

interface SettingsModalProps {
  onBack: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<GameSettings>(getSettings());
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    audio.playButton();
    const updated = saveSettings({ [key]: value });
    setSettings(updated);
    audio.updateVolumes();
    if (key === 'music') {
      if (value) audio.startMusic();
      else audio.stopMusic();
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1500);
  };

  const handleResetData = () => {
    audio.playFail();
    resetAllData();
    setShowConfirmReset(false);
    setSettings(getSettings());
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 max-w-xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button
          id="settings-back-btn"
          onClick={() => {
            audio.playButton();
            onBack();
          }}
          className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 flex items-center justify-center text-white border border-slate-700 shadow-md active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-['Fredoka']">
          SETTINGS
        </h2>

        <div className="w-10 flex items-center justify-end">
          {savedNotice && (
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-0.5 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Settings Sections (Scrollable) */}
      <div className="my-auto py-2 overflow-y-auto max-h-[66vh] pr-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 w-full">
        {/* Section 1: AUDIO */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-4 h-4" />
            <span>AUDIO</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200">Sound Effects</span>
            <button
              id="toggle-sound-fx"
              onClick={() => updateSetting('soundFx', !settings.soundFx)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.soundFx ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                  settings.soundFx ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200">Music</span>
            <button
              id="toggle-music"
              onClick={() => updateSetting('music', !settings.music)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.music ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                  settings.music ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
              <span>Master Volume</span>
              <span>{settings.volume}%</span>
            </div>
            <input
              id="slider-volume"
              type="range"
              min="0"
              max="100"
              value={settings.volume}
              onChange={(e) => updateSetting('volume', parseInt(e.target.value, 10))}
              className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>

        {/* Section 2: GAMEPLAY */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4" />
            <span>GAMEPLAY</span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
              <span>Throw Sensitivity</span>
              <span className="font-mono text-amber-400 font-bold">{settings.sensitivity}% {settings.sensitivity === 10 && '(Default)'}</span>
            </div>
            <input
              id="slider-sensitivity"
              type="range"
              min="5"
              max="100"
              step="5"
              value={settings.sensitivity}
              onChange={(e) => updateSetting('sensitivity', parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-200">Perfect Slow-Motion</div>
              <div className="text-[11px] text-slate-400">Cinematic slow replay on perfect flip</div>
            </div>
            <button
              id="toggle-slowmo"
              onClick={() => updateSetting('slowmo', !settings.slowmo)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.slowmo ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                  settings.slowmo ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section 3: VISUALS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>VISUALS</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200">Graphics Quality</span>
            <div className="flex items-center gap-1">
              {(['Low', 'Medium', 'High', 'Auto'] as const).map((q) => (
                <button
                  key={q}
                  id={`quality-${q}`}
                  onClick={() => updateSetting('quality', q)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    settings.quality === q
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200">Dynamic Shadows</span>
            <button
              id="toggle-shadows"
              onClick={() => updateSetting('shadows', !settings.shadows)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.shadows ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                  settings.shadows ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200">Particle Sparks</span>
            <button
              id="toggle-particles"
              onClick={() => updateSetting('particles', !settings.particles)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.particles ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                  settings.particles ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section 4: CONTROLS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hand className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-slate-200">Handedness</span>
          </div>
          <div className="flex items-center gap-1">
            {(['Right', 'Left'] as const).map((h) => (
              <button
                key={h}
                id={`handedness-${h}`}
                onClick={() => updateSetting('handedness', h)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  settings.handedness === h
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Section 5: DATA RESET */}
        <div className="bg-rose-950/40 border border-rose-900/60 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-rose-300">Reset All Progress</div>
              <div className="text-[11px] text-rose-400/80">
                Deletes all coins, stars, unlocks, and records.
              </div>
            </div>
            <button
              id="reset-progress-btn"
              onClick={() => setShowConfirmReset(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md active:scale-95 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> RESET
            </button>
          </div>

          {showConfirmReset && (
            <div className="mt-3 p-3 rounded-xl bg-rose-950 border border-rose-700 flex flex-col gap-2">
              <span className="text-xs font-bold text-rose-200">
                Are you sure? This action cannot be undone.
              </span>
              <div className="flex items-center gap-2 justify-end">
                <button
                  id="cancel-reset-btn"
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  id="confirm-reset-btn"
                  onClick={handleResetData}
                  className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 font-medium pb-1">
        All settings apply live immediately
      </div>
    </div>
  );
};
