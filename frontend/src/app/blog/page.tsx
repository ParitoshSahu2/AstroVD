'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { Calendar, Clock, ArrowRight, Search, Filter, BookOpen, X, Share2, Sparkles, User, MessageCircle } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  image: string;
  excerpt: string;
  content: string[];
  keyTakeaways: string[];
}

const allArticles: BlogPost[] = [
  {
    id: 'planetary-transits-2026',
    title: 'Major Planetary Transits of 2026: Navigating Jupiter and Saturn’s Cosmic Shift',
    category: 'Vedic Jyotish',
    author: 'Dr. Pandit Vishal Dubey',
    authorRole: 'PhD, Jyotishacharya',
    date: 'Oct 14, 2026',
    readTime: '6 min read',
    image: '/services/kundli.jpg',
    excerpt: 'Detailed overview of Jupiter transiting into Cancer and Saturn moving across Pisces, bringing immense opportunities for spiritual transformation and financial realignment.',
    content: [
      'In Vedic Astrology, planetary transits (Gochar) act as cosmic catalysts that activate the dormant promises inscribed in your Janam Kundli. As we advance through 2026, Jupiter (Brihaspati) occupies its exalted sign of Cancer, radiating benevolence, higher learning, and domestic peace.',
      'Simultaneously, Saturn (Shani Dev) traversing through the water element of Pisces invites deep introspection, karmic settlements, and spiritual grounding. Those experiencing Sade Sati or Kantaka Shani will find this an auspicious time for charitable service, mantra sadhana, and rectifying past life imbalances.',
      'To harness this harmonious frequency, chant the Brihaspati Beej Mantra (ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः) on Thursdays and perform regular Shani Tailabhishek on Saturdays.',
    ],
    keyTakeaways: [
      'Jupiter in Cancer blesses genuine spiritual seekers and family expansion.',
      'Saturn in Pisces dissolves rigid ego structures, calling for surrender and patience.',
      'Wearing natural Yellow Sapphire (Pukhraj) or Blue Sapphire should only follow birth chart verification.',
    ],
  },
  {
    id: 'tarot-wisdom-intuitive-guide',
    title: 'The Language of the Cards: How Intuitive Tarot Bridges Past, Present & Future',
    category: 'Tarot Wisdom',
    author: 'Madhuri Dubey',
    authorRole: 'Tarot Card Reader & Spiritual Guide',
    date: 'Oct 11, 2026',
    readTime: '5 min read',
    image: '/services/consultation.jpg',
    excerpt: 'How archetypal symbolism in the Major Arcana activates inner intuition, resolves subconscious anxieties, and provides reassurance during life-altering transitions.',
    content: [
      'Tarot is not fortune-telling; it is a sacred mirror reflecting the unconscious currents of the soul. Each card in the 78-card deck represents an archetype of human consciousness, as mapped by Carl Jung and ancient mystical traditions.',
      'When you ask a question regarding love, career, or spiritual dilemma, the cards drawn mirror your vibrational resonance in that exact moment. They illuminate hidden motives, highlight blindspots, and unveil the highest probable trajectory.',
      'Through compassionate and intuitive readings, you gain the clarity required to make decisions with confidence, shifting fear into grounded purpose.',
    ],
    keyTakeaways: [
      'Tarot clarifies the emotional energy surrounding your present circumstances.',
      'The High Priestess and The Hermit guide inward reflection before outward action.',
      'Combine Tarot insights with Vedic astrology for a 360-degree spiritual compass.',
    ],
  },
  {
    id: 'gemstone-science-frequency',
    title: 'Vedic Gemstone Therapy: Selecting the Precise Optical Crystal for Your Kundli',
    category: 'Remedies & Gems',
    author: 'Acharya Sourabh Swami',
    authorRole: 'Senior Vedic Puja Acharya',
    date: 'Oct 04, 2026',
    readTime: '7 min read',
    image: '/services/gemstones.jpg',
    excerpt: 'Why unheated natural gemstones act as optical prisms capturing planetary cosmic rays and realigning physical, mental, and subtle energy meridians.',
    content: [
      'Ancient Rishis understood that cosmic rays emitted by the nine grahas constantly penetrate the Earth’s atmosphere. When a planet is benefic yet weak in your horoscope, a flawless natural gemstone acts as an optical amplifier, absorbing and channeling that specific wavelength into your biofield.',
      'For instance, natural Ruby transmits cosmic red rays governed by the Sun, vitalizing the heart, spine, and leadership faculties. Emerald channels green rays for Mercury, enhancing intellect, nervous balance, and commercial acumen.',
      'Crucially, synthetic or heat-treated stones lack crystalline vitality. Every gemstone recommended at AstroVD undergoes authentic Varanasi Prana Pratishtha to awaken its celestial dormant force.',
    ],
    keyTakeaways: [
      'Never wear gemstones for Maraka (death-inflicting) or malefic dusthana lords.',
      'Gemstones must touch the skin to transmit photonic cosmic energy.',
      'Purify and energize your stone on its designated ruling weekday at sunrise.',
    ],
  },
  {
    id: 'understanding-mangal-dosh',
    title: 'Understanding Mangal Dosh: Scientific Analysis, Myths & Traditional Remedies',
    category: 'Kundli Milan',
    author: 'Dr. Pandit Vishal Dubey',
    authorRole: 'PhD in Jyotish & Rog',
    date: 'Sep 26, 2026',
    readTime: '8 min read',
    image: '/services/marriage.jpg',
    excerpt: 'Demystifying Mars placement in the 1st, 4th, 7th, 8th, and 12th houses, and traditional Vedic remedies including Kumbh Vivah and Hanuman Upasana.',
    content: [
      'Few astrological terms generate as much unfounded panic as "Manglik Dosha." In classical Jyotish, Mars represents raw vitality, drive, passion, and assertiveness. When placed in houses governing relationship harmony (1st, 4th, 7th, 8th, 12th), its intense fiery nature can create friction if left unchanneled.',
      'However, classical texts enumerate dozens of automatic cancellations (Bhanga), such as Mars residing in its own signs (Aries, Scorpio) or exalted in Capricorn, or receiving the benign aspect of Jupiter.',
      'Where genuine Mangal Dosha exists, proven Vedic remedies such as Ark Vivah or Kumbh Vivah, Bhauma Yagya, and continuous Hanuman Chalisa recitation successfully neutralize disharmony.',
    ],
    keyTakeaways: [
      'Over 60% of perceived Manglik charts have astrological cancellation factors.',
      'Mutual Manglik compatibility neutralizes the energetic disparity between partners.',
      'Pooja and Sankalp performed by learned Acharyas harmonize Martian energy into courage and mutual loyalty.',
    ],
  },
  {
    id: 'power-of-shree-yantra',
    title: 'The Sacred Science of Shree Yantra: Geometry of Infinite Abundance & Peace',
    category: 'Pooja & Rituals',
    author: 'Pandit Ji (Karamkand Specialist)',
    authorRole: 'Shastra Vidhan Expert',
    date: 'Sep 19, 2026',
    readTime: '6 min read',
    image: '/products/prod-pyrite.png',
    excerpt: 'Why the 9 interlocking triangles of the Sri Chakra generate an electromagnetic vortex of Lakshmi energy in homes, offices, and temples.',
    content: [
      'The Shree Yantra (Sri Chakra) is regarded as the queen of all sacred yantras. Composed of nine interlocking triangles that radiate out from the central Bindu point, it represents the union of the Divine Masculine (Shiva) and Divine Feminine (Shakti).',
      'Modern physics verifies that viewing and meditating on this precise sacred geometry synchronizes the left and right hemispheres of the human brain, inducing deep alpha wave states and mental stillness.',
      'Consecrated in your northeastern Ishan corner on a Friday, an energized Maha Meru Shree Yantra clears chronic financial stagnation and protects the dwelling from negative environmental frequencies.',
    ],
    keyTakeaways: [
      'The central Bindu radiates primordial cosmic vibration (Para Shakti).',
      'Daily chanting of Sri Suktam or Kanakadhara Stotra before the Yantra multiplies its energetic radius.',
      'Must be placed facing East or North on clean silk cloth consecrated with chandan.',
    ],
  },
  {
    id: 'aura-scanning-chakra-alignment',
    title: 'Aura Scanning & Subtle Energy Fields: Restoring Vitality Before Disease Manifests',
    category: 'Occult & Healing',
    author: 'Dr. Pandit Vishal Dubey',
    authorRole: 'Certified Hypnotherapist & Rog Specialist',
    date: 'Sep 12, 2026',
    readTime: '7 min read',
    image: '/services/career.jpg',
    excerpt: 'Combining ancient Prana Vidya with electro-photonic aura scanning to identify energetic imbalances and emotional blockages before they manifest physically.',
    content: [
      'Long before any physical disorder manifests in the biological body, it registers as a frequency disturbance in the Pranamaya Kosha (subtle etheric double). Your aura reflects your emotional thoughts, planetary dasha influences, and psychic stress.',
      'Through advanced aura scanning and intuitive pendulum dowsing, we map the rotation, color density, and blockages of the seven major chakras (Muladhara to Sahasrara).',
      'Targeted remedies including gemstone vibration, clinical hypnotherapy, and Rudrabhishek clear negative energy cords, restoring radiant vitality and deep peace.',
    ],
    keyTakeaways: [
      'The human aura extends 1.5 to 3 feet around the physical body.',
      'Chakra blockages directly correspond to planetary afflictions in the horoscope.',
      'Regular meditation, salt-water cleansing, and mantra chanting strengthen your psychic shield.',
    ],
  },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [readingArticle, setReadingArticle] = useState<BlogPost | null>(null);

  const categories = [
    'All',
    'Vedic Jyotish',
    'Tarot Wisdom',
    'Remedies & Gems',
    'Kundli Milan',
    'Pooja & Rituals',
    'Occult & Healing',
  ];

  const filtered = allArticles.filter((a) => {
    const matchCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchQuery =
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      a.author.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  const featured = allArticles[0];

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-hidden selection:bg-amber-400">
      <Navbar />

      <PageHeader
        breadcrumb="Sacred Blogs &amp; Articles"
        title="Vedic Wisdom &amp; Astrological Articles"
        subtitle="Scholarly discourses on Kundali analysis, planetary transits, intuitive Tarot, Vastu energy, and ancient mantra sciences by AstroVD Acharyas."
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16 space-y-12">
        
        {/* Featured Article Hero Banner */}
        {featured && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1C090C] via-[#2D0D12] to-[#1C090C] border-2 border-amber-500/40 shadow-2xl text-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Featured Discourse</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-100 leading-tight">
                  {featured.title}
                </h2>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
                  {featured.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-2">
                  <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <User className="w-3.5 h-3.5" />
                    {featured.author} ({featured.authorRole})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {featured.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {featured.readTime}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setReadingArticle(featured)}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Read Full Discourse</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Image */}
              <div className="lg:col-span-5 h-64 lg:h-full relative overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#1C090C] via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        )}

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-amber-200/80 shadow-md">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles by topic, author, or keyword..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-stone-200 text-xs sm:text-sm text-stone-800 placeholder-stone-400 shadow-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Filter className="w-4 h-4 text-amber-700" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 rounded-full bg-white border border-amber-300 text-xs font-semibold text-stone-800 shadow-sm focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Articles (6)' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#5B0D15] text-white shadow-md'
                  : 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
          {filtered.map((post) => (
            <article
              key={post.id}
              className="rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-md hover:shadow-2xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-stone-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-300/60 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                    ✦ {post.category}
                  </span>
                  <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-stone-200 text-[10px] font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-300" />
                    {post.readTime}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>{post.date}</span>
                    <span>•</span>
                    <span className="font-semibold text-stone-700">{post.author}</span>
                  </div>

                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2A1810] group-hover:text-[#5B0D15] transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-stone-100 flex items-center justify-between bg-stone-50/50">
                <span className="text-[11px] font-semibold text-amber-800">
                  {post.authorRole}
                </span>

                <button
                  onClick={() => setReadingArticle(post)}
                  className="px-4 py-1.5 rounded-full bg-white hover:bg-[#5B0D15] text-[#5B0D15] hover:text-white border border-[#5B0D15] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Read Discourse</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </article>
          ))}
        </div>

      </main>

      {/* Full Article Reading Modal */}
      {readingArticle && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn overflow-y-auto"
          onClick={() => setReadingArticle(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden border-2 border-amber-400 shadow-2xl my-8 text-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-stone-900">
              <img
                src={readingArticle.image}
                alt={readingArticle.title}
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              <button
                onClick={() => setReadingArticle(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-bold text-[10px] uppercase tracking-wider">
                  ✦ {readingArticle.category}
                </span>
                <h2 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-white leading-snug">
                  {readingArticle.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-stone-300">
                  <span>By {readingArticle.author} ({readingArticle.authorRole})</span>
                  <span>•</span>
                  <span>{readingArticle.date}</span>
                  <span>•</span>
                  <span>{readingArticle.readTime}</span>
                </div>
              </div>
            </div>

            {/* Modal Article Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Key Takeaways Box */}
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300/80 space-y-2">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Key Vedic Principles &amp; Insights</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {readingArticle.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-700 text-sm">✦</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Paragraphs */}
              <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
                {readingArticle.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Astrologer Consultation CTA Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1C090C] to-[#3B1E22] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-serif font-bold text-base text-amber-200">
                    Seek Guidance from {readingArticle.author}?
                  </h4>
                  <p className="text-xs text-stone-300">
                    Book a personalized 1-on-1 horoscope or Tarot consultation with our Varanasi peeth.
                  </p>
                </div>
                <a
                  href={`https://wa.me/919826012345?text=Hello%20AstroVD,%20I%20read%20the%20article%20on%20${encodeURIComponent(readingArticle.title)}%20and%20would%20like%20a%20consultation.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-lg flex items-center gap-1.5 shrink-0"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Inquire on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-stone-200 flex justify-end bg-stone-50">
              <button
                onClick={() => setReadingArticle(null)}
                className="px-6 py-2 rounded-full bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
