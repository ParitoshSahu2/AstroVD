'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUp, MessageCircle, Award, CheckCircle, ShieldCheck, Sparkles, BookOpen, GraduationCap, Star, Users } from 'lucide-react';
import { SectionDivider } from './SectionDivider';

interface AboutSectionProps {
  isHomePage?: boolean;
}

// Reusable Count-Up Animation triggered when scrolled into view
const AnimatedCounter: React.FC<{ target: number; suffix?: string; duration?: number }> = ({
  target,
  suffix = '',
  duration = 1800,
}) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = performance.now();

          const updateCounter = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Smooth ease-out cubic curve
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = Math.floor(easeOutProgress * target);
            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(updateCounter);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return (
    <span ref={elementRef}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

export const AboutSection: React.FC<AboutSectionProps> = ({ isHomePage = false }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = (name = 'Dr. Vishal Dubey') => {
    window.open(`https://wa.me/919826012345?text=Hello%20${encodeURIComponent(name)},%20I%20would%20like%20to%20book%20a%20consultation.`, '_blank');
  };

  const certifications = [
    {
      title: 'PhD in Jyotish & Rog',
      institution: 'Maharishi College of Vedic Astrology, Rajasthan',
      year: 'Specialization in Medical & Predictive Vedic Astrology',
      icon: GraduationCap,
      badge: 'Doctorate Degree',
    },
    {
      title: 'Jyotishacharya Title',
      institution: 'Vedic Astrological Council of India',
      year: 'Honored in 2018 for Exceptional Cosmic Mastery',
      icon: Award,
      badge: 'Highest Honor',
    },
    {
      title: 'Best Jyotish Shastri Award',
      institution: 'National Vedic Research Forum',
      year: 'Consecrated Honor in 2015',
      icon: Star,
      badge: 'National Award',
    },
    {
      title: 'Affiliated Astrological Researcher',
      institution: 'Shree Ganesh Vidyapith Research Center',
      year: 'Leading Predictive Research Since 2009',
      icon: BookOpen,
      badge: 'Senior Fellow',
    },
    {
      title: 'Certified Hypnotherapist & Tantra Scholar',
      institution: 'Institute of Mind Sciences & Ancient Tantras',
      year: 'Deep Palmistry, Vastu & Subconscious Alignment',
      icon: ShieldCheck,
      badge: 'Certified',
    },
    {
      title: 'B.Pharma & MBA Dual Foundations',
      institution: 'Premier Indian Universities',
      year: 'Bridging Medical Science, Analytics & Astrology',
      icon: Sparkles,
      badge: 'Academic Foundation',
    },
  ];

  const panditsList = [
    {
      name: 'ACHARYA SOURABH SWAMI JI',
      role: 'Senior Vedic Puja & Karmakand Acharya',
      specialty: 'Specialist in Shukla Yajurveda Anushthan, Shat Chandi Path, and Navgrah Shanti',
      image: '/pandits/sourabh_swami.jpg',
    },
    {
      name: 'PANDIT JI (SENIOR ASTROLOGER)',
      role: 'Senior Kundali & Horary Expert',
      specialty: 'Janam Kundli analysis, Prashna Kundli, and planetary dosha remedies',
      image: '/pandits/senior_astrologer.jpg',
    },
    {
      name: 'PANDIT JI (YAGYASHALA)',
      role: 'Yagna & Agnihotra Specialist',
      specialty: 'Kashi Vishwanath Parampara, Mahamrityunjaya Havan & Graha Shanti',
      image: '/pandits/yagyashala_pandit.jpg',
    },
    {
      name: 'PANDIT JI (KARAMKAND)',
      role: 'Ritual & Shastra Vidhan Expert',
      specialty: 'Grah Pravesh, Vaastu Shanti, Ark/Kumbh Vivah & Mangal Dosh Nivaran',
      image: '/pandits/karamkand_pandit.jpg',
    },
  ];

  return (
    <section id="about" className={`relative w-full bg-[#FAF7F2] ${isHomePage ? 'py-14 sm:py-18' : 'pt-28 sm:pt-36 pb-16 sm:pb-24'} px-4 sm:px-6 lg:px-12 overflow-hidden selection:bg-amber-400`}>
      
      {/* Background Sacred Ornaments */}
      <img
        src="/ornaments/clean_yantra.png"
        alt="Yantra wheel watermark left"
        className="absolute top-1/4 -left-28 sm:-left-36 -translate-y-1/2 w-80 sm:w-[440px] h-auto object-contain pointer-events-none opacity-20 select-none"
      />
      <img
        src="/ornaments/clean_yantra.png"
        alt="Yantra wheel watermark right"
        className="absolute top-1/4 -right-28 sm:-right-36 -translate-y-1/2 w-80 sm:w-[440px] h-auto object-contain pointer-events-none opacity-20 select-none"
      />

      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 relative z-10">
        
        {/* ================= SECTION 1: HEADER ================= */}
        {!isHomePage ? (
          /* Dedicated About Page: Single Majestic Warm Hero */
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            {/* Breadcrumb Navigation */}
            <nav className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-500">
              <Link href="/" className="text-[#800000] hover:text-[#5B0D15] font-semibold transition-colors">
                Home
              </Link>
              <span className="text-stone-400">›</span>
              <span className="text-stone-700 font-semibold">About Us &amp; Sacred Lineage</span>
            </nav>

            {/* Sacred Vedic Tag */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-950 text-xs font-bold uppercase tracking-widest shadow-sm">
                <span className="text-sm">ॐ</span>
                <span>Spiritual Lineage &amp; Vedic Parampara</span>
                <span className="text-sm">ॐ</span>
              </div>
            </div>

            {/* Main Page Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#4A151B] leading-[1.18] tracking-tight">
              Spiritual Lineage &amp; Sacred Vedic Guidance
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm lg:text-[15.5px] text-stone-600 leading-relaxed max-w-2xl mx-auto">
              Preserving ancient Varanasi astrological traditions under the revered guidance of Gold Medalist Dr. Pandit Vishal Dubey (AstroVD) — bridging ancient Jyotish Shastras with medical insight and profound spiritual wisdom.
            </p>
          </div>
        ) : (
          /* Home Page: Compact Section Glimpse Header */
          <div className="text-center space-y-2.5 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-widest shadow-sm">
              <span>✦</span>
              <span>ABOUT US &amp; SPIRITUAL LINEAGE</span>
              <span>✦</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#4A151B] leading-tight">
              Guiding Your Destiny with Authentic Vedic Truth
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl mx-auto">
              Led by Gold Medalist Dr. Pandit Vishal Dubey (AstroVD) — bridging ancient Varanasi Shastras with medical and scientific precision.
            </p>
          </div>
        )}

        {/* ================= SECTION 2: FOUNDER (DR. PANDIT VISHAL DUBEY) ================= */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Dr. Pandit Vishal Dubey in Golden Arch Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] sm:max-w-[380px]">
                {/* Outer Golden Arch Frame */}
                <div className="rounded-t-[180px] rounded-b-3xl border-2 border-amber-400/90 p-2 sm:p-2.5 shadow-2xl bg-gradient-to-b from-amber-100/50 via-white/70 to-amber-50/60 backdrop-blur-sm">
                  {/* Inner Image Container */}
                  <div className="rounded-t-[170px] rounded-b-2xl overflow-hidden bg-stone-100 shadow-inner">
                    <img
                      src="/dr_vishal_dubey.jpg"
                      alt="Dr. Pandit Vishal Dubey (AstroVD)"
                      className="w-full h-auto object-cover object-top hover:scale-102 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Overlapping Bottom Badge: Gold Medalist */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[94%] py-2 px-3 rounded-full bg-[#231A16] border border-amber-400/70 shadow-2xl flex items-center justify-center gap-2 text-center z-10">
                  <span className="text-amber-400 text-sm">🏆</span>
                  <span className="text-amber-200 text-xs sm:text-[13px] font-bold tracking-wide">
                    PhD in Jyotish &amp; Rog • Gold Medalist
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Name, Accreditations, High-Impact Points & Button */}
            <div className="lg:col-span-7 space-y-5 text-left">
              
              {/* Title & Qualification Pill */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">Founder &amp; Chief Astrologer</span>
                  <span className="h-px w-12 bg-amber-400"></span>
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#2A1810] tracking-tight leading-tight">
                  Dr. Pandit Vishal Dubey
                </h3>

                <div className="inline-flex flex-wrap items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#B98E4B] via-[#C59B56] to-[#A87B38] text-white text-xs font-semibold shadow-sm">
                  <span>AstroVD</span>
                  <span>•</span>
                  <span>PhD in Vedic Astrology</span>
                  <span>•</span>
                  <span>Jyotishacharya (2018)</span>
                </div>
              </div>

              {/* Bio Summary: Concise & Impactful */}
              {isHomePage ? (
                /* Home Page: Concise & Impactful Glimpse */
                <div className="space-y-3.5 text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <p>
                    Dr. Pandit Vishal Dubey Ji (AstroVD) is a celebrated Vedic astrologer who holds a <strong>PhD in Jyotish &amp; Rog</strong> from the prestigious Maharishi College of Vedic Astrology in Rajasthan. Uniquely combining qualifications in Pharmacy (B.Pharma) and MBA, he bridges empirical science with ancient cosmic vibrations.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-1">
                      <div className="text-xs font-bold text-[#5B0D15] flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-amber-700" />
                        <span>Science &amp; Shastra</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        In-depth research across Vedic Astrology, Palmistry, Vastu, Hypnosis &amp; Tantras.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-1">
                      <div className="text-xs font-bold text-[#5B0D15] flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-700" />
                        <span>15+ Years Heritage</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Affiliated with Shree Ganesh Vidyapith since 2009; honored Best Jyotish Shastri (2015).
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Dedicated About Page: Complete In-Depth Biography */
                <div className="space-y-3.5 text-xs sm:text-[14px] text-stone-700 leading-relaxed">
                  <p>
                    Dr. Pandit Vishal Dubey Ji, also known as AstroVD, is a renowned astrologer who holds a <strong>PhD in Jyotish &amp; Rog</strong> from the esteemed Maharishi College of Vedic Astrology in Rajasthan, specializing in Vedic Astrology. Despite having educational qualifications in Pharmacy (B.Pharma) at the undergraduate level and an MBA at the postgraduate level, Vishal’s career path diverged significantly into the field of Astrology. He believes that his calling was to pursue a career in Astrology, as it was through this field that he discovered a profound connection with Cosmic Power.
                  </p>

                  <p>
                    Drawing on his background in medicine and technology, Vishal conducted extensive research in Vedic Astrology, Palmistry, Vastu, Hypnosis, and Tantras. He was honored with the titles of <strong>Best Jyotish Shastri in 2015</strong> and <strong>Jyotishacharya in 2018</strong>. Since 2009, he has been affiliated with India’s esteemed Astrology research center, Shree Ganesh Vidyapith, where he has accurately predicted significant national events. With a substantial client base spanning across countries like Dubai, Australia, Sri Lanka, and Russia, Dr. Pandit Vishal Dubey Ji has established himself as a trusted and respected figure in the realm of Astrology.
                  </p>
                </div>
              )}

              {/* Impact Trust Bar with Increase Number Animation on Scroll (Shown on both Home & About pages) */}
              <div className="pt-2 border-t border-amber-200/80 grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 shadow-sm">
                  <div className="text-lg sm:text-xl font-bold text-[#5B0D15]">
                    <AnimatedCounter target={50000} suffix="+" />
                  </div>
                  <div className="text-xs text-stone-600 font-medium mt-0.5">Seekers Guided</div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 shadow-sm">
                  <div className="text-lg sm:text-xl font-bold text-[#5B0D15]">
                    <AnimatedCounter target={15000} suffix="+" />
                  </div>
                  <div className="text-xs text-stone-600 font-medium mt-0.5">5★ Reviews</div>
                </div>
              </div>

              {/* Action Button: Changed as requested in Image 4 */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {isHomePage ? (
                  <Link
                    href="/about"
                    className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#73121D] to-[#480A10] hover:from-[#73121D] hover:to-[#5B0D15] text-amber-100 font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/25 hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Explore More About Us</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </Link>
                ) : (
                  <button
                    onClick={() => openWhatsApp('Dr. Vishal Dubey')}
                    className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#73121D] to-[#480A10] hover:from-[#73121D] hover:to-[#5B0D15] text-amber-100 font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/25 hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Book Consultation with Dr. Vishal Dubey</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* ================= DEDICATED ABOUT PAGE ONLY: MADHURI DUBEY, CERTIFICATES & TEAM ================= */}
        {!isHomePage && (
          <>
            {/* Section Divider */}
            <SectionDivider />

            {/* ================= SECTION 3: MADHURI DUBEY (TAROT CARD READER) ================= */}
            <div className="relative max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-white/95 via-[#FAF7F2] to-amber-50/90 border-2 border-amber-300/90 shadow-xl p-6 sm:p-10 backdrop-blur-sm">
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-amber-500 pointer-events-none" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-500 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-500 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-amber-500 pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-4 flex justify-center">
                  <div className="relative w-40 sm:w-48 md:w-52">
                    <div className="rounded-t-[120px] rounded-b-2xl border-2 border-amber-400 p-2 bg-white shadow-lg">
                      <div className="rounded-t-[110px] rounded-b-xl overflow-hidden bg-stone-100">
                        <img
                          src="/pandits/madhuri_dubey.jpg"
                          alt="Madhuri Dubey - Tarot Card Reader"
                          className="w-full h-auto object-cover object-top hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-[#5B0D15] text-[11px] font-bold">
                        Tarot Card Reader
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-8 space-y-4 text-left">
                  <div>
                    <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">Spiritual Guide &amp; Intuitive Master</span>
                    <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A1810]">
                      Madhuri Dubey
                    </h3>
                    <p className="text-amber-800 text-sm font-semibold tracking-wide">
                      ( Tarot Card Reader )
                    </p>
                  </div>

                  <p className="text-stone-700 text-sm sm:text-base leading-relaxed italic bg-white/70 p-4 rounded-2xl border border-amber-200/80">
                    &ldquo;Madhuri Dubey is a well-known tarot card reader and spiritual guide with a focus on providing accurate and meaningful readings represents a path of self-awareness and depicts different stages as one encounters the greater meaning and understanding of life.&rdquo;
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => openWhatsApp('Madhuri Dubey')}
                      className="px-7 py-3 rounded-full bg-white hover:bg-amber-50 border-2 border-amber-400 text-[#2A1810] font-bold text-xs sm:text-sm shadow-md hover:border-amber-500 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Book Tarot Reading with Madhuri Ji</span>
                      <ArrowRight className="w-4 h-4 text-amber-700" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Divider */}
            <SectionDivider />

            {/* ================= SECTION 4: CERTIFICATIONS & HONORS ================= */}
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 text-xs font-semibold">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>Accreditations &amp; Vedic Honors</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4A151B] tracking-tight">
                  CERTIFICATIONS &amp; ACADEMIC EXCELLENCE
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto">
                  Our credentials reflect decades of scholarly research, verified Vedic lineage, and national honors in Jyotish Vidya.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {certifications.map((cert, idx) => {
                  const IconComp = cert.icon;
                  return (
                    <div
                      key={idx}
                      className="p-6 rounded-3xl bg-white border border-amber-200/90 shadow-md hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-[#5B0D15] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <IconComp className="w-6 h-6 text-[#5B0D15]" />
                          </div>
                          <span className="px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-[11px] font-bold">
                            {cert.badge}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-base text-[#2A1810] group-hover:text-[#5B0D15] transition-colors">
                          {cert.title}
                        </h4>

                        <p className="text-xs font-semibold text-stone-800">
                          {cert.institution}
                        </p>

                        <p className="text-[11px] text-stone-500 leading-relaxed">
                          {cert.year}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                        <CheckCircle className="w-4 h-4 fill-emerald-100 text-emerald-600" />
                        <span>Verified Authentic Lineage</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section Divider */}
            <SectionDivider />

            {/* ================= SECTION 5: TEAM (ACHARYA SOURABH SWAMI JI & SCHOLARS) ================= */}
            <div className="space-y-8 pt-4">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>Vedic Scholars &amp; Pandits</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4A151B] tracking-tight">
                  OUR LEARNED VEDIC TEAM &amp; ACHARYAS
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
                  Initiated pandits and scholars from Kashi Vishwanath and Shree Ganesh Vidyapith conducting authentic Vedic rituals.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
                {panditsList.map((pandit, idx) => (
                  <div
                    key={idx}
                    className="rounded-t-[140px] rounded-b-3xl bg-gradient-to-b from-white via-white to-[#FDFBF7] border-2 border-amber-300/80 shadow-lg p-2.5 flex flex-col justify-between hover:shadow-2xl hover:border-amber-400 hover:-translate-y-1.5 transition-all duration-300 group"
                  >
                    <div className="rounded-t-[130px] rounded-b-2xl overflow-hidden h-52 sm:h-56 w-full bg-stone-100 shadow-inner">
                      <img
                        src={pandit.image}
                        alt={pandit.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-3.5 pt-3 text-center rounded-2xl bg-gradient-to-b from-white/60 to-amber-50/40 border border-amber-200/50 mt-2 space-y-1">
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2A1810] tracking-wide leading-snug">
                        {pandit.name}
                      </h4>
                      <p className="text-[11px] text-[#5B0D15] font-semibold">
                        {pandit.role}
                      </p>
                      <p className="text-[10px] text-stone-500 italic line-clamp-2">
                        {pandit.specialty}
                      </p>
                      <button
                        onClick={() => openWhatsApp(pandit.name)}
                        className="mt-2 w-full py-1.5 rounded-full bg-amber-50 hover:bg-[#5B0D15] hover:text-white border border-amber-300 text-[#2A1810] text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Request Pooja Ritual
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>

      {/* Floating Bottom-Right Buttons: Back to Top & WhatsApp */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-stone-300 shadow-lg text-stone-700 hover:text-[#5B0D15] hover:scale-110 flex items-center justify-center transition-all cursor-pointer"
          title="Scroll to Top"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          onClick={() => openWhatsApp('Dr. Vishal Dubey')}
          className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
          title="Chat on WhatsApp"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
        </button>
      </div>

    </section>
  );
};
