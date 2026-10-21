'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import { Sparkles, X, Eye, Calendar, MapPin, Award, Filter, Flame } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface GalleryItem {
  id: string;
  title: string;
  titleHi: string;
  category: 'pooja' | 'consultation' | 'yantra' | 'awards' | 'kashi';
  categoryLabel: string;
  categoryLabelHi: string;
  image: string;
  location: string;
  locationHi: string;
  date: string;
  dateHi: string;
  description: string;
  descriptionHi: string;
}

export default function GalleryPage() {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: '1',
      title: 'Grand Shat Chandi Maha Yagya & Sacred Havan',
      titleHi: 'काशी विश्वनाथ में भव्य शतचंडी महायज्ञ एवं पावन हवन',
      category: 'pooja',
      categoryLabel: 'Sacred Poojas & Havan',
      categoryLabelHi: 'वैदिक पूजा व महाहवन',
      image: '/gallery/IMG_2542.jpg',
      location: 'Dashashwamedh Sanctum, Varanasi',
      locationHi: 'दशाश्वमेध घाट, वाराणसी',
      date: 'Vasant Navratri Muhurta',
      dateHi: 'चैत्र वसंत नवरात्रि मुहूर्त',
      description: 'Dr. Pandit Vishal Dubey presiding over a consecrated Vedic Havan along with initiated pandits and seeker families.',
      descriptionHi: 'विश्व शांति एवं यजमान कल्याण हेतु 11 दीक्षित वैदिक आचार्यों द्वारा दुर्गा सप्तशती के संपुटित पाठ एवं महाहवन।',
    },
    {
      id: '2',
      title: 'National Media & TV Discourses (ETV Bharat & Hindustan Mail)',
      titleHi: 'राष्ट्रीय समाचार चैनलों पर डॉ. विशाल दुबे जी की ज्योतिष परिचर्चा',
      category: 'consultation',
      categoryLabel: 'Vedic Consultations',
      categoryLabelHi: 'वैदिक ज्योतिष परामर्श',
      image: '/gallery/IMG_2537.jpg',
      location: 'National Broadcast Studios (ETV Bharat & Prime Talk)',
      locationHi: 'राष्ट्रीय प्रसारण स्टूडियो (ईटीवी भारत एवं प्राइम टॉक)',
      date: 'Televised Special Series',
      dateHi: 'विशेष टीवी प्रसारण श्रृंखला',
      description: 'Gold Medalist Dr. Pandit Vishal Dubey (AstroVD) unraveling horoscope configurations and prescribing targeted planetary remedies on national television.',
      descriptionHi: 'स्वर्ण पदक विजेता डॉ. पंडित विशाल दुबे (AstroVD) द्वारा कुंडली विश्लेषण एवं शास्त्रोक्त सटीक उपायों का प्रत्यक्ष निरूपण।',
    },
    {
      id: '3',
      title: 'Grand Temple Anushthan at Sacred Kashi Vishwanath Sanctum',
      titleHi: 'श्री काशी विश्वनाथ पावन परिक्षेत्र में भव्य वैदिक अनुष्ठान',
      category: 'kashi',
      categoryLabel: 'Temple Anushthan & Varanasi',
      categoryLabelHi: 'काशी अनुष्ठान व देवालय',
      image: '/gallery/WhatsApp-Image-2024-09-30-at-5.31.21-PM-2-1024x682.jpeg',
      location: 'Kashi Vishwanath Corridor, Varanasi',
      locationHi: 'श्री काशी विश्वनाथ कॉरिडोर, वाराणसी',
      date: 'Mahashivratri & Navratri Mahotsav',
      dateHi: 'महाशिवरात्रि एवं नवरात्र महोत्सव',
      description: 'Sacred Rudrabhishek oblations and high-energy Vedic peace mantras in the holy corridor of Varanasi.',
      descriptionHi: 'द्वादश ज्योतिर्लिंग काशी विश्वनाथ की पुण्यधरा पर रुद्राभिषेक एवं नवग्रह शांति का दिव्य शास्त्रीय अनुष्ठान।',
    },
    {
      id: '4',
      title: 'Honored with Jyotishacharya National Title & Accreditations',
      titleHi: 'अखिल भारतीय स्तर पर \'ज्योतिषाचार्य\' मानद उपाधि से अलंकृत',
      category: 'awards',
      categoryLabel: 'Honors & Certifications',
      categoryLabelHi: 'राष्ट्रीय सम्मान एवं पुरस्कार',
      image: '/gallery/WhatsApp-Image-2024-02-01-at-2.28.35-PM-1024x768.jpeg',
      location: 'National Convention of Astrological Sciences',
      locationHi: 'राष्ट्रीय ज्योतिष विज्ञान महाधिवेशन',
      date: 'Annual Convocation Honor',
      dateHi: 'वार्षिक दीक्षांत समारोह',
      description: 'Conferral of the prestigious Jyotishacharya title recognizing Dr. Vishal Dubey’s groundbreaking predictive research and doctorate.',
      descriptionHi: 'चिकित्सा ज्योतिष एवं भविष्यसूचक फलित में अप्रतिम शोध हेतु डॉ. विशाल दुबे जी को सर्वोच्च ज्योतिषाचार्य उपाधि प्रदान की गई।',
    },
    {
      id: '5',
      title: 'Holy Ganga Ghats Maha Aarti & Vedic Consecration',
      titleHi: 'दशाश्वमेध पावन गंगा तट पर महाआरती एवं वैदिक संकल्प',
      category: 'kashi',
      categoryLabel: 'Temple Anushthan & Varanasi',
      categoryLabelHi: 'काशी अनुष्ठान व देवालय',
      image: '/gallery/WhatsApp-Image-2024-03-07-at-2.31.04-PM-1024x768.jpeg',
      location: 'Dashashwamedh & Assi Ghats, Kashi',
      locationHi: 'दशाश्वमेध एवं अस्सी घाट, काशी',
      date: 'Dev Deepawali & Ganga Mahotsav',
      dateHi: 'देव दीपावली एवं गंगा महोत्सव',
      description: 'Divine Ganga Aarti oblations and personalized sankalp conducted for seeker prosperity, health, and liberation from karmic debts.',
      descriptionHi: 'पतित पावनी मां गंगा के तट पर जातकों के सुख, शांति व पितृदोष शांति हेतु संपन्न महाआरती एवं संकल्प।',
    },
    {
      id: '6',
      title: 'Navgrah Shanti Havan & Vedic Purnahuti Ahuti',
      titleHi: 'नवग्रह शांति महायज्ञ एवं पूर्णाहूति आहुतियां',
      category: 'pooja',
      categoryLabel: 'Sacred Poojas & Havan',
      categoryLabelHi: 'वैदिक पूजा व महाहवन',
      image: '/gallery/IMG_2546.jpg',
      location: 'Vedic Yagyashala Mandap, Varanasi',
      locationHi: 'वैदिक यज्ञशाला मंडप, वाराणसी',
      date: 'Navgrah Parva Muhurta',
      dateHi: 'नवग्रह पर्व मुहूर्त',
      description: 'Offering the supreme final oblation (Purnahuti) to the sacred fire invoking blessings of Surya, Chandra, Mangal, and all nine cosmic forces.',
      descriptionHi: 'समस्त नवग्रहों की अनुकूलता हेतु विधि-सम्मत समिधा एवं शुद्ध घृत के साथ पवित्र अग्नि में पूर्णाहूति अर्पण।',
    },
    {
      id: '7',
      title: 'Assembly of Eminent Vedic Scholars & Astrologers',
      titleHi: 'विद्वत वैदिक आचार्यों एवं ज्योतिषाचार्यों का विशिष्ट समागम',
      category: 'awards',
      categoryLabel: 'Honors & Certifications',
      categoryLabelHi: 'राष्ट्रीय सम्मान एवं पुरस्कार',
      image: '/gallery/WhatsApp-Image-2024-02-08-at-3.31.41-PM-2-1024x768.jpeg',
      location: 'Shree Kashi Vidwat Parishad',
      locationHi: 'श्री काशी विद्वत परिषद, वाराणसी',
      date: 'Vedic Wisdom Symposium',
      dateHi: 'वैदिक ज्ञान विचार संगोष्ठी',
      description: 'Scholarly discourse with respected Acharyas and Vedic scholars discussing authentic horoscope calculations and Siddhanta Jyotish.',
      descriptionHi: 'सिद्धांत ज्योतिष, मुहूर्तमार्तण्ड एवं पंचांग गणना पर वरिष्ठ ज्योतिषाचार्यों के साथ गहन विचार-विमर्श एवं मंथन।',
    },
    {
      id: '8',
      title: 'Grand Shat Chandi & Rudrabhishek Yagya Mandap',
      titleHi: 'भव्य शतचंडी एवं रुद्राभिषेक महायज्ञ मंडप दर्शन',
      category: 'pooja',
      categoryLabel: 'Sacred Poojas & Havan',
      categoryLabelHi: 'वैदिक पूजा व महाहवन',
      image: '/gallery/IMG_2547.jpg',
      location: 'Dashashwamedh Mandap, Varanasi',
      locationHi: 'दशाश्वमेध मंडप, वाराणसी',
      date: 'Chaitra Vasant Navratri',
      dateHi: 'चैत्र वसंत नवरात्रि',
      description: 'The sanctified sacrificial altar where sacred oblations are offered with Vedic mantras for seeker protection and planetary peace.',
      descriptionHi: 'वैदिक मंत्रोच्चार और असीम सकारात्मक ऊर्जा से प्रदीप्त पावन यज्ञवेदी जहां समस्त विघ्नों के निवारण हेतु आहुतियां दी जाती हैं।',
    },
    {
      id: '9',
      title: 'Consecration of Sacred Yantras & Gemstones',
      titleHi: 'सिद्ध श्री यंत्र एवं नवग्रह रत्नों का प्राण-प्रतिष्ठा पूजन',
      category: 'yantra',
      categoryLabel: 'Yantras & Gemstones',
      categoryLabelHi: 'सिद्ध यंत्र एवं रत्न',
      image: '/gallery/IMG_2545.jpg',
      location: 'Vedic Yagyashala Altar, Kashi',
      locationHi: 'वैदिक यज्ञशाला वेदी, काशी',
      date: 'Akshaya Tritiya Muhurta',
      dateHi: 'अक्षय तृतीया पावन मुहूर्त',
      description: 'Pran Pratishtha oblations and Beej Mantras infusing celestial energy into sacred geometric Shree Yantras and certified gemstones.',
      descriptionHi: 'वैदिक सूक्तों एवं बीज मंत्रों द्वारा श्री यंत्रों एवं रत्नों में सकारात्मक दैवीय ऊर्जा का संचार।',
    },
    {
      id: '10',
      title: 'Vedic Rituals on the Holy Banks of the Ganges',
      titleHi: 'काशी में गंगा तट पर वैदिक मंत्रोच्चार व अनुष्ठान',
      category: 'kashi',
      categoryLabel: 'Temple Anushthan & Varanasi',
      categoryLabelHi: 'काशी अनुष्ठान व देवालय',
      image: '/gallery/WhatsApp-Image-2024-03-07-at-2.31.00-PM-1-1024x768.jpeg',
      location: 'Kashi Vishwanath Ghats',
      locationHi: 'काशी विश्वनाथ घाट',
      date: 'Pavitra Snan Muhurta',
      dateHi: 'पवित्र स्नान व अर्घ्य मुहूर्त',
      description: 'Devotee sankalp and Vedic oblations performed at the water’s edge in Varanasi for generational karma healing.',
      descriptionHi: 'काशी के पावन घाटों पर पितृ शांति, कुल दोष निवारण एवं नवग्रह अनुकूलता हेतु संकल्प।',
    },
    {
      id: '11',
      title: 'Scholarly Jyotish Conclave & Research Felicitation',
      titleHi: 'राष्ट्रीय फलित ज्योतिष शोध संगोष्ठी एवं प्रशस्ति पत्र',
      category: 'awards',
      categoryLabel: 'Honors & Certifications',
      categoryLabelHi: 'राष्ट्रीय सम्मान एवं पुरस्कार',
      image: '/gallery/WhatsApp-Image-2024-02-01-at-2.28.52-PM-1-1024x768.jpeg',
      location: 'Maharishi Vedic Institute Altar',
      locationHi: 'महर्षि वैदिक शोध संस्थान',
      date: 'National Astrology Summit',
      dateHi: 'राष्ट्रीय ज्योतिष शिखर सम्मेलन',
      description: 'Accreditation ceremony honoring Dr. Vishal Dubey’s contribution to Vedic astrology literature and research.',
      descriptionHi: 'वैदिक ज्योतिष के पुनरुद्धार एवं वैज्ञानिक व्याख्या हेतु विशिष्ट प्रशस्ति पत्र प्रदान।',
    },
    {
      id: '12',
      title: 'Holy Yagyashala Agnihotra & Purnahuti Consecration',
      titleHi: 'नित्य अग्निहोत्र एवं महायज्ञ पूर्णाहुति वेदी दर्शन',
      category: 'pooja',
      categoryLabel: 'Sacred Poojas & Havan',
      categoryLabelHi: 'वैदिक पूजा व महाहवन',
      image: '/gallery/WhatsApp-Image-2024-09-30-at-5.32.28-PM-1024x576.jpeg',
      location: 'Shree Ganesh Vidyapith Sanctum',
      locationHi: 'श्री गणेश विद्यापीठ आश्रम, काशी',
      date: 'Daily Bramha Muhurta',
      dateHi: 'नित्य ब्रह्म मुहूर्त',
      description: 'Continuous sacred sacrificial fire purifying the atmospheric ether with sacred samidha, herbs, and cow ghee offerings.',
      descriptionHi: 'शुद्ध गौघृत, समिधा एवं दुर्लभ औषधियों से वातावरण की नकारात्मक ऊर्जा का शमन करने वाली पावन यज्ञ अग्नि।',
    },
  ];

  const categories = [
    { id: 'all', label: t('All Moments (12)', 'सभी छायाचित्र (12)') },
    { id: 'pooja', label: t('Sacred Poojas & Havan', 'वैदिक पूजा व महाहवन') },
    { id: 'consultation', label: t('Vedic Consultations', 'वैदिक ज्योतिष परामर्श') },
    { id: 'yantra', label: t('Yantras & Gemstones', 'सिद्ध यंत्र एवं रत्न') },
    { id: 'awards', label: t('Honors & Certifications', 'राष्ट्रीय सम्मान व उपाधियां') },
    { id: 'kashi', label: t('Temple Anushthan', 'काशी विश्वनाथ अनुष्ठान') },
  ];

  const filtered = galleryItems.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-hidden selection:bg-amber-400">
      <Navbar />

      <PageHeader
        breadcrumb={t('Sacred Gallery', 'पावन छायाचित्र दीर्घा')}
        title={t('Celestial Gallery & Sacred Memories', 'पावन वैदिक अनुष्ठान एवं छायाचित्र दीर्घा')}
        subtitle={t(
          'Visual glimpses of holy yagyas, temple consecrations, Vedic awards, and consultations presided over by Dr. Pandit Vishal Dubey (AstroVD).',
          'पूज्य डॉ. पंडित विशाल दुबे (AstroVD) के सानिध्य में संपन्न हुए पावन यज्ञों, प्राण-प्रतिष्ठा, राष्ट्रीय पुरस्कारों एवं परामर्शों की दिव्य झलकियां।'
        )}
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
          {filtered.map((item) => {
            const title = language === 'hi' ? item.titleHi : item.title;
            const catLabel = language === 'hi' ? item.categoryLabelHi : item.categoryLabel;
            const desc = language === 'hi' ? item.descriptionHi : item.description;
            const location = language === 'hi' ? item.locationHi : item.location;
            const date = language === 'hi' ? item.dateHi : item.date;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="group relative rounded-3xl overflow-hidden bg-white border border-stone-200/90 shadow-md hover:shadow-2xl hover:border-amber-400 transition-all duration-500 cursor-pointer flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-stone-100">
                  <img
                    src={item.image}
                    alt={title}
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
                    ✦ {catLabel}
                  </div>
                </div>

                {/* Bottom Card Information */}
                <div className="p-5 sm:p-6 space-y-2.5 bg-white">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2A1810] group-hover:text-[#5B0D15] transition-colors leading-snug">
                    {title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {desc}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="truncate max-w-[140px]">{location}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{date}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
                alt={language === 'hi' ? selectedImage.titleHi : selectedImage.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#5B0D15] text-amber-200 text-xs font-bold tracking-wide">
                ✦ {language === 'hi' ? selectedImage.categoryLabelHi : selectedImage.categoryLabel}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-3">
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2A1810]">
                {language === 'hi' ? selectedImage.titleHi : selectedImage.title}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pb-2 border-b border-amber-200">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  {language === 'hi' ? selectedImage.locationHi : selectedImage.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  {language === 'hi' ? selectedImage.dateHi : selectedImage.date}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {language === 'hi' ? selectedImage.descriptionHi : selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
