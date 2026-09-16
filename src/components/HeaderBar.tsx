import React, { useEffect, useState } from 'react';
import { Settings, BarChart2, Trophy, Maximize2, User } from 'lucide-react';
import { getProfile, subscribeStorage } from '../services/storage';
import { audio } from '../services/audio';

interface HeaderBarProps {
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  showQuickActions?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenProfile,
  onOpenSettings,
  showQuickActions = true,
}) => {
  const [profile, setProfile] = useState(getProfile());
  const [, setIsFullscreen] = useState(false);

  useEffect(() => {
    const unsub = subscribeStorage(() => {
      setProfile(getProfile());
    });
    return unsub;
  }, []);

  const toggleFullscreen = () => {
    audio.playButton();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 pointer-events-auto z-20 select-none">
      {/* Top Left: Profile Card (Player / Welcome Back!) */}
      <button
        id="profile-card-btn"
        onClick={() => {
          audio.playButton();
          onOpenProfile();
        }}
        className="flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-900/90 text-white rounded-full border border-slate-700/60 shadow-xl backdrop-blur-md transition-all active:scale-95 group"
      >
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner border-2 border-white/20 overflow-hidden shrink-0"
          style={{ backgroundColor: profile.avatarColor || '#EF4444' }}
        >
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="text-left pr-1 sm:pr-2">
          <div className="text-xs sm:text-sm font-extrabold tracking-wide text-slate-100 flex items-center gap-1.5 font-['Fredoka']">
            <span>{profile.name || 'Player'}</span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-400">Welcome Back!</div>
        </div>
      </button>

      {/* Top Right: Clean action buttons (Settings + Fullscreen, No Duplicates!) */}
      {showQuickActions && (
        <div className="flex items-center gap-2">
          <button
            id="settings-btn"
            title="Settings"
            onClick={() => {
              audio.playButton();
              onOpenSettings();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-slate-700/70 shadow-lg backdrop-blur-md active:scale-95 transition-all"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
          </button>
          <button
            id="fullscreen-btn"
            title="Toggle Fullscreen"
            onClick={toggleFullscreen}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-slate-700/70 shadow-lg backdrop-blur-md active:scale-95 transition-all"
          >
            <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
          </button>
        </div>
      )}
    </header>
  );
};
