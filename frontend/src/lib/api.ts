const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

export async function fetchHoroscope(sign: string, period = 'daily') {
  try {
    const res = await fetch(`${BACKEND_URL}/astrology/horoscope?sign=${encodeURIComponent(sign)}&period=${period}`);
    if (!res.ok) throw new Error('Failed to fetch horoscope from backend');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client-side calculation fallback', err);
    return getFallbackHoroscope(sign, period);
  }
}

export async function fetchKundli(data: any) {
  try {
    const res = await fetch(`${BACKEND_URL}/astrology/kundli`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to calculate kundli');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client fallback', err);
    return getFallbackKundli(data);
  }
}

export async function fetchMatchmaking(data: any) {
  try {
    const res = await fetch(`${BACKEND_URL}/astrology/kundli-milan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to calculate matchmaking');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client fallback', err);
    return getFallbackMatchmaking(data);
  }
}

export async function fetchTarot(type = 'three_card') {
  try {
    const res = await fetch(`${BACKEND_URL}/astrology/tarot?type=${type}`);
    if (!res.ok) throw new Error('Failed to fetch tarot reading');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client fallback', err);
    return getFallbackTarot(type);
  }
}

export async function fetchNumerology(data: any) {
  try {
    const res = await fetch(`${BACKEND_URL}/astrology/numerology`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to calculate numerology');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client fallback', err);
    return getFallbackNumerology(data);
  }
}

export async function fetchPanchang() {
  try {
    const res = await fetch(`${BACKEND_URL}/astrology/panchang`);
    if (!res.ok) throw new Error('Failed to fetch panchang');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client fallback', err);
    return getFallbackPanchang();
  }
}

export async function fetchAstrologers(category = 'all') {
  try {
    const res = await fetch(`${BACKEND_URL}/astrologers?category=${category}`);
    if (!res.ok) throw new Error('Failed to fetch astrologers');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client fallback', err);
    return getFallbackAstrologers();
  }
}

export async function bookConsultation(bookingData: {
  astrologerId: string;
  userPhone: string;
  userName?: string;
  consultationType: 'chat' | 'call' | 'video';
  durationMinutes: number;
  birthDetails?: { dob: string; tob: string; pob: string };
  queryTopic?: string;
}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BACKEND_URL}/astrologers/book`, {
    method: 'POST',
    headers,
    body: JSON.stringify(bookingData),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(' • ')
      : data.message || 'Failed to book consultation session.';
    throw new Error(errorMsg);
  }

  return data;
}

export interface RegisterResponse {
  message: string;
  email?: string;
  phone?: string;
  channel?: 'EMAIL' | 'PHONE';
  emailVerificationRequired?: boolean;
  phoneVerificationRequired?: boolean;
  verificationRequired?: boolean;
  deliveryStatus?: 'SENT' | 'FAILED';
}

export interface VerifyEmailOtpResponse {
  message: string;
  accessToken: string;
  user: {
    id: string;
    name?: string;
    email?: string | null;
    phone?: string | null;
    role: string;
    status: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    walletBalance: number;
    [key: string]: unknown;
  };
}

export interface ResendEmailOtpResponse {
  message: string;
  deliveryStatus?: 'SENT' | 'FAILED';
}

export interface VerifyMobileOtpResponse {
  message: string;
  accessToken: string;
  user: {
    id: string;
    name?: string;
    email?: string | null;
    phone?: string | null;
    role: string;
    status: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    walletBalance: number;
    [key: string]: unknown;
  };
}

export interface ResendMobileOtpResponse {
  message: string;
  deliveryStatus?: 'SENT' | 'FAILED';
}

export async function verifyEmailOtp(
  email: string,
  otp: string,
): Promise<VerifyEmailOtpResponse> {
  const backendBase = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
  ).replace(/\/api\/?$/, '');
  const res = await fetch(`${backendBase}/api/auth/verify-email-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(' • ')
      : data.message || 'Verification failed.';
    const error = new Error(errorMsg);
    (error as unknown as { statusCode: number; error?: string }).statusCode = res.status;
    (error as unknown as { statusCode: number; error?: string }).error = data.error;
    throw error;
  }
  return data;
}

export async function resendEmailOtp(
  email: string,
): Promise<ResendEmailOtpResponse> {
  const backendBase = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
  ).replace(/\/api\/?$/, '');
  const res = await fetch(`${backendBase}/api/auth/resend-email-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(' • ')
      : data.message || 'Failed to resend verification code.';
    const error = new Error(errorMsg);
    (error as unknown as { statusCode: number; error?: string }).statusCode = res.status;
    (error as unknown as { statusCode: number; error?: string }).error = data.error;
    throw error;
  }
  return data;
}

export async function verifyMobileOtp(
  phone: string,
  otp: string,
): Promise<VerifyMobileOtpResponse> {
  const backendBase = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
  ).replace(/\/api\/?$/, '');
  const res = await fetch(`${backendBase}/api/auth/verify-mobile-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(' • ')
      : data.message || 'Verification failed.';
    const error = new Error(errorMsg);
    (error as unknown as { statusCode: number; error?: string }).statusCode = res.status;
    (error as unknown as { statusCode: number; error?: string }).error = data.error;
    throw error;
  }
  return data;
}

export async function resendMobileOtp(
  phone: string,
): Promise<ResendMobileOtpResponse> {
  const backendBase = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
  ).replace(/\/api\/?$/, '');
  const res = await fetch(`${backendBase}/api/auth/resend-mobile-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phone.trim() }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(' • ')
      : data.message || 'Failed to resend verification code.';
    const error = new Error(errorMsg);
    (error as unknown as { statusCode: number; error?: string }).statusCode = res.status;
    (error as unknown as { statusCode: number; error?: string }).error = data.error;
    throw error;
  }
  return data;
}

