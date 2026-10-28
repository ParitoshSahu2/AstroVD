// High-accuracy English to Hindi translation utility for AstroVD
const translationCache = new Map<string, string>();

// Spiritual, Vedic, and devotional terminology dictionary
const ASTRO_DICTIONARY: Record<string, string> = {
  'Varanasi': 'वाराणसी',
  'Kashi': 'काशी',
  'Dashashwamedh Sanctum, Varanasi': 'दशाश्वमेध घाट, वाराणसी',
  'Dashashwamedh Ghat, Varanasi': 'दशाश्वमेध घाट, वाराणसी',
  'Kashi Vishwanath Corridor, Varanasi': 'श्री काशी विश्वनाथ कॉरिडोर, वाराणसी',
  'Kashi Vishwanath Temple, Varanasi': 'श्री काशी विश्वनाथ मंदिर, वाराणसी',
  'Assi Ghat, Varanasi': 'अस्सी घाट, वाराणसी',
  'Manikarnika Ghat, Varanasi': 'मणिकर्णिका घाट, वाराणसी',
  'Vedic Muhurta': 'शुभ मुहूर्त',
  'Shubh Muhurta': 'शुभ मुहूर्त',
  'Mahashivratri Muhurta': 'महाशिवरात्रि पावन मुहूर्त',
  'Navratri Muhurta': 'नवरात्रि पावन मुहूर्त',
  'Shravan Somwar Muhurta': 'श्रावण सोमवार पावन मुहूर्त',
  'Dev Deepawali Muhurta': 'देव दीपावली पावन मुहूर्त',
  'Purnima Muhurta': 'पूर्णिमा सिद्धि मुहूर्त',
  'Amavasya Muhurta': 'अमावस्या शांति मुहूर्त',
  'Sacred Poojas & Havan': 'वैदिक पूजा व महाहवन',
  'Vedic Consultations': 'वैदिक ज्योतिष परामर्श',
  'Yantras & Gemstones': 'सिद्ध यंत्र एवं रत्न',
  'Honors & Certifications': 'राष्ट्रीय सम्मान एवं पुरस्कार',
  'Temple Anushthan & Varanasi': 'काशी अनुष्ठान व देवालय',
  'Honors & Recognitions': 'राष्ट्रीय सम्मान व पुरस्कार',
  'Astrology': 'ज्योतिष',
  'Astrologer': 'ज्योतिषाचार्य',
  'Kundli': 'जन्मपत्रिका',
  'Horoscope': 'कुंडली',
  'Rudrabhishek': 'रुद्राभिषेक',
  'Maha Yagya': 'महायज्ञ',
  'Havan': 'महाहवन',
  'Puja': 'पूजा',
  'Pooja': 'पूजा',
  'Anushthan': 'अनुष्ठान',
  'Prasad': 'प्रसाद',
  'Darshan': 'दर्शन',
  'Temple': 'मंदिर',
  'Ghat': 'घाट',
  'Consecrated': 'प्राण-प्रतिष्ठित',
  'Sanctum': 'गर्भगृह',
};

/**
 * Translates English text to authentic Hindi (Devanagari script).
 * Uses local Vedic dictionary, in-memory caching, and fast translation API.
 */
export async function translateEnToHi(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';

  // Check cache first
  if (translationCache.has(trimmed)) {
    return translationCache.get(trimmed)!;
  }

  // Check dictionary
  if (ASTRO_DICTIONARY[trimmed]) {
    translationCache.set(trimmed, ASTRO_DICTIONARY[trimmed]);
    return ASTRO_DICTIONARY[trimmed];
  }

  // Fast translation via translation API
  try {
    const encoded = encodeURIComponent(trimmed);
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|hi`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (
        translated &&
        typeof translated === 'string' &&
        !translated.toLowerCase().includes('quota') &&
        translated.trim() !== trimmed
      ) {
        const clean = translated.trim();
        translationCache.set(trimmed, clean);
        return clean;
      }
    }
  } catch (err) {
    // Graceful fallback on network timeout
    console.warn('Auto-translation network notice:', err);
  }

  // Check partial dictionary word replacements
  let partialReplaced = trimmed;
  for (const [enWord, hiWord] of Object.entries(ASTRO_DICTIONARY)) {
    const regex = new RegExp(`\\b${enWord}\\b`, 'gi');
    if (regex.test(partialReplaced)) {
      partialReplaced = partialReplaced.replace(regex, hiWord);
    }
  }

  translationCache.set(trimmed, partialReplaced);
  return partialReplaced;
}
