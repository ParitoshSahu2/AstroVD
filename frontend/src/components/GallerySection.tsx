'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, MapPin, Calendar, Sparkles, ArrowRight, X, ChevronLeft, ChevronRight, Flame, Tv, Award, Compass } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface GalleryPhoto {
  id: string;
  title: string;
  titleHi: string;
  category: 'pooja' | 'media' | 'temple' | 'awards';
  categoryLabel: string;
  categoryLabelHi: string;
  src: string;
  location: string;
  locationHi: string;
  date: string;
  dateHi: string;
  description: string;
  descriptionHi: string;
}

export const galleryPhotos: GalleryPhoto[] = [
  {
    id: '1',
    title: 'Sacred Vedic Havan & Yagya by Dr. Pandit Vishal Dubey',
    titleHi: 'पूज्य डॉ. पंडित विशाल दुबे जी द्वारा संपन्न दिव्य महाहवन',
    category: 'pooja',
    categoryLabel: 'Vedic Havan & Poojas',
    categoryLabelHi: 'वैदिक महायज्ञ व पूजन',
    src: '/gallery/IMG_2542.jpg',
    location: 'Shree Ganesh Vidyapith Sanctum, Varanasi',
    locationHi: 'श्री गणेश विद्यापीठ यज्ञशाला, वाराणसी',
    date: 'Auspicious Muhurta 2024',
    dateHi: 'शुभ मुहूर्त 2024',
    description: 'Dr. Pandit Vishal Dubey presiding over a consecrated Vedic Havan along with initiated pandits and devotee families praying for cosmic balance.',
    descriptionHi: 'डॉ. पंडित विशाल दुबे जी के पावन सानिध्य में यजमान परिवारों के कल्याणार्थ विधि-विधान से संपन्न हुआ वैदिक महाहवन।'
  },
  {
    id: '2',
    title: 'National Media & TV Discourses on Vedic Astrology',
    titleHi: 'राष्ट्रीय समाचार चैनलों (ETV Bharat, Prime Talk) पर ज्योतिष परिचर्चा',
    category: 'media',
    categoryLabel: 'Media & TV Broadcasts',
    categoryLabelHi: 'मीडिया व टीवी प्रसारण',
    src: '/gallery/IMG_2537.jpg',
    location: 'National Broadcast Studios (ETV Bharat & Hindustan Mail)',
    locationHi: 'राष्ट्रीय प्रसारण स्टूडियो (ईटीवी भारत एवं हिंदुस्तान मेल)',
    date: 'Televised Special Series',
    dateHi: 'विशेष टीवी प्रसारण श्रृंखला',
    description: 'Live astrological consultations and planetary transit revelations broadcasted across leading television channels and digital news networks.',
    descriptionHi: 'प्रमुख राष्ट्रीय समाचार माध्यमों पर ग्रह गोचर, कालसर्प दोष निवारण एवं शास्त्रसम्मत फलित ज्योतिष पर विशेष उद्बोधन।'
  },
  {
    id: '3',
    title: 'Grand Temple Anushthan at Sacred Kashi Sanctum',
    titleHi: 'काशी विश्वनाथ पावन परिक्षेत्र में भव्य वैदिक अनुष्ठान',
    category: 'temple',
    categoryLabel: 'Temple & Kashi Anushthan',
    categoryLabelHi: 'काशी व तीर्थ अनुष्ठान',
    src: '/gallery/WhatsApp-Image-2024-09-30-at-5.31.21-PM-2-1024x682.jpeg',
    location: 'Kashi Vishwanath Corridor, Varanasi',
    locationHi: 'काशी विश्वनाथ कॉरिडोर, वाराणसी',
    date: 'Mahashivratri & Navratri Mahotsav',
    dateHi: 'महाशिवरात्रि एवं नवरात्र महोत्सव',
    description: 'High-energy sanctified prayers, Rudrabhishek oblations, and divine planetary peace mantras in the sacred holy land of Kashi.',
    descriptionHi: 'द्वादश ज्योतिर्लिंग काशी विश्वनाथ की पुण्यधरा पर रुद्राभिषेक एवं नवग्रह शांति का दिव्य शास्त्रीय अनुष्ठान।'
  },
  {
    id: '4',
    title: 'National Vedic Conclave & Prestigious Honors',
    titleHi: 'अखिल भारतीय वैदिक ज्योतिष सम्मेलन एवं राष्ट्रीय सम्मान',
    category: 'awards',
    categoryLabel: 'Honors & Conclaves',
    categoryLabelHi: 'राष्ट्रीय सम्मान व दीक्षांत',
    src: '/gallery/WhatsApp-Image-2024-02-01-at-2.28.35-PM-1024x768.jpeg',
    location: 'National Convention of Astrological Sciences',
    locationHi: 'राष्ट्रीय ज्योतिष विज्ञान महाधिवेशन',
    date: 'Annual Jyotish Conclave',
    dateHi: 'वार्षिक ज्योतिष महाधिवेशन',
    description: 'Dr. Vishal Dubey being felicitated with prestigious honorary titles for extraordinary predictive accuracy and medical astrology breakthroughs.',
    descriptionHi: 'चिकित्सा ज्योतिष एवं सूक्ष्म फलित प्रणालियों में विशिष्ट योगदान हेतु राष्ट्रीय स्तर पर सर्वोच्च मानद उपाधियों से सम्मानित।'
  },
  {
    id: '5',
    title: 'Holy Ganga Ghats Maha Aarti & Vedic Consecration',
    titleHi: 'दशाश्वमेध पावन गंगा तट पर महाआरती एवं वैदिक संकल्प',
    category: 'temple',
    categoryLabel: 'Temple & Kashi Anushthan',
    categoryLabelHi: 'काशी व तीर्थ अनुष्ठान',
    src: '/gallery/WhatsApp-Image-2024-03-07-at-2.31.04-PM-1024x768.jpeg',
    location: 'Dashashwamedh & Assi Ghats, Kashi',
    locationHi: 'दशाश्वमेध एवं अस्सी घाट, काशी',
    date: 'Dev Deepawali & Ganga Mahotsav',
    dateHi: 'देव दीपावली एवं गंगा महोत्सव',
    description: 'Divine Ganga Aarti oblations and personalized sankalp conducted for family prosperity, health, and liberation from karmic debts.',
    descriptionHi: 'पतित पावनी मां गंगा के तट पर जातकों के सुख, शांति व पितृदोष शांति हेतु संपन्न महाआरती एवं संकल्प।'
  },
  {
    id: '6',
    title: 'Navgrah Shanti Havan & Vedic Purnahuti Ahuti',
    titleHi: 'नवग्रह शांति महायज्ञ एवं पूर्णाहूति आहुतियां',
    category: 'pooja',
    categoryLabel: 'Vedic Havan & Poojas',
    categoryLabelHi: 'वैदिक महायज्ञ व पूजन',
    src: '/gallery/IMG_2546.jpg',
    location: 'Vedic Yagyashala Mandap, Varanasi',
    locationHi: 'वैदिक यज्ञशाला मंडप, वाराणसी',
    date: 'Navgrah Parva Muhurta',
    dateHi: 'नवग्रह पर्व मुहूर्त',
    description: 'Offering the supreme final oblation (Purnahuti) to the sacred fire invoking blessings of Surya, Chandra, Mangal, and all nine cosmic forces.',
    descriptionHi: 'समस्त नवग्रहों की अनुकूलता हेतु विधि-सम्मत समिधा एवं शुद्ध घृत के साथ पवित्र अग्नि में पूर्णाहूति अर्पण।'
  },
  {
    id: '7',
    title: 'Assembly of Eminent Vedic Scholars & Astrologers',
    titleHi: 'विद्वत वैदिक आचार्यों एवं ज्योतिषाचार्यों का विशिष्ट समागम',
    category: 'awards',
    categoryLabel: 'Honors & Conclaves',
    categoryLabelHi: 'राष्ट्रीय सम्मान व दीक्षांत',
    src: '/gallery/WhatsApp-Image-2024-02-08-at-3.31.41-PM-2-1024x768.jpeg',
    location: 'Shree Kashi Vidwat Parishad',
    locationHi: 'श्री काशी विद्वत परिषद, वाराणसी',
    date: 'Vedic Wisdom Symposium',
    dateHi: 'वैदिक ज्ञान विचार संगोष्ठी',
    description: 'Scholarly discourse with respected Acharyas and Vedic scholars discussing authentic horoscope calculations and Siddhanta Jyotish.',
    descriptionHi: 'सिद्धांत ज्योतिष, मुहूर्तमार्तण्ड एवं पंचांग गणना पर वरिष्ठ ज्योतिषाचार्यों के साथ गहन विचार-विमर्श एवं मंथन।'
  },
  {
    id: '8',
    title: 'Grand Shat Chandi & Rudrabhishek Yagya Mandap',
    titleHi: 'भव्य शतचंडी एवं रुद्राभिषेक महायज्ञ मंडप दर्शन',
    category: 'pooja',
    categoryLabel: 'Vedic Havan & Poojas',
    categoryLabelHi: 'वैदिक महायज्ञ व पूजन',
    src: '/gallery/IMG_2547.jpg',
    location: 'Dashashwamedh Mandap, Varanasi',
    locationHi: 'दशाश्वमेध मंडप, वाराणसी',
    date: 'Chaitra Vasant Navratri',
    dateHi: 'चैत्र वसंत नवरात्रि',
    description: 'The sanctified sacrificial altar where sacred oblations are offered with Vedic mantras for divine protection and planetary peace.',
    descriptionHi: 'वैदिक मंत्रोच्चार और असीम सकारात्मक ऊर्जा से प्रदीप्त पावन यज्ञवेदी जहां समस्त विघ्नों के निवारण हेतु आहुतियां दी जाती हैं।'
  }
];

