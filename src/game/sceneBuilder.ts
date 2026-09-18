import * as THREE from 'three';
import { SkinItem, TargetObstacle } from '../types';
import { SKINS_BOTTLES, SKINS_CAPS } from '../data/skinsData';

// Safe WebGL shader precision format shim:
// In some browsers, virtualization layers, or when a WebGL context is initialized/restored,
// gl.getShaderPrecisionFormat(...) can return null for unsupported precisions.
// Three.js accesses .precision without null checks, causing "Cannot read properties of null (reading 'precision')".
// This shim guarantees a valid WebGLShaderPrecisionFormat-like object is always returned.
if (typeof window !== 'undefined') {
  const patchPrecisionFormat = (proto: any) => {
    if (!proto || !proto.getShaderPrecisionFormat || proto.__precisionPatched) return;
    try {
      const orig = proto.getShaderPrecisionFormat;
      proto.getShaderPrecisionFormat = function (shaderType: number, precisionType: number) {
        try {
          const res = orig.call(this, shaderType, precisionType);
          if (res && typeof res.precision === 'number') {
            return res;
          }
        } catch (_) {}
        return { rangeMin: 0, rangeMax: 0, precision: 0 };
      };
      proto.__precisionPatched = true;
    } catch (_) {}
  };

  if (typeof WebGLRenderingContext !== 'undefined') {
    patchPrecisionFormat(WebGLRenderingContext.prototype);
  }
  if (typeof WebGL2RenderingContext !== 'undefined') {
    patchPrecisionFormat(WebGL2RenderingContext.prototype);
  }
}

// Generates optimized procedural warm honey oak wood texture with authentic table markings
function createHoneyOakWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Warm golden honey oak base gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 0);
  bgGrad.addColorStop(0, '#be7b39');
  bgGrad.addColorStop(0.25, '#d38b45');
  bgGrad.addColorStop(0.5, '#c8803d');
  bgGrad.addColorStop(0.75, '#db964e');
  bgGrad.addColorStop(1, '#be7b39');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Organic wood grain curves (optimized count for instant load & zero lag)
  for (let i = 0; i < 350; i++) {
    const y = Math.random() * 1024;
    const alpha = 0.04 + Math.random() * 0.06;
    const isDark = Math.random() > 0.35;
    ctx.strokeStyle = isDark
      ? `rgba(88, 44, 18, ${alpha})`
      : `rgba(255, 220, 160, ${alpha * 0.9})`;
    ctx.lineWidth = 1 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      256 + (Math.random() - 0.5) * 60,
      y + (Math.random() - 0.5) * 40,
      768 + (Math.random() - 0.5) * 60,
      y + (Math.random() - 0.5) * 40,
      1024,
      y + (Math.random() - 0.5) * 20
    );
    ctx.stroke();
  }

  // Plank divider grooves
  ctx.strokeStyle = 'rgba(50, 22, 8, 0.2)';
  ctx.lineWidth = 2;
  for (let x = 256; x < 1024; x += 256) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }

  // Subtle clean table launch & target etchings (drawn correctly without inversion)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 240, 210, 0.3)';
  ctx.fillStyle = 'rgba(70, 32, 12, 0.35)';
  ctx.lineWidth = 2;
  ctx.textAlign = 'center';

  // Flip Zone indicator in center
  ctx.font = '800 32px "Fredoka", sans-serif';
  ctx.fillText('• BOTTLE FLIP ZONE •', 512, 512);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

// Parquet hardwood floor texture
function createWarmFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#4a2c18';
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 128;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const isAlt = (r + c) % 2 === 0;
      ctx.fillStyle = isAlt ? '#5c371e' : '#4f2f1a';
      ctx.fillRect(c * tileSize + 2, r * tileSize + 2, tileSize - 4, tileSize - 4);

      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      for (let s = 0; s < tileSize; s += 16) {
        ctx.beginPath();
        if (isAlt) {
          ctx.moveTo(c * tileSize + s, r * tileSize);
          ctx.lineTo(c * tileSize + s, (r + 1) * tileSize);
        } else {
          ctx.moveTo(c * tileSize, r * tileSize + s);
          ctx.lineTo((c + 1) * tileSize, r * tileSize + s);
        }
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

// Chalkboard Poster 1: "SMALL FLIP BIG HAPPINESS 😊"
function createChalkboard1Texture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 700;
  const ctx = canvas.getContext('2d')!;

  // Chalkboard dark slate background
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 700);

  // Subtle chalk texture dust
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.fillRect(Math.random() * 512, Math.random() * 700, Math.random() * 3, Math.random() * 3);
  }

  // Chalk border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, 464, 652);

  // Typography
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';
  ctx.font = '900 64px "Fredoka", sans-serif';
  ctx.fillText('SMALL', 256, 170);
  ctx.fillText('FLIP', 256, 260);
  ctx.fillText('BIG', 256, 350);

  ctx.font = '900 48px "Fredoka", sans-serif';
  ctx.fillText('HAPPINESS', 256, 435);

  ctx.font = '72px sans-serif';
  ctx.fillText('😊', 256, 545);

  return new THREE.CanvasTexture(canvas);
}

// Chalkboard Poster 2: "PRACTICE PLAY IMPROVE BE A PRO 👑"
function createChalkboard2Texture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 700;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 700);

  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.fillRect(Math.random() * 512, Math.random() * 700, Math.random() * 3, Math.random() * 3);
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, 464, 652);

  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';
  ctx.font = '900 48px "Fredoka", sans-serif';
  ctx.fillText('PRACTICE', 256, 150);
  ctx.fillText('PLAY', 256, 230);
  ctx.fillText('IMPROVE', 256, 310);
  ctx.fillText('BE A', 256, 390);

  ctx.font = '900 68px "Fredoka", sans-serif';
  ctx.fillText('PRO', 256, 480);

  ctx.font = '64px sans-serif';
  ctx.fillText('👑', 256, 575);

  return new THREE.CanvasTexture(canvas);
}

