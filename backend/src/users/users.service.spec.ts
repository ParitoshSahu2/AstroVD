import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service.js';

describe('UsersService: User Profile with Phone & Verification Flags (Stage 5)', () => {
  let usersService: UsersService;
  let mockPrismaService: any;
  let mockAuditService: any;

  beforeEach(() => {
    mockPrismaService = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      walletTransaction: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };

    mockAuditService = {
      recordLog: vi.fn().mockResolvedValue(true),
    };

    usersService = new UsersService(mockPrismaService, mockAuditService);
  });

  it('TEST-01: getMe includes phone, emailVerified, and phoneVerified in select projection', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: 'user-phone-only',
      name: 'Rohan Sharma',
      email: null,
      phone: '+919876543210',
      emailVerified: false,
      phoneVerified: true,
      role: 'USER',
      status: 'ACTIVE',
      walletBalance: 150.0,
      savedKundlis: [],
      savedReadings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const profile = await usersService.getMe('user-phone-only');

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-phone-only' },
      select: expect.objectContaining({
        phone: true,
        emailVerified: true,
        phoneVerified: true,
      }),
    });

    expect(profile.phone).toBe('+919876543210');
    expect(profile.phoneVerified).toBe(true);
    expect(profile.email).toBeNull();
    expect((profile as any).passwordHash).toBeUndefined();
  });

  it('TEST-02: updateMe preserves phone and returns updated profile with phone and verification flags', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Old Name',
      email: 'user@example.com',
      phone: '+919876543210',
    });

    mockPrismaService.user.update.mockResolvedValue({
      id: 'user-1',
      name: 'New Name',
      email: 'user@example.com',
      phone: '+919876543210',
      emailVerified: true,
      phoneVerified: true,
      role: 'USER',
      status: 'ACTIVE',
      dateOfBirth: '1995-10-10',
      timeOfBirth: null,
      placeOfBirth: null,
      zodiacSign: 'Libra',
      walletBalance: 150.0,
      savedKundlis: [],
      savedReadings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await usersService.updateMe('user-1', {
      name: 'New Name',
      dateOfBirth: '1995-10-10',
    });

    expect(mockPrismaService.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          phone: true,
          emailVerified: true,
          phoneVerified: true,
        }),
      }),
    );

    expect(res.user.name).toBe('New Name');
    expect(res.user.phone).toBe('+919876543210');
    expect(res.user.emailVerified).toBe(true);
    expect(res.user.phoneVerified).toBe(true);
  });
});
