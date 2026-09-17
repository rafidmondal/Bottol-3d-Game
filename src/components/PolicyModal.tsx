import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, RefreshCw, FileText } from 'lucide-react';
import { audio } from '../services/audio';

const GOOGLE_DOC_URL = 'https://docs.google.com/document/d/1SDTn5ON6UasWdOBQvwNtQqN8TfL5dUSj/preview';

interface PolicyButtonProps {
  onClick: () => void;
  className?: string;
}

export const PolicyButton: React.FC<PolicyButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      type="button"
      id="btn-all-policies"
      onClick={() => {
        audio.playButton();
        onClick();
      }}
      className={`p-btn inline-flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none pointer-events-auto cursor-pointer ${className}`}
      title="All Policies"
      style={{ background: 'none', border: 0, padding: 0 }}
    >
      <svg
        width="100"
        height="30"
        viewBox="0 0 850 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.45)) drop-shadow(0 0 12px rgba(128, 0, 255, 0.3))',
          willChange: 'transform',
        }}
      >
        <defs>
          <linearGradient id="c_poly">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#0055ff" />
          </linearGradient>
          <linearGradient id="w1_poly">
            <stop offset="0%" stopColor="#00aaff" />
            <stop offset="60%" stopColor="#8000ff" />
            <stop offset="100%" stopColor="#ff00aa" />
          </linearGradient>
          <linearGradient id="w2_poly">
            <stop offset="0%" stopColor="#00ffff" />
            <stop offset="50%" stopColor="#b026ff" />
            <stop offset="100%" stopColor="#ff66cc" />
          </linearGradient>
          <linearGradient id="bg_poly">
            <stop offset="0%" stopColor="#040e29" stopOpacity=".95" />
            <stop offset="100%" stopColor="#180b30" stopOpacity=".7" />
          </linearGradient>
        </defs>

        <path
          d="M480 200C620 290 760 270 820 220C740 235 600 220 480 200Z"
          fill="url(#w1_poly)"
          opacity=".8"
        />
        <path
          d="M490 170C640 260 780 230 835 150C750 185 610 185 490 170Z"
          fill="url(#w1_poly)"
        />
        <path
          d="M500 140C660 210 790 170 830 70C760 135 630 150 500 140Z"
          fill="url(#w2_poly)"
        />
        <path
          d="M520 110C670 160 800 100 820 20C760 80 640 110 520 110Z"
          fill="#ff77ff"
        />
        <path
          d="M160 50L580 85C640 120 640 200 580 235L160 270Z"
          fill="url(#bg_poly)"
          stroke="url(#c_poly)"
          strokeWidth="3"
        />

        <circle cx="160" cy="160" r="115" fill="#030a16" stroke="url(#c_poly)" strokeWidth="6" />
        <circle cx="160" cy="160" r="100" fill="none" stroke="#00f0ff" strokeWidth="2" opacity=".6" />

        <g
          transform="translate(122 118) scale(1.3)"
          stroke="#00f0ff"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        >
          <path d="M14 2H6C4 2 4 3 4 4V28C4 29 5 30 6 30H22C23 30 24 29 24 28V12L14 2Z" />
          <polyline points="14 2 14 12 24 12" />
          <line x1="9" y1="18" x2="19" y2="18" />
          <line x1="9" y1="23" x2="16" y2="23" />
        </g>

        <text
          x="305"
          y="190"
          fill="#fff"
          fontFamily="'Playfair Display',serif"
          fontWeight="600"
          fontStyle="italic"
          fontSize="62"
        >
          All Policies
        </text>

        <g
          transform="translate(630 138)"
          stroke="#fff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="0" y1="20" x2="35" y2="20" />
          <polyline points="20 5 35 20 20 35" />
        </g>
      </svg>
    </button>
  );
};

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose }) => {
  const [iframeKey, setIframeKey] = useState(0);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      id="pm"
      className="p-mod fixed inset-0 flex justify-center items-center z-[999999] p-2 sm:p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="p-box relative flex flex-col overflow-hidden"
        style={{
          background: '#0b0f19',
          border: '1.5px solid rgba(0, 240, 255, 0.45)',
          boxShadow: '0 0 35px rgba(0, 212, 255, 0.3)',
          width: '94%',
          maxWidth: '850px',
          height: '86vh',
          borderRadius: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with title, new-tab fallback, reload & prominent Close button */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 bg-slate-950/90 border-b border-cyan-500/30 shrink-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <FileText className="w-4 h-4" />
            </div>
            <span
              className="text-white text-sm sm:text-base font-semibold tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
            >
              All Policies
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Open in full tab / Google docs fallback */}
            <a
              href={GOOGLE_DOC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition-colors"
              title="Open document in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Tab</span>
            </a>

            {/* Reload iframe */}
            <button
              type="button"
              onClick={() => setIframeKey((k) => k + 1)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Reload document"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Close button with large touch target and high z-index */}
            <button
              type="button"
              className="p-close flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white border border-red-500/40 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
              onClick={() => {
                audio.playButton();
                onClose();
              }}
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Iframe Container */}
        <div
          className="flex-1 w-full relative bg-slate-950 overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          <iframe
            key={iframeKey}
            src={GOOGLE_DOC_URL}
            title="All Policies Document"
            scrolling="yes"
            className="w-full h-full border-0"
            style={{
              width: '100%',
              height: '100%',
              minHeight: '100%',
              border: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );

  // Use Portal to render at document root to avoid being affected by parent transforms or stacking
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
