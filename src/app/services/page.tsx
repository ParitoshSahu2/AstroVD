'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { Search, Filter, ArrowRight, UserCheck, Sparkles, MessageCircle, Heart, Star, BookOpen, Flame, Compass, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SERVICES_TRANSLATIONS } from '../../data/servicesTranslations';

interface ServiceItem {
  id: string;
  categoryTag: string;
  categoryKey: 'astrology' | 'pooja' | 'occult' | 'education';
  title: string;
  pandit: string;
  desc: string;
  price: string;
  image: string;
  badge?: string;
  isSpecial?: boolean;
}

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

  const services: ServiceItem[] = [
    {
      id: 'astrological_consultation',
      categoryTag: 'VEDIC ASTROLOGY',
      categoryKey: 'astrology',
      title: 'ASTROLOGICAL CONSULTATION',
      pandit: 'Dr. Pandit Vishal Dubey (PhD, Jyotishacharya)',
      desc: 'Comprehensive 1-on-1 horoscope examination covering career, finance, family, health, and karmic life direction with precise Vedic remedies.',
      price: '₹2,100',
      image: '/services/consultation.jpg',
      badge: 'Most Popular',
    },
    {
      id: 'marriage_match_making',
      categoryTag: 'KUNDLI MILAN',
      categoryKey: 'astrology',
      title: 'MARRIAGE MATCH MAKING',
      pandit: 'Dr. Pandit Vishal Dubey (Gold Medalist)',
      desc: 'In-depth Ashtakoot 36-Guna matching, Manglik dosha evaluation, Nadi dosha mitigation, and longevity & temperamental harmony assessment.',
      price: '₹2,500',
      image: '/services/marriage.jpg',
    },
    {
      id: 'love_relationship_issues',
      categoryTag: 'RELATIONSHIP GUIDANCE',
      categoryKey: 'astrology',
      title: 'LOVE AND RELATIONSHIP ISSUES',
      pandit: 'Dr. Pandit Vishal Dubey & Madhuri Dubey',
      desc: 'Planetary compatibility analysis of 5th and 7th houses, resolving emotional friction, misunderstanding, and attracting marital peace.',
      price: '₹2,100',
      image: '/services/career.jpg',
    },
    {
      id: 'grah_pravesh_vaastu',
      categoryTag: 'VEDIC YAGYA & POOJA',
      categoryKey: 'pooja',
      title: 'GRAH PRAVESH POOJAN AND VAASTU SHANTI',
      pandit: 'Acharya Sourabh Swami & Karamkand Mandali',
      desc: 'Sacred housewarming Hawan, Navgrah sthapana, and spatial energy sanctification to invite Lakshmi, health, and prosperity into your new home.',
      price: '₹5,100',
      image: '/services/puja.jpg',
    },
    {
      id: 'birth_chart_kundli',
      categoryTag: 'VEDIC ASTROLOGY',
      categoryKey: 'astrology',
      title: 'BIRTH CHART (JANAM KUNDALI)',
      pandit: 'Dr. Pandit Vishal Dubey Ji',
      desc: 'Mathematical Vedic computation of Lagna, Rashi, 16 Shodashvarga sub-charts, Vimshottari Mahadasha cycles, and planetary degree strengths.',
      price: '₹1,500',
      image: '/services/kundli.jpg',
    },
    {
      id: 'mangal_dosh_shanti',
      categoryTag: 'DOSH SHANTI',
      categoryKey: 'pooja',
      title: 'MANGAL DOSH SHANTI',
      pandit: 'Acharya Sourabh Swami Ji',
      desc: 'Authentic Mangal Graha Gayatri Japa, coral offering, and specialized Bhauma Yagya to pacify fiery Mars and remove delays in marriage.',
      price: '₹4,100',
      image: '/services/marriage.jpg',
    },
    {
      id: 'navgrah_shanti_poojan',
      categoryTag: 'VEDIC YAGYA & POOJA',
      categoryKey: 'pooja',
      title: 'NAVGRAH SHANTI POOJAN',
      pandit: 'Vedic Acharyas of Kashi Yagyashala',
      desc: 'Complete propitiation of all 9 planetary deities (Sun to Ketu) with authentic Shukla Yajurveda Samidha wood, pure cow ghee, and beej mantras.',
      price: '₹5,500',
      image: '/services/puja.jpg',
      badge: 'Highly Recommended',
    },
    {
      id: 'free_birth_chart_baby_girl',
      categoryTag: 'SACRED BLESSING',
      categoryKey: 'astrology',
      title: 'FREE BIRTH CHART FOR BABY GIRL BELOW 9YEARS OLD',
      pandit: 'Dr. Pandit Vishal Dubey (Kanya Seva Sankalp)',
      desc: 'In honour of Maa Jagadamba, AstroVD offers 100% free authentic Vedic Janam Kundli analysis and planetary blessings for baby girls under 9 years old.',
      price: '100% FREE',
      image: '/services/kundli.jpg',
      badge: 'Divine Free Initiative',
      isSpecial: true,
    },
    {
      id: 'booking_for_pooja',
      categoryTag: 'VEDIC YAGYA & POOJA',
      categoryKey: 'pooja',
      title: 'BOOKING FOR POOJA',
      pandit: 'Shree Ganesh Vidyapith Pandits',
      desc: 'Online & physical booking for personalized Rudrabhishek, Mahamrityunjaya Japa, Satyanarayan Katha, and specialized Vedic anushthans.',
      price: '₹3,100',
      image: '/services/puja.jpg',
    },
    {
      id: 'vastu_consultation',
      categoryTag: 'OCCULT & ENERGY',
      categoryKey: 'occult',
      title: 'VASTU CONSULTATION',
      pandit: 'Dr. Pandit Vishal Dubey (Vastu Shastri)',
      desc: 'Non-demolition spatial harmonization for residential flats, commercial complexes, and industrial plants balancing the 16 Vastu directional zones.',
      price: '₹3,500',
      image: '/services/consultation.jpg',
    },
    {
      id: 'tarot_card_reading',
      categoryTag: 'INTUITIVE TAROT',
      categoryKey: 'occult',
      title: 'TAROT CARD READING',
      pandit: 'Madhuri Dubey (Tarot & Spiritual Guide)',
      desc: 'Deep intuitive Celtic Cross and 3-card readings unveiling subconscious patterns, decision pathways, and relationship clarity through sacred symbolism.',
      price: '₹1,500',
      image: '/services/consultation.jpg',
    },
    {
      id: 'pendulum_dowsing',
      categoryTag: 'ENERGY HEALING',
      categoryKey: 'occult',
      title: 'PENDULUM DOWSING',
      pandit: 'Madhuri Dubey & AstroVD Team',
      desc: 'Subtle bio-energy radiant testing to identify energetic blockages, verify chakra alignment, and receive direct yes/no answers on life decisions.',
      price: '₹1,100',
      image: '/services/consultation.jpg',
    },
    {
      id: 'annual_chart_varshaphal',
      categoryTag: 'VEDIC ASTROLOGY',
      categoryKey: 'astrology',
      title: 'ANNUAL CHART (VARSHAPHAL)',
      pandit: 'Dr. Pandit Vishal Dubey',
      desc: 'Detailed Tajika-system Solar Return (Varshaphal) breakdown covering month-by-month financial forecasts, career crests, and precautionary periods.',
      price: '₹2,500',
      image: '/services/career.jpg',
    },
    {
      id: 'lucky_gem_stone',
      categoryTag: 'RATNA PARIKSHAN',
      categoryKey: 'occult',
      title: 'LUCKY GEM STONE',
      pandit: 'Acharya Sourabh Swami & Dr. Vishal Dubey',
      desc: 'Pinpointing your Yogakaraka life-stone based on planetary lordship, carat weight calculation, metal setting, and auspicious wearing Muhurta.',
      price: '₹1,200',
      image: '/services/gemstones.jpg',
    },
    {
      id: 'detailed_kundali_hardcopy',
      categoryTag: 'VEDIC ASTROLOGY',
      categoryKey: 'astrology',
      title: 'DETAILED KUNDALI HARDCOPY',
      pandit: 'AstroVD Vedic Jyotish Peeth',
      desc: 'Over 60+ pages deluxe spiral-bound and embossed horoscope dossier including Dasha tables, Gochar transits, and lifecycle remedial solutions shipped to your door.',
      price: '₹1,800',
      image: '/services/kundli.jpg',
    },
    {
      id: 'education_in_astrology',
      categoryTag: 'VEDIC ACADEMY',
      categoryKey: 'education',
      title: 'EDUCATION IN ASTROLOGY',
      pandit: 'Dr. Pandit Vishal Dubey (PhD)',
      desc: 'UNLOCK THE SECRET OF THE COSMOS WITH OUR ASTROLOGY EDUCATION COURSE. EXPLORE CELESTIAL ALIGNMENTS, PLANETARY INFLUENCES AND CHART INTERPRETATION FOR DEEPER SELF AWARENESS AND UNDERSTANDING.',
      price: '₹9,999',
      image: '/services/consultation.jpg',
      badge: 'Certified Course',
      isSpecial: true,
    },
    {
      id: 'hypnotism',
      categoryTag: 'SUBCONSCIOUS MIND',
      categoryKey: 'occult',
      title: 'HYPNOTISM',
      pandit: 'Dr. Pandit Vishal Dubey (Certified Hypnotherapist)',
      desc: 'Clinical hypnosis and subconscious reprogramming sessions to dissolve deep phobias, stress, past trauma, and unlock peak confidence and focus.',
      price: '₹3,500',
      image: '/services/consultation.jpg',
    },
    {
      id: 'grahan_shanti_surya_chandra',
      categoryTag: 'DOSH SHANTI',
      categoryKey: 'pooja',
      title: 'GRAHAN SHANTI SURYA CHANDRA',
      pandit: 'Vedic Kashi Pandits',
      desc: 'Ritualistic eclipse dosha alleviation (Surya-Rahu or Chandra-Ketu conjunction) neutralizing mental anxiety, optical disorders, and career obstacles.',
      price: '₹4,500',
      image: '/services/puja.jpg',
    },
    {
      id: 'kaal_sarp_dhosh_shanti',
      categoryTag: 'DOSH SHANTI',
      categoryKey: 'pooja',
      title: 'KAAL SARP DHOSH SHANTI',
      pandit: 'Acharya Sourabh Swami Ji',
      desc: 'Complete 12-form Kaal Sarp Yog Nivaran with consecration of silver Naag-Nagin pair, Rahu-Ketu Stotram, and Mahamrityunjaya oblations.',
      price: '₹5,100',
      image: '/services/puja.jpg',
      badge: 'Life-Transforming',
    },
    {
      id: 'chandal_dosh_shanti',
      categoryTag: 'DOSH SHANTI',
      categoryKey: 'pooja',
      title: 'CHANDAL DOSH SHANTI',
      pandit: 'Pandit Ji (Karamkand Specialist)',
      desc: 'Remedying Guru-Rahu afflicting conjunction (Guru Chandal Dosha) to restore wisdom, higher learning, financial integrity, and ancestral peace.',
      price: '₹4,100',
      image: '/services/puja.jpg',
    },
    {
      id: 'lucky_number',
      categoryTag: 'NUMEROLOGY & ANK VIDYA',
      categoryKey: 'occult',
      title: 'LUCKY NUMBER',
      pandit: 'Dr. Pandit Vishal Dubey',
      desc: 'Calculations based on Chaldean & Pythagorean Ank Shastra identifying your driver, conductor, and master numbers for bank, vehicle, and phone.',
      price: '₹999',
      image: '/services/consultation.jpg',
    },
    {
      id: 'know_your_lucky_color',
      categoryTag: 'COLOR & COSMIC THERAPY',
      categoryKey: 'occult',
      title: 'KNOW YOUR LUCKY COLOR',
      pandit: 'Dr. Pandit Vishal Dubey',
      desc: 'Harmonize your electromagnetic aura with beneficial spectral hues based on your ruling planet, ascendant, and transit cycles.',
      price: '₹750',
      image: '/services/gemstones.jpg',
    },
    {
      id: 'shat_chandi_path',
      categoryTag: 'MAHA ANUSHTHAN',
      categoryKey: 'pooja',
      title: 'SHAT CHANDI PATH',
      pandit: '11 Initiated Vedic Brahmins',
      desc: 'Grand 100 recitations of Durga Saptashati with full Samputit Vidhi, invoking supreme divine protection against adverse planetary transits and enemies.',
      price: '₹21,000',
      image: '/services/puja.jpg',
      badge: 'Supreme Maha Yagya',
    },
    {
      id: 'angrarak_dosh_shanti',
      categoryTag: 'DOSH SHANTI',
      categoryKey: 'pooja',
      title: 'ANGRARAK DOSH SHANTI',
      pandit: 'Acharya Sourabh Swami Ji',
      desc: 'Specialized ritual neutralizing the volatile conjunction of Mars (Mangal) and Rahu, pacifying anger, accidental hazards, and legal complications.',
      price: '₹4,500',
      image: '/services/puja.jpg',
    },
    {
      id: 'ark_vivah_kumbh_vivah',
      categoryTag: 'RITUAL & REMEDY',
      categoryKey: 'pooja',
      title: 'ARK VIVAH/KUMBH VIVAH',
      pandit: 'Pandit Ji (Karamkand Specialist)',
      desc: 'Traditional Vedic symbolic marriage with Ark plant (for males) or Kumbh pitcher (for females) to nullify extreme Mangal and Vaidhavya doshas.',
      price: '₹6,500',
      image: '/services/marriage.jpg',
    },
    {
      id: 'shreee_yantra_sthapana',
      categoryTag: 'SACRED TANTRA & VAASTU',
      categoryKey: 'pooja',
      title: 'SHREEE YANTRA STHAPANA',
      pandit: 'Dr. Pandit Vishal Dubey & Acharyas',
      desc: 'Consecration and Pran Pratishtha of energized Maha Meru / Shree Yantra with Kanakadhara Stotra for eternal prosperity in your altar or cash vault.',
      price: '₹3,500',
      image: '/services/puja.jpg',
    },
    {
      id: 'personal_appointment',
      categoryTag: 'EXCLUSIVE GUIDANCE',
      categoryKey: 'astrology',
      title: 'PERSONAL APPOINTMENT',
      pandit: 'Dr. Pandit Vishal Dubey (Face to Face)',
      desc: 'Private in-person 45-minute consultation at Varanasi Sanctum, Indore, or New Delhi offices with comprehensive palmistry and horoscope reading.',
      price: '₹5,000',
      image: '/services/consultation.jpg',
      badge: 'VIP In-Person',
    },
    {
      id: 'nav_chandi_path',
      categoryTag: 'SACRED DEVI POOJA',
      categoryKey: 'pooja',
      title: 'NAV CHANDI PATH',
      pandit: 'Kashi Vidvat Parishad Acharyas',
      desc: 'Powerful 9 recitations of Durga Saptashati culminating in a sanctified Havan for rapid hurdle clearance, business recovery, and household harmony.',
      price: '₹7,500',
      image: '/services/puja.jpg',
    },
    {
      id: 'aura_scanning',
      categoryTag: 'BIO-ENERGY & CHAKRA',
      categoryKey: 'occult',
      title: 'AURA SCANNING',
      pandit: 'Dr. Pandit Vishal Dubey & Energy Masters',
      desc: 'Advanced cosmic electro-photonic aura and 7-chakra scanning discovering energy depletion zones, negative entity interference, and vitality leaks.',
      price: '₹2,500',
      image: '/services/consultation.jpg',
    },
  ];

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
