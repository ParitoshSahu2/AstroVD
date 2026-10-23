'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUp, MessageCircle, Award, CheckCircle, ShieldCheck, Sparkles, BookOpen, GraduationCap, Star, Users } from 'lucide-react';
import { SectionDivider } from './SectionDivider';
import { useLanguage } from '../context/LanguageContext';

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
  const { t, language } = useLanguage();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = (name = 'Dr. Vishal Dubey') => {
    window.open(`https://wa.me/919826012345?text=Hello%20${encodeURIComponent(name)},%20I%20would%20like%20to%20book%20a%20consultation.`, '_blank');
  };

  const certifications = [
    {
      title: t('PhD in Jyotish & Rog', 'ज्योतिष एवं रोग में पीएचडी'),
      institution: t('Maharishi College of Vedic Astrology, Rajasthan', 'महर्षि वैदिक ज्योतिष महाविद्यालय, राजस्थान'),
      year: t('Specialization in Medical & Predictive Vedic Astrology', 'मेडिकल एवं भविष्यसूचक वैदिक ज्योतिष में विशिष्ट शोध'),
      icon: GraduationCap,
      badge: t('Doctorate Degree', 'विद्यावाचस्पति / डॉक्टरेट'),
    },
    {
      title: t('Jyotishacharya Title', 'ज्योतिषाचार्य मानद उपाधि'),
      institution: t('Vedic Astrological Council of India', 'अखिल भारतीय वैदिक ज्योतिष परिषद'),
      year: t('Honored in 2018 for Exceptional Cosmic Mastery', 'वर्ष 2018 में उत्कृष्ट ज्योतिषीय ज्ञान हेतु अलंकृत'),
      icon: Award,
      badge: t('Highest Honor', 'सर्वोच्च सम्मान'),
    },
    {
      title: t('Best Jyotish Shastri Award', 'सर्वश्रेष्ठ ज्योतिष शास्त्री पुरस्कार'),
      institution: t('National Vedic Research Forum', 'राष्ट्रीय वैदिक शोध संस्थान'),
      year: t('Consecrated Honor in 2015', 'वर्ष 2015 में राष्ट्रीय स्तर पर सम्मानित'),
      icon: Star,
      badge: t('National Award', 'राष्ट्रीय पुरस्कार'),
    },
    {
      title: t('Affiliated Astrological Researcher', 'संबद्ध ज्योतिषीय शोध अध्येता'),
      institution: t('Shree Ganesh Vidyapith Research Center', 'श्री गणेश विद्यापीठ शोध केंद्र'),
      year: t('Leading Predictive Research Since 2009', '2009 से निरंतर सटीक भविष्यफल शोध'),
      icon: BookOpen,
      badge: t('Senior Fellow', 'वरिष्ठ अध्येता'),
    },
    {
      title: t('Certified Hypnotherapist & Tantra Scholar', 'सम्मोहन एवं तंत्र विद्या विशेषज्ञ'),
      institution: t('Institute of Mind Sciences & Ancient Tantras', 'प्राचीन तंत्र व मानस विज्ञान संस्थान'),
      year: t('Deep Palmistry, Vastu & Subconscious Alignment', 'हस्तरेखा, वास्तु दोष निवारण व अवचेतन संतुलन'),
      icon: ShieldCheck,
      badge: t('Certified', 'प्रमाणित'),
    },
    {
      title: t('B.Pharma & MBA Dual Foundations', 'बी.फार्मा एवं एमबीए उच्च शिक्षा'),
      institution: t('Premier Indian Universities', 'प्रतिष्ठित भारतीय विश्वविद्यालय'),
      year: t('Bridging Medical Science, Analytics & Astrology', 'चिकित्सा विज्ञान, विश्लेषण व ज्योतिष का समन्वय'),
      icon: Sparkles,
      badge: t('Academic Foundation', 'शैक्षणिक आधार'),
    },
  ];

  const panditsList = [
    {
      name: t('ACHARYA SOURABH SWAMI JI', 'आचार्य सौरभ स्वामी जी'),
      role: t('Senior Vedic Puja & Karmakand Acharya', 'वरिष्ठ वैदिक पूजा व कर्मकांड आचार्य'),
      specialty: t('Specialist in Shukla Yajurveda Anushthan, Shat Chandi Path, and Navgrah Shanti', 'शुक्ल यजुर्वेद अनुष्ठान, शतचंडी महायज्ञ एवं नवग्रह शांति विशेषज्ञ'),
      image: '/pandits/sourabh_swami.jpg',
    },
    {
      name: t('PANDIT JI (SENIOR ASTROLOGER)', 'पंडित जी (वरिष्ठ ज्योतिषी)'),
      role: t('Senior Kundali & Horary Expert', 'वरिष्ठ जन्म कुंडली व प्रश्न शास्त्र विशेषज्ञ'),
      specialty: t('Janam Kundli analysis, Prashna Kundli, and planetary dosha remedies', 'सटीक जन्म कुंडली विश्लेषण, प्रश्न लग्न विचार व ग्रह शांति उपाय'),
      image: '/pandits/senior_astrologer.jpg',
    },
    {
      name: t('PANDIT JI (YAGYASHALA)', 'पंडित जी (यज्ञशाला आचार्य)'),
      role: t('Yagna & Agnihotra Specialist', 'वैदिक यज्ञ एवं अग्निहोत्र विशेषज्ञ'),
      specialty: t('Kashi Vishwanath Parampara, Mahamrityunjaya Havan & Graha Shanti', 'काशी विश्वनाथ परंपरा, महामृत्युंजय हवन एवं गृह क्लेश शांति'),
      image: '/pandits/yagyashala_pandit.jpg',
    },
    {
      name: t('PANDIT JI (KARAMKAND)', 'पंडित जी (कर्मकांड शास्त्री)'),
      role: t('Ritual & Shastra Vidhan Expert', 'शास्त्र विधान एवं संस्कार विशेषज्ञ'),
      specialty: t('Grah Pravesh, Vaastu Shanti, Ark/Kumbh Vivah & Mangal Dosh Nivaran', 'गृह प्रवेश, वास्तु शांति, अर्क/कुंभ विवाह व मांगलिक दोष निवारण'),
      image: '/pandits/karamkand_pandit.jpg',
    },
  ];

  return (
    <section id="about" className={`relative w-full bg-[#FAF7F2] ${isHomePage ? 'py-14 sm:py-18' : 'py-10 sm:py-16'} px-4 sm:px-6 lg:px-12 overflow-hidden selection:bg-amber-400`}>
      
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
          /* Dedicated About Page: Sacred Parampara Intro */
          <div className="text-center space-y-3.5 max-w-3xl mx-auto">
            {/* Sacred Vedic Tag */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-950 text-xs font-bold uppercase tracking-widest shadow-sm">
                <span className="text-sm">ॐ</span>
                <span>{t('Spiritual Lineage & Vedic Parampara', 'आध्यात्मिक परंपरा एवं वैदिक ज्ञान')}</span>
                <span className="text-sm">ॐ</span>
              </div>
            </div>

            {/* Main Page Title */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#4A151B] leading-tight tracking-tight">
              {t('Spiritual Lineage & Sacred Vedic Guidance', 'आध्यात्मिक परंपरा एवं पवित्र वैदिक मार्गदर्शन')}
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm lg:text-[15px] text-stone-600 leading-relaxed max-w-2xl mx-auto">
              {t(
                'Preserving ancient Varanasi astrological traditions under the revered guidance of Gold Medalist Dr. Pandit Vishal Dubey (AstroVD) — bridging ancient Jyotish Shastras with medical insight and profound spiritual wisdom.',
                'गोल्ड मेडलिस्ट डॉ. पंडित विशाल दुबे (AstroVD) के सानिध्य में प्राचीन काशी ज्योतिष परंपरा — वैदिक शास्त्रों, वैज्ञानिक दृष्टिकोण एवं गहन आध्यात्मिक ज्ञान का अद्भुत संगम।'
              )}
            </p>
          </div>
        ) : (
          /* Home Page: Compact Section Glimpse Header */
          <div className="text-center space-y-2.5 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-widest shadow-sm">
              <span>✦</span>
              <span>{t('ABOUT US & SPIRITUAL LINEAGE', 'परिचय एवं आध्यात्मिक परंपरा')}</span>
              <span>✦</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#4A151B] leading-tight">
              {t('Guiding Your Destiny with Authentic Vedic Truth', 'प्रामाणिक वैदिक सत्य से आपके भाग्य का मार्गदर्शन')}
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl mx-auto">
              {t(
                'Led by Gold Medalist Dr. Pandit Vishal Dubey (AstroVD) — bridging ancient Varanasi Shastras with medical and scientific precision.',
                'गोल्ड मेडलिस्ट डॉ. पंडित विशाल दुबे (AstroVD) के मार्गदर्शन में — प्राचीन काशी शास्त्रों एवं वैज्ञानिक सटीकता का संगम।'
              )}
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
                    <Image
                      src="/dr_vishal_dubey.jpg"
                      alt="Dr. Pandit Vishal Dubey (AstroVD)"
                      width={380}
                      height={480}
                      sizes="(max-width: 640px) 100vw, 380px"
                      className="w-full h-auto object-cover object-top hover:scale-102 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Overlapping Bottom Badge: Gold Medalist */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[94%] py-2 px-3 rounded-full bg-[#231A16] border border-amber-400/70 shadow-2xl flex items-center justify-center gap-2 text-center z-10">
                  <span className="text-amber-400 text-sm">🏆</span>
                  <span className="text-amber-200 text-xs sm:text-[13px] font-bold tracking-wide">
                    {t('PhD in Jyotish & Rog • Gold Medalist', 'ज्योतिष एवं रोग में पीएचडी • स्वर्ण पदक विजेता')}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Name, Accreditations, High-Impact Points & Button */}
            <div className="lg:col-span-7 space-y-5 text-left">
              
              {/* Title & Qualification Pill */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">{t('Founder & Chief Astrologer', 'संस्थापक एवं मुख्य ज्योतिषाचार्य')}</span>
                  <span className="h-px w-12 bg-amber-400"></span>
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#2A1810] tracking-tight leading-tight">
                  {t('Dr. Pandit Vishal Dubey', 'डॉ. पंडित विशाल दुबे')}
                </h3>

                <div className="inline-flex flex-wrap items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#B98E4B] via-[#C59B56] to-[#A87B38] text-white text-xs font-semibold shadow-sm">
                  <span>AstroVD</span>
                  <span>•</span>
                  <span>{t('PhD in Vedic Astrology', 'पीएचडी वैदिक ज्योतिष')}</span>
                  <span>•</span>
                  <span>{t('Jyotishacharya (2018)', 'ज्योतिषाचार्य (2018)')}</span>
                </div>
              </div>

              {/* Bio Summary: Concise & Impactful */}
              {isHomePage ? (
                /* Home Page: Concise & Impactful Glimpse */
                <div className="space-y-3.5 text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <p>
                    {t(
                      'Dr. Pandit Vishal Dubey Ji (AstroVD) is a celebrated Vedic astrologer who holds a PhD in Jyotish & Rog from the prestigious Maharishi College of Vedic Astrology in Rajasthan. Uniquely combining qualifications in Pharmacy (B.Pharma) and MBA, he bridges empirical science with ancient cosmic vibrations.',
                      'डॉ. पंडित विशाल दुबे जी (AstroVD) एक प्रतिष्ठित वैदिक ज्योतिषी हैं, जिन्होंने राजस्थान के सुविख्यात महर्षि वैदिक ज्योतिष महाविद्यालय से ज्योतिष एवं रोग में पीएचडी की उपाधि प्राप्त की है। फार्मेसी (B.Pharma) और एमबीए की उच्च शिक्षा के साथ वे वैज्ञानिक दृष्टिकोण एवं प्राचीन वैदिक ऋचाओं का अद्भुत समन्वय करते हैं।'
                    )}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-1">
                      <div className="text-xs font-bold text-[#5B0D15] flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-amber-700" />
                        <span>{t('Science & Shastra', 'विज्ञान एवं शास्त्र')}</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        {t('In-depth research across Vedic Astrology, Palmistry, Vastu, Hypnosis & Tantras.', 'वैदिक ज्योतिष, हस्तरेखा, वास्तु, सम्मोहन एवं तंत्र पर गहन शोध।')}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-1">
                      <div className="text-xs font-bold text-[#5B0D15] flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-700" />
                        <span>{t('15+ Years Heritage', '15+ वर्षों की वैदिक परंपरा')}</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        {t('Affiliated with Shree Ganesh Vidyapith since 2009; honored Best Jyotish Shastri (2015).', '2009 से श्री गणेश विद्यापीठ से संबद्ध; \'सर्वश्रेष्ठ ज्योतिष शास्त्री\' (2015) से सम्मानित।')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Dedicated About Page: Complete In-Depth Biography */
                <div className="space-y-3.5 text-xs sm:text-[14px] text-stone-700 leading-relaxed">
                  <p>
                    {t(
                      'Dr. Pandit Vishal Dubey Ji, also known as AstroVD, is a renowned astrologer who holds a PhD in Jyotish & Rog from the esteemed Maharishi College of Vedic Astrology in Rajasthan, specializing in Vedic Astrology. Despite having educational qualifications in Pharmacy (B.Pharma) at the undergraduate level and an MBA at the postgraduate level, Vishal’s career path diverged significantly into the field of Astrology. He believes that his calling was to pursue a career in Astrology, as it was through this field that he discovered a profound connection with Cosmic Power.',
                      'डॉ. पंडित विशाल दुबे जी, जिन्हें AstroVD के नाम से भी जाना जाता है, एक प्रतिष्ठित ज्योतिषी हैं जिन्होंने राजस्थान के प्रतिष्ठित महर्षि वैदिक ज्योतिष महाविद्यालय से वैदिक ज्योतिष में विशेषज्ञता के साथ ज्योतिष एवं रोग में पीएचडी प्राप्त की है। स्नातक स्तर पर फार्मेसी (B.Pharma) और स्नातकोत्तर स्तर पर एमबीए की योग्यता होने के बावजूद, विशाल जी का जीवन मार्ग पूर्णतः ज्योतिष के प्रति समर्पित हो गया। वे मानते हैं कि ज्योतिष उनका ईश्वरीय आह्वान था, जिसके माध्यम से उन्होंने ब्रह्मांडीय शक्तियों से गहरा संबंध अनुभव किया।'
                    )}
                  </p>

                  <p>
                    {t(
                      'Drawing on his background in medicine and technology, Vishal conducted extensive research in Vedic Astrology, Palmistry, Vastu, Hypnosis, and Tantras. He was honored with the titles of Best Jyotish Shastri in 2015 and Jyotishacharya in 2018. Since 2009, he has been affiliated with India’s esteemed Astrology research center, Shree Ganesh Vidyapith, where he has accurately predicted significant national events. With a substantial client base spanning across countries like Dubai, Australia, Sri Lanka, and Russia, Dr. Pandit Vishal Dubey Ji has established himself as a trusted and respected figure in the realm of Astrology.',
                      'चिकित्सा एवं विश्लेषणात्मक पृष्ठभूमि का उपयोग करते हुए, विशाल जी ने वैदिक ज्योतिष, हस्तरेखा, वास्तु, सम्मोहन और प्राचीन तंत्रों में गहन शोध किया। उन्हें 2015 में \'सर्वश्रेष्ठ ज्योतिष शास्त्री\' और 2018 में \'ज्योतिषाचार्य\' की उपाधि से अलंकृत किया गया। वर्ष 2009 से वे भारत के प्रतिष्ठित ज्योतिष शोध केंद्र, श्री गणेश विद्यापीठ से जुड़े हैं, जहां उन्होंने राष्ट्रीय व अंतर्राष्ट्रीय स्तर पर सटीक भविष्यवाणियां की हैं। दुबई, ऑस्ट्रेलिया, श्रीलंका और रूस जैसे देशों में फैले अपने विशाल जातक समुदाय के साथ, डॉ. पंडित विशाल दुबे जी ने ज्योतिष जगत में एक अत्यंत विश्वसनीय एवं आदरणीय स्थान बनाया है।'
                    )}
                  </p>
                </div>
              )}

              {/* Impact Trust Bar with Increase Number Animation on Scroll (Shown on both Home & About pages) */}
              <div className="pt-2 border-t border-amber-200/80 grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 shadow-sm">
                  <div className="text-lg sm:text-xl font-bold text-[#5B0D15]">
                    <AnimatedCounter target={50000} suffix="+" />
                  </div>
                  <div className="text-xs text-stone-600 font-medium mt-0.5">{t('Seekers Guided', 'संतुष्ट जातक')}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 shadow-sm">
                  <div className="text-lg sm:text-xl font-bold text-[#5B0D15]">
                    <AnimatedCounter target={15000} suffix="+" />
                  </div>
                  <div className="text-xs text-stone-600 font-medium mt-0.5">{t('5★ Reviews', '5★ रेटिंग')}</div>
                </div>
              </div>

              {/* Action Button: Changed as requested in Image 4 */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {isHomePage ? (
                  <Link
                    href="/about"
                    className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#73121D] to-[#480A10] hover:from-[#73121D] hover:to-[#5B0D15] text-amber-100 font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/25 hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t('Explore More About Us', 'हमारे बारे में और जानें')}</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </Link>
                ) : (
                  <button
                    onClick={() => openWhatsApp('Dr. Vishal Dubey')}
                    className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#73121D] to-[#480A10] hover:from-[#73121D] hover:to-[#5B0D15] text-amber-100 font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/25 hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t('Book Consultation with Dr. Vishal Dubey', 'डॉ. विशाल दुबे से परामर्श लें')}</span>
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
                      <div className="rounded-t-[110px] rounded-b-xl overflow-hidden bg-stone-100 h-64 sm:h-72 w-full">
                        <img
                          src="/pandits/madhuri_dubey.jpg"
                          alt="Madhuri Dubey - Tarot Card Reader"
                          className="w-full h-full object-cover object-[center_30%] hover:scale-105 transition-transform duration-500"
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
                    <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">{t('Spiritual Guide & Intuitive Master', 'आध्यात्मिक मार्गदर्शक एवं टैरो विशेषज्ञ')}</span>
                    <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A1810]">
                      {t('Madhuri Dubey', 'माधुरी दुबे')}
                    </h3>
                    <p className="text-amber-800 text-sm font-semibold tracking-wide">
                      {t('( Tarot Card Reader )', '( टैरो कार्ड रीडर )')}
                    </p>
                  </div>

                  <p className="text-stone-700 text-sm sm:text-base leading-relaxed italic bg-white/70 p-4 rounded-2xl border border-amber-200/80">
                    &ldquo;{t(
                      'Madhuri Dubey is a well-known tarot card reader and spiritual guide with a focus on providing accurate and meaningful readings represents a path of self-awareness and depicts different stages as one encounters the greater meaning and understanding of life.',
                      'माधुरी दुबे एक सुप्रसिद्ध टैरो कार्ड रीडर एवं आध्यात्मिक मार्गदर्शक हैं, जो सटीक एवं अर्थपूर्ण भविष्यकथन के माध्यम से आत्म-जागरूकता का मार्ग प्रशस्त करती हैं तथा जीवन के गूढ़ अर्थों को समझने में दिव्य मार्गदर्शन प्रदान करती हैं।'
                    )}&rdquo;
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => openWhatsApp('Madhuri Dubey')}
                      className="px-7 py-3 rounded-full bg-white hover:bg-amber-50 border-2 border-amber-400 text-[#2A1810] font-bold text-xs sm:text-sm shadow-md hover:border-amber-500 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>{t('Book Tarot Reading with Madhuri Ji', 'माधुरी जी संग टैरो रीडिंग बुक करें')}</span>
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
                  <span>{t('Accreditations & Vedic Honors', 'वैदिक सम्मान व उपाधियां')}</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4A151B] tracking-tight">
                  {t('CERTIFICATIONS & ACADEMIC EXCELLENCE', 'प्रमाणपत्र एवं शैक्षणिक उत्कृष्टता')}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto">
                  {t(
                    'Our credentials reflect decades of scholarly research, verified Vedic lineage, and national honors in Jyotish Vidya.',
                    'हमारे प्रमाण पत्र दशकों के शास्त्रीय अनुसंधान, प्रमाणित वैदिक परंपरा एवं ज्योतिष विद्या में राष्ट्रीय सम्मानों के प्रतीक हैं।'
                  )}
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
