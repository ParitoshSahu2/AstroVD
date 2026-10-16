'use client';

import React, { useState } from 'react';
import { fetchNumerology } from '../lib/api';
import { Hash, Sparkles, Award, Zap, CheckCircle2, ChevronRight, User, Calendar } from 'lucide-react';

export const NumerologySection: React.FC = () => {
  const [fullName, setFullName] = useState('Aarav Sharma');
  const [dateOfBirth, setDateOfBirth] = useState('1996-08-15');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = await fetchNumerology({ fullName, dateOfBirth });
    setResult(data);
    setLoading(false);
  };

  return (
    <section className="space-y-10">
      {/* Title */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <Hash className="w-3.5 h-3.5 text-cyan-400" />
          <span>Pythagorean & Chaldean Sacred Code</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold gold-gradient-text font-serif">
          Numerology Life Matrix
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Numbers are the divine geometry of creation. Reveal your core vibration, Life Path trajectory, Soul Urge desire, and Master numbers hidden in your name and birth date.
        </p>
      </div>

      {/* Input Form */}
      <div className="cosmic-card rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto">
        <form onSubmit={handleCalculate} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" /> Full Birth Name (As given on birth record)
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              placeholder="e.g. Elena Rostova"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Date of Birth
            </label>
            <input
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                <span>Computing Numerical Resonance...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-cyan-200" />
                <span>Calculate Numerology Blueprint</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Numerology Results */}
      {result && (
        <div className="space-y-8 max-w-4xl mx-auto animate-fadeIn">
          {/* Life Path Number Hero Banner */}
          <div className="cosmic-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-purple-950/30 border border-cyan-500/30">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs uppercase tracking-wider font-bold text-cyan-400">
                Primary Cosmic Frequency
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                {result.lifePathNumber.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                {result.lifePathNumber.description}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-cyan-400/40 text-center min-w-[170px]">
              <span className="text-xs text-slate-400 font-semibold uppercase">Life Path</span>
              <span className="text-6xl font-extrabold text-cyan-400 font-mono my-1">
                {result.lifePathNumber.number}
              </span>
              <span className="text-[10px] text-amber-300">Ruling Soul Vibration</span>
            </div>
          </div>

          {/* Key Traits & Strengths */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Natural Gifts & Strengths
              </h4>
              <ul className="text-xs text-slate-300 space-y-1.5">
                {result.lifePathNumber.strengths?.map((str: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Soul Traits & Archetype Keys
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.lifePathNumber.traits?.map((tr: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300">
                    {tr}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Numbers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Destiny / Expression</span>
              <div className="text-3xl font-extrabold text-purple-400 font-mono">
                {result.destinyNumber.number}
              </div>
              <p className="text-[11px] text-slate-400">{result.destinyNumber.description}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Soul Urge (Heart)</span>
              <div className="text-3xl font-extrabold text-rose-400 font-mono">
                {result.soulUrgeNumber.number}
              </div>
              <p className="text-[11px] text-slate-400">{result.soulUrgeNumber.description}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Birthday Power Day</span>
              <div className="text-3xl font-extrabold text-amber-400 font-mono">
                {result.birthdayNumber.number}
              </div>
              <p className="text-[11px] text-slate-400">{result.birthdayNumber.specialGift}</p>
            </div>
          </div>

          {/* Lucky Resonances Banner */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Auspicious Days</span>
              <span className="text-xs font-bold text-white">{result.luckyDays?.join(', ')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cosmic Power Colors</span>
              <span className="text-xs font-bold text-amber-300">{result.luckyColors?.join(', ')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Harmonious Crystals</span>
              <span className="text-xs font-bold text-cyan-300">{result.luckyGems?.join(', ')}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
