import { LevelConfig, ObstacleType } from '../types';

export const HAND_AUTHORED_LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: 'Close Table Coaster',
    description: 'Gentle short flick! A light drag easily lands on the close table target.',
    targetHeight: 0,
    targetDistance: 1.35,
    targetRadius: 0.85,
    targetX: 0,
    obstacleType: 'none',
    starsScoreRequirement: [1, 2, 3],
  },
  {
    id: 2,
    title: 'Close Delivery Parcel',
    description: 'Short drag angled slightly left! Pop the bottle onto the close parcel box.',
    targetHeight: 0.25,
    targetDistance: 1.45,
    targetRadius: 0.50,
    targetX: -0.18,
    obstacleType: 'minibox',
    starsScoreRequirement: [1, 2, 4],
  },
  {
    id: 3,
    title: 'Study Book Stack',
    description: 'Gentle loft to the right! Stick the landing on the low study encyclopedia.',
    targetHeight: 0.30,
    targetDistance: 1.55,
    targetRadius: 0.48,
    targetX: 0.18,
    obstacleType: 'books',
    starsScoreRequirement: [1, 2, 4],
  },
  {
    id: 4,
    title: 'Mid-Range Bullseye',
    description: 'Moderate swipe straight ahead onto the colorful precision coaster ring.',
    targetHeight: 0,
    targetDistance: 1.80,
    targetRadius: 0.68,
    targetX: 0,
    obstacleType: 'none',
    starsScoreRequirement: [1, 2, 4],
  },
  {
    id: 5,
    title: 'Low Coffee Stool',
    description: 'Elevated landing on the wooden coffee stool. Controlled flick needed.',
    targetHeight: 0.38,
    targetDistance: 1.70,
    targetRadius: 0.50,
    targetX: -0.15,
    obstacleType: 'stool',
    starsScoreRequirement: [1, 2, 4],
  },
  {
    id: 6,
    title: 'Bedside Nightstand',
    description: 'Angled flick to the right onto the polished wooden drawer nightstand.',
    targetHeight: 0.45,
    targetDistance: 2.00,
    targetRadius: 0.48,
    targetX: 0.22,
    obstacleType: 'nightstand',
    starsScoreRequirement: [1, 2, 5],
  },
  {
    id: 7,
    title: 'Kitchen Microwave Cart',
    description: 'Land squarely on the countertop microwave cart straight ahead.',
    targetHeight: 0.46,
    targetDistance: 2.10,
    targetRadius: 0.50,
    targetX: 0,
    obstacleType: 'microwave',
    starsScoreRequirement: [1, 2, 5],
  },
  {
    id: 8,
    title: 'Living Room TV Console',
    description: 'Solid flip onto the TV console! Bounce off the solid flatscreen if thrown too far.',
    targetHeight: 0.52,
    targetDistance: 2.25,
    targetRadius: 0.54,
    targetX: -0.15,
    obstacleType: 'tv',
    starsScoreRequirement: [1, 2, 5],
  },
  {
    id: 9,
    title: 'Close Hover Deck',
    description: 'Close range moving drone! Time your gentle release as the deck drifts.',
    targetHeight: 0.36,
    targetDistance: 1.60,
    targetRadius: 0.50,
    targetX: 0,
    obstacleType: 'moving',
    movingSpeed: 0.85,
    movingDistance: 0.45,
    starsScoreRequirement: [1, 2, 5],
  },
  {
    id: 10,
    title: 'Laundry Washing Machine',
    description: 'Aim slightly to the left onto the flat top of the front-load washer.',
    targetHeight: 0.54,
    targetDistance: 2.25,
    targetRadius: 0.48,
    targetX: -0.20,
    obstacleType: 'washer',
    starsScoreRequirement: [1, 2, 5],
  },
  {
    id: 11,
    title: 'Studio Speaker Tower',
    description: 'Stick the narrow summit of the studio subwoofer tower on the right.',
    targetHeight: 0.58,
    targetDistance: 2.35,
    targetRadius: 0.46,
    targetX: 0.20,
    obstacleType: 'speaker',
    starsScoreRequirement: [1, 2, 5],
  },
  {
    id: 12,
    title: 'Kitchen Double-Door Fridge',
    description: 'High upward power arc! Reach the summit of the tall refrigerator.',
    targetHeight: 0.72,
    targetDistance: 2.50,
    targetRadius: 0.52,
    targetX: 0,
    obstacleType: 'fridge',
    starsScoreRequirement: [1, 2, 5],
  },
  {
    id: 13,
    title: 'Timber Shipping Crate',
    description: 'Longer swipe aimed leftward onto the rugged warehouse cargo crate.',
    targetHeight: 0.50,
    targetDistance: 2.65,
    targetRadius: 0.48,
    targetX: -0.22,
    obstacleType: 'crate',
    starsScoreRequirement: [1, 3, 6],
  },
  {
    id: 14,
    title: 'Tall Bar Stool',
    description: 'Deep distance and high elevation! Land on the round bar stool seat.',
    targetHeight: 0.65,
    targetDistance: 2.75,
    targetRadius: 0.46,
    targetX: 0,
    obstacleType: 'stool',
    starsScoreRequirement: [1, 3, 6],
  },
  {
    id: 15,
    title: 'Far Range TV Credenza',
    description: 'Deep throw to the right! Powerful swipe to reach the executive TV unit.',
    targetHeight: 0.55,
    targetDistance: 2.90,
    targetRadius: 0.52,
    targetX: 0.18,
    obstacleType: 'tv',
    starsScoreRequirement: [1, 3, 6],
  },
  {
    id: 16,
    title: 'High-Speed Speedway Deck',
    description: 'Fast moving gliding platform demands razor-sharp reflex timing at distance.',
    targetHeight: 0.42,
    targetDistance: 2.65,
    targetRadius: 0.48,
    targetX: 0,
    obstacleType: 'moving',
    movingSpeed: 1.20,
    movingDistance: 0.60,
    starsScoreRequirement: [1, 3, 6],
  },
  {
    id: 17,
    title: 'Deep Cargo Crate',
    description: 'Far range throw! Full power swipe required to reach the far timber crate.',
    targetHeight: 0.60,
    targetDistance: 3.00,
    targetRadius: 0.48,
    targetX: -0.18,
    obstacleType: 'crate',
    starsScoreRequirement: [1, 3, 6],
  },
  {
    id: 18,
    title: 'Breezy Patio Stool',
    description: 'Crosswind draft! Strong swipe compensating against the rightward breeze.',
    targetHeight: 0.65,
    targetDistance: 2.90,
    targetRadius: 0.46,
    targetX: 0.20,
    obstacleType: 'stool',
    wind: 0.28,
    starsScoreRequirement: [1, 3, 6],
  },
  {
    id: 19,
    title: 'Skyscraper Tall Fridge',
    description: 'Massive upward power lob! Stick the high summit of the tall freezer.',
    targetHeight: 0.78,
    targetDistance: 3.10,
    targetRadius: 0.50,
    targetX: 0,
    obstacleType: 'fridge',
    starsScoreRequirement: [1, 3, 6],
  },
  {
    id: 20,
    title: 'Grand Apex Summit',
    description: 'The Ultimate Campaign Finale! High summit platform with gentle breeze.',
    targetHeight: 0.75,
    targetDistance: 3.25,
    targetRadius: 0.46,
    targetX: 0,
    obstacleType: 'stool',
    wind: 0.30,
    starsScoreRequirement: [2, 4, 7],
  },
];

