'use client';

import React, { useState } from 'react';
import { fetchTarot } from '../lib/api';
import { Eye, Sparkles, RefreshCw, Flame, ArrowUpCircle, ArrowDownCircle, BookOpen } from 'lucide-react';

export const TarotSection: React.FC = () => {
  const [spreadType, setSpreadType] = useState<'three_card' | 'daily' | 'love'>('three_card');
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const handleDraw = async () => {
    setLoading(true);
    setFlippedCards({});
    const data = await fetchTarot(spreadType);
    setReading(data);
    setLoading(false);
    // Auto flip first card after 300ms for delightful experience
    setTimeout(() => {
      setFlippedCards((prev) => ({ ...prev, 0: true }));
    }, 400);
  };

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section className="space-y-10">
      {/* Title */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span>Major Arcana Cosmic Portal</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold gold-gradient-text font-serif">
          Sacred Tarot Divination
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Channel higher archetypal energies through the 78 keys of divine mystery. Choose a spread, shuffle the deck, and click each card to reveal subconscious guidance.
        </p>
      </div>

      {/* Spread Selector & Draw Controls */}
      <div className="cosmic-card rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800">
          {[
            { id: 'three_card', label: '3-Card Spread (Past / Present / Future)' },
            { id: 'daily', label: '1-Card Daily Oracle' },
            { id: 'love', label: 'Love & Soul Bond' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSpreadType(s.id as any);
                setReading(null);
              }}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                spreadType === s.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div>
          <button
            onClick={handleDraw}
            disabled={loading}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 inline-flex items-center gap-2 cursor-pointer transition-all duration-200 transform hover:scale-105"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Shuffling Cosmic Deck...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Shuffle & Draw Cards</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cards Area */}
      {reading && (
        <div className="space-y-10 max-w-5xl mx-auto">
          {/* Card Spread Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
            {reading.cards.map((item: any, idx: number) => {
              const isFlipped = !!flippedCards[idx];
              return (
                <div key={idx} className="flex flex-col items-center space-y-4">
                  <span className="text-xs uppercase tracking-wider font-bold text-amber-300">
                    {item.position}
                  </span>

                  {/* 3D Flip Card Container */}
                  <div
                    onClick={() => toggleFlip(idx)}
                    className="w-64 h-96 perspective-1000 cursor-pointer group"
                  >
                    <div
                      className={`relative w-full h-full transition-transform duration-700 transform-style-3d rounded-2xl shadow-2xl ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Card Back (Unflipped) */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl p-4 bg-gradient-to-br from-indigo-950 via-[#0d0f28] to-purple-950 border-2 border-amber-500/40 flex flex-col items-center justify-between shadow-inner">
                        <div className="text-[10px] text-amber-300/80 uppercase tracking-widest font-mono">
                          TAROT OF COSMIC TRUTH
                        </div>
                        <div className="w-24 h-24 rounded-full border-2 border-amber-400/50 flex items-center justify-center relative">
                          <span className="text-4xl text-amber-300 animate-pulse">✦</span>
                          <div className="absolute inset-0 border border-purple-400/30 rounded-full animate-spin-slow"></div>
                        </div>
                        <span className="text-xs text-slate-400 group-hover:text-amber-300 transition-colors">
                          Click to Flip & Reveal
                        </span>
                      </div>

                      {/* Card Front (Flipped) */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl p-5 bg-gradient-to-b from-slate-900 via-[#131633] to-slate-950 border-2 border-amber-400 flex flex-col justify-between shadow-2xl overflow-hidden">
                        {/* Top Indicator */}
                        <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                          <span className="font-mono text-amber-400 font-bold">
                            #{item.card.number}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {item.card.arcana} Arcana
                          </span>
                        </div>

                        {/* Card Image / Icon Center */}
                        <div className="my-auto text-center space-y-2 py-2">
                          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-600/30 border border-amber-400/30 flex items-center justify-center text-4xl shadow-lg">
                            {item.card.number === 0 ? '🃏' :
                             item.card.number === 1 ? '🪄' :
                             item.card.number === 2 ? '🌙' :
                             item.card.number === 3 ? '👑' :
                             item.card.number === 17 ? '⭐' :
                             item.card.number === 19 ? '☀️' : '🔮'}
                          </div>
                          <h4 className="text-lg font-bold text-white font-serif tracking-wide">
                            {item.card.name}
                          </h4>
                          <div className="flex items-center justify-center gap-1 text-[11px]">
                            {item.isReversed ? (
                              <span className="text-rose-400 flex items-center gap-1 font-semibold">
                                <ArrowDownCircle className="w-3.5 h-3.5" /> Reversed
                              </span>
                            ) : (
                              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                                <ArrowUpCircle className="w-3.5 h-3.5" /> Upright
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Keywords */}
                        <div className="space-y-1 pt-2 border-t border-slate-800 text-center">
                          <div className="flex flex-wrap justify-center gap-1">
                            {item.card.keywords.slice(0, 3).map((kw: string, i: number) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Meaning Text */}
                  {isFlipped && (
                    <div className="text-center p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 max-w-xs leading-relaxed animate-fadeIn">
                      <p className="font-medium text-amber-300 mb-1">{item.interpretation}</p>
                      <p className="text-[11px] text-slate-400">{item.card.advice}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall Reading Guidance */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 flex items-start gap-4">
            <BookOpen className="w-6 h-6 text-purple-400 mt-1 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm uppercase font-bold tracking-wider text-purple-300">
                Synthesis & Oracle Guidance
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed">
                {reading.overallGuidance}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
