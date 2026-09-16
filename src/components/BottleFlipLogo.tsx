import React from 'react';

export const BottleFlipLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 460 210"
        className="w-full max-w-[360px] sm:max-w-[440px] drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Yellow 3D gradient for BOTTLE */}
          <linearGradient id="yellowTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF7B2" />
            <stop offset="25%" stopColor="#FFDE26" />
            <stop offset="75%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Blue 3D gradient for FLIP */}
          <linearGradient id="blueTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="25%" stopColor="#38BDF8" />
            <stop offset="75%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* Wood Plank Gradient */}
          <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A46435" />
            <stop offset="35%" stopColor="#8C4E23" />
            <stop offset="70%" stopColor="#733D17" />
            <stop offset="100%" stopColor="#552B0E" />
          </linearGradient>

          {/* Bottle Plastic Shading */}
          <linearGradient id="miniBottleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="35%" stopColor="#BAE6FD" />
            <stop offset="70%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* 1. ROW 1: "BOTTLE" in bubbly yellow 3D text */}
        <g filter="url(#logoShadow)">
          {/* Deep Navy Outlines & 3D Extrusion Behind */}
          {[8, 7, 6, 5, 4, 3, 2, 1].map((offset) => (
            <text
              key={offset}
              x="230"
              y={76 + offset}
              textAnchor="middle"
              fontFamily="Fredoka, system-ui, sans-serif"
              fontWeight="900"
              fontSize="68"
              letterSpacing="2"
              fill={offset > 4 ? '#0F172A' : '#C2410C'}
              stroke="#0F172A"
              strokeWidth={offset > 4 ? '18' : '14'}
              strokeLinejoin="round"
            >
              BOTTLE
            </text>
          ))}

          {/* Front Yellow Fill */}
          <text
            x="230"
            y="76"
            textAnchor="middle"
            fontFamily="Fredoka, system-ui, sans-serif"
            fontWeight="900"
            fontSize="68"
            letterSpacing="2"
            fill="url(#yellowTopGrad)"
            stroke="#0F172A"
            strokeWidth="8"
            strokeLinejoin="round"
          >
            BOTTLE
          </text>

          {/* White Top Specular Highlights */}
          <text
            x="230"
            y="73"
            textAnchor="middle"
            fontFamily="Fredoka, system-ui, sans-serif"
            fontWeight="900"
            fontSize="68"
            letterSpacing="2"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeDasharray="20 18"
            strokeLinecap="round"
          >
            BOTTLE
          </text>
        </g>

        {/* 2. ROW 2: MINI TILTED BOTTLE ICON + "FLIP" */}
        <g filter="url(#logoShadow)">
          {/* Cute Tilted Bottle Icon beside the F */}
          <g transform="translate(18, 56) rotate(-14 110 90)">
            {/* Dark Outline */}
            <rect x="94" y="65" width="28" height="52" rx="7" fill="#0F172A" />
            <rect x="100" y="54" width="16" height="13" rx="3" fill="#0F172A" />
            <rect x="98" y="48" width="20" height="9" rx="3" fill="#0F172A" />

            {/* Bottle Body */}
            <rect x="96" y="67" width="24" height="48" rx="5" fill="url(#miniBottleGrad)" />
            {/* Ribs */}
            <line x1="98" y1="80" x2="118" y2="80" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.6" />
            <line x1="98" y1="92" x2="118" y2="92" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.6" />
            {/* White Label Band */}
            <rect x="96" y="82" width="24" height="14" fill="#FFFFFF" fillOpacity="0.95" />
            {/* Cap: Red */}
            <rect x="100" y="50" width="16" height="8" rx="2" fill="#EF4444" />
            <rect x="102" y="57" width="12" height="10" fill="#38BDF8" />
          </g>

          {/* FLIP 3D Extrusion Behind */}
          {[8, 7, 6, 5, 4, 3, 2, 1].map((offset) => (
            <text
              key={offset}
              x="248"
              y={140 + offset}
              textAnchor="middle"
              fontFamily="Fredoka, system-ui, sans-serif"
              fontWeight="900"
              fontSize="74"
              letterSpacing="3"
              fill={offset > 4 ? '#0F172A' : '#1E3A8A'}
              stroke="#0F172A"
              strokeWidth={offset > 4 ? '18' : '14'}
              strokeLinejoin="round"
            >
              FLIP
            </text>
          ))}

          {/* Front Cyan Fill */}
          <text
            x="248"
            y="140"
            textAnchor="middle"
            fontFamily="Fredoka, system-ui, sans-serif"
            fontWeight="900"
            fontSize="74"
            letterSpacing="3"
            fill="url(#blueTopGrad)"
            stroke="#0F172A"
            strokeWidth="8"
            strokeLinejoin="round"
          >
            FLIP
          </text>

          {/* White Highlights */}
          <text
            x="248"
            y="137"
            textAnchor="middle"
            fontFamily="Fredoka, system-ui, sans-serif"
            fontWeight="900"
            fontSize="74"
            letterSpacing="3"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeDasharray="24 16"
            strokeLinecap="round"
          >
            FLIP
          </text>
        </g>

        {/* 3. WOODEN BANNER: "SKILL • PHYSICS • FUN" */}
        <g transform="translate(70, 168)" filter="url(#logoShadow)">
          {/* Outer Border */}
          <rect
            x="0"
            y="0"
            width="320"
            height="34"
            rx="10"
            fill="#0F172A"
            stroke="#0F172A"
            strokeWidth="4"
          />
          {/* Wood Plaque Fill */}
          <rect
            x="3"
            y="3"
            width="314"
            height="28"
            rx="7"
            fill="url(#woodGrad)"
            stroke="#D97706"
            strokeWidth="1.5"
          />

          {/* Wood Edge Highlights & Corner Nails */}
          <line x1="8" y1="5" x2="312" y2="5" stroke="#FDE68A" strokeWidth="1" strokeOpacity="0.4" />
          <circle cx="16" cy="17" r="3.5" fill="#3D1D09" stroke="#E5E7EB" strokeWidth="1" />
          <circle cx="304" cy="17" r="3.5" fill="#3D1D09" stroke="#E5E7EB" strokeWidth="1" />

          {/* White Banner Text */}
          <text
            x="160"
            y="23"
            textAnchor="middle"
            fontFamily="Fredoka, system-ui, sans-serif"
            fontWeight="700"
            fontSize="15"
            letterSpacing="3.5"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="1"
          >
            SKILL • PHYSICS • FUN
          </text>
        </g>
      </svg>
    </div>
  );
};
