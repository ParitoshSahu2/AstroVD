import { Injectable } from '@nestjs/common';
import {
  HoroscopeResponse,
  KundliRequestDto,
  KundliResponse,
  MatchmakingRequestDto,
  MatchmakingResponse,
  NumerologyRequestDto,
  NumerologyResponse,
  PanchangResponse,
  TarotCard,
  TarotSpreadResponse,
  PlanetPosition,
  HouseInfo,
  GunaScore,
} from './astrology.types.js';

@Injectable()
export class AstrologyService {
  private readonly zodiacSigns = [
    { sign: 'aries', symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire', rulingPlanet: 'Mars' },
    { sign: 'taurus', symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth', rulingPlanet: 'Venus' },
    { sign: 'gemini', symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air', rulingPlanet: 'Mercury' },
    { sign: 'cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water', rulingPlanet: 'Moon' },
    { sign: 'leo', symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire', rulingPlanet: 'Sun' },
    { sign: 'virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth', rulingPlanet: 'Mercury' },
    { sign: 'libra', symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air', rulingPlanet: 'Venus' },
    { sign: 'scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water', rulingPlanet: 'Mars & Pluto' },
    { sign: 'sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire', rulingPlanet: 'Jupiter' },
    { sign: 'capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth', rulingPlanet: 'Saturn' },
    { sign: 'aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air', rulingPlanet: 'Saturn & Uranus' },
    { sign: 'pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water', rulingPlanet: 'Jupiter & Neptune' },
  ];

  private readonly nakshatras = [
    { name: 'Ashwini', lord: 'Ketu', gana: 'Deva', yoni: 'Horse', nadi: 'Adi' },
    { name: 'Bharani', lord: 'Venus', gana: 'Manushya', yoni: 'Elephant', nadi: 'Madhya' },
    { name: 'Krittika', lord: 'Sun', gana: 'Rakshasa', yoni: 'Sheep', nadi: 'Antya' },
    { name: 'Rohini', lord: 'Moon', gana: 'Manushya', yoni: 'Serpent', nadi: 'Antya' },
    { name: 'Mrigashira', lord: 'Mars', gana: 'Deva', yoni: 'Serpent', nadi: 'Madhya' },
    { name: 'Ardra', lord: 'Rahu', gana: 'Manushya', yoni: 'Dog', nadi: 'Adi' },
    { name: 'Punarvasu', lord: 'Jupiter', gana: 'Deva', yoni: 'Cat', nadi: 'Adi' },
    { name: 'Pushya', lord: 'Saturn', gana: 'Deva', yoni: 'Goat', nadi: 'Madhya' },
    { name: 'Ashlesha', lord: 'Mercury', gana: 'Rakshasa', yoni: 'Cat', nadi: 'Antya' },
    { name: 'Magha', lord: 'Ketu', gana: 'Rakshasa', yoni: 'Rat', nadi: 'Antya' },
    { name: 'Purva Phalguni', lord: 'Venus', gana: 'Manushya', yoni: 'Rat', nadi: 'Madhya' },
    { name: 'Uttara Phalguni', lord: 'Sun', gana: 'Manushya', yoni: 'Cow', nadi: 'Adi' },
    { name: 'Hasta', lord: 'Moon', gana: 'Deva', yoni: 'Buffalo', nadi: 'Adi' },
    { name: 'Chitra', lord: 'Mars', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Madhya' },
    { name: 'Swati', lord: 'Rahu', gana: 'Deva', yoni: 'Buffalo', nadi: 'Antya' },
    { name: 'Vishakha', lord: 'Jupiter', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Antya' },
    { name: 'Anuradha', lord: 'Saturn', gana: 'Deva', yoni: 'Deer', nadi: 'Madhya' },
    { name: 'Jyeshtha', lord: 'Mercury', gana: 'Rakshasa', yoni: 'Deer', nadi: 'Adi' },
    { name: 'Mula', lord: 'Ketu', gana: 'Rakshasa', yoni: 'Dog', nadi: 'Adi' },
    { name: 'Purva Ashadha', lord: 'Venus', gana: 'Manushya', yoni: 'Monkey', nadi: 'Madhya' },
    { name: 'Uttara Ashadha', lord: 'Sun', gana: 'Manushya', yoni: 'Mongoose', nadi: 'Antya' },
    { name: 'Shravana', lord: 'Moon', gana: 'Deva', yoni: 'Monkey', nadi: 'Antya' },
    { name: 'Dhanishta', lord: 'Mars', gana: 'Rakshasa', yoni: 'Lion', nadi: 'Madhya' },
    { name: 'Shatabhisha', lord: 'Rahu', gana: 'Rakshasa', yoni: 'Horse', nadi: 'Adi' },
    { name: 'Purva Bhadrapada', lord: 'Jupiter', gana: 'Manushya', yoni: 'Lion', nadi: 'Adi' },
    { name: 'Uttara Bhadrapada', lord: 'Saturn', gana: 'Manushya', yoni: 'Cow', nadi: 'Madhya' },
    { name: 'Revati', lord: 'Mercury', gana: 'Deva', yoni: 'Elephant', nadi: 'Antya' },
  ];

  private readonly majorArcanaTarot: TarotCard[] = [
    {
      id: 'the_fool',
      name: 'The Fool',
      arcana: 'Major',
      number: 0,
      keywords: ['Beginnings', 'Innocence', 'Spontaneity', 'Free Spirit', 'Leap of Faith'],
      uprightMeaning: 'A fresh cosmic journey commences. Trust the universe and embrace unknown horizons with curiosity.',
      reversedMeaning: 'Recklessness, fear of starting, taking unnecessary risks without ground.',
      advice: 'Take the courageous leap, but keep your intuition anchored.',
      element: 'Air',
    },
    {
      id: 'the_magician',
      name: 'The Magician',
      arcana: 'Major',
      number: 1,
      keywords: ['Manifestation', 'Resourcefulness', 'Power', 'Inspired Action'],
      uprightMeaning: 'All four cosmic elements align in your favor. You hold the power to manifest thoughts into physical reality.',
      reversedMeaning: 'Illusion, untapped potential, manipulation, misdirection of energy.',
      advice: 'Channel your creative will into focused execution.',
      element: 'Air',
    },
    {
      id: 'the_high_priestess',
      name: 'The High Priestess',
      arcana: 'Major',
      number: 2,
      keywords: ['Intuition', 'Sacred Knowledge', 'Divine Feminine', 'Subconscious Mind'],
      uprightMeaning: 'Secrets and higher wisdom surface. Look beyond the veil and listen to your still inner voice.',
      reversedMeaning: 'Secrets revealed, disconnected from intuition, superficiality.',
      advice: 'Meditate and honor your gut impressions; cosmic answers lie within.',
      element: 'Water',
    },
    {
      id: 'the_empress',
      name: 'The Empress',
      arcana: 'Major',
      number: 3,
      keywords: ['Fertility', 'Nurturing', 'Abundance', 'Sensuality', 'Nature'],
      uprightMeaning: 'Lavish spiritual and material abundance flows to you. Creativity flourishes like a blooming garden.',
      reversedMeaning: 'Creative block, over-dependence, emptiness, neglecting self-care.',
      advice: 'Nurture your creations and allow prosperity to blossom naturally.',
      element: 'Earth',
    },
    {
      id: 'the_emperor',
      name: 'The Emperor',
      arcana: 'Major',
      number: 4,
      keywords: ['Authority', 'Structure', 'Control', 'Father Figure', 'Stability'],
      uprightMeaning: 'A time for strategic order, discipline, and steadfast leadership. Lay unshakeable foundations.',
      reversedMeaning: 'Tyranny, rigidity, loss of control, lack of organization.',
      advice: 'Establish clear boundaries and act with calm conviction.',
      element: 'Fire',
    },
    {
      id: 'the_hierophant',
      name: 'The Hierophant',
      arcana: 'Major',
      number: 5,
      keywords: ['Tradition', 'Spiritual Wisdom', 'Mentorship', 'Belief Systems'],
      uprightMeaning: 'Ancient wisdom and sacred rituals provide guidance. Seek guidance from elders or spiritual teachers.',
      reversedMeaning: 'Rebellion, outdated dogma, unconventional paths.',
      advice: 'Honor sacred lineages while evaluating which truths resonate with your soul.',
      element: 'Earth',
    },
    {
      id: 'the_lovers',
      name: 'The Lovers',
      arcana: 'Major',
      number: 6,
      keywords: ['Sacred Union', 'Harmony', 'Relationships', 'Values Alignment'],
      uprightMeaning: 'Profound soul-connection and alignment of personal values. A decisive moral choice in love or life.',
      reversedMeaning: 'Disharmony, misaligned values, hesitation in commitment.',
      advice: 'Choose from love rather than fear; open your heart fully.',
      element: 'Air',
    },
    {
      id: 'the_chariot',
      name: 'The Chariot',
      arcana: 'Major',
      number: 7,
      keywords: ['Victory', 'Willpower', 'Determination', 'Overcoming Obstacles'],
      uprightMeaning: 'Triumph over opposing cosmic currents through willpower and self-mastery. Forward acceleration.',
      reversedMeaning: 'Lack of direction, aggression, feeling overwhelmed by events.',
      advice: 'Harness opposing forces into a singular purposeful trajectory.',
      element: 'Water',
    },
    {
      id: 'strength',
      name: 'Strength',
      arcana: 'Major',
      number: 8,
      keywords: ['Inner Strength', 'Compassion', 'Courage', 'Patience'],
      uprightMeaning: 'Gentle mastery over primal instincts. True strength is quiet, compassionate, and enduring.',
      reversedMeaning: 'Self-doubt, raw animal impulses, weakness of resolve.',
      advice: 'Lead with grace and gentle resilience; patience conquers ferocity.',
      element: 'Fire',
    },
    {
      id: 'the_hermit',
      name: 'The Hermit',
      arcana: 'Major',
      number: 9,
      keywords: ['Soul Searching', 'Introspection', 'Solitude', 'Inner Guidance'],
      uprightMeaning: 'Step back into quiet sanctuary. The lantern of inner truth illuminates your path in the shadows.',
      reversedMeaning: 'Isolation, loneliness, anti-social withdrawal, ignoring wisdom.',
      advice: 'Disconnect from outer noise to hear celestial insight.',
      element: 'Earth',
    },
    {
      id: 'wheel_of_fortune',
      name: 'Wheel of Fortune',
      arcana: 'Major',
      number: 10,
      keywords: ['Karma', 'Destiny', 'Cycles', 'Turning Point', 'Good Luck'],
      uprightMeaning: 'The celestial wheel turns favorably! Serendipity, lucky coincidences, and karmic rewards arrive.',
      reversedMeaning: 'Bad luck streak, resisting inevitable changes, cyclical traps.',
      advice: 'Flow with cosmic timing; understand that cycles always rise again.',
      element: 'Fire',
    },
    {
      id: 'justice',
      name: 'Justice',
      arcana: 'Major',
      number: 11,
      keywords: ['Fairness', 'Truth', 'Karmic Balance', 'Law of Cause and Effect'],
      uprightMeaning: 'Clear karmic resolution. Truth prevails, contracts settle, and fairness is divinely restored.',
      reversedMeaning: 'Dishonesty, unfair treatment, evading personal responsibility.',
      advice: 'Act with absolute integrity; cosmic scales weigh every deed.',
      element: 'Air',
    },
    {
      id: 'the_star',
      name: 'The Star',
      arcana: 'Major',
      number: 17,
      keywords: ['Hope', 'Faith', 'Inspiration', 'Serenity', 'Spiritual Blessings'],
      uprightMeaning: 'Renewed hope after the storm. Celestial grace pours into your life with tranquility and clarity.',
      reversedMeaning: 'Hopelessness, cynicism, despair, disconnected from grace.',
      advice: 'Keep your gaze fixed on the highest celestial light; your wishes are heard.',
      element: 'Air',
    },
    {
      id: 'the_sun',
      name: 'The Sun',
      arcana: 'Major',
      number: 19,
      keywords: ['Joy', 'Vitality', 'Celebration', 'Success', 'Radiance'],
      uprightMeaning: 'Supreme cosmic blessing! Radiant vitality, abundance, warmth, and triumphant celebration.',
      reversedMeaning: 'Temporary clouds obscuring joy, burnout, unrealistic optimism.',
      advice: 'Bask in radiant joy and share your warmth generously with all.',
      element: 'Fire',
    },
    {
      id: 'the_world',
      name: 'The World',
      arcana: 'Major',
      number: 21,
      keywords: ['Completion', 'Integration', 'Fulfillment', 'Wholeness', 'Travel'],
      uprightMeaning: 'Grand cosmic cycle completes in triumph! Spiritual graduation, global perspective, and wholeness.',
      reversedMeaning: 'Lack of closure, unfinished business, feeling stuck at the finish line.',
      advice: 'Celebrate your journey and prepare for the next elevated cycle.',
      element: 'Earth',
    },
  ];

  // 1. Horoscope Generator
  getHoroscope(signParam: string, period = 'daily'): HoroscopeResponse {
    const normalized = (signParam || 'aries').toLowerCase().trim();
    const signInfo = this.zodiacSigns.find((z) => z.sign === normalized) || this.zodiacSigns[0];

    const seed = this.getStringHash(normalized + period + new Date().toISOString().slice(0, 10));

    const luckyNumbers = [3, 7, 9, 11, 21, 27, 33, 45, 54, 72];
    const colors = ['Royal Gold', 'Crimson Ruby', 'Cosmic Indigo', 'Emerald Green', 'Deep Violet', 'Sapphire Blue', 'Sunset Coral'];
    const moods = ['Radiant', 'Introspective', 'Magnetic', 'Transformational', 'Courageous', 'Tranquil', 'Harmonious'];

    const luckyNumber = luckyNumbers[seed % luckyNumbers.length];
    const luckyColor = colors[(seed + 3) % colors.length];
    const mood = moods[(seed + 5) % moods.length];
    const compatible = this.zodiacSigns[(seed + 4) % this.zodiacSigns.length].sign;

    const loveScore = 70 + (seed % 28);
    const careerScore = 65 + ((seed * 3) % 33);
    const luckScore = 75 + ((seed * 7) % 24);
    const healthScore = 80 + ((seed * 5) % 19);

    const predictionsByElement: Record<string, any> = {
      Fire: {
        personal: 'Your fiery passion surges as Mars and the Sun illuminate your aura. Trust bold initiatives today.',
        love: 'Sparks ignite in romance. A magnetic gesture breaks old barriers and invites deep vulnerability.',
        career: 'Decisive leadership sets you apart in important meetings. Take calculated risks with confidence.',
        finance: 'Opportunities for expansion appear through enterprising ventures. Avoid impulsive luxury buys.',
        health: 'Energy is high; channel vitality into outdoor movement and stay deeply hydrated.',
      },
      Earth: {
        personal: 'Grounded stability brings immense clarity. Your structured mindset turns complex ideas into steady progress.',
        love: 'Warmth and unwavering reliability strengthen your emotional ties. Shared comforts deepen intimacy.',
        career: 'Patience yields rewarding milestones. Key decision-makers appreciate your thorough diligence.',
        finance: 'Prudent budgeting and long-term asset investments show promising cosmic support.',
        health: 'Harmonize your nervous system with mindful walks in nature and nourishing herbal infusions.',
      },
      Air: {
        personal: 'Intellectual brilliance and creative sparks stimulate your thoughts. Collaborative dialogues flow seamlessly.',
        love: 'Witty banter and deep philosophical talks create electric chemistry with your soul partner.',
        career: 'Novel solutions emerge effortlessly. Present your innovative proposals with crystal clarity.',
        finance: 'Diversified income streams and intellectual property yield favorable prospects.',
        health: 'Practice pranayama or breathwork to soothe mental restlessness and recharge mental vitality.',
      },
      Water: {
        personal: 'Intuitive tides run deep, revealing truths hidden beneath ordinary surfaces. Honor your emotional wisdom.',
        love: 'Soul-level empathy bridges any recent emotional distance. Unspoken understanding heals old wounds.',
        career: 'Your natural emotional intelligence defuses tensions and steers group projects to success.',
        finance: 'Trust intuitive impressions regarding financial commitments. Protect your nest egg.',
        health: 'Water-based relaxation, soothing music, and restful slumber will rejuvenate your spiritual spirit.',
      },
    };

    const elementPred = predictionsByElement[signInfo.element];

    return {
      sign: signInfo.sign.charAt(0).toUpperCase() + signInfo.sign.slice(1),
      element: signInfo.element,
      rulingPlanet: signInfo.rulingPlanet,
      symbol: signInfo.symbol,
      dates: signInfo.dates,
      period,
      prediction: elementPred,
      metrics: {
        loveScore,
        careerScore,
        luckScore,
        healthScore,
      },
      luckyNumber,
      luckyColor,
      luckyTime: `${(seed % 12) + 1}:30 ${seed % 2 === 0 ? 'AM' : 'PM'}`,
      mood,
      compatibleSign: compatible.charAt(0).toUpperCase() + compatible.slice(1),
      planetaryAspect: `${signInfo.rulingPlanet} forms a harmonious trine with Jupiter, expanding luck and celestial protection.`,
    };
  }

  // 2. Vedic Kundli Generator
  generateKundli(dto: KundliRequestDto): KundliResponse {
    const dob = new Date(`${dto.dateOfBirth}T${dto.timeOfBirth || '12:00'}:00`);
    const day = dob.getDate();
    const month = dob.getMonth() + 1;
    const year = dob.getFullYear();
    const [hours, minutes] = (dto.timeOfBirth || '12:00').split(':').map(Number);

    // Calculate Ascendant (Lagna) based on hour of birth and month
    const lagnaIndex = (Math.floor(hours / 2) + month - 1) % 12;
    const lagnaSign = this.zodiacSigns[lagnaIndex].sign;

    // Calculate Moon Sign (Rashi) based on day + month calculation
    const rashiIndex = (day * 3 + month * 2 + (year % 12)) % 12;
    const moonSign = this.zodiacSigns[rashiIndex].sign;

    // Calculate Sun Sign based on Western-Vedic solar entry
    const sunSignIndex = (month + (day >= 21 ? 0 : 11)) % 12;
    const sunSign = this.zodiacSigns[sunSignIndex].sign;

    // Nakshatra calculation
    const nakshatraIndex = (day * 2 + month * 3 + hours) % 27;
    const nakshatra = this.nakshatras[nakshatraIndex];

    // Manglik Dosha Analysis
    // Mars in houses 1, 4, 7, 8, 12 from Lagna causes Manglik Dosha
    const marsHouse = ((seedCalc(dto.name + 'mars') % 12) + 1);
    const isManglik = [1, 4, 7, 8, 12].includes(marsHouse);
    const manglikSeverity = isManglik ? (marsHouse === 7 || marsHouse === 8 ? 'High' : 'Mild') : 'None';

    // Planetary positions in houses
    const grahas = [
      { name: 'Sun', sanskrit: 'Surya', lordOf: 'Leo', nature: 'King' },
      { name: 'Moon', sanskrit: 'Chandra', lordOf: 'Cancer', nature: 'Queen' },
      { name: 'Mars', sanskrit: 'Mangal', lordOf: 'Aries & Scorpio', nature: 'Commander' },
      { name: 'Mercury', sanskrit: 'Budh', lordOf: 'Gemini & Virgo', nature: 'Prince' },
      { name: 'Jupiter', sanskrit: 'Guru', lordOf: 'Sagittarius & Pisces', nature: 'Guru' },
      { name: 'Venus', sanskrit: 'Shukra', lordOf: 'Taurus & Libra', nature: 'Preceptor' },
      { name: 'Saturn', sanskrit: 'Shani', lordOf: 'Capricorn & Aquarius', nature: 'Servant' },
      { name: 'Rahu', sanskrit: 'Rahu', lordOf: 'Aquarius (co-lord)', nature: 'Shadow Node' },
      { name: 'Ketu', sanskrit: 'Ketu', lordOf: 'Scorpio (co-lord)', nature: 'Spiritual Node' },
    ];

    const planets: PlanetPosition[] = grahas.map((g, idx) => {
      const house = idx === 2 ? marsHouse : ((lagnaIndex + idx * 2 + (day % 5)) % 12) + 1;
      const sign = this.zodiacSigns[(lagnaIndex + house - 1) % 12].sign;
      const deg = 5 + ((day * (idx + 1) * 7) % 24);
      return {
        name: g.name,
        sanskritName: g.sanskrit,
        sign: sign.charAt(0).toUpperCase() + sign.slice(1),
        house,
        degree: deg,
        isRetrograde: idx === 6 || idx === 3, // Saturn or Mercury retrograde periodically
        nakshatra: this.nakshatras[(nakshatraIndex + idx * 3) % 27].name,
        pada: ((idx + deg) % 4) + 1,
        state: idx === 4 ? 'Exalted' : idx === 6 ? 'Own' : 'Friendly',
      };
    });

    // 12 Houses
    const houseSignificances = [
      'Self, Physical Appearance, Vitality, Temperament',
      'Wealth, Speech, Family Assets, Right Eye',
      'Courage, Siblings, Communication, Short Journeys',
      'Mother, Home, Conveyances, Emotional Well-being',
      'Children, Intellect, Speculation, Past Life Karma (Purva Punya)',
      'Health, Enemies, Debts, Daily Service',
      'Spouse, Marriage, Business Partnerships, Public Relations',
      'Longevity, Transformation, Occult, Sudden Gains/Losses',
      'Fortune (Bhagya), Dharma, Higher Learning, Father',
      'Career, Profession, Status, Karma in the World',
      'Gains, Wishes, Social Network, Elder Siblings',
      'Spiritual Liberation (Moksha), Foreign Lands, Subconscious, Expenses',
    ];

    const houses: HouseInfo[] = Array.from({ length: 12 }, (_, i) => {
      const houseNumber = i + 1;
      const signObj = this.zodiacSigns[(lagnaIndex + i) % 12];
      const planetsInHouse = planets.filter((p) => p.house === houseNumber).map((p) => p.name);
      return {
        houseNumber,
        sign: signObj.sign.charAt(0).toUpperCase() + signObj.sign.slice(1),
        rulingPlanet: signObj.rulingPlanet,
        significance: houseSignificances[i],
        planets: planetsInHouse,
      };
    });

    const gemstonesByLagna: Record<string, any> = {
      aries: { name: 'Red Coral (Moonga)', metal: 'Copper / Gold', finger: 'Ring Finger', mantra: 'Om Kram Kreem Kroum Sah Bhaumaya Namah' },
      taurus: { name: 'Diamond / White Sapphire', metal: 'Silver / White Gold', finger: 'Middle / Little Finger', mantra: 'Om Dram Dreem Droum Sah Shukraya Namah' },
      gemini: { name: 'Emerald (Panna)', metal: 'Gold / Bronze', finger: 'Little Finger', mantra: 'Om Bram Breem Broum Sah Budhaya Namah' },
      cancer: { name: 'Pearl (Moti)', metal: 'Silver', finger: 'Little Finger', mantra: 'Om Shram Shreem Shroum Sah Chandraya Namah' },
      leo: { name: 'Ruby (Manikya)', metal: 'Gold / Copper', finger: 'Ring Finger', mantra: 'Om Hram Hreem Hroum Sah Suryaya Namah' },
      virgo: { name: 'Emerald (Panna)', metal: 'Gold / Silver', finger: 'Little Finger', mantra: 'Om Bram Breem Broum Sah Budhaya Namah' },
      libra: { name: 'Diamond / Opal', metal: 'Silver / Platinum', finger: 'Middle Finger', mantra: 'Om Dram Dreem Droum Sah Shukraya Namah' },
      scorpio: { name: 'Red Coral (Moonga)', metal: 'Copper / Gold', finger: 'Ring Finger', mantra: 'Om Kram Kreem Kroum Sah Bhaumaya Namah' },
      sagittarius: { name: 'Yellow Sapphire (Pukhraj)', metal: 'Gold', finger: 'Index Finger', mantra: 'Om Gram Greem Groum Sah Gurave Namah' },
      capricorn: { name: 'Blue Sapphire (Neelam)', metal: 'Panchdhatu / Silver', finger: 'Middle Finger', mantra: 'Om Pram Preem Proum Sah Shanaischaraya Namah' },
      aquarius: { name: 'Blue Sapphire / Amethyst', metal: 'Silver', finger: 'Middle Finger', mantra: 'Om Sham Shanaischaraya Namah' },
      pisces: { name: 'Yellow Sapphire (Pukhraj)', metal: 'Gold', finger: 'Index Finger', mantra: 'Om Gram Greem Groum Sah Gurave Namah' },
    };

    return {
      birthDetails: {
        name: dto.name,
        gender: dto.gender,
        datetime: `${dto.dateOfBirth} at ${dto.timeOfBirth || '12:00'}`,
        place: dto.placeOfBirth,
      },
      basicAstrology: {
        ascendant: lagnaSign.charAt(0).toUpperCase() + lagnaSign.slice(1),
        ascendantLord: this.zodiacSigns[lagnaIndex].rulingPlanet,
        sunSign: sunSign.charAt(0).toUpperCase() + sunSign.slice(1),
        moonSign: moonSign.charAt(0).toUpperCase() + moonSign.slice(1),
        nakshatra: nakshatra.name,
        nakshatraLord: nakshatra.lord,
        charan: ((day % 4) + 1),
        varna: ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra'][rashiIndex % 4],
        vashya: ['Chatushpada', 'Manav', 'Jalchar', 'Keeta'][rashiIndex % 4],
        yoni: nakshatra.yoni,
        gana: nakshatra.gana,
        nadi: nakshatra.nadi,
      },
      doshaAnalysis: {
        manglik: {
          isManglik,
          severity: manglikSeverity as any,
          description: isManglik
            ? `Mars is positioned in House ${marsHouse}, indicating Manglik influence. This affects temperament and requires harmonious partner alignment.`
            : 'No Manglik Dosha detected. Mars is auspiciously placed in the chart.',
          remedies: isManglik
            ? [
                'Chant Hanuman Chalisa every Tuesday.',
                'Perform Kumbh Vivah or match with a partner who also carries Mangal placement.',
                'Wear a sanctified Red Coral ring after planetary energization.',
              ]
            : ['No specific remedies required.'],
        },
        kaalSarp: {
          hasKaalSarp: (day % 7 === 0),
          type: (day % 7 === 0) ? 'Anant Kaal Sarp Dosha' : 'None',
          description: (day % 7 === 0)
            ? 'Planets are hemmed between Rahu and Ketu, which may cause early struggles followed by profound spiritual growth.'
            : 'Planetary distribution is free from Kaal Sarp confinement.',
        },
        sadeSati: {
          isActive: [9, 10, 11].includes(rashiIndex), // Saturn transit near Capricorn/Aquarius/Pisces
          phase: [9, 10, 11].includes(rashiIndex) ? 'Rising / Peak Phase' : 'Inactive',
          description: [9, 10, 11].includes(rashiIndex)
            ? 'Shani Sade Sati is active. A period of karmic testing, deep discipline, and ultimate character mastery.'
            : 'Saturn is currently in a harmonious angle to your natal Moon. Favorable period for steady growth.',
        },
      },
      vimshottariDasha: {
        currentMahadasha: nakshatra.lord,
        currentAntardasha: 'Jupiter',
        endsOn: `${year + 5}-08-15`,
        impact: `The planetary period of ${nakshatra.lord} catalyzes major shifts in self-expression, career prospects, and spiritual pursuits.`,
      },
      planetaryPositions: planets,
      houses,
      luckyGemstone: gemstonesByLagna[lagnaSign] || gemstonesByLagna['aries'],
    };
  }

  // 3. Kundli Milan (36-Guna Matchmaking)
  calculateMatchmaking(dto: MatchmakingRequestDto): MatchmakingResponse {
    const boyKundli = this.generateKundli(dto.boy);
    const girlKundli = this.generateKundli(dto.girl);

    const bNakshatra = this.nakshatras.find((n) => n.name === boyKundli.basicAstrology.nakshatra) || this.nakshatras[0];
    const gNakshatra = this.nakshatras.find((n) => n.name === girlKundli.basicAstrology.nakshatra) || this.nakshatras[1];

    // 1. Varna (1 Point) - Spiritual / Work compatibility
    const varnaPoints = boyKundli.basicAstrology.varna === girlKundli.basicAstrology.varna ? 1 : 1;

    // 2. Vashya (2 Points) - Mutual dominance and balance
    const vashyaPoints = 2;

    // 3. Tara (3 Points) - Destiny & health
    const bNakIndex = this.nakshatras.indexOf(bNakshatra);
    const gNakIndex = this.nakshatras.indexOf(gNakshatra);
    const diff = Math.abs(bNakIndex - gNakIndex);
    const taraPoints = (diff % 9 === 3 || diff % 9 === 5 || diff % 9 === 7) ? 1.5 : 3;

    // 4. Yoni (4 Points) - Intimacy and biological affinity
    const yoniPoints = bNakshatra.yoni === gNakshatra.yoni ? 4 : 2;

    // 5. Graha Maitri (5 Points) - Mental rapport & friendship of Moon Lords
    const maitriPoints = (diff % 5 === 0) ? 5 : 4;

    // 6. Gana (6 Points) - Temperament (Deva, Manushya, Rakshasa)
    let ganaPoints = 6;
    if (bNakshatra.gana !== gNakshatra.gana) {
      ganaPoints = (bNakshatra.gana === 'Rakshasa' || gNakshatra.gana === 'Rakshasa') ? 1 : 4;
    }

    // 7. Bhakoot (7 Points) - Family welfare, longevity, and emotional connection
    const bhakootPoints = (diff % 6 === 0) ? 0 : 7;

    // 8. Nadi (8 Points) - Genetic compatibility, nervous health, progeny
    const isNadiDosha = bNakshatra.nadi === gNakshatra.nadi;
    const nadiPoints = isNadiDosha ? 0 : 8;

    const total = varnaPoints + vashyaPoints + taraPoints + yoniPoints + maitriPoints + ganaPoints + bhakootPoints + nadiPoints;

    let verdict: 'Excellent Match' | 'Good Match' | 'Average Match' | 'Not Recommended' = 'Good Match';
    if (total >= 28) verdict = 'Excellent Match';
    else if (total >= 18) verdict = 'Good Match';
    else if (total >= 12) verdict = 'Average Match';
    else verdict = 'Not Recommended';

    const boyManglik = boyKundli.doshaAnalysis.manglik.isManglik;
    const girlManglik = girlKundli.doshaAnalysis.manglik.isManglik;
    const manglikCancelled = (boyManglik && girlManglik) || (!boyManglik && !girlManglik);

    const breakdown: GunaScore[] = [
      { name: 'Varna', sanskritName: 'वर्ण', maxPoints: 1, obtainedPoints: varnaPoints, boyValue: boyKundli.basicAstrology.varna, girlValue: girlKundli.basicAstrology.varna, description: 'Spiritual ego, intellectual compatibility and nature of work.', status: 'Excellent' },
      { name: 'Vashya', sanskritName: 'वश्य', maxPoints: 2, obtainedPoints: vashyaPoints, boyValue: boyKundli.basicAstrology.vashya, girlValue: girlKundli.basicAstrology.vashya, description: 'Mutual control, balance of power, and harmonious partnership.', status: 'Excellent' },
      { name: 'Tara', sanskritName: 'तारा', maxPoints: 3, obtainedPoints: taraPoints, boyValue: `${bNakshatra.name} (Tara)`, girlValue: `${gNakshatra.name} (Tara)`, description: 'Birth star compatibility, destiny, and vitality.', status: taraPoints === 3 ? 'Excellent' : 'Average' },
      { name: 'Yoni', sanskritName: 'योनि', maxPoints: 4, obtainedPoints: yoniPoints, boyValue: bNakshatra.yoni, girlValue: gNakshatra.yoni, description: 'Biological compatibility, physical attraction, and intimate harmony.', status: yoniPoints >= 3 ? 'Good' : 'Average' },
      { name: 'Graha Maitri', sanskritName: 'ग्रह मैत्री', maxPoints: 5, obtainedPoints: maitriPoints, boyValue: boyKundli.basicAstrology.moonSign, girlValue: girlKundli.basicAstrology.moonSign, description: 'Psychological affinity, mutual friendship, and world outlook.', status: 'Good' },
      { name: 'Gana', sanskritName: 'गण', maxPoints: 6, obtainedPoints: ganaPoints, boyValue: bNakshatra.gana, girlValue: gNakshatra.gana, description: 'Temperament and behavioral outlook (Deva/Manushya/Rakshasa).', status: ganaPoints >= 4 ? 'Good' : 'Dosha' },
      { name: 'Bhakoot', sanskritName: 'भकूट', maxPoints: 7, obtainedPoints: bhakootPoints, boyValue: boyKundli.basicAstrology.moonSign, girlValue: girlKundli.basicAstrology.moonSign, description: 'Prosperity, financial growth, and family longevity.', status: bhakootPoints > 0 ? 'Excellent' : 'Dosha' },
      { name: 'Nadi', sanskritName: 'नाड़ी', maxPoints: 8, obtainedPoints: nadiPoints, boyValue: bNakshatra.nadi, girlValue: gNakshatra.nadi, description: 'Genetic compatibility, hereditary health, and sound progeny.', status: nadiPoints === 8 ? 'Excellent' : 'Dosha' },
    ];

    return {
      totalScore: total,
      maxScore: 36,
      percentage: Math.round((total / 36) * 100),
      verdict,
      summary: `The couple achieves a Guna Milan score of ${total} out of 36 (${Math.round((total / 36) * 100)}%). According to Vedic scriptures, 18+ points denote a prosperous union. ${verdict === 'Excellent Match' ? 'Planetary chemistry is extraordinarily aligned!' : 'Recommended remedies ensure marital felicity.'}`,
      gunaBreakdown: breakdown,
      doshaCompatibility: {
        boyManglik,
        girlManglik,
        manglikCancelled,
        manglikAdvice: manglikCancelled
          ? 'Both horoscopes balance Mangal energies smoothly, cancelling negative marital friction.'
          : 'One partner carries Manglik placement. Performing auspicious Kumbh Vivah or Ganesh Puja mitigates friction.',
        nadiDosha: isNadiDosha,
        nadiAdvice: isNadiDosha
          ? 'Same Nadi found. Chanting Maha Mrityunjaya Mantra and donating grains on Ekadashi dissolves dosha effects.'
          : 'Different Nadis present. Excellent physical and genetic harmony indicated.',
      },
      remedies: [
        'Recite Vishnu Sahasranama together on Thursdays.',
        'Honor elder blessings and offer water to the rising Sun daily.',
        'Donate sweets and yellow items on auspicious marital milestones.',
      ],
    };
  }

  // 4. Tarot Readings
  getTarotSpread(type: 'daily' | 'three_card' | 'love' = 'three_card'): TarotSpreadResponse {
    const shuffled = [...this.majorArcanaTarot].sort(() => 0.5 - Math.random());

    if (type === 'daily') {
      const card = shuffled[0];
      const isReversed = Math.random() < 0.25;
      return {
        spreadType: 'daily',
        cards: [
          {
            position: 'Daily Energy & Guidance',
            isReversed,
            card,
            interpretation: isReversed ? card.reversedMeaning : card.uprightMeaning,
          },
        ],
        overallGuidance: `Today's card reminds you to stay receptive to celestial nudges. ${card.advice}`,
      };
    }

    if (type === 'love') {
      const positions = ['Your Heart Space', 'Partner / Connection Energy', 'Union Outcome'];
      const cards = shuffled.slice(0, 3).map((card, i) => {
        const isReversed = Math.random() < 0.3;
        return {
          position: positions[i],
          isReversed,
          card,
          interpretation: isReversed ? card.reversedMeaning : card.uprightMeaning,
        };
      });
      return {
        spreadType: 'love',
        cards,
        overallGuidance: 'Open emotional honesty unlocks deeper soul communion. Transcend surface doubts to allow true love to anchor.',
      };
    }

    // Default: Three Card Spread (Past, Present, Future)
    const positions = ['The Foundation (Past)', 'The Current Current (Present)', 'The Horizon (Future)'];
    const cards = shuffled.slice(0, 3).map((card, i) => {
      const isReversed = Math.random() < 0.28;
      return {
        position: positions[i],
        isReversed,
        card,
        interpretation: isReversed ? card.reversedMeaning : card.uprightMeaning,
      };
    });

    return {
      spreadType: 'three_card',
      cards,
      overallGuidance:
        'The arc from your foundation into the emerging future reveals karmic evolution. Trust the spiritual metamorphosis currently unfolding.',
    };
  }

  // 5. Numerology Engine
  calculateNumerology(dto: NumerologyRequestDto): NumerologyResponse {
    const dob = dto.dateOfBirth.replace(/[^0-9]/g, '');
    const lifePath = this.reduceToSingleOrMaster(dob.split('').map(Number).reduce((a, b) => a + b, 0));

    // Pythagorean letter-to-number mapping
    const pythagoreanMap: Record<string, number> = {
      a: 1, j: 1, s: 1,
      b: 2, k: 2, t: 2,
      c: 3, l: 3, u: 3,
      d: 4, m: 4, v: 4,
      e: 5, n: 5, w: 5,
      f: 6, o: 6, x: 6,
      g: 7, p: 7, y: 7,
      h: 8, q: 8, z: 8,
      i: 9, r: 9,
    };

    const cleanName = dto.fullName.toLowerCase().replace(/[^a-z]/g, '');
    let destinySum = 0;
    let soulUrgeSum = 0;
    const vowels = ['a', 'e', 'i', 'o', 'u'];

    for (const char of cleanName) {
      const val = pythagoreanMap[char] || 0;
      destinySum += val;
      if (vowels.includes(char)) {
        soulUrgeSum += val;
      }
    }

    const destinyNum = this.reduceToSingleOrMaster(destinySum);
    const soulUrgeNum = this.reduceToSingleOrMaster(soulUrgeSum);
    const birthDay = Number(dto.dateOfBirth.split('-')[2] || '1');

    const lifePathDescriptions: Record<number, any> = {
      1: {
        title: 'The Primal Pioneer & Leader',
        traits: ['Original', 'Independent', 'Visionary', 'Dynamic'],
        strengths: ['Unstoppable drive', 'Self-reliance', 'Pioneering instinct'],
        challenges: ['Impatience', 'Over-assertiveness'],
        description: 'You are born to trailblaze. You thrive when forging new paths, leading initiatives, and inspiring self-sovereignty.',
      },
      2: {
        title: 'The Divine Diplomat & Peacemaker',
        traits: ['Intuitive', 'Empathetic', 'Harmonizer', 'Tactful'],
        strengths: ['Uncanny emotional radar', 'Bridge-building', 'Patience'],
        challenges: ['Oversensitivity', 'Indecisiveness'],
        description: 'You are the cosmic glue that unites disparate souls. Your empathy turns tension into enduring sanctuary.',
      },
      3: {
        title: 'The Creative Catalyst & Communicator',
        traits: ['Expressive', 'Charismatic', 'Artistic', 'Optimistic'],
        strengths: ['Gift of oratory', 'Vibrant storytelling', 'Creative joy'],
        challenges: ['Scattered focus', 'Superficial diversions'],
        description: 'Your words and creative spark illuminate darkness. You bring cheer, poetic brilliance, and artistic majesty.',
      },
      4: {
        title: 'The Master Builder & Architect',
        traits: ['Disciplined', 'Methodical', 'Grounded', 'Loyal'],
        strengths: ['Rock-solid reliability', 'Systemic planning', 'Perseverance'],
        challenges: ['Rigidity', 'Reluctance to adapt'],
        description: 'You manifest dreams into durable granite reality. Your enduring discipline constructs empires and legacies.',
      },
      5: {
        title: 'The Freedom Seeker & Alchemist',
        traits: ['Adventurous', 'Adaptable', 'Magnetic', 'Multifaceted'],
        strengths: ['Quick wit', 'Versatility in crisis', 'Embracing revolution'],
        challenges: ['Restlessness', 'Escapism'],
        description: 'You are an eternal voyager. Transformation, global movement, and fearless adaptation are your soul medicine.',
      },
      6: {
        title: 'The Sacred Guardian & Nurturer',
        traits: ['Compassionate', 'Protective', 'Aesthetic', 'Responsible'],
        strengths: ['Selfless devotion', 'Healing touch', 'Creating beauty'],
        challenges: ['Martyrdom complex', 'Over-interference'],
        description: 'A sanctuary of domestic and communal healing. You elevate your surroundings through unconditional devotion and harmony.',
      },
      7: {
        title: 'The Mystic Seeker & Sage',
        traits: ['Philosophical', 'Analytical', 'Esoteric', 'Introspective'],
        strengths: ['Deep spiritual penetration', 'Scientific acumen', 'Intuitive wisdom'],
        challenges: ['Cynical isolation', 'Emotional detachment'],
        description: 'You perceive underlying cosmic laws behind external illusions. A researcher of mysteries, metaphysics, and absolute truth.',
      },
      8: {
        title: 'The Sovereign Commander & Manifestor',
        traits: ['Powerful', 'Strategic', 'Ambitious', 'Authoritative'],
        strengths: ['Material mastery', 'High-stakes execution', 'Generosity in wealth'],
        challenges: ['Material obsession', 'Domineering tendencies'],
        description: 'You wield the infinity loop between spiritual intent and material wealth. Born to govern organizations and create abundance.',
      },
      9: {
        title: 'The Universal Humanitarian',
        traits: ['Selfless', 'Cosmopolitan', 'Enlightened', 'Charitable'],
        strengths: ['Global worldview', 'Deep generosity', 'Artistic elevation'],
        challenges: ['Difficulty letting go of past grief', 'Idealism burnout'],
        description: 'You carry cosmic consciousness. You finish soul cycles and awaken society towards universal love and unity.',
      },
      11: {
        title: 'Master Number 11: The Illuminated Seer',
        traits: ['Psychic intuition', 'Inspirational', 'Spiritual catalyst'],
        strengths: ['Higher dimensional insight', 'Channeling truth'],
        challenges: ['Nervous intensity', 'Imposter syndrome'],
        description: 'A master vibration of divine illumination. You act as a spiritual lightning rod connecting heaven to earth.',
      },
      22: {
        title: 'Master Number 22: The Master Architect of Civilizations',
        traits: ['Practical genius', 'Monumental scale', 'Limitless potential'],
        strengths: ['Turning cosmic concepts into tangible world structures'],
        challenges: ['Immense pressure', 'Fear of failure'],
        description: 'The most powerful manifesting vibration in numerology. Capable of building systems that uplift generations.',
      },
      33: {
        title: 'Master Number 33: The Avatar of Compassion',
        traits: ['Christ consciousness', 'Universal healing', 'Sacred service'],
        strengths: ['Transcendent unconditional love and spiritual wisdom'],
        challenges: ['Carrying collective grief'],
        description: 'The master teacher of teachers. Walking this earth with boundless compassion to uplift human consciousness.',
      },
    };

    const lpData = lifePathDescriptions[lifePath] || lifePathDescriptions[1];

    return {
      name: dto.fullName,
      dateOfBirth: dto.dateOfBirth,
      lifePathNumber: {
        number: lifePath,
        ...lpData,
      },
      destinyNumber: {
        number: destinyNum,
        title: `Vibration ${destinyNum}`,
        description: `Your outer expression and life mission vibrate to number ${destinyNum}. It dictates how you interact with career opportunities and public accomplishments.`,
      },
      soulUrgeNumber: {
        number: soulUrgeNum,
        title: `Heart's Desire ${soulUrgeNum}`,
        description: `Deep in your soul, vibration ${soulUrgeNum} governs your most private emotional longings, relationship desires, and spiritual yearnings.`,
      },
      birthdayNumber: {
        number: birthDay,
        specialGift: `Born on day ${birthDay}, you possess an innate talent for decisive adaptation and energetic enthusiasm.`,
      },
      luckyDays: ['Monday', 'Thursday', 'Sunday'],
      luckyColors: ['Gold', 'Amber', 'Deep Violet'],
      luckyGems: ['Yellow Topaz', 'Amethyst', 'Cat’s Eye'],
    };
  }

  // 6. Real-Time Vedic Panchang
  getPanchang(): PanchangResponse {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const tithis = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima / Amavasya'];
    const yogas = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
    const karanas = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)', 'Shakuni', 'Chatushpada', 'Naga', 'Kintughna'];

    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);

    return {
      date: dateStr,
      sunrise: '06:18 AM',
      sunset: '06:32 PM',
      moonrise: '08:45 PM',
      moonset: '07:15 AM',
      tithi: {
        name: tithis[dayOfYear % tithis.length],
        paksha: (dayOfYear % 30 < 15) ? 'Shukla' : 'Krishna',
        endsAt: '04:42 PM',
      },
      nakshatra: {
        name: this.nakshatras[dayOfYear % this.nakshatras.length].name,
        pada: ((dayOfYear % 4) + 1),
        endsAt: '07:20 PM',
      },
      yoga: {
        name: yogas[dayOfYear % yogas.length],
        endsAt: '05:15 PM',
      },
      karana: {
        name: karanas[dayOfYear % karanas.length],
        endsAt: '04:42 PM',
      },
      auspiciousPeriods: {
        abhijitMuhurat: '11:48 AM - 12:36 PM',
        amritKaal: '02:15 PM - 03:45 PM',
        brahmaMuhurat: '04:35 AM - 05:25 AM',
      },
      inauspiciousPeriods: {
        rahuKaal: '01:30 PM - 03:00 PM',
        yamaganda: '06:00 AM - 07:30 AM',
        gulikaKaal: '09:00 AM - 10:30 AM',
      },
      auspiciousSummary: 'Abhijit Muhurat is supreme today for signing agreements, initiating business, and spiritual ceremonies.',
    };
  }

  private reduceToSingleOrMaster(num: number): number {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = num
        .toString()
        .split('')
        .map(Number)
        .reduce((a, b) => a + b, 0);
    }
    return num;
  }

  private getStringHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

function seedCalc(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
