'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { Calendar, Clock, Video, PhoneCall, CheckCircle2, Shield, Star, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AppointmentPage: React.FC = () => {
  const { t, language } = useLanguage();
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
      name: t('Dr. Pandit Vishal Dubey', 'डॉ. पंडित विशाल दुबे'),
      title: t('PhD in Vedic Astrology & Certified Hypnotherapist', 'वैदिक ज्योतिष में पीएचडी एवं प्रमाणित हिप्नोथेरेपिस्ट'),
      fee: t('₹2,100 / 30 mins', '₹2,100 / 30 मिनट'),
      image: '/dr_vishal_dubey.jpg',
      badge: t('Gold Medalist', 'स्वर्ण पदक विजेता'),
    },
    {
      id: 'madhuri',
      name: t('Madhuri Dubey', 'माधुरी दुबे'),
      title: t('Tarot & Intuitive Spiritual Guide', 'टैरो कार्ड रीडर एवं आध्यात्मिक मार्गदर्शक'),
      fee: t('₹1,500 / 30 mins', '₹1,500 / 30 मिनट'),
      image: '/pandits/madhuri_dubey.jpg',
      badge: t('Intuitive Master', 'इंट्यूटिव मास्टर'),
    },
    {
      id: 'sourabh',
      name: t('Acharya Sourabh Swami Ji', 'आचार्य सौरभ स्वामी जी'),
      title: t('Vedic Puja & Havan Specialist', 'वैदिक पूजा एवं महाहवन विशेषज्ञ'),
      fee: t('₹1,800 / session', '₹1,800 / सत्र'),
      image: '/pandits/sourabh_swami.jpg',
      badge: t('Vedic Acharya', 'वैदिक आचार्य'),
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
        breadcrumb={t('Online Consultation', 'ऑनलाइन वैदिक परामर्श')}
        title={t('Book Your Vedic Consultation', 'अपना वैदिक परामर्श सत्र बुक करें')}
        subtitle={t(
          'Direct 1-on-1 confidential astrological sessions via Video Call, Voice, or Varanasi Ashram Darshan.',
          'वीडियो कॉल, फोन अथवा काशी आश्रम में आमने-सामने गोपनीय व प्रामाणिक ज्योतिषीय परामर्श सत्र।'
        )}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 space-y-12">

        {success ? (
          <div className="max-w-xl mx-auto rounded-3xl bg-white p-8 sm:p-10 border-2 border-amber-300 shadow-2xl text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-stone-900">
              {t('Appointment Reserved Successfully!', 'परामर्श सत्र सफलतापूर्वक आरक्षित हुआ!')}
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              {language === 'hi' ? (
                <>हमें <strong>{date}</strong> को <strong>{timeSlot}</strong> हेतु आपका अनुरोध प्राप्त हो गया है। हमारे समन्वयक <strong>{phone}</strong> पर सुरक्षित परामर्श लिंक प्रेषित करेंगे।</>
              ) : (
                <>We have received your appointment request for <strong>{date}</strong> at <strong>{timeSlot}</strong>. Our celestial coordinator will send the secure consultation link to <strong>{phone}</strong>.</>
              )}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 rounded-full bg-[#5B0D15] text-white text-xs font-bold shadow-md hover:bg-[#480a11]"
              >
                {t('Book Another Session', 'अन्य सत्र बुक करें')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Step 1: Select Guide (Left) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#2A1810]">
                {t('1. Select Spiritual Guide', '1. आध्यात्मिक मार्गदर्शक का चयन करें')}
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
                  {t('Consultation Mode', 'परामर्श माध्यम')}
                </h4>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'video', label: t('Video Call', 'वीडियो कॉल'), icon: Video },
                    { id: 'call', label: t('Audio Call', 'ऑडियो कॉल'), icon: PhoneCall },
                    { id: 'in-person', label: t('In Person', 'आश्रम दर्शन'), icon: Sparkles },
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
                {t('2. Your Session Details', '2. परामर्श सत्र का विवरण')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('Select Preferred Date', 'पसंदीदा दिनांक चुनें')}
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
                    {t('Preferred Time Slot', 'पसंदीदा समय (स्लॉट)')}
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'].map((time) => (
                      <option key={time} value={time}>
                        {time} IST
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('Full Name', 'पूरा नाम')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('Enter your name', 'अपना नाम दर्ज करें')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('WhatsApp / Phone Number', 'व्हाट्सएप / मोबाइल नंबर')}
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
                  {t('Birth Details & Primary Question (Date, Time, Place of Birth)', 'जन्म विवरण एवं मुख्य प्रश्न (जन्म तिथि, समय, जन्म स्थान)')}
                </label>
                <textarea
                  rows={3}
                  placeholder={t(
                    'e.g. 15th Aug 1990, 04:30 AM, Varanasi. Question regarding career transition.',
                    'उदा. 15 अगस्त 1990, प्रातः 04:30, वाराणसी। करियर व व्यापार संबंधी प्रश्न।'
                  )}
                  value={birthDetails}
                  onChange={(e) => setBirthDetails(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#B8873E] via-[#A67530] to-[#8C5D1F] hover:from-[#c59348] hover:to-[#9a6925] text-white font-bold text-sm shadow-xl transition-all cursor-pointer"
              >
                {t('Confirm Appointment & Reserve Slot →', 'परामर्श सत्र की पुष्टि करें एवं स्लॉट आरक्षित करें →')}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-1">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  {t('100% Confidential', '100% पूर्णतः गोपनीय')}
                </span>
                <span>•</span>
                <span>{t('Free Rescheduling up to 4h Prior', 'सत्र से 4 घंटे पूर्व तक निःशुल्क समय परिवर्तन')}</span>
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
