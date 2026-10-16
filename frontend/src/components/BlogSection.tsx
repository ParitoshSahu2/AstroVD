'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Clock, BookOpen } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
}

const blogs: BlogPost[] = [
  {
    id: 'planetary-transits-2026',
    title: 'Major Planetary Transits of 2026 & Their Impact on Your Zodiac',
    excerpt: 'Explore how Jupiter and Saturn transit cycles will influence career expansions, relationship commitments, and spiritual awakening this year.',
    category: 'Vedic Jyotish',
    author: 'Dr. Pandit Vishal Dubey',
    date: 'Oct 12, 2026',
    readTime: '6 min read',
    image: '/services/kundli.jpg',
  },
  {
    id: 'tarot-intuition-guide',
    title: 'The Language of the Cards: How Intuitive Tarot Bridges Past & Future',
    excerpt: 'Understanding archetypal symbols in the Major Arcana and discovering how tarot spreads awaken deeper sub-conscious clarity and life direction.',
    category: 'Tarot Wisdom',
    author: 'Madhuri Dubey',
    date: 'Oct 08, 2026',
    readTime: '5 min read',
    image: '/services/consultation.jpg',
  },
  {
    id: 'gemstone-science-chakras',
    title: 'Vedic Gemstone Therapy: Selecting the Right Stone for Your Kundli',
    excerpt: 'Why natural unheated gemstones emit bio-magnetic frequencies that align specific planetary houses and revitalize physical and mental vitality.',
    category: 'Remedies & Gems',
    author: 'Acharya Sourabh Swami',
    date: 'Sep 29, 2026',
    readTime: '7 min read',
    image: '/services/gemstones.jpg',
  },
];

export const BlogSection: React.FC = () => {
  return (
    <section id="blog" className="relative w-full bg-[#FAF7F2] py-20 lg:py-24 px-4 sm:px-6 lg:px-12 overflow-hidden selection:bg-amber-400">
      
      {/* Background Mandala Watermark */}
      <img
        src="/ornaments/clean_yantra.png"
        alt="Watermark"
        className="absolute top-1/2 -left-32 -translate-y-1/2 w-80 sm:w-[440px] h-auto object-contain pointer-events-none opacity-15 select-none"
      />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-amber-200/60 pb-6">
          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-bold tracking-[0.22em] text-[#800000] uppercase block">
              VEDIC KNOWLEDGE &amp; ARTICLES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#4A151B] leading-tight">
              Insights for Conscious Living
            </h2>
          </div>

          <Link
            href="/blog"
            className="px-6 py-2.5 rounded-full bg-white/90 hover:bg-amber-50 border border-stone-300 hover:border-amber-400 text-stone-800 hover:text-[#5B0D15] text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Explore All Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((post) => (
            <article
              key={post.id}
              className="rounded-3xl overflow-hidden bg-white/85 border border-amber-200/80 shadow-md hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Image with Category Badge */}
              <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-stone-100">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#800000] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-700" />
                      {post.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-700" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2A1810] group-hover:text-[#800000] transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700">
                    By {post.author}
                  </span>
                  <Link
                    href="/blog"
                    className="text-xs font-bold text-[#800000] hover:text-[#500000] flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Read More</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>

    </section>
  );
};
