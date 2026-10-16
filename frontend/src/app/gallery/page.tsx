'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { Sparkles, X, Eye, Calendar, MapPin, Award, Filter, Flame } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: 'pooja' | 'consultation' | 'yantra' | 'awards' | 'kashi';
  categoryLabel: string;
  image: string;
  location: string;
  date: string;
  description: string;
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: '1',
      title: 'Grand Shat Chandi Maha Yagya at Kashi Vishwanath',
      category: 'pooja',
      categoryLabel: 'Sacred Poojas & Havan',
      image: '/services/puja.jpg',
      location: 'Dashashwamedh Ghat, Varanasi',
      date: 'Vasant Navratri 2026',
      description: 'Consecrated 100 recitations of Durga Saptashati performed by 11 initiated Vedic Acharyas for global peace and cosmic alignment.',
    },
    {
      id: '2',
      title: 'Dr. Pandit Vishal Dubey Ji Addressing Seekers',
      category: 'consultation',
      categoryLabel: 'Vedic Consultations',
      image: '/homepage.png',
      location: 'Shree Ganesh Vidyapith Sanctum',
      date: 'Monthly Spiritual Conclave',
      description: 'Gold Medalist Dr. Pandit Vishal Dubey (AstroVD) unraveling horoscope configurations and prescribing targeted planetary remedies.',
    },
    {
      id: '3',
      title: 'Consecration of 24k Gold Plated Shree Yantra',
      category: 'yantra',
      categoryLabel: 'Yantras & Gemstones',
      image: '/services/gemstones.jpg',
      location: 'Vedic Yagyashala Altar',
      date: 'Akshaya Tritiya Muhurta',
      description: 'Pran Pratishtha and 1,008 Kanakadhara Stotra oblations infusing celestial abundance into sacred geometric Shree Yantras.',
    },
    {
      id: '4',
      title: 'Honored with Jyotishacharya National Title',
      category: 'awards',
      categoryLabel: 'Honors & Certifications',
      image: '/dr_vishal_dubey.jpg',
      location: 'Maharishi College of Vedic Astrology',
      date: 'Annual Convocation Honor',
      description: 'Conferral of the prestigious Jyotishacharya title recognizing Dr. Vishal Dubey’s groundbreaking predictive research and doctorate.',
    },
    {
      id: '5',
      title: 'Vedic Ashtakoot Kundli Matching & Kumbh Vivah',
      category: 'pooja',
      categoryLabel: 'Sacred Poojas & Havan',
      image: '/services/marriage.jpg',
      location: 'Varanasi Sanctum Mandap',
      date: 'Shubh Vivah Muhurta',
      description: 'Traditional remedial marriage ritual mitigating severe Manglik dosha and aligning planetary harmonies for prospective couples.',
    },
    {
      id: '6',
      title: 'Intuitive Tarot Guidance Session with Madhuri Dubey',
      category: 'consultation',
      categoryLabel: 'Vedic Consultations',
      image: '/pandits/madhuri_dubey.jpg',
      location: 'AstroVD Intuitive Studio',
      date: 'Weekly Sanctuary Readings',
      description: 'Spiritual guidance through sacred archetypal symbolism guiding seekers through life turning points with compassionate clarity.',
    },
    {
      id: '7',
      title: 'Natural Tiger Eye & Consecrated Crystals Collection',
      category: 'yantra',
      categoryLabel: 'Yantras & Gemstones',
      image: '/products/tiger_eye_bracelet.jpg',
      location: 'Ratna Parikshan Lab, Varanasi',
      date: 'Consecrated Batch 2026',
      description: 'Unheated, certified natural gemstones and bracelets energized with planetary Beej Mantras for solar plexus empowerment.',
    },
    {
      id: '8',
      title: 'Acharya Sourabh Swami Leading Shukla Yajurveda Anushthan',
      category: 'pooja',
      categoryLabel: 'Sacred Poojas & Havan',
      image: '/pandits/sourabh_swami.jpg',
      location: 'Holy Ganges Ghats, Kashi',
      date: 'Somvati Amavasya Anushthan',
      description: 'Senior Karmakand Acharya Sourabh Swami Ji performing Navgrah Shanti Havan invoking peaceful planetary vibrations.',
    },
    {
      id: '9',
      title: 'Rare Consecrated Pyrite (Fool’s Gold) Dhan Yog Specimen',
      category: 'yantra',
      categoryLabel: 'Yantras & Gemstones',
      image: '/products/prod-pyrite.png',
      location: 'Spiritual Vault, AstroVD',
      date: 'Dhanteras Energized',
      description: 'Natural cubic mineral formation consecrated for business growth, cashflow acceleration, and radiant confidence.',
    },
    {
      id: '10',
      title: 'Holy Agnihotra Fire in Temple Yagyashala',
      category: 'kashi',
      categoryLabel: 'Temple Anushthan & Varanasi',
      image: '/pandits/yagyashala_pandit.jpg',
      location: 'Kashi Vishwanath Corridor',
      date: 'Daily Bramha Muhurta',
      description: 'Continuous sacred sacrificial fire purifying the atmospheric ether with sacred wood, herbs, and cow ghee offerings.',
    },
    {
      id: '11',
      title: 'Deluxe Embossed Vedic Janam Kundli Dossiers',
      category: 'consultation',
      categoryLabel: 'Vedic Consultations',
      image: '/services/kundli.jpg',
      location: 'AstroVD Publishing Bureau',
      date: 'Custom Editions',
      description: 'Exquisitely hand-verified 60+ pages hardcopy horoscopes containing 16 sub-charts and customized lifecycle transit solutions.',
    },
    {
      id: '12',
      title: 'Best Jyotish Shastri Award Conferral (2015)',
      category: 'awards',
      categoryLabel: 'Honors & Certifications',
      image: '/pandits/senior_astrologer.jpg',
      location: 'National Vedic Research Forum',
      date: 'Golden Jubliee Celebration',
      description: 'National recognition bestowed upon Dr. Pandit Vishal Dubey for accurate national political and astrological forecast models.',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Moments (12)' },
    { id: 'pooja', label: 'Sacred Poojas & Havan' },
    { id: 'consultation', label: 'Vedic Consultations' },
    { id: 'yantra', label: 'Yantras & Gemstones' },
    { id: 'awards', label: 'Honors & Certifications' },
    { id: 'kashi', label: 'Temple Anushthan' },
  ];

  const filtered = galleryItems.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-hidden selection:bg-amber-400">
      <Navbar />

      <PageHeader
        breadcrumb="Sacred Gallery"
        title="Celestial Gallery & Sacred Memories"
        subtitle="Visual glimpses of holy yagyas, temple consecrations, Vedic awards, and consultations presided over by Dr. Pandit Vishal Dubey (AstroVD)."
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16 space-y-10">
        
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer shadow-sm ${
                activeCategory === cat.id
                  ? 'bg-[#5B0D15] text-white shadow-md shadow-rose-950/20 scale-105'
                  : 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-200 hover:border-amber-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative rounded-3xl overflow-hidden bg-white border border-stone-200/90 shadow-md hover:shadow-2xl hover:border-amber-400 transition-all duration-500 cursor-pointer flex flex-col justify-between"
            >
              {/* Image Container with golden arch hint */}
              <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-stone-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md border border-white/60 text-white flex items-center justify-center scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 shadow-xl">
                    <Eye className="w-6 h-6" />
                  </div>
                </div>

                {/* Top Category Tag */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-300/60 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  ✦ {item.categoryLabel}
                </div>
              </div>

              {/* Bottom Card Information */}
              <div className="p-5 sm:p-6 space-y-2.5 bg-white">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#2A1810] group-hover:text-[#5B0D15] transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="truncate max-w-[140px]">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-[#FAF7F2] rounded-3xl overflow-hidden border-2 border-amber-400 shadow-2xl space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="relative w-full h-80 sm:h-96 bg-stone-900 overflow-hidden">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#5B0D15] text-amber-200 text-xs font-bold tracking-wide">
                ✦ {selectedImage.categoryLabel}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-3">
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2A1810]">
                {selectedImage.title}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 border-y border-stone-200 py-2">
                <span className="flex items-center gap-1.5 font-semibold text-amber-900">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  {selectedImage.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  {selectedImage.date}
                </span>
              </div>

              <p className="text-sm text-stone-700 leading-relaxed">
                {selectedImage.description}
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-6 py-2 rounded-full bg-[#5B0D15] text-white text-xs font-bold hover:bg-[#72111c] transition-colors"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
