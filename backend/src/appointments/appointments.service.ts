import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { BookAppointmentDto, AppointmentSlot } from './appointments.types.js';

export interface BookingRecord {
  id: string;
  serviceId: string;
  astrologerId?: string;
  scheduledDate: string;
  scheduledTime: string;
  consultationType: 'video' | 'call' | 'in-person';
  contactPhone: string;
  customerName?: string;
  email?: string;
  notes?: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  meetLink?: string;
  createdAt: string;
}

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  private bookings: BookingRecord[] = [];

  private readonly standardSlots: Array<{ time: string; period: 'morning' | 'afternoon' | 'evening' }> = [
    { time: '09:00 AM', period: 'morning' },
    { time: '10:00 AM', period: 'morning' },
    { time: '11:00 AM', period: 'morning' },
    { time: '12:00 PM', period: 'morning' },
    { time: '02:00 PM', period: 'afternoon' },
    { time: '03:00 PM', period: 'afternoon' },
    { time: '04:00 PM', period: 'afternoon' },
    { time: '05:00 PM', period: 'afternoon' },
    { time: '06:00 PM', period: 'evening' },
    { time: '07:00 PM', period: 'evening' },
    { time: '08:00 PM', period: 'evening' },
    { time: '09:00 PM', period: 'evening' },
  ];

  /**
   * Generates and returns available slots for a given service and date
   */
  getAvailableSlots(serviceId: string, date: string): { serviceId: string; date: string; slots: AppointmentSlot[] } {
    const existingBookedTimes = new Set(
      this.bookings
        .filter((b) => b.scheduledDate === date && b.status !== 'CANCELLED')
        .map((b) => b.scheduledTime),
    );

    // Pseudorandom booked demo slots to make scheduling feel lively and realistic
    const dateHash = (date || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const demoBookedIndices = [dateHash % 12, (dateHash + 5) % 12];

    const slots: AppointmentSlot[] = this.standardSlots.map((s, idx) => {
      const isAlreadyBooked = existingBookedTimes.has(s.time) || demoBookedIndices.includes(idx);
      return {
        time: s.time,
        period: s.period,
        isAvailable: !isAlreadyBooked,
        reason: isAlreadyBooked ? 'Slot reserved' : undefined,
      };
    });

    return {
      serviceId,
      date,
      slots,
    };
  }

  /**
   * Reserves an appointment session
   */
  bookAppointment(dto: BookAppointmentDto): { success: boolean; booking: BookingRecord; message: string } {
    const isSlotTaken = this.bookings.some(
      (b) =>
        b.scheduledDate === dto.scheduledDate &&
        b.scheduledTime === dto.scheduledTime &&
        b.status !== 'CANCELLED',
    );

    if (isSlotTaken) {
      throw new ConflictException(
        `The time slot '${dto.scheduledTime}' on ${dto.scheduledDate} has just been reserved by another seeker. Please select another slot.`,
      );
    }

    const bookingId = `APT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const meetLink =
      dto.consultationType === 'video'
        ? `https://meet.jit.si/astrovd-${bookingId.toLowerCase()}`
        : undefined;

    const newBooking: BookingRecord = {
      id: bookingId,
      serviceId: dto.serviceId,
      astrologerId: dto.astrologerId || 'vishal',
      scheduledDate: dto.scheduledDate,
      scheduledTime: dto.scheduledTime,
      consultationType: dto.consultationType,
      contactPhone: dto.contactPhone,
      customerName: dto.customerName || 'Vedic Seeker',
      email: dto.email,
      notes: dto.notes,
      status: 'CONFIRMED',
      meetLink,
      createdAt: new Date().toISOString(),
    };

    this.bookings.push(newBooking);
    this.logger.log(`Appointment confirmed: ${bookingId} for ${newBooking.customerName} on ${newBooking.scheduledDate} at ${newBooking.scheduledTime}`);

    return {
      success: true,
      booking: newBooking,
      message: 'Consultation session booked successfully. May divine cosmic alignments guide your path.',
    };
  }

  /**
   * List all bookings for admin or user
   */
  getAllBookings() {
    return this.bookings;
  }
}