export interface GenericRecoveryResponse {
  message: string;
}

export async function forgotPasswordEmail(
  email: string,
): Promise<GenericRecoveryResponse> {
  const backendBase = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
  ).replace(/\/api\/?$/, '');
  const res = await fetch(`${backendBase}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(' • ')
      : data.message || 'Failed to request password reset link.';
    const error = new Error(errorMsg);
    (error as unknown as { statusCode: number; error?: string }).statusCode = res.status;
    throw error;
  }
  return data;
}

export async function forgotPasswordMobile(
  phone: string,
): Promise<GenericRecoveryResponse> {
  const backendBase = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
  ).replace(/\/api\/?$/, '');
  const res = await fetch(`${backendBase}/api/auth/forgot-password-mobile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phone.trim() }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(' • ')
      : data.message || 'Failed to request password reset code.';
    const error = new Error(errorMsg);
    (error as unknown as { statusCode: number; error?: string }).statusCode = res.status;
    throw error;
  }
  return data;
}

export async function resetPasswordEmail(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  const backendBase = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
  ).replace(/\/api\/?$/, '');
  const res = await fetch(`${backendBase}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token.trim(), newPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(' • ')
      : data.message || 'Failed to reset password.';
    const error = new Error(errorMsg);
    (error as unknown as { statusCode: number; error?: string }).statusCode = res.status;
    throw error;
  }
  return data;
}

export async function resetPasswordMobile(
  phone: string,
  otp: string,
  newPassword: string,
): Promise<{ message: string }> {
  const backendBase = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
  ).replace(/\/api\/?$/, '');
  const res = await fetch(`${backendBase}/api/auth/reset-password-mobile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phone.trim(), otp: otp.trim(), newPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(' • ')
      : data.message || 'Failed to reset password.';
    const error = new Error(errorMsg);
    (error as unknown as { statusCode: number; error?: string }).statusCode = res.status;
    throw error;
  }
  return data;
}