// Target Ring Coaster Texture
function createPremiumTargetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const cx = 512;
  const cy = 512;

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(cx, cy, 500, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f766e';
  ctx.beginPath();
  ctx.arc(cx, cy, 460, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(cx, cy, 350, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(cx, cy, 240, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(cx, cy, 130, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 4;
  [460, 350, 240, 130].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  const spikes = 5;
  const outerRadius = 55;
  const innerRadius = 24;
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 36px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('• TARGET ZONE •', cx, 48);
  ctx.fillText('• TARGET ZONE •', cx, 976);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

// Procedural ribbed knurling bump texture for authentic bottle caps
let cachedCapRibBumpTexture: THREE.CanvasTexture | null = null;
export function getCapRibBumpTexture(): THREE.CanvasTexture {
  if (cachedCapRibBumpTexture) return cachedCapRibBumpTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 128);

  // 36 vertical knurling flutes
  const numRidges = 36;
  const ridgeWidth = 512 / numRidges;
  for (let i = 0; i < numRidges; i++) {
    const x = i * ridgeWidth;
    const grad = ctx.createLinearGradient(x, 0, x + ridgeWidth, 0);
    grad.addColorStop(0.0, '#404040');
    grad.addColorStop(0.2, '#ffffff');
    grad.addColorStop(0.8, '#ffffff');
    grad.addColorStop(1.0, '#404040');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 6, ridgeWidth * 0.78, 116);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  cachedCapRibBumpTexture = tex;
  return tex;
}

// High-Definition Realistic Mineral Water Bottle Label
function createBottleLabelTexture(skinColor: string, labelText = 'FLIP'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1536;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Solid vibrant brand background
  ctx.fillStyle = skinColor;
  ctx.fillRect(0, 0, 1536, 512);

  // 2. Subtle metallic gloss gradient sheen
  const gloss = ctx.createLinearGradient(0, 0, 0, 512);
  gloss.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
  gloss.addColorStop(0.12, 'rgba(255, 255, 255, 0.15)');
  gloss.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
  gloss.addColorStop(0.85, 'rgba(0, 0, 0, 0.10)');
  gloss.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, 1536, 512);

  // 3. Dual silver metallic foil trim bands (top and bottom)
  const silverGrad = ctx.createLinearGradient(0, 0, 1536, 0);
  silverGrad.addColorStop(0, '#e2e8f0');
  silverGrad.addColorStop(0.25, '#ffffff');
  silverGrad.addColorStop(0.5, '#cbd5e1');
  silverGrad.addColorStop(0.75, '#ffffff');
  silverGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = silverGrad;
  ctx.fillRect(0, 16, 1536, 10);
  ctx.fillRect(0, 486, 1536, 10);

  // 4. FRONT FACE BRANDING (Centered around x = 768)
  // Stylized mountain / wave crest graphic
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(630, 290);
  ctx.lineTo(768, 220);
  ctx.lineTo(906, 290);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(680, 290);
  ctx.lineTo(768, 245);
  ctx.lineTo(856, 290);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // Primary bold brand title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 128px "Fredoka", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillText(labelText, 768, 175);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Subtitle / specification
  ctx.font = '700 28px sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillText('100% NATURAL SPRING WATER', 768, 335);

  ctx.font = '600 24px monospace';
  ctx.letterSpacing = '2px';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText('500 mL (16.9 FL OZ) • pH 7.6', 768, 375);

  // 5. LEFT PANEL: Nutrition & Electrolytes Table
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(90, 80, 360, 340);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('NUTRITION FACTS', 110, 115);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('Serving Size: 1 Bottle (500mL)', 110, 145);
  ctx.fillText('Calories: 0', 110, 175);
  ctx.fillText('Total Fat: 0g (0% DV)', 110, 205);
  ctx.fillText('Sodium: 5mg (<1% DV)', 110, 235);
  ctx.fillText('Total Carb: 0g (0% DV)', 110, 265);
  ctx.fillText('Protein: 0g', 110, 295);

  ctx.font = 'italic 15px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText('Enhanced with Electrolytes', 110, 340);
  ctx.fillText('Pure Balance & Clean Taste', 110, 365);
  ctx.fillText('BPA Free • Non-Carbonated', 110, 390);
  ctx.restore();

  // 6. RIGHT PANEL: Barcode & Recycling Info
  ctx.save();
  // Barcode white backing box
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(1150, 110, 280, 150);

  // Vertical barcode bars
  ctx.fillStyle = '#000000';
  const barPattern = [3, 2, 4, 1, 2, 4, 2, 1, 3, 2, 1, 4, 3, 2, 1, 2, 4, 2, 1, 3, 4, 2, 1, 3, 2];
  let curX = 1175;
  for (let i = 0; i < barPattern.length; i++) {
    const w = barPattern[i] * 2.2;
    if (i % 2 === 0) {
      ctx.fillRect(curX, 125, w, 95);
    }
    curX += w + 2.5;
  }

  // Barcode numbers
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.fillText('8  901234  567890', 1290, 242);

  // Recycling & eco icons
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('♻ 1 PETE', 1290, 310);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText('PLEASE RECYCLE', 1290, 345);
  ctx.fillText('SOURCE: MOUNTAIN SPRING', 1290, 375);
  ctx.fillText('BOTTLED AT THE SOURCE', 1290, 400);
  ctx.restore();

  return new THREE.CanvasTexture(canvas);
}

// Cached procedural textures to prevent GPU memory leaks and repeat context exhaustion
let cachedHoneyOakWoodTexture: THREE.CanvasTexture | null = null;
let cachedWarmFloorTexture: THREE.CanvasTexture | null = null;
let cachedChalkboard1Texture: THREE.CanvasTexture | null = null;
let cachedChalkboard2Texture: THREE.CanvasTexture | null = null;
let cachedPremiumTargetTexture: THREE.CanvasTexture | null = null;
const cachedBottleLabelTextures = new Map<string, THREE.CanvasTexture>();

export function getHoneyOakWoodTexture(): THREE.CanvasTexture {
  if (!cachedHoneyOakWoodTexture) {
    cachedHoneyOakWoodTexture = createHoneyOakWoodTexture();
  }
  return cachedHoneyOakWoodTexture;
}

export function getWarmFloorTexture(): THREE.CanvasTexture {
  if (!cachedWarmFloorTexture) {
    cachedWarmFloorTexture = createWarmFloorTexture();
  }
  return cachedWarmFloorTexture;
}

export function getChalkboard1Texture(): THREE.CanvasTexture {
  if (!cachedChalkboard1Texture) {
    cachedChalkboard1Texture = createChalkboard1Texture();
  }
  return cachedChalkboard1Texture;
}

export function getChalkboard2Texture(): THREE.CanvasTexture {
  if (!cachedChalkboard2Texture) {
    cachedChalkboard2Texture = createChalkboard2Texture();
  }
  return cachedChalkboard2Texture;
}

export function getPremiumTargetTexture(): THREE.CanvasTexture {
  if (!cachedPremiumTargetTexture) {
    cachedPremiumTargetTexture = createPremiumTargetTexture();
  }
  return cachedPremiumTargetTexture;
}

export function getBottleLabelTexture(skinColor: string, labelText = 'FLIP'): THREE.CanvasTexture {
  const key = `${skinColor}_${labelText}`;
  let tex = cachedBottleLabelTextures.get(key);
  if (!tex) {
    tex = createBottleLabelTexture(skinColor, labelText);
    cachedBottleLabelTextures.set(key, tex);
  }
  return tex;
}

// Standalone 3D Bottle Generator supporting all unique shapes & materials
export function createStandaloneBottleMesh(
  skinId = 'classic',
  capId = 'capRed',
  overrides?: {
    bodyTint?: string;
    capColor?: string;
    liquidColor?: string;
    labelText?: string;
  }
): THREE.Group {
  const bottleGroup = new THREE.Group();

  const skin: SkinItem =
    SKINS_BOTTLES.find((s) => s.id === skinId) || SKINS_BOTTLES[0];
  const cap: SkinItem =
    SKINS_CAPS.find((c) => c.id === capId) || SKINS_CAPS[0];

  const baseOffsetY = -0.14;
  const bodyColor = overrides?.bodyTint || skin.color;
  const capColor = overrides?.capColor || cap.color;
  const liquidColor = overrides?.liquidColor || (skin.liquidColor || skin.accentColor || skin.color);
  const labelText = overrides?.labelText || (skin.labelText || 'FLIP');
  const shape = skin.shape || 'classic';

  // 1. CAP MATERIAL
  let capMat: THREE.Material;
  if (cap.transmission && cap.transmission > 0.5) {
    capMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(capColor),
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.85,
      transparent: true,
      opacity: 0.9,
      ior: 1.55,
      clearcoat: 1.0,
    });
  } else {
    capMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(capColor),
      roughness: cap.roughness ?? 0.22,
      metalness: cap.metalness ?? 0.2,
      bumpMap: getCapRibBumpTexture(),
      bumpScale: 0.045,
      ...(cap.emissive ? { emissive: new THREE.Color(cap.emissive), emissiveIntensity: 0.6 } : {}),
    });
  }

  // 2. BODY MATERIAL
  let bodyMat: THREE.Material;
  if (shape === 'gold') {
    bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#eab308'),
      roughness: 0.10,
      metalness: 0.98,
    });
  } else if (shape === 'diamond') {
    bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f1f5f9'),
      roughness: 0.02,
      metalness: 0.08,
      transmission: 0.94,
      transparent: true,
      opacity: 0.94,
      ior: 1.65,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.95,
    });
  } else if (shape === 'box' && skin.id === 'box_carton') {
    bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f8fafc'),
      roughness: 0.35,
      metalness: 0.05,
    });
  } else {
    bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(bodyColor),
      roughness: skin.roughness ?? 0.05,
      metalness: skin.metalness ?? 0.1,
      transmission: skin.transmission ?? 0.78,
      transparent: true,
      opacity: 0.92,
      ior: 1.51,
      clearcoat: 0.9,
      clearcoatRoughness: 0.04,
      reflectivity: 0.88,
      ...(skin.emissive ? { emissive: new THREE.Color(skin.emissive), emissiveIntensity: 0.5 } : {}),
    });
  }

  // 3. LIQUID MATERIAL
  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(liquidColor),
    roughness: 0.02,
    metalness: 0.0,
    transmission: 0.88,
    transparent: true,
    opacity: 0.84,
    ior: 1.333,
  });

  // --- SHAPE VARIATIONS ---
  if (shape === 'round') {
    // ------------------------------------
    // 1. ROUND SPHERICAL POTION ORB
    // ------------------------------------
    const orbPoints: THREE.Vector2[] = [];
    const rBase = 0.076;
    const rBulge = 0.116;
    const rNeck = 0.034;

    // Center indentation base
    orbPoints.push(new THREE.Vector2(0.001, 0.004));
    orbPoints.push(new THREE.Vector2(0.030, 0.008));
    orbPoints.push(new THREE.Vector2(0.058, 0.000));
    orbPoints.push(new THREE.Vector2(rBase, 0.015));

    // Spherical expansion
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const angle = -Math.PI / 2 + t * Math.PI; // -90 deg to +90 deg
      const radiusAtT = rBase + (rBulge - rBase) * Math.cos(angle);
      const yAtT = 0.02 + 0.16 + Math.sin(angle) * 0.15;
      orbPoints.push(new THREE.Vector2(radiusAtT, yAtT));
    }

    // Elegant curving neck
    orbPoints.push(new THREE.Vector2(rNeck * 1.35, 0.355));
    orbPoints.push(new THREE.Vector2(rNeck, 0.385));
    orbPoints.push(new THREE.Vector2(rNeck * 1.15, 0.410)); // Gold collar ring
    orbPoints.push(new THREE.Vector2(rNeck, 0.420));
    orbPoints.push(new THREE.Vector2(rNeck, 0.448));

    const orbGeom = new THREE.LatheGeometry(orbPoints, 64);
    orbGeom.translate(0, baseOffsetY, 0);
    const bodyMesh = new THREE.Mesh(orbGeom, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bottleGroup.add(bodyMesh);

    // Rounded liquid inside
    const liqPoints: THREE.Vector2[] = [];
    liqPoints.push(new THREE.Vector2(0.001, 0.006));
    liqPoints.push(new THREE.Vector2(0.056, 0.008));
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const angle = -Math.PI / 2 + t * (Math.PI * 0.48);
      const r = (rBase + (rBulge - rBase) * Math.cos(angle)) * 0.94;
      const y = 0.02 + 0.16 + Math.sin(angle) * 0.145;
      liqPoints.push(new THREE.Vector2(r, y));
    }
    liqPoints.push(new THREE.Vector2(0.001, 0.165));
    const liqGeom = new THREE.LatheGeometry(liqPoints, 48);
    liqGeom.translate(0, baseOffsetY, 0);
    const liqMesh = new THREE.Mesh(liqGeom, liquidMat);
    bottleGroup.add(liqMesh);

    // Golden Rune Collar Ring
    const ringGeom = new THREE.TorusGeometry(rNeck * 1.12, 0.008, 16, 48);
    ringGeom.rotateX(Math.PI / 2);
    ringGeom.translate(0, baseOffsetY + 0.395, 0);
    const goldMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.85, roughness: 0.2 });
    const collar = new THREE.Mesh(ringGeom, goldMat);
    bottleGroup.add(collar);

    // Circular center seal emblem
    const sealGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.004, 32);
    sealGeom.rotateX(Math.PI / 2);
    sealGeom.translate(0, baseOffsetY + 0.17, rBulge * 0.98);
    const sealMat = new THREE.MeshStandardMaterial({ color: capColor, metalness: 0.4, roughness: 0.3 });
    bottleGroup.add(new THREE.Mesh(sealGeom, sealMat));

    // Cap
    const capGeom = new THREE.CylinderGeometry(0.038, 0.038, 0.038, 48);
    capGeom.translate(0, baseOffsetY + 0.45, 0);
    const capMesh = new THREE.Mesh(capGeom, capMat);
    capMesh.castShadow = true;
    bottleGroup.add(capMesh);

  } else if (shape === 'box') {
    // ------------------------------------
    // 2. BOX CARTON / CYBER CUBE BOTTLE
    // ------------------------------------
    const boxW = 0.155;
    const boxD = 0.155;
    const boxH = 0.32;
    const rNeck = 0.035;

    // Rounded rectangle shape for box extrusion
    const shapeBox = new THREE.Shape();
    const cr = 0.024;
    const bx = -boxW / 2;
    const bz = -boxD / 2;
    shapeBox.moveTo(bx + cr, bz);
    shapeBox.lineTo(bx + boxW - cr, bz);
    shapeBox.quadraticCurveTo(bx + boxW, bz, bx + boxW, bz + cr);
    shapeBox.lineTo(bx + boxW, bz + boxD - cr);
    shapeBox.quadraticCurveTo(bx + boxW, bz + boxD, bx + boxW - cr, bz + boxD);
    shapeBox.lineTo(bx + cr, bz + boxD);
    shapeBox.quadraticCurveTo(bx, bz + boxD, bx, bz + boxD - cr);
    shapeBox.lineTo(bx, bz + cr);
    shapeBox.quadraticCurveTo(bx, bz, bx + cr, bz);

    const extrudeSettings = {
      depth: boxH,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.008,
      bevelThickness: 0.008,
    };
    const boxGeom = new THREE.ExtrudeGeometry(shapeBox, extrudeSettings);
    boxGeom.rotateX(Math.PI / 2);
    boxGeom.translate(0, baseOffsetY + boxH + 0.008, 0);

    const bodyMesh = new THREE.Mesh(boxGeom, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bottleGroup.add(bodyMesh);

    // Liquid block inside
    if (skin.id !== 'box_carton') {
      const liqBoxGeom = new THREE.BoxGeometry(boxW * 0.90, 0.14, boxD * 0.90);
      liqBoxGeom.translate(0, baseOffsetY + 0.075, 0);
      const liqMesh = new THREE.Mesh(liqBoxGeom, liquidMat);
      bottleGroup.add(liqMesh);
    }

    // Threaded neck mount on top of box
    const neckGeom = new THREE.CylinderGeometry(rNeck * 1.05, rNeck * 1.35, 0.08, 32);
    neckGeom.translate(0, baseOffsetY + boxH + 0.045, 0);
    const neckMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.2, metalness: 0.1 });
    bottleGroup.add(new THREE.Mesh(neckGeom, neckMat));

    // Brand Label Front Plate
    const frontLabelGeom = new THREE.PlaneGeometry(boxW * 0.88, boxH * 0.58);
    const frontLabelTex = getBottleLabelTexture(capColor, labelText);
    const labelMat = new THREE.MeshStandardMaterial({ map: frontLabelTex, roughness: 0.2, side: THREE.DoubleSide });
    const frontLabel = new THREE.Mesh(frontLabelGeom, labelMat);
    frontLabel.position.set(0, baseOffsetY + boxH * 0.55, boxD * 0.5 + 0.009);
    bottleGroup.add(frontLabel);

    // Cap
    const capGeom = new THREE.CylinderGeometry(0.040, 0.040, 0.038, 48);
    capGeom.translate(0, baseOffsetY + boxH + 0.088, 0);
    const capMesh = new THREE.Mesh(capGeom, capMat);
    capMesh.castShadow = true;
    bottleGroup.add(capMesh);

  } else if (shape === 'tall') {
    // ------------------------------------
    // 3. TALL SLENDER THERMOS / LOMBA FLASK
    // ------------------------------------
    const tallPoints: THREE.Vector2[] = [];
    const rBase = 0.068;
    const rNeck = 0.032;

    tallPoints.push(new THREE.Vector2(0.001, 0.003));
    tallPoints.push(new THREE.Vector2(0.045, 0.006));
    tallPoints.push(new THREE.Vector2(rBase, 0.020));

    // Tall slender body
    tallPoints.push(new THREE.Vector2(rBase, 0.150));
    tallPoints.push(new THREE.Vector2(rBase * 0.96, 0.240)); // subtle waist cinch
    tallPoints.push(new THREE.Vector2(rBase, 0.330));
    tallPoints.push(new THREE.Vector2(rBase * 0.98, 0.400));
    tallPoints.push(new THREE.Vector2(rNeck * 1.35, 0.440));
    tallPoints.push(new THREE.Vector2(rNeck, 0.455));
    tallPoints.push(new THREE.Vector2(rNeck, 0.475));

    const tallGeom = new THREE.LatheGeometry(tallPoints, 64);
    tallGeom.translate(0, baseOffsetY, 0);
    const bodyMesh = new THREE.Mesh(tallGeom, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bottleGroup.add(bodyMesh);

    // Tall liquid column
    const liqPoints: THREE.Vector2[] = [];
    liqPoints.push(new THREE.Vector2(0.001, 0.005));
    liqPoints.push(new THREE.Vector2(rBase * 0.90, 0.010));
    liqPoints.push(new THREE.Vector2(rBase * 0.90, 0.170));
    liqPoints.push(new THREE.Vector2(0.001, 0.175));
    const liqGeom = new THREE.LatheGeometry(liqPoints, 48);
    liqGeom.translate(0, baseOffsetY, 0);
    bottleGroup.add(new THREE.Mesh(liqGeom, liquidMat));

    // Metallic sports grip bands
    const trimGeom = new THREE.CylinderGeometry(rBase * 1.01, rBase * 1.01, 0.012, 48);
    const trimMat = new THREE.MeshStandardMaterial({ color: capColor, metalness: 0.8, roughness: 0.2 });
    [0.18, 0.38].forEach((ty) => {
      const trim = new THREE.Mesh(trimGeom, trimMat);
      trim.position.set(0, baseOffsetY + ty, 0);
      bottleGroup.add(trim);
    });

    // Label band
    const labelGeom = new THREE.CylinderGeometry(rBase * 1.005, rBase * 1.005, 0.09, 64, 1, true);
    labelGeom.translate(0, baseOffsetY + 0.28, 0);
    const labelTex = getBottleLabelTexture(capColor, labelText);
    const labelMat = new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.2, side: THREE.DoubleSide });
    bottleGroup.add(new THREE.Mesh(labelGeom, labelMat));

    // Cap
    const capGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.038, 48);
    capGeom.translate(0, baseOffsetY + 0.48, 0);
    const capMesh = new THREE.Mesh(capGeom, capMat);
    capMesh.castShadow = true;
    bottleGroup.add(capMesh);

  } else if (shape === 'short') {
    // ------------------------------------
    // 4. SHORT CHUBBY MINI POCKET BOTTLE
    // ------------------------------------
    const shortPoints: THREE.Vector2[] = [];
    const rBase = 0.096;
    const rNeck = 0.045;

    shortPoints.push(new THREE.Vector2(0.001, 0.004));
    shortPoints.push(new THREE.Vector2(0.055, 0.008));
    shortPoints.push(new THREE.Vector2(rBase, 0.022));

    // Chubby stout body
    shortPoints.push(new THREE.Vector2(rBase, 0.160));
    shortPoints.push(new THREE.Vector2(rBase * 0.94, 0.220));
    shortPoints.push(new THREE.Vector2(rNeck * 1.35, 0.270));
    shortPoints.push(new THREE.Vector2(rNeck, 0.300));
    shortPoints.push(new THREE.Vector2(rNeck, 0.330));

    const shortGeom = new THREE.LatheGeometry(shortPoints, 64);
    shortGeom.translate(0, baseOffsetY, 0);
    const bodyMesh = new THREE.Mesh(shortGeom, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bottleGroup.add(bodyMesh);

    // Chubby liquid inside
    const liqPoints: THREE.Vector2[] = [];
    liqPoints.push(new THREE.Vector2(0.001, 0.006));
    liqPoints.push(new THREE.Vector2(rBase * 0.92, 0.010));
    liqPoints.push(new THREE.Vector2(rBase * 0.92, 0.130));
    liqPoints.push(new THREE.Vector2(0.001, 0.135));
    const liqGeom = new THREE.LatheGeometry(liqPoints, 48);
    liqGeom.translate(0, baseOffsetY, 0);
    bottleGroup.add(new THREE.Mesh(liqGeom, liquidMat));

    // Wide chunky label
    const labelGeom = new THREE.CylinderGeometry(rBase * 1.005, rBase * 1.005, 0.08, 64, 1, true);
    labelGeom.translate(0, baseOffsetY + 0.11, 0);
    const labelTex = getBottleLabelTexture(capColor, labelText);
    const labelMat = new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.2, side: THREE.DoubleSide });
    bottleGroup.add(new THREE.Mesh(labelGeom, labelMat));

    // Chunky wide cap
    const capGeom = new THREE.CylinderGeometry(0.048, 0.048, 0.038, 48);
    capGeom.translate(0, baseOffsetY + 0.34, 0);
    const capMesh = new THREE.Mesh(capGeom, capMat);
    capMesh.castShadow = true;
    bottleGroup.add(capMesh);

  } else if (shape === 'diamond') {
    // ------------------------------------
    // 5. FACETED PRISMATIC CRYSTAL DECANTER
    // ------------------------------------
    const rBase = 0.088;
    const rNeck = 0.035;

    // 8-sided faceted octagonal decanter
    const diaGeom = new THREE.CylinderGeometry(rBase * 0.92, rBase, 0.34, 8, 3);
    diaGeom.translate(0, baseOffsetY + 0.17, 0);
    const bodyMesh = new THREE.Mesh(diaGeom, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bottleGroup.add(bodyMesh);

    // Octagonal liquid inside
    const liqGeom = new THREE.CylinderGeometry(rBase * 0.85, rBase * 0.88, 0.14, 8);
    liqGeom.translate(0, baseOffsetY + 0.08, 0);
    bottleGroup.add(new THREE.Mesh(liqGeom, liquidMat));

    // Neck ring
    const neckGeom = new THREE.CylinderGeometry(rNeck, rNeck * 1.35, 0.08, 16);
    neckGeom.translate(0, baseOffsetY + 0.38, 0);
    bottleGroup.add(new THREE.Mesh(neckGeom, bodyMat));

    // Jewel Cap
    const capGeom = new THREE.CylinderGeometry(0.042, 0.042, 0.042, 8);
    capGeom.translate(0, baseOffsetY + 0.44, 0);
    const capMesh = new THREE.Mesh(capGeom, capMat);
    capMesh.castShadow = true;
    bottleGroup.add(capMesh);

  } else if (shape === 'soda') {
    // ------------------------------------
    // 6. HOURGLASS SODA BOTTLE
    // ------------------------------------
    const sodaPoints: THREE.Vector2[] = [];
    const rBase = 0.084;
    const rNeck = 0.034;

    sodaPoints.push(new THREE.Vector2(0.001, 0.004));
    sodaPoints.push(new THREE.Vector2(0.048, 0.000));
    sodaPoints.push(new THREE.Vector2(rBase, 0.024));
    sodaPoints.push(new THREE.Vector2(rBase * 0.96, 0.090));
    sodaPoints.push(new THREE.Vector2(0.068, 0.160)); // Waist cinch
    sodaPoints.push(new THREE.Vector2(0.083, 0.260)); // Upper chest
    sodaPoints.push(new THREE.Vector2(0.076, 0.330));
    sodaPoints.push(new THREE.Vector2(rNeck * 1.35, 0.390));
    sodaPoints.push(new THREE.Vector2(rNeck, 0.420));
    sodaPoints.push(new THREE.Vector2(rNeck, 0.448));

    const sodaGeom = new THREE.LatheGeometry(sodaPoints, 64);
    sodaGeom.translate(0, baseOffsetY, 0);
    const bodyMesh = new THREE.Mesh(sodaGeom, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bottleGroup.add(bodyMesh);

    // Soda liquid
    const liqPoints: THREE.Vector2[] = [];
    liqPoints.push(new THREE.Vector2(0.001, 0.006));
    liqPoints.push(new THREE.Vector2(rBase * 0.90, 0.010));
    liqPoints.push(new THREE.Vector2(0.065, 0.150));
    liqPoints.push(new THREE.Vector2(0.001, 0.155));
    const liqGeom = new THREE.LatheGeometry(liqPoints, 48);
    liqGeom.translate(0, baseOffsetY, 0);
    bottleGroup.add(new THREE.Mesh(liqGeom, liquidMat));

    // Label band in upper chest
    const labelGeom = new THREE.CylinderGeometry(0.081, 0.081, 0.075, 64, 1, true);
    labelGeom.translate(0, baseOffsetY + 0.25, 0);
    const labelTex = getBottleLabelTexture(capColor, labelText);
    const labelMat = new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.18, side: THREE.DoubleSide });
    bottleGroup.add(new THREE.Mesh(labelGeom, labelMat));

    // Cap
    const capGeom = new THREE.CylinderGeometry(0.038, 0.038, 0.038, 48);
    capGeom.translate(0, baseOffsetY + 0.455, 0);
    const capMesh = new THREE.Mesh(capGeom, capMat);
    capMesh.castShadow = true;
    bottleGroup.add(capMesh);

  } else {
    // ------------------------------------
    // 7. CLASSIC RIBBED PET BOTTLE / SPORT / GOLD / GALAXY
    // ------------------------------------
    const points: THREE.Vector2[] = [];
    const rBase = 0.084;
    const rRibOut = 0.085;
    const rRibIn = 0.078;
    const rNeck = 0.035;

    points.push(new THREE.Vector2(0.001, 0.004));
    points.push(new THREE.Vector2(0.024, 0.012));
    points.push(new THREE.Vector2(0.058, 0.000));
    points.push(new THREE.Vector2(rBase * 0.94, 0.003));
    points.push(new THREE.Vector2(rBase, 0.022));

    points.push(new THREE.Vector2(rBase, 0.095));
    points.push(new THREE.Vector2(rRibIn, 0.110));
    points.push(new THREE.Vector2(rRibOut, 0.125));
    points.push(new THREE.Vector2(rRibIn, 0.140));
    points.push(new THREE.Vector2(rRibOut, 0.155));
    points.push(new THREE.Vector2(rRibIn, 0.170));
    points.push(new THREE.Vector2(rRibOut, 0.185));

    points.push(new THREE.Vector2(rBase, 0.195));
    points.push(new THREE.Vector2(rBase, 0.285));

    points.push(new THREE.Vector2(rRibIn, 0.298));
    points.push(new THREE.Vector2(rRibOut, 0.312));

    points.push(new THREE.Vector2(rBase * 0.96, 0.340));
    points.push(new THREE.Vector2(rBase * 0.72, 0.380));
    points.push(new THREE.Vector2(rNeck * 1.35, 0.412));
    points.push(new THREE.Vector2(rNeck, 0.428));
    points.push(new THREE.Vector2(rNeck * 1.08, 0.438));
    points.push(new THREE.Vector2(rNeck, 0.444));
    points.push(new THREE.Vector2(rNeck, 0.458));

    const latheGeom = new THREE.LatheGeometry(points, 64);
    latheGeom.translate(0, baseOffsetY, 0);
    const bodyMesh = new THREE.Mesh(latheGeom, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bottleGroup.add(bodyMesh);

    // Liquid
    const waterPoints: THREE.Vector2[] = [];
    waterPoints.push(new THREE.Vector2(0.001, 0.006));
    waterPoints.push(new THREE.Vector2(rBase * 0.92, 0.008));
    waterPoints.push(new THREE.Vector2(rBase * 0.94, 0.136));
    waterPoints.push(new THREE.Vector2(rBase * 0.86, 0.144));
    waterPoints.push(new THREE.Vector2(0.001, 0.144));

    const waterGeom = new THREE.LatheGeometry(waterPoints, 48);
    waterGeom.translate(0, baseOffsetY, 0);
    const waterMesh = new THREE.Mesh(waterGeom, liquidMat);
    bottleGroup.add(waterMesh);

    // Wrap label
    const labelGeom = new THREE.CylinderGeometry(0.083, 0.083, 0.088, 64, 1, true);
    labelGeom.translate(0, baseOffsetY + 0.24, 0);
    const labelTex = getBottleLabelTexture(capColor, labelText);
    const labelMat = new THREE.MeshStandardMaterial({
      map: labelTex,
      roughness: 0.18,
      metalness: 0.06,
      side: THREE.DoubleSide,
    });
    bottleGroup.add(new THREE.Mesh(labelGeom, labelMat));

    // Cap & seal
    const capGeom = new THREE.CylinderGeometry(0.038, 0.038, 0.038, 48);
    capGeom.translate(0, baseOffsetY + 0.46, 0);
    const capMesh = new THREE.Mesh(capGeom, capMat);
    capMesh.castShadow = true;
    bottleGroup.add(capMesh);

    const sealGeom = new THREE.TorusGeometry(0.037, 0.004, 16, 48);
    sealGeom.rotateX(Math.PI / 2);
    sealGeom.translate(0, baseOffsetY + 0.438, 0);
    bottleGroup.add(new THREE.Mesh(sealGeom, capMat));
  }

  return bottleGroup;
}

