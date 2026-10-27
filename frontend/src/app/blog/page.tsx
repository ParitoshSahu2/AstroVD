'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/PageHeader';
import {
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Filter,
  BookOpen,
  X,
  Share2,
  Sparkles,
  User,
  MessageCircle,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getStoredUser, getAuthToken, AUTH_CHANGE_EVENT } from '../../lib/auth';
import BlogManageModal, { BlogPostItem } from './components/BlogManageModal';

interface BlogPost {
  id: string;
  title: string;
  titleHi: string;
  category: string;
  categoryHi: string;
  author: string;
  authorHi: string;
  authorRole: string;
  authorRoleHi: string;
  date: string;
  dateHi: string;
  readTime: string;
  readTimeHi: string;
  image: string;
  excerpt: string;
  excerptHi: string;
  content: string[];
  contentHi: string[];
  keyTakeaways: string[];
  keyTakeawaysHi: string[];
  isPublished?: boolean;
}

const allArticles: BlogPost[] = [
  {
    id: 'planetary-transits-2026',
    title: 'Major Planetary Transits of 2026: Navigating Jupiter and Saturn’s Cosmic Shift',
    titleHi: 'वर्ष 2026 के प्रमुख ग्रह गोचर: देवगुरु बृहस्पति एवं शनिदेव का राशि परिवर्तन',
    category: 'Vedic Jyotish',
    categoryHi: 'वैदिक ज्योतिष',
    author: 'Dr. Pandit Vishal Dubey',
    authorHi: 'डॉ. पंडित विशाल दुबे',
    authorRole: 'PhD, Jyotishacharya',
    authorRoleHi: 'पीएचडी, ज्योतिषाचार्य',
    date: 'Oct 14, 2026',
    dateHi: '14 अक्टूबर, 2026',
    readTime: '6 min read',
    readTimeHi: '6 मिनट पठन',
    image: '/services/kundli.jpg',
    excerpt: 'Detailed overview of Jupiter transiting into Cancer and Saturn moving across Pisces, bringing immense opportunities for spiritual transformation and financial realignment.',
    excerptHi: 'कर्क राशि में उच्च के देवगुरु बृहस्पति और मीन राशि में शनिदेव के गोचर का सूक्ष्म विश्लेषण, जो आध्यात्मिक प्रगति एवं आर्थिक समृद्धि के नए द्वार खोलेगा।',
    content: [
      'In Vedic Astrology, planetary transits (Gochar) act as cosmic catalysts that activate the dormant promises inscribed in your Janam Kundli. As we advance through 2026, Jupiter (Brihaspati) occupies its exalted sign of Cancer, radiating benevolence, higher learning, and domestic peace.',
      'Simultaneously, Saturn (Shani Dev) traversing through the water element of Pisces invites deep introspection, karmic settlements, and spiritual grounding. Those experiencing Sade Sati or Kantaka Shani will find this an auspicious time for charitable service, mantra sadhana, and rectifying past life imbalances.',
      'To harness this harmonious frequency, chant the Brihaspati Beej Mantra (ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः) on Thursdays and perform regular Shani Tailabhishek on Saturdays.',
    ],
    contentHi: [
      'वैदिक ज्योतिष में ग्रह गोचर उन ब्रह्मांडीय उत्प्रेरकों का कार्य करते हैं जो आपकी जन्म कुंडली में संचित कर्म फलों को जाग्रत करते हैं। वर्ष 2026 में देवगुरु बृहस्पति अपनी उच्च राशि कर्क में विराजमान होकर आध्यात्मिक ज्ञान, पारिवारिक शांति एवं धन वृद्धि का मार्ग प्रशस्त करेंगे।',
      'वहीं शनिदेव का मीन राशि में संचरण आत्म-निरीक्षण, कर्म शुद्धि और पूर्व जन्म के बंधनों के शमन का समय है। साढ़ेसाती अथवा ढैय्या से प्रभावित जातकों हेतु यह समय सेवा, मंत्र साधना एवं दान-पुण्य द्वारा ग्रहों की कृपा प्राप्त करने का पावन अवसर है।',
      'इस दुर्लभ ग्रहीय सामंजस्य का लाभ उठाने हेतु गुरुवार को गुरु बीज मंत्र (ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः) एवं शनिवार को शनि तैलभिषेक अत्यंत फलदायी है।',
    ],
    keyTakeaways: [
      'Jupiter in Cancer blesses genuine spiritual devotees and family expansion.',
      'Saturn in Pisces dissolves rigid ego structures, calling for surrender and patience.',
      'Wearing natural Yellow Sapphire (Pukhraj) or Blue Sapphire should only follow birth chart verification.',
    ],
    keyTakeawaysHi: [
      'कर्क में गुरु का उच्च प्रभाव साधकों को ज्ञान, संतान सुख व गृह शांति प्रदान करता है।',
      'मीन में शनि अहंकार को मिटाकर आत्म-समर्पण एवं धैर्य की परीक्षा लेते हैं।',
      'पीला पुखराज अथवा नीलम धारण करने से पूर्व जन्म कुंडली का सूक्ष्म परीक्षण अनिवार्य है।',
    ],
  },
  {
    id: 'tarot-wisdom-intuitive-guide',
    title: 'The Language of the Cards: How Intuitive Tarot Bridges Past, Present & Future',
    titleHi: 'कार्ड्स की दिव्य भाषा: अंतर्ज्ञान व टैरो से जीवन के महत्वपूर्ण निर्णयों में स्पष्टता',
    category: 'Tarot Wisdom',
    categoryHi: 'टैरो ज्ञान',
    author: 'Madhuri Dubey',
    authorHi: 'माधुरी दुबे',
    authorRole: 'Tarot Card Reader & Spiritual Guide',
    authorRoleHi: 'टैरो रीडर एवं आध्यात्मिक मार्गदर्शक',
    date: 'Oct 11, 2026',
    dateHi: '11 अक्टूबर, 2026',
    readTime: '5 min read',
    readTimeHi: '5 मिनट पठन',
    image: '/services/consultation.jpg',
    excerpt: 'How archetypal symbolism in the Major Arcana activates inner intuition, resolves subconscious anxieties, and provides reassurance during life-altering transitions.',
    excerptHi: 'मेजर अरकाना के 22 प्रतीकों द्वारा अवचेतन भय का निवारण और जीवन के कठिन मोड़ों पर आत्मबल एवं दिशा-निर्देश प्राप्त करने का रहस्य।',
    content: [
      'Tarot is not fortune-telling; it is a sacred mirror reflecting the unconscious currents of the soul. Each card in the 78-card deck represents an archetype of human consciousness, as mapped by Carl Jung and ancient mystical traditions.',
      'When you ask a question regarding love, career, or spiritual dilemma, the cards drawn mirror your vibrational resonance in that exact moment. They illuminate hidden motives, highlight blindspots, and unveil the highest probable trajectory.',
      'Through compassionate and intuitive readings, you gain the clarity required to make decisions with confidence, shifting fear into grounded purpose.',
    ],
    contentHi: [
      'टैरो केवल भविष्य जानने का साधन नहीं, अपितु आत्मा के अवचेतन प्रवाह को दर्शाने वाला एक पावन दर्पण है। 78 कार्ड्स की यह प्रणाली मानवीय चेतना की विविध अवस्थाओं को प्रतिबिंबित करती है।',
      'जब आप प्रेम, विवाह अथवा करियर संबंधी प्रश्न पूछते हैं, तो चयनित कार्ड्स उस क्षण आपकी ऊर्जा और संभावित मार्ग को स्पष्ट करते हैं। यह अचेतन शंकाओं का समाधान कर सत्य को उजागर करते हैं।',
      'माधुरी जी के सानिध्य में इंट्यूटिव टैरो पठन से आपको निर्णय लेने का दृढ़ विश्वास और अंतर्मन की गहन शांति प्राप्त होती है।',
    ],
    keyTakeaways: [
      'Tarot clarifies the emotional energy surrounding your present circumstances.',
      'The High Priestess and The Hermit guide inward reflection before outward action.',
      'Combine Tarot insights with Vedic astrology for a 360-degree spiritual compass.',
    ],
    keyTakeawaysHi: [
      'टैरो वर्तमान परिस्थितियों से जुड़ी भावनात्मक ऊर्जा को तत्काल स्पष्ट करता है।',
      'हाई प्रीस्टेस एवं हर्मिट कार्ड्स किसी भी निर्णय से पूर्व अंतर्मुखी चिंतन का संदेश देते हैं।',
      'वैदिक ज्योतिष एवं टैरो का संयुक्त उपयोग 360 डिग्री संपूर्ण आध्यात्मिक मार्गदर्शन प्रदान करता है।',
    ],
  },
  {
    id: 'gemstone-science-frequency',
    title: 'Vedic Gemstone Therapy: Selecting the Precise Optical Crystal for Your Kundli',
    titleHi: 'वैदिक रत्न चिकित्सा: अपनी जन्म कुंडली के अनुसार सटीक रत्न का चयन',
    category: 'Remedies & Gems',
    categoryHi: 'रत्न एवं उपाय',
    author: 'Acharya Sourabh Swami',
    authorHi: 'आचार्य सौरभ स्वामी',
    authorRole: 'Senior Vedic Puja Acharya',
    authorRoleHi: 'वरिष्ठ वैदिक पूजा आचार्य',
    date: 'Oct 04, 2026',
    dateHi: '04 अक्टूबर, 2026',
    readTime: '7 min read',
    readTimeHi: '7 मिनट पठन',
    image: '/services/gemstones.jpg',
    excerpt: 'Why unheated natural gemstones act as optical prisms capturing planetary cosmic rays and realigning physical, mental, and subtle energy meridians.',
    excerptHi: 'प्राकृतिक शुद्ध रत्न कैसे ब्रह्मांडीय किरणों को प्रिज्म की भांति अवशोषित कर शरीर, मन और भाग्य के ऊर्जा केंद्रों को पुनः संतुलित करते हैं।',
    content: [
      'Ancient Rishis understood that cosmic rays emitted by the nine grahas constantly penetrate the Earth’s atmosphere. When a planet is benefic yet weak in your horoscope, a flawless natural gemstone acts as an optical amplifier, absorbing and channeling that specific wavelength into your biofield.',
      'For instance, natural Ruby transmits cosmic red rays governed by the Sun, vitalizing the heart, spine, and leadership faculties. Emerald channels green rays for Mercury, enhancing intellect, nervous balance, and commercial acumen.',
      'Crucially, synthetic or heat-treated stones lack crystalline vitality. Every gemstone recommended at AstroVD undergoes authentic Varanasi Prana Pratishtha to awaken its celestial dormant force.',
    ],
    contentHi: [
      'प्राचीन ऋषियों ने यह प्रत्यक्ष अनुभव किया था कि नवग्रहों द्वारा उत्सर्जित रश्मियां निरंतर पृथ्वी और मानव शरीर को प्रभावित करती हैं। जब कोई कारक ग्रह कुंडली में दुर्बल होता है, तो दोषमुक्त प्राकृतिक रत्न उस ग्रह की किरणों को शरीर में अवशोषित करने का कार्य करता है।',
      'उदाहरणार्थ, प्राकृतिक माणिक्य सूर्य की लाल किरणों को संचित कर हृदय, रीढ़ एवं नेतृत्व शक्ति को जाग्रत करता है। पन्ना बुध की हरित किरणों द्वारा बुद्धि, वाणी और व्यापार में सफलता दिलाता है।',
      'सिंथेटिक अथवा हीटर-ट्रीटेड रत्नों में यह ऊर्जा नहीं होती। AstroVD द्वारा अनुशंसित प्रत्येक रत्न काशी की यज्ञशाला में वैदिक प्राण-प्रतिष्ठा से अभिमंत्रित किया जाता है।',
    ],
    keyTakeaways: [
      'Never wear gemstones for Maraka (death-inflicting) or malefic dusthana lords.',
      'Gemstones must touch the skin to transmit photonic cosmic energy.',
      'Purify and energize your stone on its designated ruling weekday at sunrise.',
    ],
    keyTakeawaysHi: [
      'मारक अथवा क्रूर त्रिक भावों (6, 8, 12) के स्वामियों के रत्न कभी धारण न करें।',
      'रत्न का आधार त्वचा से स्पर्श होना अनिवार्य है ताकि ऊर्जा का संचार हो सके।',
      'रत्न को उसके संबंधित शुभ वार को सूर्योदय वेला में गंगाजल व कच्चे दूध से शुद्ध कर धारण करें।',
    ],
  },
  {
    id: 'understanding-mangal-dosh',
    title: 'Understanding Mangal Dosh: Scientific Analysis, Myths & Traditional Remedies',
    titleHi: 'मंगल दोष का वैज्ञानिक विश्लेषण: भ्रांतियां, शास्त्रीय सत्य एवं अचूक उपाय',
    category: 'Kundli Milan',
    categoryHi: 'कुंडली मिलान',
    author: 'Dr. Pandit Vishal Dubey',
    authorHi: 'डॉ. पंडित विशाल दुबे',
    authorRole: 'PhD in Jyotish & Rog',
    authorRoleHi: 'पीएचडी ज्योतिष एवं रोग',
    date: 'Sep 26, 2026',
    dateHi: '26 सितंबर, 2026',
    readTime: '8 min read',
    readTimeHi: '8 मिनट पठन',
    image: '/services/marriage.jpg',
    excerpt: 'Demystifying Mars placement in the 1st, 4th, 7th, 8th, and 12th houses, and traditional Vedic remedies including Kumbh Vivah and Hanuman Upasana.',
    excerptHi: '1, 4, 7, 8 एवं 12वें भाव में मंगल की स्थिति, मांगलिक दोष के भंग होने के नियम एवं कुंभ विवाह व भौम शांति के शास्त्रीय उपाय।',
    content: [
      'Few astrological terms generate as much unfounded panic as "Manglik Dosha." In classical Jyotish, Mars represents raw vitality, drive, passion, and assertiveness. When placed in houses governing relationship harmony (1st, 4th, 7th, 8th, 12th), its intense fiery nature can create friction if left unchanneled.',
      'However, classical texts enumerate dozens of automatic cancellations (Bhanga), such as Mars residing in its own signs (Aries, Scorpio) or exalted in Capricorn, or receiving the benign aspect of Jupiter.',
      'Where genuine Mangal Dosha exists, proven Vedic remedies such as Ark Vivah or Kumbh Vivah, Bhauma Yagya, and continuous Hanuman Chalisa recitation successfully neutralize disharmony.',
    ],
    contentHi: [
      'ज्योतिष में "मांगलिक दोष" को लेकर जनमानस में अनेक भ्रांतियां हैं। मंगल ऊर्जा, पराक्रम और शौर्य का कारक है। जब यह 1, 4, 7, 8 अथवा 12वें भाव में होता है, तो इसकी उग्र प्रकृति दांपत्य भाव में सामंजस्य की परीक्षा लेती है।',
      'किंतु पाराशर होरा शास्त्र के अनुसार 60% से अधिक कुंडलियों में मंगल दोष स्वतः भंग हो जाता है—जैसे अपनी स्वराशि मेष, वृश्चिक में होना, अथवा गुरु की शुभ दृष्टि पड़ना।',
      'यदि वास्तविक दोष हो, तो कुंभ विवाह, अर्क विवाह, भौम शांति हवन एवं नित्य हनुमान उपासना से पूर्ण दांपत्य सुख प्राप्त होता है।',
    ],
    keyTakeaways: [
      'Over 60% of perceived Manglik charts have astrological cancellation factors.',
      'Mutual Manglik compatibility neutralizes the energetic disparity between partners.',
      'Pooja and Sankalp performed by learned Acharyas harmonize Martian energy into courage and mutual loyalty.',
    ],
    keyTakeawaysHi: [
      'अधिकांश कुंडलियों में मंगल दोष शास्त्रोक्त नियमों के आधार पर निरस्त हो जाता है।',
      'वर एवं वधू दोनों के मांगलिक होने पर ऊर्जा का स्वतः संतुलन स्थापित होता है।',
      'विद्वान ब्राह्मणों द्वारा संकल्पित भौम शांति पूजा से वैवाहिक जीवन में मधुरता आती है।',
    ],
  },
  {
    id: 'power-of-shree-yantra',
    title: 'The Sacred Science of Shree Yantra: Geometry of Infinite Abundance & Peace',
    titleHi: 'श्री यंत्र का पावन विज्ञान: अनंत समृद्धि, वास्तु शांति एवं लक्ष्मी तत्व की ज्यामिति',
    category: 'Pooja & Rituals',
    categoryHi: 'पूजा व अनुष्ठान',
    author: 'Pandit Ji (Karamkand Specialist)',
    authorHi: 'पंडित जी (कर्मकांड विशेषज्ञ)',
    authorRole: 'Shastra Vidhan Expert',
    authorRoleHi: 'शास्त्र विधान विशेषज्ञ',
    date: 'Sep 19, 2026',
    dateHi: '19 सितंबर, 2026',
    readTime: '6 min read',
    readTimeHi: '6 मिनट पठन',
    image: '/services/puja.jpg',
    excerpt: 'Why the 9 interlocking triangles of the Sri Chakra generate an electromagnetic vortex of Lakshmi energy in homes, offices, and temples.',
    excerptHi: 'श्री चक्र के 9 परस्पर जुड़े त्रिकोण किस प्रकार घर और व्यापार स्थल पर महालक्ष्मी ऊर्जा का विद्युत-चुंबकीय आभामंडल निर्मित करते हैं।',
    content: [
      'The Shree Yantra (Sri Chakra) is regarded as the queen of all sacred yantras. Composed of nine interlocking triangles that radiate out from the central Bindu point, it represents the union of the Divine Masculine (Shiva) and Divine Feminine (Shakti).',
      'Modern physics verifies that viewing and meditating on this precise sacred geometry synchronizes the left and right hemispheres of the human brain, inducing deep alpha wave states and mental stillness.',
      'Consecrated in your northeastern Ishan corner on a Friday, an energized Maha Meru Shree Yantra clears chronic financial stagnation and protects the dwelling from negative environmental frequencies.',
    ],
    contentHi: [
      'श्री यंत्र को समस्त यंत्रों का अधिपति (यंत्रराज) कहा गया है। मध्य में स्थित बिंदु से प्रसारित 9 त्रिकोण शिव और शक्ति के दिव्य मिलन का प्रतीक हैं।',
      'आधुनिक विज्ञान भी यह प्रमाणित करता है कि श्री यंत्र की पवित्र ज्यामिति पर ध्यान केंद्रित करने से मस्तिष्क के दोनों गोलार्ध संतुलित होते हैं और मानसिक शांति प्राप्त होती है।',
      'ईशान कोण में शुक्रवार के दिन प्राण-प्रतिष्ठित महामेरु श्री यंत्र की स्थापना से आर्थिक रुकावटें दूर होती हैं और गृह में सदैव लक्ष्मी वास रहता है।',
    ],
    keyTakeaways: [
      'The central Bindu radiates primordial cosmic vibration (Para Shakti).',
      'Daily chanting of Sri Suktam or Kanakadhara Stotra before the Yantra multiplies its energetic radius.',
      'Must be placed facing East or North on clean silk cloth consecrated with chandan.',
    ],
    keyTakeawaysHi: [
      'केंद्रीय बिंदु पराशक्ति की आदि ब्रह्मांडीय तरंगों का निरंतर उत्सर्जन करता है।',
      'यंत्र के समक्ष श्री सूक्तम अथवा कनकधारा स्तोत्र का नित्य पाठ इसके प्रभाव को कई गुना बढ़ाता है।',
      'इसे पूर्व अथवा उत्तर दिशा की ओर मुख कर शुद्ध पीले या लाल रेशमी वस्त्र पर स्थापित करें।',
    ],
  },
  {
    id: 'aura-scanning-chakra-alignment',
    title: 'Aura Scanning & Subtle Energy Fields: Restoring Vitality Before Disease Manifests',
    titleHi: 'औरा स्कैनिंग एवं चक्र संतुलन: रोग प्रकट होने से पूर्व सूक्ष्म ऊर्जा का शोधन',
    category: 'Occult & Healing',
    categoryHi: 'ऊर्जा एवं गूढ़ विद्या',
    author: 'Biofield Research',
    authorHi: 'बायोफील्ड शोध',
    authorRole: 'Pranic Science',
    authorRoleHi: 'प्राणिक विज्ञान',
    date: 'Sep 12, 2026',
    dateHi: '12 सितंबर, 2026',
    readTime: '7 min read',
    readTimeHi: '7 मिनट पठन',
    image: '/services/career.jpg',
    excerpt: 'Combining ancient Prana Vidya with electro-photonic aura scanning to identify energetic imbalances and emotional blockages before they manifest physically.',
    excerptHi: 'प्राण विद्या और आधुनिक इलेक्ट्रो-फोटोनिक औरा स्कैनिंग का समन्वय कर चक्रों के अवरोध एवं नकारात्मक ऊर्जा को दूर करने की वैज्ञानिक विधि।',
    content: [
      'Long before any physical disorder manifests in the biological body, it registers as a frequency disturbance in the Pranamaya Kosha (subtle etheric double). Your aura reflects your emotional thoughts, planetary dasha influences, and psychic stress.',
      'Through advanced aura scanning and intuitive pendulum dowsing, we map the rotation, color density, and blockages of the seven major chakras (Muladhara to Sahasrara).',
      'Targeted remedies including gemstone vibration, clinical hypnotherapy, and Rudrabhishek clear negative energy cords, restoring radiant vitality and deep peace.',
    ],
    contentHi: [
      'शरीर में किसी भी व्याधि के प्रकट होने से पूर्व, उसका प्रभाव प्राणमय कोष (सूक्ष्म औरा) में एक ऊर्जा असंतुलन के रूप में दर्ज होता है। आपका आभामंडल आपके विचारों और ग्रह दशा का प्रत्यक्ष दर्पण है।',
      'उन्नत औरा स्कैनिंग एवं पेंडुलम डाउजिंग द्वारा हम मूलाधार से सहस्रार तक सातों मुख्य चक्रों की गति, रंग सघनता और ऊर्जा अवरोधों का मानचित्रण करते हैं।',
      'रत्न कंपन, हिप्नोथेरेपी और रुद्राभिषेक द्वारा नकारात्मक ऊर्जा तरंगों को निष्कासित कर पुनः ओज और शांति की पुनर्स्थापना की जाती है।',
    ],
    keyTakeaways: [
      'The human aura extends 1.5 to 3 feet around the physical body.',
      'Chakra blockages directly correspond to planetary afflictions in the horoscope.',
      'Regular meditation, salt-water cleansing, and mantra chanting strengthen your psychic shield.',
    ],
    keyTakeawaysHi: [
      'मानव आभामंडल भौतिक शरीर से 1.5 से 3 फीट परिधि तक फैला रहता है।',
      'चक्रों का अवरोध सीधे तौर पर जन्म पत्रिका में पीड़ित ग्रहों से संबंधित होता है।',
      'नित्य ध्यान, सेंधा नमक स्नान एवं वैदिक मंत्र जप से औरा का सुरक्षा कवच सुदृढ़ होता है।',
    ],
  },
  {
    id: 'rudraksha-consecration-science',
    title: 'The Science of Prana Pratishtha: How Natural Rudraksha Beads Are Energized in Kashi',
    titleHi: 'प्राण-प्रतिष्ठा का शास्त्रीय विज्ञान: काशी में रुद्राक्ष एवं वैदिक रत्नों का दिव्य सिद्धिकरण',
    category: 'Spiritual Remedies',
    categoryHi: 'आध्यात्मिक उपाय',
    author: 'Kashi Peeth',
    authorHi: 'काशी पीठ',
    authorRole: 'Karmakand Sanctum',
    authorRoleHi: 'कर्मकांड पीठ',
    date: 'Sep 05, 2026',
    dateHi: '05 सितंबर, 2026',
    readTime: '7 min read',
    readTimeHi: '7 मिनट पठन',
    image: '/blog/rudraksha-pratishtha.jpg',
    excerpt: 'Step-by-step exposition of Panchamrit snan, Beej mantra nyasa, and Agni Havanam performed to align mineral electromagnetic vibrations with the seeker’s biofield.',
    excerptHi: 'पंचामृत स्नान, न्यास, और बीज मंत्र आहुतियों द्वारा रुद्राक्ष व रत्नों की सूक्ष्म ऊर्जा को जाग्रत करने की प्रामाणिक वैदिक पद्धति।',
    content: [
      'A sacred bead or gemstone unaligned with personal planetary frequencies remains physically beautiful yet energetically dormant. In the sanctified ghats of Kashi, our Acharyas conduct rigorous 108-cycle Prana Pratishtha according to the Shukla Yajurveda Samhita.',
      'The ritual commences at Brahma Muhurta with Shodashopachara pujan, followed by infusion of the specific planetary Gayatri and Beej Mantras.',
    ],
    contentHi: [
      'बिना प्राण-प्रतिष्ठा के धारण किया गया रत्न अथवा रुद्राक्ष केवल एक आभूषण मात्र रहता है। काशी के पावन तट पर यजुर्वेदीय पद्धति से 108 बार वैदिक मंत्रों की आहुति देकर रत्न में प्राण-ऊर्जा संचरित की जाती है।',
    ],
    keyTakeaways: [
      'Prana Pratishtha aligns the natural electromagnetic frequency of organic rudraksha with the wearer.',
      'Consecration includes personal Sankalp reciting your Gotra and Nakshatra.',
    ],
    keyTakeawaysHi: [
      'प्राण-प्रतिष्ठा रुद्राक्ष की चुंबकीय ऊर्जा को धारक के औरा से जोड़ती है।',
    ],
  },
  {
    id: 'solar-eclipse-2026-remedial-rituals',
    title: 'Solar & Lunar Eclipse Sadhana: Sacred Mantras & Charity for Cosmic Balance',
    titleHi: 'सूर्य एवं चंद्र ग्रहण साधना: सूतक काल में मंत्र जप, शुद्धि एवं दान का महत्व',
    category: 'Rituals & Upay',
    categoryHi: 'अनुष्ठान एवं उपाय',
    author: 'Vedic Parva Peeth',
    authorHi: 'वैदिक पर्व पीठ',
    authorRole: 'Puranic Rites',
    authorRoleHi: 'पौराणिक विधान',
    date: 'Aug 28, 2026',
    dateHi: '28 अगस्त, 2026',
    readTime: '9 min read',
    readTimeHi: '9 मिनट पठन',
    image: '/blog/eclipse-sadhana.jpg',
    excerpt: 'Comprehensive guidance on spiritual chanting, Kusha grass purification, and post-grahan snan charity during astronomical eclipses.',
    excerptHi: 'ग्रहण काल में मंत्र सिद्धि, कुश घास द्वारा शुद्धि, एवं मोक्ष उपरांत गंगा स्नान व महादान की शास्त्रीय विधि।',
    content: [
      'During Grahan (solar or lunar eclipse), the Sun or Moon is subjected to Rahu and Ketu shadow intersections. In ancient scriptures, this is considered a gateway of intense cosmic energy where any mantra japa performed is multiplied thousand-fold in efficacy.',
      'One should avoid heavy food consumption during the Sutak period, keep tulsi leaves in water storage vessels, and focus on Shiva or Gayatri Japa.',
    ],
    contentHi: [
      'ग्रहण काल में राहु और केतु की छाया से सूर्य व चंद्रमा प्रभावित होते हैं। शास्त्रों के अनुसार यह काल मंत्र सिद्धि हेतु अत्यंत शक्तिशाली माना जाता है।',
    ],
    keyTakeaways: [
      'Mantra japa during eclipse yields tenfold the merits of regular recitation.',
      'Post-eclipse charity of white sesame, clothes, and grains dissolves Rahu-Ketu dosha.',
    ],
    keyTakeawaysHi: [
      'ग्रहण के समय किया गया जप सामान्य दिनों की तुलना में सहस्त्र गुना फलदायी होता है।',
    ],
  },
];

