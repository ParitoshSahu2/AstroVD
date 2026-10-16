'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { Calendar, Clock, Video, PhoneCall, CheckCircle2, Shield, Star, Sparkles } from 'lucide-react';

export const AppointmentPage: React.FC = () => {
  const [selectedGuide, setSelectedGuide] = useState('vishal');
  const [consultType, setConsultType] = useState<'video' | 'call' | 'in-person'>('video');
  const [date, setDate] = useState('2026-10-20');
  const [timeSlot, setTimeSlot] = useState('11:00 AM');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDetails, setBirthDetails] = useState('');
  const [success, setSuccess] = useState(false);

  const guides = [
    {
      id: 'vishal',
      name: 'Dr. Pandit Vishal Dubey',
      title: 'PhD in Vedic Astrology & Certified Hypnotherapist',
      fee: '₹2,100 / 30 mins',
      image: '/dr_vishal_dubey.jpg',
      badge: 'Gold Medalist',
    },
    {
      id: 'madhuri',
      name: 'Madhuri Dubey',
      title: 'Tarot & Intuitive Spiritual Guide',
      fee: '₹1,500 / 30 mins',
      image: '/pandits/madhuri_dubey.jpg',
      badge: 'Intuitive Master',
    },
    {
      id: 'sourabh',
      name: 'Acharya Sourabh Swami Ji',
      title: 'Vedic Puja & Havan Specialist',
      fee: '₹1,800 / session',
      image: '/pandits/sourabh_swami.jpg',
      badge: 'Vedic Acharya',
    },
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-hidden selection:bg-amber-400">
      <Navbar />

      {/* Header exactly matching user screenshot */}
      <PageHeader
        breadcrumb="Online Consultation"
        title="Book Your Vedic Consultation"
        subtitle="Direct 1-on-1 confidential astrological sessions via Video Call, Voice, or Varanasi Ashram Darshan."
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 space-y-12">

        {success ? (
          <div className="max-w-xl mx-auto rounded-3xl bg-white p-8 sm:p-10 border-2 border-amber-300 shadow-2xl text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-stone-900">
              Appointment Reserved Successfully!
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              We have received your appointment request for <strong>{date}</strong> at <strong>{timeSlot}</strong>. Our celestial coordinator will send the secure consultation link to <strong>{phone}</strong>.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 rounded-full bg-[#5B0D15] text-white text-xs font-bold shadow-md hover:bg-[#480a11]"
              >
                Book Another Session
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Step 1: Select Guide (Left) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#2A1810]">
                1. Select Spiritual Guide
              </h3>

              <div className="space-y-3">
                {guides.map((g) => {
                  const isSelected = selectedGuide === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGuide(g.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                        isSelected
                          ? 'bg-white border-[#800000] shadow-md ring-2 ring-[#800000]/20'
                          : 'bg-white/70 border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <img
                        src={g.image}
                        alt={g.name}
                        className="w-14 h-14 rounded-full object-cover border border-amber-300 shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-bold text-sm text-stone-900">
                            {g.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                            {g.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">{g.title}</p>
                        <p className="text-xs font-bold text-[#800000] mt-1">{g.fee}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Consultation Format */}
              <div className="pt-2 space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#2A1810]">
                  Consultation Mode
                </h4>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'video', label: 'Video Call', icon: Video },
                    { id: 'call', label: 'Audio Call', icon: PhoneCall },
                    { id: 'in-person', label: 'In Person', icon: Sparkles },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSel = consultType === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setConsultType(mode.id as any)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          isSel
                            ? 'bg-rose-50 border-[#800000] text-[#800000] font-bold shadow-sm'
                            : 'bg-white border-stone-200 text-stone-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-amber-700" />
                        <span className="text-[11px]">{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 2: Date, Time & Details (Right) */}
            <div className="lg:col-span-7 bg-white/90 p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-xl space-y-6">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#2A1810]">
                2. Your Session Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Select Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'].map((t) => (
                      <option key={t} value={t}>
                        {t} IST
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    WhatsApp / Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Birth Details &amp; Primary Question (Date, Time, Place of Birth)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. 15th Aug 1990, 04:30 AM, Varanasi. Question regarding career transition."
                  value={birthDetails}
                  onChange={(e) => setBirthDetails(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#B8873E] via-[#A67530] to-[#8C5D1F] hover:from-[#c59348] hover:to-[#9a6925] text-white font-bold text-sm shadow-xl transition-all cursor-pointer"
              >
                Confirm Appointment &amp; Reserve Slot →
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-1">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  100% Confidential
                </span>
                <span>•</span>
                <span>Free Rescheduling up to 4h Prior</span>
              </div>
            </div>

          </form>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AppointmentPage;
