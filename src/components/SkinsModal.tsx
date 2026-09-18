import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ArrowLeft, Coins, Star, Check, Lock, Sparkles, Eye, RotateCw } from 'lucide-react';
import { SkinItem, BottleShape } from '../types';
import { SKINS_BOTTLES, SKINS_CAPS, SKINS_TRAILS } from '../data/skinsData';
import {
  getCoins,
  getTotalStars,
  getSkinsState,
  spendCoins,
  saveSkinsState,
} from '../services/storage';
import { audio } from '../services/audio';
import { createStandaloneBottleMesh } from '../game/sceneBuilder';

interface SkinsModalProps {
  onBack: () => void;
  onSkinEquipped?: (skinId: string, capId: string) => void;
}

// ----------------------------------------------------
// 3D Interactive Inspection Showcase Component
// ----------------------------------------------------
interface ShowcaseProps {
  bottleId: string;
  capId: string;
  trailId?: string;
  itemName: string;
  shapeTag?: string;
  isEquipped: boolean;
  isOwned: boolean;
  isLocked: boolean;
  cost: number;
  onEquip: () => void;
  onBuy: () => void;
}

const BottleShowcaseStage: React.FC<ShowcaseProps> = ({
  bottleId,
  capId,
  trailId,
  itemName,
  shapeTag,
  isEquipped,
  isOwned,
  isLocked,
  cost,
  onEquip,
  onBuy,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const rotYRef = useRef(0);
  const autoRotateRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId: number;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
    } catch (e) {
      console.warn('Failed to init 3D showcase WebGL renderer:', e);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      20
    );
    camera.position.set(0, 0.14, 0.82);
    camera.lookAt(0, 0.08, 0);

    // Studio Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2, 3, 2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.2);
    fillLight.position.set(-2, 1, 1);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(0, 2, -2);
    scene.add(rimLight);

    // Bottom soft reflector light
    const floorFill = new THREE.DirectionalLight(0xffffff, 0.6);
    floorFill.position.set(0, -2, 1);
    scene.add(floorFill);

    // Build the 3D Bottle mesh
    let bottleMesh: THREE.Group | null = null;
    try {
      bottleMesh = createStandaloneBottleMesh(bottleId, capId);
      scene.add(bottleMesh);
    } catch (err) {
      console.warn('Error creating bottle mesh for showcase:', err);
    }

    // Dynamic Trail Particles Ribbon Preview
    let trailPoints: THREE.Points | null = null;
    if (trailId) {
      const pCount = 72;
      const pGeom = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      const pCol = new Float32Array(pCount * 3);

      for (let i = 0; i < pCount; i++) {
        const u = i / pCount;
        const angle = u * Math.PI * 4;
        const radius = 0.085 + (i % 2) * 0.015;
        const y = u * 0.3 - 0.06;

        pPos[i * 3] = Math.cos(angle) * radius;
        pPos[i * 3 + 1] = y;
        pPos[i * 3 + 2] = Math.sin(angle) * radius;

        let col = new THREE.Color(0x38bdf8);
        if (trailId === 'trailSparkle') {
          col = new THREE.Color(i % 2 === 0 ? 0xfde047 : 0xffffff);
        } else if (trailId === 'trailFire') {
          col = new THREE.Color(i % 2 === 0 ? 0xf97316 : 0xef4444);
        } else if (trailId === 'trailRainbow') {
          col = new THREE.Color().setHSL(u, 1.0, 0.6);
        } else if (trailId === 'trailCyan') {
          col = new THREE.Color(i % 2 === 0 ? 0x22d3ee : 0xffffff);
        } else if (trailId === 'trailSakura') {
          col = new THREE.Color(i % 2 === 0 ? 0xf472b6 : 0xfda4af);
        } else if (trailId === 'trailEmerald') {
          col = new THREE.Color(i % 2 === 0 ? 0x10b981 : 0x34d399);
        }

        pCol[i * 3] = col.r;
        pCol[i * 3 + 1] = col.g;
        pCol[i * 3 + 2] = col.b;
      }

      pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pGeom.setAttribute('color', new THREE.BufferAttribute(pCol, 3));

      // Circular glowing particle texture
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 16;
      pCanvas.height = 16;
      const ctx = pCanvas.getContext('2d');
      if (ctx) {
        const g = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 16, 16);
      }
      const pTex = new THREE.CanvasTexture(pCanvas);

      const pMat = new THREE.PointsMaterial({
        size: 0.035,
        map: pTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      trailPoints = new THREE.Points(pGeom, pMat);
      scene.add(trailPoints);
    }

    // Interactive Drag Controls
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastXRef.current = e.clientX;
      autoRotateRef.current = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      rotYRef.current += deltaX * 0.015;
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      // Resume gentle auto rotate after 1.5 seconds of inactivity
      setTimeout(() => {
        if (!isDraggingRef.current) autoRotateRef.current = true;
      }, 1500);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!canvas || !renderer) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotateRef.current) {
        rotYRef.current += 0.012;
      }

      if (bottleMesh) {
        bottleMesh.rotation.y = rotYRef.current;
      }

      if (trailPoints) {
        trailPoints.rotation.y += 0.025;
      }

      renderer?.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);

      // Clean up Three.js objects
      if (bottleMesh) {
        bottleMesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else if (child.material) {
              child.material.dispose();
            }
          }
        });
      }
      if (trailPoints) {
        trailPoints.geometry.dispose();
        (trailPoints.material as THREE.Material).dispose();
      }
      renderer?.dispose();
    };
  }, [bottleId, capId, trailId]);

  return (
    <div className="relative w-full h-44 sm:h-52 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-700/60 shadow-xl overflow-hidden mb-3 flex flex-col justify-between p-3 select-none">
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Bar Info */}
      <div className="relative z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-black tracking-wider uppercase backdrop-blur-sm border border-blue-400/30">
            {shapeTag || '3D PREVIEW'}
          </span>
          <span className="text-sm font-extrabold text-white drop-shadow-md font-['Fredoka']">
            {itemName}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-300 font-bold bg-slate-900/70 px-2.5 py-1 rounded-full border border-slate-700/60 backdrop-blur-sm">
          <RotateCw className="w-3 h-3 text-cyan-400 animate-spin-slow" />
          <span>DRAG TO ROTATE</span>
        </div>
      </div>

      {/* Bottom Floating Action Bar */}
      <div className="relative z-10 flex items-center justify-between mt-auto">
        <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1 drop-shadow bg-slate-950/60 px-2.5 py-1 rounded-lg">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive 3D Stage</span>
        </div>

        <div>
          {isEquipped ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-blue-600/90 text-white text-xs font-black flex items-center gap-1.5 shadow-lg border border-blue-400/40">
              <Check className="w-4 h-4" /> EQUIPPED
            </div>
          ) : isOwned ? (
            <button
              onClick={onEquip}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              EQUIP NOW
            </button>
          ) : (
            <button
              onClick={onBuy}
              disabled={isLocked}
              className={`px-4 py-1.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-1.5 active:scale-95 transition-all ${
                isLocked
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-white shadow-amber-500/20'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>BUY FOR {cost}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// Vector/SVG Bottle Shape Preview for Grid Cards
// ----------------------------------------------------
interface BottleThumbnailProps {
  shape?: BottleShape;
  color: string;
  capColor: string;
  liquidColor?: string;
  labelText?: string;
  category: 'bottles' | 'caps' | 'trails';
}

const BottleCardThumbnail: React.FC<BottleThumbnailProps> = ({
  shape = 'classic',
  color,
  capColor,
  liquidColor,
  labelText = 'FLIP',
  category,
}) => {
  const fillLiquid = liquidColor || color;

  if (category === 'caps') {
    return (
      <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
        <defs>
          <linearGradient id={`capGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* Cap Rim / Tamper Seal */}
        <ellipse cx="50" cy="74" rx="34" ry="8" fill="#1e293b" />
        <ellipse cx="50" cy="70" rx="32" ry="7" fill={color} stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3" />
        {/* Cap Cylindrical Body with vertical grip ribs */}
        <path d="M 22 42 L 78 42 L 78 68 C 78 72 22 72 22 68 Z" fill={color} />
        <path d="M 22 42 L 78 42 L 78 68 C 78 72 22 72 22 68 Z" fill={`url(#capGrad-${color})`} />
        {/* Rib lines */}
        {[28, 34, 40, 46, 52, 58, 64, 72].map((x) => (
          <line key={x} x1={x} y1="44" x2={x} y2="66" stroke="#000000" strokeWidth="1.5" strokeOpacity="0.35" />
        ))}
        {/* Top Dome */}
        <ellipse cx="50" cy="42" rx="28" ry="8" fill={color} stroke="#ffffff" strokeWidth="1" strokeOpacity="0.5" />
        {/* Top Glint Highlight */}
        <ellipse cx="46" cy="40" rx="14" ry="4" fill="#ffffff" fillOpacity="0.4" />
      </svg>
    );
  }

  if (category === 'trails') {
    return (
      <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
        <defs>
          <radialGradient id={`glow-${color}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="60%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Swirling particle tail stream */}
        <circle cx="50" cy="50" r="38" fill={`url(#glow-${color})`} />
        <path
          d="M 20 75 Q 35 30 75 25 Q 50 65 20 75 Z"
          fill={color}
          fillOpacity="0.75"
        />
        <circle cx="75" cy="25" r="7" fill="#ffffff" />
        <circle cx="62" cy="40" r="4.5" fill="#fef08a" />
        <circle cx="45" cy="58" r="3.5" fill={color} />
        <circle cx="30" cy="70" r="2.5" fill="#ffffff" />
        {/* Star bursts */}
        <path d="M 75 16 L 77 23 L 84 25 L 77 27 L 75 34 L 73 27 L 66 25 L 73 23 Z" fill="#ffffff" />
        <path d="M 38 32 L 40 36 L 44 37 L 40 38 L 38 42 L 36 38 L 32 37 L 36 36 Z" fill="#ffffff" fillOpacity="0.8" />
      </svg>
    );
  }

  // -------------------------
  // BOTTLE SHAPES
  // -------------------------
  return (
    <svg viewBox="0 0 100 120" className="w-16 h-20 drop-shadow-md">
      <defs>
        <linearGradient id={`liq-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fillLiquid} stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor={fillLiquid} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`glass-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.7" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* SHAPE 1: ROUND ORB / POTION */}
      {shape === 'round' && (
        <g>
          {/* Base foot */}
          <ellipse cx="50" cy="106" rx="20" ry="4" fill="#0f172a" />
          <ellipse cx="50" cy="103" rx="18" ry="4" fill={color} />
          {/* Spherical Glass Bulb */}
          <circle cx="50" cy="72" r="28" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.5" />
          {/* Round Liquid inside */}
          <path d="M 24 74 A 28 28 0 0 0 76 74 Q 50 78 24 74 Z" fill={`url(#liq-${color})`} />
          {/* Filigree gold collar */}
          <rect x="42" y="40" width="16" height="5" rx="2" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
          {/* Narrow Neck */}
          <rect x="44" y="24" width="12" height="18" fill={color} fillOpacity="0.5" stroke={color} strokeWidth="1.5" />
          {/* Center Emblem */}
          <circle cx="50" cy="68" r="8" fill={capColor} fillOpacity="0.9" stroke="#ffffff" strokeWidth="1.2" />
          <text x="50" y="71" textAnchor="middle" fontSize="6" fontWeight="900" fill="#ffffff">ORB</text>
          {/* Cap */}
          <rect x="43" y="16" width="14" height="10" rx="3" fill={capColor} stroke="#ffffff" strokeWidth="1" />
          <ellipse cx="50" cy="16" rx="7" ry="2.5" fill={capColor} />
          {/* Glass Highlight */}
          <path d="M 32 56 A 22 22 0 0 1 48 48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
        </g>
      )}

      {/* SHAPE 2: BOX CARTON / CYBER CUBE */}
      {shape === 'box' && (
        <g>
          {/* Base */}
          <rect x="30" y="44" width="40" height="62" rx="4" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="2" />
          {/* Liquid Box */}
          <rect x="32" y="76" width="36" height="28" rx="2" fill={`url(#liq-${color})`} />
          {/* Carton slanted shoulder */}
          <path d="M 30 44 L 43 32 L 57 32 L 70 44 Z" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="1.5" />
          {/* Neck Mount */}
          <rect x="44" y="24" width="12" height="9" fill={color} stroke={color} strokeWidth="1" />
          {/* Front Label Plate */}
          <rect x="34" y="52" width="32" height="22" rx="2" fill="#ffffff" fillOpacity="0.9" />
          <text x="50" y="66" textAnchor="middle" fontSize="8" fontWeight="900" fill={capColor}>{labelText}</text>
          {/* Cap */}
          <rect x="42" y="16" width="16" height="10" rx="2" fill={capColor} stroke="#ffffff" strokeWidth="1" />
          {/* Highlight line */}
          <line x1="33" y1="46" x2="33" y2="102" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.7" />
        </g>
      )}

      {/* SHAPE 3: TALL SLENDER / LOMBA */}
      {shape === 'tall' && (
        <g>
          {/* Base foot */}
          <ellipse cx="50" cy="108" rx="16" ry="4" fill="#0f172a" />
          {/* Slender Body */}
          <rect x="36" y="32" width="28" height="74" rx="4" fill={color} fillOpacity="0.35" stroke={color} strokeWidth="2" />
          {/* Tall Liquid Column */}
          <rect x="38" y="68" width="24" height="36" rx="2" fill={`url(#liq-${color})`} />
          {/* Grip Trim Bands */}
          <rect x="35" y="48" width="30" height="4" rx="1" fill={capColor} />
          <rect x="35" y="86" width="30" height="4" rx="1" fill={capColor} />
          {/* Slender Neck */}
          <rect x="44" y="20" width="12" height="13" fill={color} stroke={color} strokeWidth="1" />
          {/* Brand Label */}
          <rect x="37" y="56" width="26" height="18" rx="2" fill="#ffffff" fillOpacity="0.9" />
          <text x="50" y="68" textAnchor="middle" fontSize="7" fontWeight="900" fill={capColor}>TALL</text>
          {/* Cap */}
          <rect x="43" y="12" width="14" height="10" rx="2" fill={capColor} stroke="#ffffff" strokeWidth="1" />
          {/* Sleek reflection */}
          <line x1="39" y1="34" x2="39" y2="102" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.7" />
        </g>
      )}

      {/* SHAPE 4: SHORT CHUBBY MINI */}
      {shape === 'short' && (
        <g>
          {/* Base */}
          <ellipse cx="50" cy="106" rx="25" ry="5" fill="#0f172a" />
          {/* Stout Chubby Body */}
          <rect x="27" y="48" width="46" height="56" rx="8" fill={color} fillOpacity="0.35" stroke={color} strokeWidth="2.2" />
          {/* Chubby Liquid */}
          <rect x="29" y="74" width="42" height="28" rx="5" fill={`url(#liq-${color})`} />
          {/* Stout Neck */}
          <rect x="42" y="36" width="16" height="14" fill={color} stroke={color} strokeWidth="1.2" />
          {/* Wide Label */}
          <rect x="30" y="55" width="40" height="18" rx="3" fill="#ffffff" fillOpacity="0.9" />
          <text x="50" y="67" textAnchor="middle" fontSize="7" fontWeight="900" fill={capColor}>MINI</text>
          {/* Chunky Wide Cap */}
          <rect x="38" y="24" width="24" height="14" rx="3" fill={capColor} stroke="#ffffff" strokeWidth="1.2" />
          <line x1="44" y1="26" x2="44" y2="36" stroke="#000000" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="50" y1="26" x2="50" y2="36" stroke="#000000" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="56" y1="26" x2="56" y2="36" stroke="#000000" strokeWidth="1" strokeOpacity="0.3" />
        </g>
      )}

      {/* SHAPE 5: HOURGLASS SODA BOTTLE */}
      {shape === 'soda' && (
        <g>
          {/* Base */}
          <ellipse cx="50" cy="107" rx="20" ry="4" fill="#0f172a" />
          {/* Hourglass Contour */}
          <path
            d="M 32 105 Q 30 75 42 66 Q 30 52 35 38 L 44 26 L 56 26 L 65 38 Q 70 52 58 66 Q 70 75 68 105 Z"
            fill={color}
            fillOpacity="0.3"
            stroke={color}
            strokeWidth="2"
          />
          {/* Soda Liquid */}
          <path
            d="M 32 105 Q 30 75 42 66 Q 50 68 58 66 Q 70 75 68 105 Z"
            fill={`url(#liq-${color})`}
          />
          {/* Effervescent bubbles */}
          <circle cx="44" cy="85" r="2" fill="#ffffff" opacity="0.8" />
          <circle cx="56" cy="92" r="1.5" fill="#ffffff" opacity="0.7" />
          <circle cx="50" cy="78" r="2.5" fill="#ffffff" opacity="0.9" />
          {/* Chest Label */}
          <rect x="36" y="44" width="28" height="16" rx="2" fill="#ffffff" fillOpacity="0.9" />
          <text x="50" y="55" textAnchor="middle" fontSize="6.5" fontWeight="900" fill={capColor}>SODA</text>
          {/* Cap */}
          <rect x="43" y="16" width="14" height="10" rx="2" fill={capColor} stroke="#ffffff" strokeWidth="1" />
        </g>
      )}

      {/* SHAPE 6: FACETED DIAMOND CRYSTAL */}
      {shape === 'diamond' && (
        <g>
          {/* Faceted Crystal Decanter */}
          <polygon
            points="32,104 28,52 42,34 58,34 72,52 68,104"
            fill="#e0e7ff"
            fillOpacity="0.4"
            stroke="#a5b4fc"
            strokeWidth="2"
          />
          <polygon
            points="34,102 30,76 70,76 66,102"
            fill={`url(#liq-${color})`}
          />
          {/* Facet lines */}
          <line x1="42" y1="34" x2="40" y2="104" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
          <line x1="58" y1="34" x2="60" y2="104" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
          <line x1="28" y1="52" x2="72" y2="52" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
          {/* Jewel Cap */}
          <polygon points="42,22 50,14 58,22 54,32 46,32" fill={capColor} stroke="#ffffff" strokeWidth="1.2" />
          {/* Glint sparkles */}
          <polygon points="50,42 52,47 57,48 52,49 50,54 48,49 43,48 48,47" fill="#ffffff" />
        </g>
      )}

      {/* SHAPE 7: CLASSIC / SPORT / GOLD / GALAXY */}
      {(shape === 'classic' || shape === 'sport' || shape === 'gold' || shape === 'galaxy') && (
        <g>
          {/* Base Petaloid */}
          <ellipse cx="50" cy="107" rx="21" ry="4" fill="#0f172a" />
          {/* PET Ribbed Bottle Silhouette */}
          <path
            d="M 31 104 L 31 46 C 31 38 42 32 44 26 L 56 26 C 58 32 69 38 69 46 L 69 104 Z"
            fill={shape === 'gold' ? '#eab308' : color}
            fillOpacity={shape === 'gold' ? 0.95 : 0.3}
            stroke={shape === 'gold' ? '#ca8a04' : color}
            strokeWidth="2"
          />
          {/* Liquid level */}
          {shape !== 'gold' && (
            <path d="M 32 104 L 32 72 Q 50 74 68 72 L 68 104 Z" fill={`url(#liq-${color})`} />
          )}
          {/* Horizontal Grip Ribs */}
          <line x1="31" y1="78" x2="69" y2="78" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          <line x1="31" y1="86" x2="69" y2="86" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          <line x1="31" y1="94" x2="69" y2="94" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          {/* Center Brand Wrap Label */}
          <rect x="31" y="52" width="38" height="20" fill="#ffffff" fillOpacity="0.9" />
          <text x="50" y="65" textAnchor="middle" fontSize="7.5" fontWeight="900" fill={capColor}>{labelText}</text>
          {/* Neck & Cap */}
          <rect x="44" y="22" width="12" height="6" fill={color} />
          <rect x="42" y="14" width="16" height="10" rx="2" fill={capColor} stroke="#ffffff" strokeWidth="1" />
          <line x1="47" y1="15" x2="47" y2="23" stroke="#000000" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="53" y1="15" x2="53" y2="23" stroke="#000000" strokeWidth="1" strokeOpacity="0.3" />
          {/* Glint line */}
          <line x1="34" y1="46" x2="34" y2="102" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.7" />
        </g>
      )}
    </svg>
  );
};

// ----------------------------------------------------
// Main Skins Shop Modal
// ----------------------------------------------------
export const SkinsModal: React.FC<SkinsModalProps> = ({ onBack, onSkinEquipped }) => {
  const [activeTab, setActiveTab] = useState<'bottles' | 'caps' | 'trails'>('bottles');
  const [coins, setCoins] = useState(getCoins());
  const [stars] = useState(getTotalStars());
  const [skinsState, setSkinsState] = useState(getSkinsState());
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Inspected skin item for the top 3D Showcase
  const [inspectedBottleId, setInspectedBottleId] = useState<string>(skinsState.equippedBottle);
  const [inspectedCapId, setInspectedCapId] = useState<string>(skinsState.equippedCap);
  const [inspectedTrailId, setInspectedTrailId] = useState<string>(skinsState.equippedTrail || 'trailSparkle');

  const currentList: SkinItem[] =
    activeTab === 'bottles'
      ? SKINS_BOTTLES
      : activeTab === 'caps'
      ? SKINS_CAPS
      : SKINS_TRAILS;

  // Selected item info for 3D stage
  const currentInspectedItem: SkinItem =
    activeTab === 'bottles'
      ? SKINS_BOTTLES.find((b) => b.id === inspectedBottleId) || SKINS_BOTTLES[0]
      : activeTab === 'caps'
      ? SKINS_CAPS.find((c) => c.id === inspectedCapId) || SKINS_CAPS[0]
      : SKINS_TRAILS.find((t) => t.id === inspectedTrailId) || SKINS_TRAILS[0];

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
      if (item.category === 'bottles') setInspectedBottleId(item.id);
      if (item.category === 'caps') setInspectedCapId(item.id);
      if (item.category === 'trails') setInspectedTrailId(item.id);
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
    if (item.category === 'bottles') setInspectedBottleId(item.id);
    if (item.category === 'caps') setInspectedCapId(item.id);
    if (item.category === 'trails') setInspectedTrailId(item.id);
    onSkinEquipped?.(updated.equippedBottle, updated.equippedCap);
  };

  const handleCardClick = (item: SkinItem) => {
    audio.playButton();
    if (item.category === 'bottles') {
      setInspectedBottleId(item.id);
    } else if (item.category === 'caps') {
      setInspectedCapId(item.id);
    } else if (item.category === 'trails') {
      setInspectedTrailId(item.id);
    }
  };

  const isInspectedOwned = skinsState.owned.includes(currentInspectedItem.id);
  const isInspectedEquipped =
    activeTab === 'bottles'
      ? skinsState.equippedBottle === currentInspectedItem.id
      : activeTab === 'caps'
      ? skinsState.equippedCap === currentInspectedItem.id
      : skinsState.equippedTrail === currentInspectedItem.id;
  const isInspectedLocked = !isInspectedOwned && currentInspectedItem.starsRequired > stars;

  const equippedCapColor =
    SKINS_CAPS.find((c) => c.id === skinsState.equippedCap)?.color || '#ef4444';

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-4 max-w-3xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-2">
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

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-['Fredoka']">
            SKIN SHOP
          </h2>
          <div className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider">
            {activeTab === 'bottles'
              ? 'Unique Shapes: Round, Box, Tall & Short'
              : activeTab === 'caps'
              ? 'Vibrant Colored & Metallic Caps'
              : 'Particle Throw Trails'}
          </div>
        </div>

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

      {/* 3D Interactive Inspection Showcase Stage */}
      <BottleShowcaseStage
        bottleId={inspectedBottleId}
        capId={inspectedCapId}
        trailId={activeTab === 'trails' ? inspectedTrailId : skinsState.equippedTrail}
        itemName={currentInspectedItem.name}
        shapeTag={currentInspectedItem.tag || currentInspectedItem.shape?.toUpperCase()}
        isEquipped={isInspectedEquipped}
        isOwned={isInspectedOwned}
        isLocked={isInspectedLocked}
        cost={currentInspectedItem.cost}
        onEquip={() => handleEquip(currentInspectedItem)}
        onBuy={() => handleBuy(currentInspectedItem)}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {(['bottles', 'caps', 'trails'] as const).map((tab) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => {
              audio.playButton();
              setActiveTab(tab);
            }}
            className={`px-5 py-1.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all font-['Fredoka'] ${
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
        <div className="text-center text-xs font-bold text-rose-300 bg-rose-950/90 border border-rose-500/50 py-1.5 px-3 rounded-full mx-auto mb-2 animate-bounce">
          {errorToast}
        </div>
      )}

      {/* Skins Grid (Scrollable) */}
      <div className="flex-1 overflow-y-auto max-h-[46vh] pr-1 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {currentList.map((item) => {
            const isOwned = skinsState.owned.includes(item.id);
            const isEquipped =
              activeTab === 'bottles'
                ? skinsState.equippedBottle === item.id
                : activeTab === 'caps'
                ? skinsState.equippedCap === item.id
                : skinsState.equippedTrail === item.id;

            const isInspected =
              activeTab === 'bottles'
                ? inspectedBottleId === item.id
                : activeTab === 'caps'
                ? inspectedCapId === item.id
                : false;

            const isStarLocked = !isOwned && item.starsRequired > stars;

            return (
              <div
                key={item.id}
                id={`skin-card-${item.id}`}
                onClick={() => handleCardClick(item)}
                className={`relative flex flex-col justify-between p-3 rounded-2xl border-2 cursor-pointer transition-all font-['Fredoka'] bg-slate-900/90 hover:bg-slate-850 ${
                  isEquipped
                    ? 'border-blue-500 shadow-lg shadow-blue-500/25 bg-blue-950/20'
                    : isInspected
                    ? 'border-cyan-400/80 shadow-md shadow-cyan-400/20'
                    : 'border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Visual Thumbnail Preview Container */}
                <div className="w-full h-24 rounded-xl bg-gradient-to-b from-slate-950/80 to-slate-900/90 flex items-center justify-center relative overflow-hidden border border-slate-800/80 group">
                  {/* Detailed Shape/Bottle/Cap Vector Graphic */}
                  <BottleCardThumbnail
                    shape={item.shape}
                    color={item.color}
                    capColor={activeTab === 'caps' ? item.color : equippedCapColor}
                    liquidColor={item.liquidColor}
                    labelText={item.labelText}
                    category={activeTab}
                  />

                  {/* Shape Badge Tag */}
                  {item.tag && (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-cyan-300 text-[9px] font-black tracking-wider border border-slate-700">
                      {item.tag}
                    </div>
                  )}

                  {/* Active / Equipped Badge */}
                  {isEquipped && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black tracking-wider flex items-center gap-0.5 shadow-md">
                      <Check className="w-2.5 h-2.5" /> ACTIVE
                    </div>
                  )}

                  {/* Locked by Star Requirement */}
                  {isStarLocked && (
                    <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-2">
                      <Lock className="w-5 h-5 text-amber-400 mb-1" />
                      <span className="text-[10px] text-amber-300 font-extrabold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 inline" /> {item.starsRequired} Stars
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-black text-slate-100 truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {item.description}
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
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
                      <span>{item.cost}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 font-medium pt-2">
        <Sparkles className="w-3.5 h-3.5 inline text-pink-400 mr-1" />
        Cosmetic only: Every skin uses the exact same realistic physics parameters
      </div>
    </div>
  );
};
