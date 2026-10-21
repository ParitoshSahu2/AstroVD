'use client';

import React, { useState, useEffect } from 'react';
import { fetchHoroscope } from '../lib/api';
import { Sparkles, Heart, Briefcase, DollarSign, Activity, Compass, Flame, Droplets, Wind, Mountain } from 'lucide-react';

export const HoroscopeSection: React.FC = () => {
  const [selectedSign, setSelectedSign] = useState('aries');
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [horoscope, setHoroscope] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const zodiacSigns = [
    { sign: 'aries', name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire', color: 'from-red-500/20 to-orange-500/20' },
    { sign: 'taurus', name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth', color: 'from-emerald-500/20 to-teal-500/20' },
    { sign: 'gemini', name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air', color: 'from-amber-500/20 to-yellow-500/20' },
    { sign: 'cancer', name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water', color: 'from-blue-500/20 to-cyan-500/20' },
    { sign: 'leo', name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire', color: 'from-amber-500/20 to-orange-500/20' },
    { sign: 'virgo', name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth', color: 'from-lime-500/20 to-emerald-500/20' },
    { sign: 'libra', name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air', color: 'from-pink-500/20 to-rose-500/20' },
    { sign: 'scorpio', name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water', color: 'from-purple-500/20 to-indigo-500/20' },
    { sign: 'sagittarius', name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire', color: 'from-violet-500/20 to-purple-500/20' },
    { sign: 'capricorn', name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth', color: 'from-stone-500/20 to-slate-500/20' },
    { sign: 'aquarius', name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air', color: 'from-cyan-500/20 to-blue-500/20' },
    { sign: 'pisces', name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water', color: 'from-indigo-500/20 to-sky-500/20' },
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchHoroscope(selectedSign, selectedPeriod).then((data) => {
      if (isMounted) {
        setHoroscope(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedSign, selectedPeriod]);

  const getElementIcon = (element: string) => {
    switch (element?.toLowerCase()) {
      case 'fire': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'water': return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'air': return <Wind className="w-4 h-4 text-cyan-300" />;
      case 'earth': return <Mountain className="w-4 h-4 text-emerald-400" />;
      default: return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <section className="space-y-10">
      {/* Hero Title */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Planetary Transits & Cosmic Oracle</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold gold-gradient-text font-serif">
          Daily Zodiac Horoscope
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Select your celestial sun sign to unlock Vedic and Western planetary forecasts, love alignments, career prospects, and auspicious energy vibrations.
        </p>
      </div>

      {/* Zodiac Sign Grid Carousel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {zodiacSigns.map((z) => {
          const isSelected = selectedSign === z.sign;
          return (
            <button
              key={z.sign}
              onClick={() => setSelectedSign(z.sign)}
              className={`p-3.5 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-500/25 to-purple-900/40 border-2 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.03]'
                  : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40'
              }`}
            >
              <span className="text-3xl mb-1 transform group-hover:scale-110 transition-transform duration-200">
                {z.symbol}
              </span>
              <span className={`font-semibold text-sm ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                {z.name}
              </span>
              <span className="text-[11px] text-slate-400">{z.dates}</span>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                {getElementIcon(z.element)}
                <span>{z.element}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
          {['daily', 'weekly', 'monthly'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all duration-200 ${
                selectedPeriod === period
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {period === 'daily' ? 'Today’s Reading' : `${period} Forecast`}
            </button>
          ))}
        </div>
      </div>

      {/* Horoscope Content Card */}
      {loading ? (
        <div className="p-16 text-center rounded-3xl cosmic-card animate-pulse space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
          <p className="text-amber-300 font-serif text-lg">Aligning Celestial Spheres...</p>
        </div>
      ) : horoscope ? (
        <div className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-8">
          {/* Card Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-600/30 border border-amber-500/40 flex items-center justify-center text-4xl shadow-lg">
                {horoscope.symbol}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                    {horoscope.sign}
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                    {horoscope.period.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  Element: <span className="text-slate-200 font-medium">{horoscope.element}</span> • Ruling Planet: <span className="text-amber-300 font-medium">{horoscope.rulingPlanet}</span>
                </p>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">Lucky Number</span>
                <span className="text-lg font-bold text-amber-400">{horoscope.luckyNumber}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">Lucky Color</span>
                <span className="text-xs font-bold text-slate-200">{horoscope.luckyColor}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">Soul Match</span>
                <span className="text-xs font-bold text-rose-300">{horoscope.compatibleSign}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">Aura Mood</span>
                <span className="text-xs font-bold text-purple-300">{horoscope.mood}</span>
              </div>
            </div>
          </div>

          {/* Planetary Energy Meters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <Heart className="w-3.5 h-3.5" /> Love & Romance
                </span>
                <span className="font-mono text-white font-bold">{horoscope.metrics.loveScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${horoscope.metrics.loveScore}%` }}></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <Briefcase className="w-3.5 h-3.5" /> Career & Purpose
                </span>
                <span className="font-mono text-white font-bold">{horoscope.metrics.careerScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${horoscope.metrics.careerScore}%` }}></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Cosmic Luck
                </span>
                <span className="font-mono text-white font-bold">{horoscope.metrics.luckScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${horoscope.metrics.luckScore}%` }}></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Activity className="w-3.5 h-3.5" /> Vitality & Health
                </span>
                <span className="font-mono text-white font-bold">{horoscope.metrics.healthScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${horoscope.metrics.healthScore}%` }}></div>
              </div>
            </div>
          </div>

          {/* Predictions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/20 to-slate-900/80 border border-purple-500/20 space-y-2">
              <h4 className="text-base font-semibold text-purple-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Personal Cosmic Influence
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">{horoscope.prediction.personal}</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-900/20 to-slate-900/80 border border-rose-500/20 space-y-2">
              <h4 className="text-base font-semibold text-rose-300 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" /> Love & Emotional Bonds
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">{horoscope.prediction.love}</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/20 to-slate-900/80 border border-blue-500/20 space-y-2">
              <h4 className="text-base font-semibold text-blue-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" /> Professional Trajectory
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">{horoscope.prediction.career}</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-slate-900/80 border border-emerald-500/20 space-y-2">
              <h4 className="text-base font-semibold text-emerald-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Wealth & Prosperity
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">{horoscope.prediction.finance}</p>
            </div>
          </div>

          {/* Celestial Transit Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <Compass className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h5 className="text-xs uppercase font-bold tracking-wider text-amber-300">
                Planetary Transit & Astrological Aspect
              </h5>
              <p className="text-xs text-slate-300 mt-0.5">{horoscope.planetaryAspect}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
