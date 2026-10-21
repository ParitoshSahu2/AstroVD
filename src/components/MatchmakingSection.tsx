'use client';

import React, { useState } from 'react';
import { fetchMatchmaking } from '../lib/api';
import { Heart, Sparkles, ShieldCheck, AlertCircle, CheckCircle2, ChevronRight, User } from 'lucide-react';

export const MatchmakingSection: React.FC = () => {
  const [boy, setBoy] = useState({
    name: 'Rohan Mehra',
    gender: 'male' as const,
    dateOfBirth: '1995-04-18',
    timeOfBirth: '09:20',
    placeOfBirth: 'Delhi, India',
  });

  const [girl, setGirl] = useState({
    name: 'Ananya Sen',
    gender: 'female' as const,
    dateOfBirth: '1997-08-12',
    timeOfBirth: '14:35',
    placeOfBirth: 'Kolkata, India',
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = await fetchMatchmaking({ boy, girl });
    setResult(data);
    setLoading(false);
  };

  return (
    <section className="space-y-10">
      {/* Title */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>Vedic Ashtakoot Guna Milan</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold gold-gradient-text font-serif">
          Kundli Matching for Marriage
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Evaluate 36 celestial Gunas between partners according to sacred Vedic scriptures. Analyze Nadi Dosha, Bhakoot, Manglik alignment, and marital longevity.
        </p>
      </div>

      {/* Two Column Form for Groom & Bride */}
      <div className="cosmic-card rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto">
        <form onSubmit={handleMatch} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Groom Details */}
            <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-4">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-base border-b border-blue-500/20 pb-2 font-serif">
                <User className="w-4 h-4 text-blue-400" /> Groom’s Birth Details (वर)
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-semibold">Groom Name</label>
                  <input
                    type="text"
                    required
                    value={boy.name}
                    onChange={(e) => setBoy({ ...boy, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-blue-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-semibold">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={boy.dateOfBirth}
                      onChange={(e) => setBoy({ ...boy, dateOfBirth: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-blue-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-semibold">Time of Birth</label>
                    <input
                      type="time"
                      required
                      value={boy.timeOfBirth}
                      onChange={(e) => setBoy({ ...boy, timeOfBirth: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-blue-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-semibold">Birth Place (City)</label>
                  <input
                    type="text"
                    required
                    value={boy.placeOfBirth}
                    onChange={(e) => setBoy({ ...boy, placeOfBirth: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-blue-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bride Details */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-base border-b border-rose-500/20 pb-2 font-serif">
                <Heart className="w-4 h-4 text-rose-400" /> Bride’s Birth Details (कन्या)
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-semibold">Bride Name</label>
                  <input
                    type="text"
                    required
                    value={girl.name}
                    onChange={(e) => setGirl({ ...girl, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-rose-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-semibold">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={girl.dateOfBirth}
                      onChange={(e) => setGirl({ ...girl, dateOfBirth: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-rose-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-semibold">Time of Birth</label>
                    <input
                      type="time"
                      required
                      value={girl.timeOfBirth}
                      onChange={(e) => setGirl({ ...girl, timeOfBirth: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-rose-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-semibold">Birth Place (City)</label>
                  <input
                    type="text"
                    required
                    value={girl.placeOfBirth}
                    onChange={(e) => setGirl({ ...girl, placeOfBirth: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-rose-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-slate-950 font-bold text-sm shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer mx-auto transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full"></div>
                  <span>Matching 36 Gunas in Celestial Akasha...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 text-slate-950 fill-current" />
                  <span>Check Ashtakoot Guna Milan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Match Results View */}
      {result && (
        <div className="cosmic-card rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
          {/* Verdict Score Hero */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 via-slate-900 to-rose-900/30 border border-amber-500/30">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                Compatibility Assessment
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                {result.verdict}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {result.summary}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-amber-500/40 text-center min-w-[180px]">
              <span className="text-4xl font-extrabold gold-gradient-text font-mono">
                {result.totalScore} <span className="text-lg text-slate-400">/ 36</span>
              </span>
              <span className="text-xs text-amber-300 font-semibold mt-1">
                {result.percentage}% Harmony Score
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                (18+ points recommended)
              </span>
            </div>
          </div>

          {/* 8-Guna Breakdown Table */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white font-serif flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Ashtakoot Guna Breakdown (अष्टकूट गुण मिलान)
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Guna (Attribute)</th>
                    <th className="px-4 py-3">Max Points</th>
                    <th className="px-4 py-3">Obtained</th>
                    <th className="px-4 py-3">Boy Attribute</th>
                    <th className="px-4 py-3">Girl Attribute</th>
                    <th className="px-4 py-3">Significance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                  {result.gunaBreakdown.map((guna: any) => (
                    <tr key={guna.name} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-200">
                        {guna.name} <span className="text-[11px] text-amber-400 font-normal">({guna.sanskritName})</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono">{guna.maxPoints}</td>
                      <td className="px-4 py-3 font-mono font-bold text-amber-400">
                        {guna.obtainedPoints}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{guna.boyValue}</td>
                      <td className="px-4 py-3 text-slate-300">{guna.girlValue}</td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">{guna.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dosha & Remedial Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Manglik & Nadi Compatibility
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                {result.doshaCompatibility.manglikAdvice}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {result.doshaCompatibility.nadiAdvice}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" /> Vedic Astrological Remedies
              </h5>
              <ul className="text-xs text-slate-300 space-y-1.5">
                {result.remedies.map((rem: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{rem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
