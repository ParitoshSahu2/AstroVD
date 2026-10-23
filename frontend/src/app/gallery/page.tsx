'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import {
  Sparkles,
  X,
  Eye,
  Calendar,
  MapPin,
  Award,
  Filter,
  Flame,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
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

const BATCH_SIZE = 9;

export default function GalleryPage() {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // Infinite Scrolling State
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
      description: 'Dr. Pandit Vishal Dubey presiding over a consecrated Vedic Havan along with initiated pandits and devotee families.',
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
      description: 'Divine Ganga Aarti oblations and personalized sankalp conducted for family prosperity, health, and liberation from karmic debts.',
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
      description: 'The sanctified sacrificial altar where sacred oblations are offered with Vedic mantras for divine protection and planetary peace.',
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
    {
      id: '13',
      title: 'Grand Maha Rudrabhishek & Vedic Bilva Patra Archana',
      titleHi: 'भव्य महारुद्राभिषेक एवं वैदिक बिल्वपत्र अर्चन',
      category: 'pooja',
      categoryLabel: 'Sacred Poojas & Havan',
      categoryLabelHi: 'वैदिक पूजा व महाहवन',
      image: '/gallery/IMG_2543.jpg',
      location: 'Kashi Vishwanath Jyotirlinga Dham',
      locationHi: 'काशी विश्वनाथ ज्योतिर्लिंग धाम',
      date: 'Shravan Somwar Muhurta',
      dateHi: 'श्रावण सोमवार पावन मुहूर्त',
      description: 'Consecrated Panchamrit snan and Vedic Rudri path performed with intense spiritual focus for peace and prosperity.',
      descriptionHi: 'पंचामृत स्नान, गंगाजल एवं रुद्री पाठ के साथ देवाधिदेव महादेव का विधिपूर्वक पावन अभिषेक।',
    },
    {
      id: '14',
      title: 'Sacred Navgrah Yantra & Sphatik Shivalinga Prana Pratishtha',
      titleHi: 'सिद्ध नवग्रह यंत्र एवं स्फटिक शिवलिंग प्राण-प्रतिष्ठा',
      category: 'yantra',
      categoryLabel: 'Yantras & Gemstones',
      categoryLabelHi: 'सिद्ध यंत्र एवं रत्न',
      image: '/gallery/IMG_2544.jpg',
      location: 'AstroVD Vedic Sansthan Altar',
      locationHi: 'AstroVD वैदिक संस्थान वेदी',
      date: 'Guru Pushya Nakshatra',
      dateHi: 'गुरु पुष्य नक्षत्र मुहूर्त',
      description: 'Authentic consecration ritual awakening divine energetic currents within geometry-based cosmic yantras.',
      descriptionHi: 'यंत्रराज के वैदिक प्राण-प्रतिष्ठा अनुष्ठान द्वारा ग्रहों की सकारात्मक रश्मियों का संचयन।',
    },
    {
      id: '15',
      title: 'Chandi Path Sampoorna Ahuti & Vedic Brahmin Bhojan',
      titleHi: 'चंडी पाठ संपूर्ण आहुति एवं वैदिक विप्र भोजन',
      category: 'pooja',
      categoryLabel: 'Sacred Poojas & Havan',
      categoryLabelHi: 'वैदिक पूजा व महाहवन',
      image: '/gallery/IMG_2549.jpg',
      location: 'Shree Durga Mandir Sanctum, Kashi',
      locationHi: 'श्री दुर्गा मंदिर परिक्षेत्र, काशी',
      date: 'Sharadiya Navratri Maha Ashtami',
      dateHi: 'शारदीय नवरात्रि महाष्टमी',
      description: 'Holy completion of Durga Saptashati yagya followed by traditional dakshina and satvik anna seva.',
      descriptionHi: 'दुर्गा सप्तशती के संपुटित आहुतियों की पूर्णता के उपरांत वैदिक विद्वानों का सत्कार एवं विप्र भोजन।',
    },
    {
      id: '16',
      title: 'One-on-One Kundli Analysis & Kundli Milan Session',
      titleHi: 'व्यक्तिगत जन्मपत्रिका विश्लेषण एवं कुंडली मिलान',
      category: 'consultation',
      categoryLabel: 'Vedic Consultations',
      categoryLabelHi: 'वैदिक ज्योतिष परामर्श',
      image: '/gallery/IMG_2550.jpg',
      location: 'AstroVD Consultation Chambers, Varanasi',
      locationHi: 'AstroVD परामर्श कक्ष, वाराणसी',
      date: 'Daily Consultation Sessions',
      dateHi: 'दैनिक जातक परामर्श',
      description: 'Dr. Vishal Dubey meticulously reviewing planetary degrees, Dasha periods, and formulating tailored remedial solutions.',
      descriptionHi: 'ग्रह गोचर, विंशोत्तरी दशा एवं वर्ग कुंडलियों के सूक्ष्म अध्ययन से सटीक मार्गदर्शन एवं समाधान।',
    },
    {
      id: '17',
      title: 'In-Depth Astro Vastu & Planetary Consultation',
      titleHi: 'गहन वास्तु ज्योतिष एवं नवग्रह संतुलन विमर्श',
      category: 'consultation',
      categoryLabel: 'Vedic Consultations',
      categoryLabelHi: 'वैदिक ज्योतिष परामर्श',
      image: '/gallery/IMG_2551.jpg',
      location: 'AstroVD Corporate Guidance Suite',
      locationHi: 'AstroVD कॉर्पोरेट विमर्श कक्ष',
      date: 'Shubh Muhurta Consultation',
      dateHi: 'शुभ मुहूर्त परामर्श',
      description: 'Integrating ancient Vastu Shastra principles with birth charts to harmonize residential and business energies.',
      descriptionHi: 'वास्तु दोष निवारण एवं व्यापारिक प्रगति हेतु जन्मपत्रिका आधारित शास्त्रोक्त वास्तु सुधार।',
    },
    {
      id: '18',
      title: 'Gold Medalist & Jyotish Shiromani Honor Convocations',
      titleHi: 'स्वर्ण पदक एवं ज्योतिष शिरोमणि राष्ट्रीय अलंकरण',
      category: 'awards',
      categoryLabel: 'Honors & Certifications',
      categoryLabelHi: 'राष्ट्रीय सम्मान एवं पुरस्कार',
      image: '/gallery/IMG_2283-scaled.jpg',
      location: 'Rashtriya Sanskrit Sansthan Auditorium',
      locationHi: 'राष्ट्रीय संस्कृत संस्थान सभागार',
      date: 'Grand Convocation Ceremony',
      dateHi: 'भव्य दीक्षांत समारोह',
      description: 'Conferral of gold medals in Vedic astrology and lifetime excellence awards by veteran spiritual leaders.',
      descriptionHi: 'वैदिक ज्योतिष के गूढ़ रहस्यों के फलित अनुसंधान हेतु शीर्ष पीठ द्वारा स्वर्ण पदक से सम्मानित।',
    },
    {
      id: '19',
      title: 'All India Astrological Conference Keynote & Felicitations',
      titleHi: 'अखिल भारतीय ज्योतिष महासम्मेलन मुख्य वक्तव्य एवं अभिनंदन',
      category: 'awards',
      categoryLabel: 'Honors & Certifications',
      categoryLabelHi: 'राष्ट्रीय सम्मान एवं पुरस्कार',
      image: '/gallery/WhatsApp-Image-2024-02-08-at-3.31.35-PM-3-1024x473.jpeg',
      location: 'National Vedic Heritage Pavilion',
      locationHi: 'राष्ट्रीय वैदिक धरोहर मंडप',
      date: 'National Research Summit',
      dateHi: 'राष्ट्रीय शोध सम्मेलन',
      description: 'Presenting research on planetary transits and medical astrology to an esteemed panel of researchers.',
      descriptionHi: 'गोचर एवं चिकित्सीय फलित पर शोध पत्र प्रस्तुति तथा विद्वानों द्वारा विशिष्ट सम्मान अर्पण।',
    },
    {
      id: '20',
      title: 'Sacred Manikarnika & Harishchandra Ghat Sankalp',
      titleHi: 'मणिकर्णिका एवं हरिश्चंद्र तीर्थ संकल्प अनुष्ठान',
      category: 'kashi',
      categoryLabel: 'Temple Anushthan & Varanasi',
      categoryLabelHi: 'काशी अनुष्ठान व देवालय',
      image: '/gallery/WhatsApp-Image-2024-03-07-at-2.30.56-PM-1-1024x568.jpeg',
      location: 'Manikarnika Sacred Tirtha, Kashi',
      locationHi: 'मणिकर्णिका पावन तीर्थ, काशी',
      date: 'Moksha Saptami Muhurta',
      dateHi: 'मोक्ष सप्तमी मुहूर्त',
      description: 'Special prayers and spiritual offerings performed at the sacred threshold of liberation in Varanasi.',
      descriptionHi: 'काशी के मोक्ष तीर्थ पर पितरों के उद्धार एवं आध्यात्मिक उन्नति हेतु शास्त्रोक्त संकल्प।',
    },
    {
      id: '21',
      title: 'Divine Shivalinga Abhishek at Kashi Ghats',
      titleHi: 'काशी के पावन तट पर नर्मदेश्वर शिवलिंग अभिषेक',
      category: 'kashi',
      categoryLabel: 'Temple Anushthan & Varanasi',
      categoryLabelHi: 'काशी अनुष्ठान व देवालय',
      image: '/gallery/WhatsApp-Image-2024-03-07-at-2.31.01-PM-2-1024x578.jpeg',
      location: 'Panchganga Ghat, Varanasi',
      locationHi: 'पंचगंगा घाट, वाराणसी',
      date: 'Pradosh Vrat Muhurta',
      dateHi: 'प्रदोष व्रत पावन मुहूर्त',
      description: 'Reciting Shri Rudram while anointing sacred Shivalingam with holy Gangajal, cow milk, and honey.',
      descriptionHi: 'पवित्र गंगाजल, दुग्ध एवं मधु से नर्मदेश्वर शिवलिंग पर श्रीरुद्रपाठ सहित महाअभिषेक।',
    },
    {
      id: '22',
      title: 'Vedic Hawan Agni Pradakshina & Shanti Path',
      titleHi: 'हवन अग्नि प्रदक्षिणा एवं शांति पाठ अनुष्ठान',
      category: 'pooja',
      categoryLabel: 'Sacred Poojas & Havan',
      categoryLabelHi: 'वैदिक पूजा व महाहवन',
      image: '/gallery/WhatsApp-Image-2024-09-30-at-5.32.27-PM-768x1024.jpeg',
      location: 'Kashi Yagya Mandap Sanctum',
      locationHi: 'काशी यज्ञ मंडप गर्भगृह',
      date: 'Purnima Shanti Muhurta',
      dateHi: 'पूर्णिमा शांति मुहूर्त',
      description: 'Devotees performing ceremonial pradakshina around the consecrated sacred fire absorbing cosmic thermal energy.',
      descriptionHi: 'यज्ञवेदी की परिक्रमा एवं शांति पाठ द्वारा वातावरण में सकारात्मक दैवीय ऊर्जा का विस्तार।',
    },
    {
      id: '23',
      title: 'Holy Navratri Durga Saptashati Havan Altar',
      titleHi: 'शारदीय नवरात्रि दुर्गा सप्तशती महायज्ञ वेदी',
      category: 'pooja',
      categoryLabel: 'Sacred Poojas & Havan',
      categoryLabelHi: 'वैदिक पूजा व महाहवन',
      image: '/gallery/WhatsApp-Image-2024-09-30-at-5.32.33-PM-1-1024x683.jpeg',
      location: 'Shree Kashi Annapurna Sthali',
      locationHi: 'श्री काशी अन्नपूर्णा स्थली',
      date: 'Maha Navami Muhurta',
      dateHi: 'महानवमी सिद्धि मुहूर्त',
      description: 'Consecration of the 9 sacred devis with traditional samidha, red flowers, and scented oblations.',
      descriptionHi: 'मां भगवती के नव रूपों की आराधना एवं महायज्ञ में सुख-समृद्धि हेतु वैदिक आहुतियां।',
    },
    {
      id: '24',
      title: 'Deep Aradhana & Mangal Aarti at Sanctum',
      titleHi: 'दीप आराधना एवं मंगल महाआरती दर्शन',
      category: 'pooja',
      categoryLabel: 'Sacred Poojas & Havan',
      categoryLabelHi: 'वैदिक पूजा व महाहवन',
      image: '/gallery/WhatsApp-Image-2024-09-30-at-5.32.34-PM-1024x683.jpeg',
      location: 'Varanasi Sanctum Altar',
      locationHi: 'वाराणसी पावन गर्भगृह',
      date: 'Sandhya Aarti Muhurta',
      dateHi: 'संध्या महाआरती मुहूर्त',
      description: 'Traditional multi-tiered brass lamp aarti dispelling darkness and inviting prosperity into devotees’ lives.',
      descriptionHi: 'पंचप्रदीप आरती एवं वैदिक शंखनाद से समस्त नकारात्मक स्पंदनों का निवारण।',
    },
    {
      id: '25',
      title: 'Vedic Life Path & Career Horoscope Guidance',
      titleHi: 'कैरियर एवं जीवन पथ वैदिक मार्गदर्शन विमर्श',
      category: 'consultation',
      categoryLabel: 'Vedic Consultations',
      categoryLabelHi: 'वैदिक ज्योतिष परामर्श',
      image: '/gallery/WhatsApp-Image-2025-03-20-at-5.48.00-PM-1.jpeg',
      location: 'AstroVD Online & In-Person Studio',
      locationHi: 'AstroVD प्रत्यक्ष एवं ऑनलाइन स्टूडियो',
      date: 'Personal Guidance Session',
      dateHi: 'जातक मार्गदर्शन सत्र',
      description: 'Navigating karmic transitions, Sade Sati phases, and vocational alignments through Prashna and Natal charts.',
      descriptionHi: 'साढ़ेसाती, ढैय्या एवं करियर के उतार-चढ़ाव में ग्रहों की शांति हेतु व्यक्तिगत परामर्श।',
    },
    {
      id: '26',
      title: 'Consecrated Kuber Yantra & Parad Gutika Puja',
      titleHi: 'सिद्ध कुबेर धनवर्धक यंत्र एवं पारद गुटिका पूजन',
      category: 'yantra',
      categoryLabel: 'Yantras & Gemstones',
      categoryLabelHi: 'सिद्ध यंत्र एवं रत्न',
      image: '/gallery/WhatsApp-Image-2025-03-20-at-5.48.02-PM-1-776x1024.jpeg',
      location: 'Vedic Yagyashala Mandir Altar',
      locationHi: 'वैदिक यज्ञशाला मंदिर वेदी',
      date: 'Dhanteras & Diwali Muhurta',
      dateHi: 'धनतेरस एवं दीपावली मुहूर्त',
      description: 'Energizing high-frequency copper and gold-plated yantras to stabilize household financial harmony.',
      descriptionHi: 'धन-धान्य एवं लक्ष्मी कृपा प्राप्ति हेतु कुबेर यंत्र का विधि-विधान पूर्वक वैदिक अभिमंत्रण।',
    },
    {
      id: '27',
      title: 'Sacred Ganga Jal Tarpan & Pitru Shanti Anushthan',
      titleHi: 'पवित्र गंगाजल तर्पण एवं पितृदोष शांति अनुष्ठान',
      category: 'kashi',
      categoryLabel: 'Temple Anushthan & Varanasi',
      categoryLabelHi: 'काशी अनुष्ठान व देवालय',
      image: '/gallery/WhatsApp-Image-2025-03-20-at-5.48.03-PM-2-776x1024.jpeg',
      location: 'Kedar Ghat Holy Confluence, Varanasi',
      locationHi: 'केदार घाट, काशी तीर्थ',
      date: 'Pitru Paksha Amavasya',
      dateHi: 'पितृ पक्ष सर्वपितृ अमावस्या',
      description: 'Performing traditional sesame, kusha, and holy water oblations honoring ancestors along the divine Ganga.',
      descriptionHi: 'तिल, कुश एवं गंगाजल से पितृ तर्पण एवं कुल-वृद्धि हेतु वैदिक शांति अनुष्ठान।',
    },
  ];

  const categories = [
    {
      id: 'all',
      labelEn: 'All Moments',
      labelHi: 'सभी छायाचित्र',
      count: galleryItems.length,
    },
    {
      id: 'pooja',
      labelEn: 'Sacred Poojas & Havan',
      labelHi: 'वैदिक पूजा व महाहवन',
      count: galleryItems.filter((i) => i.category === 'pooja').length,
    },
    {
      id: 'consultation',
      labelEn: 'Vedic Consultations',
      labelHi: 'वैदिक ज्योतिष परामर्श',
      count: galleryItems.filter((i) => i.category === 'consultation').length,
    },
    {
      id: 'yantra',
      labelEn: 'Yantras & Gemstones',
      labelHi: 'सिद्ध यंत्र एवं रत्न',
      count: galleryItems.filter((i) => i.category === 'yantra').length,
    },
    {
      id: 'awards',
      labelEn: 'Honors & Certifications',
      labelHi: 'राष्ट्रीय सम्मान व उपाधियां',
      count: galleryItems.filter((i) => i.category === 'awards').length,
    },
    {
      id: 'kashi',
      labelEn: 'Temple Anushthan',
      labelHi: 'काशी विश्वनाथ अनुष्ठान',
      count: galleryItems.filter((i) => i.category === 'kashi').length,
    },
  ];

  // Filtered collection based on active category
  const filtered = galleryItems.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  // Paginated visible items (initial 9, then +9 per scroll batch)
  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Reset pagination when category changes
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setVisibleCount(BATCH_SIZE);
    setLoadError(null);
    setIsLoadingMore(false);
  };

  // Safe batch loader: loads the next 9 items, preventing concurrent / duplicate requests
  const loadNextBatch = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setLoadError(null);

    // Subtle 380ms delay provides smooth visual feedback and prevents UI stutter
    const timer = setTimeout(() => {
      try {
        setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filtered.length));
        setIsLoadingMore(false);
      } catch (err) {
        setLoadError(
          language === 'hi'
            ? 'छायाचित्र लोड करने में समस्या आई। कृपया पुनः प्रयास करें।'
            : 'Failed to load additional moments. Please try again.'
        );
        setIsLoadingMore(false);
      }
    }, 380);

    return () => clearTimeout(timer);
  }, [isLoadingMore, hasMore, filtered.length, language]);

  // IntersectionObserver for automated infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadNextBatch();
        }
      },
      {
        root: null,
        rootMargin: '200px', // trigger before reaching bottom for smooth continuous reading
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, loadNextBatch]);

  // Lightbox Modal Navigation helpers
  const currentModalIndex = selectedImage
    ? visibleItems.findIndex((item) => item.id === selectedImage.id)
    : -1;

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentModalIndex > 0) {
      setSelectedImage(visibleItems[currentModalIndex - 1]);
    }
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentModalIndex >= 0 && currentModalIndex < visibleItems.length - 1) {
      setSelectedImage(visibleItems[currentModalIndex + 1]);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
      if (e.key === 'ArrowLeft' && currentModalIndex > 0) {
        setSelectedImage(visibleItems[currentModalIndex - 1]);
      }
      if (e.key === 'ArrowRight' && currentModalIndex < visibleItems.length - 1) {
        setSelectedImage(visibleItems[currentModalIndex + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentModalIndex, visibleItems]);

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-clip selection:bg-amber-400">
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
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3" role="tablist" aria-label="Gallery Categories">
          {categories.map((cat) => {
            const label = language === 'hi' ? `${cat.labelHi} (${cat.count})` : `${cat.labelEn} (${cat.count})`;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                role="tab"
                aria-selected={isSelected}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer shadow-sm ${
                  isSelected
                    ? 'bg-[#5B0D15] text-white shadow-md shadow-rose-950/20 scale-105 ring-2 ring-amber-400/50'
                    : 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-200 hover:border-amber-300'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Gallery Items Count Header */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-stone-600 border-b border-stone-200/80 pb-3">
          <div className="flex items-center gap-2 font-serif font-medium text-stone-800">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>
              {t('Showing', 'प्रदर्शित')}:{' '}
              <strong className="text-[#5B0D15] font-bold">{visibleItems.length}</strong> {t('of', 'कुल')}{' '}
              <strong className="text-stone-900">{filtered.length}</strong> {t('sacred moments', 'पावन छायाचित्र')}
            </span>
          </div>
          {hasMore && (
            <span className="text-xs text-amber-800 bg-amber-100/70 px-3 py-1 rounded-full font-medium hidden sm:inline-block">
              {t('Scroll down to load more', 'और देखने के लिए नीचे स्क्रॉल करें')} ↓
            </span>
          )}
        </div>

        {/* Gallery Grid (Initial 9, then +9 per scroll batch) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" id="gallery-grid">
          {visibleItems.map((item, index) => {
            const title = language === 'hi' ? item.titleHi : item.title;
            const catLabel = language === 'hi' ? item.categoryLabelHi : item.categoryLabel;
            const desc = language === 'hi' ? item.descriptionHi : item.description;
            const location = language === 'hi' ? item.locationHi : item.location;
            const date = language === 'hi' ? item.dateHi : item.date;

            return (
              <article
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="group relative rounded-3xl overflow-hidden bg-white border border-stone-200/90 shadow-md hover:shadow-2xl hover:border-amber-400 transition-all duration-500 cursor-pointer flex flex-col justify-between"
                tabIndex={0}
                role="button"
                aria-label={`View photo: ${title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedImage(item);
                  }
                }}
              >
                {/* Image Container with fixed aspect ratio to prevent Layout Shift */}
                <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-stone-100">
                  <Image
                    src={item.image}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index < 3}
                    className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
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
              </article>
            );
          })}
        </div>

        {/* Empty State if filter yields zero items */}
        {filtered.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-8">
            <Filter className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-serif font-semibold text-lg text-stone-700">
              {t('No moments found in this category', 'इस श्रेणी में कोई छायाचित्र नहीं मिला')}
            </h3>
            <button
              onClick={() => handleCategoryChange('all')}
              className="px-5 py-2 rounded-full bg-[#5B0D15] text-white text-xs font-semibold hover:bg-rose-950 transition-colors"
            >
              {t('View All Moments', 'सभी छायाचित्र देखें')}
            </button>
          </div>
        )}

        {/* Infinite Scroll Sentinel & Controls */}
        <div
          ref={sentinelRef}
          className="w-full py-6 flex flex-col items-center justify-center space-y-4"
          aria-live="polite"
        >
          {/* Loading Indicator */}
          {isLoadingMore && (
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-amber-50/90 border border-amber-300/80 text-[#5B0D15] shadow-md animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
              <span className="text-xs sm:text-sm font-semibold">
                {t('Loading next sacred moments...', 'अगले पावन छायाचित्र लोड हो रहे हैं...')}
              </span>
            </div>
          )}

          {/* Error & Retry Alert */}
          {loadError && (
            <div className="flex flex-col items-center gap-2 p-5 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 text-sm max-w-md text-center shadow-sm">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{loadError}</span>
              </div>
              <button
                onClick={() => {
                  setLoadError(null);
                  loadNextBatch();
                }}
                className="mt-2 px-5 py-2 bg-[#5B0D15] text-white rounded-full text-xs font-bold hover:bg-rose-900 transition-colors cursor-pointer shadow-sm"
              >
                {t('Retry Loading', 'पुनः प्रयास करें')}
              </button>
            </div>
          )}

          {/* Accessible Fallback "Load More" Button */}
          {hasMore && !isLoadingMore && (
            <div className="text-center pt-2">
              <button
                onClick={loadNextBatch}
                className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-white hover:bg-amber-50 border border-stone-300 hover:border-amber-400 text-stone-800 hover:text-[#5B0D15] text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                aria-label={t('Load next 9 gallery images', 'अगले 9 छायाचित्र लोड करें')}
              >
                <span>{t('Load More Sacred Moments', 'और पावन छायाचित्र देखें')}</span>
                <span className="text-[11px] text-amber-700 font-semibold bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                  +9 ({visibleItems.length}/{filtered.length})
                </span>
              </button>
            </div>
          )}

          {/* End of Gallery Completion Banner */}
          {!hasMore && filtered.length > 0 && (
            <div className="w-full max-w-xl mx-auto my-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-amber-50/80 to-stone-100/70 border border-amber-200/80 text-center shadow-sm space-y-2">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-200/60 text-amber-900 mb-1">
                <CheckCircle2 className="w-5 h-5 text-amber-800" />
              </div>
              <h4 className="font-serif font-bold text-base sm:text-lg text-[#2A1810]">
                ✦ {t('You Have Explored All Sacred Moments', 'आपने सभी पावन छायाचित्र देख लिए हैं')} ✦
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                {t(
                  `All ${filtered.length} consecrated photographs have been loaded. May the divine grace of Kashi Vishwanath illuminate your path.`,
                  `इस श्रेणी के सभी ${filtered.length} पावन छायाचित्र प्रदर्शित हैं। बाबा काशी विश्वनाथ जी की कृपा आप पर सदैव बनी रहे।`
                )}
              </p>
            </div>
          )}
        </div>

      </main>

      {/* Lightbox Modal with Next/Previous Navigation */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
        >
          {/* Lightbox Container */}
          <div
            className="relative max-w-3xl w-full bg-[#FAF7F2] rounded-3xl overflow-hidden border-2 border-amber-400 shadow-2xl space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Previous Button */}
            {currentModalIndex > 0 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/3 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-amber-600 transition-colors cursor-pointer shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Navigation Next Button */}
            {currentModalIndex >= 0 && currentModalIndex < visibleItems.length - 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/3 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-amber-600 transition-colors cursor-pointer shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

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
              <div className="absolute bottom-3 right-4 px-2.5 py-0.5 rounded-full bg-black/60 text-white/90 text-[10px] font-mono">
                {currentModalIndex + 1} / {visibleItems.length}
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
