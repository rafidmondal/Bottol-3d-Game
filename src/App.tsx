import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Screen, AiDifficulty, PracticeSubMode } from './types';
import { HeaderBar } from './components/HeaderBar';
import { HomeScreen } from './components/HomeScreen';
import { RoundSelectScreen } from './components/RoundSelectScreen';
import { AiDifficultyScreen } from './components/AiDifficultyScreen';
import { LevelsGridScreen } from './components/LevelsGridScreen';
import { PracticeMenuScreen } from './components/PracticeMenuScreen';
import { SkinsModal } from './components/SkinsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { AchievementsModal } from './components/AchievementsModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AboutModal } from './components/AboutModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { GameCanvas } from './components/GameCanvas';
import { SceneBuilder } from './game/sceneBuilder';
import { getDailyRewardState, getSkinsState, getSettings } from './services/storage';
import { audio } from './services/audio';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');

  // Match configs
  const [friendRounds, setFriendRounds] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('medium');
  const [aiRounds, setAiRounds] = useState(5);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [practiceSubMode, setPracticeSubMode] = useState<PracticeSubMode>('free');

  // Daily reward modal
  const [dailyRewardModal, setDailyRewardModal] = useState<{
    show: boolean;
    day: number;
    streak: number;
  }>({ show: false, day: 1, streak: 0 });

  // Home 3D interactive ambient canvas
  const homeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const homeSceneBuilderRef = useRef<SceneBuilder | null>(null);
  const homeBottleP1Ref = useRef<THREE.Group | null>(null);
  const homeBottleP2Ref = useRef<THREE.Group | null>(null);

  // Check Daily Reward on initial mount
  useEffect(() => {
    const daily = getDailyRewardState();
    if (daily.canClaim) {
      setDailyRewardModal({
        show: true,
        day: daily.currentDay,
        streak: daily.streak,
      });
    }
  }, []);

  // Keyboard shortcuts: ESC -> Pause/Back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (currentScreen !== 'HOME' && !currentScreen.includes('GAME')) {
          audio.playButton();
          setCurrentScreen('HOME');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen]);

  // Background 3D Home Scene Renderer
  const isMenuScreen =
    currentScreen === 'HOME' ||
    currentScreen === 'ROUND_SELECT' ||
    currentScreen === 'AI_DIFFICULTY' ||
    currentScreen === 'AI_ROUND_SELECT' ||
    currentScreen === 'LEVELS_GRID' ||
    currentScreen === 'PRACTICE_MENU' ||
    currentScreen === 'SKINS' ||
    currentScreen === 'LEADERBOARD' ||
    currentScreen === 'ACHIEVEMENTS' ||
    currentScreen === 'SETTINGS' ||
    currentScreen === 'PROFILE' ||
    currentScreen === 'HOW_TO_PLAY' ||
    currentScreen === 'ABOUT';

  const [homeCanvasKey, setHomeCanvasKey] = useState(0);

  useEffect(() => {
    if (!isMenuScreen) {
      if (homeSceneBuilderRef.current) {
        homeSceneBuilderRef.current.dispose();
        homeSceneBuilderRef.current = null;
      }
      return;
    }
    const canvas = homeCanvasRef.current;
    if (!canvas) return;

    let sb: SceneBuilder | null = null;
    try {
      sb = new SceneBuilder(canvas);
      homeSceneBuilderRef.current = sb;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[App] Home 3D scene initialization skipped (fallback to background gradient):', msg);
      return;
    }

    // Create Home 3D Bottles: P1 (blue/equipped) on left, P2 (red) on right
    try {
      const skins = getSkinsState();
      const p1Bottle = sb.createBottleMesh(skins.equippedBottle, skins.equippedCap, {
        bodyTint: '#e0f2fe',
        capColor: '#2563eb',
        liquidColor: '#0284c7',
        labelText: 'P1 FLIP',
      });
      p1Bottle.position.set(-0.56, 0.14, 1.05);
      sb.scene.add(p1Bottle);
      homeBottleP1Ref.current = p1Bottle;

      const p2Bottle = sb.createBottleMesh('red', 'capRed', {
        bodyTint: '#ffe4e6',
        capColor: '#e11d48',
        liquidColor: '#e11d48',
        labelText: 'P2 FLIP',
      });
      p2Bottle.position.set(0.56, 0.14, 1.05);
      sb.scene.add(p2Bottle);
      homeBottleP2Ref.current = p2Bottle;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[App] Error creating home preview bottles:', msg);
    }

    const handleResize = () => {
      if (canvas.parentElement && sb) {
        sb.resize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    let animId: number;
    let time = 0;

    const loop = () => {
      animId = requestAnimationFrame(loop);
      time += 0.015;

      if (!sb) return;

      // Subtle breathing spin on the table surface
      if (homeBottleP1Ref.current) {
        homeBottleP1Ref.current.position.y = 0.14;
        homeBottleP1Ref.current.rotation.y = Math.sin(time * 0.4) * 0.08;
      }
      if (homeBottleP2Ref.current) {
        homeBottleP2Ref.current.position.y = 0.14;
        homeBottleP2Ref.current.rotation.y = -Math.cos(time * 0.4) * 0.08;
      }

      sb.camera.position.x = Math.sin(time * 0.15) * 0.08;
      sb.camera.lookAt(0, 0.55, 1.45);

      try {
        sb.renderer.render(sb.scene, sb.camera);
      } catch (renderErr) {
        const msg = renderErr instanceof Error ? renderErr.message : String(renderErr);
        console.warn('[App] Home renderer frame error:', msg);
        cancelAnimationFrame(animId);
      }
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (sb) {
        sb.dispose();
        homeSceneBuilderRef.current = null;
      }
    };
  }, [isMenuScreen, homeCanvasKey]);

  // Handle skin equip live update in Home preview
  const handleSkinEquipped = (bottleId: string, capId: string) => {
    if (homeSceneBuilderRef.current && homeBottleP1Ref.current) {
      homeSceneBuilderRef.current.scene.remove(homeBottleP1Ref.current);
      const newMesh = homeSceneBuilderRef.current.createBottleMesh(bottleId, capId);
      newMesh.position.set(-0.42, 0.23, 0.8);
      homeSceneBuilderRef.current.scene.add(newMesh);
      homeBottleP1Ref.current = newMesh;
    }
  };

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-slate-950 font-['Outfit'] text-slate-100 flex flex-col justify-between select-none">
      {/* BACKGROUND 3D CANVAS (Visible during menus) */}
      {isMenuScreen && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <canvas key={homeCanvasKey} ref={homeCanvasRef} className="w-full h-full block" />
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none" />
        </div>
      )}

      {/* TOP HEADER BAR (Shown in menus) */}
      {isMenuScreen && (
        <HeaderBar
          onOpenProfile={() => setCurrentScreen('PROFILE')}
          onOpenSettings={() => setCurrentScreen('SETTINGS')}
        />
      )}

      {/* MAIN SCREEN ROUTER */}
      <main className="relative flex-1 w-full h-full z-10 flex flex-col justify-center items-center overflow-hidden">
        {/* SCREEN 1: HOME SCREEN */}
        {currentScreen === 'HOME' && <HomeScreen onNavigate={(s) => setCurrentScreen(s)} />}

        {/* MODE 1: FRIEND PLAY - Round Select */}
        {currentScreen === 'ROUND_SELECT' && (
          <RoundSelectScreen
            title="FRIEND PLAY"
            subtitle="1 Device • 1 VS 1 Rounds"
            themeColor="blue"
            onBack={() => setCurrentScreen('HOME')}
            onStart={(r) => {
              setFriendRounds(r);
              setCurrentScreen('FRIEND_GAME');
            }}
          />
        )}

        {/* MODE 1: FRIEND PLAY - Gameplay */}
        {currentScreen === 'FRIEND_GAME' && (
          <GameCanvas
            mode="friend"
            totalRounds={friendRounds}
            onNavigateHome={() => setCurrentScreen('HOME')}
            onNavigateLevelsGrid={() => setCurrentScreen('LEVELS_GRID')}
          />
        )}

        {/* MODE 2: AI PLAY - Difficulty Select */}
        {currentScreen === 'AI_DIFFICULTY' && (
          <AiDifficultyScreen
            onBack={() => setCurrentScreen('HOME')}
            onSelect={(diff) => {
              setAiDifficulty(diff);
              setCurrentScreen('AI_ROUND_SELECT');
            }}
          />
        )}

        {/* MODE 2: AI PLAY - Round Select */}
        {currentScreen === 'AI_ROUND_SELECT' && (
          <RoundSelectScreen
            title="AI BATTLE"
            subtitle={`Playing against ${aiDifficulty.toUpperCase()} AI`}
            themeColor="emerald"
            onBack={() => setCurrentScreen('AI_DIFFICULTY')}
            onStart={(r) => {
              setAiRounds(r);
              setCurrentScreen('AI_GAME');
            }}
          />
        )}

        {/* MODE 2: AI PLAY - Gameplay */}
        {currentScreen === 'AI_GAME' && (
          <GameCanvas
            mode="ai"
            aiDifficulty={aiDifficulty}
            totalRounds={aiRounds}
            onNavigateHome={() => setCurrentScreen('HOME')}
            onNavigateLevelsGrid={() => setCurrentScreen('LEVELS_GRID')}
          />
        )}

        {/* MODE 3: LEVEL MODE - Levels Grid */}
        {currentScreen === 'LEVELS_GRID' && (
          <LevelsGridScreen
            onBack={() => setCurrentScreen('HOME')}
            onSelectLevel={(lvl) => {
              setSelectedLevel(lvl);
              setCurrentScreen('LEVEL_GAME');
            }}
          />
        )}

        {/* MODE 3: LEVEL MODE - Level Gameplay */}
        {currentScreen === 'LEVEL_GAME' && (
          <GameCanvas
            mode="level"
            levelNumber={selectedLevel}
            onNavigateHome={() => setCurrentScreen('HOME')}
            onNavigateLevelsGrid={() => setCurrentScreen('LEVELS_GRID')}
          />
        )}

        {/* MODE 4: PRACTICE MODE - Menu */}
        {currentScreen === 'PRACTICE_MENU' && (
          <PracticeMenuScreen
            onBack={() => setCurrentScreen('HOME')}
            onSelectSubMode={(sub) => {
              setPracticeSubMode(sub);
              setCurrentScreen('PRACTICE_GAME');
            }}
          />
        )}

        {/* MODE 4: PRACTICE MODE - Gameplay */}
        {currentScreen === 'PRACTICE_GAME' && (
          <GameCanvas
            mode="practice"
            practiceSubMode={practiceSubMode}
            onNavigateHome={() => setCurrentScreen('HOME')}
            onNavigateLevelsGrid={() => setCurrentScreen('LEVELS_GRID')}
          />
        )}

        {/* SKINS SHOP MODAL */}
        {currentScreen === 'SKINS' && (
          <SkinsModal
            onBack={() => setCurrentScreen('HOME')}
            onSkinEquipped={handleSkinEquipped}
          />
        )}

        {/* LEADERBOARD MODAL */}
        {currentScreen === 'LEADERBOARD' && (
          <LeaderboardModal onBack={() => setCurrentScreen('HOME')} />
        )}

        {/* ACHIEVEMENTS MODAL */}
        {currentScreen === 'ACHIEVEMENTS' && (
          <AchievementsModal onBack={() => setCurrentScreen('HOME')} />
        )}

        {/* SETTINGS MODAL */}
        {currentScreen === 'SETTINGS' && (
          <SettingsModal onBack={() => setCurrentScreen('HOME')} />
        )}

        {/* PROFILE MODAL */}
        {currentScreen === 'PROFILE' && (
          <ProfileModal
            onBack={() => setCurrentScreen('HOME')}
            onNavigateToSkins={() => setCurrentScreen('SKINS')}
          />
        )}

        {/* HOW TO PLAY MODAL */}
        {currentScreen === 'HOW_TO_PLAY' && (
          <HowToPlayModal onBack={() => setCurrentScreen('HOME')} />
        )}

        {/* ABOUT & GAME DOCUMENTATION MODAL */}
        {currentScreen === 'ABOUT' && (
          <AboutModal onClose={() => setCurrentScreen('HOME')} />
        )}
      </main>

      {/* DAILY REWARD MODAL */}
      {dailyRewardModal.show && (
        <DailyRewardModal
          day={dailyRewardModal.day}
          streak={dailyRewardModal.streak}
          onClaimed={() => setDailyRewardModal({ show: false, day: 1, streak: 0 })}
          onClose={() => setDailyRewardModal({ show: false, day: 1, streak: 0 })}
        />
      )}
    </div>
  );
}
