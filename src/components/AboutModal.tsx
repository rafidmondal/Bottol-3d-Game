import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  BookOpen,
  Copy,
  Check,
  Search,
  FileText,
} from 'lucide-react';
import { ABOUT_DOCUMENTATION_RAW } from '../data/aboutDocumentation';
import { audio } from '../services/audio';
import { PolicyButton, PolicyModal } from './PolicyModal';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(ABOUT_DOCUMENTATION_RAW);
    setCopied(true);
    audio.playButton();
    setTimeout(() => setCopied(false), 2000);
  };

  // If there is a search query, filter paragraphs containing the query
  const displayedContent = useMemo(() => {
    if (!searchQuery.trim()) {
      return ABOUT_DOCUMENTATION_RAW;
    }
    const q = searchQuery.toLowerCase();
    const blocks = ABOUT_DOCUMENTATION_RAW.split(/\n{2,}/);
    const matches = blocks.filter((b) => b.toLowerCase().includes(q));
    if (matches.length === 0) {
      return `No matches found for "${searchQuery}".\n\nTry searching for keywords like "Part 1", "Physics", "Flip", "Level", "FAQ", or "Raxzen".`;
    }
    return matches.join('\n\n---\n\n');
  }, [searchQuery]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* 1. TOP HEADER */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white font-['Fredoka'] tracking-wide">
                    BOTTLE FLIP 3D DOCS
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    Txt
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Made by Raxzen
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Full Game Documentation, Physics Guide & Specifications
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Copy Full Docs Button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                title="Copy all text to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span className="hidden sm:inline">Copy All</span>
                  </>
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. SEARCH & STATS BAR */}
          <div className="px-4 sm:px-6 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search words, parts, physics, FAQs..."
                className="w-full pl-9 pr-8 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
              {ABOUT_DOCUMENTATION_RAW.length.toLocaleString()} characters • Complete Uncut
            </div>
          </div>

          {/* 3. CLEAN TXT CONTENT AREA (Clean, fast, beautiful pure text) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 selection:bg-sky-500/30">
            <div className="max-w-3xl mx-auto bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-6">
              <pre className="font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed break-words font-medium">
                {displayedContent}
              </pre>
            </div>
          </div>

          {/* 4. FOOTER */}
          <div className="px-4 sm:px-6 py-2.5 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <span>Made By <strong className="text-white">Raxzen</strong></span>
              <span>•</span>
              <span className="text-sky-400">🍃 Thanks 🎀</span>
            </div>

            <div className="flex items-center gap-2.5">
              <PolicyButton onClick={() => setShowPolicies(true)} />
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Policy Modal */}
          <PolicyModal isOpen={showPolicies} onClose={() => setShowPolicies(false)} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
