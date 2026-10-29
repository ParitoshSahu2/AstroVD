import fs from 'fs';
import path from 'path';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { SERVICES_CATALOGUE, PUBLISHED_TIME_SLOTS, ServiceCatalogueItem, generateWorkingHourSlots, isWithinGurujiWorkingHours, parseTimeToMinutes } from './services.data.js';
import { BookAppointmentDto } from './dto/book-appointment.dto.js';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto.js';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto.js';
import { CreateSlotDto } from './dto/create-slot.dto.js';
import { UpdateSlotDto } from './dto/update-slot.dto.js';
import { BlockDateDto } from './dto/block-date.dto.js';
import { InitializeScheduleDto } from './dto/initialize-schedule.dto.js';
import { normalizePhoneNumber, isValidE164 } from '../auth/phone.util.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';
import { EmailService } from '../email/email.service.js';

export const DEFAULT_GURUJI_MEET_LINK = 'https://meet.google.com/zrg-vfdz-jky';

export function formatGoogleMeetLink(bookingId?: string): string {
  const configured = process.env.GURUJI_MEET_LINK || process.env.NEXT_PUBLIC_GURUJI_MEET_LINK;
  if (configured && configured.trim().startsWith('https://meet.google.com/')) {
    return configured.trim();
  }
  return DEFAULT_GURUJI_MEET_LINK;
}

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  private readonly appointmentsFilePath = path.resolve(process.cwd(), 'data', 'appointments.json');
  private fallbackBookings: any[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {
    this.initFallbackBookings();
  }

  private initFallbackBookings() {
    try {
      if (fs.existsSync(this.appointmentsFilePath)) {
        const raw = fs.readFileSync(this.appointmentsFilePath, 'utf-8');
        this.fallbackBookings = JSON.parse(raw);
      } else {
        const dir = path.dirname(this.appointmentsFilePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        this.fallbackBookings = [];
        this.saveFallbackBookings();
      }
    } catch {
      this.fallbackBookings = [];
    }
  }

  private saveFallbackBookings() {
    try {
      const dir = path.dirname(this.appointmentsFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.appointmentsFilePath, JSON.stringify(this.fallbackBookings, null, 2), 'utf-8');
    } catch (e) {
      this.logger.error('Failed to save fallback appointments', e);
    }
  }

  /**
   * Return the canonical catalogue of 28 services, optionally filtered by category.
   */
  getServices(category?: string): ServiceCatalogueItem[] {
    if (!category || category === 'all') {
      return SERVICES_CATALOGUE;
    }
    return SERVICES_CATALOGUE.filter(
      (s) => s.categoryKey.toLowerCase() === category.toLowerCase(),
    );
  }

  /**
   * Return a single service by stable ID or slug.
   */
  getServiceById(serviceId: string): ServiceCatalogueItem {
    const service = SERVICES_CATALOGUE.find((s) => s.id === serviceId);
    if (!service) {
      throw new NotFoundException(`Service with ID "${serviceId}" does not exist in catalogue.`);
    }
    return service;
  }

  /**
   * Calculate published time slots for a service and date, querying PostgreSQL AppointmentSlot & BlockedDate.
   */
  async getAvailableSlots(serviceId: string, dateStr: string, requestedDuration?: number) {
    const service = this.getServiceById(serviceId); // Validate service exists

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      throw new BadRequestException('Date must be formatted as YYYY-MM-DD');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isPastDate = dateStr < todayStr;
    const durationMinutes =
      requestedDuration && requestedDuration >= 10 && requestedDuration <= 240
        ? requestedDuration
        : undefined;

    try {
      // Check if date is blocked in sanctuary registry
      const blockedDate = await this.prisma.blockedDate.findUnique({
        where: { date: dateStr },
      });
      if (blockedDate) {
        return {
          serviceId,
          date: dateStr,
          durationMinutes: durationMinutes || service.durationMinutes || 30,
          isBlocked: true,
          blockedReason: blockedDate.reason || 'Panditji is not accepting consultations on this date.',
          slots: [],
        };
      }

      // Query database-backed published slots
      let dbSlots = await this.prisma.appointmentSlot.findMany({
        where: {
          date: dateStr,
          isPublished: true,
        },
        orderBy: { startTime: 'asc' },
      });

      let slotTimes: string[];
      let effectiveDuration: number;

      if (durationMinutes) {
        slotTimes = generateWorkingHourSlots(durationMinutes);
        effectiveDuration = durationMinutes;
      } else if (dbSlots.length > 0) {
        slotTimes = dbSlots.map((s) => s.startTime);
        effectiveDuration = dbSlots[0]?.durationMinutes || service.durationMinutes || 30;
      } else {
        slotTimes = PUBLISHED_TIME_SLOTS;
        effectiveDuration = service.durationMinutes || 30;
      }

      // If no slots exist yet for this date, auto-seed published schedule so slots are persisted in DB
      if (dbSlots.length === 0 && !durationMinutes) {
        const defaultSlotsData = PUBLISHED_TIME_SLOTS.map((time, idx) => ({
          id: `slot-std-${idx}`,
          date: dateStr,
          startTime: time,
          durationMinutes: 45,
          isPublished: true,
        }));

        if (!isPastDate) {
          try {
            await this.prisma.appointmentSlot.createMany({
              data: defaultSlotsData.map(({ id, ...rest }) => rest),
              skipDuplicates: true,
            });

            const reloaded = await this.prisma.appointmentSlot.findMany({
              where: {
                date: dateStr,
                isPublished: true,
              },
              orderBy: { startTime: 'asc' },
            });

            dbSlots = reloaded.length > 0 ? reloaded : (defaultSlotsData as any);
          } catch (seedErr) {
            dbSlots = defaultSlotsData as any;
          }
        } else {
          dbSlots = defaultSlotsData as any;
        }
      }

      // Fetch existing non-cancelled bookings for this date
      const existingBookings = await this.prisma.booking.findMany({
        where: {
          scheduledDate: dateStr,
          status: { notIn: ['CANCELLED', 'REJECTED'] },
        },
        select: {
          id: true,
          scheduledTime: true,
          durationMinutes: true,
          serviceType: true,
          astrologerId: true,
        },
      });

      const fallbackOnDate = this.fallbackBookings.filter(
        (b) => b.scheduledDate === dateStr && !['CANCELLED', 'REJECTED'].includes(b.status),
      );

      const allBookings = [
        ...existingBookings.map((b) => ({
          time: b.scheduledTime,
          duration: b.durationMinutes || 30,
        })),
        ...fallbackOnDate.map((b) => ({
          time: b.scheduledTime,
          duration: b.durationMinutes || 30,
        })),
      ];

      const bookedIntervals = allBookings
        .map((b) => {
          const start = parseTimeToMinutes(b.time);
          return start >= 0 ? { start, end: start + (b.duration || 30) } : null;
        })
        .filter((iv) => iv !== null);

      const bookedTimesExact = new Set(allBookings.map((b) => b.time));

      const slots = slotTimes.map((time, idx) => {
        const slotStart = parseTimeToMinutes(time);
        const slotEnd = slotStart + effectiveDuration;
        const isColliding =
          bookedTimesExact.has(time) ||
          bookedIntervals.some(
            (b) => Math.max(slotStart, b.start) < Math.min(slotEnd, b.end),
          );

        if (isPastDate) {
          return {
            id: `slot-${idx}`,
            time,
            durationMinutes: effectiveDuration,
            isAvailable: false,
            reason: 'Date is in the past',
          };
        }

        if (isColliding) {
          return {
            id: `slot-${idx}`,
            time,
            durationMinutes: effectiveDuration,
            isAvailable: false,
            reason: 'Already Reserved',
          };
        }

        return {
          id: `slot-${idx}`,
          time,
          durationMinutes: effectiveDuration,
          isAvailable: true,
        };
      });

      return {
        serviceId,
        date: dateStr,
        durationMinutes: effectiveDuration,
        isBlocked: false,
        slots,
      };
    } catch (err: any) {
      // Graceful fallback if database is temporarily offline
      const fallbackOnDate = this.fallbackBookings.filter(
        (b) => b.scheduledDate === dateStr && !['CANCELLED', 'REJECTED'].includes(b.status),
      );
      const bookedIntervals = fallbackOnDate
        .map((b) => {
          const start = parseTimeToMinutes(b.scheduledTime);
          return start >= 0 ? { start, end: start + (b.durationMinutes || 30) } : null;
        })
        .filter((iv) => iv !== null);

      const slotTimes = durationMinutes
        ? generateWorkingHourSlots(durationMinutes)
        : PUBLISHED_TIME_SLOTS;
      const effectiveDuration = durationMinutes || service.durationMinutes || 30;

      return {
        serviceId,
        date: dateStr,
        durationMinutes: effectiveDuration,
        isBlocked: false,
        slots: slotTimes.map((time, idx) => {
          const slotStart = parseTimeToMinutes(time);
          const slotEnd = slotStart + effectiveDuration;
          const isColliding = bookedIntervals.some(
            (b) => Math.max(slotStart, b.start) < Math.min(slotEnd, b.end),
          );
          return {
            id: `slot-fallback-${idx}`,
            time,
            durationMinutes: effectiveDuration,
            isAvailable: isPastDate ? false : !isColliding,
            reason: isPastDate
              ? 'Date is in the past'
              : isColliding
              ? 'Already Reserved'
              : undefined,
          };
        }),
      };
    }
  }

  /**
   * Ensure default Lead Astrologer exists in PostgreSQL for relational integrity.
   */
  private async getOrCreateLeadAstrologer() {
    let astrologer = await this.prisma.astrologer.findFirst({
      where: { name: { contains: 'Vishal Dubey' } },
    });

    if (!astrologer) {
      astrologer = await this.prisma.astrologer.create({
        data: {
          name: 'Dr. Pandit Vishal Dubey',
          title: 'PhD in Vedic Astrology & Certified Hypnotherapist',
          experienceYears: 24,
          specialties: [
            'Vedic Astrology',
            'Kundli Analysis',
            'Career & Wealth Guidance',
            'Matchmaking',
            'Planetary Dosha Rectification',
          ],
          languages: ['Hindi', 'English', 'Sanskrit'],
          rating: 5.0,
          reviewCount: 1420,
          pricePerMinute: 70,
          availability: 'Available',
          imageUrl: '/dr_vishal_dubey.jpg',
          bio: 'Gold Medalist Acharya with 24+ years experience in planetary dosha rectification, Vedic Kundli, and divine guidance.',
        },
      });
    }

    return astrologer;
  }

  /**
   * Book an appointment with database transaction and concurrency double-booking prevention.
   */
  async bookAppointment(actor: JwtPayload, dto: BookAppointmentDto, ipAddress?: string) {
    // 1. Validate canonical service definition (price is derived server-side only)
    const service = this.getServiceById(dto.serviceId);
    const bookingDuration = dto.durationMinutes || service.durationMinutes || 30;

    // 2. Validate appointment date and time slot
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dto.scheduledDate)) {
      throw new BadRequestException('Scheduled date must be in YYYY-MM-DD format.');
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (dto.scheduledDate < todayStr) {
      throw new BadRequestException('Appointment date cannot be in the past.');
    }

    // 3. Validate contact phone (reject dummy phone placeholder)
    if (!dto.contactPhone || typeof dto.contactPhone !== 'string' || !dto.contactPhone.trim()) {
      throw new BadRequestException('Valid contact phone number is required.');
    }
    const normalizedPhone = normalizePhoneNumber(dto.contactPhone.trim());
    if (!isValidE164(normalizedPhone)) {
      throw new BadRequestException(
        'Please enter a valid 10-digit mobile or international E.164 phone number.',
      );
    }
    if (normalizedPhone === '+919876543210') {
      throw new BadRequestException(
        'Dummy contact number is not allowed. Please enter your authentic contact number.',
      );
    }

    // 4. Try database booking first
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: actor.sub },
        select: { id: true, name: true, email: true, phone: true, status: true },
      });

      if (!user) {
        throw new NotFoundException('Authenticated user account was not found.');
      }
      if (user.status === 'SUSPENDED') {
        throw new ForbiddenException('Suspended accounts cannot book consultations.');
      }

      // Check if date is blocked in sanctuary registry
      const blockedDate = await this.prisma.blockedDate.findUnique({
        where: { date: dto.scheduledDate },
      });
      if (blockedDate) {
        throw new BadRequestException(
          `Panditji is not accepting consultations on ${dto.scheduledDate}: ${blockedDate.reason || 'Sanctuary Closed'}`,
        );
      }

      // Verify database-backed appointment slot exists and is published
      let slot = await this.prisma.appointmentSlot.findUnique({
        where: {
          date_startTime: {
            date: dto.scheduledDate,
            startTime: dto.scheduledTime,
          },
        },
      });

      // If slot record does not exist yet but is a standard time slot, auto-create it in DB
      if (!slot && PUBLISHED_TIME_SLOTS.includes(dto.scheduledTime)) {
        slot = await this.prisma.appointmentSlot.create({
          data: {
            date: dto.scheduledDate,
            startTime: dto.scheduledTime,
            durationMinutes: 45,
            isPublished: true,
          },
        });
      }

      if (!slot || !slot.isPublished) {
        throw new BadRequestException(
          `The requested time slot (${dto.scheduledTime}) on ${dto.scheduledDate} is not available for booking.`,
        );
      }

      // 5. Ensure lead astrologer exists
      const astrologer = await this.getOrCreateLeadAstrologer();

      // 6. Execute atomic booking within Serializable transaction to prevent concurrent double-booking
      const booking = await this.prisma.$transaction(
        async (tx) => {
          // Query inside transaction to check slot collision
          const existingSlot = await tx.booking.findFirst({
            where: {
              astrologerId: astrologer.id,
              scheduledDate: dto.scheduledDate,
              scheduledTime: dto.scheduledTime,
              status: { notIn: ['CANCELLED', 'REJECTED'] },
            },
          });

          if (existingSlot) {
            throw new ConflictException(
              `The time slot on ${dto.scheduledDate} at ${dto.scheduledTime} has just been reserved. Please select another slot.`,
            );
          }

          const initialStatus = 'CONFIRMED';
          const mode = dto.consultationType || 'video';
          const formattedNotes = [
            `Service: ${service.title}`,
            `Mode: ${mode.toUpperCase()}`,
            `Contact: ${normalizedPhone}`,
            `Extension Rate: ₹50/min`,
            dto.notes ? `Seeker Notes: ${dto.notes.trim()}` : null,
          ]
            .filter(Boolean)
            .join(' | ');

          let payer: any = null;
          const cost = service.priceNumber;
          if (dto.paymentMethod === 'WALLET') {
            payer = await tx.user.findUnique({
              where: { id: user.id },
              select: { id: true, walletBalance: true },
            });
            if (!payer || Number(payer.walletBalance || 0) < cost) {
              throw new BadRequestException(
                `Insufficient wallet balance (₹${payer?.walletBalance || 0}). Required: ₹${cost}`,
              );
            }
            await tx.user.update({
              where: { id: user.id },
              data: { walletBalance: { decrement: cost } },
              select: { walletBalance: true },
            });
          }

          const newBooking = await tx.booking.create({
            data: {
              userId: user.id,
              astrologerId: astrologer.id,
              serviceType: service.id,
              scheduledDate: dto.scheduledDate,
              scheduledTime: dto.scheduledTime,
              durationMinutes: bookingDuration,
              totalCost: service.priceNumber,
              status: initialStatus,
              notes: formattedNotes,
            },
            include: {
              astrologer: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          });

          if (dto.paymentMethod === 'WALLET') {
            await tx.walletTransaction.create({
              data: {
                userId: user.id,
                type: 'DEBIT',
                amount: service.priceNumber,
                balanceAfter: Math.max(0, Number(payer?.walletBalance || 0) - cost),
                description: `Consultation reservation: ${service.title}`,
                reference: `BOOKING_${newBooking.id}`,
              },
            });
          }

          // Update user phone if previously missing
          if (!user.phone && normalizedPhone) {
            await tx.user.update({
              where: { id: user.id },
              data: { phone: normalizedPhone },
            });
          }

          return newBooking;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );

      const meetLink = formatGoogleMeetLink(booking.id);

      // Asynchronously trigger confirmation email with meeting link
      if (user.email) {
        this.emailService?.sendConsultationConfirmation?.({
            seekerEmail: user.email,
            seekerName: dto.customerName?.trim() || user.name || 'Devotee',
            serviceTitle: service.title,
            astrologerName: astrologer.name,
            scheduledDate: booking.scheduledDate,
            scheduledTime: booking.scheduledTime,
            meetLink,
            price: service.priceNumber,
          })
          .catch((err) => {
            // Gracefully log without failing booking
          });
      }

      // 7. Append security audit log
      await this.prisma.auditLog.create({
        data: {
          action: 'BOOKING_CREATED',
          actorId: user.id,
          actorEmail: user.email,
          targetId: booking.id,
          details: {
            serviceId: service.id,
            serviceTitle: service.title,
            scheduledDate: dto.scheduledDate,
            scheduledTime: dto.scheduledTime,
            price: service.priceNumber,
            contactPhone: normalizedPhone,
            meetLink,
          },
          ipAddress: ipAddress || null,
        },
      });

      return {
        success: true,
        message: 'Consultation appointment booked successfully!',
        booking: {
          id: booking.id,
          serviceId: service.id,
          serviceTitle: service.title,
          servicePrice: service.price,
          scheduledDate: booking.scheduledDate,
          scheduledTime: booking.scheduledTime,
          status: booking.status,
          durationMinutes: booking.durationMinutes,
          totalCost: booking.totalCost,
          createdAt: booking.createdAt,
          contactPhone: normalizedPhone,
          meetLink,
          astrologer: {
            id: astrologer.id,
            name: astrologer.name,
            title: astrologer.title,
            image: astrologer.imageUrl,
          },
          customer: {
            id: user.id,
            name: dto.customerName?.trim() || user.name,
            email: user.email,
            phone: normalizedPhone,
          },
        },
      };
    } catch (err: any) {
      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException ||
        err instanceof BadRequestException ||
        err instanceof ConflictException
      ) {
        throw err;
      }

      this.logger.warn(`Database unreachable during appointment booking (${err.message}). Using persistent appointments.json fallback.`);
      return this.bookAppointmentFallback(actor, dto, service, normalizedPhone);
    }
  }

  private bookAppointmentFallback(
    actor: JwtPayload,
    dto: BookAppointmentDto,
    service: ServiceCatalogueItem,
    normalizedPhone: string,
  ) {
    const collision = this.fallbackBookings.find(
      (b) =>
        b.scheduledDate === dto.scheduledDate &&
        b.scheduledTime === dto.scheduledTime &&
        !['CANCELLED', 'REJECTED'].includes(b.status),
    );

    if (collision) {
      throw new ConflictException(
        `The time slot on ${dto.scheduledDate} at ${dto.scheduledTime} has just been reserved. Please select another slot.`,
      );
    }

    const bookingId = `AVD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const meetLink = formatGoogleMeetLink(bookingId);
    const now = new Date().toISOString();
    const customerName = dto.customerName?.trim() || actor.name || 'Devotee';
    const customerEmail = actor.email;

    const newBooking = {
      id: bookingId,
      userId: actor.sub,
      astrologerId: 'ast-vishal-dubey',
      serviceType: service.id,
      scheduledDate: dto.scheduledDate,
      scheduledTime: dto.scheduledTime,
      durationMinutes: service.durationMinutes || 45,
      totalCost: service.priceNumber,
      status: 'CONFIRMED',
      notes: [
        `Service: ${service.title}`,
        `Mode: ${(dto.consultationType || 'video').toUpperCase()}`,
        `Contact: ${normalizedPhone}`,
        `Extension Rate: ₹50/min`,
        dto.notes ? `Seeker Notes: ${dto.notes.trim()}` : null,
      ]
        .filter(Boolean)
        .join(' | '),
      contactPhone: normalizedPhone,
      meetLink,
      createdAt: now,
      updatedAt: now,
      customerName,
      customerEmail,
    };

    this.fallbackBookings.unshift(newBooking);
    this.saveFallbackBookings();

    if (customerEmail) {
      this.emailService?.sendConsultationConfirmation?.({
          seekerEmail: customerEmail,
          seekerName: customerName,
          serviceTitle: service.title,
          astrologerName: 'Dr. Pandit Vishal Dubey',
          scheduledDate: newBooking.scheduledDate,
          scheduledTime: newBooking.scheduledTime,
          meetLink,
          price: service.priceNumber,
        })
        .catch(() => {});
    }

    return {
      success: true,
      message: 'Consultation appointment booked successfully!',
      booking: {
        id: newBooking.id,
        serviceId: service.id,
        serviceTitle: service.title,
        servicePrice: service.price,
        scheduledDate: newBooking.scheduledDate,
        scheduledTime: newBooking.scheduledTime,
        status: newBooking.status,
        durationMinutes: newBooking.durationMinutes,
        totalCost: newBooking.totalCost,
        createdAt: newBooking.createdAt,
        contactPhone: normalizedPhone,
        meetLink,
        astrologer: {
          id: 'ast-vishal-dubey',
          name: 'Dr. Pandit Vishal Dubey',
          title: 'PhD in Vedic Astrology & Certified Hypnotherapist',
          image: '/dr_vishal_dubey.jpg',
        },
        customer: {
          id: actor.sub,
          name: customerName,
          email: customerEmail,
          phone: normalizedPhone,
        },
      },
    };
  }

  /**
   * Return customer's own bookings only.
   */
  async getCustomerBookings(userId: string) {
    try {
      const bookings = await this.prisma.booking.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          astrologer: {
            select: {
              id: true,
              name: true,
              title: true,
              imageUrl: true,
            },
          },
        },
      });

      return bookings.map((b) => {
        const service = SERVICES_CATALOGUE.find((s) => s.id === b.serviceType);
        const meetLink = formatGoogleMeetLink(b.id);
        return {
          id: b.id,
          serviceId: b.serviceType,
          serviceTitle: service ? service.title : b.serviceType,
          serviceImage: service ? service.image : '/services/consultation.jpg',
          pandit: service ? service.pandit : b.astrologer.name,
          scheduledDate: b.scheduledDate,
          scheduledTime: b.scheduledTime,
          durationMinutes: b.durationMinutes,
          totalCost: b.totalCost,
          status: b.status,
          notes: b.notes,
          meetLink,
          createdAt: b.createdAt,
          astrologer: b.astrologer,
        };
      });
    } catch (err: any) {
      // Fallback to in-memory/JSON store
      return this.fallbackBookings
        .filter((b) => b.userId === userId)
        .map((b) => {
          const service = SERVICES_CATALOGUE.find((s) => s.id === b.serviceType);
          return {
            id: b.id,
            serviceId: b.serviceType,
            serviceTitle: service ? service.title : b.serviceType,
            serviceImage: service ? service.image : '/services/consultation.jpg',
            pandit: 'Dr. Pandit Vishal Dubey',
            scheduledDate: b.scheduledDate,
            scheduledTime: b.scheduledTime,
            durationMinutes: b.durationMinutes,
            totalCost: b.totalCost,
            status: b.status,
            notes: b.notes,
            meetLink: b.meetLink && b.meetLink.includes('meet.google.com') ? b.meetLink : formatGoogleMeetLink(b.id),
            createdAt: b.createdAt,
            astrologer: {
              id: 'ast-vishal-dubey',
              name: 'Dr. Pandit Vishal Dubey',
              title: 'PhD in Vedic Astrology',
              imageUrl: '/dr_vishal_dubey.jpg',
            },
          };
        });
    }
  }

  /**
   * Return single booking detail, enforcing customer privacy.
   */
  async getBookingById(actor: JwtPayload, bookingId: string) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          astrologer: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID "${bookingId}" was not found.`);
      }

      const isAdmin = actor.role === 'ADMIN' || actor.role === 'SUPERADMIN';
      if (!isAdmin && booking.userId !== actor.sub) {
        throw new ForbiddenException('You are not authorized to view another customer’s booking.');
      }

      const service = SERVICES_CATALOGUE.find((s) => s.id === booking.serviceType);
      const meetLink = formatGoogleMeetLink(booking.id);

      return {
        id: booking.id,
        serviceId: booking.serviceType,
        serviceTitle: service ? service.title : booking.serviceType,
        serviceDesc: service?.desc,
        serviceImage: service?.image,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        durationMinutes: booking.durationMinutes,
        totalCost: booking.totalCost,
        status: booking.status,
        notes: booking.notes,
        meetLink,
        createdAt: booking.createdAt,
        astrologer: {
          id: booking.astrologer.id,
          name: booking.astrologer.name,
          title: booking.astrologer.title,
          imageUrl: booking.astrologer.imageUrl,
        },
        customer: {
          id: booking.user.id,
          name: booking.user.name,
          email: booking.user.email,
          phone: booking.user.phone,
        },
      };
    } catch (err: any) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException) {
        throw err;
      }

      const b = this.fallbackBookings.find((item) => item.id === bookingId);
      if (!b) {
        throw new NotFoundException(`Booking with ID "${bookingId}" was not found.`);
      }

      const isAdmin = actor.role === 'ADMIN' || actor.role === 'SUPERADMIN';
      if (!isAdmin && b.userId !== actor.sub) {
        throw new ForbiddenException('You are not authorized to view another customer’s booking.');
      }

      const service = SERVICES_CATALOGUE.find((s) => s.id === b.serviceType);
      return {
        id: b.id,
        serviceId: b.serviceType,
        serviceTitle: service ? service.title : b.serviceType,
        serviceDesc: service?.desc,
        serviceImage: service?.image,
        scheduledDate: b.scheduledDate,
        scheduledTime: b.scheduledTime,
        durationMinutes: b.durationMinutes,
        totalCost: b.totalCost,
        status: b.status,
        notes: b.notes,
        meetLink: b.meetLink,
        createdAt: b.createdAt,
        astrologer: {
          id: 'ast-vishal-dubey',
          name: 'Dr. Pandit Vishal Dubey',
          title: 'PhD in Vedic Astrology',
          imageUrl: '/dr_vishal_dubey.jpg',
        },
        customer: {
          id: b.userId,
          name: b.customerName,
          email: b.customerEmail,
          phone: b.contactPhone,
        },
      };
    }
  }

  /**
   * Admin booking list with filtering, searching, and pagination.
   */
  async listAdminBookings(query: ListBookingsQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status.toUpperCase();
    }

    if (query.serviceId && query.serviceId !== 'ALL') {
      where.serviceType = query.serviceId;
    }

    if (query.date) {
      where.scheduledDate = query.date;
    }

    if (query.search && query.search.trim()) {
      const search = query.search.trim();
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [totalCount, bookings] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          astrologer: {
            select: {
              id: true,
              name: true,
              title: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
    ]);

    const formattedBookings = bookings.map((b) => {
      const service = SERVICES_CATALOGUE.find((s) => s.id === b.serviceType);
      const meetLink = formatGoogleMeetLink(b.id);
      return {
        id: b.id,
        serviceId: b.serviceType,
        serviceTitle: service ? service.title : b.serviceType,
        servicePrice: service ? service.price : `₹${b.totalCost}`,
        scheduledDate: b.scheduledDate,
        scheduledTime: b.scheduledTime,
        durationMinutes: b.durationMinutes,
        totalCost: b.totalCost,
        status: b.status,
        notes: b.notes,
        meetLink,
        createdAt: b.createdAt,
        astrologer: b.astrologer,
        customer: b.user,
      };
    });

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      page,
      limit,
      bookings: formattedBookings,
    };
  }

  /**
   * Update booking status enforcing valid lifecycle transitions.
   */
  async updateBookingStatus(
    actor: JwtPayload,
    bookingId: string,
    dto: UpdateBookingStatusDto,
    ipAddress?: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" was not found.`);
    }

    const currentStatus = booking.status.toUpperCase();
    const targetStatus = dto.status.toUpperCase();

    if (currentStatus === targetStatus) {
      return {
        message: `Booking is already in ${targetStatus} status.`,
        booking,
      };
    }

    // Terminal state checks
    if (currentStatus === 'COMPLETED') {
      throw new BadRequestException('Cannot change status of an already COMPLETED appointment.');
    }
    if (currentStatus === 'CANCELLED') {
      throw new BadRequestException('Cannot change status of an already CANCELLED appointment.');
    }

    // Allowed transition matrix:
    // PENDING_PAYMENT -> CONFIRMED, CANCELLED
    // PENDING -> CONFIRMED, CANCELLED
    // CONFIRMED -> COMPLETED, CANCELLED
    const validTransitions: Record<string, string[]> = {
      PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid status transition from "${currentStatus}" to "${targetStatus}". Allowed: ${allowed.join(', ')}`,
      );
    }

    // Guard: Unpaid booking cannot jump directly to COMPLETED
    if (currentStatus === 'PENDING_PAYMENT' && targetStatus === 'COMPLETED') {
      throw new BadRequestException(
        'Cannot complete an unpaid appointment. Payment must be verified (CONFIRMED) first.',
      );
    }

    // If a confirmed wallet-paid booking is cancelled, refund wallet balance atomically
    if (targetStatus === 'CANCELLED' && booking.notes?.includes('Payment: WALLET_PAID') && booking.totalCost > 0) {
      const refundRef = `REFUND_BOOKING_${bookingId}`;
      const existingRefund = await this.prisma.walletTransaction.findUnique({
        where: { reference: refundRef },
      });
      if (!existingRefund) {
        const u = await this.prisma.user.update({
          where: { id: booking.userId },
          data: { walletBalance: { increment: booking.totalCost } },
          select: { walletBalance: true },
        });
        await this.prisma.walletTransaction.create({
          data: {
            userId: booking.userId,
            type: 'CREDIT',
            amount: booking.totalCost,
            description: `Refund for Cancelled Consultation #${bookingId.slice(0, 8).toUpperCase()}`,
            balanceAfter: Math.round(Number(u.walletBalance) * 100) / 100,
            reference: refundRef,
          },
        });
      }
    }

    const updatedNotes = dto.notes?.trim()
      ? `${booking.notes ? booking.notes + ' | ' : ''}Status update (${targetStatus}): ${dto.notes.trim()}`
      : booking.notes;

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: targetStatus,
        notes: updatedNotes,
      },
      include: {
        astrologer: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Record audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'BOOKING_STATUS_UPDATED',
        actorId: actor.sub,
        actorEmail: actor.email,
        targetId: bookingId,
        details: {
          fromStatus: currentStatus,
          toStatus: targetStatus,
          notes: dto.notes || null,
        },
        ipAddress: ipAddress || null,
      },
    });

    return {
      message: `Booking status successfully updated to ${targetStatus}.`,
      booking: updatedBooking,
    };
  }

  /**
   * Return full availability management view for a date (Admin/Superadmin only).
   */
  async getAdminAvailability(dateStr: string) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      throw new BadRequestException('Date must be formatted as YYYY-MM-DD');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isPastDate = dateStr < todayStr;

    // Check blocked status
    const blockedDate = await this.prisma.blockedDate.findUnique({
      where: { date: dateStr },
    });

    // Query all slots for this date
    let dbSlots = await this.prisma.appointmentSlot.findMany({
      where: { date: dateStr },
      orderBy: { startTime: 'asc' },
    });

    // If no slots exist yet and date is not in past, auto-seed standard slots for convenience
    if (dbSlots.length === 0 && !isPastDate) {
      const defaultSlotsData = PUBLISHED_TIME_SLOTS.map((time) => ({
        date: dateStr,
        startTime: time,
        durationMinutes: 45,
        isPublished: true,
      }));

      await this.prisma.appointmentSlot.createMany({
        data: defaultSlotsData,
        skipDuplicates: true,
      });

      dbSlots = await this.prisma.appointmentSlot.findMany({
        where: { date: dateStr },
        orderBy: { startTime: 'asc' },
      });
    }

    // Query active bookings for this date
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        scheduledDate: dateStr,
        status: { notIn: ['CANCELLED', 'REJECTED'] },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    const bookingByTime = new Map(existingBookings.map((b) => [b.scheduledTime, b]));

    const enrichedSlots = dbSlots.map((slot) => {
      const booking = bookingByTime.get(slot.startTime);
      const isBooked = Boolean(booking);

      return {
        id: slot.id,
        date: slot.date,
        startTime: slot.startTime,
        durationMinutes: slot.durationMinutes,
        isPublished: slot.isPublished,
        notes: slot.notes,
        isBooked,
        booking: booking
          ? {
              id: booking.id,
              serviceType: booking.serviceType,
              status: booking.status,
              customerName: booking.user?.name || 'Vedic Seeker',
              customerEmail: booking.user?.email || null,
              customerPhone: booking.user?.phone || null,
            }
          : null,
        canDelete: !isBooked,
      };
    });

    return {
      date: dateStr,
      isBlocked: Boolean(blockedDate),
      blockedReason: blockedDate?.reason || null,
      slots: enrichedSlots,
      totalSlots: enrichedSlots.length,
      bookedCount: enrichedSlots.filter((s) => s.isBooked).length,
    };
  }

  /**
   * Create an available consultation time slot (Admin/Superadmin only).
   */
  async createAdminSlot(actor: JwtPayload, dto: CreateSlotDto, ipAddress?: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dto.date < todayStr) {
      throw new BadRequestException('Appointment slot date cannot be in the past.');
    }

    const cleanStartTime = dto.startTime.trim();
    const existing = await this.prisma.appointmentSlot.findUnique({
      where: {
        date_startTime: {
          date: dto.date,
          startTime: cleanStartTime,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Slot on ${dto.date} at ${cleanStartTime} already exists in the sanctuary schedule.`,
      );
    }

    const slot = await this.prisma.appointmentSlot.create({
      data: {
        date: dto.date,
        startTime: cleanStartTime,
        durationMinutes: dto.durationMinutes || 45,
        isPublished: dto.isPublished !== undefined ? dto.isPublished : true,
        notes: dto.notes?.trim() || null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'SLOT_CREATED',
        actorId: actor.sub,
        actorEmail: actor.email,
        targetId: slot.id,
        details: {
          date: slot.date,
          startTime: slot.startTime,
          durationMinutes: slot.durationMinutes,
          isPublished: slot.isPublished,
        },
        ipAddress: ipAddress || null,
      },
    });

    return {
      message: 'Consultation slot successfully created.',
      slot,
    };
  }

  /**
   * Update or publish/unpublish a slot (Admin/Superadmin only).
   */
  async updateAdminSlot(actor: JwtPayload, slotId: string, dto: UpdateSlotDto, ipAddress?: string) {
    const slot = await this.prisma.appointmentSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException('Appointment slot not found.');
    }

    if (dto.startTime && dto.startTime.trim() !== slot.startTime) {
      const cleanStartTime = dto.startTime.trim();
      const activeBooking = await this.prisma.booking.findFirst({
        where: {
          scheduledDate: slot.date,
          scheduledTime: slot.startTime,
          status: { notIn: ['CANCELLED', 'REJECTED'] },
        },
      });

      if (activeBooking) {
        throw new BadRequestException(
          'Cannot modify the start time of an appointment slot with an active booking. Please reschedule the booking first.',
        );
      }

      const duplicate = await this.prisma.appointmentSlot.findUnique({
        where: {
          date_startTime: {
            date: slot.date,
            startTime: cleanStartTime,
          },
        },
      });

      if (duplicate && duplicate.id !== slot.id) {
        throw new ConflictException(
          `Another slot already exists on ${slot.date} at ${cleanStartTime}.`,
        );
      }
    }

    const updated = await this.prisma.appointmentSlot.update({
      where: { id: slotId },
      data: {
        ...(dto.startTime ? { startTime: dto.startTime.trim() } : {}),
        ...(dto.durationMinutes !== undefined ? { durationMinutes: dto.durationMinutes } : {}),
        ...(dto.isPublished !== undefined ? { isPublished: dto.isPublished } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes.trim() } : {}),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'SLOT_UPDATED',
        actorId: actor.sub,
        actorEmail: actor.email,
        targetId: slot.id,
        details: {
          date: updated.date,
          startTime: updated.startTime,
          isPublished: updated.isPublished,
          durationMinutes: updated.durationMinutes,
        },
        ipAddress: ipAddress || null,
      },
    });

    return {
      message: 'Consultation slot successfully updated.',
      slot: updated,
    };
  }

  /**
   * Delete an appointment slot, rejecting if active booking exists (Admin/Superadmin only).
   */
  async deleteAdminSlot(actor: JwtPayload, slotId: string, ipAddress?: string) {
    const slot = await this.prisma.appointmentSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException('Appointment slot not found.');
    }

    const activeBooking = await this.prisma.booking.findFirst({
      where: {
        scheduledDate: slot.date,
        scheduledTime: slot.startTime,
        status: { notIn: ['CANCELLED', 'REJECTED'] },
      },
    });

    if (activeBooking) {
      throw new BadRequestException(
        'Cannot delete appointment slot with an active customer booking. Cancel the booking first to prevent invalidating confirmed consultations.',
      );
    }

    await this.prisma.appointmentSlot.delete({
      where: { id: slotId },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'SLOT_DELETED',
        actorId: actor.sub,
        actorEmail: actor.email,
        targetId: slotId,
        details: {
          date: slot.date,
          startTime: slot.startTime,
        },
        ipAddress: ipAddress || null,
      },
    });

    return {
      message: `Appointment slot on ${slot.date} at ${slot.startTime} has been permanently deleted.`,
    };
  }

  /**
   * Block a date or holiday (Admin/Superadmin only).
   */
  async blockDate(actor: JwtPayload, dto: BlockDateDto, ipAddress?: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dto.date < todayStr) {
      throw new BadRequestException('Cannot block dates in the past.');
    }

    const blocked = await this.prisma.blockedDate.upsert({
      where: { date: dto.date },
      create: {
        date: dto.date,
        reason: dto.reason?.trim() || 'Sanctuary Closed / Panditji Unavailable',
      },
      update: {
        reason: dto.reason?.trim() || 'Sanctuary Closed / Panditji Unavailable',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'DATE_BLOCKED',
        actorId: actor.sub,
        actorEmail: actor.email,
        targetId: blocked.id,
        details: {
          date: blocked.date,
          reason: blocked.reason,
        },
        ipAddress: ipAddress || null,
      },
    });

    return {
      message: `Date ${dto.date} is now blocked. No customer bookings will be accepted for this date.`,
      blockedDate: blocked,
    };
  }

  /**
   * Unblock a date (Admin/Superadmin only).
   */
  async unblockDate(actor: JwtPayload, dateStr: string, ipAddress?: string) {
    const existing = await this.prisma.blockedDate.findUnique({
      where: { date: dateStr },
    });

    if (existing) {
      await this.prisma.blockedDate.delete({
        where: { date: dateStr },
      });

      await this.prisma.auditLog.create({
        data: {
          action: 'DATE_UNBLOCKED',
          actorId: actor.sub,
          actorEmail: actor.email,
          targetId: existing.id,
          details: {
            date: dateStr,
          },
          ipAddress: ipAddress || null,
        },
      });
    }

    return {
      message: `Date ${dateStr} has been unblocked. Published slots are now available for customer bookings.`,
    };
  }

  /**
   * Bulk initialize standard Vedic schedule for upcoming days (Admin/Superadmin only).
   */
  async initializeStandardSchedule(
    actor: JwtPayload,
    dto: InitializeScheduleDto,
    ipAddress?: string,
  ) {
    const days = dto.daysCount || 7;
    const start = new Date(dto.startDate);
    let createdCount = 0;

    for (let i = 0; i < days; i++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + i);
      const curDateStr = cur.toISOString().split('T')[0];

      for (const time of PUBLISHED_TIME_SLOTS) {
        await this.prisma.appointmentSlot.upsert({
          where: {
            date_startTime: {
              date: curDateStr,
              startTime: time,
            },
          },
          create: {
            date: curDateStr,
            startTime: time,
            durationMinutes: 45,
            isPublished: true,
          },
          update: {},
        });
        createdCount++;
      }
    }

    await this.prisma.auditLog.create({
      data: {
        action: 'SCHEDULE_INITIALIZED',
        actorId: actor.sub,
        actorEmail: actor.email,
        details: {
          startDate: dto.startDate,
          daysCount: days,
          slotsProcessed: createdCount,
        },
        ipAddress: ipAddress || null,
      },
    });

    return {
      message: `Standard Vedic schedule successfully initialized for ${days} days starting from ${dto.startDate}.`,
      daysCount: days,
      slotsProcessed: createdCount,
    };
  }
}