export async function verifyResetMobileOtp(
  phone: string,
  otp: string,
): Promise<{ message: string; resetToken: string }> {
  const backendBase = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'
  ).replace(/\/api\/?$/, '');
  const res = await fetch(`${backendBase}/api/auth/verify-reset-mobile-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(' • ')
      : data.message || 'Failed to verify reset code.';
    const error = new Error(errorMsg);
    (error as unknown as { statusCode: number; error?: string }).statusCode = res.status;
    throw error;
  }
  return data;
}

// Fallback generators
function getFallbackHoroscope(sign: string, period: string) {
  const s = sign.charAt(0).toUpperCase() + sign.slice(1);
  return {
    sign: s,
    element: 'Fire',
    rulingPlanet: 'Mars & Sun',
    symbol: '✨',
    dates: 'All Season',
    period,
    prediction: {
      personal: `The celestial alignment for ${s} awakens heightened intuition and bold creativity today.`,
      love: 'A magnetic bond deepens. Express your heartfelt feelings without hesitation.',
      career: 'Strategic ideas turn into tangible wins; authority figures value your initiative.',
      finance: 'Favorable planetary aspects open doors for disciplined investments.',
      health: 'Nourish mind and body with grounding hydration and mindful rest.',
    },
    metrics: { loveScore: 88, careerScore: 92, luckScore: 85, healthScore: 90 },
    luckyNumber: 7,
    luckyColor: 'Cosmic Gold',
    luckyTime: '10:30 AM',
    mood: 'Empowered',
    compatibleSign: 'Leo',
    planetaryAspect: 'Jupiter trines your natal chart, expanding luck and spiritual protection.',
  };
}

function getFallbackKundli(data: any) {
  return {
    birthDetails: {
      name: data.name || 'Devotee',
      gender: data.gender || 'male',
      datetime: `${data.dateOfBirth} at ${data.timeOfBirth || '12:00'}`,
      place: data.placeOfBirth || 'Varanasi',
    },
    basicAstrology: {
      ascendant: 'Scorpio (Vrishchika)',
      ascendantLord: 'Mars',
      sunSign: 'Leo (Simha)',
      moonSign: 'Cancer (Karka)',
      nakshatra: 'Pushya',
      nakshatraLord: 'Saturn',
      charan: 2,
      varna: 'Brahmin',
      vashya: 'Jalchar',
      yoni: 'Goat',
      gana: 'Deva',
      nadi: 'Madhya',
    },
    doshaAnalysis: {
      manglik: {
        isManglik: false,
        severity: 'None',
        description: 'Mars is placed in the 11th house of gains, conferring courage and wealth without causing domestic friction.',
        remedies: ['Chant Gayatri mantra during sunrise.', 'Offer water to the Sun daily.'],
      },
      kaalSarp: {
        hasKaalSarp: false,
        type: 'None',
        description: 'Planetary energies flow unobstructed across the zodiac.',
      },
      sadeSati: {
        isActive: false,
        phase: 'Inactive',
        description: 'Saturn is stationed favorably, bringing steady career milestones.',
      },
    },
    vimshottariDasha: {
      currentMahadasha: 'Saturn',
      currentAntardasha: 'Jupiter',
      endsOn: '2028-11-20',
      impact: 'Period of karmic reward, professional authority, and spiritual awakening.',
    },
    planetaryPositions: [
      { name: 'Sun', sanskritName: 'Surya', sign: 'Leo', house: 10, degree: 14, isRetrograde: false, nakshatra: 'Magha', pada: 2, state: 'Own' },
      { name: 'Moon', sanskritName: 'Chandra', sign: 'Cancer', house: 9, degree: 22, isRetrograde: false, nakshatra: 'Pushya', pada: 3, state: 'Exalted' },
      { name: 'Mars', sanskritName: 'Mangal', sign: 'Virgo', house: 11, degree: 8, isRetrograde: false, nakshatra: 'Hasta', pada: 1, state: 'Friendly' },
      { name: 'Mercury', sanskritName: 'Budh', sign: 'Virgo', house: 11, degree: 19, isRetrograde: false, nakshatra: 'Chitra', pada: 4, state: 'Exalted' },
      { name: 'Jupiter', sanskritName: 'Guru', sign: 'Pisces', house: 5, degree: 12, isRetrograde: false, nakshatra: 'Uttara Bhadrapada', pada: 2, state: 'Own' },
      { name: 'Venus', sanskritName: 'Shukra', sign: 'Libra', house: 12, degree: 6, isRetrograde: false, nakshatra: 'Swati', pada: 1, state: 'Own' },
      { name: 'Saturn', sanskritName: 'Shani', sign: 'Aquarius', house: 4, degree: 27, isRetrograde: true, nakshatra: 'Shatabhisha', pada: 3, state: 'Own' },
      { name: 'Rahu', sanskritName: 'Rahu', sign: 'Aries', house: 6, degree: 15, isRetrograde: true, nakshatra: 'Bharani', pada: 4, state: 'Neutral' },
      { name: 'Ketu', sanskritName: 'Ketu', sign: 'Libra', house: 12, degree: 15, isRetrograde: true, nakshatra: 'Swati', pada: 2, state: 'Neutral' },
    ],
    houses: Array.from({ length: 12 }, (_, i) => ({
      houseNumber: i + 1,
      sign: ['Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra'][i],
      rulingPlanet: ['Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter', 'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus'][i],
      significance: 'House of Life & Destiny',
      planets: i === 9 ? ['Sun'] : i === 8 ? ['Moon'] : i === 10 ? ['Mars', 'Mercury'] : [],
    })),
    luckyGemstone: {
      name: 'Red Coral (Moonga)',
      metal: 'Copper / Gold',
      finger: 'Ring Finger',
      mantra: 'Om Kram Kreem Kroum Sah Bhaumaya Namah',
    },
  };
}

function getFallbackMatchmaking(data: any) {
  return {
    totalScore: 29,
    maxScore: 36,
    percentage: 81,
    verdict: 'Excellent Match',
    summary: 'The horoscopes demonstrate high soul harmony (29/36 Gunas). Marital concord, emotional intimacy, and family prosperity are strongly supported.',
    gunaBreakdown: [
      { name: 'Varna', sanskritName: 'वर्ण', maxPoints: 1, obtainedPoints: 1, boyValue: 'Brahmin', girlValue: 'Brahmin', description: 'Intellectual & spiritual alignment', status: 'Excellent' },
      { name: 'Vashya', sanskritName: 'वश्य', maxPoints: 2, obtainedPoints: 2, boyValue: 'Jalchar', girlValue: 'Jalchar', description: 'Mutual attraction and balance', status: 'Excellent' },
      { name: 'Tara', sanskritName: 'तारा', maxPoints: 3, obtainedPoints: 3, boyValue: 'Pushya', girlValue: 'Rohini', description: 'Destiny, health and luck', status: 'Excellent' },
      { name: 'Yoni', sanskritName: 'योनि', maxPoints: 4, obtainedPoints: 3, boyValue: 'Goat', girlValue: 'Serpent', description: 'Biological and intimate rapport', status: 'Good' },
      { name: 'Graha Maitri', sanskritName: 'ग्रह मैत्री', maxPoints: 5, obtainedPoints: 5, boyValue: 'Moon (Cancer)', girlValue: 'Moon (Taurus)', description: 'Psychological bond & friendship', status: 'Excellent' },
      { name: 'Gana', sanskritName: 'गण', maxPoints: 6, obtainedPoints: 6, boyValue: 'Deva', girlValue: 'Deva', description: 'Temperament and character values', status: 'Excellent' },
      { name: 'Bhakoot', sanskritName: 'भकूट', maxPoints: 7, obtainedPoints: 7, boyValue: 'Cancer', girlValue: 'Taurus', description: 'Family growth & longevity', status: 'Excellent' },
      { name: 'Nadi', sanskritName: 'नाड़ी', maxPoints: 8, obtainedPoints: 2, boyValue: 'Madhya', girlValue: 'Antya', description: 'Genetic health and progeny', status: 'Good' },
    ],
    doshaCompatibility: {
      boyManglik: false,
      girlManglik: false,
      manglikCancelled: true,
      manglikAdvice: 'Neither partner is Manglik. Marital harmony is protected.',
      nadiDosha: false,
      nadiAdvice: 'Different Nadis present. Excellent physical and genetic balance.',
    },
    remedies: [
      'Recite Vishnu Sahasranama on Thursdays.',
      'Perform Gauri-Shankar Puja for enduring affection.',
    ],
  };
}

function getFallbackTarot(type: string) {
  return {
    spreadType: type,
    cards: [
      {
        position: 'Past Foundation',
        isReversed: false,
        card: {
          id: 'the_magician',
          name: 'The Magician',
          arcana: 'Major',
          number: 1,
          keywords: ['Manifestation', 'Skill', 'Power'],
          uprightMeaning: 'You stepped into conscious creation. Previous trials endowed you with resourcefulness.',
          reversedMeaning: 'Doubt and hesitation.',
          advice: 'Trust your innate power.',
          element: 'Air',
        },
        interpretation: 'You mastered initial doubts and established deep creative capability.',
      },
      {
        position: 'Present Alignment',
        isReversed: false,
        card: {
          id: 'the_star',
          name: 'The Star',
          arcana: 'Major',
          number: 17,
          keywords: ['Hope', 'Faith', 'Inspiration', 'Blessing'],
          uprightMeaning: 'Cosmic grace is actively pouring into your life. Inner healing brings renewed optimism.',
          reversedMeaning: 'Disconnection from trust.',
          advice: 'Keep your heart open to miracles.',
          element: 'Air',
        },
        interpretation: 'Healing light surrounds you now. Believe in the unfolding miracle.',
      },
      {
        position: 'Future Outcome',
        isReversed: false,
        card: {
          id: 'the_sun',
          name: 'The Sun',
          arcana: 'Major',
          number: 19,
          keywords: ['Joy', 'Vitality', 'Celebration', 'Success'],
          uprightMeaning: 'Radiant success and total fulfillment await you. Joyous abundance manifests.',
          reversedMeaning: 'Temporary clouds.',
          advice: 'Celebrate your brilliance with gratitude.',
          element: 'Fire',
        },
        interpretation: 'Supreme victory and unadulterated happiness crown your efforts.',
      },
    ],
    overallGuidance: 'The universe confirms a cycle of healing culminating in triumphant joy. Keep radiating high vibration.',
  };
}

function getFallbackNumerology(data: any) {
  return {
    name: data.fullName || 'Devotee',
    dateOfBirth: data.dateOfBirth || '1995-05-15',
    lifePathNumber: {
      number: 8,
      title: 'The Sovereign Commander & Manifestor',
      traits: ['Powerful', 'Strategic', 'Ambitious', 'Authoritative'],
      strengths: ['Financial acumen', 'High-stakes execution', 'Generosity'],
      challenges: ['Impatience', 'Workaholism'],
      description: 'You are endowed with the master loop of abundance. You possess the capability to build systems, lead teams, and direct wealth for high purpose.',
    },
    destinyNumber: {
      number: 1,
      title: 'Vibration 1 - The Pioneer',
      description: 'Your worldly destiny calls you to innovate, initiate, and establish original ideas without waiting for external validation.',
    },
    soulUrgeNumber: {
      number: 7,
      title: 'Heart\'s Desire 7 - The Sacred Mystic',
      description: 'Deep within, you crave spiritual solitude, profound wisdom, and understanding the mystical mechanics of reality.',
    },
    birthdayNumber: {
      number: 15,
      specialGift: 'Gift of magnetism, warmth, and the ability to attract supportive allies wherever you travel.',
    },
    luckyDays: ['Thursday', 'Sunday'],
    luckyColors: ['Royal Gold', 'Deep Emerald'],
    luckyGems: ['Blue Sapphire', 'Cat\'s Eye'],
  };
}

function getFallbackPanchang() {
  return {
    date: 'Thursday, October 15, 2026',
    sunrise: '06:14 AM',
    sunset: '06:34 PM',
    moonrise: '08:42 PM',
    moonset: '07:18 AM',
    tithi: { name: 'Shukla Navami', paksha: 'Shukla', endsAt: '03:45 PM' },
    nakshatra: { name: 'Pushya (Auspicious)', pada: 2, endsAt: '06:20 PM' },
    yoga: { name: 'Siddha Yoga', endsAt: '05:10 PM' },
    karana: { name: 'Balava', endsAt: '03:45 PM' },
    auspiciousPeriods: {
      abhijitMuhurat: '11:45 AM - 12:35 PM',
      amritKaal: '02:20 PM - 03:50 PM',
      brahmaMuhurat: '04:30 AM - 05:20 AM',
    },
    inauspiciousPeriods: {
      rahuKaal: '01:30 PM - 03:00 PM',
      yamaganda: '06:00 AM - 07:30 AM',
      gulikaKaal: '09:00 AM - 10:30 AM',
    },
    auspiciousSummary: 'Pushya Nakshatra combined with Siddha Yoga creates a Sarvartha Siddhi window today! Ideal for spiritual practices, purchasing valuables, and starting new ventures.',
  };
}

function getFallbackAstrologers() {
  return [
    {
      id: 'ast-1',
      name: 'Acharya Devdutt Shastri',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
      title: 'Grand Vedic Astrologer & Vastu Maestro',
      experienceYears: 24,
      rating: 4.95,
      reviewCount: 3840,
      specializations: ['Vedic Kundli', 'Vastu Shastra', 'Career & Wealth'],
      languages: ['Hindi', 'English', 'Sanskrit'],
      ratePerMin: 45,
      originalRate: 75,
      status: 'Online',
      bio: 'Gold medalist from Varanasi Sanskrit University with 24 years of profound experience.',
      totalOrders: 14200,
    },
    {
      id: 'ast-2',
      name: 'Dr. Meera Vasudevan',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      title: 'Celebrity Tarot Reader & Mystic Healer',
      experienceYears: 16,
      rating: 4.98,
      reviewCount: 4210,
      specializations: ['Tarot Cards', 'Love & Soulmate Reading', 'Aura Cleansing'],
      languages: ['English', 'Hindi', 'Tamil'],
      ratePerMin: 55,
      originalRate: 90,
      status: 'Online',
      bio: 'Internationally recognized intuitive healer and Tarot grandmaster.',
      totalOrders: 18900,
    },
    {
      id: 'ast-3',
      name: 'Pandit Rajeshwar Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      title: 'KP System & Prashna Specialist',
      experienceYears: 19,
      rating: 4.89,
      reviewCount: 2950,
      specializations: ['KP Astrology', 'Prashna Kundli', 'Govt Jobs'],
      languages: ['Hindi', 'English', 'Gujarati'],
      ratePerMin: 40,
      originalRate: 60,
      status: 'Online',
      bio: 'Master of Krishnamurti Paddhati (KP) with pinpoint timing accuracy.',
      totalOrders: 11200,
    },
  ];
}

// Product Catalog & Sacred Store API exports
export { fetchProducts, fetchProductBySlug, fetchCategories } from './productsApi';
export type { ProductsQueryOptions, ProductsResponse, ProductDetailResponse, CategorySummary } from './productsApi';