// Seeded pseudorandom generator for deterministic levels 21+
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getLevelConfig(levelNumber: number): LevelConfig {
  if (levelNumber <= 20 && levelNumber >= 1) {
    return HAND_AUTHORED_LEVELS[levelNumber - 1];
  }

  // Deterministic calculation for Level 21+
  const progressRatio = Math.min(1.0, Math.max(0.0, (levelNumber - 20) / 60));
  const rand = mulberry32(levelNumber * 7919 + 104729);

  // Varied platform types covering all 11 rich household & arcade objects
  const obstacleChoices: ObstacleType[] = [
    'tv',
    'fridge',
    'minibox',
    'microwave',
    'stool',
    'books',
    'speaker',
    'washer',
    'nightstand',
    'crate',
    'moving',
  ];
  const obstacleType = obstacleChoices[Math.floor(rand() * obstacleChoices.length)];

  // Varied Target Distance: cycles between close (1.4m - 1.7m), medium (1.8m - 2.5m), and far range (2.6m - 3.3m)
  const distanceArchetypes = [1.45, 1.65, 1.95, 2.30, 2.65, 2.95, 3.25];
  const archIndex = Math.floor(rand() * distanceArchetypes.length);
  const baseDist = distanceArchetypes[archIndex] + progressRatio * 0.20;
  const targetDistance = Math.min(3.30, Math.max(1.35, Math.round((baseDist + (rand() - 0.5) * 0.25) * 10) / 10));

  // Varied Lateral Position (left, center, right)
  const xArchetypes = [-0.25, -0.15, 0, 0, 0.15, 0.25];
  const targetX = xArchetypes[Math.floor(rand() * xArchetypes.length)];

  // Target Height: adjusted per obstacle type for realistic geometry
  let baseHeight = 0.42;
  if (obstacleType === 'fridge') {
    baseHeight = 0.68 + progressRatio * 0.12;
  } else if (obstacleType === 'stool') {
    baseHeight = 0.50 + progressRatio * 0.20;
  } else if (obstacleType === 'minibox') {
    baseHeight = 0.26 + progressRatio * 0.10;
  } else if (obstacleType === 'speaker' || obstacleType === 'tv') {
    baseHeight = 0.50 + progressRatio * 0.12;
  } else {
    baseHeight = 0.38 + progressRatio * 0.18;
  }
  const targetHeight = Math.min(0.80, Math.round((baseHeight + rand() * 0.10) * 100) / 100);

  // Target Radius
  const targetRadius = Math.max(0.44, Math.round((0.52 - progressRatio * 0.08 + (rand() - 0.5) * 0.04) * 100) / 100);

  // Crosswind
  const hasWind = rand() > 0.65;
  const windStrength = hasWind ? (rand() > 0.5 ? 1 : -1) * (0.15 + progressRatio * 0.20) : 0;
  const wind = Math.round(windStrength * 100) / 100;

  // Moving Platform dynamics
  const isMoving = obstacleType === 'moving';
  const movingSpeed = isMoving ? Math.round((0.80 + progressRatio * 0.50 + rand() * 0.3) * 10) / 10 : undefined;
  const movingDistance = isMoving ? Math.round((0.40 + progressRatio * 0.20 + rand() * 0.15) * 10) / 10 : undefined;

  const objectDisplayNames: Record<ObstacleType, string> = {
    none: 'Table Coaster',
    stool: 'Bar Stool',
    box: 'Wooden Pedestal',
    books: 'Library Book Stack',
    moving: 'Hover Drone Deck',
    tv: 'Flatscreen TV Console',
    fridge: 'Kitchen Refrigerator',
    minibox: 'Delivery Parcel Box',
    microwave: 'Kitchen Microwave Cart',
    speaker: 'Studio Audio Tower',
    washer: 'Washing Machine',
    nightstand: 'Bedside Nightstand',
    crate: 'Timber Cargo Crate',
  };

  const stageAdjectives = [
    'Precision',
    'Elevated',
    'Grand',
    'Acrobat',
    'High Wire',
    'Crosswind',
    'Apex',
    'Midnight',
    'Swift',
    'Mastery',
    'Breeze',
    'Zenith',
  ];

  const adj = stageAdjectives[Math.floor(rand() * stageAdjectives.length)];
  const objName = objectDisplayNames[obstacleType] || 'Target Platform';
  const title = `Stage ${levelNumber}: ${adj} ${objName}`;

  let desc = `Land squarely on the ${objName.toLowerCase()} at ${targetDistance}m.`;
  if (targetDistance <= 1.6) {
    desc = `Close target! A gentle, short drag easily lands on the ${objName.toLowerCase()}.`;
  } else if (targetDistance >= 3.0) {
    desc = `Far range! Full power swipe needed to reach the ${objName.toLowerCase()} at ${targetDistance}m.`;
  } else if (isMoving) {
    desc = `Time your release to stick the moving ${objName.toLowerCase()}.`;
  } else if (wind !== 0) {
    desc = `Compensate for the ${wind > 0 ? 'rightward' : 'leftward'} breeze on the ${objName.toLowerCase()}.`;
  }

  return {
    id: levelNumber,
    title,
    description: desc,
    targetHeight,
    targetDistance,
    targetRadius,
    targetX,
    obstacleType,
    movingSpeed,
    movingDistance,
    wind,
    starsScoreRequirement: [1, 3, 5],
  };
}
