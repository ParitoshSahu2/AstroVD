'use client';

import React, { useState, useEffect } from 'react';
import { fetchAstrologers, bookConsultation } from '../lib/api';
import { PhoneCall, MessageSquare, Video, Star, Award, CheckCircle2, Clock, Globe, Shield, Sparkles, X } from 'lucide-react';

interface AstrologersSectionProps {
  user: any;
  openAuthModal: () => void;
}

export const AstrologersSection: React.FC<AstrologersSectionProps> = ({ user, openAuthModal }) => {
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [selectedAstrologer, setSelectedAstrologer] = useState<any>(null);
  const [consultType, setConsultType] = useState<'chat' | 'call' | 'video'>('call');
  const [duration, setDuration] = useState(15);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAstrologers(selectedCategory).then((data) => {
      setAstrologers(data);
      setLoading(false);
    });
  }, [selectedCategory]);

  const handleStartConsult = (astrologer: any, type: 'chat' | 'call' | 'video') => {
    setSelectedAstrologer(astrologer);
    setConsultType(type);
    setBookingSuccess(null);
  };

  const handleConfirmBooking = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setBookingLoading(true);
    const res = await bookConsultation({
      astrologerId: selectedAstrologer.id,
      userName: user.name || 'Seeker',
      userPhone: '+91 9876543210',
      consultationType: consultType,
      durationMinutes: duration,
    });
    setBookingSuccess(res);
    setBookingLoading(false);
  };

  const categories = [
    { id: 'all', label: 'All Astrologers' },
    { id: 'vedic', label: 'Vedic Kundli' },
    { id: 'tarot', label: 'Tarot Readers' },
    { id: 'numerology', label: 'Numerology' },
    { id: 'kp', label: 'KP Astrology' },
  ];

  return (
    <section className="space-y-10">
      {/* Title */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
          <span>Live Spiritual Consultations</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold gold-gradient-text font-serif">
          Talk to Verified Astrologers
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Connect immediately via confidential audio call, encrypted chat, or 1-on-1 video with top Vedic Acharyas, celebrity Tarot masters, and KP horary specialists.
        </p>
      </div>

      {/* Filter Categories */}
      <div className="flex justify-center flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Astrologers Grid */}
      {loading ? (
        <div className="p-16 text-center cosmic-card rounded-3xl animate-pulse space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
          <p className="text-amber-300 font-serif">Connecting to Verified Astrologer Network...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {astrologers.map((ast) => (
            <div
              key={ast.id}
              className="cosmic-card rounded-3xl p-6 flex flex-col justify-between space-y-5 group transition-all duration-300"
            >
              {/* Profile Top */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src={ast.avatar}
                    alt={ast.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg"
                  />
                  <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-slate-950 flex items-center gap-1 shadow ${
                    ast.status === 'Online' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                    {ast.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-base font-serif group-hover:text-amber-300 transition-colors">
                      {ast.name}
                    </h3>
                  </div>
                  <p className="text-xs text-amber-300/90 font-medium">{ast.title}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" /> {ast.rating}
                    </span>
                    <span>•</span>
                    <span>{ast.experienceYears}+ yrs exp</span>
                    <span>•</span>
                    <span>{ast.totalOrders?.toLocaleString()} orders</span>
                  </div>
                </div>
              </div>

              {/* Specializations & Bio */}
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap gap-1.5">
                  {ast.specializations.map((spec: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 border border-slate-800 text-[11px]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <p className="text-slate-400 line-clamp-2 leading-relaxed">
                  {ast.bio}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>{ast.languages.join(', ')}</span>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="pt-4 border-t border-slate-800/90 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-extrabold text-amber-400 font-mono">
                      ₹{ast.ratePerMin}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">/min</span>
                    <span className="text-xs text-slate-500 line-through">
                      ₹{ast.originalRate}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold block">First 5 mins 50% OFF</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartConsult(ast, 'chat')}
                    className="p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 transition-all cursor-pointer"
                    title="Start Chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStartConsult(ast, 'call')}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 fill-current" />
                    <span>Call Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consultation Booking Modal */}
      {selectedAstrologer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0d21] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedAstrologer(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white font-serif">
                  Consultation Confirmed!
                </h3>
                <p className="text-xs text-slate-300">
                  {bookingSuccess.message}
                </p>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300">
                  Booking ID: {bookingSuccess.bookingId}
                </div>
                <button
                  onClick={() => setSelectedAstrologer(null)}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer"
                >
                  Enter Cosmic Session
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                  <img
                    src={selectedAstrologer.avatar}
                    alt={selectedAstrologer.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-amber-400"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white font-serif">
                      {selectedAstrologer.name}
                    </h3>
                    <p className="text-xs text-amber-300">{selectedAstrologer.title}</p>
                    <p className="text-xs text-slate-400">Rate: ₹{selectedAstrologer.ratePerMin} / minute</p>
                  </div>
                </div>

                {/* Consultation Medium */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Consultation Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'call', label: 'Audio Call', icon: PhoneCall },
                      { id: 'chat', label: 'Live Chat', icon: MessageSquare },
                      { id: 'video', label: 'Video Call', icon: Video },
                    ].map((med) => {
                      const Icon = med.icon;
                      return (
                        <button
                          key={med.id}
                          type="button"
                          onClick={() => setConsultType(med.id as any)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-medium transition-all ${
                            consultType === med.id
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{med.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Select Duration</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 15, 30].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDuration(mins)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                          duration === mins
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mins} Minutes
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-300">Total Consultation Fee:</span>
                  <span className="text-base font-extrabold text-amber-400 font-mono">
                    ₹{selectedAstrologer.ratePerMin * duration}
                  </span>
                </div>

                {/* Submit Action */}
                <button
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {bookingLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full"></div>
                      <span>Connecting Sacred Line...</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-4 h-4 fill-current text-slate-950" />
                      <span>Confirm & Connect Instantly</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
