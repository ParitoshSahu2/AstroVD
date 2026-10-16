'use client';

import React, { useState } from 'react';
import { Star, Quote, CheckCircle2, MessageSquare, ThumbsUp } from 'lucide-react';

interface FeedbackItem {
  id: string;
  name: string;
  city: string;
  country: string;
  rating: number;
  review: string;
  service: string;
  date: string;
}

const feedbacks: FeedbackItem[] = [
  {
    id: '1',
    name: 'Rajesh & Meenakshi Iyer',
    city: 'Dubai',
    country: 'UAE',
    rating: 5,
    review:
      'Dr. Pandit Vishal Dubey’s Kundli Milan analysis for our daughter was extraordinarily deep. He accurately pinpointed planetary dasha periods and guided us with simple, auspicious remedies. Highly recommended worldwide!',
    service: 'Kundli Milan & Marriage Guidance',
    date: '2 weeks ago',
  },
  {
    id: '2',
    name: 'Siddharth Varma',
    city: 'Sydney',
    country: 'Australia',
    rating: 5,
    review:
      'Madhuri Ji’s intuitive tarot session provided unprecedented clarity during a pivotal career crossroads. Her predictions and spiritual counsel were precise and profoundly reassuring.',
    service: 'Tarot Consultation with Madhuri Ji',
    date: '1 month ago',
  },
  {
    id: '3',
    name: 'Pooja Agarwal',
    city: 'Mumbai',
    country: 'India',
    rating: 5,
    review:
      'We had the Maha Mrityunjaya and Navgrah Shanti Havan conducted through AstroVD. The pandits followed complete Vedic protocols with pure devotion. The peace we felt was immediate.',
    service: 'Vedic Yagya & Pooja Rituals',
    date: '3 weeks ago',
  },
  {
    id: '4',
    name: 'Vikram Malhotra',
    city: 'London',
    country: 'UK',
    rating: 5,
    review:
      'The Tiger Eye Bracelet and Yellow Sapphire recommended according to my Janam Kundli arrived with lab certification. The vibrational shift and focus in my business have been incredible.',
    service: 'Energized Gemstones & Astro Store',
    date: 'Recently',
  },
];

export const FeedbackSection: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormOpen(false);
      setNewName('');
      setNewCity('');
      setNewReview('');
    }, 2500);
  };

  return (
    <section id="feedback" className="relative w-full bg-[#FAF7F2] py-20 lg:py-24 px-4 sm:px-6 lg:px-12 overflow-hidden selection:bg-amber-400">
      
      {/* Background Watermark */}
      <img
        src="/ornaments/clean_mandala.png"
        alt="Watermark"
        className="absolute top-1/2 -right-32 -translate-y-1/2 w-80 sm:w-[440px] h-auto object-contain pointer-events-none opacity-15 select-none"
      />

      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-14 relative z-10">
        
        {/* Section Header with Overall Rating Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-amber-200/60 pb-6">
          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-bold tracking-[0.22em] text-[#800000] uppercase block">
              SEEKER TESTIMONIALS &amp; REVIEWS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#4A151B] leading-tight">
              Trusted by 50,000+ Seekers Worldwide
            </h2>
          </div>

          <div className="flex items-center gap-4 bg-white/90 backdrop-blur-md p-3.5 px-5 rounded-3xl border border-amber-300/80 shadow-md self-start md:self-auto">
            <div className="text-3xl font-serif font-bold text-amber-800">
              4.9
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-[11px] text-stone-600 font-medium mt-0.5">
                Based on 15,000+ Verified Reviews
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {feedbacks.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white/90 border border-amber-200/80 shadow-md hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {item.date}
                  </span>
                </div>

                <p className="text-xs sm:text-[13px] text-stone-700 italic leading-relaxed">
                  &ldquo;{item.review}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-sm text-[#2A1810]">
                    {item.name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-[11px] text-stone-500">
                  {item.city}, {item.country}
                </div>
                <div className="text-[10px] font-semibold text-amber-800 pt-0.5">
                  {item.service}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Review CTA Strip */}
        <div className="text-center pt-2">
          {!formOpen ? (
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white hover:bg-amber-50 border border-amber-300 text-stone-800 hover:text-[#5B0D15] text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-amber-700" />
              <span>Share Your Spiritual Consultation Experience</span>
            </button>
          ) : (
            <div className="max-w-xl mx-auto rounded-3xl bg-white p-6 sm:p-8 border border-amber-300 shadow-xl text-left animate-fadeIn space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#2A1810]">
                Write Your Feedback
              </h3>

              {submitted ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-bold">
                  ✓ Thank you for sharing your sacred experience with AstroVD!
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="City / Country"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your consultation or pooja ritual experience..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-stone-600 font-medium mr-2">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-amber-500 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-4 h-4 ${star <= newRating ? 'fill-current' : 'text-stone-300'}`} />
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormOpen(false)}
                        className="px-4 py-2 rounded-xl text-stone-500 text-xs hover:bg-stone-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-white font-bold text-xs shadow-md"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

      </div>

    </section>
  );
};
