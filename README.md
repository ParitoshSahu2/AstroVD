# 🌌 AstroVeda - Full-Stack MERN, NestJS & Next.js Astrology Platform

A modern, full-stack Vedic & Western Astrology web application built with **NestJS** (Backend API), **MongoDB / Mongoose** (Database & MERN), and **Next.js** (App Router Frontend with Tailwind CSS).

---

## 🌟 Features

1. **Daily, Weekly & Monthly Horoscopes**:
   - 12 Zodiac signs with accurate element alignments, ruling planets, lucky numbers, colors, power crystals, and planetary transit aspects.
   - Dynamic cosmic meters for Love, Career, Luck, and Vitality.

2. **Vedic Janam Kundli & Birth Chart**:
   - Accurate calculation of Ascendant (Lagna), Moon Sign (Rashi), Sun Sign, and Nakshatra with Charan & Pada.
   - Interactive North Indian Diamond Kundli SVG representation with 12 Bhavas and planetary positions (Grahas: Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu, Ketu).
   - Manglik Dosha severity & Kaal Sarp analysis with Vedic remedies.
   - Prescribed astrological gemstone, setting metal, and planetary mantra.

3. **Ashtakoot Kundli Milan (36-Guna Matchmaking)**:
   - Full 8-Guna evaluation: Varna (1), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7), and Nadi (8).
   - Compatibility verdict badge, Nadi dosha analysis, and marital harmony advice.

4. **Major Arcana Sacred Tarot Deck**:
   - Interactive 3D flip card animations on click.
   - 3-Card spread (Past, Present, Future), Daily Oracle, and Love bond spreads.
   - Upright & reversed dynamics with keywords, archetypal wisdom, and guidance.

5. **Numerology Life Matrix**:
   - Pythagorean & Chaldean algorithms for Life Path Number, Destiny/Expression Number, and Soul Urge (Heart's Desire) Number.
   - Master numbers (11, 22, 33) support with detailed personality traits and lucky resonances.

6. **Real-Time Vedic Panchang & Muhurat**:
   - The 5 limbs of Hindu time: Tithi, Nakshatra, Yoga, Karana, and Vaar.
   - Exact timings for auspicious periods (Abhijit Muhurat, Amrit Kaal, Brahma Muhurat) and inauspicious periods (Rahu Kaal, Yamaganda).

7. **Verified Astrologer Consultations**:
   - Directory of certified astrologers across Vedic, Tarot, KP Astrology, and Palmistry.
   - Instant booking flow for Audio Call, Live Chat, and Video consultation.

8. **Authentication & Cosmic Wallet**:
   - JWT authentication with secure password hashing (`bcryptjs`).
   - Free welcome credit of 150 points for live consultations.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ or v20+ / v22+
- **npm** v9+ or v10+

### 2. Running Both Services Concurrently
From the project root:
```bash
npm run dev
```
This launches:
- **NestJS Backend**: [http://localhost:5000/api](http://localhost:5000/api)
- **Interactive Swagger API Docs**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **Next.js Frontend**: [http://localhost:3000](http://localhost:3000)

### 3. Running Services Individually
- **Backend Only**:
  ```bash
  npm run dev:backend
  ```
- **Frontend Only**:
  ```bash
  npm run dev:frontend
  ```

### 4. Building for Production
```bash
npm run build
```

---

## 📦 Installed Dependencies

### Backend (`/backend`)
- `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`: NestJS framework
- `@nestjs/mongoose`, `mongoose`: MongoDB Object Data Modeling (MERN)
- `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`: JWT authentication
- `bcryptjs`: Password hashing
- `class-validator`, `class-transformer`: DTO validation
- `@nestjs/swagger`, `swagger-ui-express`: Interactive OpenAPI documentation
- `@nestjs/config`: Environment variable management

### Frontend (`/frontend`)
- `next`: Next.js 16 (App Router with Turbopack)
- `react`, `react-dom`: React 19
- `tailwindcss`: Tailwind CSS styling with custom cosmic dark theme
- `lucide-react`: Modern icons
- `canvas-confetti`: Interactive celebratory animations
- `clsx`, `tailwind-merge`: Dynamic utility classes
