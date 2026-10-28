'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Clock, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BlogPost {
  id: string;
  title: string;
  titleHi: string;
  excerpt: string;
  excerptHi: string;
  category: string;
  categoryHi: string;
  author: string;
  authorHi: string;
  date: string;
  dateHi: string;
  readTime: string;
  readTimeHi: string;
  image: string;
}

const blogs: BlogPost[] = [
  {
    id: 'planetary-transits-2026',
    title: 'Major Planetary Transits of 2026 & Their Impact on Your Zodiac',
    titleHi: 'वर्ष 2026 के प्रमुख ग्रह गोचर एवं आपकी राशि पर उनका प्रभाव',
    excerpt: 'Explore how Jupiter and Saturn transit cycles will influence career expansions, relationship commitments, and spiritual awakening this year.',
    excerptHi: 'जानें कि गुरु और शनि के दुर्लभ गोचर चक्र इस वर्ष करियर विस्तार, दांपत्य संबंध एवं आध्यात्मिक प्रगति को कैसे प्रभावित करेंगे।',
    category: 'Vedic Jyotish',
    categoryHi: 'वैदिक ज्योतिष',
    author: 'Dr. Pandit Vishal Dubey',
    authorHi: 'डॉ. पंडित विशाल दुबे',
    date: 'Oct 12, 2026',
    dateHi: '12 अक्टूबर, 2026',
    readTime: '6 min read',
    readTimeHi: '6 मिनट पठन',
    image: '/services/kundli.jpg',
  },
  {
    id: 'tarot-intuition-guide',
    title: 'The Language of the Cards: How Intuitive Tarot Bridges Past & Future',
    titleHi: 'कार्ड्स की दिव्य भाषा: अंतर्ज्ञान व टैरो से भूत व भविष्य का समन्वय',
    excerpt: 'Understanding archetypal symbols in the Major Arcana and discovering how tarot spreads awaken deeper sub-conscious clarity and life direction.',
    excerptHi: 'मेजर अरकाना के प्रतीकों को समझें और जानें कि टैरो स्प्रेड्स अवचेतन मन की स्पष्टता एवं जीवन को सही दिशा कैसे प्रदान करते हैं।',
    category: 'Tarot Wisdom',
    categoryHi: 'टैरो ज्ञान',
    author: 'Madhuri Dubey',
    authorHi: 'माधुरी दुबे',
    date: 'Oct 08, 2026',
    dateHi: '08 अक्टूबर, 2026',
    readTime: '5 min read',
    readTimeHi: '5 मिनट पठन',
    image: '/services/consultation.jpg',
  },
  {
    id: 'gemstone-science-chakras',
    title: 'Vedic Gemstone Therapy: Selecting the Right Stone for Your Kundli',
    titleHi: 'वैदिक रत्न चिकित्सा: अपनी जन्म कुंडली के अनुसार सही रत्न का चयन',
    excerpt: 'Why natural unheated gemstones emit bio-magnetic frequencies that align specific planetary houses and revitalize physical and mental vitality.',
    excerptHi: 'प्राकृतिक शुद्ध रत्न ब्रह्मांडीय किरणों को अवशोषित कर कुंडली के दुर्बल ग्रहों को बलवान बनाते हैं और शारीरिक व मानसिक ऊर्जा का संचार करते हैं।',
    category: 'Remedies & Gems',
    categoryHi: 'रत्न एवं उपाय',
    author: 'Acharya Sourabh Swami',
    authorHi: 'आचार्य सौरभ स्वामी',
    date: 'Sep 29, 2026',
    dateHi: '29 सितंबर, 2026',
    readTime: '7 min read',
    readTimeHi: '7 मिनट पठन',
    image: '/services/gemstones.jpg',
  },
];

export const BlogSection: React.FC = () => {
  const { t, language } = useLanguage();
  return (
    <section id="blog" className="relative w-full bg-[#FAF7F2] py-20 lg:py-24 px-4 sm:px-6 lg:px-12 overflow-hidden selection:bg-amber-400">
      
      {/* Background Mandala Watermark */}
      <img
        src="/ornaments/clean_yantra.png"
        alt="Watermark"
        className="absolute top-1/2 -left-32 -translate-y-1/2 w-80 sm:w-[440px] h-auto object-contain pointer-events-none opacity-15 select-none"
      />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Section Header (Centered) */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#4A151B] leading-tight">
            {t('Blogs & Articles', 'ब्लॉग एवं लेख')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl mx-auto">
            {t(
              'Sacred Vedic wisdom, planetary insights, and spiritual practices written by Varanasi Acharyas.',
              'काशी के विद्वान आचार्यों द्वारा रचित पावन वैदिक ज्ञान, ग्रह-नक्षत्र विचार एवं आध्यात्मिक लेख।'
            )}
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((post) => {
            const title = language === 'hi' ? post.titleHi : post.title;
            const excerpt = language === 'hi' ? post.excerptHi : post.excerpt;
            const category = language === 'hi' ? post.categoryHi : post.category;
            const author = language === 'hi' ? post.authorHi : post.author;
            const date = language === 'hi' ? post.dateHi : post.date;
            const readTime = language === 'hi' ? post.readTimeHi : post.readTime;

            return (
              <article
                key={post.id}
                className="rounded-3xl overflow-hidden bg-white/85 border border-amber-200/80 shadow-md hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Image with Category Badge */}
                <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-stone-100">
                  <img
                    src={post.image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#800000] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>{readTime}</span>
                    </div>

                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2A1810] group-hover:text-[#800000] transition-colors leading-snug">
                      {title}
                    </h3>

                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                      {excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                      {category}
                    </span>
                    <Link
                      href={`/blog?id=${post.id}`}
                      className="px-4 py-1.5 rounded-full bg-[#800000] hover:bg-[#600000] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 group-hover:gap-2"
                    >
                      <span>{t('Read Full Article', 'सम्पूर्ण लेख पढ़ें')}</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Explore All Blogs Button Shifted Below Cards */}
        <div className="text-center pt-2 sm:pt-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#5B0D15] via-[#73121D] to-[#480A10] hover:from-[#73121D] hover:to-[#5B0D15] text-amber-100 font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/25 hover:scale-105 transition-all duration-200 border border-amber-300/40 cursor-pointer group"
          >
            <span>{t('Explore All Blogs', 'सभी ब्लॉग पढ़ें')}</span>
            <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>

    </section>
  );
};
