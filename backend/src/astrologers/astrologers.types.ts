export interface Astrologer {
  id: string;
  name: string;
  avatar: string;
  title: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  specializations: string[];
  languages: string[];
  ratePerMin: number;
  originalRate: number;
  status: 'Online' | 'Busy' | 'Offline';
  bio: string;
  totalOrders: number;
}

export class BookingRequestDto {
  astrologerId: string;
  userName: string;
  userPhone: string;
  consultationType: 'chat' | 'call' | 'video';
  durationMinutes: number;
  birthDetails?: {
    dob: string;
    tob: string;
    pob: string;
  };
  queryTopic?: string;
}

export interface BookingResponse {
  bookingId: string;
  astrologer: Astrologer;
  consultationType: string;
  durationMinutes: number;
  totalAmount: number;
  status: 'Confirmed' | 'Pending' | 'Connecting';
  scheduledTime: string;
  message: string;
}
