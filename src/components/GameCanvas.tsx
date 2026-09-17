import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Screen,
  AiDifficulty,
  PracticeSubMode,
  FlipFeedback,
  LevelConfig,
} from '../types';
import { BottlePhysics } from '../game/physicsEngine';
import { SceneBuilder } from '../game/sceneBuilder';
import { getLevelConfig } from '../game/levelsData';
import {
  getSettings,
  getSkinsState,
  recordFlip,
  recordLevelSuccess,
  saveMatch,
  savePracticeStats,
  addCoins,
} from '../services/storage';
import { audio } from '../services/audio';
import { PauseOverlay } from './PauseOverlay';
import { MatchResultModal } from './MatchResultModal';
import { LevelCompleteModal } from './LevelCompleteModal';
import { Home, Pause, Hand, Timer, Star, RotateCcw, Target, Sparkles, ChevronRight } from 'lucide-react';

interface GameCanvasProps {
  mode: 'friend' | 'ai' | 'level' | 'practice';
  totalRounds?: number;
  aiDifficulty?: AiDifficulty;
  levelNumber?: number;
  practiceSubMode?: PracticeSubMode;
  onNavigateHome: () => void;
  onNavigateLevelsGrid: () => void;
}

interface ParticleData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  mode,
  totalRounds = 5,
  aiDifficulty = 'medium',
  levelNumber = 1,
  practiceSubMode = 'free',
  onNavigateHome,
  onNavigateLevelsGrid,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Core 3D engine refs
  const sceneBuilderRef = useRef<SceneBuilder | null>(null);
  const physicsRef = useRef<BottlePhysics>(new BottlePhysics());
  const p1BottleMeshRef = useRef<THREE.Group | null>(null);
  const p2BottleMeshRef = useRef<THREE.Group | null>(null);

  // Synchronous turn state ref to completely avoid stale React closure bugs in animation loop
  const turnStateRef = useRef({
    activePlayer: 'p1' as 'p1' | 'p2',
    p1Score: 0,
    p2Score: 0,
    currentRound: 1,
    totalRounds: totalRounds,
    isSettling: false,
  });

  // Dynamic particle system
  const particlesMeshRef = useRef<THREE.Points | null>(null);
  const particlePoolRef = useRef<ParticleData[]>([]);

  // Gameplay state
  const [isPaused, setIsPaused] = useState(false);
  const [feedback, setFeedback] = useState<FlipFeedback | null>(null);
  const [canvasKey, setCanvasKey] = useState(0);
  const [webGlError, setWebGlError] = useState<string | null>(null);

  // Match state (Friend / AI)
  const [currentRound, setCurrentRound] = useState(1);
  const [activePlayer, setActivePlayer] = useState<'p1' | 'p2'>('p1');
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [matchResult, setMatchResult] = useState<{
    show: boolean;
    winner: 'p1' | 'p2' | 'tie';
  } | null>(null);

  // Level state
  const [currentLevel, setCurrentLevel] = useState(levelNumber);
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(getLevelConfig(levelNumber));
  const [levelScore, setLevelScore] = useState(0);
  const [levelThrows, setLevelThrows] = useState(0);
  const [levelComplete, setLevelComplete] = useState<{
    show: boolean;
    stars: number;
    coins: number;
  } | null>(null);

  // Practice Time Challenge
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [practiceScore, setPracticeScore] = useState(0);

  // Drag interaction refs
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragVector, setDragVector] = useState<{ dx: number; dy: number; speed: number } | null>(null);

  // AI turn timer
  const aiTurnTimeoutRef = useRef<number | null>(null);

  // Mutable ref for flip completion handler to be accessed reliably by RAF loop
  const handleFlipCompleteRef = useRef<(res: FlipFeedback) => void>(() => {});

  // Settings & skins
  const settings = getSettings();
  const skins = getSkinsState();
  const equippedBottle = skins.equippedBottle;
  const equippedCap = skins.equippedCap;
  const equippedTrail = skins.equippedTrail;
  const sensitivity = settings.sensitivity;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  // Keep turnStateRef totalRounds in sync with prop
  useEffect(() => {
    turnStateRef.current.totalRounds = totalRounds;
  }, [totalRounds]);

  // Trigger celebration particle burst
  const triggerCelebrationParticles = useCallback((origin: THREE.Vector3, isBig = false) => {
    const count = isBig ? 80 : 45;
    const colors = [
      new THREE.Color('#38bdf8'),
      new THREE.Color('#f59e0b'),
      new THREE.Color('#10b981'),
      new THREE.Color('#ec4899'),
      new THREE.Color('#a855f7'),
      new THREE.Color('#ffffff'),
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2.8;
      const elevation = 0.5 + Math.random() * 2.2;
      particlePoolRef.current.push({
        position: origin.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.1, 0.05, (Math.random() - 0.5) * 0.1)),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          elevation,
          Math.sin(angle) * speed
        ),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 0.04 + Math.random() * 0.04,
        life: 1.0,
        maxLife: 1.0,
      });
    }
  }, []);

  // Initialize Level / Mode Setup
  const setupLevel = useCallback((lvl: number) => {
    const cfg = getLevelConfig(lvl);
    setCurrentLevel(lvl);
    setLevelConfig(cfg);
    setLevelScore(0);
    setLevelThrows(0);
    setLevelComplete(null);
    setFeedback(null);

    const physics = physicsRef.current;
    physics.setObstacle(cfg);

    if (sceneBuilderRef.current) {
      const sb = sceneBuilderRef.current;
      sb.obstacleGroup.clear();
      if (physics.obstacle) {
        const obsMesh = sb.buildObstacle(physics.obstacle);
        physics.obstacle.mesh = obsMesh;
        sb.obstacleGroup.add(obsMesh);
        sb.setTableMode(false);
      } else {
        sb.setTableMode(true);
      }
      if (sb.targetMesh) {
        sb.targetMesh.position.set(cfg.targetX || 0, 0.008, cfg.targetDistance);
        sb.targetMesh.visible = cfg.obstacleType === 'none';
      }
    }

    physics.resetTo(new THREE.Vector3(0, physics.centerOfMassY, 0));
    if (p1BottleMeshRef.current) {
      p1BottleMeshRef.current.position.set(0, physics.centerOfMassY, 0);
      p1BottleMeshRef.current.quaternion.identity();
    }
  }, []);

  // Initialize 3D Scene
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let sb: SceneBuilder | null = null;
    try {
      sb = new SceneBuilder(canvas);
      sceneBuilderRef.current = sb;
      setWebGlError(null);
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[GameCanvas] WebGL context initialization error:', errMsg);
      setWebGlError(errMsg || 'WebGL context could not be created');
      return;
    }

    // Apply sensitivity
    physicsRef.current.sensitivityMultiplier = 0.6 + (sensitivity / 100) * 0.8;

    // Build player 1 active bottle (Glacier Blue & Royal Blue Cap)
    const p1Bottle = sb.createBottleMesh(equippedBottle, equippedCap, {
      bodyTint: '#e0f2fe',
      capColor: '#2563eb',
      liquidColor: '#0284c7',
      labelText: 'P1 FLIP',
    });
    p1Bottle.position.set(0, physicsRef.current.centerOfMassY, 0);
    sb.scene.add(p1Bottle);
    p1BottleMeshRef.current = p1Bottle;

    // Build player 2 secondary bottle (Crimson Red & Ruby Cap for 1v1 visual)
    if (mode === 'friend' || mode === 'ai') {
      const p2Bottle = sb.createBottleMesh('red', 'capRed', {
        bodyTint: '#ffe4e6',
        capColor: '#e11d48',
        liquidColor: '#e11d48',
        labelText: mode === 'ai' ? 'AI FLIP' : 'P2 FLIP',
      });
      // Parked safely on sideline stand (x = 1.15) outside the throwing lane
      p2Bottle.position.set(1.15, physicsRef.current.centerOfMassY, -0.2);
      sb.scene.add(p2Bottle);
      p2BottleMeshRef.current = p2Bottle;
    }

    // Dynamic celebration particle buffer with soft glowing texture
    const maxParticles = 180;
    const particleGeom = new THREE.BufferGeometry();
    const posArray = new Float32Array(maxParticles * 3);
    const colorArray = new Float32Array(maxParticles * 3);

    particleGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    // Procedural soft round glowing particle texture (eliminates square pixel boxes)
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 32;
    particleCanvas.height = 32;
    const pCtx = particleCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.35, 'rgba(255,255,255,0.85)');
      grad.addColorStop(0.7, 'rgba(255,255,255,0.25)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.07,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pSystem = new THREE.Points(particleGeom, particleMat);
    sb.scene.add(pSystem);
    particlesMeshRef.current = pSystem;

    // Setup mode specifics
    if (mode === 'level') {
      setupLevel(levelNumber);
    } else if (mode === 'practice' && practiceSubMode === 'obstacle') {
      const mockLvl = getLevelConfig(4);
      physicsRef.current.setObstacle(mockLvl);
      if (physicsRef.current.obstacle) {
        const obsMesh = sb.buildObstacle(physicsRef.current.obstacle);
        physicsRef.current.obstacle.mesh = obsMesh;
        sb.obstacleGroup.add(obsMesh);
        sb.setTableMode(false);
      }
    } else {
      physicsRef.current.setObstacle(null);
      sb.setTableMode(true);
    }

    // Resize observer & responsive screen adaptation
    const handleResize = () => {
      if (container && sb) {
        sb.resize(container.clientWidth, container.clientHeight);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();

    // Continuous Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);

      const dt = (time - lastTime) * 0.001;
      lastTime = time;

      const physics = physicsRef.current;
      const activeMesh =
        turnStateRef.current.activePlayer === 'p1' || !p2BottleMeshRef.current
          ? p1BottleMeshRef.current
          : p2BottleMeshRef.current;

      const inactiveMesh =
        turnStateRef.current.activePlayer === 'p1'
          ? p2BottleMeshRef.current
          : p1BottleMeshRef.current;

      if (!isPausedRef.current) {
        // Physics update step
        const result = physics.update(dt);

        // Sync 3D mesh transform with physics rigid-body
        if (activeMesh) {
          activeMesh.position.copy(physics.state.position);
          activeMesh.quaternion.copy(physics.state.quaternion);
        }

        // Lock inactive bottle strictly to sideline stand so it NEVER overlaps
        if (inactiveMesh) {
          const sideX = turnStateRef.current.activePlayer === 'p1' ? 1.15 : -1.15;
          inactiveMesh.position.set(sideX, physics.centerOfMassY, -0.2);
          inactiveMesh.quaternion.identity();
        }

        // Camera follow & soft dynamic framing
        if (sb) {
          const targetCamZ = Math.min(Math.max(physics.state.position.z - 1.85, -1.95), 1.2);
          const targetCamY = Math.min(Math.max(physics.state.position.y * 0.45 + 1.5, 1.7), 3.2);
          sb.camera.position.z += (targetCamZ - sb.camera.position.z) * 0.08;
          sb.camera.position.y += (targetCamY - sb.camera.position.y) * 0.08;
          sb.camera.lookAt(
            physics.state.position.x * 0.35,
            Math.max(0.55, physics.state.position.y * 0.65),
            physics.state.position.z + 1.3
          );
        }

        // Update Dynamic Particles (optimized pool, low memory footprint)
        if (particlesMeshRef.current) {
          const pool = particlePoolRef.current;
          const posAttr = particlesMeshRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
          const colAttr = particlesMeshRef.current.geometry.getAttribute('color') as THREE.BufferAttribute;

          // Emit flight trail spark when in air
          if (physics.state.isInFlight && Math.random() > 0.5 && pool.length < 80) {
            const trailCol = skins.equippedTrail === 'trailFire' ? 0xf97316 : 0x38bdf8;
            pool.push({
              position: new THREE.Vector3(
                physics.state.position.x + (Math.random() - 0.5) * 0.04,
                physics.state.position.y - 0.06,
                physics.state.position.z + (Math.random() - 0.5) * 0.04
              ),
              velocity: new THREE.Vector3((Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.15, -0.3),
              color: new THREE.Color(trailCol),
              size: 0.025,
              life: 0.38,
              maxLife: 0.38,
            });
          }

          let writeIdx = 0;
          for (let i = pool.length - 1; i >= 0; i--) {
            const p = pool[i];
            p.life -= dt;
            if (p.life <= 0) {
              pool.splice(i, 1);
              continue;
            }

            p.velocity.y -= 9.81 * 0.35 * dt; // mild gravity for particles
            p.position.addScaledVector(p.velocity, dt);

            if (writeIdx < maxParticles) {
              const alpha = p.life / p.maxLife;
              posAttr.setXYZ(writeIdx, p.position.x, p.position.y, p.position.z);
              colAttr.setXYZ(writeIdx, p.color.r * alpha, p.color.g * alpha, p.color.b * alpha);
              writeIdx++;
            }
          }

          // Clear remaining points
          for (let i = writeIdx; i < maxParticles; i++) {
            posAttr.setXYZ(i, 0, -999, 0);
          }

          posAttr.needsUpdate = true;
          colAttr.needsUpdate = true;
        }

        // Process landing outcome through mutable ref
        if (result) {
          handleFlipCompleteRef.current(result);
        }
      }

      // Render Three.js frame
      if (sb) {
        sb.renderer.render(sb.scene, sb.camera);
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (aiTurnTimeoutRef.current) clearTimeout(aiTurnTimeoutRef.current);
      if (sb) {
        sb.dispose();
        sceneBuilderRef.current = null;
      }
    };
  }, [mode, practiceSubMode, equippedBottle, equippedCap, equippedTrail, sensitivity, canvasKey]);

  // Keep level configuration updated without re-instantiating the entire 3D scene
  useEffect(() => {
    if (mode === 'level' && sceneBuilderRef.current) {
      setupLevel(levelNumber);
    }
  }, [mode, levelNumber, setupLevel]);

  // Practice Time Challenge Countdown Timer
  useEffect(() => {
    if (mode === 'practice' && practiceSubMode === 'time' && !isPaused && timeRemaining > 0) {
      const timer = window.setInterval(() => {
        setTimeRemaining((t) => {
          if (t <= 5 && t > 1) audio.playCountdownTick(false);
          if (t === 1) audio.playCountdownTick(true);
          if (t <= 1) {
            savePracticeStats({ timeBest: practiceScore });
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, practiceSubMode, isPaused, timeRemaining, practiceScore]);

  // Visual Bottle Swapper: Active player's bottle is centered at (0, y, 0), inactive player's bottle waits cleanly on sideline
  const swapBottlePositions = (targetPlayer: 'p1' | 'p2') => {
    const physics = physicsRef.current;
    physics.resetTo(new THREE.Vector3(0, physics.centerOfMassY, 0));

    if (targetPlayer === 'p1') {
      if (p1BottleMeshRef.current) {
        p1BottleMeshRef.current.position.set(0, physics.centerOfMassY, 0);
        p1BottleMeshRef.current.quaternion.identity();
      }
      if (p2BottleMeshRef.current) {
        p2BottleMeshRef.current.position.set(1.15, physics.centerOfMassY, -0.2);
        p2BottleMeshRef.current.quaternion.identity();
      }
    } else {
      if (p1BottleMeshRef.current) {
        p1BottleMeshRef.current.position.set(-1.15, physics.centerOfMassY, -0.2);
        p1BottleMeshRef.current.quaternion.identity();
      }
      if (p2BottleMeshRef.current) {
        p2BottleMeshRef.current.position.set(0, physics.centerOfMassY, 0);
        p2BottleMeshRef.current.quaternion.identity();
      }
    }
  };

  const resetBottlePosition = () => {
    swapBottlePositions(turnStateRef.current.activePlayer);
  };

  // AI THROW TRIGGER (Simulated bot throw)
  const triggerAiThrow = () => {
    const physics = physicsRef.current;
    if (physics.state.isInFlight) return;
    turnStateRef.current.isSettling = false;
    physics.throwWithAi(aiDifficulty, physics.targetCenter);
  };

  // HANDLE FLIP COMPLETION (Turn alternation with zero stale closure issues)
  const handleFlipComplete = (res: FlipFeedback) => {
    if (turnStateRef.current.isSettling) return;
    turnStateRef.current.isSettling = true;

    setFeedback(res);

    const isSuccess = res.points > 0;
    const isPerfect = res.outcome === 'PERFECT';
    const isEdge = res.outcome === 'EDGE';

    if (isSuccess) {
      triggerCelebrationParticles(physicsRef.current.state.position, isPerfect || isEdge);
    }

    recordFlip(isSuccess, isPerfect, isEdge);

    if (isSuccess) {
      addCoins(isPerfect ? 10 : 5);
    }

    // MATCH MODES: 1 Turn User, 1 Turn AI / Friend
    if (mode === 'friend' || mode === 'ai') {
      const currentPlayer = turnStateRef.current.activePlayer;
      const points = res.points;

      if (currentPlayer === 'p1') {
        turnStateRef.current.p1Score += points;
        setP1Score(turnStateRef.current.p1Score);

        // Turn ends for P1 -> Hand over to P2 (AI or Friend)
        window.setTimeout(() => {
          setFeedback(null);
          turnStateRef.current.activePlayer = 'p2';
          setActivePlayer('p2');
          swapBottlePositions('p2');
          turnStateRef.current.isSettling = false;

          // If AI mode: Robot automatically takes its turn after a clean pause
          if (mode === 'ai') {
            if (aiTurnTimeoutRef.current) clearTimeout(aiTurnTimeoutRef.current);
            aiTurnTimeoutRef.current = window.setTimeout(() => {
              if (!isPausedRef.current) {
                triggerAiThrow();
              }
            }, 750);
          }
        }, 850);
      } else {
        // P2 (AI or Friend) finished their throw
        turnStateRef.current.p2Score += points;
        setP2Score(turnStateRef.current.p2Score);

        window.setTimeout(() => {
          setFeedback(null);

          const curRound = turnStateRef.current.currentRound;
          const maxRounds = turnStateRef.current.totalRounds;

          if (curRound >= maxRounds) {
            // Match Finished!
            let winner: 'p1' | 'p2' | 'tie' = 'tie';
            const finalP1 = turnStateRef.current.p1Score;
            const finalP2 = turnStateRef.current.p2Score;

            if (finalP1 > finalP2) winner = 'p1';
            else if (finalP2 > finalP1) winner = 'p2';

            if (winner === 'p1') addCoins(50);

            saveMatch({
              mode: mode as 'friend' | 'ai',
              rounds: maxRounds,
              p1: finalP1,
              p2: finalP2,
              winner,
              difficulty: mode === 'ai' ? (aiDifficulty as AiDifficulty) : undefined,
            });

            setMatchResult({ show: true, winner });
            turnStateRef.current.isSettling = false;
          } else {
            // Advance round -> Back to Player 1's turn!
            turnStateRef.current.currentRound += 1;
            setCurrentRound(turnStateRef.current.currentRound);

            turnStateRef.current.activePlayer = 'p1';
            setActivePlayer('p1');
            swapBottlePositions('p1');
            turnStateRef.current.isSettling = false;
          }
        }, 850);
      }
    } else if (mode === 'level') {
      const nextScore = levelScore + res.points;
      const nextThrows = levelThrows + 1;
      setLevelScore(nextScore);
      setLevelThrows(nextThrows);

      const req = levelConfig.starsScoreRequirement;
      let earnedStars = 0;
      if (nextScore >= req[2]) earnedStars = 3;
      else if (nextScore >= req[1]) earnedStars = 2;
      else if (nextScore >= req[0]) earnedStars = 1;

      if (earnedStars >= 1 && (nextScore >= req[1] || nextThrows >= 3)) {
        setTimeout(() => {
          setFeedback(null);
          const coinsEarned = 20 + 10 * earnedStars;
          recordLevelSuccess(currentLevel, nextScore, earnedStars);
          setLevelComplete({
            show: true,
            stars: earnedStars,
            coins: coinsEarned,
          });
          turnStateRef.current.isSettling = false;
        }, 1100);
      } else if (nextThrows >= 3 && earnedStars === 0) {
        setTimeout(() => {
          setFeedback(null);
          setLevelScore(0);
          setLevelThrows(0);
          resetBottlePosition();
          turnStateRef.current.isSettling = false;
        }, 1100);
      } else {
        setTimeout(() => {
          setFeedback(null);
          resetBottlePosition();
          turnStateRef.current.isSettling = false;
        }, 850);
      }
    } else if (mode === 'practice') {
      if (practiceSubMode === 'time' && isSuccess) {
        setPracticeScore((s) => s + 1);
      } else if (practiceSubMode === 'target') {
        setPracticeScore((s) => s + res.points);
        savePracticeStats({ targetBest: practiceScore + res.points });
      }
      setTimeout(() => {
        setFeedback(null);
        resetBottlePosition();
        turnStateRef.current.isSettling = false;
      }, 900);
    }
  };

  // Wire mutable ref so the RAF loop always executes the newest handler
  handleFlipCompleteRef.current = handleFlipComplete;

  // Restart match handler
  const handleRestartMatch = () => {
    if (aiTurnTimeoutRef.current) clearTimeout(aiTurnTimeoutRef.current);
    turnStateRef.current = {
      activePlayer: 'p1',
      p1Score: 0,
      p2Score: 0,
      currentRound: 1,
      totalRounds: totalRounds,
      isSettling: false,
    };
    setCurrentRound(1);
    setP1Score(0);
    setP2Score(0);
    setActivePlayer('p1');
    setFeedback(null);
    setMatchResult(null);
    swapBottlePositions('p1');
  };

  // POINTER GESTURE EVENTS: Interactive pickup, drag-lift, and swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPaused || physicsRef.current.state.isInFlight || turnStateRef.current.isSettling) return;
    if (mode === 'ai' && turnStateRef.current.activePlayer === 'p2') return;

    // Secure touch tracking so fast swipes never drop off the canvas edge
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch (_) {}

    audio.playPickup();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
    };
    setIsDragging(true);
    setDragVector({ dx: 0, dy: 0, speed: 0 });
    setFeedback(null);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = dragStartRef.current.y - e.clientY; // upward is positive
    const elapsed = Math.max(performance.now() - dragStartRef.current.time, 20);
    const speed = Math.max(dy, 0) / elapsed; // px/ms
    setDragVector({ dx, dy, speed });

    // Interactive 3D bottle lift & cocked-angle preview
    physicsRef.current.previewDragLift(dx, dy);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch (_) {}

    const dt = performance.now() - dragStartRef.current.time;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = dragStartRef.current.y - e.clientY;

    setIsDragging(false);
    setDragVector(null);
    dragStartRef.current = null;

    // Determine if it was an intentional flip swipe ("joto tuku sweep oto bottol omon hobe")
    if (dy > 16 || Math.abs(dx) > 24 || (dt < 380 && (dy > 10 || Math.abs(dx) > 15))) {
      physicsRef.current.throwWithSwipe(dx, Math.max(dy, 18), dt);
    } else {
      // Return bottle smoothly to table
      physicsRef.current.cancelDragLift();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none touch-none bg-[#181424]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 3D WebGL Canvas with dynamic key for clean context creation */}
      <canvas key={canvasKey} ref={canvasRef} className="w-full h-full block" />

      {/* WebGL Error Recovery Overlay */}
      {webGlError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md pointer-events-auto">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <RotateCcw className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white font-['Fredoka']">3D Graphics Context Reset</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              The browser graphics context was paused or interrupted. Click below to initialize a fresh graphics engine.
            </p>
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => {
                  setWebGlError(null);
                  setCanvasKey((k) => k + 1);
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart 3D Engine</span>
              </button>
              <button
                onClick={onNavigateHome}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl active:scale-95 transition-all"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR: Clean, Modern Glassmorphic HUD */}
      <div className="absolute top-0 left-0 w-full p-3 sm:p-4 flex items-center justify-between pointer-events-none z-20">
        {/* Home Button */}
        <button
          id="game-home-btn"
          onClick={() => {
            audio.playButton();
            onNavigateHome();
          }}
          className="w-10 h-10 rounded-2xl bg-slate-900/75 hover:bg-slate-800 text-white flex items-center justify-center border border-white/10 shadow-lg backdrop-blur-xl pointer-events-auto active:scale-95 transition-all"
        >
          <Home className="w-5 h-5 text-slate-200" />
        </button>

        {/* Center Mode / Stage Pill */}
        <div className="flex items-center gap-2">
          {mode === 'friend' || mode === 'ai' ? (
            <div
              id="round-tracker-pill"
              className="px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-white font-black text-xs sm:text-sm tracking-wider shadow-lg backdrop-blur-xl font-['Fredoka']"
            >
              ROUND {currentRound} / {totalRounds}
            </div>
          ) : mode === 'level' ? (
            <div
              id="level-tracker-pill"
              className="px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-black text-xs sm:text-sm shadow-lg backdrop-blur-xl font-['Fredoka'] flex items-center gap-1.5"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>LEVEL {currentLevel}</span>
            </div>
          ) : practiceSubMode === 'time' ? (
            <div
              id="time-tracker-pill"
              className="px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/40 text-amber-300 font-black text-xs sm:text-sm shadow-lg backdrop-blur-xl font-['Fredoka'] flex items-center gap-1.5"
            >
              <Timer className="w-4 h-4" />
              <span>{timeRemaining}s • {practiceScore} Landings</span>
            </div>
          ) : (
            <div className="px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-purple-300 font-black text-xs sm:text-sm shadow-lg backdrop-blur-xl font-['Fredoka']">
              PRACTICE: {practiceSubMode.toUpperCase()}
            </div>
          )}
        </div>

        {/* Right Actions: Quick Restart + Pause */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            id="game-reset-btn"
            title="Reset Bottle"
            onClick={() => {
              audio.playButton();
              resetBottlePosition();
              setFeedback(null);
            }}
            className="w-10 h-10 rounded-2xl bg-slate-900/75 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-white/10 shadow-lg backdrop-blur-xl active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            id="game-pause-btn"
            title="Pause Game"
            onClick={() => {
              audio.playButton();
              setIsPaused(true);
            }}
            className="w-10 h-10 rounded-2xl bg-slate-900/75 hover:bg-slate-800 text-white flex items-center justify-center border border-white/10 shadow-lg backdrop-blur-xl active:scale-95 transition-all"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* SCORE CARDS (Friend 1v1 or AI Play) */}
      {(mode === 'friend' || mode === 'ai') && (
        <div className="absolute top-16 left-0 w-full px-4 flex items-center justify-between pointer-events-none z-10">
          {/* Player 1 Card (Blue Bottle Theme) */}
          <div
            id="score-card-p1"
            className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-2xl border backdrop-blur-xl shadow-xl transition-all ${
              activePlayer === 'p1'
                ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 border-sky-300 scale-105 shadow-blue-500/40 ring-4 ring-blue-400/40'
                : 'bg-slate-900/80 border-blue-500/30 opacity-70'
            }`}
          >
            {/* Blue Bottle Avatar Badge */}
            <div className="w-8 h-8 rounded-xl bg-blue-500/40 border border-blue-300 flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-base">🍾</span>
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-black tracking-wider text-sky-200 flex items-center gap-1">
                <span>{mode === 'friend' ? 'PLAYER 1' : 'YOU'}</span>
                {activePlayer === 'p1' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
                )}
              </div>
              <div className="text-2xl font-black text-white font-mono leading-none mt-0.5 drop-shadow">
                {p1Score.toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Player 2 / AI Card (Red Bottle Theme) */}
          <div
            id="score-card-p2"
            className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-2xl border backdrop-blur-xl shadow-xl transition-all ${
              activePlayer === 'p2'
                ? 'bg-gradient-to-r from-rose-700 via-red-600 to-amber-500 border-rose-300 scale-105 shadow-rose-500/40 ring-4 ring-rose-400/40'
                : 'bg-slate-900/80 border-rose-500/30 opacity-70'
            }`}
          >
            <div className="text-right">
              <div className="text-[10px] uppercase font-black tracking-wider text-rose-200 flex items-center justify-end gap-1">
                {activePlayer === 'p2' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-ping" />
                )}
                <span>{mode === 'friend' ? 'PLAYER 2' : `AI (${aiDifficulty.toUpperCase()})`}</span>
              </div>
              <div className="text-2xl font-black text-white font-mono leading-none mt-0.5 drop-shadow">
                {p2Score.toString().padStart(2, '0')}
              </div>
            </div>
            {/* Red Bottle Avatar Badge */}
            <div className="w-8 h-8 rounded-xl bg-rose-500/40 border border-rose-300 flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-base">{mode === 'ai' ? '🤖' : '🍼'}</span>
            </div>
          </div>
        </div>
      )}

      {/* COMPACT STAGE OBJECTIVE BAR (Clean & non-intrusive) */}
      {mode === 'level' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-sm px-3.5 py-2 rounded-2xl bg-slate-900/75 border border-white/10 text-white shadow-xl backdrop-blur-xl pointer-events-none z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="truncate">
              <div className="text-[11px] font-bold text-slate-200 truncate">
                {levelConfig.title}
              </div>
              <div className="text-[9px] text-slate-400 truncate">
                {levelConfig.description}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-white/10 text-xs font-mono font-bold">
            <span className="text-amber-400">{levelScore} pts</span>
            <span className="text-slate-400 text-[10px]">T:{levelThrows}/3</span>
          </div>
        </div>
      )}

      {/* ELEGANT FLOATING FEEDBACK TOAST (Top-Center, non-blocking) */}
      {feedback && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all animate-in fade-in zoom-in duration-200">
          <div
            className="px-5 py-2 rounded-full text-white font-black text-sm sm:text-base tracking-wide shadow-2xl border backdrop-blur-xl flex items-center gap-2 font-['Fredoka']"
            style={{
              backgroundColor: `${feedback.color}dd`,
              borderColor: 'rgba(255, 255, 255, 0.4)',
              boxShadow: `0 10px 25px -5px ${feedback.color}66`,
            }}
          >
            <Sparkles className="w-4 h-4 text-white animate-spin" />
            <span>{feedback.text}</span>
          </div>
        </div>
      )}

      {/* DYNAMIC SWIPE AIMING ARC (While Dragging) */}
      {isDragging && dragVector && dragVector.dy > 12 && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-end justify-center pb-28">
          <div className="flex flex-col items-center gap-2">
            {/* Trajectory Power Dots with color-coded power indicators */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full shadow-lg transition-transform ${
                  dragVector.speed >= 0.55 && dragVector.speed <= 1.4
                    ? 'bg-emerald-400 shadow-emerald-400/80 ring-4 ring-emerald-400/30'
                    : dragVector.speed > 1.4
                    ? 'bg-rose-500 shadow-rose-500/80 ring-4 ring-rose-500/30'
                    : 'bg-amber-400 shadow-amber-400/70 ring-4 ring-amber-400/30'
                }`}
                style={{ transform: `scale(${Math.min(1 + dragVector.speed * 0.4, 1.8)})` }}
              />
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  dragVector.speed >= 0.55 && dragVector.speed <= 1.4
                    ? 'bg-cyan-300 shadow-md shadow-cyan-300/60'
                    : 'bg-sky-400/80'
                }`}
              />
              <div className="w-2.5 h-2.5 rounded-full bg-sky-400/70" />
              <div className="w-2 h-2 rounded-full bg-sky-500/50" />
            </div>
            <div
              className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border backdrop-blur-md transition-all ${
                dragVector.speed >= 0.55 && dragVector.speed <= 1.4
                  ? 'bg-emerald-500/80 border-emerald-300 text-white shadow-lg shadow-emerald-500/40 animate-pulse'
                  : dragVector.speed > 1.4
                  ? 'bg-rose-600/85 border-rose-300 text-white shadow-lg shadow-rose-600/40'
                  : 'bg-slate-900/80 border-amber-400/60 text-amber-300'
              }`}
            >
              {dragVector.speed >= 0.55 && dragVector.speed <= 1.4
                ? '⭐ OPTIMAL FLIP ZONE'
                : dragVector.speed > 1.4
                ? '⚡ HIGH FLIP POWER'
                : 'FLICK UPWARD TO FLIP'}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM TURN / HINT PILL */}
      <div className="absolute bottom-5 left-0 w-full flex justify-center pointer-events-none z-20 px-4">
        {mode === 'friend' ? (
          <div
            id="turn-banner"
            className={`px-5 py-2 rounded-full font-black text-xs sm:text-sm tracking-wider shadow-xl border backdrop-blur-xl font-['Fredoka'] flex items-center gap-2 ${
              activePlayer === 'p1'
                ? 'bg-blue-600/90 border-sky-300 text-white shadow-blue-600/30'
                : 'bg-rose-600/90 border-rose-300 text-white shadow-rose-600/30'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>{activePlayer === 'p1' ? 'PLAYER 1 (BLUE)' : 'PLAYER 2 (RED)'} — SWIPE UP!</span>
          </div>
        ) : mode === 'ai' ? (
          <div
            id="ai-turn-banner"
            className={`px-5 py-2 rounded-full font-black text-xs sm:text-sm tracking-wider shadow-xl border backdrop-blur-xl font-['Fredoka'] flex items-center gap-2 ${
              activePlayer === 'p1'
                ? 'bg-blue-600/90 border-sky-300 text-white shadow-blue-600/30'
                : 'bg-rose-600/90 border-rose-300 text-white shadow-rose-600/30'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>
              {activePlayer === 'p1'
                ? 'YOUR TURN (BLUE BOTTLE) — SWIPE UP TO FLIP'
                : `AI ROBOT (RED BOTTLE) IS FLIPPING...`}
            </span>
          </div>
        ) : (
          <div className="px-4 py-1.5 rounded-full bg-slate-900/75 border border-white/10 text-slate-300 font-bold text-[11px] tracking-wide shadow-lg backdrop-blur-xl flex items-center gap-2">
            <Hand className="w-3.5 h-3.5 text-sky-400" />
            <span>Swipe upward with speed • Rotate to land upright</span>
          </div>
        )}
      </div>

      {/* PAUSE OVERLAY */}
      {isPaused && (
        <PauseOverlay
          onResume={() => setIsPaused(false)}
          onRestart={() => {
            setIsPaused(false);
            if (mode === 'level') setupLevel(currentLevel);
            else {
              handleRestartMatch();
            }
          }}
          onHome={onNavigateHome}
        />
      )}

      {/* MATCH RESULT MODAL */}
      {matchResult && matchResult.show && (
        <MatchResultModal
          mode={mode as 'friend' | 'ai'}
          p1Score={p1Score}
          p2Score={p2Score}
          rounds={totalRounds}
          winner={matchResult.winner}
          onPlayAgain={() => {
            handleRestartMatch();
          }}
          onHome={onNavigateHome}
          onSuddenFlip={() => {
            setMatchResult(null);
            turnStateRef.current.totalRounds = totalRounds + 1;
            turnStateRef.current.currentRound = totalRounds + 1;
            turnStateRef.current.activePlayer = 'p1';
            turnStateRef.current.isSettling = false;
            setCurrentRound(totalRounds + 1);
            setActivePlayer('p1');
            swapBottlePositions('p1');
          }}
        />
      )}

      {/* LEVEL COMPLETE MODAL */}
      {levelComplete && levelComplete.show && (
        <LevelCompleteModal
          levelNumber={currentLevel}
          score={levelScore}
          starsEarned={levelComplete.stars}
          coinsEarned={levelComplete.coins}
          onNextLevel={() => setupLevel(currentLevel + 1)}
          onReplay={() => setupLevel(currentLevel)}
          onHome={onNavigateLevelsGrid}
        />
      )}
    </div>
  );
};
