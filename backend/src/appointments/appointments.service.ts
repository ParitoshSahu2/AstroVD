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
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { ListServicesQueryDto } from './dto/list-services-query.dto.js';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto.js';
import { UpdateMeetLinkDto } from './dto/update-meet-link.dto.js';
import { VerifyPaymentDto } from './dto/verify-payment.dto.js';
import { normalizePhoneNumber, isValidE164 } from '../auth/phone.util.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';
import { EmailService } from '../email/email.service.js';

export const DEFAULT_GURUJI_MEET_LINK = 'https://meet.google.com/meet/hui-smdn-gtp';

export function formatGoogleMeetLink(bookingId?: string): string {
  const configured = process.env.GURUJI_MEET_LINK || process.env.NEXT_PUBLIC_GURUJI_MEET_LINK;
  if (configured && configured.trim().startsWith('https://meet.google.com/')) {
    return configured.trim();
  }
  return DEFAULT_GURUJI_MEET_LINK;
}

export function extractMeetingLink(notes?: string | null, bookingId?: string): string {
  if (notes) {
    const match = notes.match(/MeetLink:\s*(https:\/\/[^\s|]+)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return formatGoogleMeetLink(bookingId);
}

export function getBookingTimestamp(dateStr?: string, timeStr?: string): number {
  if (!dateStr) return 0;
  const parts = dateStr.split('-').map(Number);
  const year = parts[0] || 2026;
  const month = parts[1] || 1;
  const day = parts[2] || 1;
  const minutes = parseTimeToMinutes(timeStr || '10:00 AM');
  const hours = minutes >= 0 ? Math.floor(minutes / 60) : 0;
  const mins = minutes >= 0 ? minutes % 60 : 0;
  return new Date(year, month - 1, day, hours, mins, 0).getTime();
}

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  private readonly appointmentsFilePath = path.resolve(process.cwd(), 'data', 'appointments.json');
  private readonly servicesFilePath = path.resolve(process.cwd(), 'data', 'services.json');
  private fallbackBookings: any[] = [];
  private servicesCatalogue: ServiceCatalogueItem[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {
    this.initFallbackBookings();
    this.initServicesCatalogue();
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
   * Initialize dynamic services catalogue from disk or seed with all 29 canonical services.
   */
  private initServicesCatalogue() {
    try {
      const dir = path.dirname(this.servicesFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      if (fs.existsSync(this.servicesFilePath)) {
        const raw = fs.readFileSync(this.servicesFilePath, 'utf-8');
        const parsed: ServiceCatalogueItem[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((s) => s.id));
          const missingCanonical = SERVICES_CATALOGUE.filter((c) => !existingIds.has(c.id)).map((c) => ({
            ...c,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));

          this.servicesCatalogue = [
            ...parsed.map((s) => ({
              ...s,
              isActive: s.isActive !== undefined ? s.isActive : true,
            })),
            ...missingCanonical,
          ];

          if (missingCanonical.length > 0) {
            this.saveServicesCatalogue();
          }
          return;
        }
      }

      // First-time seed with all 29 canonical services
      this.servicesCatalogue = SERVICES_CATALOGUE.map((item) => ({
        ...item,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      this.saveServicesCatalogue();
    } catch (err) {
      this.logger.error('Failed to initialize dynamic services catalogue, using fallback', err);
      this.servicesCatalogue = SERVICES_CATALOGUE.map((item) => ({ ...item, isActive: true }));
    }
  }

  private saveServicesCatalogue() {
    try {
      const dir = path.dirname(this.servicesFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        this.servicesFilePath,
        JSON.stringify(this.servicesCatalogue, null, 2),
        'utf-8',
      );
    } catch (e) {
      this.logger.error('Failed to save services catalogue', e);
    }
  }

  /**
   * Return services catalogue, optionally filtered by category.
   * By default returns only ACTIVE services for public seekers.
   */
  getServices(category?: string, includeInactive = false): ServiceCatalogueItem[] {
    let list = this.servicesCatalogue.length > 0 ? this.servicesCatalogue : SERVICES_CATALOGUE;
    if (!includeInactive) {
      list = list.filter((s) => s.isActive !== false);
    }
    if (!category || category === 'all') {
      return list;
    }
    return list.filter(
      (s) => s.categoryKey.toLowerCase() === category.toLowerCase(),
    );
  }

  /**
   * Return a single service by stable ID or slug.
   * By default rejects inactive services. Set allowInactive=true for internal/historical lookups.
   */
  getServiceById(serviceId: string, allowInactive = false): ServiceCatalogueItem {
    const list = this.servicesCatalogue.length > 0 ? this.servicesCatalogue : SERVICES_CATALOGUE;
    const service = list.find((s) => s.id === serviceId);
    if (!service) {
      throw new NotFoundException(`Service with ID "${serviceId}" does not exist in catalogue.`);
    }
    if (!allowInactive && service.isActive === false) {
      throw new NotFoundException(`Service with ID "${serviceId}" is currently deactivated.`);
    }
    return service;
  }

  /**
   * Admin: List all services with filtering by status and search query.
   */
  listAdminServices(query?: ListServicesQueryDto): { totalCount: number; services: ServiceCatalogueItem[] } {
    let list = [...(this.servicesCatalogue.length > 0 ? this.servicesCatalogue : SERVICES_CATALOGUE)];

    if (query?.status && query.status !== 'ALL') {
      const wantActive = query.status.toUpperCase() === 'ACTIVE';
      list = list.filter((s) => (s.isActive !== false) === wantActive);
    }

    if (query?.category && query.category !== 'ALL' && query.category !== 'all') {
      list = list.filter((s) => s.categoryKey.toLowerCase() === query.category!.toLowerCase());
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.desc.toLowerCase().includes(q) ||
          s.pandit.toLowerCase().includes(q) ||
          s.categoryTag.toLowerCase().includes(q),
      );
    }

    return {
      totalCount: list.length,
      services: list,
    };
  }

  /**
   * Admin: Create a new service catalogue entry.
   */
  async createAdminService(
    actor: JwtPayload,
    dto: CreateServiceDto,
    ipAddress?: string,
  ): Promise<ServiceCatalogueItem> {
    const rawId = (dto.id || dto.title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const generatedId = rawId || `service_${Date.now()}`;

    // Check if ID already exists
    if (this.servicesCatalogue.some((s) => s.id === generatedId)) {
      throw new ConflictException(`A service with identifier "${generatedId}" already exists.`);
    }

    const priceNumber = Number(dto.priceNumber) || 0;
    const priceString =
      dto.price?.trim() || (priceNumber === 0 ? '100% FREE' : `₹${priceNumber.toLocaleString('en-IN')}`);

    const newService: ServiceCatalogueItem = {
      id: generatedId,
      title: dto.title.trim(),
      categoryKey: dto.categoryKey,
      categoryTag: (dto.categoryTag || dto.categoryKey.toUpperCase()).trim(),
      pandit: dto.pandit.trim(),
      desc: dto.desc.trim(),
      price: priceString,
      priceNumber,
      durationMinutes: dto.durationMinutes || 30,
      image: dto.image?.trim() || '/services/consultation.jpg',
      badge: dto.badge?.trim() || undefined,
      isSpecial: dto.isSpecial || false,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.servicesCatalogue.unshift(newService);
    this.saveServicesCatalogue();

    // Audit logging
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'SERVICE_CREATED',
          actorId: actor.sub,
          actorEmail: actor.email,
          targetId: newService.id,
          details: {
            title: newService.title,
            price: newService.price,
            categoryKey: newService.categoryKey,
          },
          ipAddress: ipAddress || null,
        },
      });
    } catch (e) {
      this.logger.warn('Failed to write audit log for SERVICE_CREATED', e);
    }

    return newService;
  }

  /**
   * Admin: Update an existing service catalogue entry.
   */
  async updateAdminService(
    actor: JwtPayload,
    id: string,
    dto: UpdateServiceDto,
    ipAddress?: string,
  ): Promise<ServiceCatalogueItem> {
    const index = this.servicesCatalogue.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Service with ID "${id}" was not found.`);
    }

    const current = this.servicesCatalogue[index];
    const priceNumber = dto.priceNumber !== undefined ? Number(dto.priceNumber) : current.priceNumber;
    const priceString =
      dto.price !== undefined
        ? dto.price.trim()
        : dto.priceNumber !== undefined
        ? priceNumber === 0
          ? '100% FREE'
          : `₹${priceNumber.toLocaleString('en-IN')}`
        : current.price;

    const updated: ServiceCatalogueItem = {
      ...current,
      title: dto.title !== undefined ? dto.title.trim() : current.title,
      categoryKey: dto.categoryKey !== undefined ? dto.categoryKey : current.categoryKey,
      categoryTag: dto.categoryTag !== undefined ? dto.categoryTag.trim() : current.categoryTag,
      pandit: dto.pandit !== undefined ? dto.pandit.trim() : current.pandit,
      desc: dto.desc !== undefined ? dto.desc.trim() : current.desc,
      price: priceString,
      priceNumber,
      durationMinutes: dto.durationMinutes !== undefined ? dto.durationMinutes : current.durationMinutes,
      image: dto.image !== undefined ? dto.image.trim() : current.image,
      badge: dto.badge !== undefined ? (dto.badge.trim() || undefined) : current.badge,
      isSpecial: dto.isSpecial !== undefined ? dto.isSpecial : current.isSpecial,
      isActive: dto.isActive !== undefined ? dto.isActive : current.isActive,
      updatedAt: new Date().toISOString(),
    };

    this.servicesCatalogue[index] = updated;
    this.saveServicesCatalogue();

    // Audit logging
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'SERVICE_UPDATED',
          actorId: actor.sub,
          actorEmail: actor.email,
          targetId: id,
          details: {
            changes: { ...dto } as Prisma.InputJsonObject,
            title: updated.title,
          },
          ipAddress: ipAddress || null,
        },
      });
    } catch (e) {
      this.logger.warn('Failed to write audit log for SERVICE_UPDATED', e);
    }

    return updated;
  }

  /**
   * Admin: Toggle active/inactive status of a service.
   */
  async toggleServiceStatus(
    actor: JwtPayload,
    id: string,
    isActive: boolean,
    ipAddress?: string,
  ): Promise<ServiceCatalogueItem> {
    const index = this.servicesCatalogue.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Service with ID "${id}" was not found.`);
    }

    this.servicesCatalogue[index] = {
      ...this.servicesCatalogue[index],
      isActive,
      updatedAt: new Date().toISOString(),
    };
    this.saveServicesCatalogue();

    try {
      await this.prisma.auditLog.create({
        data: {
          action: isActive ? 'SERVICE_ACTIVATED' : 'SERVICE_DEACTIVATED',
          actorId: actor.sub,
          actorEmail: actor.email,
          targetId: id,
          details: { isActive },
          ipAddress: ipAddress || null,
        },
      });
    } catch (e) {
      this.logger.warn('Failed to write audit log for SERVICE status toggle', e);
    }

    return this.servicesCatalogue[index];
  }

  /**
   * Admin: Permanently delete a service with safety guard.
   * If existing historical bookings reference this serviceType, deletion is rejected with a clear recommendation to deactivate instead.
   */
  async deleteAdminService(
    actor: JwtPayload,
    id: string,
    ipAddress?: string,
  ): Promise<{ success: boolean; message: string; deletedId: string }> {
    const index = this.servicesCatalogue.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Service with ID "${id}" was not found.`);
    }

    const service = this.servicesCatalogue[index];

    // Safety guard: Check if historical or active bookings reference this service
    const bookingCount = await this.prisma.booking.count({
      where: { serviceType: id },
    });

    if (bookingCount > 0) {
      throw new BadRequestException(
        `Cannot delete service "${service.title}" because ${bookingCount} historical consultation booking(s) reference it. Please deactivate the service instead to preserve audit and customer booking integrity.`,
      );
    }

    this.servicesCatalogue.splice(index, 1);
    this.saveServicesCatalogue();

    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'SERVICE_DELETED',
          actorId: actor.sub,
          actorEmail: actor.email,
          targetId: id,
          details: {
            title: service.title,
            categoryKey: service.categoryKey,
          },
          ipAddress: ipAddress || null,
        },
      });
    } catch (e) {
      this.logger.warn('Failed to write audit log for SERVICE_DELETED', e);
    }

    return {
      success: true,
      message: `Service "${service.title}" (${id}) was permanently deleted.`,
      deletedId: id,
    };
  }

  /**
   * Calculate published time slots for a service and date, querying PostgreSQL AppointmentSlot & BlockedDate.
   */
  async getAvailableSlots(serviceId: string, dateStr: string, requestedDuration?: number) {
    this.initFallbackBookings();
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
      } else {
        if (dbSlots.length > 0) {
          slotTimes = dbSlots.map((s) => s.startTime);
          effectiveDuration = dbSlots[0]?.durationMinutes || service.durationMinutes || 30;
        } else {
          effectiveDuration = service.durationMinutes || 30;
          slotTimes = [...PUBLISHED_TIME_SLOTS];

          // Auto-seed missing standard slots into DB for persistence if date is not in past
          if (!isPastDate) {
            try {
              await this.prisma.appointmentSlot.createMany({
                data: PUBLISHED_TIME_SLOTS.map((time) => ({
                  date: dateStr,
                  startTime: time,
                  durationMinutes: effectiveDuration,
                  isPublished: true,
                })),
                skipDuplicates: true,
              });
            } catch (seedErr) {
              // Silently ignore duplicate conflicts during auto-seeding
            }
          }
        }

        // Sort slot times chronologically (10:00 AM before 11:00 AM before 02:00 PM etc.)
        slotTimes = slotTimes.sort((a, b) => {
          const aMin = parseTimeToMinutes(a);
          const bMin = parseTimeToMinutes(b);
          return aMin - bMin;
        });
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
    this.initFallbackBookings();
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

    // 3. Validate contact phone and customer name
    const rawPhone = (dto.customerPhone || dto.contactPhone || '').trim();
    if (!rawPhone) {
      throw new BadRequestException('Valid contact phone number is required.');
    }
    const normalizedPhone = normalizePhoneNumber(rawPhone);
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

    const isBookingForSomeoneElse = Boolean(dto.isBookingForSomeoneElse);
    let customerName = (dto.customerName || '').trim();
    if (!customerName) {
      if (isBookingForSomeoneElse) {
        throw new BadRequestException('Customer name is required when booking for someone else.');
      }
    } else {
      if (customerName.length < 2) {
        throw new BadRequestException('Customer name must be at least 2 characters long.');
      }
      if (customerName.length > 100) {
        throw new BadRequestException('Customer name cannot exceed 100 characters.');
      }
      if (/^[0-9]+$/.test(customerName)) {
        throw new BadRequestException('Customer name cannot consist solely of numbers.');
      }
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

      if (!customerName) {
        customerName = (user.name || actor.name || 'Devotee').trim();
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

          const isWalletPayment = dto.paymentMethod === 'WALLET';
          const initialStatus = isWalletPayment
            ? 'CONFIRMED'
            : dto.paymentMethod === 'PENDING_PAYMENT'
            ? 'PENDING_PAYMENT'
            : 'PENDING';
          const mode = dto.consultationType || 'video';
          const formattedNotes = [
            `Service: ${service.title}`,
            `Mode: ${mode.toUpperCase()}`,
            `Customer: ${customerName}`,
            `Contact: ${normalizedPhone}`,
            isBookingForSomeoneElse ? `Booked for someone else by account owner: ${user.name || user.email}` : null,
            isWalletPayment ? 'Payment: WALLET_PAID' : null,
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
              customerName,
              customerPhone: normalizedPhone,
              isBookingForSomeoneElse,
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

          // Update user phone if previously missing and NOT booking for someone else
          if (!user.phone && normalizedPhone && !isBookingForSomeoneElse) {
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
            seekerName: customerName,
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
            customerName,
            isBookingForSomeoneElse,
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
          userId: user.id,
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
          customerName,
          customerPhone: normalizedPhone,
          isBookingForSomeoneElse,
          meetLink,
          astrologer: {
            id: astrologer.id,
            name: astrologer.name,
            title: astrologer.title,
            image: astrologer.imageUrl,
          },
          customer: {
            id: user.id,
            name: customerName,
            email: user.email,
            phone: normalizedPhone,
            accountOwnerName: user.name,
            accountOwnerEmail: user.email,
            accountOwnerPhone: user.phone,
            isBookingForSomeoneElse,
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
    this.initFallbackBookings();
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

    const isBookingForSomeoneElse = Boolean(dto.isBookingForSomeoneElse);
    const newBooking = {
      id: bookingId,
      userId: actor.sub,
      astrologerId: 'ast-vishal-dubey',
      serviceType: service.id,
      scheduledDate: dto.scheduledDate,
      scheduledTime: dto.scheduledTime,
      durationMinutes: service.durationMinutes || 45,
      totalCost: service.priceNumber,
      status: 'PENDING',
      notes: [
        `Service: ${service.title}`,
        `Mode: ${(dto.consultationType || 'video').toUpperCase()}`,
        `Customer: ${customerName}`,
        `Contact: ${normalizedPhone}`,
        isBookingForSomeoneElse ? `Booked for someone else by account owner: ${actor.name || actor.email}` : null,
        `Extension Rate: ₹50/min`,
        dto.notes ? `Seeker Notes: ${dto.notes.trim()}` : null,
      ]
        .filter(Boolean)
        .join(' | '),
      contactPhone: normalizedPhone,
      customerName,
      customerPhone: normalizedPhone,
      isBookingForSomeoneElse,
      meetLink,
      createdAt: now,
      updatedAt: now,
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
        customerName,
        customerPhone: normalizedPhone,
        isBookingForSomeoneElse,
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
          accountOwnerName: actor.name,
          accountOwnerEmail: actor.email,
          isBookingForSomeoneElse,
        },
      },
    };
  }

  /**
   * Helper to format booking objects consistently with structured payment info and custom meeting URLs.
   */
  private formatBookingPayload(b: any, userObj?: any, astrologerObj?: any) {
    const service =
      this.servicesCatalogue.find((s) => s.id === b.serviceType) ||
      SERVICES_CATALOGUE.find((s) => s.id === b.serviceType);
    const meetLink = extractMeetingLink(b.notes, b.id);
    const customerName = b.customerName || userObj?.name || 'Customer';
    const customerPhone = b.customerPhone || userObj?.phone || b.contactPhone;
    const isWalletPayment = Boolean(b.notes?.includes('Paid via WALLET') || b.notes?.includes('Payment: WALLET_PAID'));
    const isVerifiedManual = Boolean(b.notes?.includes('Payment Verified:'));
    const hasRefund = Boolean(b.notes?.includes('REFUND_BOOKING_'));
    const paymentStatus =
      b.status === 'CONFIRMED' || b.status === 'COMPLETED'
        ? 'PAID'
        : b.status === 'CANCELLED' || b.status === 'REJECTED'
        ? hasRefund || isWalletPayment
          ? 'REFUNDED'
          : 'CANCELLED_UNPAID'
        : 'UNPAID';
    const paymentMethod = isWalletPayment
      ? 'WALLET'
      : isVerifiedManual
      ? 'VERIFIED_OFFLINE'
      : b.totalCost === 0
      ? 'COMPLIMENTARY'
      : 'PENDING_PAYMENT';

    return {
      id: b.id,
      serviceId: b.serviceType,
      serviceTitle: service ? service.title : b.serviceType,
      serviceDesc: service?.desc,
      serviceImage: service ? service.image : '/services/consultation.jpg',
      servicePrice: service ? service.price : `₹${b.totalCost}`,
      pandit: service ? service.pandit : astrologerObj?.name || 'Dr. Pandit Vishal Dubey',
      scheduledDate: b.scheduledDate,
      scheduledTime: b.scheduledTime,
      durationMinutes: b.durationMinutes,
      totalCost: b.totalCost,
      status: b.status,
      notes: b.notes,
      customerName,
      customerPhone,
      isBookingForSomeoneElse: b.isBookingForSomeoneElse || false,
      accountOwnerName: userObj?.name,
      accountOwnerEmail: userObj?.email,
      accountOwnerPhone: userObj?.phone,
      meetLink,
      payment: {
        status: paymentStatus,
        method: paymentMethod,
        totalCost: b.totalCost,
        isWalletPayment,
        isVerifiedManual,
        hasRefund,
      },
      createdAt: b.createdAt,
      astrologer: astrologerObj || {
        id: 'ast-vishal-dubey',
        name: 'Dr. Pandit Vishal Dubey',
        title: 'PhD in Vedic Astrology',
        imageUrl: '/dr_vishal_dubey.jpg',
      },
      customer: {
        id: userObj?.id || b.userId,
        name: customerName,
        email: userObj?.email || b.customerEmail,
        phone: customerPhone,
        accountOwnerName: userObj?.name,
        accountOwnerEmail: userObj?.email,
        accountOwnerPhone: userObj?.phone,
        isBookingForSomeoneElse: b.isBookingForSomeoneElse || false,
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

      return bookings.map((b) => this.formatBookingPayload(b, b.user, b.astrologer));
    } catch (err: any) {
      // Fallback to in-memory/JSON store
      return this.fallbackBookings
        .filter((b) => b.userId === userId)
        .map((b) => this.formatBookingPayload(b, { id: b.userId, email: b.customerEmail, phone: b.customerPhone }, b.astrologer));
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

      return this.formatBookingPayload(booking, booking.user, booking.astrologer);
    } catch (err: any) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException) {
        throw err;
      }

      this.initFallbackBookings();
      const b = this.fallbackBookings.find((item) => item.id === bookingId);
      if (!b) {
        throw new NotFoundException(`Booking with ID "${bookingId}" was not found.`);
      }

      const isAdmin = actor.role === 'ADMIN' || actor.role === 'SUPERADMIN';
      if (!isAdmin && b.userId !== actor.sub) {
        throw new ForbiddenException('You are not authorized to view another customer’s booking.');
      }

      return this.formatBookingPayload(b, { id: b.userId, email: b.customerEmail, phone: b.customerPhone }, b.astrologer);
    }
  }

  /**
   * Admin booking list with filtering, searching, and pagination.
   */
  async listAdminBookings(query: ListBookingsQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    let totalCount = 0;
    let formattedBookings: any[] = [];

    try {
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
          { customerName: { contains: search, mode: 'insensitive' } },
          { customerPhone: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { phone: { contains: search, mode: 'insensitive' } } },
          { notes: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [dbCount, dbBookings] = await Promise.all([
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

      if (dbCount > 0) {
        totalCount = dbCount;
        formattedBookings = dbBookings.map((b) =>
          this.formatBookingPayload(b, b.user, b.astrologer),
        );
        return {
          totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
          page,
          limit,
          bookings: formattedBookings,
        };
      }
    } catch (err: any) {
      this.logger.warn(`Prisma booking lookup failed (${err.message}). Using fallback bookings.`);
    }

    // If database returned 0 or was unreachable, serve from this.fallbackBookings (appointments.json)
    this.initFallbackBookings();
    let extraFallback = [...this.fallbackBookings];

    if (query.status && query.status !== 'ALL') {
      const targetStatus = query.status.toUpperCase();
      extraFallback = extraFallback.filter(
        (b) => (b.status || 'PENDING').toUpperCase() === targetStatus,
      );
    }

    if (query.serviceId && query.serviceId !== 'ALL') {
      extraFallback = extraFallback.filter((b) => b.serviceType === query.serviceId);
    }

    if (query.date) {
      extraFallback = extraFallback.filter((b) => b.scheduledDate === query.date);
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim().toLowerCase();
      extraFallback = extraFallback.filter(
        (b) =>
          (b.id && b.id.toLowerCase().includes(s)) ||
          (b.customerName && b.customerName.toLowerCase().includes(s)) ||
          (b.customerPhone && b.customerPhone.toLowerCase().includes(s)) ||
          (b.contactPhone && b.contactPhone.toLowerCase().includes(s)) ||
          (b.customerEmail && b.customerEmail.toLowerCase().includes(s)) ||
          (b.notes && b.notes.toLowerCase().includes(s)),
      );
    }

    totalCount = extraFallback.length;
    const paged = extraFallback.slice(skip, skip + limit);
    formattedBookings = paged.map((b) =>
      this.formatBookingPayload(
        b,
        { id: b.userId, name: b.customerName, email: b.customerEmail, phone: b.customerPhone || b.contactPhone },
        b.astrologer,
      ),
    );

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
    let booking = null;
    try {
      booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true },
      });
    } catch (e) {
      booking = null;
    }

    if (!booking) {
      this.initFallbackBookings();
      const fbIdx = this.fallbackBookings.findIndex((b) => b.id === bookingId);
      if (fbIdx !== -1) {
        const fb = this.fallbackBookings[fbIdx];
        const currentStatus = (fb.status || 'PENDING').toUpperCase();
        const targetStatus = dto.status.toUpperCase();

        const validTransitions: Record<string, string[]> = {
          PENDING_PAYMENT: ['APPROVED', 'CONFIRMED', 'CANCELLED', 'REJECTED'],
          PENDING: ['APPROVED', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'REJECTED'],
          APPROVED: ['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'REJECTED'],
          CONFIRMED: ['COMPLETED', 'CANCELLED', 'REJECTED'],
          CANCELLED: ['REJECTED', 'PENDING'],
          REJECTED: ['CANCELLED', 'PENDING'],
        };
        const allowed = validTransitions[currentStatus] || [];
        if (!allowed.includes(targetStatus)) {
          throw new BadRequestException(
            `Invalid status transition from "${currentStatus}" to "${targetStatus}". Allowed: ${allowed.join(', ')}`,
          );
        }

        fb.status = targetStatus;
        if (dto.notes) {
          fb.notes = `${fb.notes || ''} | Status (${targetStatus}): ${dto.notes}`;
        }
        this.saveFallbackBookings();
        return {
          message: `Booking status successfully updated to ${targetStatus}.`,
          booking: this.formatBookingPayload(fb),
        };
      }
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
    if (currentStatus === 'REJECTED') {
      throw new BadRequestException('Cannot change status of an already REJECTED appointment.');
    }

    // Allowed transition matrix:
    // PENDING_PAYMENT -> CONFIRMED, CANCELLED, REJECTED
    // PENDING -> CONFIRMED, CANCELLED, REJECTED
    // CONFIRMED -> COMPLETED, CANCELLED, REJECTED
    const validTransitions: Record<string, string[]> = {
      PENDING_PAYMENT: ['APPROVED', 'CONFIRMED', 'CANCELLED', 'REJECTED'],
      PENDING: ['APPROVED', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'REJECTED'],
      APPROVED: ['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'REJECTED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED', 'REJECTED'],
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

    // If a confirmed wallet-paid booking is cancelled or rejected, refund wallet balance atomically exactly once
    if (
      (targetStatus === 'CANCELLED' || targetStatus === 'REJECTED') &&
      booking.notes?.includes('Payment: WALLET_PAID') &&
      booking.totalCost > 0
    ) {
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
            description: `Refund for ${targetStatus === 'REJECTED' ? 'Rejected' : 'Cancelled'} Consultation #${bookingId.slice(0, 8).toUpperCase()}`,
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
      booking: this.formatBookingPayload(updatedBooking, updatedBooking.user, updatedBooking.astrologer),
    };
  }

  /**
   * Complete payment for an approved consultation appointment (Customer / Seeker).
   */
  async payForBooking(actor: JwtPayload, bookingId: string, paymentMethod = 'WALLET') {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID "${bookingId}" not found.`);
      }

      if (booking.userId !== actor.sub && actor.role !== 'ADMIN' && actor.role !== 'SUPERADMIN') {
        throw new ForbiddenException('Not authorized to pay for another user’s consultation.');
      }

      if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
        return {
          success: true,
          message: 'Booking is already paid and confirmed.',
          booking,
        };
      }

      if (booking.status === 'PENDING') {
        throw new BadRequestException(
          'Consultation request is awaiting admin approval. You can proceed with payment once approved.',
        );
      }

      if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') {
        throw new BadRequestException('This consultation request was cancelled or unavailable.');
      }

      const cost = Number(booking.totalCost || 2100);

      if (paymentMethod === 'WALLET') {
        const user = await this.prisma.user.findUnique({
          where: { id: actor.sub },
          select: { id: true, walletBalance: true },
        });

        if (!user || Number(user.walletBalance || 0) < cost) {
          throw new BadRequestException(
            `Insufficient wallet balance (₹${user?.walletBalance || 0}). Required: ₹${cost}`,
          );
        }

        await this.prisma.user.update({
          where: { id: actor.sub },
          data: { walletBalance: { decrement: cost } },
        });

        await this.prisma.walletTransaction.create({
          data: {
            userId: actor.sub,
            type: 'DEBIT',
            amount: cost,
            balanceAfter: Math.max(0, Number(user.walletBalance || 0) - cost),
            description: `Payment for consultation: ${booking.serviceType || bookingId}`,
            reference: `PAY_BOOKING_${bookingId}`,
          },
        });
      }

      const updated = await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          notes: booking.notes ? `${booking.notes} | Paid via ${paymentMethod}` : `Paid via ${paymentMethod}`,
        },
      });

      return {
        success: true,
        message: 'Payment completed successfully! Your consultation is now confirmed.',
        booking: this.formatBookingPayload(updated),
      };
    } catch (err: any) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException || err instanceof BadRequestException) throw err;

      // Fallback JSON store
      const idx = this.fallbackBookings.findIndex((b) => b.id === bookingId);
      if (idx !== -1) {
        const fb = this.fallbackBookings[idx];
        if (fb.status === 'PENDING') {
          throw new BadRequestException(
            'Consultation request is awaiting admin approval. You can proceed with payment once approved.',
          );
        }
        if (fb.status === 'CANCELLED' || fb.status === 'REJECTED') {
          throw new BadRequestException('This consultation request was cancelled or unavailable.');
        }

        fb.status = 'CONFIRMED';
        fb.notes = `${fb.notes || ''} | Paid via ${paymentMethod}`;
        this.saveFallbackBookings();
        return {
          success: true,
          message: 'Payment completed successfully! Your consultation is now confirmed.',
          booking: this.formatBookingPayload(fb),
        };
      }

      throw new NotFoundException(`Booking with ID "${bookingId}" not found in persistent store.`);
    }
  }

  /**
   * Reschedule an active consultation appointment (Admin/Superadmin only).
   * Validates target date/time, checks date blocking and slot collision within transaction.
   */
  async rescheduleAdminBooking(
    actor: JwtPayload,
    bookingId: string,
    dto: RescheduleBookingDto,
    ipAddress?: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, astrologer: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" was not found.`);
    }

    const currentStatus = booking.status.toUpperCase();
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED' || currentStatus === 'REJECTED') {
      throw new BadRequestException(`Cannot reschedule a ${currentStatus} booking.`);
    }

    // Check blocked date
    const blockedDate = await this.prisma.blockedDate.findUnique({
      where: { date: dto.scheduledDate },
    });
    if (blockedDate) {
      throw new BadRequestException(
        `Date ${dto.scheduledDate} is marked as blocked (${blockedDate.reason || 'Sanctuary closed'}). Cannot reschedule to this date.`,
      );
    }

    // Collision check and atomic reschedule
    const result = await this.prisma.$transaction(async (tx) => {
      const collision = await tx.booking.findFirst({
        where: {
          id: { not: bookingId },
          scheduledDate: dto.scheduledDate,
          scheduledTime: dto.scheduledTime,
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
      });

      if (collision) {
        throw new ConflictException(
          `Target slot (${dto.scheduledDate} at ${dto.scheduledTime}) is already booked by another consultation.`,
        );
      }

      const oldDate = booking.scheduledDate;
      const oldTime = booking.scheduledTime;
      const rescheduleReason = (dto.reason || dto.notes || '').trim();

      const rescheduleNote = `Rescheduled from ${oldDate} ${oldTime} to ${dto.scheduledDate} ${dto.scheduledTime}${rescheduleReason ? ` (Reason: ${rescheduleReason})` : ''}`;
      const updatedNotes = booking.notes
        ? `${booking.notes} | ${rescheduleNote}`
        : rescheduleNote;

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          scheduledDate: dto.scheduledDate,
          scheduledTime: dto.scheduledTime,
          notes: updatedNotes,
        },
        include: {
          astrologer: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'BOOKING_RESCHEDULED',
          actorId: actor.sub,
          actorEmail: actor.email,
          targetId: bookingId,
          details: {
            from: { date: oldDate, time: oldTime },
            to: { date: dto.scheduledDate, time: dto.scheduledTime },
            notes: rescheduleReason || null,
          },
          ipAddress: ipAddress || null,
        },
      });

      return updated;
    });

    return {
      message: `Appointment successfully rescheduled to ${dto.scheduledDate} at ${dto.scheduledTime}.`,
      booking: this.formatBookingPayload(result, result.user, result.astrologer),
    };
  }

  /**
   * Add or update consultation meeting URL (Admin/Superadmin only).
   */
  async updateAdminMeetLink(
    actor: JwtPayload,
    bookingId: string,
    dto: UpdateMeetLinkDto,
    ipAddress?: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        astrologer: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" was not found.`);
    }

    const currentStatus = booking.status.toUpperCase();
    if (currentStatus === 'CANCELLED' || currentStatus === 'REJECTED') {
      throw new BadRequestException(`Cannot assign a meeting link to a ${currentStatus} booking.`);
    }

    const trimmedUrl = (dto.meetLink || dto.meetingLink || '').trim();
    let notes = booking.notes || '';
    if (/MeetLink:\s*[^\s|]+/i.test(notes)) {
      notes = notes.replace(/MeetLink:\s*[^\s|]+/i, `MeetLink: ${trimmedUrl}`);
    } else {
      notes = notes ? `MeetLink: ${trimmedUrl} | ${notes}` : `MeetLink: ${trimmedUrl}`;
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { notes },
      include: {
        astrologer: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'BOOKING_MEET_LINK_UPDATED',
        actorId: actor.sub,
        actorEmail: actor.email,
        targetId: bookingId,
        details: {
          meetingLink: trimmedUrl,
        },
        ipAddress: ipAddress || null,
      },
    });

    return {
      message: 'Consultation room meeting link updated successfully.',
      booking: this.formatBookingPayload(updated, updated.user, updated.astrologer),
    };
  }

  /**
   * Verify manual / offline payment with evidence and update status to CONFIRMED (Admin/Superadmin only).
   */
  async verifyBookingPayment(
    actor: JwtPayload,
    bookingId: string,
    dto: VerifyPaymentDto,
    ipAddress?: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        astrologer: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" was not found.`);
    }

    if (booking.status.toUpperCase() !== 'PENDING_PAYMENT') {
      throw new BadRequestException(
        `Cannot verify payment for booking in "${booking.status}" status. Only PENDING_PAYMENT bookings can be verified.`,
      );
    }

    const verifyNote = (dto.verificationNotes || dto.notes || '').trim();
    const verificationNote = `Payment Verified: VERIFIED_MANUAL (Ref: ${dto.transactionReference}, Method: ${dto.paymentMethod || 'MANUAL'}, VerifiedBy: ${actor.email})${verifyNote ? ` - ${verifyNote}` : ''}`;
    const updatedNotes = booking.notes
      ? `${booking.notes} | ${verificationNote}`
      : verificationNote;

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        notes: updatedNotes,
      },
      include: {
        astrologer: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'BOOKING_PAYMENT_VERIFIED',
        actorId: actor.sub,
        actorEmail: actor.email,
        targetId: bookingId,
        details: {
          amount: booking.totalCost,
          transactionReference: dto.transactionReference,
          paymentMethod: dto.paymentMethod || 'MANUAL',
          notes: verifyNote || null,
        },
        ipAddress: ipAddress || null,
      },
    });

    return {
      message: 'Payment verified successfully. Consultation confirmed.',
      booking: this.formatBookingPayload(updated, updated.user, updated.astrologer),
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
    this.initFallbackBookings();

    try {
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

      const fallbackOnDate = this.fallbackBookings.filter(
        (b) => b.scheduledDate === dateStr && !['CANCELLED', 'REJECTED'].includes(b.status),
      );

      const bookingByTime = new Map(existingBookings.map((b) => [b.scheduledTime, b]));
      for (const fb of fallbackOnDate) {
        if (!bookingByTime.has(fb.scheduledTime)) {
          bookingByTime.set(fb.scheduledTime, fb);
        }
      }

      const enrichedSlots = dbSlots.map((slot) => {
        const booking: any = bookingByTime.get(slot.startTime);
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
                serviceType: booking.serviceType || booking.serviceTitle,
                serviceTitle: booking.serviceTitle || booking.serviceType,
                status: booking.status,
                customerName: booking.user?.name || booking.customerName || 'Vedic Seeker',
                customerEmail: booking.user?.email || booking.customerEmail || null,
                customerPhone: booking.user?.phone || booking.customerPhone || booking.contactPhone || null,
                meetLink: booking.meetLink || DEFAULT_GURUJI_MEET_LINK,
              }
            : null,
          canDelete: !isBooked,
        };
      });

      const allUpcoming = [
        ...existingBookings.map((b) => ({
          id: b.id,
          serviceTitle: b.serviceType,
          status: b.status,
          scheduledTime: b.scheduledTime,
          scheduledDate: b.scheduledDate,
          customerName: b.user?.name || 'Vedic Seeker',
          customerPhone: b.user?.phone || null,
          customerEmail: b.user?.email || null,
          meetLink: DEFAULT_GURUJI_MEET_LINK,
        })),
        ...fallbackOnDate.map((fb) => ({
          id: fb.id,
          serviceTitle: fb.serviceTitle || fb.serviceType,
          status: fb.status,
          scheduledTime: fb.scheduledTime,
          scheduledDate: fb.scheduledDate,
          customerName: fb.customerName || 'Vedic Seeker',
          customerPhone: fb.customerPhone || fb.contactPhone || null,
          customerEmail: fb.customerEmail || null,
          meetLink: fb.meetLink || DEFAULT_GURUJI_MEET_LINK,
        })),
      ];

      this.initFallbackBookings();
      const todayStr = new Date().toISOString().split('T')[0];
      const allActiveUpcoming = this.fallbackBookings
        .filter((b) => b.scheduledDate >= todayStr && !['CANCELLED', 'REJECTED'].includes(b.status))
        .map((fb) => ({
          id: fb.id,
          serviceTitle: fb.serviceTitle || fb.serviceType,
          status: fb.status,
          scheduledTime: fb.scheduledTime,
          scheduledDate: fb.scheduledDate,
          customerName: fb.customerName || 'Vedic Seeker',
          customerPhone: fb.customerPhone || fb.contactPhone || null,
          customerEmail: fb.customerEmail || null,
          meetLink: fb.meetLink || DEFAULT_GURUJI_MEET_LINK,
        }));

      allActiveUpcoming.sort((a, b) => {
        const tA = getBookingTimestamp(a.scheduledDate, a.scheduledTime);
        const tB = getBookingTimestamp(b.scheduledDate, b.scheduledTime);
        return tA - tB;
      });

      allUpcoming.sort((a, b) => {
        const tA = parseTimeToMinutes(a.scheduledTime);
        const tB = parseTimeToMinutes(b.scheduledTime);
        return tA - tB;
      });

      return {
        date: dateStr,
        isBlocked: Boolean(blockedDate),
        blockedReason: blockedDate?.reason || null,
        slots: enrichedSlots,
        totalSlots: enrichedSlots.length,
        bookedCount: enrichedSlots.filter((s) => s.isBooked).length,
        upcomingBookings: allUpcoming,
        allUpcomingBookings: allActiveUpcoming,
      };
    } catch (err: any) {
      this.logger.warn(`Prisma availability lookup failed (${err.message}). Using fallback schedule.`);
      const fallbackOnDate = this.fallbackBookings.filter(
        (b) => b.scheduledDate === dateStr && !['CANCELLED', 'REJECTED'].includes(b.status),
      );
      const bookingByTime = new Map(fallbackOnDate.map((b) => [b.scheduledTime, b]));

      const fallbackSlots = PUBLISHED_TIME_SLOTS.map((time, idx) => {
        const fb = bookingByTime.get(time);
        const isBooked = Boolean(fb);
        return {
          id: `slot-${dateStr}-${idx}`,
          date: dateStr,
          startTime: time,
          durationMinutes: 45,
          isPublished: true,
          notes: null,
          isBooked,
          booking: fb
            ? {
                id: fb.id,
                serviceType: fb.serviceType || fb.serviceTitle,
                serviceTitle: fb.serviceTitle || fb.serviceType,
                status: fb.status,
                customerName: fb.customerName || 'Vedic Seeker',
                customerEmail: fb.customerEmail || null,
                customerPhone: fb.customerPhone || fb.contactPhone || null,
                meetLink: fb.meetLink || DEFAULT_GURUJI_MEET_LINK,
              }
            : null,
          canDelete: !isBooked,
        };
      });

      this.initFallbackBookings();
      const todayStr = new Date().toISOString().split('T')[0];
      const allActiveUpcoming = this.fallbackBookings
        .filter((b) => b.scheduledDate >= todayStr && !['CANCELLED', 'REJECTED'].includes(b.status))
        .map((fb) => ({
          id: fb.id,
          serviceTitle: fb.serviceTitle || fb.serviceType,
          status: fb.status,
          scheduledTime: fb.scheduledTime,
          scheduledDate: fb.scheduledDate,
          customerName: fb.customerName || 'Vedic Seeker',
          customerPhone: fb.customerPhone || fb.contactPhone || null,
          customerEmail: fb.customerEmail || null,
          meetLink: fb.meetLink || DEFAULT_GURUJI_MEET_LINK,
        }));

      allActiveUpcoming.sort((a, b) => {
        const tA = getBookingTimestamp(a.scheduledDate, a.scheduledTime);
        const tB = getBookingTimestamp(b.scheduledDate, b.scheduledTime);
        return tA - tB;
      });

      const upcomingForDate = fallbackOnDate.map((fb) => ({
        id: fb.id,
        serviceTitle: fb.serviceTitle || fb.serviceType,
        status: fb.status,
        scheduledTime: fb.scheduledTime,
        scheduledDate: fb.scheduledDate,
        customerName: fb.customerName || 'Vedic Seeker',
        customerPhone: fb.customerPhone || fb.contactPhone || null,
        customerEmail: fb.customerEmail || null,
        meetLink: fb.meetLink || DEFAULT_GURUJI_MEET_LINK,
      }));

      upcomingForDate.sort((a, b) => {
        const tA = parseTimeToMinutes(a.scheduledTime);
        const tB = parseTimeToMinutes(b.scheduledTime);
        return tA - tB;
      });

      return {
        date: dateStr,
        isBlocked: false,
        blockedReason: null,
        slots: fallbackSlots,
        totalSlots: fallbackSlots.length,
        bookedCount: fallbackSlots.filter((s) => s.isBooked).length,
        upcomingBookings: upcomingForDate,
        allUpcomingBookings: allActiveUpcoming,
      };
    }
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

  /**
   * Permanently delete a booking (Admin/Superadmin only).
   * Unlinks any associated slot and logs the action in AuditLog.
   */
  async deleteAdminBooking(actor: JwtPayload, bookingId: string, ipAddress?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        astrologer: { select: { id: true, name: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" was not found.`);
    }

    await this.prisma.booking.delete({
      where: { id: booking.id },
    });

    // Record immutable audit log
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'BOOKING_DELETED',
          actorId: actor.sub,
          actorEmail: actor.email,
          targetId: booking.id,
          targetEmail: booking.user?.email || null,
          details: {
            serviceType: booking.serviceType,
            scheduledDate: booking.scheduledDate,
            scheduledTime: booking.scheduledTime,
            customerName: (booking as any).customerName || booking.user?.name,
            totalCost: booking.totalCost,
            status: booking.status,
          },
          ipAddress: ipAddress || null,
        },
      });
    } catch (auditErr: any) {
      // Gracefully log audit error
    }

    return {
      success: true,
      message: `Booking #${booking.id.slice(0, 8)} (${booking.scheduledDate}) has been permanently deleted.`,
      bookingId: booking.id,
    };
  }
}

