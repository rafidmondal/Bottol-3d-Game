import { LevelConfig, ObstacleType } from '../types';

export const HAND_AUTHORED_LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: 'Beginner Table',
    description: 'Learn the basic flick! Land smoothly on the wide dining table.',
    targetHeight: 0,
    targetDistance: 1.7,
    targetRadius: 1.1,
    obstacleType: 'none',
    starsScoreRequirement: [1, 2, 3],
  },
  {
    id: 2,
    title: 'Precision Ring',
    description: 'Aim for the colorful center bullseye coaster ring.',
    targetHeight: 0,
    targetDistance: 2.0,
    targetRadius: 0.65,
    obstacleType: 'none',
    starsScoreRequirement: [1, 2, 3],
  },
  {
    id: 3,
    title: 'Mini Delivery Box',
    description: 'First elevated challenge! Land atop the cardboard parcel box.',
    targetHeight: 0.32,
    targetDistance: 2.1,
    targetRadius: 0.55,
    obstacleType: 'minibox',
    starsScoreRequirement: [1, 2, 4],
  },
  {
    id: 4,
    title: 'Coffee Stool',
    description: 'Stick the landing on the round wooden coffee stool.',
    targetHeight: 0.44,
    targetDistance: 2.2,
    targetRadius: 0.50,
    obstacleType: 'stool',
    starsScoreRequirement: [1, 2, 4],
  },
  {
    id: 5,
    title: 'Encyclopedia Stack',
    description: 'Flip onto the colorful encyclopedia study books.',
    targetHeight: 0.40,
    targetDistance: 2.3,
    targetRadius: 0.52,
    obstacleType: 'books',
    starsScoreRequirement: [1, 2, 4],
  },
  {
    id: 6,
    title: 'Kitchen Microwave',
    description: 'Land safely on top of the countertop microwave oven.',
    targetHeight: 0.50,
    targetDistance: 2.3,
    targetRadius: 0.50,
    obstacleType: 'microwave',
    starsScoreRequirement: [1, 2, 5],
  },
  {
    id: 7,
    title: 'High Bar Stool',
    description: 'Elevated flick required! Stick the tall bar stool seat.',
    targetHeight: 0.72,
    targetDistance: 2.4,
    targetRadius: 0.46,
    obstacleType: 'stool',
    starsScoreRequirement: [1, 2, 5],
  },
  {
    id: 8,
    title: 'Living Room TV',
    description: 'Aim carefully! Flip onto the modern flatscreen TV console.',
    targetHeight: 0.58,
    targetDistance: 2.4,
    targetRadius: 0.48,
    obstacleType: 'tv',
    starsScoreRequirement: [1, 2, 5],
  },
  {
    id: 9,
    title: 'Bedside Nightstand',
    description: 'Controlled flip onto the bedroom wooden drawer nightstand.',
    targetHeight: 0.52,
    targetDistance: 2.5,
    targetRadius: 0.46,
    obstacleType: 'nightstand',
    starsScoreRequirement: [1, 2, 5],
  },
  {
    id: 10,
    title: 'Studio Speaker Tower',
    description: 'Stick the landing atop the high-fidelity acoustic subwoofer.',
    targetHeight: 0.65,
    targetDistance: 2.5,
    targetRadius: 0.44,
    obstacleType: 'speaker',
    starsScoreRequirement: [1, 2, 5],
  },
  {
    id: 11,
    title: 'Kitchen Fridge',
    description: 'High upward toss! Reach the top of the double-door refrigerator.',
    targetHeight: 0.92,
    targetDistance: 2.6,
    targetRadius: 0.48,
    obstacleType: 'fridge',
    starsScoreRequirement: [1, 2, 5],
  },
  {
    id: 12,
    title: 'Laundry Washing Machine',
    description: 'Land flat on the top of the front-load washing machine.',
    targetHeight: 0.62,
    targetDistance: 2.6,
    targetRadius: 0.45,
    obstacleType: 'washer',
    starsScoreRequirement: [1, 2, 5],
  },
  {
    id: 13,
    title: 'Gliding Drone Deck',
    description: 'Moving target! Time your release as the hover platform drifts.',
    targetHeight: 0.38,
    targetDistance: 2.5,
    targetRadius: 0.46,
    obstacleType: 'moving',
    movingSpeed: 1.0,
    movingDistance: 0.65,
    starsScoreRequirement: [1, 2, 6],
  },
  {
    id: 14,
    title: 'Wooden Shipping Crate',
    description: 'Solid flip onto the heavy warehouse timber cargo crate.',
    targetHeight: 0.56,
    targetDistance: 2.7,
    targetRadius: 0.45,
    obstacleType: 'crate',
    starsScoreRequirement: [1, 3, 6],
  },
  {
    id: 15,
    title: 'Breezy Patio Stool',
    description: 'Light crosswind draft! Compensate your swipe aim for the wind.',
    targetHeight: 0.68,
    targetDistance: 2.7,
    targetRadius: 0.42,
    obstacleType: 'stool',
    wind: 0.42,
    starsScoreRequirement: [1, 3, 6],
  },
  {
    id: 16,
    title: 'Executive TV Credenza',
    description: 'Longer distance flip onto the elevated office TV cabinet.',
    targetHeight: 0.72,
    targetDistance: 2.8,
    targetRadius: 0.42,
    obstacleType: 'tv',
    starsScoreRequirement: [1, 3, 6],
  },
  {
    id: 17,
    title: 'Mega Library Stack',
    description: 'High 5-volume encyclopedia stack with a compact landing pad.',
    targetHeight: 0.62,
    targetDistance: 2.8,
    targetRadius: 0.40,
    obstacleType: 'books',
    starsScoreRequirement: [1, 3, 6],
  },
  {
    id: 18,
    title: 'Speedway Hover Deck',
    description: 'Fast moving gliding platform demands razor-sharp reflex timing.',
    targetHeight: 0.44,
    targetDistance: 2.8,
    targetRadius: 0.40,
    obstacleType: 'moving',
    movingSpeed: 1.7,
    movingDistance: 0.8,
    starsScoreRequirement: [1, 3, 6],
  },
  {
    id: 19,
    title: 'Skyscraper Tall Fridge',
    description: 'Massive upward power lob! Stick the summit of the tall freezer.',
    targetHeight: 1.05,
    targetDistance: 3.0,
    targetRadius: 0.42,
    obstacleType: 'fridge',
    starsScoreRequirement: [1, 3, 6],
  },
  {
    id: 20,
    title: 'Grand Apex Summit',
    description: 'The Ultimate Campaign Finale! Summit stool + breeze draft.',
    targetHeight: 0.95,
    targetDistance: 3.1,
    targetRadius: 0.35,
    obstacleType: 'stool',
    wind: 0.38,
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
  // Difficulty factor scales smoothly from 0.1 at lvl 21 to 1.0 at lvl 80+
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

  // Target Distance: scales between 2.2m to 3.4m
  const baseDist = 2.2 + progressRatio * 0.8;
  const targetDistance = Math.min(3.4, Math.round((baseDist + rand() * 0.4) * 10) / 10);

  // Target Height: adjusted per obstacle type for realistic geometry
  let baseHeight = 0.45;
  if (obstacleType === 'fridge') {
    baseHeight = 0.85 + progressRatio * 0.25;
  } else if (obstacleType === 'stool') {
    baseHeight = 0.60 + progressRatio * 0.35;
  } else if (obstacleType === 'minibox') {
    baseHeight = 0.30 + progressRatio * 0.15;
  } else if (obstacleType === 'speaker' || obstacleType === 'tv') {
    baseHeight = 0.55 + progressRatio * 0.25;
  } else {
    baseHeight = 0.40 + progressRatio * 0.30;
  }
  const targetHeight = Math.min(1.10, Math.round((baseHeight + rand() * 0.15) * 100) / 100);

  // Target Radius: gradually tighter on higher stages (0.50m down to 0.32m)
  const targetRadius = Math.max(0.32, Math.round((0.50 - progressRatio * 0.16 + (rand() - 0.5) * 0.06) * 100) / 100);

  // Crosswind: introduces gentle drafts on certain stages
  const hasWind = rand() > 0.65;
  const windStrength = hasWind ? (rand() > 0.5 ? 1 : -1) * (0.22 + progressRatio * 0.40) : 0;
  const wind = Math.round(windStrength * 100) / 100;

  // Moving Platform dynamics
  const isMoving = obstacleType === 'moving';
  const movingSpeed = isMoving ? Math.round((0.85 + progressRatio * 0.85 + rand() * 0.4) * 10) / 10 : undefined;
  const movingDistance = isMoving ? Math.round((0.5 + progressRatio * 0.25 + rand() * 0.2) * 10) / 10 : undefined;

  // Authentic stage naming matching official arcade styles
  const objectDisplayNames: Record<ObstacleType, string> = {
    none: 'Table Coaster',
    stool: 'Bar Stool',
    box: 'Wooden Pedestal',
    books: 'Library Book Stack',
    moving: 'Hover Drone Deck',
    tv: 'Flatscreen TV',
    fridge: 'Kitchen Refrigerator',
    minibox: 'Delivery Parcel',
    microwave: 'Kitchen Microwave',
    speaker: 'Studio Audio Tower',
    washer: 'Washing Machine',
    nightstand: 'Bedside Nightstand',
    crate: 'Cargo Crate',
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
  if (isMoving) {
    desc = `Time your release to stick the moving ${objName.toLowerCase()}.`;
  } else if (wind !== 0) {
    desc = `Compensate for the ${wind > 0 ? 'rightward' : 'leftward'} breeze on the ${objName.toLowerCase()}.`;
  } else if (targetHeight > 0.80) {
    desc = `High upward flick needed to reach the tall ${objName.toLowerCase()}.`;
  }

  return {
    id: levelNumber,
    title,
    description: desc,
    targetHeight,
    targetDistance,
    targetRadius,
    obstacleType,
    movingSpeed,
    movingDistance,
    wind,
    starsScoreRequirement: [1, 3, 5],
  };
}
