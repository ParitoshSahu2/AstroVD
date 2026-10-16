'use client';

import React, { useState, useEffect } from 'react';
import { fetchPanchang } from '../lib/api';
import { Calendar, Sunrise, Sunset, Moon, Sun, Clock, ShieldCheck, AlertTriangle, Sparkles } from 'lucide-react';

export const PanchangSection: React.FC = () => {
  const [panchang, setPanchang] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPanchang().then((data) => {
      setPanchang(data);
      setLoading(false);
    });
  }, []);

  return (
    <section className="space-y-10">
      {/* Title */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Vedic Hindu Almanac & Muhurat</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold gold-gradient-text font-serif">
          Today’s Vedic Panchang
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          The 5 limbs of Vedic time (Tithi, Vara, Nakshatra, Yoga, Karana). Ascertain auspicious Abhijit Muhurat for critical undertakings and avoid inauspicious Rahu Kaal.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center cosmic-card rounded-3xl animate-pulse space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
          <p className="text-amber-300 font-serif">Consulting Celestial Ephemeris...</p>
        </div>
      ) : panchang ? (
        <div className="cosmic-card rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto space-y-8">
          {/* Header Date & Solar/Lunar Cycles */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800 text-center md:text-left">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold block">
                Current Astronomical Epoch
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-serif mt-1">
                {panchang.date}
              </h3>
            </div>

            {/* Sun & Moon Horology */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="flex items-center justify-center gap-1 text-[10px] uppercase text-amber-400 font-semibold">
                  <Sunrise className="w-3 h-3" /> Sunrise
                </span>
                <span className="text-xs font-mono font-bold text-white mt-0.5 block">{panchang.sunrise}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="flex items-center justify-center gap-1 text-[10px] uppercase text-orange-400 font-semibold">
                  <Sunset className="w-3 h-3" /> Sunset
                </span>
                <span className="text-xs font-mono font-bold text-white mt-0.5 block">{panchang.sunset}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="flex items-center justify-center gap-1 text-[10px] uppercase text-sky-400 font-semibold">
                  <Moon className="w-3 h-3" /> Moonrise
                </span>
                <span className="text-xs font-mono font-bold text-white mt-0.5 block">{panchang.moonrise}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="flex items-center justify-center gap-1 text-[10px] uppercase text-indigo-400 font-semibold">
                  <Moon className="w-3 h-3" /> Moonset
                </span>
                <span className="text-xs font-mono font-bold text-white mt-0.5 block">{panchang.moonset}</span>
              </div>
            </div>
          </div>

          {/* The 5 Limbs (Panch-Anga) Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400">1. Tithi (Lunar Day)</span>
              <div className="text-base font-bold text-white">{panchang.tithi.name}</div>
              <div className="text-[11px] text-slate-400">Paksha: {panchang.tithi.paksha}</div>
              <div className="text-[10px] text-slate-400 font-mono">Until {panchang.tithi.endsAt}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-sky-400">2. Nakshatra (Constellation)</span>
              <div className="text-base font-bold text-white">{panchang.nakshatra.name}</div>
              <div className="text-[11px] text-slate-400">Pada: {panchang.nakshatra.pada}</div>
              <div className="text-[10px] text-slate-400 font-mono">Until {panchang.nakshatra.endsAt}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-purple-400">3. Yoga (Solar/Lunar Angle)</span>
              <div className="text-base font-bold text-white">{panchang.yoga.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">Until {panchang.yoga.endsAt}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400">4. Karana (Half Tithi)</span>
              <div className="text-base font-bold text-white">{panchang.karana.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">Until {panchang.karana.endsAt}</div>
            </div>
          </div>

          {/* Muhurat Timing Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auspicious Muhurats */}
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Shubh Muhurat (Auspicious Timings)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-300 font-medium">Abhijit Muhurat (Supreme)</span>
                  <span className="font-mono text-emerald-400 font-bold">{panchang.auspiciousPeriods.abhijitMuhurat}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-300 font-medium">Amrit Kaal</span>
                  <span className="font-mono text-emerald-400 font-bold">{panchang.auspiciousPeriods.amritKaal}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-300 font-medium">Brahma Muhurat (Meditation)</span>
                  <span className="font-mono text-emerald-400 font-bold">{panchang.auspiciousPeriods.brahmaMuhurat}</span>
                </div>
              </div>
            </div>

            {/* Inauspicious Periods */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
              <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Ashubh Kaal (Avoid Starting Key Projects)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-300 font-medium">Rahu Kaal (Avoid)</span>
                  <span className="font-mono text-rose-400 font-bold">{panchang.inauspiciousPeriods.rahuKaal}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-300 font-medium">Yamaganda</span>
                  <span className="font-mono text-rose-400 font-bold">{panchang.inauspiciousPeriods.yamaganda}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-300 font-medium">Gulika Kaal</span>
                  <span className="font-mono text-rose-400 font-bold">{panchang.inauspiciousPeriods.gulikaKaal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Auspicious Verdict */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-200 leading-relaxed font-medium">
              {panchang.auspiciousSummary}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
};
