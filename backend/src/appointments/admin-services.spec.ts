import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { AppointmentsService } from './appointments.service.js';
import { AdminServicesController } from './admin-services.controller.js';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Role, AccountStatus } from '../auth/roles.enum.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';

describe('Admin Services Management & Dynamic Persistence (Phase 2, Step 1)', () => {
  let service: AppointmentsService;
  let adminController: AdminServicesController;
  let prisma: any;
  let emailService: any;

  const testServicesFilePath = path.resolve(process.cwd(), 'data', 'services.json');

  const mockAdmin: JwtPayload = {
    sub: 'admin-uuid-1',
    email: 'admin@astrovd.com',
    role: Role.ADMIN,
    status: AccountStatus.ACTIVE,
    tokenVersion: 1,
  };

  const mockSuperadmin: JwtPayload = {
    sub: 'superadmin-uuid-1',
    email: 'superadmin@astrovd.com',
    role: Role.SUPERADMIN,
    status: AccountStatus.ACTIVE,
    tokenVersion: 1,
  };

  beforeEach(() => {
    // Clean test services data file if it exists
    if (fs.existsSync(testServicesFilePath)) {
      try {
        fs.unlinkSync(testServicesFilePath);
      } catch {}
    }

    prisma = {
      booking: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-log-uuid' }),
      },
      appointmentSlot: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      blockedDate: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };

    emailService = {
      sendAppointmentConfirmation: vi.fn().mockResolvedValue(true),
    };

    service = new AppointmentsService(prisma as any, emailService as any);
    adminController = new AdminServicesController(service);
  });

  afterEach(() => {
    if (fs.existsSync(testServicesFilePath)) {
      try {
        fs.unlinkSync(testServicesFilePath);
      } catch {}
    }
  });

  describe('1. Canonical Preservation & Initial Seeding', () => {
    it('preserves all canonical services on initialization', () => {
      const publicServices = service.getServices();
      expect(publicServices.length).toBeGreaterThanOrEqual(28);

      const babyGirl = service.getServiceById('free_birth_chart_baby_girl');
      expect(babyGirl).toBeDefined();
      expect(babyGirl.title).toContain('FREE BIRTH CHART FOR BABY GIRL');
      expect(babyGirl.priceNumber).toBe(0);
      expect(babyGirl.isActive).toBe(true);

      const general = service.getServiceById('general_consultation');
      expect(general).toBeDefined();
      expect(general.priceNumber).toBe(2100);
      expect(general.isActive).toBe(true);
    });

    it('persists dynamic services to disk (services.json)', () => {
      expect(fs.existsSync(testServicesFilePath)).toBe(true);
      const raw = fs.readFileSync(testServicesFilePath, 'utf-8');
      const parsed = JSON.parse(raw);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThanOrEqual(28);
      expect(parsed[0].isActive).toBe(true);
    });
  });

  describe('2. Admin Listing, Search & Category Filters', () => {
    it('returns all services for admin listing with total count', () => {
      const res = service.listAdminServices();
      expect(res.totalCount).toBeGreaterThanOrEqual(28);
      expect(res.services.length).toBe(res.totalCount);
    });

    it('filters services by categoryKey', () => {
      const astroRes = service.listAdminServices({ category: 'astrology' });
      expect(astroRes.services.every((s) => s.categoryKey === 'astrology')).toBe(true);
      expect(astroRes.services.length).toBeGreaterThan(0);

      const poojaRes = service.listAdminServices({ category: 'pooja' });
      expect(poojaRes.services.every((s) => s.categoryKey === 'pooja')).toBe(true);
      expect(poojaRes.services.length).toBeGreaterThan(0);
    });

    it('filters services by search query matching title or pandit', () => {
      const res = service.listAdminServices({ search: 'Kundli' });
      expect(res.services.length).toBeGreaterThan(0);
      expect(
        res.services.every(
          (s) =>
            s.id.toLowerCase().includes('kundli') ||
            s.title.toLowerCase().includes('kundli') ||
            s.desc.toLowerCase().includes('kundli') ||
            s.pandit.toLowerCase().includes('kundli') ||
            s.categoryTag.toLowerCase().includes('kundli'),
        ),
      ).toBe(true);
    });
  });

  describe('3. Service Creation with Validation & Slug Generation', () => {
    it('creates a new custom service and writes audit log', async () => {
      const created = await service.createAdminService(
        mockAdmin,
        {
          title: 'Special Maha Mrityunjaya Jaap',
          categoryKey: 'pooja',
          categoryTag: 'VITALITY RITUAL',
          pandit: 'Dr. Pandit Vishal Dubey',
          desc: 'Sacred chanting and havan for health and longevity.',
          priceNumber: 5100,
          durationMinutes: 60,
        },
        '127.0.0.1',
      );

      expect(created.id).toBe('special_maha_mrityunjaya_jaap');
      expect(created.price).toBe('₹5,100');
      expect(created.isActive).toBe(true);

      // Verify audit log
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'SERVICE_CREATED',
          actorId: mockAdmin.sub,
          targetId: 'special_maha_mrityunjaya_jaap',
        }),
      });

      // Verify it appears in catalogue and disk
      const fetched = service.getServiceById('special_maha_mrityunjaya_jaap');
      expect(fetched.title).toBe('Special Maha Mrityunjaya Jaap');
    });

    it('rejects duplicate service slug/ID with ConflictException', async () => {
      await expect(
        service.createAdminService(mockAdmin, {
          id: 'general_consultation', // Already exists in canonical 29
          title: 'Duplicate General Consultation',
          categoryKey: 'astrology',
          pandit: 'Panditji',
          desc: 'Description',
          priceNumber: 2100,
          durationMinutes: 30,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('4. Service Update & Status Toggling', () => {
    it('updates service title, price, and duration with audit log', async () => {
      const updated = await service.updateAdminService(
        mockSuperadmin,
        'astrological_consultation',
        {
          priceNumber: 2700,
          durationMinutes: 45,
          badge: 'High Demand',
        },
        '10.0.0.1',
      );

      expect(updated.priceNumber).toBe(2700);
      expect(updated.price).toBe('₹2,700');
      expect(updated.durationMinutes).toBe(45);
      expect(updated.badge).toBe('High Demand');

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'SERVICE_UPDATED',
          actorId: mockSuperadmin.sub,
          targetId: 'astrological_consultation',
        }),
      });
    });

    it('throws NotFoundException when updating non-existent service', async () => {
      await expect(
        service.updateAdminService(mockAdmin, 'non_existent_service_xyz', {
          title: 'New Title',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('activates and deactivates a service', async () => {
      // Deactivate
      const deactivated = await service.toggleServiceStatus(
        mockAdmin,
        'marriage_match_making',
        false,
        '127.0.0.1',
      );
      expect(deactivated.isActive).toBe(false);

      // Verify public service listing excludes it
      const publicServices = service.getServices();
      expect(publicServices.some((s) => s.id === 'marriage_match_making')).toBe(false);

      // Verify public getServiceById throws NotFoundException
      expect(() => service.getServiceById('marriage_match_making')).toThrow(NotFoundException);

      // But internal lookup with allowInactive=true succeeds (for historical bookings)
      const historicalLookup = service.getServiceById('marriage_match_making', true);
      expect(historicalLookup.id).toBe('marriage_match_making');

      // Admin list includes it when filtering for INACTIVE or ALL
      const adminInactive = service.listAdminServices({ status: 'INACTIVE' });
      expect(adminInactive.services.some((s) => s.id === 'marriage_match_making')).toBe(true);

      // Reactivate
      const reactivated = await service.toggleServiceStatus(
        mockAdmin,
        'marriage_match_making',
        true,
        '127.0.0.1',
      );
      expect(reactivated.isActive).toBe(true);
      expect(service.getServices().some((s) => s.id === 'marriage_match_making')).toBe(true);
    });
  });

  describe('5. Service Deletion Guard (Data Integrity)', () => {
    it('blocks deletion when historical bookings reference the service', async () => {
      prisma.booking.count.mockResolvedValue(3); // 3 historical bookings exist

      await expect(
        service.deleteAdminService(mockAdmin, 'astrological_consultation'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.deleteAdminService(mockAdmin, 'astrological_consultation'),
      ).rejects.toThrow(/historical consultation booking\(s\) reference it.*deactivate/);

      // Verify the service was NOT deleted
      expect(service.getServiceById('astrological_consultation')).toBeDefined();
    });

    it('allows deleting an unbooked service and writes audit log', async () => {
      // Create a test service with no bookings
      await service.createAdminService(mockAdmin, {
        id: 'temporary_puja',
        title: 'Temporary Trial Puja',
        categoryKey: 'pooja',
        pandit: 'Panditji',
        desc: 'One-off ritual',
        priceNumber: 1100,
        durationMinutes: 30,
      });

      prisma.booking.count.mockResolvedValueOnce(0); // 0 bookings

      const res = await service.deleteAdminService(mockAdmin, 'temporary_puja', '127.0.0.1');
      expect(res.success).toBe(true);
      expect(res.deletedId).toBe('temporary_puja');

      // Verify it is gone from catalogue
      expect(() => service.getServiceById('temporary_puja', true)).toThrow(NotFoundException);

      // Verify audit log
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'SERVICE_DELETED',
          targetId: 'temporary_puja',
        }),
      });
    });
  });

  describe('6. AdminServicesController Endpoints', () => {
    it('delegates listServices to service', () => {
      const res = adminController.listServices({ status: 'ACTIVE' });
      expect(res.services).toBeDefined();
    });

    it('delegates getServiceDetail with allowInactive=true', () => {
      const res = adminController.getServiceDetail('general_consultation');
      expect(res.id).toBe('general_consultation');
    });

    it('delegates createService, updateService, toggleStatus, and deleteService', async () => {
      const mockReq: any = { ip: '127.0.0.1' };

      const created = await adminController.createService(
        mockAdmin,
        {
          id: 'test_ctrl_service',
          title: 'Controller Test Service',
          categoryKey: 'education',
          pandit: 'Teacher',
          desc: 'Lesson',
          priceNumber: 500,
          durationMinutes: 30,
        },
        mockReq,
      );
      expect(created.id).toBe('test_ctrl_service');

      const updated = await adminController.updateService(
        mockAdmin,
        'test_ctrl_service',
        { title: 'Updated Controller Service' },
        mockReq,
      );
      expect(updated.title).toBe('Updated Controller Service');

      const toggled = await adminController.toggleStatus(
        mockAdmin,
        'test_ctrl_service',
        { isActive: false },
        mockReq,
      );
      expect(toggled.isActive).toBe(false);

      prisma.booking.count.mockResolvedValueOnce(0);
      const del = await adminController.deleteService(mockAdmin, 'test_ctrl_service', mockReq);
      expect(del.success).toBe(true);
    });
  });
});
