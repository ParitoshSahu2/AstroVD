'use client';

import React, { useState } from 'react';
import { Star, Quote, CheckCircle2, MessageSquare, ThumbsUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FeedbackItem {
  id: string;
  name: string;
  city: string;
  cityHi?: string;
  country: string;
  countryHi?: string;
  rating: number;
  review: string;
  reviewHi: string;
  service: string;
  serviceHi: string;
  date: string;
  dateHi: string;
}

const feedbacks: FeedbackItem[] = [
  {
    id: '1',
    name: 'Rajesh & Meenakshi Iyer',
    city: 'Dubai',
    cityHi: 'दुबई',
    country: 'UAE',
    countryHi: 'यूएई',
    rating: 5,
    review:
      'Dr. Pandit Vishal Dubey’s Kundli Milan analysis for our daughter was extraordinarily deep. He accurately pinpointed planetary dasha periods and guided us with simple, auspicious remedies. Highly recommended worldwide!',
    reviewHi:
      'हमारी सुपुत्री के लिए डॉ. पंडित विशाल दुबे जी का कुंडली मिलान एवं ग्रह गोचर विश्लेषण अत्यंत सटीक और गहरा रहा। उन्होंने दशा काल का अचूक विश्लेषण कर अत्यंत सरल व शास्त्रोक्त उपाय सुझाए। हम हृदय से आभारी हैं!',
    service: 'Kundli Milan & Marriage Guidance',
    serviceHi: 'कुंडली मिलान व विवाह मार्गदर्शन',
    date: '2 weeks ago',
    dateHi: '2 सप्ताह पूर्व',
  },
  {
    id: '2',
    name: 'Siddharth Varma',
    city: 'Sydney',
    cityHi: 'सिडनी',
    country: 'Australia',
    countryHi: 'ऑस्ट्रेलिया',
    rating: 5,
    review:
      'Madhuri Ji’s intuitive tarot session provided unprecedented clarity during a pivotal career crossroads. Her predictions and spiritual counsel were precise and profoundly reassuring.',
    reviewHi:
      'करियर के असमंजस भरे मोड़ पर माधुरी जी का इंट्यूटिव टैरो परामर्श अप्रत्याशित स्पष्टता लेकर आया। उनके द्वारा बताए गए संकेत और आध्यात्मिक मार्गदर्शन अत्यंत सटीक और आत्मबल बढ़ाने वाले रहे।',
    service: 'Tarot Consultation with Madhuri Ji',
    serviceHi: 'माधुरी जी संग टैरो परामर्श',
    date: '1 month ago',
    dateHi: '1 माह पूर्व',
  },
  {
    id: '3',
    name: 'Pooja Agarwal',
    city: 'Mumbai',
    cityHi: 'मुंबई',
    country: 'India',
    countryHi: 'भारत',
    rating: 5,
    review:
      'We had the Maha Mrityunjaya and Navgrah Shanti Havan conducted through AstroVD. The pandits followed complete Vedic protocols with pure devotion. The peace we felt was immediate.',
    reviewHi:
      'हमने AstroVD के माध्यम से महामृत्युंजय एवं नवग्रह शांति हवन संपन्न कराया। काशी के विद्वान आचार्यों ने संपूर्ण वैदिक विधि-विधान और शुद्ध भाव से पूजन किया। घर में अपार शांति का अनुभव हुआ।',
    service: 'Vedic Yagya & Pooja Rituals',
    serviceHi: 'वैदिक यज्ञ एवं पूजा अनुष्ठान',
    date: '3 weeks ago',
    dateHi: '3 सप्ताह पूर्व',
  },
  {
    id: '4',
    name: 'Vikram Malhotra',
    city: 'London',
    cityHi: 'लंदन',
    country: 'UK',
    countryHi: 'यूके',
    rating: 5,
    review:
      'The Tiger Eye Bracelet and Yellow Sapphire recommended according to my Janam Kundli arrived with lab certification. The vibrational shift and focus in my business have been incredible.',
    reviewHi:
      'मेरी जन्म कुंडली के अनुसार सुझाया गया टाइगर आई ब्रेसलेट एवं पीला पुखराज सरकारी लैब प्रमाण-पत्र सहित प्राप्त हुआ। धारण करने के उपरांत व्यापार में एकाग्रता और सकारात्मक ऊर्जा का अद्भुत संचार हुआ।',
    service: 'Energized Gemstones & Astro Store',
    serviceHi: 'प्राण-प्रतिष्ठित रत्न व आध्यात्मिक स्टोर',
    date: 'Recently',
    dateHi: 'हाल ही में',
  },
];

export const FeedbackSection: React.FC = () => {
  const { t, language } = useLanguage();
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
        alt="Mandala"
        className="absolute top-1/2 -left-32 -translate-y-1/2 w-80 sm:w-[450px] h-auto object-contain pointer-events-none opacity-20 select-none"
      />

      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-14 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1 text-amber-700 text-xs font-bold uppercase tracking-widest">
            <Quote className="w-3.5 h-3.5 fill-current" />
            <span>{t('DEVOTEE TESTIMONIALS & EXPERIENCES', 'संतुष्ट जातकों के अनुभव व आशीर्वचन')}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#4A151B] leading-tight">
            {t('Voices of Divine Transformation', 'वैदिक मार्गदर्शन से जीवन में सकारात्मक परिवर्तन')}
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {t(
              'Real words from individuals and families worldwide whose paths have been illuminated by Dr. Pandit Vishal Dubey and the AstroVD spiritual team.',
              'देश-विदेश के उन परिवारों और जातकों के प्रामाणिक अनुभव, जिनके जीवन को पूज्य डॉ. पंडित विशाल दुबे एवं AstroVD ने नई दिशा प्रदान की।'
            )}
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {feedbacks.map((item) => {
            const review = language === 'hi' ? item.reviewHi : item.review;
            const service = language === 'hi' ? item.serviceHi : item.service;
            const city = language === 'hi' && item.cityHi ? item.cityHi : item.city;
            const country = language === 'hi' && item.countryHi ? item.countryHi : item.country;
            const date = language === 'hi' ? item.dateHi : item.date;

            return (
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
                      {date}
                    </span>
                  </div>

                  <p className="text-xs sm:text-[13px] text-stone-700 italic leading-relaxed">
                    &ldquo;{review}&rdquo;
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
                    {city}, {country}
                  </div>
                  <div className="text-[10px] font-semibold text-amber-800 pt-0.5">
                    {service}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Review CTA Strip */}
        <div className="text-center pt-2">
          {!formOpen ? (
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white hover:bg-amber-50 border border-amber-300 text-stone-800 hover:text-[#5B0D15] text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-amber-700" />
              <span>{t('Share Your Spiritual Consultation Experience', 'अपना पावन अनुभव एवं विचार साझा करें')}</span>
            </button>
          ) : (
            <div className="max-w-xl mx-auto rounded-3xl bg-white p-6 sm:p-8 border border-amber-300 shadow-xl text-left animate-fadeIn space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#2A1810]">
                {t('Write Your Feedback', 'अपना अनुभव लिखें')}
              </h3>

              {submitted ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-bold">
                  ✓ {t('Thank you for sharing your sacred experience with AstroVD!', 'AstroVD के साथ अपना पावन अनुभव साझा करने के लिए धन्यवाद!')}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder={t('Your Name', 'आपका नाम')}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder={t('City / Country', 'शहर / देश')}
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <textarea
                    required
                    rows={3}
                    placeholder={t('Describe your consultation or pooja ritual experience...', 'अपने ज्योतिष परामर्श अथवा पूजा अनुष्ठान का अनुभव बताएं...')}
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-stone-600 font-medium mr-2">{t('Rating:', 'रेटिंग:')}</span>
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
                        {t('Cancel', 'रद्द करें')}
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-[#5B0D15] hover:bg-[#480a11] text-white font-bold text-xs shadow-md"
                      >
                        {t('Submit Review', 'समीक्षा भेजें')}
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
