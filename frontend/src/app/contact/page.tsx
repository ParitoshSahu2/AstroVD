'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Phone, Mail, Send, CheckCircle2, Clock, Globe, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ContactPage() {
  const { t, language } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Astrological Consultation');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between w-full bg-[#FCF8ED] m-0 p-0 overflow-x-clip selection:bg-amber-400">
      <Navbar />

      {/* HERO BANNER SECTION (Panoramic full-bleed backdrop matching reference design) */}
      <section className="relative w-full bg-[#36170A] overflow-hidden pt-24 sm:pt-28 md:pt-30 pb-9 sm:pb-11 px-4 sm:px-6 lg:px-12 min-h-[220px] sm:min-h-[250px] flex items-center">
        {/* Background ambient gradient matching reference tone */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#36170A] via-[#36170A] to-[#2B0E06]" />

        {/* Full-bleed Ultra-HD panoramic backdrop: Sacred Ganga Aarti, Mandir, Diya & Sanctum */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
          <Image
            src="/gallery/gallery_hero_panoramic_hd.png"
            alt="Contact Us - AstroVD Vedic Sanctum"
            fill
            priority
            quality={100}
            className="object-cover object-[right_center] md:object-[right_55%]"
          />
          {/* Confined left gradient vignette: protects text readability on left while leaving items 100% luminous with zero haze */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-[65%] md:w-[54%] lg:w-[48%] bg-gradient-to-r from-[#36170A] via-[#36170A]/92 to-transparent" />
        </div>

        {/* Content container - Left Text Information (Clear, readable, with zero obstruction) */}
        <div className="relative max-w-7xl mx-auto w-full z-10">
          <div className="max-w-xl text-left space-y-2">
            <div className="tracking-[0.2em] text-[10px] sm:text-[11px] font-bold text-[#D8B28A] uppercase drop-shadow-sm">
              {t('SANCTUM HELPLINE • GLOBAL DESKS • INSTANT CONNECT', 'परामर्श केंद्र • वैश्विक संपर्क डेस्क • सहज संवाद')}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-[34px] lg:text-[38px] font-bold text-[#FFFDFB] tracking-wide leading-tight drop-shadow-md">
              {t('Contact Us • Connect with AstroVD Sanctum', 'संपर्क करें • AstroVD मुख्य परामर्श केंद्र से जुड़ें')}
            </h1>
            <p className="text-[#D7C4BD] text-xs sm:text-[13px] leading-relaxed max-w-lg font-normal drop-shadow-sm">
              {t(
                "Reach out to Dr. Pandit Vishal Dubey's spiritual desks in Varanasi, Indore, New Delhi, and Dubai for astrology consultations, yagyas, and appointments.",
                'काशी, इंदौर, नई दिल्ली एवं दुबई स्थित डॉ. पंडित विशाल दुबे जी के आध्यात्मिक केंद्रों से परामर्श, यज्ञ एवं अपॉइंटमेंट हेतु संपर्क करें।'
              )}
            </p>
          </div>
        </div>

        {/* Subtle curved bottom wave divider matching reference design */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
          <svg
            className="relative block w-full h-4 sm:h-5 md:h-6"
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
          >
            <path
              d="M0,14 C350,26 700,32 950,22 C1080,16 1160,8 1200,6"
              fill="none"
              stroke="#D8A868"
              strokeWidth="1.2"
              strokeOpacity="0.45"
            />
            <path
              d="M0,14 C350,26 700,32 950,22 C1080,16 1160,8 1200,6 L1200,40 L0,40 Z"
              fill="#FCF8ED"
            />
          </svg>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-14 space-y-12">

        {/* Contact Information & Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Phone Card */}
            <div className="p-6 rounded-3xl bg-white border border-amber-200/90 shadow-md space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#5B0D15] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#2A1810]">
                {t('Direct Consultation Lines', 'प्रत्यक्ष परामर्श हेल्पलाइन')}
              </h3>
              <div className="space-y-1 text-xs text-stone-700">
                <p>
                  <strong>{t('Primary Helpline:', 'मुख्य हेल्पलाइन:')}</strong>{' '}
                  <a href="tel:+919826012345" className="text-[#5B0D15] font-semibold hover:underline">
                    +91 98260 12345
                  </a>
                </p>
              </div>
              <span className="text-[11px] text-amber-800 font-semibold block pt-1 border-t border-stone-100">
                🕒 {t('Mon - Sun: 8:00 AM - 9:00 PM IST', 'सोमवार - रविवार: प्रातः 8:00 से रात्रि 9:00 बजे')}
              </span>
            </div>

            {/* Email Card */}
            <div className="p-6 rounded-3xl bg-white border border-amber-200/90 shadow-md space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#5B0D15] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#2A1810]">
                {t('Official Email Desks', 'आधिकारिक ईमेल संपर्क')}
              </h3>
              <div className="space-y-1 text-xs text-stone-700">
                <p>
                  <strong>{t('General Inquiries:', 'सामान्य जानकारी:')}</strong>{' '}
                  <a href="mailto:contact@astrovd.com" className="text-[#5B0D15] font-semibold hover:underline">
                    contact@astrovd.com
                  </a>
                </p>
                <p>
                  <strong>{t('Consultations & Pooja:', 'परामर्श एवं पूजा:')}</strong>{' '}
                  <a href="mailto:consultations@astrovd.com" className="text-[#5B0D15] font-semibold hover:underline">
                    consultations@astrovd.com
                  </a>
                </p>
                <p>
                  <strong>{t('Astrology Academy:', 'ज्योतिष शिक्षण:')}</strong>{' '}
                  <a href="mailto:academy@astrovd.com" className="text-[#5B0D15] font-semibold hover:underline">
                    academy@astrovd.com
                  </a>
                </p>
              </div>
            </div>

            </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/90 shadow-xl space-y-5">
            <div>
              <span className="text-amber-700 text-xs font-bold uppercase tracking-wider">
                {t('Direct Message', 'प्रत्यक्ष संदेश')}
              </span>
              <h3 className="font-serif font-bold text-2xl text-[#2A1810]">
                {t('Send Us an Inquiry', 'अपना परामर्श संदेश भेजें')}
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                {t(
                  'Fill out the form below with your birth details or questions. Our Vedic Acharyas will respond within 2 to 4 hours.',
                  'नीचे दिए गए फॉर्म में अपना जन्म विवरण व प्रश्न दर्ज करें। हमारे वैदिक आचार्य 2 से 4 घंटों में आपसे संपर्क करेंगे।'
                )}
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-lg text-emerald-950">
                  {t('Inquiry Received with Reverence!', 'संदेश श्रद्धापूर्वक प्राप्त हुआ!')}
                </h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  {language === 'hi' ? (
                    <>धन्यवाद, {name || 'जातक'}। डॉ. पंडित विशाल दुबे जी की टीम को आपका विवरण प्राप्त हो गया है और शीघ्र ही {phone || email} पर संपर्क किया जाएगा।</>
                  ) : (
                    <>Thank you, {name || 'Devotee'}. Dr. Pandit Vishal Dubey Ji’s team has received your details and will get in touch shortly on {phone || email}.</>
                  )}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 rounded-full bg-[#5B0D15] text-white text-xs font-bold shadow-md hover:bg-[#72111c] transition-all"
                >
                  {t('Send Another Inquiry', 'अन्य संदेश भेजें')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('Your Full Name *', 'आपका पूरा नाम *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('e.g. Paritosh Sharma', 'उदा. पारितोष शर्मा')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('Phone Number (WhatsApp) *', 'मोबाइल / व्हाट्सएप नंबर *')}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98260 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('Email Address *', 'ईमेल पता *')}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="paritosh@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('Select Service / Purpose *', 'सेवा / परामर्श का उद्देश्य चुनें *')}
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300 bg-white cursor-pointer"
                    >
                      <option value="Astrological Consultation">{t('Astrological Consultation', 'वैदिक ज्योतिष परामर्श')}</option>
                      <option value="Marriage Match Making">{t('Marriage Match Making', 'कुंडली मिलान व विवाह')}</option>
                      <option value="Free Baby Girl Kundli">{t('Free Birth Chart For Baby Girl Below 9 Years', '9 वर्ष से कम उम्र की बालिकाओं हेतु निःशुल्क कुंडली')}</option>
                      <option value="Mangal Dosh Shanti">{t('Mangal Dosh Shanti', 'मंगल दोष शांति अनुष्ठान')}</option>
                      <option value="Navgrah Shanti Poojan">{t('Navgrah Shanti Poojan', 'नवग्रह शांति महापूजन')}</option>
                      <option value="Kaal Sarp Dosh Shanti">{t('Kaal Sarp Dosh Shanti', 'कालसर्प दोष शांति')}</option>
                      <option value="Tarot Card Reading">{t('Tarot Card Reading (Madhuri Ji)', 'टैरो कार्ड रीडिंग (माधुरी जी)')}</option>
                      <option value="Vastu Consultation">{t('Vastu Consultation', 'वास्तु परामर्श')}</option>
                      <option value="Education in Astrology">{t('Education in Astrology Course', 'वैदिक ज्योतिष शिक्षण कोर्स')}</option>
                      <option value="Gemstones & Talismans">{t('Gemstones & Products', 'सिद्ध रत्न व आध्यात्मिक उत्पाद')}</option>
                      <option value="Other Vedic Inquiry">{t('Other Vedic Inquiry', 'अन्य वैदिक पूछताछ')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t('Your Birth Details / Message (Date, Time, Place of Birth)', 'जन्म विवरण / प्रश्न (जन्म तिथि, समय, स्थान एवं मुख्य जिज्ञासा)')}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={t(
                      'Provide your Date of Birth, Time of Birth, Place of Birth, and your primary questions or requirements...',
                      'अपनी जन्म तिथि, जन्म समय, जन्म स्थान और अपने मुख्य प्रश्न दर्ज करें...'
                    )}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#5B0D15] hover:bg-[#72111c] text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-950/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>{t('Submit Consultation Inquiry', 'परामर्श संदेश प्रेषित करें')}</span>
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {t('100% Confidential & Encrypted', '100% पूर्णतः गोपनीय एवं सुरक्षित')}
              </span>
              <span>{t('Response within 2 - 4 hours', '2 से 4 घंटों में संपर्क')}</span>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
