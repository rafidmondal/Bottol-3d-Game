import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Check,
  Edit2,
  Tv,
  Camera,
  Trash2,
  Sparkles,
  Lock,
  ShoppingCart,
  X,
} from 'lucide-react';
import {
  getProfile,
  saveProfile,
  getStats,
  getCoins,
  getTotalStars,
  getSkinsState,
  isPhotoCustomizationUnlocked,
  unlockPhotoCustomization,
  getRenameCredits,
  addRenameCredit,
  consumeRenameCredit,
} from '../services/storage';
import { audio } from '../services/audio';
import { triggerDirectAd } from '../services/adService';

interface ProfileModalProps {
  onBack: () => void;
  onNavigateToSkins: () => void;
}

// Compresses user selected image for ultra-fast local storage
function compressImageToBase64(file: File, maxDim = 256, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onBack, onNavigateToSkins }) => {
  const [profile, setProfile] = useState(getProfile());
  const [isPhotoUnlocked, setIsPhotoUnlocked] = useState(isPhotoCustomizationUnlocked());
  const [renameCredits, setRenameCredits] = useState(getRenameCredits());
  const [isEditingName, setIsEditingName] = useState(() => {
    return getRenameCredits() > 0 && localStorage.getItem('bottleflip_is_renaming') === 'true';
  });
  const [nameInput, setNameInput] = useState(profile.name);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state when window regains focus (e.g. user returns from ad tab)
  useEffect(() => {
    const handleFocus = () => {
      setIsPhotoUnlocked(isPhotoCustomizationUnlocked());
      const credits = getRenameCredits();
      setRenameCredits(credits);
      if (credits > 0 && localStorage.getItem('bottleflip_is_renaming') === 'true') {
        setIsEditingName(true);
      }
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

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

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleRequestNameUnlock = () => {
    audio.playButton();
    const currentCredits = getRenameCredits();

    if (currentCredits === 0) {
      // 1. Grant 1 rename credit immediately in localStorage
      const newCredits = addRenameCredit();
      setRenameCredits(newCredits);
      localStorage.setItem('bottleflip_is_renaming', 'true');

      // 2. Open ad in new window/tab
      triggerDirectAd();

      // 3. Immediately enable editing so when user is here or returns, they can type their name
      setIsEditingName(true);
      setNameInput(profile.name);
      showToast('1 Rename Credit unlocked! Enter your new name below.');
    } else {
      // Already has rename credit - directly edit without watching ad again!
      localStorage.setItem('bottleflip_is_renaming', 'true');
      setIsEditingName(true);
      setNameInput(profile.name);
      showToast(`You have ${currentCredits} rename credit available.`);
    }
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim().slice(0, 12) || 'Player';
    audio.playButton();

    // 1. Save profile name
    const updated = saveProfile({ name: trimmed });
    setProfile(updated);

    // 2. Consume exactly 1 credit for this rename
    consumeRenameCredit();
    setRenameCredits(getRenameCredits());
    localStorage.removeItem('bottleflip_is_renaming');

    setIsEditingName(false);
    showToast(`Name successfully changed to ${trimmed}!`);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    localStorage.removeItem('bottleflip_is_renaming');
  };

  // Direct file picker trigger
  const handleOpenGallery = () => {
    audio.playButton();
    fileInputRef.current?.click();
  };

  // Unlock with Ad + open file picker
  const handleRequestPhotoUnlock = () => {
    audio.playButton();
    if (isPhotoUnlocked) {
      // Already unlocked in localStorage - directly open gallery!
      fileInputRef.current?.click();
      return;
    }
    // 1. Record unlock in localStorage so it remembers the ad was triggered
    unlockPhotoCustomization();
    setIsPhotoUnlocked(true);
    // 2. Open Ad in new tab
    triggerDirectAd();
    showToast('Photo upload unlocked! Pick your image.');
    // 3. Immediately attempt file picker open
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      const base64 = await compressImageToBase64(file);
      audio.playCoin();
      const updated = saveProfile({ photoBase64: base64 });
      setProfile(updated);
      showToast('Profile picture updated successfully!');
    } catch (err) {
      console.error(err);
      showToast('Could not load image. Please try again.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    audio.playButton();
    const updated = saveProfile({ photoBase64: undefined });
    setProfile(updated);
    showToast('Custom photo removed.');
  };

  const handleSelectColor = (color: string) => {
    audio.playButton();
    const updated = saveProfile({ avatarColor: color });
    setProfile(updated);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 max-w-xl mx-auto select-none">
      {/* Hidden File Input for Gallery Photo Selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-full shadow-2xl flex items-center gap-1.5 animate-in fade-in duration-200">
          <Check className="w-3.5 h-3.5" />
          <span>{notification}</span>
        </div>
      )}

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
      <div className="my-auto py-2 flex flex-col items-center gap-4 w-full">
        {/* Avatar Ring & Custom Picture */}
        <div className="relative group">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white/30 overflow-hidden relative"
            style={{ backgroundColor: profile.avatarColor }}
          >
            {profile.photoBase64 ? (
              <img
                src={profile.photoBase64}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white/90" />
            )}
          </div>

          {/* Quick Photo Upload Button (Direct gallery if unlocked or unlock with Ad) */}
          <button
            id="avatar-upload-btn"
            title={isPhotoUnlocked ? 'Choose Profile Picture from Gallery' : 'Unlock Photo DP (Ad)'}
            onClick={isPhotoUnlocked ? handleOpenGallery : handleRequestPhotoUnlock}
            className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-slate-900 hover:brightness-110 active:scale-90 transition-all"
          >
            <Camera className="w-4 h-4 text-slate-950" />
          </button>
        </div>

        {/* Profile Picture Action Controls */}
        <div className="flex items-center gap-2">
          {isPhotoUnlocked ? (
            <button
              id="unlock-dp-btn"
              onClick={handleOpenGallery}
              className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-black border border-emerald-500/40 flex items-center gap-1.5 active:scale-95 transition-all shadow-md font-['Fredoka']"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>{profile.photoBase64 ? 'Change Photo (Gallery)' : 'Upload Photo (Gallery)'}</span>
              <span className="text-[9px] bg-emerald-400/25 text-emerald-300 px-1 py-0.5 rounded font-black">Unlocked ✓</span>
            </button>
          ) : (
            <button
              id="unlock-dp-btn"
              onClick={handleRequestPhotoUnlock}
              className="px-3.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-black border border-amber-500/40 flex items-center gap-1.5 active:scale-95 transition-all shadow-md font-['Fredoka']"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{profile.photoBase64 ? 'Change DP (Watch Ad)' : 'Add Photo DP (Watch Ad)'}</span>
            </button>
          )}

          {profile.photoBase64 && (
            <button
              id="remove-dp-btn"
              title="Remove Custom Photo"
              onClick={handleRemovePhoto}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 border border-slate-700 active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Color Palette Picker for Avatar Background */}
        <div className="flex items-center gap-2 mt-0.5">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              id={`color-picker-${color}`}
              onClick={() => handleSelectColor(color)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                profile.avatarColor === color
                  ? 'border-white scale-125 shadow-lg'
                  : 'border-transparent hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Name Customization Section (Requires 1 Ad per change) */}
        <div className="flex flex-col items-center gap-2 mt-1">
          {isEditingName ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <input
                  id="name-edit-input"
                  type="text"
                  maxLength={12}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  placeholder="Enter new name"
                  className="px-4 py-1.5 rounded-xl bg-slate-800 border-2 border-amber-400 text-white font-black text-xl font-['Fredoka'] focus:outline-none"
                />
                <button
                  id="name-save-btn"
                  onClick={handleSaveName}
                  title="Save Name (Uses 1 rename credit)"
                  className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black active:scale-95 shadow-md flex items-center justify-center"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  id="name-cancel-btn"
                  onClick={handleCancelEdit}
                  title="Cancel"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-black active:scale-95 border border-slate-700 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <span className="text-[11px] text-amber-300 font-bold">
                1 rename credit active • Click ✓ to save
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white font-['Fredoka']">
                  {profile.name}
                </span>
                <button
                  id="name-edit-quick-btn"
                  onClick={handleRequestNameUnlock}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 active:scale-95"
                  title={renameCredits > 0 ? "Edit Name (1 Credit Available)" : "Watch 1 Ad to Rename"}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Unlock / Edit Name Button */}
              {renameCredits === 0 ? (
                <button
                  id="unlock-name-customize-btn"
                  onClick={handleRequestNameUnlock}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 border border-amber-300 flex items-center gap-1.5 active:scale-95 transition-all font-['Fredoka']"
                >
                  <Tv className="w-3.5 h-3.5 text-slate-950" />
                  <span>Change Name (Watch 1 Ad)</span>
                </button>
              ) : (
                <button
                  id="unlock-name-customize-btn"
                  onClick={handleRequestNameUnlock}
                  className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-black text-xs border border-emerald-500/40 flex items-center gap-1.5 active:scale-95 transition-all font-['Fredoka']"
                >
                  <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Edit Name ({renameCredits} Rename Available)</span>
                </button>
              )}
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
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
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 flex items-center gap-1.5 font-['Fredoka']"
          >
            <ShoppingCart className="w-3.5 h-3.5 fill-slate-950" />
            <span>SKIN SHOP</span>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 font-medium pb-1">
        Profile customizations reflect in matches and leaderboards
      </div>
    </div>
  );
};
