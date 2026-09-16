import React, { useState } from 'react';
import { ArrowLeft, Trophy, Users, Bot, Flag, Clock, Star, Flame } from 'lucide-react';
import { getMatches, getLevels, getPracticeStats, getTotalStars } from '../services/storage';
import { audio } from '../services/audio';

interface LeaderboardModalProps {
  onBack: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'friend' | 'ai' | 'levels' | 'practice'>('friend');

  const matches = getMatches();
  const levels = getLevels();
  const practiceStats = getPracticeStats();
  const totalStars = getTotalStars();

  const friendMatches = matches.filter((m) => m.mode === 'friend');
  const aiMatches = matches.filter((m) => m.mode === 'ai');

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 max-w-2xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button
          id="leaderboard-back-btn"
          onClick={() => {
            audio.playButton();
            onBack();
          }}
          className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 flex items-center justify-center text-white border border-slate-700 shadow-md active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-['Fredoka'] flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <span>LEADERBOARD</span>
        </h2>

        <div className="w-10" />
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-1.5 mt-3 mb-2 flex-wrap">
        {[
          { id: 'friend', label: 'FRIEND 1V1', icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'ai', label: 'VS AI', icon: <Bot className="w-3.5 h-3.5" /> },
          { id: 'levels', label: 'LEVELS', icon: <Flag className="w-3.5 h-3.5" /> },
          { id: 'practice', label: 'PRACTICE', icon: <Clock className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`lb-tab-${tab.id}`}
            onClick={() => {
              audio.playButton();
              setActiveTab(tab.id as unknown as typeof activeTab);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all font-['Fredoka'] ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Container (Scrollable) */}
      <div className="my-auto py-3 overflow-y-auto max-h-[60vh] pr-1 scrollbar-thin scrollbar-thumb-slate-700 w-full">
        {/* Tab 1: Friend 1v1 */}
        {activeTab === 'friend' && (
          <div className="space-y-2">
            {friendMatches.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-30 text-sky-400" />
                <p className="font-bold">No Friend matches recorded yet.</p>
                <p className="text-xs text-slate-500 mt-1">Play a 1v1 match to log your records!</p>
              </div>
            ) : (
              friendMatches.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white ${
                        m.winner === 'p1'
                          ? 'bg-blue-600'
                          : m.winner === 'p2'
                          ? 'bg-rose-600'
                          : 'bg-purple-600'
                      }`}
                    >
                      {m.winner === 'p1' ? 'P1' : m.winner === 'p2' ? 'P2' : 'TIE'}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">
                        {m.winner === 'p1'
                          ? 'Player 1 Won'
                          : m.winner === 'p2'
                          ? 'Player 2 Won'
                          : 'Draw Match'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {m.rounds} Rounds • {new Date(m.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-amber-400 font-mono">
                      {m.p1.toString().padStart(2, '0')} : {m.p2.toString().padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">P1 : P2</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Vs AI */}
        {activeTab === 'ai' && (
          <div className="space-y-2">
            {aiMatches.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bot className="w-12 h-12 mx-auto mb-2 opacity-30 text-emerald-400" />
                <p className="font-bold">No AI matches recorded yet.</p>
                <p className="text-xs text-slate-500 mt-1">Challenge the bot to test your skills!</p>
              </div>
            ) : (
              aiMatches.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white ${
                        m.winner === 'p1' ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    >
                      {m.winner === 'p1' ? 'YOU' : 'AI'}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">
                        {m.winner === 'p1' ? 'Victory vs AI!' : 'AI Victory'}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        Difficulty: {m.difficulty || 'Medium'} • {m.rounds} Rounds
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-amber-400 font-mono">
                      {m.p1.toString().padStart(2, '0')} : {m.p2.toString().padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">You : Bot</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Levels */}
        {activeTab === 'levels' && (
          <div className="space-y-2">
            {/* Total Stars Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/40 flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/30 flex items-center justify-center">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                    Total Mastery
                  </div>
                  <div className="text-xl font-black text-white font-['Fredoka']">
                    {totalStars} Stars Earned
                  </div>
                </div>
              </div>
            </div>

            {/* Level breakdown list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(levels)
                .filter((l) => l.unlocked)
                .map((l) => (
                  <div
                    key={l.level}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 text-white font-black text-xs flex items-center justify-center">
                        {l.level}
                      </span>
                      <span className="text-xs font-bold text-slate-200">Level {l.level}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-semibold">
                        Best: <b className="text-slate-200">{l.bestScore}</b> pts
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= l.stars
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-slate-800 text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 4: Practice */}
        {activeTab === 'practice' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-900/50 to-slate-900 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-400" />
                <div>
                  <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                    Time Challenge 60s
                  </div>
                  <div className="text-2xl font-black text-white font-['Fredoka']">
                    {practiceStats.timeBest} Landings
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400 px-3 py-1 rounded-full bg-amber-950 border border-amber-500/40">
                Personal Record
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900/50 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                    Target Practice
                  </div>
                  <div className="text-2xl font-black text-white font-['Fredoka']">
                    {practiceStats.targetBest} Points
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40">
                High Score
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/50 to-slate-900 border border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-xs text-purple-300 font-bold uppercase tracking-wider">
                    Free Play Practice
                  </div>
                  <div className="text-2xl font-black text-white font-['Fredoka']">
                    {practiceStats.totalFlips} Flips Logged
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-300 px-3 py-1 rounded-full bg-purple-950 border border-purple-500/40">
                Total Experience
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-400 font-medium pb-2">
        Records are securely stored in your browser storage
      </div>
    </div>
  );
};
