import { Injectable, NotFoundException } from '@nestjs/common';
import { Astrologer, BookingRequestDto, BookingResponse } from './astrologers.types.js';

@Injectable()
export class AstrologersService {
  private astrologers: Astrologer[] = [
    {
      id: 'vishal',
      name: 'Dr. Pandit Vishal Dubey',
      avatar: '/dr_vishal_dubey.jpg',
      title: 'PhD in Vedic Astrology & Certified Hypnotherapist',
      experienceYears: 24,
      rating: 5.0,
      reviewCount: 1420,
      specializations: ['Vedic Kundli', 'Planetary Dosha Rectification', 'Career & Wealth', 'Matchmaking'],
      languages: ['Hindi', 'English', 'Sanskrit'],
      ratePerMin: 70,
      originalRate: 100,
      status: 'Online',
      bio: 'Gold medalist from Varanasi Sanskrit University. 24+ years of divine astrological guidance in Vedic dosha rectification and karma alignment.',
      totalOrders: 9800,
    },
    {
      id: 'ast-1',
      name: 'Acharya Devdutt Shastri',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
      title: 'Grand Vedic Astrologer & Vastu Maestro',
      experienceYears: 24,
      rating: 4.95,
      reviewCount: 3840,
      specializations: ['Vedic Kundli', 'Vastu Shastra', 'Career & Wealth', 'Gemstone Remedies'],
      languages: ['Hindi', 'English', 'Sanskrit'],
      ratePerMin: 45,
      originalRate: 75,
      status: 'Online',
      bio: 'Gold medalist from Varanasi Sanskrit University. Guided over 25,000 clients across 30 countries on relationship karma and business prosperity.',
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
      specializations: ['Tarot Cards', 'Love & Soulmate Reading', 'Aura Cleansing', 'Psychic Guidance'],
      languages: ['English', 'Hindi', 'Tamil'],
      ratePerMin: 55,
      originalRate: 90,
      status: 'Online',
      bio: 'Internationally recognized intuitive healer and Tarot grandmaster. Specializes in decoding soul bonds, twin flames, and career forks.',
      totalOrders: 18900,
    },
    {
      id: 'ast-3',
      name: 'Pandit Rajeshwar Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      title: 'KP System & Prashna Kundli Specialist',
      experienceYears: 19,
      rating: 4.89,
      reviewCount: 2950,
      specializations: ['KP Astrology', 'Prashna Kundli (Horary)', 'Government Jobs', 'Litigation & Court'],
      languages: ['Hindi', 'English', 'Gujarati'],
      ratePerMin: 40,
      originalRate: 60,
      status: 'Online',
      bio: 'Master of Krishnamurti Paddhati (KP). Renowned for precise pinpoint timing of events with sub-lord calculations.',
      totalOrders: 11200,
    },
    {
      id: 'ast-4',
      name: 'Swamini Anandita Devi',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
      title: 'Chaldean Numerologist & Palmistry Mystic',
      experienceYears: 14,
      rating: 4.92,
      reviewCount: 2180,
      specializations: ['Numerology', 'Name Correction', 'Palmistry', 'Business Name Optimization'],
      languages: ['English', 'Hindi', 'Bengali'],
      ratePerMin: 35,
      originalRate: 50,
      status: 'Busy',
      bio: 'Author and sound vibrational numerologist. Successfully balanced corporate brand names and baby names for auspicious destiny numbers.',
      totalOrders: 8940,
    },
    {
      id: 'ast-5',
      name: 'Guru Vidyadhar Joshi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
      title: 'Nadi Astrology & Karmic Life Path Master',
      experienceYears: 28,
      rating: 4.96,
      reviewCount: 5120,
      specializations: ['Nadi Astrology', 'Past Life Regression', 'Dosha Nivaran', 'Marriage Matching'],
      languages: ['Hindi', 'English', 'Marathi'],
      ratePerMin: 60,
      originalRate: 100,
      status: 'Online',
      bio: 'Direct disciple in the Bhrigu & Agasthya Nadi traditions. Unravels deep past life debts and offers transformational mantra sadhana.',
      totalOrders: 22400,
    },
  ];

  getAllAstrologers(category?: string): Astrologer[] {
    if (!category || category === 'all') {
      return this.astrologers;
    }
    return this.astrologers.filter((ast) =>
      ast.specializations.some((s) => s.toLowerCase().includes(category.toLowerCase()))
    );
  }

  getAstrologerById(id: string): Astrologer {
    const found = this.astrologers.find((a) => a.id === id);
    if (!found) {
      throw new NotFoundException(`Astrologer with ID "${id}" was not found.`);
    }
    return found;
  }

  createBooking(dto: BookingRequestDto): BookingResponse {
    const astrologer = this.getAstrologerById(dto.astrologerId);
    const totalAmount = astrologer.ratePerMin * (dto.durationMinutes || 15);
    const bookingId = `BOOK-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    return {
      bookingId,
      astrologer,
      consultationType: dto.consultationType,
      durationMinutes: dto.durationMinutes,
      totalAmount,
      status: 'Confirmed',
      scheduledTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      message: `Your ${dto.consultationType.toUpperCase()} consultation with ${astrologer.name} is confirmed! Session room is being prepared.`,
    };
  }
}
