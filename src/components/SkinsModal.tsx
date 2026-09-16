import React, { useState } from 'react';
import { ArrowLeft, Coins, Star, Check, Lock, Sparkles } from 'lucide-react';
import { SkinItem } from '../types';
import { SKINS_BOTTLES, SKINS_CAPS, SKINS_TRAILS } from '../data/skinsData';
import {
  getCoins,
  getTotalStars,
  getSkinsState,
  spendCoins,
  saveSkinsState,
} from '../services/storage';
import { audio } from '../services/audio';

interface SkinsModalProps {
  onBack: () => void;
  onSkinEquipped?: (skinId: string, capId: string) => void;
}

export const SkinsModal: React.FC<SkinsModalProps> = ({ onBack, onSkinEquipped }) => {
  const [activeTab, setActiveTab] = useState<'bottles' | 'caps' | 'trails'>('bottles');
  const [coins, setCoins] = useState(getCoins());
  const [stars] = useState(getTotalStars());
  const [skinsState, setSkinsState] = useState(getSkinsState());
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const currentList: SkinItem[] =
    activeTab === 'bottles'
      ? SKINS_BOTTLES
      : activeTab === 'caps'
      ? SKINS_CAPS
      : SKINS_TRAILS;

  const showToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 2500);
  };

  const handleBuy = (item: SkinItem) => {
    audio.playButton();
    if (item.starsRequired > stars) {
      showToast(`Requires ${item.starsRequired} stars to unlock!`);
      return;
    }

    if (coins < item.cost) {
      showToast('Not enough coins!');
      audio.playFail();
      return;
    }

    const success = spendCoins(item.cost);
    if (success) {
      audio.playCoin();
      const updatedOwned = [...skinsState.owned, item.id];
      const updated = saveSkinsState({
        owned: updatedOwned,
        ...(item.category === 'bottles' ? { equippedBottle: item.id } : {}),
        ...(item.category === 'caps' ? { equippedCap: item.id } : {}),
        ...(item.category === 'trails' ? { equippedTrail: item.id } : {}),
      });
      setCoins(getCoins());
      setSkinsState(updated);
      onSkinEquipped?.(updated.equippedBottle, updated.equippedCap);
    }
  };

  const handleEquip = (item: SkinItem) => {
    audio.playButton();
    const updated = saveSkinsState({
      ...(item.category === 'bottles' ? { equippedBottle: item.id } : {}),
      ...(item.category === 'caps' ? { equippedCap: item.id } : {}),
      ...(item.category === 'trails' ? { equippedTrail: item.id } : {}),
    });
    setSkinsState(updated);
    onSkinEquipped?.(updated.equippedBottle, updated.equippedCap);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 max-w-2xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button
          id="skins-back-btn"
          onClick={() => {
            audio.playButton();
            onBack();
          }}
          className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 flex items-center justify-center text-white border border-slate-700 shadow-md active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-['Fredoka']">
          SKIN SHOP
        </h2>

        {/* Balances Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-black">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{coins}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 text-xs font-black">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span>{stars}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 mt-3 mb-1">
        {(['bottles', 'caps', 'trails'] as const).map((tab) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => {
              audio.playButton();
              setActiveTab(tab);
            }}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all font-['Fredoka'] ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Toast message if any */}
      {errorToast && (
        <div className="text-center text-xs font-bold text-rose-300 bg-rose-950/80 border border-rose-500/50 py-1.5 px-3 rounded-full mx-auto animate-bounce">
          {errorToast}
        </div>
      )}

      {/* Skins Grid (Scrollable) */}
      <div className="my-auto py-3 overflow-y-auto max-h-[60vh] pr-1 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {currentList.map((item) => {
            const isOwned = skinsState.owned.includes(item.id);
            const isEquipped =
              activeTab === 'bottles'
                ? skinsState.equippedBottle === item.id
                : activeTab === 'caps'
                ? skinsState.equippedCap === item.id
                : skinsState.equippedTrail === item.id;

            const isStarLocked = !isOwned && item.starsRequired > stars;

            return (
              <div
                key={item.id}
                id={`skin-card-${item.id}`}
                className={`relative flex flex-col justify-between p-3.5 rounded-2xl border-2 transition-all font-['Fredoka'] bg-slate-900/90 ${
                  isEquipped
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Visual Swatch / Bottle Preview */}
                <div className="w-full h-24 rounded-xl bg-slate-950/70 flex items-center justify-center relative overflow-hidden border border-slate-800/80">
                  <div
                    className="w-10 h-16 rounded-t-lg rounded-b-md shadow-lg border border-white/20 transition-transform group-hover:scale-110 flex items-center justify-center text-xs font-black text-white"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: item.emissive ? `0 0 15px ${item.emissive}` : undefined,
                    }}
                  >
                    {activeTab === 'caps' ? 'CAP' : activeTab === 'trails' ? '✨' : 'FLIP'}
                  </div>

                  {isEquipped && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black tracking-wider flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> EQUIPPED
                    </div>
                  )}

                  {isStarLocked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-2">
                      <Lock className="w-5 h-5 text-amber-400 mb-1" />
                      <span className="text-[10px] text-amber-300 font-extrabold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 inline" /> {item.starsRequired} Stars
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="mt-2.5">
                  <div className="text-sm font-black text-slate-100 truncate">{item.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {item.description}
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-3">
                  {isEquipped ? (
                    <button
                      disabled
                      className="w-full py-1.5 rounded-xl bg-slate-800 text-blue-400 text-xs font-black flex items-center justify-center gap-1 opacity-80"
                    >
                      <Check className="w-3.5 h-3.5" /> ACTIVE
                    </button>
                  ) : isOwned ? (
                    <button
                      id={`equip-btn-${item.id}`}
                      onClick={() => handleEquip(item)}
                      className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md active:scale-95 transition-all"
                    >
                      EQUIP
                    </button>
                  ) : (
                    <button
                      id={`buy-btn-${item.id}`}
                      onClick={() => handleBuy(item)}
                      disabled={isStarLocked}
                      className={`w-full py-1.5 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                        isStarLocked
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-white'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{item.cost} COINS</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 font-medium pb-2">
        <Sparkles className="w-3.5 h-3.5 inline text-pink-400 mr-1" />
        Cosmetic only: Every skin uses the exact same realistic physics parameters
      </div>
    </div>
  );
};