export function createSafeWebGLRenderer(
  canvas: HTMLCanvasElement,
  customOptions?: { alpha?: boolean; antialias?: boolean; powerPreference?: 'default' | 'high-performance' | 'low-power' }
): THREE.WebGLRenderer {
  // CRITICAL: Prevent default on webglcontextlost so browser doesn't block the origin
  canvas.addEventListener(
    'webglcontextlost',
    (e: Event) => {
      e.preventDefault();
      console.warn('[ThreeJS] WebGL context loss captured - default prevented to allow restoration');
    },
    false
  );

  const reqAlpha = customOptions?.alpha ?? false;
  const reqAntialias = customOptions?.antialias ?? true;

  const configs: THREE.WebGLRendererParameters[] = [
    {
      canvas,
      antialias: reqAntialias,
      powerPreference: customOptions?.powerPreference || 'default',
      failIfMajorPerformanceCaveat: false,
      alpha: reqAlpha,
    },
    {
      canvas,
      antialias: false,
      powerPreference: 'default',
      precision: 'mediump',
      failIfMajorPerformanceCaveat: false,
      alpha: reqAlpha,
    },
    {
      canvas,
      antialias: false,
      powerPreference: 'low-power',
      precision: 'lowp',
      failIfMajorPerformanceCaveat: false,
      alpha: reqAlpha,
    },
  ];

  let lastErrorMsg = 'Unknown WebGL initialization error';
  for (let i = 0; i < configs.length; i++) {
    const cfg = configs[i];
    try {
      const renderer = new THREE.WebGLRenderer(cfg);
      return renderer;
    } catch (err) {
      lastErrorMsg = err instanceof Error ? err.message : String(err);
      // NOTE: NEVER log the cfg object directly because cfg.canvas contains React Fiber circular references,
      // which crashes JSON.stringify in preview iframe log serializers!
      console.warn(
        `[ThreeJS] WebGL init fallback attempt #${i + 1} (precision: ${cfg.precision || 'default'}): ${lastErrorMsg}`
      );
    }
  }

  throw new Error(`WebGL context could not be created: ${lastErrorMsg}`);
}