export default function BlogPage() {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [readingArticle, setReadingArticle] = useState<BlogPost | null>(null);

  // Dynamic Content & Admin Management State
  const [articles, setArticles] = useState<BlogPost[]>(allArticles);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionToast, setActionToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const blogContentRef = useRef<HTMLDivElement>(null);

  const handleBlogWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (
      blogContentRef.current &&
      e.target !== blogContentRef.current &&
      !blogContentRef.current.contains(e.target as Node)
    ) {
      blogContentRef.current.scrollTop += e.deltaY;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setReadingArticle(null);
    };
    if (readingArticle) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
    };
  }, [readingArticle]);

  // Support direct linking via ?id=article-id or ?article=article-id
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const articleId = urlParams.get('id') || urlParams.get('article');
      if (articleId) {
        const found =
          articles.find((a) => a.id === articleId) ||
          allArticles.find((a) => a.id === articleId);
        if (found) {
          setReadingArticle(found);
        }
      }
    }
  }, [articles]);

  const backendUrl = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
  ).replace(/\/api\/?$/, '');

  const fetchArticles = useCallback(async () => {
    try {
      const queryParam = isAdmin && showDrafts ? '?includeUnpublished=true' : '';
      const res = await fetch(`${backendUrl}/api/content/blog${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
        }
      }
    } catch (err) {
      console.error('Error fetching blogs from API, using fallback:', err);
    }
  }, [backendUrl, isAdmin, showDrafts]);

  useEffect(() => {
    const checkAuth = () => {
      const user = getStoredUser();
      const admin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
      setIsAdmin(admin);
    };
    checkAuth();
    window.addEventListener(AUTH_CHANGE_EVENT, checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleTogglePublish = async (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = getAuthToken();
    if (!token) return;

    const newStatus = post.isPublished === false ? true : false;
    setActionLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/content/blog/${post.id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update publish state');
      }

      setActionToast({
        type: 'success',
        message: `"${post.title}" is now ${newStatus ? 'published & live' : 'saved as draft'}.`,
      });
      fetchArticles();
    } catch (err: any) {
      setActionToast({ type: 'error', message: err.message || 'Error updating status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePost = async (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to permanently delete "${post.title}"?`)) {
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/content/blog/${post.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete blog article');
      }

      setActionToast({
        type: 'success',
        message: `"${post.title}" was successfully deleted.`,
      });
      fetchArticles();
    } catch (err: any) {
      setActionToast({ type: 'error', message: err.message || 'Error deleting article.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostSaved = () => {
    setActionToast({
      type: 'success',
      message: 'Article saved successfully!',
    });
    fetchArticles();
  };

  const categories = [
    { id: 'All', label: `${t('All Articles', 'सभी लेख')} (${articles.length})` },
    { id: 'Vedic Jyotish', label: t('Vedic Jyotish', 'वैदिक ज्योतिष') },
    { id: 'Tarot Wisdom', label: t('Tarot Wisdom', 'टैरो ज्ञान') },
    { id: 'Remedies & Gems', label: t('Remedies & Gems', 'रत्न एवं उपाय') },
    { id: 'Kundli Milan', label: t('Kundli Milan', 'कुंडली मिलान') },
    { id: 'Pooja & Rituals', label: t('Pooja & Rituals', 'पूजा व अनुष्ठान') },
    { id: 'Occult & Healing', label: t('Occult & Healing', 'ऊर्जा एवं गूढ़ विद्या') },
  ];

  const filtered = articles.filter((a) => {
    if (!isAdmin && a.isPublished === false) return false;
    if (isAdmin && !showDrafts && a.isPublished === false) return false;

    const matchCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchQuery =
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.titleHi?.includes(query) ||
      a.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      a.excerptHi?.includes(query) ||
      a.author.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  const featured = filtered[0] || articles[0];

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] m-0 p-0 overflow-x-clip selection:bg-amber-400">
      <Navbar />

      <PageHeader
        breadcrumb={t('Sacred Blogs & Articles', 'वैदिक लेख एवं शोध')}
        title={t('Vedic Wisdom & Astrological Articles', 'वैदिक ज्ञान, शोध पत्र एवं ज्योतिषीय लेख')}
        subtitle={t(
          'Scholarly discourses on Kundali analysis, planetary transits, intuitive Tarot, Vastu energy, and ancient mantra sciences by AstroVD Acharyas.',
          'जन्म कुंडली विश्लेषण, ग्रह गोचर, इंट्यूटिव टैरो, वास्तु ऊर्जा एवं प्राचीन मंत्र विज्ञान पर AstroVD आचार्यों के प्रामाणिक शोध लेख।'
        )}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16 space-y-12">
        {/* Action Feedback Toast */}
        {actionToast && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm animate-fadeIn ${
              actionToast.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionToast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionToast.message}</span>
            </div>
            <button
              onClick={() => setActionToast(null)}
              className="text-stone-400 hover:text-stone-700 font-bold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Admin Control Bar - ONLY VISIBLE TO AUTHENTICATED ADMINS */}
        {isAdmin && (
          <div className="rounded-3xl bg-gradient-to-r from-amber-50 via-white to-amber-50/80 border-2 border-amber-300 p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5B0D15] text-amber-200 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif font-bold text-base text-[#3B1E22]">
                    Admin Content Controls
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                    Blog Management
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  Publish, edit, unpublish, or delete articles directly from this public page. Customers never see these controls.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setShowDrafts(!showDrafts)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer shadow-xs ${
                  showDrafts
                    ? 'bg-amber-100 text-amber-950 border-amber-400 ring-2 ring-amber-300/40'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {showDrafts ? <Eye className="w-3.5 h-3.5 text-amber-800" /> : <EyeOff className="w-3.5 h-3.5 text-stone-500" />}
                <span>{showDrafts ? 'Showing Drafts' : 'Include Drafts'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingPost(null);
                  setManageModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-full bg-[#5B0D15] hover:bg-[#480a11] text-amber-100 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Add New Article</span>
              </button>
            </div>
          </div>
        )}

        {/* Featured Article Hero Banner */}
        {featured && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1C090C] via-[#2D0D12] to-[#1C090C] border-2 border-amber-500/40 shadow-2xl text-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('Featured Discourse', 'विशेष संपादकीय शोध')}</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-100 leading-tight">
                  {language === 'hi' ? featured.titleHi : featured.title}
                </h2>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
                  {language === 'hi' ? featured.excerptHi : featured.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-2">
                  <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <User className="w-3.5 h-3.5" />
                    {language === 'hi' ? `${featured.authorHi} (${featured.authorRoleHi})` : `${featured.author} (${featured.authorRole})`}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {language === 'hi' ? featured.dateHi : featured.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {language === 'hi' ? featured.readTimeHi : featured.readTime}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setReadingArticle(featured)}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{t('Read Full Discourse', 'संपूर्ण लेख पढ़ें')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Image */}
              <div className="lg:col-span-5 h-64 lg:h-full relative overflow-hidden">
                <img
                  src={featured.image}
                  alt={language === 'hi' ? featured.titleHi : featured.title}
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
              placeholder={t('Search articles by topic, author, or keyword...', 'विषय, लेखक या कीवर्ड द्वारा लेख खोजें...')}
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
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#5B0D15] text-white shadow-md'
                  : 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
          {filtered.map((post) => {
            const title = language === 'hi' ? post.titleHi : post.title;
            const excerpt = language === 'hi' ? post.excerptHi : post.excerpt;
            const category = language === 'hi' ? post.categoryHi : post.category;
            const author = language === 'hi' ? post.authorHi : post.author;
            const authorRole = language === 'hi' ? post.authorRoleHi : post.authorRole;
            const date = language === 'hi' ? post.dateHi : post.date;
            const readTime = language === 'hi' ? post.readTimeHi : post.readTime;

            return (
              <article
                key={post.id}
                className="rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-md hover:shadow-2xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-stone-100">
                    <img
                      src={post.image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-300/60 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                      ✦ {category}
                    </span>
                    <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-stone-200 text-[10px] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-300" />
                      {readTime}
                    </span>

                    {/* Admin Actions Pill - ONLY VISIBLE TO AUTHENTICATED ADMINS */}
                    {isAdmin && (
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 py-1 rounded-full border border-amber-400/80 shadow-lg">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            post.isPublished === false
                              ? 'bg-amber-400 text-stone-950 font-black'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {post.isPublished === false ? 'Draft' : 'Live'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPost(post);
                            setManageModalOpen(true);
                          }}
                          title="Edit Article"
                          className="w-6 h-6 rounded-full bg-white/20 hover:bg-amber-400 hover:text-stone-950 text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleTogglePublish(post, e)}
                          title={post.isPublished === false ? 'Publish Article' : 'Unpublish Article'}
                          disabled={actionLoading}
                          className="w-6 h-6 rounded-full bg-white/20 hover:bg-amber-400 hover:text-stone-950 text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          {post.isPublished === false ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeletePost(post, e)}
                          title="Delete Article"
                          disabled={actionLoading}
                          className="w-6 h-6 rounded-full bg-white/20 hover:bg-rose-600 hover:text-white text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2A1810] group-hover:text-[#5B0D15] transition-colors leading-snug">
                      {title}
                    </h3>

                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                      {excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-5 pt-3.5 border-t border-stone-100 flex items-center justify-between bg-stone-50/50">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>{readTime}</span>
                  </span>

                  <button
                    onClick={() => setReadingArticle(post)}
                    className="px-5 py-2 rounded-full bg-[#5B0D15] hover:bg-[#78121d] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 cursor-pointer hover:gap-2 group/btn"
                  >
                    <span>{t('Read Full Article', 'सम्पूर्ण लेख पढ़ें')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

      </main>

      {/* Reading Modal */}
      {readingArticle && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setReadingArticle(null)}
        >
          <div
            data-lenis-prevent="true"
            onWheel={handleBlogWheel}
            className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-[#FAF7F2] text-[#2A1810] border-2 border-amber-300/90 shadow-2xl transition-all duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 25px 60px -15px rgba(42, 24, 16, 0.3), 0 0 35px rgba(245, 158, 11, 0.25)',
            }}
          >
            {/* Top Fixed Header with Badges and Close button */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-amber-200/80 z-20">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#5B0D15] text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                  {language === 'hi' ? readingArticle.categoryHi : readingArticle.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-900 text-xs font-semibold">
                  {language === 'hi' ? readingArticle.readTimeHi : readingArticle.readTime}
                </span>
              </div>
              <button
                onClick={() => setReadingArticle(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body - Scrollbar is fully contained inside and styled in sacred crimson maroon */}
            <div
              ref={blogContentRef}
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              className="p-6 sm:p-10 space-y-6 flex-1 overflow-y-auto overscroll-contain modal-scrollbar pr-4 sm:pr-8"
            >
              {/* Media Banner */}
              <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden border border-amber-300/80 shadow-md bg-stone-900 shrink-0">
                <img
                  src={readingArticle.image}
                  alt={language === 'hi' ? readingArticle.titleHi : readingArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('Vedic Guidance & Spiritual Wisdom', 'वैदिक मार्गदर्शन एवं आध्यात्मिक ज्ञान')}</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A151B] leading-snug">
                  {language === 'hi' ? readingArticle.titleHi : readingArticle.title}
                </h2>
              </div>

              {/* Key Takeaways Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#800000] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('Key Astrological Takeaways', 'मुख्य ज्योतिषीय निष्कर्ष')}</span>
                </h4>
                <ul className="text-xs text-stone-700 space-y-1.5 list-disc pl-4 leading-relaxed">
                  {(language === 'hi' ? readingArticle.keyTakeawaysHi : readingArticle.keyTakeaways).map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>

              {/* Full Article Content Paragraphs */}
              <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                {(language === 'hi' ? readingArticle.contentHi : readingArticle.content).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* Consultation CTA Banner at end of Discourse */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#5B0D15] to-[#7E1420] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-serif font-bold text-base">
                    {t('Want Personal Guidance on This Subject?', 'क्या आप इस विषय पर व्यक्तिगत मार्गदर्शन चाहते हैं?')}
                  </h4>
                  <p className="text-xs text-amber-200">
                    {t('Schedule a confidential session with Dr. Pandit Vishal Dubey.', 'डॉ. पंडित विशाल दुबे के साथ एक गोपनीय परामर्श सत्र बुक करें।')}
                  </p>
                </div>
                <a
                  href="/appointment"
                  className="shrink-0 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-all shadow-md"
                >
                  {t('Book Consultation', 'परामर्श बुक करें')}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Blog Management Modal */}
      {isAdmin && (
        <BlogManageModal
          isOpen={manageModalOpen}
          onClose={() => setManageModalOpen(false)}
          postToEdit={editingPost as any}
          onSaved={handlePostSaved}
        />
      )}

      <Footer />
    </div>
  );
}
