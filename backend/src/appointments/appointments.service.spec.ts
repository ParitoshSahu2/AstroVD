import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppointmentsService } from './appointments.service.js';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Role, AccountStatus } from '../auth/roles.enum.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: any;

  const mockUser: JwtPayload = {
    sub: 'user-uuid-1',
    email: 'seeker@astrovd.com',
    role: Role.USER,
    status: AccountStatus.ACTIVE,
    tokenVersion: 1,
  };

  const mockAdmin: JwtPayload = {
    sub: 'admin-uuid-1',
    email: 'admin@astrovd.com',
    role: Role.ADMIN,
    status: AccountStatus.ACTIVE,
    tokenVersion: 1,
  };

  const mockOtherUser: JwtPayload = {
    sub: 'user-uuid-2',
    email: 'other@astrovd.com',
    role: Role.USER,
    status: AccountStatus.ACTIVE,
    tokenVersion: 1,
  };

  const mockLeadAstrologer = {
    id: 'astrologer-uuid-1',
    name: 'Dr. Pandit Vishal Dubey',
    title: 'PhD in Vedic Astrology',
    imageUrl: '/dr_vishal_dubey.jpg',
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      astrologer: {
        findFirst: vi.fn().mockResolvedValue(mockLeadAstrologer),
        create: vi.fn().mockResolvedValue(mockLeadAstrologer),
      },
      booking: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
      blockedDate: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockImplementation((args: any) => Promise.resolve({ id: 'block-1', ...args.create })),
        delete: vi.fn().mockResolvedValue({ id: 'block-1' }),
      },
      appointmentSlot: {
        findUnique: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockImplementation((args: any) => Promise.resolve({ id: 'slot-1', ...args.data })),
        createMany: vi.fn().mockResolvedValue({ count: 6 }),
        update: vi.fn().mockImplementation((args: any) => Promise.resolve({ id: args.where.id, ...args.data })),
        delete: vi.fn().mockResolvedValue({ id: 'slot-1' }),
        upsert: vi.fn().mockImplementation((args: any) => Promise.resolve({ id: 'slot-1', ...args.create })),
      },
      $transaction: vi.fn(),
    };

    service = new AppointmentsService(prisma);
  });

  describe('Service Catalogue Inspection', () => {
    it('should return all 29 canonical services', () => {
      const services = service.getServices();
      expect(services.length).toBe(29);
      expect(services.some((s) => s.id === 'astrological_consultation')).toBe(true);
      expect(services.some((s) => s.id === 'marriage_match_making')).toBe(true);
      expect(services.some((s) => s.id === 'free_birth_chart_baby_girl')).toBe(true);
    });

    it('should load specific service details correctly by stable ID', () => {
      const item = service.getServiceById('astrological_consultation');
      expect(item).toBeDefined();
      expect(item.title).toBe('ASTROLOGICAL CONSULTATION');
      expect(item.priceNumber).toBe(2100);
      expect(item.pandit).toContain('Pandit Vishal Dubey');
      expect(item.image).toBe('/services/consultation.jpg');
    });

    it('should throw NotFoundException for unknown service ID', () => {
      expect(() => service.getServiceById('invalid_unknown_service')).toThrow(
        NotFoundException,
      );
    });

    it('should filter catalogue by category', () => {
      const astrologyServices = service.getServices('astrology');
      expect(astrologyServices.length).toBeGreaterThan(0);
      expect(astrologyServices.every((s) => s.categoryKey === 'astrology')).toBe(true);
    });
  });

  describe('Slot Calculation & Availability', () => {
    it('should return published slots with availability checked against database', async () => {
      prisma.booking.findMany.mockResolvedValue([
        {
          id: 'b-1',
          scheduledTime: '11:00 AM',
          serviceType: 'astrological_consultation',
          astrologerId: 'astrologer-uuid-1',
        },
      ]);

      const futureDate = '2099-12-31';
      const result = await service.getAvailableSlots(
        'astrological_consultation',
        futureDate,
      );

      expect(result.serviceId).toBe('astrological_consultation');
      expect(result.date).toBe(futureDate);
      expect(result.slots.length).toBe(6);

      const bookedSlot = result.slots.find((s) => s.time === '11:00 AM');
      expect(bookedSlot?.isAvailable).toBe(false);
      expect(bookedSlot?.reason).toBe('Already Reserved');

      const freeSlot = result.slots.find((s) => s.time === '10:00 AM');
      expect(freeSlot?.isAvailable).toBe(true);
    });

    it('should mark all slots unavailable for past dates', async () => {
      prisma.booking.findMany.mockResolvedValue([]);
      const pastDate = '2020-01-01';

      const result = await service.getAvailableSlots('birth_chart_kundli', pastDate);
      expect(result.slots.every((s) => s.isAvailable === false)).toBe(true);
      expect(result.slots[0].reason).toBe('Date is in the past');
    });

    it('should reject invalid date formats', async () => {
      await expect(
        service.getAvailableSlots('astrological_consultation', 'invalid-date'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Appointment Booking Flow & Validation', () => {
    it('should successfully book an available slot with server-controlled pricing', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        name: 'Rahul Sharma',
        email: 'seeker@astrovd.com',
        phone: '+919826012345',
        status: 'ACTIVE',
      });

      const futureDate = '2099-10-25';
      const createdBooking = {
        id: 'booking-uuid-123',
        userId: 'user-uuid-1',
        astrologerId: mockLeadAstrologer.id,
        serviceType: 'astrological_consultation',
        scheduledDate: futureDate,
        scheduledTime: '11:00 AM',
        durationMinutes: 30,
        totalCost: 2100,
        status: 'CONFIRMED',
        notes: 'Mode: VIDEO | Contact: +919826012345',
        createdAt: new Date(),
        astrologer: mockLeadAstrologer,
        user: {
          id: 'user-uuid-1',
          name: 'Rahul Sharma',
          email: 'seeker@astrovd.com',
          phone: '+919826012345',
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          booking: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue(createdBooking),
          },
          user: {
            update: vi.fn(),
          },
        };
        return await callback(tx);
      });

      const response = await service.bookAppointment(mockUser, {
        serviceId: 'astrological_consultation',
        scheduledDate: futureDate,
        scheduledTime: '11:00 AM',
        consultationType: 'video',
        contactPhone: '+91 98260 12345',
        notes: 'Career progression question',
      });

      expect(response.success).toBe(true);
      expect(response.booking.id).toBe('booking-uuid-123');
      expect(response.booking.serviceTitle).toBe('ASTROLOGICAL CONSULTATION');
      expect(response.booking.totalCost).toBe(2100); // Server-enforced price
      expect(response.booking.contactPhone).toBe('+919826012345');
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('should atomically debit wallet and confirm booking when paymentMethod is WALLET', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        phone: '+919826012345',
        status: 'ACTIVE',
      });

      const futureDate = '2099-10-25';
      const createdBooking = {
        id: 'booking-wallet-1',
        userId: 'user-uuid-1',
        astrologerId: mockLeadAstrologer.id,
        serviceType: 'astrological_consultation',
        scheduledDate: futureDate,
        scheduledTime: '11:00 AM',
        durationMinutes: 30,
        totalCost: 2100,
        status: 'CONFIRMED',
        notes: 'Mode: VIDEO | Contact: +919826012345 | Payment: WALLET_PAID',
        createdAt: new Date(),
        astrologer: mockLeadAstrologer,
        user: {
          id: 'user-uuid-1',
          name: 'Rahul Sharma',
          email: 'seeker@astrovd.com',
          phone: '+919826012345',
        },
      };

      const mockUserUpdate = vi.fn().mockResolvedValue({ id: 'user-uuid-1', walletBalance: 2900 });
      const mockWalletTxCreate = vi.fn().mockResolvedValue({ id: 'wt-booking-1' });

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          booking: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue(createdBooking),
          },
          user: {
            findUnique: vi.fn().mockResolvedValue({ id: 'user-uuid-1', walletBalance: 5000 }),
            update: mockUserUpdate,
          },
          walletTransaction: {
            create: mockWalletTxCreate,
          },
        };
        return await callback(tx);
      });

      const response = await service.bookAppointment(mockUser, {
        serviceId: 'astrological_consultation',
        scheduledDate: futureDate,
        scheduledTime: '11:00 AM',
        consultationType: 'video',
        contactPhone: '+91 98260 12345',
        paymentMethod: 'WALLET',
      });

      expect(response.success).toBe(true);
      expect(response.booking.status).toBe('CONFIRMED');
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { walletBalance: { decrement: 2100 } },
        select: { walletBalance: true },
      });
      expect(mockWalletTxCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-uuid-1',
          type: 'DEBIT',
          amount: 2100,
          reference: 'BOOKING_booking-wallet-1',
        }),
      });
    });

    it('should reject appointment and roll back transaction when wallet balance is insufficient', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        phone: '+919826012345',
        status: 'ACTIVE',
      });

      const futureDate = '2099-10-25';

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          booking: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn(),
          },
          user: {
            findUnique: vi.fn().mockResolvedValue({ id: 'user-uuid-1', walletBalance: 150.0 }), // Consultation is 2100
            update: vi.fn(),
          },
          walletTransaction: {
            create: vi.fn(),
          },
        };
        return await callback(tx);
      });

      await expect(
        service.bookAppointment(mockUser, {
          serviceId: 'astrological_consultation',
          scheduledDate: futureDate,
          scheduledTime: '11:00 AM',
          consultationType: 'video',
          contactPhone: '+91 98260 12345',
          paymentMethod: 'WALLET',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject completing an unpaid appointment with status PENDING_PAYMENT', async () => {
      prisma.booking.findUnique.mockResolvedValueOnce({
        id: 'booking-unpaid-1',
        status: 'PENDING_PAYMENT',
        serviceType: 'astrological_consultation',
        user: { id: 'u1' },
      });

      await expect(
        service.updateBookingStatus(mockAdmin, 'booking-unpaid-1', { status: 'COMPLETED' }),
      ).rejects.toThrow(BadRequestException);
    });


    it('should reject booking when user account is SUSPENDED', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        status: 'SUSPENDED',
      });

      await expect(
        service.bookAppointment(mockUser, {
          serviceId: 'astrological_consultation',
          scheduledDate: '2099-10-25',
          scheduledTime: '11:00 AM',
          contactPhone: '+919826012345',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject invalid or unpublished time slots', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        status: 'ACTIVE',
      });

      await expect(
        service.bookAppointment(mockUser, {
          serviceId: 'astrological_consultation',
          scheduledDate: '2099-10-25',
          scheduledTime: '03:15 AM', // Not in published slots
          contactPhone: '+919826012345',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject past appointment dates', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        status: 'ACTIVE',
      });

      await expect(
        service.bookAppointment(mockUser, {
          serviceId: 'astrological_consultation',
          scheduledDate: '2020-01-01',
          scheduledTime: '10:00 AM',
          contactPhone: '+919826012345',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject dummy phone number (+919876543210)', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        status: 'ACTIVE',
      });

      await expect(
        service.bookAppointment(mockUser, {
          serviceId: 'astrological_consultation',
          scheduledDate: '2099-10-25',
          scheduledTime: '10:00 AM',
          contactPhone: '+919876543210',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Concurrency & Double-Booking Prevention', () => {
    it('should reject second booking when slot is concurrently reserved in transaction', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        status: 'ACTIVE',
      });

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          booking: {
            findFirst: vi.fn().mockResolvedValue({
              id: 'already-existing-booking',
              scheduledDate: '2099-10-25',
              scheduledTime: '11:00 AM',
            }),
          },
        };
        return await callback(tx);
      });

      await expect(
        service.bookAppointment(mockUser, {
          serviceId: 'astrological_consultation',
          scheduledDate: '2099-10-25',
          scheduledTime: '11:00 AM',
          contactPhone: '+919826012345',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Customer Privacy & Booking Access', () => {
    it('should allow customer to view only their own bookings', async () => {
      prisma.booking.findMany.mockResolvedValue([
        {
          id: 'b-1',
          userId: 'user-uuid-1',
          serviceType: 'astrological_consultation',
          scheduledDate: '2099-10-25',
          scheduledTime: '11:00 AM',
          durationMinutes: 30,
          totalCost: 2100,
          status: 'CONFIRMED',
          notes: 'Notes',
          createdAt: new Date(),
          astrologer: mockLeadAstrologer,
        },
      ]);

      const bookings = await service.getCustomerBookings('user-uuid-1');
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-uuid-1' },
        }),
      );
      expect(bookings.length).toBe(1);
      expect(bookings[0].serviceTitle).toBe('ASTROLOGICAL CONSULTATION');
    });

    it('should prevent customer from viewing another customer’s private booking', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-private',
        userId: 'user-uuid-1', // owned by user-uuid-1
        serviceType: 'marriage_match_making',
        scheduledDate: '2099-10-25',
        scheduledTime: '11:00 AM',
        durationMinutes: 30,
        totalCost: 2500,
        status: 'CONFIRMED',
        astrologer: mockLeadAstrologer,
        user: {
          id: 'user-uuid-1',
          name: 'Priya',
          email: 'priya@astrovd.com',
          phone: '+919826012345',
        },
      });

      // otherUser attempts to inspect user-1's booking
      await expect(
        service.getBookingById(mockOtherUser, 'b-private'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to view any customer’s booking detail', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-private',
        userId: 'user-uuid-1',
        serviceType: 'marriage_match_making',
        scheduledDate: '2099-10-25',
        scheduledTime: '11:00 AM',
        durationMinutes: 30,
        totalCost: 2500,
        status: 'CONFIRMED',
        astrologer: mockLeadAstrologer,
        user: {
          id: 'user-uuid-1',
          name: 'Priya',
          email: 'priya@astrovd.com',
          phone: '+919826012345',
        },
      });

      const result = await service.getBookingById(mockAdmin, 'b-private');
      expect(result.id).toBe('b-private');
      expect(result.customer.name).toBe('Priya');
    });
  });

  describe('Admin Dashboard & Status Transitions', () => {
    it('should list bookings across customers and services with pagination and filters', async () => {
      prisma.booking.count.mockResolvedValue(1);
      prisma.booking.findMany.mockResolvedValue([
        {
          id: 'b-1',
          serviceType: 'astrological_consultation',
          scheduledDate: '2099-10-25',
          scheduledTime: '11:00 AM',
          durationMinutes: 30,
          totalCost: 2100,
          status: 'CONFIRMED',
          notes: 'Test note',
          createdAt: new Date(),
          astrologer: mockLeadAstrologer,
          user: {
            id: 'user-uuid-1',
            name: 'Rahul',
            email: 'rahul@astrovd.com',
            phone: '+919826012345',
          },
        },
      ]);

      const result = await service.listAdminBookings({
        status: 'CONFIRMED',
        page: 1,
        limit: 20,
      });

      expect(result.totalCount).toBe(1);
      expect(result.bookings.length).toBe(1);
      expect(result.bookings[0].serviceTitle).toBe('ASTROLOGICAL CONSULTATION');
      expect(result.bookings[0].customer.phone).toBe('+919826012345');
    });

    it('should allow valid status transition from CONFIRMED to COMPLETED', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-1',
        status: 'CONFIRMED',
        notes: 'Initial notes',
        user: { id: 'u-1', email: 'u1@astrovd.com' },
      });

      prisma.booking.update.mockResolvedValue({
        id: 'b-1',
        status: 'COMPLETED',
        notes: 'Initial notes | Status update (COMPLETED): Done',
        astrologer: mockLeadAstrologer,
        user: { id: 'u-1', name: 'User 1', email: 'u1@astrovd.com', phone: '+919826012345' },
      });

      const res = await service.updateBookingStatus(mockAdmin, 'b-1', {
        status: 'COMPLETED',
        notes: 'Done',
      });

      expect(res.booking.status).toBe('COMPLETED');
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'BOOKING_STATUS_UPDATED',
          }),
        }),
      );
    });

    it('should reject invalid status transition (e.g. COMPLETED -> CONFIRMED)', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-completed',
        status: 'COMPLETED',
        notes: '',
        user: { id: 'u-1' },
      });

      await expect(
        service.updateBookingStatus(mockAdmin, 'b-completed', {
          status: 'CONFIRMED',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject status transition on CANCELLED booking', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-cancelled',
        status: 'CANCELLED',
        notes: '',
        user: { id: 'u-1' },
      });

      await expect(
        service.updateBookingStatus(mockAdmin, 'b-cancelled', {
          status: 'COMPLETED',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
