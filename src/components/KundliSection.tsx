'use client';

import React, { useState } from 'react';
import { fetchKundli } from '../lib/api';
import { Compass, Sparkles, ShieldAlert, Award, Gem, Clock, Calendar, MapPin, User, ChevronRight } from 'lucide-react';

export const KundliSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: 'Aarav Sharma',
    gender: 'male',
    dateOfBirth: '1998-10-24',
    timeOfBirth: '08:45',
    placeOfBirth: 'New Delhi, India',
  });

  const [kundliData, setKundliData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await fetchKundli(formData);
    setKundliData(result);
    setLoading(false);
  };

  return (
    <section className="space-y-10">
      {/* Title */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Vedic Janam Kundli & Bhava Chart</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold gold-gradient-text font-serif">
          Vedic Birth Chart Generator
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Compute accurate planetary coordinates, Ascendant (Lagna), Nakshatra, Manglik Dosha, Vimshottari Mahadasha, and personal astrological gemstone prescriptions.
        </p>
      </div>

      {/* Input Form */}
      <div className="cosmic-card rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" /> Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
              placeholder="e.g. Priya Sharma"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Date of Birth
            </label>
            <input
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Time of Birth
            </label>
            <input
              type="time"
              required
              value={formData.timeOfBirth}
              onChange={(e) => setFormData({ ...formData, timeOfBirth: e.target.value })}
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Place of Birth (City, Country)
            </label>
            <input
              type="text"
              required
              value={formData.placeOfBirth}
              onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
              placeholder="e.g. Mumbai, India or London, UK"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full"></div>
                  <span>Calculating Planetary Coordinates...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Generate Janam Kundli</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Kundli Results View */}
      {kundliData && (
        <div className="space-y-8 max-w-5xl mx-auto">
          {/* Header Summary */}
          <div className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
              <div>
                <h3 className="text-2xl font-bold text-white font-serif">
                  {kundliData.birthDetails.name}’s Vedic Horoscope
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Born on {kundliData.birthDetails.datetime} in {kundliData.birthDetails.place}
                </p>
              </div>

              {/* Manglik status badge */}
              <div className="flex items-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  kundliData.doshaAnalysis.manglik.isManglik
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {kundliData.doshaAnalysis.manglik.isManglik ? `Manglik (${kundliData.doshaAnalysis.manglik.severity})` : 'Non-Manglik'}
                </span>
              </div>
            </div>

            {/* Core Vedic Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Lagna (Ascendant)</span>
                <span className="text-base font-bold text-amber-400">{kundliData.basicAstrology.ascendant}</span>
                <span className="text-[10px] text-slate-400 block">Lord: {kundliData.basicAstrology.ascendantLord}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Moon Sign (Rashi)</span>
                <span className="text-base font-bold text-sky-400">{kundliData.basicAstrology.moonSign}</span>
                <span className="text-[10px] text-slate-400 block">Sun Sign: {kundliData.basicAstrology.sunSign}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nakshatra</span>
                <span className="text-base font-bold text-purple-400">{kundliData.basicAstrology.nakshatra}</span>
                <span className="text-[10px] text-slate-400 block">Pada: {kundliData.basicAstrology.charan} • Lord: {kundliData.basicAstrology.nakshatraLord}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nadi & Gana</span>
                <span className="text-base font-bold text-emerald-400">{kundliData.basicAstrology.nadi} / {kundliData.basicAstrology.gana}</span>
                <span className="text-[10px] text-slate-400 block">Yoni: {kundliData.basicAstrology.yoni}</span>
              </div>
            </div>

            {/* North Indian Diamond Kundli Chart Diagram */}
            <div className="p-6 rounded-3xl bg-[#090b1c] border border-amber-500/25 space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-base font-bold text-amber-300 font-serif">
                  Lagna Kundli (North Indian Vedic Chart)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Diamond geometry showing 12 Houses (Bhavas) and planetary positions
                </p>
              </div>

              {/* Geometric SVG Chart */}
              <div className="max-w-md mx-auto aspect-square relative">
                <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                  {/* Outer Square */}
                  <rect x="10" y="10" width="380" height="380" fill="none" stroke="#F59E0B" strokeWidth="2.5" />

                  {/* Diagonal X Lines */}
                  <line x1="10" y1="10" x2="390" y2="390" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.7" />
                  <line x1="390" y1="10" x2="10" y2="390" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.7" />

                  {/* Inner Diamond (Connects midpoints of outer square) */}
                  <polygon points="200,10 390,200 200,390 10,200" fill="none" stroke="#F59E0B" strokeWidth="2" />

                  {/* House 1 (Top Diamond) */}
                  <text x="200" y="45" fill="#FDE68A" fontSize="13" fontWeight="bold" textAnchor="middle">1st House (Lagna)</text>
                  <text x="200" y="70" fill="#38BDF8" fontSize="11" textAnchor="middle">{kundliData.basicAstrology.ascendant}</text>
                  <text x="200" y="90" fill="#FBBF24" fontSize="12" fontWeight="bold" textAnchor="middle">
                    {kundliData.houses[0]?.planets.join(', ') || 'Self / Tanu'}
                  </text>

                  {/* House 2 (Top Left Triangle) */}
                  <text x="120" y="45" fill="#94A3B8" fontSize="10" textAnchor="middle">2: Wealth</text>
                  <text x="120" y="65" fill="#FBBF24" fontSize="11" textAnchor="middle">{kundliData.houses[1]?.planets.join(', ') || '—'}</text>

                  {/* House 12 (Top Right Triangle) */}
                  <text x="280" y="45" fill="#94A3B8" fontSize="10" textAnchor="middle">12: Moksha</text>
                  <text x="280" y="65" fill="#FBBF24" fontSize="11" textAnchor="middle">{kundliData.houses[11]?.planets.join(', ') || '—'}</text>

                  {/* House 4 (Left Diamond) */}
                  <text x="75" y="195" fill="#FDE68A" fontSize="11" fontWeight="bold" textAnchor="middle">4: Mother/Home</text>
                  <text x="75" y="215" fill="#FBBF24" fontSize="11" textAnchor="middle">{kundliData.houses[3]?.planets.join(', ') || '—'}</text>

                  {/* House 7 (Bottom Diamond) */}
                  <text x="200" y="325" fill="#FDE68A" fontSize="11" fontWeight="bold" textAnchor="middle">7: Spouse/Marriage</text>
                  <text x="200" y="345" fill="#FBBF24" fontSize="11" textAnchor="middle">{kundliData.houses[6]?.planets.join(', ') || '—'}</text>

                  {/* House 10 (Right Diamond) */}
                  <text x="325" y="195" fill="#FDE68A" fontSize="11" fontWeight="bold" textAnchor="middle">10: Career/Karma</text>
                  <text x="325" y="215" fill="#FBBF24" fontSize="11" textAnchor="middle">{kundliData.houses[9]?.planets.join(', ') || 'Sun'}</text>

                  {/* House 3 (Far Left Triangle) */}
                  <text x="50" y="120" fill="#94A3B8" fontSize="9" textAnchor="middle">3: Courage</text>

                  {/* House 5 (Bottom Left Triangle) */}
                  <text x="120" y="355" fill="#94A3B8" fontSize="10" textAnchor="middle">5: Intellect</text>
                  <text x="120" y="375" fill="#FBBF24" fontSize="11" textAnchor="middle">{kundliData.houses[4]?.planets.join(', ') || '—'}</text>

                  {/* House 6 (Far Bottom Left Triangle) */}
                  <text x="50" y="280" fill="#94A3B8" fontSize="9" textAnchor="middle">6: Health</text>

                  {/* House 8 (Bottom Right Triangle) */}
                  <text x="280" y="355" fill="#94A3B8" fontSize="10" textAnchor="middle">8: Longevity</text>
                  <text x="280" y="375" fill="#FBBF24" fontSize="11" textAnchor="middle">{kundliData.houses[7]?.planets.join(', ') || '—'}</text>

                  {/* House 9 (Far Bottom Right Triangle) */}
                  <text x="350" y="280" fill="#94A3B8" fontSize="9" textAnchor="middle">9: Dharma</text>

                  {/* House 11 (Far Top Right Triangle) */}
                  <text x="350" y="120" fill="#94A3B8" fontSize="9" textAnchor="middle">11: Gains</text>
                </svg>
              </div>
            </div>

            {/* Planetary Coordinates Table */}
            <div className="space-y-3">
              <h4 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Graha Spashta (Planetary Positions in Signs & Houses)
              </h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Planet</th>
                      <th className="px-4 py-3">Sign</th>
                      <th className="px-4 py-3">House</th>
                      <th className="px-4 py-3">Degree</th>
                      <th className="px-4 py-3">Nakshatra</th>
                      <th className="px-4 py-3">Pada</th>
                      <th className="px-4 py-3">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                    {kundliData.planetaryPositions.map((planet: any) => (
                      <tr key={planet.name} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-amber-300">
                          {planet.name} ({planet.sanskritName}) {planet.isRetrograde ? '®' : ''}
                        </td>
                        <td className="px-4 py-2.5 text-slate-200">{planet.sign}</td>
                        <td className="px-4 py-2.5 text-white font-mono">{planet.house}</td>
                        <td className="px-4 py-2.5 text-slate-300 font-mono">{planet.degree}°</td>
                        <td className="px-4 py-2.5 text-slate-300">{planet.nakshatra}</td>
                        <td className="px-4 py-2.5 text-slate-400 font-mono">{planet.pada}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            planet.state === 'Exalted' ? 'bg-emerald-500/20 text-emerald-300' :
                            planet.state === 'Own' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {planet.state}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dosha & Remedial Advice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Manglik & Planetary Dosha Analysis
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {kundliData.doshaAnalysis.manglik.description}
                </p>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider block">Recommended Remedies:</span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {kundliData.doshaAnalysis.manglik.remedies.map((rem: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Auspicious Gemstone */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/20 to-slate-900/80 border border-purple-500/25 space-y-3">
                <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                  <Gem className="w-4 h-4 text-purple-400" /> Prescribed Vedic Gemstone
                </h4>
                <div className="space-y-1.5">
                  <div className="text-lg font-bold text-amber-300">{kundliData.luckyGemstone.name}</div>
                  <p className="text-xs text-slate-300">
                    Setting Metal: <span className="text-white font-medium">{kundliData.luckyGemstone.metal}</span> • Wear on: <span className="text-white font-medium">{kundliData.luckyGemstone.finger}</span>
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-amber-300/90">
                    Mantra: {kundliData.luckyGemstone.mantra}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
