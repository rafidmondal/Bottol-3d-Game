import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { audio } from '../services/audio';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('bottleflip_pwa_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (isInstalled || isDismissed) {
    return null;
  }

  // Only show if browser supports install prompt or is iOS
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    audio.playButton();
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    audio.playButton();
    setIsDismissed(true);
    sessionStorage.setItem('bottleflip_pwa_banner_dismissed', 'true');
  };

  return (
    <>
      {/* Top Floating PWA Install Banner */}
      <div className="w-full max-w-lg mx-auto px-3 pt-2 z-40 animate-in slide-in-from-top-4 duration-300">
        <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-slate-900/95 via-indigo-950/90 to-slate-900/95 border border-amber-400/40 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white font-['Fredoka'] tracking-wide truncate">
                  Install Bottle Flip 3D
                </span>
                <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                  Offline Ready
                </span>
              </div>
              <p className="text-[10px] text-slate-300 truncate">
                Add to home screen for fullscreen offline play!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="pwa-install-top-btn"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs font-['Fredoka'] shadow-md active:scale-95 transition-all flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>INSTALL</span>
            </button>
            <button
              id="pwa-dismiss-btn"
              onClick={handleDismiss}
              title="Dismiss"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guided Install Dialog */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-400/50 p-5 shadow-2xl text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white font-['Fredoka']">
                Install on iOS Safari
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Install Bottle Flip 3D on your iPhone/iPad in 2 quick taps:
              </p>
            </div>

            <div className="w-full space-y-2.5 text-left text-xs text-slate-200">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <span>1. Tap the <strong>Share</strong> button in Safari toolbar.</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="w-7 h-7 rounded-lg bg-amber-600/30 text-amber-400 flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>2. Scroll down and tap <strong>Add to Home Screen</strong>.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm font-['Fredoka'] shadow-lg active:scale-95"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