export class SceneBuilder {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public tableMesh!: THREE.Mesh;
  public longTableGroup!: THREE.Group;
  public shortTableGroup!: THREE.Group;
  public targetMesh!: THREE.Mesh;
  public obstacleGroup: THREE.Group;
  public studioLightsGroup: THREE.Group;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    // Warm sunlit room background tone
    this.scene.background = new THREE.Color('#dce6ed');

    const width = Math.max(canvas.clientWidth || 300, 100);
    const height = Math.max(canvas.clientHeight || 300, 100);

    this.camera = new THREE.PerspectiveCamera(
      48,
      width / height,
      0.1,
      60
    );
    // Adjusted camera framing to match the photo: wide horizontal table view
    this.camera.position.set(0, 1.75, -1.9);
    this.camera.lookAt(0, 0.55, 1.45);

    this.renderer = createSafeWebGLRenderer(canvas);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.obstacleGroup = new THREE.Group();
    this.scene.add(this.obstacleGroup);

    this.studioLightsGroup = new THREE.Group();
    this.scene.add(this.studioLightsGroup);

    this.buildEnvironment();
  }

  private buildEnvironment() {
    // 1. BALANCED WARM ROOM LIGHTING (Rich honey oak table tones without glare or bleaching)
    // Ambient warm sky & room bounce
    const ambientLight = new THREE.AmbientLight('#fff7ed', 0.85);
    this.studioLightsGroup.add(ambientLight);

    // Warm Sunbeam directional light pouring through the window (Left side)
    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.5);
    sunLight.position.set(-3.2, 5.0, -0.4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 14;
    sunLight.shadow.camera.left = -3.5;
    sunLight.shadow.camera.right = 3.5;
    sunLight.shadow.camera.top = 3.5;
    sunLight.shadow.camera.bottom = -3.5;
    sunLight.shadow.bias = -0.0003;
    this.studioLightsGroup.add(sunLight);

    // Soft overhead room fill
    const fillLight = new THREE.PointLight('#fef3c7', 0.65, 12);
    fillLight.position.set(1.5, 3.8, 1.8);
    this.studioLightsGroup.add(fillLight);

    // Subtle sky bounce
    const skyLight = new THREE.DirectionalLight('#bae6fd', 0.45);
    skyLight.position.set(0, 4.0, 4.0);
    this.studioLightsGroup.add(skyLight);

    // 2. FLOOR (Warm hardwood parquet)
    const floorGeom = new THREE.PlaneGeometry(18, 22);
    const floorMat = new THREE.MeshStandardMaterial({
      map: getWarmFloorTexture(),
      roughness: 0.5,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, -1.85, 2.5);
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // 3. SUNLIT ROOM WALLS & WINDOW
    this.buildRoomArchitecture();

    // 4. GOLDEN OAK DINING TABLE WITH CARVED TEXT
    this.buildGoldenOakTable();

    // 5. TARGET COASTER
    this.buildTargetCoaster();
  }

  private buildRoomArchitecture() {
    // Back wall: Cozy warm cream / beige room tone
    const backWallGeom = new THREE.PlaneGeometry(18, 11);
    const backWallMat = new THREE.MeshStandardMaterial({
      color: '#e4dacf',
      roughness: 0.85,
    });
    const backWall = new THREE.Mesh(backWallGeom, backWallMat);
    backWall.position.set(0, 3.2, 7.5);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Left wall with large sunlit window
    const leftWallGeom = new THREE.PlaneGeometry(16, 11);
    const leftWallMat = new THREE.MeshStandardMaterial({
      color: '#dfd4c7',
      roughness: 0.85,
    });
    const leftWall = new THREE.Mesh(leftWallGeom, leftWallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-5.5, 3.2, 2.5);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // Window Frame on Left Wall
    const winGroup = new THREE.Group();
    const winGeom = new THREE.PlaneGeometry(5.0, 4.2);
    const winGlassMat = new THREE.MeshBasicMaterial({
      color: '#cce6ff', // Bright daylight sky view
    });
    const winGlass = new THREE.Mesh(winGeom, winGlassMat);
    winGlass.rotation.y = Math.PI / 2;
    winGlass.position.set(-5.42, 3.2, 0.5);
    winGroup.add(winGlass);

    // Window Mullions / Wooden Panes
    const frameMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 });
    const hBarGeom = new THREE.BoxGeometry(0.08, 0.08, 5.0);
    const hBar = new THREE.Mesh(hBarGeom, frameMat);
    hBar.position.set(-5.4, 3.2, 0.5);
    winGroup.add(hBar);

    const vBarGeom = new THREE.BoxGeometry(0.08, 4.2, 0.08);
    const vBar = new THREE.Mesh(vBarGeom, frameMat);
    vBar.position.set(-5.4, 3.2, 0.5);
    winGroup.add(vBar);
    this.scene.add(winGroup);

    // Chalkboard Poster 1 (Left wall): "SMALL FLIP BIG HAPPINESS 😊"
    this.createFramedChalkboard(
      -2.4,
      3.2,
      7.42,
      getChalkboard1Texture(),
      1.7,
      2.3
    );

    // Chalkboard Poster 2 (Right wall): "PRACTICE PLAY IMPROVE BE A PRO 👑"
    this.createFramedChalkboard(
      2.4,
      3.2,
      7.42,
      getChalkboard2Texture(),
      1.7,
      2.3
    );

    // Decorative Houseplant on Left Corner Shelf
    this.createPottedPlant(-3.8, 1.2, 4.8);
    this.createPottedPlant(3.8, 1.2, 5.2);

    // Bookshelf with "GOOD VIBES PLAY MORE" on left
    this.createBookshelf(-3.6, -0.4, 2.8);

    // Cozy Table Lamp on Right
    this.createTableLamp(3.6, -0.2, 3.0);
  }

  // Framed Chalkboards
  private createFramedChalkboard(
    x: number,
    y: number,
    z: number,
    texture: THREE.CanvasTexture,
    w: number,
    h: number
  ) {
    const group = new THREE.Group();

    // Canvas board
    const boardGeom = new THREE.PlaneGeometry(w, h);
    const boardMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.6 });
    const boardMesh = new THREE.Mesh(boardGeom, boardMat);
    boardMesh.position.set(x, y, z);
    group.add(boardMesh);

    // Natural wood frame
    const frameThickness = 0.1;
    const frameDepth = 0.05;
    const frameMat = new THREE.MeshStandardMaterial({
      color: '#8b5a2b',
      roughness: 0.4,
    });

    // Top & Bottom bars
    const tbGeom = new THREE.BoxGeometry(w + frameThickness * 2, frameThickness, frameDepth);
    const topBar = new THREE.Mesh(tbGeom, frameMat);
    topBar.position.set(x, y + h / 2 + frameThickness / 2, z - 0.01);
    group.add(topBar);

    const botBar = new THREE.Mesh(tbGeom, frameMat);
    botBar.position.set(x, y - h / 2 - frameThickness / 2, z - 0.01);
    group.add(botBar);

    // Left & Right bars
    const lrGeom = new THREE.BoxGeometry(frameThickness, h, frameDepth);
    const leftBar = new THREE.Mesh(lrGeom, frameMat);
    leftBar.position.set(x - w / 2 - frameThickness / 2, y, z - 0.01);
    group.add(leftBar);

    const rightBar = new THREE.Mesh(lrGeom, frameMat);
    rightBar.position.set(x + w / 2 + frameThickness / 2, y, z - 0.01);
    group.add(rightBar);

    this.scene.add(group);
  }

  // Potted Houseplant with lush green leaves
  private createPottedPlant(x: number, y: number, z: number) {
    const plantGroup = new THREE.Group();

    // White ceramic pot
    const potGeom = new THREE.CylinderGeometry(0.24, 0.18, 0.42, 32);
    const potMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2 });
    const pot = new THREE.Mesh(potGeom, potMat);
    pot.position.set(x, y, z);
    pot.castShadow = true;
    pot.receiveShadow = true;
    plantGroup.add(pot);

    // Soil
    const soilGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 24);
    const soilMat = new THREE.MeshStandardMaterial({ color: '#27170c', roughness: 0.9 });
    const soil = new THREE.Mesh(soilGeom, soilMat);
    soil.position.set(x, y + 0.2, z);
    plantGroup.add(soil);

    // Leaves
    const leafMat = new THREE.MeshStandardMaterial({
      color: '#22c55e',
      roughness: 0.35,
      side: THREE.DoubleSide,
    });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const leafGeom = new THREE.SphereGeometry(0.26, 16, 16);
      leafGeom.scale(0.5, 0.08, 1.2);
      const leaf = new THREE.Mesh(leafGeom, leafMat);
      leaf.position.set(
        x + Math.cos(angle) * 0.2,
        y + 0.32 + Math.random() * 0.12,
        z + Math.sin(angle) * 0.2
      );
      leaf.rotation.y = angle;
      leaf.rotation.x = 0.35 + Math.random() * 0.2;
      leaf.castShadow = true;
      plantGroup.add(leaf);
    }

    this.scene.add(plantGroup);
  }

  // Bookshelf with stacked books: "GOOD VIBES PLAY MORE"
  private createBookshelf(x: number, y: number, z: number) {
    const shelfGroup = new THREE.Group();

    // Wooden stand table
    const standGeom = new THREE.BoxGeometry(1.0, 0.8, 0.8);
    const standMat = new THREE.MeshStandardMaterial({ color: '#5c3a21', roughness: 0.4 });
    const stand = new THREE.Mesh(standGeom, standMat);
    stand.position.set(x, y, z);
    stand.receiveShadow = true;
    shelfGroup.add(stand);

    // Stacked books with colorful spines
    const bookColors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899'];
    for (let i = 0; i < 4; i++) {
      const bGeom = new THREE.BoxGeometry(0.38, 0.07, 0.48);
      const bMat = new THREE.MeshStandardMaterial({ color: bookColors[i], roughness: 0.3 });
      const book = new THREE.Mesh(bGeom, bMat);
      book.position.set(x, y + 0.44 + i * 0.075, z);
      book.rotation.y = (Math.random() - 0.5) * 0.15;
      book.castShadow = true;
      shelfGroup.add(book);
    }

    this.scene.add(shelfGroup);
  }

  // Table Lamp with Warm Ambient Glow
  private createTableLamp(x: number, y: number, z: number) {
    const lampGroup = new THREE.Group();

    // Stand
    const standGeom = new THREE.BoxGeometry(0.9, 0.8, 0.9);
    const standMat = new THREE.MeshStandardMaterial({ color: '#4a2c16', roughness: 0.4 });
    const stand = new THREE.Mesh(standGeom, standMat);
    stand.position.set(x, y, z);
    lampGroup.add(stand);

    // Brass base
    const baseGeom = new THREE.CylinderGeometry(0.18, 0.2, 0.05, 32);
    const brassMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeom, brassMat);
    base.position.set(x, y + 0.43, z);
    lampGroup.add(base);

    // Stem
    const stemGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.55, 16);
    const stem = new THREE.Mesh(stemGeom, brassMat);
    stem.position.set(x, y + 0.72, z);
    lampGroup.add(stem);

    // Warm white shade
    const shadeGeom = new THREE.CylinderGeometry(0.18, 0.28, 0.35, 32, 1, true);
    const shadeMat = new THREE.MeshStandardMaterial({
      color: '#fffbeb',
      roughness: 0.5,
      emissive: '#fef3c7',
      emissiveIntensity: 0.35,
    });
    const shade = new THREE.Mesh(shadeGeom, shadeMat);
    shade.position.set(x, y + 1.0, z);
    lampGroup.add(shade);

    this.scene.add(lampGroup);
  }

  // Golden Oak Dining Tables (Long for normal/1v1/practice, Short launch counter for obstacle levels)
  private buildGoldenOakTable() {
    const oakTex = getHoneyOakWoodTexture();
    const tableMat = new THREE.MeshStandardMaterial({
      map: oakTex,
      roughness: 0.24,
      metalness: 0.04,
    });
    const apronMat = new THREE.MeshStandardMaterial({
      color: '#8b5a2b',
      roughness: 0.45,
    });
    const legMat = new THREE.MeshStandardMaterial({ color: '#7a481f', roughness: 0.4 });
    const brassMat = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      metalness: 0.8,
      roughness: 0.25,
    });

    const extrudeSettings = {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    };

    // 1. Long Dining Table (length 5.8m, z = -0.9 to 4.9)
    this.longTableGroup = new THREE.Group();
    const width = 2.4;
    const length = 5.8;
    const cornerRadius = 0.12;

    const shapeLong = new THREE.Shape();
    const x = -width / 2;
    const z = -0.9;
    shapeLong.moveTo(x + cornerRadius, z);
    shapeLong.lineTo(x + width - cornerRadius, z);
    shapeLong.quadraticCurveTo(x + width, z, x + width, z + cornerRadius);
    shapeLong.lineTo(x + width, z + length - cornerRadius);
    shapeLong.quadraticCurveTo(x + width, z + length, x + width - cornerRadius, z + length);
    shapeLong.lineTo(x + cornerRadius, z + length);
    shapeLong.quadraticCurveTo(x, z + length, x, z + length - cornerRadius);
    shapeLong.lineTo(x, z + cornerRadius);
    shapeLong.quadraticCurveTo(x, z, x + cornerRadius, z);

    const longGeom = new THREE.ExtrudeGeometry(shapeLong, extrudeSettings);
    longGeom.rotateX(Math.PI / 2);
    this.tableMesh = new THREE.Mesh(longGeom, tableMat);
    this.tableMesh.position.set(0, 0, 0);
    this.tableMesh.receiveShadow = true;
    this.tableMesh.castShadow = true;
    this.longTableGroup.add(this.tableMesh);

    const apronGeomLong = new THREE.BoxGeometry(width - 0.2, 0.12, length - 0.4);
    const apronLong = new THREE.Mesh(apronGeomLong, apronMat);
    apronLong.position.set(0, -0.13, 2.0);
    this.longTableGroup.add(apronLong);

    const legGeom = new THREE.CylinderGeometry(0.075, 0.05, 1.7, 24);
    const ferruleGeom = new THREE.CylinderGeometry(0.052, 0.05, 0.16, 24);

    const legPositionsLong = [
      [-width * 0.42, -0.98, -0.6],
      [width * 0.42, -0.98, -0.6],
      [-width * 0.42, -0.98, 4.5],
      [width * 0.42, -0.98, 4.5],
    ];

    legPositionsLong.forEach(([lx, ly, lz]) => {
      const legMesh = new THREE.Mesh(legGeom, legMat);
      legMesh.position.set(lx, ly, lz);
      legMesh.castShadow = true;
      legMesh.receiveShadow = true;
      this.longTableGroup.add(legMesh);

      const ferruleMesh = new THREE.Mesh(ferruleGeom, brassMat);
      ferruleMesh.position.set(lx, ly - 0.77, lz);
      this.longTableGroup.add(ferruleMesh);
    });
    this.scene.add(this.longTableGroup);

    // 2. Short Launch Table for Obstacle Mode (length 1.55m, z = -0.9 to 0.65)
    this.shortTableGroup = new THREE.Group();
    const shortLength = 1.55;
    const shapeShort = new THREE.Shape();
    shapeShort.moveTo(x + cornerRadius, z);
    shapeShort.lineTo(x + width - cornerRadius, z);
    shapeShort.quadraticCurveTo(x + width, z, x + width, z + cornerRadius);
    shapeShort.lineTo(x + width, z + shortLength - cornerRadius);
    shapeShort.quadraticCurveTo(x + width, z + shortLength, x + width - cornerRadius, z + shortLength);
    shapeShort.lineTo(x + cornerRadius, z + shortLength);
    shapeShort.quadraticCurveTo(x, z + shortLength, x, z + shortLength - cornerRadius);
    shapeShort.lineTo(x, z + cornerRadius);
    shapeShort.quadraticCurveTo(x, z, x + cornerRadius, z);

    const shortGeom = new THREE.ExtrudeGeometry(shapeShort, extrudeSettings);
    shortGeom.rotateX(Math.PI / 2);
    const shortTableMesh = new THREE.Mesh(shortGeom, tableMat);
    shortTableMesh.position.set(0, 0, 0);
    shortTableMesh.receiveShadow = true;
    shortTableMesh.castShadow = true;
    this.shortTableGroup.add(shortTableMesh);

    const apronShortGeom = new THREE.BoxGeometry(width - 0.2, 0.12, shortLength - 0.3);
    const apronShort = new THREE.Mesh(apronShortGeom, apronMat);
    apronShort.position.set(0, -0.13, -0.12);
    this.shortTableGroup.add(apronShort);

    const legPositionsShort = [
      [-width * 0.42, -0.98, -0.6],
      [width * 0.42, -0.98, -0.6],
      [-width * 0.42, -0.98, 0.45],
      [width * 0.42, -0.98, 0.45],
    ];

    legPositionsShort.forEach(([lx, ly, lz]) => {
      const legMesh = new THREE.Mesh(legGeom, legMat);
      legMesh.position.set(lx, ly, lz);
      legMesh.castShadow = true;
      legMesh.receiveShadow = true;
      this.shortTableGroup.add(legMesh);

      const ferruleMesh = new THREE.Mesh(ferruleGeom, brassMat);
      ferruleMesh.position.set(lx, ly - 0.77, lz);
      this.shortTableGroup.add(ferruleMesh);
    });

    this.shortTableGroup.visible = false;
    this.scene.add(this.shortTableGroup);
  }

  public setTableMode(isLong: boolean) {
    if (this.longTableGroup) this.longTableGroup.visible = isLong;
    if (this.shortTableGroup) this.shortTableGroup.visible = !isLong;
  }

  // Target Coaster
  private buildTargetCoaster() {
    const coasterGroup = new THREE.Group();

    const diskGeom = new THREE.CylinderGeometry(0.8, 0.8, 0.016, 64);
    const targetTex = getPremiumTargetTexture();

    const topMat = new THREE.MeshStandardMaterial({
      map: targetTex,
      roughness: 0.28,
      metalness: 0.1,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: '#d97706',
      roughness: 0.2,
      metalness: 0.8,
    });

    const materials = [rimMat, topMat, rimMat];
    this.targetMesh = new THREE.Mesh(diskGeom, materials);
    this.targetMesh.position.set(0, 0.008, 1.8);
    this.targetMesh.receiveShadow = true;
    coasterGroup.add(this.targetMesh);

    const glowGeom = new THREE.RingGeometry(0.81, 0.84, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: '#f59e0b',
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const glowMesh = new THREE.Mesh(glowGeom, glowMat);
    glowMesh.rotation.x = -Math.PI / 2;
    glowMesh.position.set(0, 0.009, 1.8);
    coasterGroup.add(glowMesh);

    this.scene.add(coasterGroup);
  }

  // High Fidelity 3D Bottle Generator with diverse physical shapes (Round, Box, Tall, Short, Soda, Diamond, etc.)
  public createBottleMesh(
    skinId = 'classic',
    capId = 'capRed',
    overrides?: {
      bodyTint?: string;
      capColor?: string;
      liquidColor?: string;
      labelText?: string;
    }
  ): THREE.Group {
    return createStandaloneBottleMesh(skinId, capId, overrides);
  }

  // 3D Obstacle Models: TV, Fridge ("feez"), Mini Box, Microwave, Stool, Books, Speaker, Washer, Nightstand, Crate, Moving Deck, etc.
  public buildObstacle(obs: TargetObstacle): THREE.Object3D {
    const group = new THREE.Group();
    group.position.set(obs.position.x, 0, obs.position.z);

    const targetH = obs.topY !== undefined ? obs.topY : (obs.size.y || 0.5); // Landing elevation above table (0.0)
    const floorY = -1.85; // Room floor Y
    const totalH = targetH - floorY; // Height from floor to landing surface
    const midY = (targetH + floorY) * 0.5; // Center Y between floor and top
    const radius = obs.radius || 0.45;

    // Helper for top target coaster ring
    const addTopCoaster = (r = radius, offsetY = 0.002, zOffset = 0) => {
      const ringGeom = new THREE.RingGeometry(0, r * 0.88, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        map: getPremiumTargetTexture(),
        transparent: true,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, targetH + offsetY, zOffset);
      group.add(ring);
    };

    if (obs.type === 'tv') {
      // 1. LIVING ROOM TV CONSOLE & FLATSCREEN TV
      const credenzaW = 1.35;
      const credenzaD = 0.72;
      const credenzaH = totalH;

      // Console Cabinet (Dark Walnut)
      const credenzaGeom = new THREE.BoxGeometry(credenzaW, credenzaH, credenzaD);
      const credenzaMat = new THREE.MeshStandardMaterial({
        color: '#26170d',
        roughness: 0.35,
        metalness: 0.08,
      });
      const credenza = new THREE.Mesh(credenzaGeom, credenzaMat);
      credenza.position.set(0, midY, 0);
      credenza.castShadow = true;
      credenza.receiveShadow = true;
      group.add(credenza);

      // Console brass trim and drawer seams
      const drawerLineGeom = new THREE.BoxGeometry(credenzaW - 0.08, 0.015, 0.02);
      const brassMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8, roughness: 0.2 });
      const drawerLine = new THREE.Mesh(drawerLineGeom, brassMat);
      drawerLine.position.set(0, targetH - 0.18, -credenzaD * 0.5 - 0.01);
      group.add(drawerLine);

      // Flatscreen TV Stand & Display (mounted at the rear half of the console top)
      const tvW = 1.15;
      const tvH = 0.65;
      const tvD = 0.04;
      const tvZ = 0.22; // positioned towards back of console

      // TV Neck & Base
      const tvBaseGeom = new THREE.BoxGeometry(0.38, 0.02, 0.22);
      const tvMat = new THREE.MeshStandardMaterial({ color: '#090d16', metalness: 0.85, roughness: 0.2 });
      const tvBase = new THREE.Mesh(tvBaseGeom, tvMat);
      tvBase.position.set(0, targetH + 0.01, tvZ);
      group.add(tvBase);

      const tvStemGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.08, 16);
      const tvStem = new THREE.Mesh(tvStemGeom, tvMat);
      tvStem.position.set(0, targetH + 0.05, tvZ);
      group.add(tvStem);

      // TV Frame Panel
      const tvFrameGeom = new THREE.BoxGeometry(tvW, tvH, tvD);
      const tvFrame = new THREE.Mesh(tvFrameGeom, tvMat);
      tvFrame.position.set(0, targetH + 0.08 + tvH * 0.5, tvZ);
      tvFrame.castShadow = true;
      group.add(tvFrame);

      // TV Screen Glass (deep subtle blue ambient glow)
      const tvScreenGeom = new THREE.PlaneGeometry(tvW - 0.06, tvH - 0.06);
      const tvScreenMat = new THREE.MeshStandardMaterial({
        color: '#030712',
        roughness: 0.1,
        metalness: 0.9,
        emissive: '#1e293b',
        emissiveIntensity: 0.35,
      });
      const tvScreen = new THREE.Mesh(tvScreenGeom, tvScreenMat);
      tvScreen.position.set(0, targetH + 0.08 + tvH * 0.5, tvZ - tvD * 0.5 - 0.002);
      group.add(tvScreen);

      // Blue Standby LED on bottom corner
      const ledGeom = new THREE.SphereGeometry(0.008, 12, 12);
      const ledMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
      const led = new THREE.Mesh(ledGeom, ledMat);
      led.position.set(tvW * 0.45, targetH + 0.1, tvZ - tvD * 0.5 - 0.005);
      group.add(led);

      // Coaster positioned on the front half of the console top
      addTopCoaster(radius, 0.002, -0.08);

    } else if (obs.type === 'fridge') {
      // 2. KITCHEN REFRIGERATOR ("feez" - French double-door stainless steel)
      const fridgeW = 0.96;
      const fridgeD = 0.92;
      const fridgeH = totalH;

      const fridgeGeom = new THREE.BoxGeometry(fridgeW, fridgeH, fridgeD);
      const fridgeMat = new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        roughness: 0.22,
        metalness: 0.78,
      });
      const fridge = new THREE.Mesh(fridgeGeom, fridgeMat);
      fridge.position.set(0, midY, 0);
      fridge.castShadow = true;
      fridge.receiveShadow = true;
      group.add(fridge);

      // Horizontal Door Split (Freezer vs Main Compartment)
      const splitGeom = new THREE.BoxGeometry(fridgeW + 0.01, 0.025, 0.03);
      const darkTrimMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4 });
      const splitMesh = new THREE.Mesh(splitGeom, darkTrimMat);
      splitMesh.position.set(0, targetH - 0.75, -fridgeD * 0.5 - 0.005);
      group.add(splitMesh);

      // Vertical Center Door Seam
      const vertSeamGeom = new THREE.BoxGeometry(0.018, fridgeH * 0.88, 0.03);
      const vertSeam = new THREE.Mesh(vertSeamGeom, darkTrimMat);
      vertSeam.position.set(0, midY + 0.1, -fridgeD * 0.5 - 0.005);
      group.add(vertSeam);

      // Stainless Chrome Door Handles
      const handleGeom = new THREE.CylinderGeometry(0.018, 0.018, 0.55, 16);
      const chromeMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.92, roughness: 0.12 });
      [-0.08, 0.08].forEach((hx) => {
        const handle = new THREE.Mesh(handleGeom, chromeMat);
        handle.position.set(hx, targetH - 0.42, -fridgeD * 0.5 - 0.04);
        group.add(handle);
      });

      // Chrome Brand Badge
      const badgeGeom = new THREE.BoxGeometry(0.12, 0.035, 0.015);
      const badge = new THREE.Mesh(badgeGeom, chromeMat);
      badge.position.set(0, targetH - 0.14, -fridgeD * 0.5 - 0.01);
      group.add(badge);

      addTopCoaster(radius);

    } else if (obs.type === 'minibox') {
      // 3. MINI DELIVERY BOX / PARCEL ON PEDESTAL
      const boxH = 0.32;
      const boxW = 0.72;
      const boxD = 0.72;
      const standH = totalH - boxH;
      const standMidY = floorY + standH * 0.5;

      // Wooden Accent Stand
      const standGeom = new THREE.BoxGeometry(boxW * 0.95, standH, boxD * 0.95);
      const standMat = new THREE.MeshStandardMaterial({ color: '#4a2c16', roughness: 0.4 });
      const stand = new THREE.Mesh(standGeom, standMat);
      stand.position.set(0, standMidY, 0);
      stand.castShadow = true;
      stand.receiveShadow = true;
      group.add(stand);

      // Cardboard Parcel Box
      const boxGeom = new THREE.BoxGeometry(boxW, boxH, boxD);
      const cardboardMat = new THREE.MeshStandardMaterial({
        color: '#ba8b5c',
        roughness: 0.88,
      });
      const box = new THREE.Mesh(boxGeom, cardboardMat);
      box.position.set(0, targetH - boxH * 0.5, 0);
      box.castShadow = true;
      box.receiveShadow = true;
      group.add(box);

      // Brown Packaging Tape along top center
      const tapeGeom = new THREE.BoxGeometry(0.12, 0.005, boxD + 0.01);
      const tapeMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.6 });
      const tape = new THREE.Mesh(tapeGeom, tapeMat);
      tape.position.set(0, targetH + 0.001, 0);
      group.add(tape);

      // White Shipping Address Label / Barcode
      const labelGeom = new THREE.PlaneGeometry(0.22, 0.15);
      const labelMat = new THREE.MeshBasicMaterial({ color: '#f8fafc' });
      const label = new THREE.Mesh(labelGeom, labelMat);
      label.rotation.x = -Math.PI / 2;
      label.position.set(0.2, targetH + 0.002, 0.2);
      group.add(label);

      addTopCoaster(radius);

    } else if (obs.type === 'microwave') {
      // 4. KITCHEN MICROWAVE OVEN ON STAND
      const microH = 0.38;
      const microW = 0.84;
      const microD = 0.64;
      const cartH = totalH - microH;
      const cartMidY = floorY + cartH * 0.5;

      // Kitchen Butcher Block Cart
      const cartGeom = new THREE.BoxGeometry(microW + 0.1, cartH, microD + 0.1);
      const cartMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.3 });
      const cart = new THREE.Mesh(cartGeom, cartMat);
      cart.position.set(0, cartMidY, 0);
      cart.castShadow = true;
      cart.receiveShadow = true;
      group.add(cart);

      // Butcher block top lip
      const lipGeom = new THREE.BoxGeometry(microW + 0.14, 0.05, microD + 0.14);
      const oakMat = new THREE.MeshStandardMaterial({ map: getHoneyOakWoodTexture(), roughness: 0.3 });
      const lip = new THREE.Mesh(lipGeom, oakMat);
      lip.position.set(0, targetH - microH - 0.025, 0);
      group.add(lip);

      // Microwave Charcoal Body
      const microGeom = new THREE.BoxGeometry(microW, microH, microD);
      const microMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.3, metalness: 0.5 });
      const micro = new THREE.Mesh(microGeom, microMat);
      micro.position.set(0, targetH - microH * 0.5, 0);
      micro.castShadow = true;
      micro.receiveShadow = true;
      group.add(micro);

      // Tinted Glass Door
      const doorGeom = new THREE.PlaneGeometry(microW * 0.64, microH * 0.8);
      const doorMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.1, metalness: 0.9 });
      const door = new THREE.Mesh(doorGeom, doorMat);
      door.position.set(-microW * 0.14, targetH - microH * 0.5, -microD * 0.5 - 0.002);
      group.add(door);

      // Digital Green LED Display & Control Keypad
      const displayGeom = new THREE.PlaneGeometry(0.18, 0.08);
      const displayMat = new THREE.MeshBasicMaterial({ color: '#22c55e' });
      const display = new THREE.Mesh(displayGeom, displayMat);
      display.position.set(microW * 0.32, targetH - microH * 0.3, -microD * 0.5 - 0.002);
      group.add(display);

      // Pull Handle
      const hGeom = new THREE.CylinderGeometry(0.012, 0.012, microH * 0.65, 16);
      const chromeMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.9, roughness: 0.15 });
      const handle = new THREE.Mesh(hGeom, chromeMat);
      handle.position.set(microW * 0.18, targetH - microH * 0.5, -microD * 0.5 - 0.03);
      group.add(handle);

      addTopCoaster(radius);

    } else if (obs.type === 'stool') {
      // 5. HIGH BAR STOOL / COFFEE STOOL
      const seatRadius = radius;
      const seatH = 0.06;

      // Beveled Oak Seat Cushion
      const seatGeom = new THREE.CylinderGeometry(seatRadius, seatRadius * 0.95, seatH, 64);
      const oakTex = createHoneyOakWoodTexture();
      const woodMat = new THREE.MeshStandardMaterial({ map: oakTex, roughness: 0.25, metalness: 0.05 });
      const seat = new THREE.Mesh(seatGeom, woodMat);
      seat.position.set(0, targetH - seatH * 0.5, 0);
      seat.castShadow = true;
      seat.receiveShadow = true;
      group.add(seat);

      // Stool Legs reaching from floor Y = -1.85 to the seat
      const legH = totalH - seatH;
      const legGeom = new THREE.CylinderGeometry(0.032, 0.022, legH, 24);
      const legMat = new THREE.MeshStandardMaterial({ color: '#4a2c16', roughness: 0.4 });
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const leg = new THREE.Mesh(legGeom, legMat);
        const lx = Math.cos(angle) * (seatRadius * 0.65);
        const lz = Math.sin(angle) * (seatRadius * 0.65);
        leg.position.set(lx, floorY + legH * 0.5, lz);
        leg.rotation.z = -Math.cos(angle) * 0.06;
        leg.rotation.x = Math.sin(angle) * 0.06;
        leg.castShadow = true;
        group.add(leg);
      }

      // Circular Chrome Footrest Ring
      const footringGeom = new THREE.TorusGeometry(seatRadius * 0.72, 0.016, 16, 48);
      const chromeMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8, roughness: 0.2 });
      const footring = new THREE.Mesh(footringGeom, chromeMat);
      footring.rotation.x = Math.PI / 2;
      footring.position.set(0, floorY + legH * 0.45, 0);
      group.add(footring);

      addTopCoaster(seatRadius);

    } else if (obs.type === 'books') {
      // 6. ENCYCLOPEDIA STUDY BOOK STACK
      const booksH = 0.38;
      const deskH = totalH - booksH;
      const deskMidY = floorY + deskH * 0.5;

      // Study Desk
      const deskGeom = new THREE.BoxGeometry(0.92, deskH, 0.85);
      const deskMat = new THREE.MeshStandardMaterial({ color: '#3d1d0c', roughness: 0.35 });
      const desk = new THREE.Mesh(deskGeom, deskMat);
      desk.position.set(0, deskMidY, 0);
      desk.castShadow = true;
      desk.receiveShadow = true;
      group.add(desk);

      // Stack of 4 thick leather-bound encyclopedia volumes
      const bookColors = ['#1e3a8a', '#831843', '#064e3b', '#b45309'];
      const singleH = booksH / 4;
      const baseW = 0.82;
      const baseD = 0.75;

      for (let i = 0; i < 4; i++) {
        const bW = baseW * (1 - i * 0.04);
        const bD = baseD * (1 - i * 0.04);
        const bGeom = new THREE.BoxGeometry(bW, singleH * 0.92, bD);
        const bMat = new THREE.MeshStandardMaterial({
          color: bookColors[i % bookColors.length],
          roughness: 0.35,
          metalness: 0.1,
        });
        const book = new THREE.Mesh(bGeom, bMat);
        const yPos = targetH - booksH + singleH * (i + 0.5);
        book.position.set(0, yPos, 0);
        book.rotation.y = i === 1 ? 0.07 : i === 2 ? -0.05 : i === 3 ? 0.04 : 0;
        book.castShadow = true;
        book.receiveShadow = true;
        group.add(book);
      }

      addTopCoaster(radius);

    } else if (obs.type === 'speaker') {
      // 7. STUDIO AUDIO SOUND TOWER / SUBWOOFER
      const spkW = 0.74;
      const spkD = 0.70;
      const spkH = totalH;

      const spkGeom = new THREE.BoxGeometry(spkW, spkH, spkD);
      const spkMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.3, metalness: 0.2 });
      const spk = new THREE.Mesh(spkGeom, spkMat);
      spk.position.set(0, midY, 0);
      spk.castShadow = true;
      spk.receiveShadow = true;
      group.add(spk);

      // Dual Copper Audio Speaker Cones
      const coneMat = new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.75, roughness: 0.25 });
      const dustCapMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.4 });

      [-0.32, 0.15].forEach((cyOffset) => {
        const coneGeom = new THREE.CylinderGeometry(0.18, 0.08, 0.04, 32);
        const cone = new THREE.Mesh(coneGeom, coneMat);
        cone.rotation.x = Math.PI / 2;
        cone.position.set(0, targetH + cyOffset, -spkD * 0.5 - 0.01);
        group.add(cone);

        const capGeom = new THREE.SphereGeometry(0.04, 16, 16);
        const cap = new THREE.Mesh(capGeom, dustCapMat);
        cap.position.set(0, targetH + cyOffset, -spkD * 0.5 - 0.035);
        group.add(cap);
      });

      addTopCoaster(radius);

    } else if (obs.type === 'washer') {
      // 8. LAUNDRY ROOM WASHING MACHINE
      const washW = 0.88;
      const washD = 0.84;
      const washH = totalH;

      const washGeom = new THREE.BoxGeometry(washW, washH, washD);
      const washMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2, metalness: 0.1 });
      const washer = new THREE.Mesh(washGeom, washMat);
      washer.position.set(0, midY, 0);
      washer.castShadow = true;
      washer.receiveShadow = true;
      group.add(washer);

      // Front Circular Porthole Door
      const rimGeom = new THREE.TorusGeometry(0.24, 0.03, 16, 48);
      const chromeMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.85, roughness: 0.2 });
      const rim = new THREE.Mesh(rimGeom, chromeMat);
      rim.position.set(0, targetH - 0.45, -washD * 0.5 - 0.01);
      group.add(rim);

      const glassGeom = new THREE.CircleGeometry(0.22, 32);
      const glassMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.1, metalness: 0.8 });
      const glass = new THREE.Mesh(glassGeom, glassMat);
      glass.position.set(0, targetH - 0.45, -washD * 0.5 - 0.012);
      group.add(glass);

      // Top control dial knob
      const knobGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.025, 24);
      const knob = new THREE.Mesh(knobGeom, chromeMat);
      knob.rotation.x = Math.PI / 2;
      knob.position.set(0.18, targetH - 0.12, -washD * 0.5 - 0.015);
      group.add(knob);

      addTopCoaster(radius);

    } else if (obs.type === 'nightstand') {
      // 9. BEDROOM NIGHTSTAND TABLE
      const standW = 0.82;
      const standD = 0.76;
      const standH = totalH;

      const standGeom = new THREE.BoxGeometry(standW, standH, standD);
      const standMat = new THREE.MeshStandardMaterial({ color: '#663311', roughness: 0.35 });
      const stand = new THREE.Mesh(standGeom, standMat);
      stand.position.set(0, midY, 0);
      stand.castShadow = true;
      stand.receiveShadow = true;
      group.add(stand);

      // Drawers with brass pull knobs
      const brassMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.85, roughness: 0.2 });
      [-0.15, -0.48].forEach((dy) => {
        const knobGeom = new THREE.SphereGeometry(0.024, 16, 16);
        const knob = new THREE.Mesh(knobGeom, brassMat);
        knob.position.set(0, targetH + dy, -standD * 0.5 - 0.02);
        group.add(knob);

        const seamGeom = new THREE.BoxGeometry(standW - 0.08, 0.01, 0.02);
        const seam = new THREE.Mesh(seamGeom, brassMat);
        seam.position.set(0, targetH + dy + 0.12, -standD * 0.5 - 0.005);
        group.add(seam);
      });

      addTopCoaster(radius);

    } else if (obs.type === 'crate') {
      // 10. INDUSTRIAL WOODEN SHIPPING CRATE
      const crateW = 0.85;
      const crateD = 0.85;
      const crateH = totalH;

      const crateGeom = new THREE.BoxGeometry(crateW, crateH, crateD);
      const crateMat = new THREE.MeshStandardMaterial({ color: '#9a6332', roughness: 0.75 });
      const crate = new THREE.Mesh(crateGeom, crateMat);
      crate.position.set(0, midY, 0);
      crate.castShadow = true;
      crate.receiveShadow = true;
      group.add(crate);

      // Diagonal X-Braces
      const braceMat = new THREE.MeshStandardMaterial({ color: '#7a471f', roughness: 0.6 });
      const brace1Geom = new THREE.BoxGeometry(crateW * 0.95, 0.06, 0.025);
      const brace1 = new THREE.Mesh(brace1Geom, braceMat);
      brace1.rotation.z = Math.PI / 4;
      brace1.position.set(0, midY, -crateD * 0.5 - 0.01);
      group.add(brace1);

      const brace2 = new THREE.Mesh(brace1Geom, braceMat);
      brace2.rotation.z = -Math.PI / 4;
      brace2.position.set(0, midY, -crateD * 0.5 - 0.01);
      group.add(brace2);

      addTopCoaster(radius);

    } else if (obs.type === 'moving') {
      // 11. GLIDING TECH DRONE PLATFORM
      const platW = 0.88;
      const platD = 0.88;
      const platH = 0.15;

      const platGeom = new THREE.BoxGeometry(platW, platH, platD);
      const platMat = new THREE.MeshStandardMaterial({ color: '#0b132b', metalness: 0.8, roughness: 0.2 });
      const platform = new THREE.Mesh(platGeom, platMat);
      platform.position.set(0, targetH - platH * 0.5, 0);
      platform.castShadow = true;
      platform.receiveShadow = true;
      group.add(platform);

      // Glowing Neon Cyan Thrusters on 4 Corners
      const thrusterMat = new THREE.MeshStandardMaterial({
        color: '#06b6d4',
        emissive: '#0891b2',
        emissiveIntensity: 0.8,
      });
      const tCorners = [
        [-platW * 0.42, -platD * 0.42],
        [platW * 0.42, -platD * 0.42],
        [-platW * 0.42, platD * 0.42],
        [platW * 0.42, platD * 0.42],
      ];
      const podGeom = new THREE.CylinderGeometry(0.045, 0.035, 0.08, 16);
      tCorners.forEach(([tx, tz]) => {
        const pod = new THREE.Mesh(podGeom, thrusterMat);
        pod.position.set(tx, targetH - platH - 0.03, tz);
        group.add(pod);
      });

      addTopCoaster(radius);

    } else {
      // 12. DEFAULT WOODEN PEDESTAL BOX
      const boxW = 0.85;
      const boxD = 0.85;
      const boxH = totalH;

      const boxGeom = new THREE.BoxGeometry(boxW, boxH, boxD);
      const boxMat = new THREE.MeshStandardMaterial({ map: getHoneyOakWoodTexture(), roughness: 0.25 });
      const box = new THREE.Mesh(boxGeom, boxMat);
      box.position.set(0, midY, 0);
      box.castShadow = true;
      box.receiveShadow = true;
      group.add(box);

      addTopCoaster(radius);
    }

    return group;
  }

  public resize(width: number, height: number) {
    if (height === 0 || width === 0) return;
    const aspect = width / height;
    this.camera.aspect = aspect;

    // Responsive FOV scaling: ensure table and bottles are perfectly framed on all screen sizes
    if (aspect < 0.75) {
      // Tall mobile portrait
      this.camera.fov = 62;
      this.camera.position.set(0, 2.05, -2.25);
    } else if (aspect < 1.0) {
      // Standard portrait or square
      this.camera.fov = 54;
      this.camera.position.set(0, 1.85, -2.05);
    } else if (aspect < 1.6) {
      // Tablet / small landscape
      this.camera.fov = 48;
      this.camera.position.set(0, 1.75, -1.9);
    } else {
      // Wide desktop / phone rotate widescreen
      this.camera.fov = 46;
      this.camera.position.set(0, 1.72, -1.85);
    }

    this.camera.lookAt(0, 0.55, 1.45);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose() {
    try {
      this.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });
      this.obstacleGroup.clear();
      this.studioLightsGroup.clear();

      this.renderer.renderLists?.dispose?.();
      this.renderer.dispose();
      // NOTE: We intentionally do NOT force context loss on the canvas element here,
      // as that permanently corrupts the WebGL state on React effect re-renders or StrictMode remounts.
    } catch (err) {
      console.warn('[ThreeJS] Error during scene disposal:', err instanceof Error ? err.message : String(err));
    }
  }
}
