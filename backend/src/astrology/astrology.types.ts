export interface HoroscopeResponse {
  sign: string;
  element: string;
  rulingPlanet: string;
  symbol: string;
  dates: string;
  period: string;
  prediction: {
    personal: string;
    love: string;
    career: string;
    finance: string;
    health: string;
  };
  metrics: {
    loveScore: number;
    careerScore: number;
    luckScore: number;
    healthScore: number;
  };
  luckyNumber: number;
  luckyColor: string;
  luckyTime: string;
  mood: string;
  compatibleSign: string;
  planetaryAspect: string;
}

export class KundliRequestDto {
  name: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:mm
  placeOfBirth: string;
  latitude?: number;
  longitude?: number;
  timezone?: number;
}

export interface PlanetPosition {
  name: string;
  sanskritName: string;
  sign: string;
  house: number;
  degree: number;
  isRetrograde: boolean;
  nakshatra: string;
  pada: number;
  state: 'Exalted' | 'Debilitated' | 'Own' | 'Friendly' | 'Neutral' | 'Enemy';
}

export interface HouseInfo {
  houseNumber: number;
  sign: string;
  rulingPlanet: string;
  significance: string;
  planets: string[];
}

export interface KundliResponse {
  birthDetails: {
    name: string;
    gender: string;
    datetime: string;
    place: string;
  };
  basicAstrology: {
    ascendant: string; // Lagna
    ascendantLord: string;
    sunSign: string; // Surya Rashi
    moonSign: string; // Chandra Rashi
    nakshatra: string;
    nakshatraLord: string;
    charan: number;
    varna: string;
    vashya: string;
    yoni: string;
    gana: string;
    nadi: string;
  };
  doshaAnalysis: {
    manglik: {
      isManglik: boolean;
      severity: 'None' | 'Mild' | 'High';
      description: string;
      remedies: string[];
    };
    kaalSarp: {
      hasKaalSarp: boolean;
      type: string;
      description: string;
    };
    sadeSati: {
      isActive: boolean;
      phase: string;
      description: string;
    };
  };
  vimshottariDasha: {
    currentMahadasha: string;
    currentAntardasha: string;
    endsOn: string;
    impact: string;
  };
  planetaryPositions: PlanetPosition[];
  houses: HouseInfo[];
  luckyGemstone: {
    name: string;
    metal: string;
    finger: string;
    mantra: string;
  };
}

export class MatchmakingRequestDto {
  boy: KundliRequestDto;
  girl: KundliRequestDto;
}

export interface GunaScore {
  name: string;
  sanskritName: string;
  maxPoints: number;
  obtainedPoints: number;
  boyValue: string;
  girlValue: string;
  description: string;
  status: 'Excellent' | 'Good' | 'Average' | 'Dosha';
}

export interface MatchmakingResponse {
  totalScore: number;
  maxScore: number;
  percentage: number;
  verdict: 'Excellent Match' | 'Good Match' | 'Average Match' | 'Not Recommended';
  summary: string;
  gunaBreakdown: GunaScore[];
  doshaCompatibility: {
    boyManglik: boolean;
    girlManglik: boolean;
    manglikCancelled: boolean;
    manglikAdvice: string;
    nadiDosha: boolean;
    nadiAdvice: string;
  };
  remedies: string[];
}

export interface TarotCard {
  id: string;
  name: string;
  arcana: 'Major' | 'Minor';
  suit?: 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
  number: number;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  advice: string;
  element: string;
  imageUrl?: string;
}

export interface TarotSpreadResponse {
  spreadType: 'daily' | 'three_card' | 'love';
  cards: {
    position: string;
    isReversed: boolean;
    card: TarotCard;
    interpretation: string;
  }[];
  overallGuidance: string;
}

export class NumerologyRequestDto {
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
}

export interface NumerologyResponse {
  name: string;
  dateOfBirth: string;
  lifePathNumber: {
    number: number;
    title: string;
    traits: string[];
    strengths: string[];
    challenges: string[];
    description: string;
  };
  destinyNumber: {
    number: number;
    title: string;
    description: string;
  };
  soulUrgeNumber: {
    number: number;
    title: string;
    description: string;
  };
  birthdayNumber: {
    number: number;
    specialGift: string;
  };
  luckyDays: string[];
  luckyColors: string[];
  luckyGems: string[];
}

export interface PanchangResponse {
  date: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  tithi: {
    name: string;
    paksha: 'Shukla' | 'Krishna';
    endsAt: string;
  };
  nakshatra: {
    name: string;
    pada: number;
    endsAt: string;
  };
  yoga: {
    name: string;
    endsAt: string;
  };
  karana: {
    name: string;
    endsAt: string;
  };
  auspiciousPeriods: {
    abhijitMuhurat: string;
    amritKaal: string;
    brahmaMuhurat: string;
  };
  inauspiciousPeriods: {
    rahuKaal: string;
    yamaganda: string;
    gulikaKaal: string;
  };
  auspiciousSummary: string;
}
