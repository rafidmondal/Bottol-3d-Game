import React, { useState } from 'react';
import { Gamepad2, Trophy, ShoppingCart, Star, Sparkles, User, Infinity, BookOpen } from 'lucide-react';
import { Screen } from '../types';
import { audio } from '../services/audio';
import { isEndlessUnlocked, getMaxUnlockedLevel } from '../services/storage';
import { getUnclaimedDailyMissionsCount } from '../services/dailyMissions';
import { BottleFlipLogo } from './BottleFlipLogo';
import { PolicyButton, PolicyModal } from './PolicyModal';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [showPolicies, setShowPolicies] = useState(false);
  const endlessUnlocked = isEndlessUnlocked();
  const maxUnlocked = getMaxUnlockedLevel();
  const unclaimedMissions = getUnclaimedDailyMissionsCount();
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-2 sm:p-5 pointer-events-none select-none overflow-y-auto overflow-x-hidden">
      {/* 1. TOP LOGO SECTION */}
      <div className="w-full flex flex-col items-center mt-0.5 sm:mt-1 pointer-events-auto shrink-0">
        <BottleFlipLogo className="transform hover:scale-105 transition-transform cursor-pointer scale-90 sm:scale-100 origin-top" />
      </div>

      {/* 2. THREE MAIN 3D MODE CARDS (Responsive: sleek horizontal on mobile, tall 3D cards on desktop) */}
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 my-auto px-2 pointer-events-auto z-10 shrink-0">
        {/* CARD 1: FRIEND PLAY (Blue Glossy 3D Card) */}
        <button
          id="mode-card-friend"
          onClick={() => {
            audio.playButton();
            onNavigate('ROUND_SELECT');
          }}
          className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r sm:bg-gradient-to-b from-sky-500 via-blue-600 to-blue-800 px-4 py-3 sm:p-5 text-white shadow-xl sm:shadow-2xl shadow-blue-950/60 border-2 border-sky-300/80 hover:border-white transition-all hover:scale-[1.02] sm:hover:scale-[1.04] active:scale-95 flex flex-row sm:flex-col items-center justify-between min-h-[72px] sm:min-h-[175px]"
        >
          {/* Top Gloss Highlight Bevel */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-2xl sm:rounded-t-3xl pointer-events-none" />

          {/* VS Avatars 3D Icon */}
          <div className="relative z-10 flex items-center justify-center gap-1 sm:mt-1 shrink-0">
            {/* Blue Player */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-700 to-sky-400 border-2 border-white shadow-md flex items-center justify-center">
              <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            {/* VS Badge */}
            <span className="text-[10px] sm:text-xs font-black text-amber-300 drop-shadow-md font-['Fredoka']">
              VS
            </span>
            {/* Red Player */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-red-700 to-rose-400 border-2 border-white shadow-md flex items-center justify-center">
              <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>

          {/* Titles */}
          <div className="relative z-10 text-center sm:text-center px-2">
            <div className="text-xl sm:text-3xl font-black tracking-wide font-['Fredoka'] text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
              FRIEND PLAY
            </div>
            <div className="text-[10px] sm:text-xs font-bold tracking-wider text-sky-100 uppercase mt-0.5 drop-shadow">
              1 DEVICE • 1 VS 1
            </div>
          </div>

          {/* Mobile Right Chevron / Desktop Visual Spacer */}
          <div className="sm:hidden relative z-10 text-xs font-black text-sky-200 bg-white/20 px-2 py-1 rounded-xl">
            PLAY
          </div>
        </button>

        {/* CARD 2: AI PLAY (Green Glossy 3D Card) */}
        <button
          id="mode-card-ai"
          onClick={() => {
            audio.playButton();
            onNavigate('AI_DIFFICULTY');
          }}
          className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r sm:bg-gradient-to-b from-emerald-400 via-emerald-600 to-teal-800 px-4 py-3 sm:p-5 text-white shadow-xl sm:shadow-2xl shadow-emerald-950/60 border-2 border-emerald-300/80 hover:border-white transition-all hover:scale-[1.02] sm:hover:scale-[1.04] active:scale-95 flex flex-row sm:flex-col items-center justify-between min-h-[72px] sm:min-h-[175px]"
        >
          {/* Top Gloss Highlight Bevel */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-2xl sm:rounded-t-3xl pointer-events-none" />

          {/* Cute 3D Robot Head Icon */}
          <div className="relative z-10 w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-100 to-slate-300 border-2 border-white shadow-lg flex flex-col items-center justify-center sm:mt-1 group-hover:rotate-6 transition-transform shrink-0">
            <div className="w-1.5 h-1.5 sm:h-2 bg-slate-400 -mt-2.5 sm:-mt-3.5 rounded-full" />
            <div className="w-6 sm:w-8 h-2.5 sm:h-3.5 bg-slate-900 rounded-md flex items-center justify-around px-1">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#22d3ee]" />
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#22d3ee]" />
            </div>
          </div>

          {/* Titles */}
          <div className="relative z-10 text-center sm:text-center px-2">
            <div className="text-xl sm:text-3xl font-black tracking-wide font-['Fredoka'] text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
              AI PLAY
            </div>
            <div className="text-[10px] sm:text-xs font-bold tracking-wider text-emerald-100 uppercase mt-0.5 drop-shadow">
              PLAY AGAINST AI
            </div>
          </div>

          <div className="sm:hidden relative z-10 text-xs font-black text-emerald-200 bg-white/20 px-2 py-1 rounded-xl">
            PLAY
          </div>
        </button>

        {/* CARD 3: LEVEL MODE (Orange Glossy 3D Card) */}
        <button
          id="mode-card-levels"
          onClick={() => {
            audio.playButton();
            onNavigate('LEVELS_GRID');
          }}
          className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r sm:bg-gradient-to-b from-amber-400 via-amber-500 to-orange-700 px-4 py-3 sm:p-5 text-white shadow-xl sm:shadow-2xl shadow-amber-950/60 border-2 border-amber-300/80 hover:border-white transition-all hover:scale-[1.02] sm:hover:scale-[1.04] active:scale-95 flex flex-row sm:flex-col items-center justify-between min-h-[72px] sm:min-h-[175px]"
        >
          {/* Top Gloss Highlight Bevel */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-2xl sm:rounded-t-3xl pointer-events-none" />

          {/* 3D Toy Blocks with Red Flag Icon */}
          <div className="relative z-10 w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center sm:mt-1 group-hover:-translate-y-0.5 transition-transform shrink-0">
            <svg viewBox="0 0 64 64" className="w-9 h-9 sm:w-12 sm:h-12 drop-shadow-md" fill="none">
              <line x1="38" y1="6" x2="38" y2="28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M38 6 L54 12 L38 18 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
              <rect x="24" y="24" width="18" height="14" rx="3" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
              <rect x="12" y="36" width="20" height="15" rx="3" fill="#06B6D4" stroke="#164E63" strokeWidth="1.5" />
              <rect x="30" y="36" width="22" height="15" rx="3" fill="#10B981" stroke="#064E3B" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Titles */}
          <div className="relative z-10 text-center sm:text-center px-2">
            <div className="text-xl sm:text-3xl font-black tracking-wide font-['Fredoka'] text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
              LEVEL MODE
            </div>
            <div className="text-[10px] sm:text-xs font-bold tracking-wider text-amber-100 uppercase mt-0.5 drop-shadow flex items-center justify-center gap-1">
              {endlessUnlocked ? (
                <>
                  <Infinity className="w-3.5 h-3.5 text-amber-200" />
                  <span>ENDLESS (LVL {maxUnlocked})</span>
                </>
              ) : (
                <span>STAGE {maxUnlocked} / 20</span>
              )}
            </div>
          </div>

          <div className="sm:hidden relative z-10 text-xs font-black text-amber-200 bg-white/20 px-2 py-1 rounded-xl">
            PLAY
          </div>
        </button>
      </div>

      {/* 3. TABLE PLAYER BADGES (Distinct Blue and Red with bottle icons) */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-16 pointer-events-none z-10 my-1 shrink-0">
        {/* Left Badge: 🍾 PLAYER 1 (Blue Bottle) */}
        <div className="transform -skew-x-12 px-3 sm:px-6 py-1 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 rounded-xl border-2 border-sky-300 shadow-xl flex items-center gap-1.5 sm:gap-2">
          <span className="text-sm transform skew-x-12">🍾</span>
          <span className="text-[11px] sm:text-sm font-black text-white uppercase tracking-wider font-['Fredoka'] transform skew-x-12">
            PLAYER 1
          </span>
        </div>

        {/* Right Badge: 🍼 PLAYER 2 (Red Bottle) */}
        <div className="transform -skew-x-12 px-3 sm:px-6 py-1 bg-gradient-to-r from-red-700 via-rose-600 to-rose-500 rounded-xl border-2 border-rose-300 shadow-xl flex items-center gap-1.5 sm:gap-2">
          <span className="text-sm transform skew-x-12">🍼</span>
          <span className="text-[11px] sm:text-sm font-black text-white uppercase tracking-wider font-['Fredoka'] transform skew-x-12">
            PLAYER 2
          </span>
        </div>
      </div>

      {/* 4. BOTTOM FLOATING DOCK (Fully responsive 5-column grid, never clipped or hidden) */}
      <div className="w-full flex flex-col items-center pointer-events-auto z-20 pb-4 sm:pb-5 px-3 shrink-0">
        <div className="w-full max-w-lg grid grid-cols-5 gap-1 sm:gap-2 p-1.5 sm:p-2 bg-slate-950/90 border border-slate-700/80 rounded-2xl sm:rounded-full shadow-2xl backdrop-blur-md">
          {/* RULES / HOW TO PLAY */}
          <button
            id="pill-how-to-play"
            onClick={() => {
              audio.playButton();
              onNavigate('HOW_TO_PLAY');
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 sm:px-3 rounded-xl sm:rounded-full hover:bg-slate-800 text-slate-200 hover:text-white text-[10px] sm:text-xs font-black active:scale-95 transition-all font-['Fredoka']"
          >
            <Gamepad2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">RULES</span>
          </button>

          {/* LEADERBOARD / RANKS */}
          <button
            id="pill-leaderboard"
            onClick={() => {
              audio.playButton();
              onNavigate('LEADERBOARD');
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 sm:px-3 rounded-xl sm:rounded-full hover:bg-slate-800 text-slate-200 hover:text-white text-[10px] sm:text-xs font-black active:scale-95 transition-all font-['Fredoka']"
          >
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">RANKS</span>
          </button>

          {/* SKINS / SHOP (Premium Shop Button with Cart Icon) */}
          <button
            id="pill-skins"
            onClick={() => {
              audio.playButton();
              onNavigate('SKINS');
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 sm:px-3.5 rounded-xl sm:rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 hover:from-amber-500/35 hover:to-orange-500/35 border border-amber-400/40 text-amber-300 hover:text-white text-[10px] sm:text-xs font-black shadow-md shadow-amber-500/10 active:scale-95 transition-all font-['Fredoka']"
          >
            <ShoppingCart className="w-4 h-4 text-amber-400 shrink-0 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
            <span className="truncate tracking-wide font-black">SHOP</span>
          </button>

          {/* ACHIEVEMENTS / BADGES */}
          <button
            id="pill-achievements"
            onClick={() => {
              audio.playButton();
              onNavigate('ACHIEVEMENTS');
            }}
            className="relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 sm:px-3 rounded-xl sm:rounded-full hover:bg-slate-800 text-slate-200 hover:text-white text-[10px] sm:text-xs font-black active:scale-95 transition-all font-['Fredoka']"
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />
            <span className="truncate">BADGES</span>
            {unclaimedMissions > 0 && (
              <span className="absolute -top-1 -right-0.5 sm:top-0 sm:right-1 w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[9px] flex items-center justify-center animate-bounce shadow-md">
                {unclaimedMissions}
              </span>
            )}
          </button>

          {/* PRACTICE */}
          <button
            id="pill-practice"
            onClick={() => {
              audio.playButton();
              onNavigate('PRACTICE_MENU');
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 sm:px-3 rounded-xl sm:rounded-full bg-purple-900/70 hover:bg-purple-800 text-purple-200 hover:text-white text-[10px] sm:text-xs font-black active:scale-95 transition-all font-['Fredoka'] border border-purple-500/40"
          >
            <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
            <span className="truncate">PRACTICE</span>
          </button>
        </div>

        {/* 5. VERY BOTTOM "ABOUT / GAME DOCS" SMALL BOX & "ALL POLICIES" BUTTON (Requested: "about page box er left ba right a eta dau") */}
        <div className="mt-1.5 flex items-center justify-center gap-2 pointer-events-auto">
          <button
            id="btn-about-docs"
            onClick={() => {
              audio.playButton();
              onNavigate('ABOUT');
            }}
            className="group flex items-center gap-1.5 px-3 py-0.5 sm:py-1 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 hover:border-sky-500/50 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95 text-slate-400 hover:text-sky-300 pointer-events-auto"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase font-['Fredoka']">
              ABOUT GAME & DOCS
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
              v1.1
            </span>
          </button>

          {/* All Policies custom button provided by user */}
          <PolicyButton onClick={() => setShowPolicies(true)} />
        </div>
      </div>

      {/* Policies Modal iframe */}
      <PolicyModal isOpen={showPolicies} onClose={() => setShowPolicies(false)} />
    </div>
  );
};
