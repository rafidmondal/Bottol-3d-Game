import React, { useState } from 'react';
import { ArrowLeft, User, Check, Edit2, Coins, Star, Trophy, Sparkles, Shirt } from 'lucide-react';
import { getProfile, saveProfile, getStats, getCoins, getTotalStars, getSkinsState } from '../services/storage';
import { audio } from '../services/audio';

interface ProfileModalProps {
  onBack: () => void;
  onNavigateToSkins: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onBack, onNavigateToSkins }) => {
  const [profile, setProfile] = useState(getProfile());
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);

  const stats = getStats();
  const coins = getCoins();
  const stars = getTotalStars();
  const skins = getSkinsState();

  const AVATAR_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#64748B', // Slate
  ];

  const handleSaveName = () => {
    const trimmed = nameInput.trim().slice(0, 12) || 'Player';
    audio.playButton();
    const updated = saveProfile({ name: trimmed });
    setProfile(updated);
    setIsEditingName(false);
  };

  const handleSelectColor = (color: string) => {
    audio.playButton();
    const updated = saveProfile({ avatarColor: color });
    setProfile(updated);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 max-w-xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button
          id="profile-back-btn"
          onClick={() => {
            audio.playButton();
            onBack();
          }}
          className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 flex items-center justify-center text-white border border-slate-700 shadow-md active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-['Fredoka']">
          PLAYER PROFILE
        </h2>

        <div className="w-10" />
      </div>

      {/* Main Profile Info & Avatar */}
      <div className="my-auto py-2 flex flex-col items-center gap-5 w-full">
        {/* Avatar Ring */}
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white/30"
            style={{ backgroundColor: profile.avatarColor }}
          >
            <User className="w-12 h-12" />
          </div>
        </div>

        {/* Color Palette Picker */}
        <div className="flex items-center gap-2">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              id={`color-picker-${color}`}
              onClick={() => handleSelectColor(color)}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                profile.avatarColor === color
                  ? 'border-white scale-125 shadow-lg'
                  : 'border-transparent hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Editable Name */}
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                id="name-edit-input"
                type="text"
                maxLength={12}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                className="px-4 py-1.5 rounded-xl bg-slate-800 border border-blue-400 text-white font-black text-xl font-['Fredoka'] focus:outline-none"
              />
              <button
                id="name-save-btn"
                onClick={handleSaveName}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white active:scale-95"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white font-['Fredoka']">
                {profile.name}
              </span>
              <button
                id="name-edit-btn"
                onClick={() => setIsEditingName(true)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Career Stats Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 w-full mt-2">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Flips</div>
            <div className="text-xl font-black text-white font-mono mt-1">
              {stats.totalFlips}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-400">Perfects</div>
            <div className="text-xl font-black text-amber-300 font-mono mt-1">
              {stats.perfects}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-400">Total Wins</div>
            <div className="text-xl font-black text-emerald-300 font-mono mt-1">
              {stats.winsFriend + stats.winsAi}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-yellow-400">Coins</div>
            <div className="text-xl font-black text-yellow-300 font-mono mt-1">
              {coins}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center col-span-3 sm:col-span-1">
            <div className="text-[10px] uppercase font-bold text-indigo-400">Stars</div>
            <div className="text-xl font-black text-indigo-300 font-mono mt-1">
              {stars}
            </div>
          </div>
        </div>

        {/* Equipped Skin Preview + Shortcut */}
        <div className="w-full p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-black">
              🍾
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold">Current Bottle Skin</div>
              <div className="text-sm font-black text-white capitalize">
                {skins.equippedBottle.replace('-', ' ')}
              </div>
            </div>
          </div>
          <button
            id="profile-skins-shortcut-btn"
            onClick={() => {
              audio.playButton();
              onNavigateToSkins();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>CHANGE SKIN</span>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 font-medium pb-1">
        Profile customizations reflect in matches and leaderboards
      </div>
    </div>
  );
};