export const GallerySection: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filterTabs = [
    { id: 'all', label: t('All Moments', 'सभी क्षण'), icon: Sparkles },
    { id: 'pooja', label: t('Vedic Havans & Poojas', 'वैदिक महायज्ञ व पूजन'), icon: Flame },
    { id: 'media', label: t('Media & TV Broadcasts', 'मीडिया व टीवी'), icon: Tv },
    { id: 'temple', label: t('Kashi & Temple Anushthan', 'काशी व तीर्थ अनुष्ठान'), icon: Compass },
    { id: 'awards', label: t('Honors & Conclaves', 'राष्ट्रीय सम्मान व दीक्षांत'), icon: Award },
  ];

  const filteredPhotos = activeFilter === 'all'
    ? galleryPhotos
    : galleryPhotos.filter((p) => p.category === activeFilter);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredPhotos.length : 0));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredPhotos.length]);

  const activePhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <section className="relative py-16 md:py-24 bg-[#FAF7F2] overflow-hidden">
      {/* Decorative Golden Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#D4AF37]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#8B2635]/6 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#4A151B] leading-tight mb-4">
            {t('Gallery', 'गैलरी')}
          </h2>
          
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            {t(
              'Photos and special moments from our poojas, events, and TV sessions.',
              'हमारे पूजन, अनुष्ठान और आयोजनों की प्रमुख तस्वीरें एवं झलकियां।'
            )}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#8B2635] text-white shadow-md shadow-[#8B2635]/20'
                    : 'bg-white/80 hover:bg-[#FAF0E6] text-stone-700 border border-stone-200/80 hover:border-[#D4AF37]/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => setLightboxIndex(idx)}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-200/70 hover:border-[#D4AF37]/60 transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                <Image
                  src={photo.src}
                  alt={language === 'hi' ? photo.titleHi : photo.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Top Category Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#8B2635]/90 text-white backdrop-blur-sm shadow">
                    {language === 'hi' ? photo.categoryLabelHi : photo.categoryLabel}
                  </span>
                </div>

                {/* Hover Eye Icon Badge */}
                <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 text-[#8B2635] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
                  <Eye className="w-4 h-4" />
                </div>

                {/* Bottom Overlay Location */}
                <div className="absolute bottom-3 left-3 right-3 z-10 text-white/90 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span className="truncate">{language === 'hi' ? photo.locationHi : photo.location}</span>
                </div>
              </div>

              {/* Text Description Box */}
              <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-[#FAF7F2]">
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#8B2635] transition-colors mb-2">
                    {language === 'hi' ? photo.titleHi : photo.title}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {language === 'hi' ? photo.descriptionHi : photo.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#D4AF37]" />
                    {language === 'hi' ? photo.dateHi : photo.date}
                  </span>
                  <span className="text-[#8B2635] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    {t('Preview', 'देखें')} →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner: View Complete 50+ Gallery */}
        <div className="mt-12 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#73121D] to-[#480A10] hover:from-[#73121D] hover:to-[#5B0D15] text-amber-100 font-bold text-sm sm:text-base shadow-xl shadow-rose-950/25 hover:scale-105 transition-all duration-200 border border-amber-300/40 cursor-pointer"
          >
            <span>{t('Explore Complete Sacred Gallery (50+ Moments)', 'सम्पूर्ण पावन दीर्घा देखें (50+ स्मृतियाँ)')}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </Link>
        </div>

      </div>

      {/* Lightbox Modal */}
      {activePhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Modal Container */}
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-[#D4AF37]/50 max-h-[92vh] flex flex-col animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main High-Res Image Display */}
            <div className="relative w-full max-h-[58vh] sm:max-h-[64vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activePhoto.src}
                alt={language === 'hi' ? activePhoto.titleHi : activePhoto.title}
                className="max-h-[58vh] sm:max-h-[64vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Photo Details Footer */}
            <div className="p-5 sm:p-6 bg-[#FAF7F2] border-t border-stone-200 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#8B2635] text-white">
                  {language === 'hi' ? activePhoto.categoryLabelHi : activePhoto.categoryLabel}
                </span>
                <div className="flex items-center gap-4 text-xs text-stone-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {language === 'hi' ? activePhoto.locationHi : activePhoto.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {language === 'hi' ? activePhoto.dateHi : activePhoto.date}
                  </span>
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#4A151B] mb-2">
                {language === 'hi' ? activePhoto.titleHi : activePhoto.title}
              </h3>

              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                {language === 'hi' ? activePhoto.descriptionHi : activePhoto.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
