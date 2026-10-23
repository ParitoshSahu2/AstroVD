import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppointmentsService } from './appointments.service.js';
import { AdminAvailabilityController } from './admin-availability.controller.js';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Role, AccountStatus } from '../auth/roles.enum.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';

describe('Admin Availability Management (Stage 7B)', () => {
  let service: AppointmentsService;
  let controller: AdminAvailabilityController;
  let prisma: any;

  const mockAdmin: JwtPayload = {
    sub: 'admin-uuid-1',
    email: 'admin@astrovd.com',
    role: Role.ADMIN,
    status: AccountStatus.ACTIVE,
    tokenVersion: 1,
  };

  const mockSuperAdmin: JwtPayload = {
    sub: 'superadmin-uuid-1',
    email: 'superadmin@astrovd.com',
    role: Role.SUPERADMIN,
    status: AccountStatus.ACTIVE,
    tokenVersion: 1,
  };

  const mockCustomer: JwtPayload = {
    sub: 'user-uuid-1',
    email: 'seeker@astrovd.com',
    role: Role.USER,
    status: AccountStatus.ACTIVE,
    tokenVersion: 1,
  };

  const mockAstrologer: JwtPayload = {
    sub: 'astrologer-uuid-1',
    email: 'panditji@astrovd.com',
    role: Role.ASTROLOGER,
    status: AccountStatus.ACTIVE,
    tokenVersion: 1,
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      astrologer: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'astrologer-1',
          name: 'Dr. Pandit Vishal Dubey',
        }),
      },
      booking: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
      },
      blockedDate: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockImplementation((args: any) =>
          Promise.resolve({ id: 'block-1', ...args.create }),
        ),
        delete: vi.fn().mockResolvedValue({ id: 'block-1' }),
      },
      appointmentSlot: {
        findUnique: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockImplementation((args: any) =>
          Promise.resolve({ id: 'slot-uuid-1', ...args.data }),
        ),
        createMany: vi.fn().mockResolvedValue({ count: 6 }),
        update: vi.fn().mockImplementation((args: any) =>
          Promise.resolve({ id: args.where.id, ...args.data }),
        ),
        delete: vi.fn().mockResolvedValue({ id: 'slot-uuid-1' }),
        upsert: vi.fn().mockImplementation((args: any) =>
          Promise.resolve({ id: 'slot-uuid-1', ...args.create }),
        ),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
      $transaction: vi.fn(),
    };

    service = new AppointmentsService(prisma);
    controller = new AdminAvailabilityController(service);
  });

  describe('Admin View Availability by Date', () => {
    it('should return slots with booking statuses and blocked state for date', async () => {
      const date = '2099-10-25';
      prisma.appointmentSlot.findMany.mockResolvedValue([
        {
          id: 's-1',
          date,
          startTime: '10:00 AM',
          durationMinutes: 45,
          isPublished: true,
          notes: 'Morning slot',
        },
        {
          id: 's-2',
          date,
          startTime: '11:30 AM',
          durationMinutes: 45,
          isPublished: true,
          notes: null,
        },
      ]);

      prisma.booking.findMany.mockResolvedValue([
        {
          id: 'b-1',
          scheduledTime: '10:00 AM',
          serviceType: 'astrological_consultation',
          status: 'CONFIRMED',
          user: {
            name: 'Seeker Rahul',
            email: 'rahul@test.com',
            phone: '+919826012345',
          },
        },
      ]);

      const res = await service.getAdminAvailability(date);
      expect(res.date).toBe(date);
      expect(res.isBlocked).toBe(false);
      expect(res.totalSlots).toBe(2);
      expect(res.bookedCount).toBe(1);

      // Booked slot
      const bookedSlot = res.slots.find((s) => s.startTime === '10:00 AM');
      expect(bookedSlot?.isBooked).toBe(true);
      expect(bookedSlot?.canDelete).toBe(false);
      expect(bookedSlot?.booking?.customerName).toBe('Seeker Rahul');

      // Free slot
      const freeSlot = res.slots.find((s) => s.startTime === '11:30 AM');
      expect(freeSlot?.isBooked).toBe(false);
      expect(freeSlot?.canDelete).toBe(true);
      expect(freeSlot?.booking).toBeNull();
    });

    it('should reject invalid date format in availability query', async () => {
      await expect(service.getAdminAvailability('invalid-date')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Slot Creation', () => {
    it('should create an available consultation time slot and write audit log', async () => {
      const dto = {
        date: '2099-11-01',
        startTime: '08:00 AM',
        durationMinutes: 60,
        isPublished: true,
        notes: 'Early morning Brahma Muhurta session',
      };

      const result = await service.createAdminSlot(mockAdmin, dto, '127.0.0.1');
      expect(result.slot.startTime).toBe('08:00 AM');
      expect(result.slot.durationMinutes).toBe(60);
      expect(prisma.appointmentSlot.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'SLOT_CREATED',
            actorEmail: 'admin@astrovd.com',
          }),
        }),
      );
    });

    it('should reject creating slot on past date', async () => {
      await expect(
        service.createAdminSlot(mockAdmin, {
          date: '2020-01-01',
          startTime: '10:00 AM',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate slot on same date and start time', async () => {
      prisma.appointmentSlot.findUnique.mockResolvedValue({
        id: 'existing-s-1',
        date: '2099-11-01',
        startTime: '10:00 AM',
      });

      await expect(
        service.createAdminSlot(mockAdmin, {
          date: '2099-11-01',
          startTime: '10:00 AM',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Slot Editing and Publishing Control', () => {
    it('should allow toggling publish status and updating notes/duration', async () => {
      prisma.appointmentSlot.findUnique.mockResolvedValue({
        id: 'slot-1',
        date: '2099-11-01',
        startTime: '10:00 AM',
        durationMinutes: 45,
        isPublished: true,
      });

      const res = await service.updateAdminSlot(
        mockAdmin,
        'slot-1',
        { isPublished: false, notes: 'Reserved for temple festival' },
        '127.0.0.1',
      );

      expect(res.slot.isPublished).toBe(false);
      expect(prisma.appointmentSlot.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'slot-1' },
          data: expect.objectContaining({ isPublished: false }),
        }),
      );
    });

    it('should reject changing start time if active booking is confirmed on slot', async () => {
      prisma.appointmentSlot.findUnique.mockResolvedValue({
        id: 'slot-1',
        date: '2099-11-01',
        startTime: '10:00 AM',
      });

      prisma.booking.findFirst.mockResolvedValue({
        id: 'b-1',
        scheduledDate: '2099-11-01',
        scheduledTime: '10:00 AM',
        status: 'CONFIRMED',
      });

      await expect(
        service.updateAdminSlot(mockAdmin, 'slot-1', { startTime: '10:30 AM' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Accidental Removal Prevention (Slot Deletion)', () => {
    it('should successfully delete an unbooked slot', async () => {
      prisma.appointmentSlot.findUnique.mockResolvedValue({
        id: 'slot-unbooked',
        date: '2099-11-01',
        startTime: '10:00 AM',
      });
      prisma.booking.findFirst.mockResolvedValue(null);

      const res = await service.deleteAdminSlot(mockAdmin, 'slot-unbooked');
      expect(res.message).toContain('permanently deleted');
      expect(prisma.appointmentSlot.delete).toHaveBeenCalledWith({
        where: { id: 'slot-unbooked' },
      });
    });

    it('should reject deleting slot when active booking exists to prevent booking invalidation', async () => {
      prisma.appointmentSlot.findUnique.mockResolvedValue({
        id: 'slot-booked',
        date: '2099-11-01',
        startTime: '10:00 AM',
      });
      prisma.booking.findFirst.mockResolvedValue({
        id: 'active-booking-1',
        status: 'CONFIRMED',
      });

      await expect(
        service.deleteAdminSlot(mockAdmin, 'slot-booked'),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.appointmentSlot.delete).not.toHaveBeenCalled();
    });
  });

  describe('Date Blocking & Sanctuary Holiday Controls', () => {
    it('should block a date and prevent customer bookings', async () => {
      const blockRes = await service.blockDate(
        mockAdmin,
        {
          date: '2099-11-12',
          reason: 'Diwali Sanctuary Maha Puja',
        },
        '127.0.0.1',
      );

      expect(blockRes.blockedDate.date).toBe('2099-11-12');
      expect(prisma.blockedDate.upsert).toHaveBeenCalled();

      // Customer checks slots for blocked date
      prisma.blockedDate.findUnique.mockResolvedValue({
        id: 'block-1',
        date: '2099-11-12',
        reason: 'Diwali Sanctuary Maha Puja',
      });

      const customerAvailability = await service.getAvailableSlots(
        'astrological_consultation',
        '2099-11-12',
      );
      expect(customerAvailability.isBlocked).toBe(true);
      expect(customerAvailability.slots.length).toBe(0);
      expect(customerAvailability.blockedReason).toContain('Diwali Sanctuary Maha Puja');
    });

    it('should reject booking on blocked date', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        status: 'ACTIVE',
      });
      prisma.blockedDate.findUnique.mockResolvedValue({
        id: 'block-1',
        date: '2099-11-12',
        reason: 'Temple Festival',
      });

      await expect(
        service.bookAppointment(mockCustomer, {
          serviceId: 'astrological_consultation',
          scheduledDate: '2099-11-12',
          scheduledTime: '10:00 AM',
          contactPhone: '+919826012345',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should unblock a previously blocked date', async () => {
      prisma.blockedDate.findUnique.mockResolvedValue({
        id: 'b-1',
        date: '2099-11-12',
      });

      const res = await service.unblockDate(mockAdmin, '2099-11-12');
      expect(res.message).toContain('unblocked');
      expect(prisma.blockedDate.delete).toHaveBeenCalledWith({
        where: { date: '2099-11-12' },
      });
    });
  });

  describe('Bulk Schedule Initialization', () => {
    it('should initialize standard Vedic schedule for upcoming days', async () => {
      const res = await service.initializeStandardSchedule(mockSuperAdmin, {
        startDate: '2099-12-01',
        daysCount: 3,
      });

      expect(res.daysCount).toBe(3);
      expect(res.slotsProcessed).toBe(18); // 3 days * 6 slots
      expect(prisma.appointmentSlot.upsert).toHaveBeenCalledTimes(18);
    });
  });

  describe('Customer Visibility: Unpublished Slots', () => {
    it('should only return published slots to customers', async () => {
      const date = '2099-10-25';
      prisma.appointmentSlot.findMany.mockImplementation((args: any) => {
        if (args.where?.isPublished === true) {
          return Promise.resolve([
            {
              id: 's-1',
              date,
              startTime: '10:00 AM',
              durationMinutes: 45,
              isPublished: true,
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const customerRes = await service.getAvailableSlots(
        'astrological_consultation',
        date,
      );

      expect(customerRes.slots.length).toBe(1);
      expect(customerRes.slots[0].time).toBe('10:00 AM');
    });
  });
});
