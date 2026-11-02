import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppointmentsService } from './appointments.service.js';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Role, AccountStatus } from '../auth/roles.enum.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';

describe('Admin Booking Lifecycle, Rescheduling, Meeting Links & Payment Verification', () => {
  let service: AppointmentsService;
  let prisma: any;
  let emailService: any;

  const mockAdmin: JwtPayload = {
    sub: 'admin-uuid-1',
    email: 'admin@astrovd.com',
    role: Role.ADMIN,
    status: AccountStatus.ACTIVE,
  };

  beforeEach(() => {
    prisma = {
      booking: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
      },
      user: {
        update: vi.fn().mockResolvedValue({ walletBalance: 500 }),
      },
      walletTransaction: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      blockedDate: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
      appointmentSlot: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-log-uuid' }),
      },
      $transaction: vi.fn(async (callback) => await callback(prisma)),
    };

    emailService = {
      sendEmail: vi.fn().mockResolvedValue(true),
    };

    service = new AppointmentsService(prisma as any, emailService as any);
  });

  describe('Booking Status Transitions & Single-Refund Guarantee', () => {
    it('should transition PENDING_PAYMENT to CONFIRMED or REJECTED', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-101',
        status: 'PENDING_PAYMENT',
        totalCost: 1100,
        notes: 'Initial booking',
        userId: 'u-1',
      });
      prisma.booking.update.mockResolvedValue({
        id: 'b-101',
        status: 'CONFIRMED',
        totalCost: 1100,
        notes: 'Initial booking | Status update (CONFIRMED): Payment received',
        user: { id: 'u-1', name: 'Rohan Sharma', email: 'rohan@example.com', phone: '+919876543210' },
        astrologer: null,
      });

      const res = await service.updateBookingStatus(mockAdmin, 'b-101', {
        status: 'CONFIRMED',
        notes: 'Payment received',
      });

      expect(res.booking.status).toBe('CONFIRMED');
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'BOOKING_STATUS_UPDATED',
            details: expect.objectContaining({ fromStatus: 'PENDING_PAYMENT', toStatus: 'CONFIRMED' }),
          }),
        }),
      );
    });

    it('should reject invalid transition from PENDING_PAYMENT to COMPLETED without confirmation', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-102',
        status: 'PENDING_PAYMENT',
        totalCost: 1100,
        userId: 'u-1',
      });

      await expect(
        service.updateBookingStatus(mockAdmin, 'b-102', { status: 'COMPLETED' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject status modification for terminal state COMPLETED, CANCELLED, or REJECTED', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-term',
        status: 'REJECTED',
        totalCost: 1100,
        userId: 'u-1',
      });

      await expect(
        service.updateBookingStatus(mockAdmin, 'b-term', { status: 'CONFIRMED' }),
      ).rejects.toThrow('Cannot change status of an already REJECTED appointment.');
    });

    it('should refund wallet balance exactly once when a paid booking is cancelled or rejected', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-paid-1',
        status: 'CONFIRMED',
        totalCost: 1500,
        notes: 'Payment: WALLET_PAID',
        userId: 'u-1',
      });
      prisma.walletTransaction.findUnique.mockResolvedValue(null);
      prisma.booking.update.mockResolvedValue({
        id: 'b-paid-1',
        status: 'CANCELLED',
        totalCost: 1500,
        notes: 'Payment: WALLET_PAID | Status update (CANCELLED): User asked cancellation',
        user: { id: 'u-1', name: 'Rohan', email: 'rohan@example.com' },
        astrologer: null,
      });

      await service.updateBookingStatus(mockAdmin, 'b-paid-1', {
        status: 'CANCELLED',
        notes: 'User asked cancellation',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: { walletBalance: { increment: 1500 } },
        select: { walletBalance: true },
      });
      expect(prisma.walletTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'u-1',
            type: 'CREDIT',
            amount: 1500,
            reference: 'REFUND_BOOKING_b-paid-1',
          }),
        }),
      );
    });

    it('should not duplicate refund if refund transaction reference already exists', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-paid-2',
        status: 'CONFIRMED',
        totalCost: 1500,
        notes: 'Payment: WALLET_PAID',
        userId: 'u-1',
      });
      prisma.walletTransaction.findUnique.mockResolvedValue({
        id: 'tx-already-refunded',
        reference: 'REFUND_BOOKING_b-paid-2',
      });
      prisma.booking.update.mockResolvedValue({
        id: 'b-paid-2',
        status: 'CANCELLED',
        totalCost: 1500,
        notes: 'Payment: WALLET_PAID',
        user: { id: 'u-1' },
        astrologer: null,
      });

      await service.updateBookingStatus(mockAdmin, 'b-paid-2', { status: 'CANCELLED' });

      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.walletTransaction.create).not.toHaveBeenCalled();
    });

    it('should not refund an unpaid PENDING_PAYMENT booking on rejection', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-unpaid',
        status: 'PENDING_PAYMENT',
        totalCost: 1500,
        notes: 'Pending gateway confirmation',
        userId: 'u-1',
      });
      prisma.booking.update.mockResolvedValue({
        id: 'b-unpaid',
        status: 'REJECTED',
        totalCost: 1500,
        notes: 'Rejected due to invalid birth details',
        user: { id: 'u-1' },
        astrologer: null,
      });

      await service.updateBookingStatus(mockAdmin, 'b-unpaid', {
        status: 'REJECTED',
        notes: 'Rejected due to invalid birth details',
      });

      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.walletTransaction.create).not.toHaveBeenCalled();
    });
  });

  describe('Reschedule Consultation Safe Guarding', () => {
    it('should successfully reschedule an active booking to an available slot', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-resched-1',
        status: 'CONFIRMED',
        scheduledDate: '2026-11-10',
        scheduledTime: '10:00 AM',
        notes: 'Original consultation notes',
        userId: 'u-1',
      });
      prisma.blockedDate.findUnique.mockResolvedValue(null);
      prisma.booking.findFirst.mockResolvedValue(null); // No collision
      prisma.booking.update.mockResolvedValue({
        id: 'b-resched-1',
        status: 'CONFIRMED',
        scheduledDate: '2026-11-12',
        scheduledTime: '02:00 PM',
        notes: 'Original consultation notes | Rescheduled from 2026-11-10 10:00 AM to 2026-11-12 02:00 PM (Reason: Panditji travel)',
        user: { id: 'u-1', name: 'Rohan' },
        astrologer: null,
      });

      const res = await service.rescheduleAdminBooking(mockAdmin, 'b-resched-1', {
        scheduledDate: '2026-11-12',
        scheduledTime: '02:00 PM',
        reason: 'Panditji travel',
      });

      expect(res.booking.scheduledDate).toBe('2026-11-12');
      expect(res.booking.scheduledTime).toBe('02:00 PM');
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'BOOKING_RESCHEDULED',
            targetId: 'b-resched-1',
          }),
        }),
      );
    });

    it('should reject rescheduling if target date is marked as blocked', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-resched-2',
        status: 'CONFIRMED',
        scheduledDate: '2026-11-10',
        scheduledTime: '10:00 AM',
      });
      prisma.blockedDate.findUnique.mockResolvedValue({
        date: '2026-11-12',
        reason: 'Ekadashi Temple Puja Sanctuary Closed',
      });

      await expect(
        service.rescheduleAdminBooking(mockAdmin, 'b-resched-2', {
          scheduledDate: '2026-11-12',
          scheduledTime: '02:00 PM',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should prevent collision if target date and time slot is already booked by another customer', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-resched-3',
        status: 'CONFIRMED',
        scheduledDate: '2026-11-10',
        scheduledTime: '10:00 AM',
      });
      prisma.blockedDate.findUnique.mockResolvedValue(null);
      prisma.booking.findFirst.mockResolvedValue({
        id: 'b-collision-victim',
        scheduledDate: '2026-11-12',
        scheduledTime: '02:00 PM',
        status: 'CONFIRMED',
      });

      await expect(
        service.rescheduleAdminBooking(mockAdmin, 'b-resched-3', {
          scheduledDate: '2026-11-12',
          scheduledTime: '02:00 PM',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Consultation Room Meeting URL', () => {
    it('should update consultation meeting link cleanly in booking notes', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-meet-1',
        status: 'CONFIRMED',
        notes: 'Customer asked Hindi consultation',
      });
      prisma.booking.update.mockResolvedValue({
        id: 'b-meet-1',
        status: 'CONFIRMED',
        notes: 'MeetLink: https://meet.google.com/zrg-vfdz-jky | Customer asked Hindi consultation',
        user: { id: 'u-1', name: 'Rohan' },
        astrologer: null,
      });

      const res = await service.updateAdminMeetLink(mockAdmin, 'b-meet-1', {
        meetLink: 'https://meet.google.com/zrg-vfdz-jky',
      });

      expect(res.booking.meetLink).toBe('https://meet.google.com/zrg-vfdz-jky');
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'BOOKING_MEET_LINK_UPDATED',
            targetId: 'b-meet-1',
          }),
        }),
      );
    });

    it('should reject assigning meeting link to cancelled booking', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-meet-cancelled',
        status: 'CANCELLED',
      });

      await expect(
        service.updateAdminMeetLink(mockAdmin, 'b-meet-cancelled', {
          meetLink: 'https://meet.google.com/zrg-vfdz-jky',
        }),
      ).rejects.toThrow('Cannot assign a meeting link to a CANCELLED booking.');
    });
  });

  describe('Manual / Offline Payment Verification Workflow', () => {
    it('should verify payment with authentic reference proof and transition PENDING_PAYMENT to CONFIRMED', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-verify-1',
        status: 'PENDING_PAYMENT',
        totalCost: 2100,
        notes: 'Booking awaiting UPI transfer proof',
      });
      prisma.booking.update.mockResolvedValue({
        id: 'b-verify-1',
        status: 'CONFIRMED',
        totalCost: 2100,
        notes: 'Booking awaiting UPI transfer proof | Payment Verified: VERIFIED_MANUAL (Ref: UPI_REF_981240192, Method: UPI, VerifiedBy: admin@astrovd.com) - WhatsApp screenshot confirmed with accounts',
        user: { id: 'u-1', name: 'Rohan' },
        astrologer: null,
      });

      const res = await service.verifyBookingPayment(mockAdmin, 'b-verify-1', {
        transactionReference: 'UPI_REF_981240192',
        paymentMethod: 'UPI',
        verificationNotes: 'WhatsApp screenshot confirmed with accounts',
      });

      expect(res.booking.status).toBe('CONFIRMED');
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'BOOKING_PAYMENT_VERIFIED',
            targetId: 'b-verify-1',
            details: expect.objectContaining({
              transactionReference: 'UPI_REF_981240192',
              paymentMethod: 'UPI',
            }),
          }),
        }),
      );
    });

    it('should reject verifying payment if booking is already CONFIRMED', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'b-verify-already',
        status: 'CONFIRMED',
      });

      await expect(
        service.verifyBookingPayment(mockAdmin, 'b-verify-already', {
          transactionReference: 'UPI_REF_981240192',
          paymentMethod: 'UPI',
        }),
      ).rejects.toThrow('Cannot verify payment for booking in "CONFIRMED" status.');
    });
  });
});
