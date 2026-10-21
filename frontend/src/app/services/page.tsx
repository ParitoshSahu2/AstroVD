'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { Search, Filter, ArrowRight, UserCheck, Sparkles, MessageCircle, Heart, Star, BookOpen, Flame, Compass, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SERVICES_TRANSLATIONS } from '../../data/servicesTranslations';
import { SERVICES_CATALOGUE, ServiceItem } from '../../data/servicesData';

export default function ServicesPage() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const openWhatsApp = (title: string) => {
    window.open(
      `https://wa.me/919826012345?text=Hello%20AstroVD,%20I%20would%20like%20to%20inquire%20about%20booking:%20${encodeURIComponent(title)}`,
      '_blank'
    );
  };

  const services = SERVICES_CATALOGUE;

  const filtered = services.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.categoryKey === selectedCategory;
    const matchesQuery =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.categoryTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.pandit.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-hidden selection:bg-amber-400">
      <Navbar />

      <PageHeader
        breadcrumb={t('Services & Rituals', 'सेवाएं एवं अनुष्ठान')}
        title={t('Vedic Astrology & Pooja Services', 'वैदिक ज्योतिष एवं पूजा सेवाएं')}
        subtitle={t(
          '29 Consecrated Astrological Consultations, Sacred Yagya Rituals, Energy Sciences, and Vedic Education Courses by Dr. Pandit Vishal Dubey (AstroVD).',
          'पूज्य डॉ. पंडित विशाल दुबे (AstroVD) द्वारा 29 सिद्ध ज्योतिष परामर्श, पावन यज्ञ अनुष्ठान, ऊर्जा विज्ञान एवं वैदिक शिक्षण पाठ्यक्रम।'
        )}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-14 space-y-10">
        
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-amber-200/80 shadow-md">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('Search 29 services (e.g. Mangal Dosh, Kundli, Tarot, Chandi Path)...', '29 सेवाएं खोजें (उदा. मंगल दोष, कुंडली, टैरो, चंडी पाठ)...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-stone-200 text-xs sm:text-sm text-stone-800 placeholder-stone-400 shadow-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-stone-700 text-xs font-semibold">
              <Filter className="w-4 h-4 text-amber-700" />
              <span>{t('Category:', 'श्रेणी:')}</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 rounded-full bg-white border border-amber-300 text-xs font-semibold text-stone-800 shadow-sm focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">{t('All Services (29)', 'सभी सेवाएं (29)')}</option>
              <option value="astrology">{t('Vedic Astrology & Kundli', 'वैदिक ज्योतिष व कुंडली')}</option>
              <option value="pooja">{t('Pooja & Dosh Shanti', 'पूजा व दोष शांति')}</option>
              <option value="occult">{t('Occult & Energy Sciences', 'ऊर्जा एवं गुप्त विद्याएं')}</option>
              <option value="education">{t('Vedic Education & Courses', 'वैदिक शिक्षण व पाठ्यक्रम')}</option>
            </select>
          </div>
        </div>

        {/* Total Count and Category Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 px-2">
          <div className="font-semibold text-stone-800">
            {language === 'hi' ? (
              <>उपलब्ध <span className="text-[#5B0D15] font-bold">{filtered.length}</span> प्रामाणिक वैदिक सेवाएं</>
            ) : (
              <>Showing <span className="text-[#5B0D15] font-bold">{filtered.length}</span> authentic services</>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: t('All (29)', 'सभी (29)') },
              { id: 'astrology', label: t('Astrology (7)', 'ज्योतिष (7)') },
              { id: 'pooja', label: t('Pooja & Shanti (12)', 'पूजा व शांति (12)') },
              { id: 'occult', label: t('Occult & Aura (9)', 'ऊर्जा व औरा (9)') },
              { id: 'education', label: t('Education Course (1)', 'शिक्षण कोर्स (1)') },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#5B0D15] text-white shadow-sm'
                    : 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filtered.map((item) => {
            const tr = language === 'hi' ? SERVICES_TRANSLATIONS[item.id] : null;
            const displayTitle = tr ? tr.titleHi : item.title;
            const displayCatTag = tr ? tr.categoryTagHi : item.categoryTag;
            const displayPandit = tr ? tr.panditHi : item.pandit;
            const displayDesc = tr ? tr.descHi : item.desc;
            const displayBadge = tr && tr.badgeHi ? tr.badgeHi : item.badge;

            return (
              <div
                key={item.id}
                className={`rounded-3xl overflow-hidden bg-white border transition-all duration-300 flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-1 ${
                  item.isSpecial
                    ? 'border-2 border-amber-400 shadow-xl ring-2 ring-amber-300/30'
                    : 'border-stone-200 shadow-md hover:border-amber-300'
                }`}
              >
                <div>
                  {/* Image */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
                    <img
                      src={item.image}
                      alt={displayTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Category Pill */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-amber-300/60 text-amber-300 font-bold text-[10px] uppercase tracking-wider">
                      ✦ {displayCatTag}
                    </div>

                    {/* Optional Special Badge */}
                    {displayBadge && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                        {displayBadge}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6 space-y-2.5">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#2A1810] group-hover:text-[#5B0D15] transition-colors leading-snug">
                      {displayTitle}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
                      <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{displayPandit}</span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                      {displayDesc}
                    </p>
                  </div>
                </div>

                {/* Bottom Card Bar: Dakshina / Offering & Book Now */}
                <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-stone-100 flex items-center justify-between bg-stone-50/50">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
                      {t('Dakshina / Offering', 'दक्षिणा / न्योछावर')}
                    </span>
                    <span className={`font-serif font-bold text-base sm:text-lg ${
                      item.price.includes('FREE') ? 'text-emerald-700 font-extrabold' : 'text-[#5B0D15]'
                    }`}>
                      {language === 'hi' && item.price.includes('FREE') ? '100% निःशुल्क' : item.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openWhatsApp(displayTitle)}
                      className="px-3 py-2 rounded-full border border-emerald-400 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Inquire on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>

                    <Link
                      href={`/appointment?service=${item.id}`}
                      className="px-4 py-2 rounded-full bg-[#5B0D15] hover:bg-[#72111c] text-white text-xs font-bold shadow-md shadow-rose-950/20 hover:scale-105 transition-all flex items-center gap-1"
                    >
                      <span>{t('Book Now', 'परामर्श लें')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
}
