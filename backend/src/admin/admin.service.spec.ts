import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { Role, AccountStatus } from '../auth/roles.enum.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';

describe('AdminService: Administrative Account Integrity & Phone Search (Stage 5)', () => {
  let adminService: AdminService;
  let mockPrismaService: any;
  let mockAuditService: any;

  const adminActor: JwtPayload = {
    sub: 'admin-1',
    email: 'vishal.dubey@astrovd.com',
    role: Role.ADMIN,
    status: AccountStatus.ACTIVE,
    tokenVersion: 0,
  };

  const superadminActor: JwtPayload = {
    sub: 'superadmin-1',
    email: 'yash@astrovd.com',
    role: Role.SUPERADMIN,
    status: AccountStatus.ACTIVE,
    tokenVersion: 0,
  };

  beforeEach(() => {
    mockPrismaService = {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      walletTransaction: {
        create: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb: any) => {
        return await cb(mockPrismaService);
      }),
    };

    mockAuditService = {
      recordLog: vi.fn().mockResolvedValue(true),
      getLogs: vi.fn().mockResolvedValue({ logs: [], total: 0 }),
    };

    adminService = new AdminService(mockPrismaService, mockAuditService);
  });

  // TEST 1: Standard Admin cannot create another Admin
  it('TEST-01: standard administrator cannot generate an ADMIN account', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(
      adminService.createUserProfile(adminActor, {
        name: 'New Admin',
        email: 'newadmin@astrovd.com',
        role: Role.ADMIN,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  // TEST 2: Neither Admin nor Superadmin can create a Superadmin via createUserProfile
  it('TEST-02: cannot generate a SUPERADMIN account via routine createUserProfile', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(
      adminService.createUserProfile(superadminActor, {
        name: 'New Superadmin',
        email: 'newsuper@astrovd.com',
        role: Role.SUPERADMIN,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // TEST 3: Standard Admin cannot grant wallet balance exceeding ₹500
  it('TEST-03: standard administrator cannot grant starting balance exceeding ₹500', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(
      adminService.createUserProfile(adminActor, {
        name: 'Rich Seeker',
        email: 'rich@example.com',
        walletBalance: 750.0,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // TEST 4: Superadmin can grant starting balance > ₹500 and create ADMIN
  it('TEST-04: superadministrator can create an ADMIN with starting balance exceeding ₹500', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockPrismaService.user.create.mockImplementation((args: any) => ({
      id: 'created-admin-id',
      ...args.data,
      createdAt: new Date(),
    }));

    const res = await adminService.createUserProfile(superadminActor, {
      name: 'Secondary Admin',
      email: 'secadmin@astrovd.com',
      role: Role.ADMIN,
      walletBalance: 1000.0,
    });

    expect(res.user.role).toBe(Role.ADMIN);
    expect(res.user.walletBalance).toBe(1000.0);
    expect(res.user.emailVerified).toBe(true);
    expect(res.user.welcomeBonusClaimed).toBe(true);

    expect(mockPrismaService.walletTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'created-admin-id',
        type: 'CREDIT',
        amount: 1000.0,
        description: 'Admin Initial Provisioning Credits',
        balanceAfter: 1000.0,
      }),
    });
  });

  // TEST 5: Default starting balance is 0.0 when omitted (does not automatically grant ₹150)
  it('TEST-05: omitting walletBalance defaults starting balance to 0.0 without ledger credit', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockPrismaService.user.create.mockImplementation((args: any) => ({
      id: 'zero-balance-user',
      ...args.data,
      createdAt: new Date(),
    }));

    const res = await adminService.createUserProfile(adminActor, {
      name: 'Zero Balance Seeker',
      email: 'zero@example.com',
    });

    expect(res.user.walletBalance).toBe(0.0);
    expect(res.user.emailVerified).toBe(true);
    expect(res.user.welcomeBonusClaimed).toBe(true);
    // Ledger transaction must NOT be created for 0 balance
    expect(mockPrismaService.walletTransaction.create).not.toHaveBeenCalled();
  });

  // TEST 6: welcomeBonusEligible flag allows 0-balance user to claim welcome bonus later
  it('TEST-06: welcomeBonusEligible: true leaves account unverified and eligible for OTP welcome bonus', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockPrismaService.user.create.mockImplementation((args: any) => ({
      id: 'bonus-eligible-user',
      ...args.data,
      createdAt: new Date(),
    }));

    const res = await adminService.createUserProfile(adminActor, {
      name: 'Eligible Seeker',
      email: 'eligible@example.com',
      walletBalance: 0.0,
      welcomeBonusEligible: true,
    });

    expect(res.user.walletBalance).toBe(0.0);
    expect(res.user.welcomeBonusClaimed).toBe(false);
    expect(res.user.emailVerified).toBe(false); // Must verify to claim bonus
  });

  // TEST 7: Admin-created user with phone validates E.164 and checks uniqueness
  it('TEST-07: rejects malformed phone number when creating user profile', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(
      adminService.createUserProfile(adminActor, {
        name: 'Bad Phone Seeker',
        email: 'badphone@example.com',
        phone: '12345',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // TEST 8: Admin-created user with valid phone normalizes and creates record
  it('TEST-08: normalizes valid phone and includes in created user profile', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockPrismaService.user.create.mockImplementation((args: any) => ({
      id: 'phone-seeker-id',
      ...args.data,
      createdAt: new Date(),
    }));

    const res = await adminService.createUserProfile(adminActor, {
      name: 'Phone Seeker',
      email: 'phoneseeker@example.com',
      phone: '9876543210',
    });

    expect(res.user.phone).toBe('+919876543210');
    expect(res.user.phoneVerified).toBe(true);
    expect(res.user.emailVerified).toBe(true);
  });

  // TEST 9: listUsers includes phone, emailVerified, and phoneVerified and supports phone search
  it('TEST-09: listUsers supports searching by phone and includes phone in projection', async () => {
    mockPrismaService.user.findMany.mockResolvedValue([
      {
        id: 'u-1',
        name: 'Rohan Sharma',
        email: null,
        phone: '+919876543210',
        emailVerified: false,
        phoneVerified: true,
        role: 'USER',
        status: 'ACTIVE',
        walletBalance: 150.0,
      },
    ]);
    mockPrismaService.user.count.mockResolvedValue(1);

    const res = await adminService.listUsers({ search: '9876543210' });

    expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { phone: { contains: '9876543210', mode: 'insensitive' } },
          ]),
        }),
        select: expect.objectContaining({
          phone: true,
          emailVerified: true,
          phoneVerified: true,
        }),
      }),
    );

    expect(res.users[0].phone).toBe('+919876543210');
    expect(res.users[0].phoneVerified).toBe(true);
  });

  // TEST 10: welcomeBonusEligible flag is ignored when starting balance > 0 (prevents duplicate bonus)
  it('TEST-10: welcomeBonusEligible is ignored if starting balance > 0, marking bonus claimed', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockPrismaService.user.create.mockImplementation((args: any) => ({
      id: 'funded-seeker-id',
      ...args.data,
      createdAt: new Date(),
    }));

    const res = await adminService.createUserProfile(adminActor, {
      name: 'Funded Seeker',
      email: 'funded@example.com',
      walletBalance: 200.0,
      welcomeBonusEligible: true, // Should NOT allow future bonus
    });

    expect(res.user.walletBalance).toBe(200.0);
    expect(res.user.welcomeBonusClaimed).toBe(true);
  });

  // TEST 11: Phone search with leading zero (e.g. 09876543210) strips 0 to match DB
  it('TEST-11: listUsers search with leading zero normalizes to match standard phone', async () => {
    mockPrismaService.user.findMany.mockResolvedValue([]);
    mockPrismaService.user.count.mockResolvedValue(0);

    await adminService.listUsers({ search: '09876543210' });

    expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { phone: { contains: '9876543210', mode: 'insensitive' } },
            { phone: { contains: '+919876543210', mode: 'insensitive' } },
          ]),
        }),
      }),
    );
  });

  // TEST 12: Phone search with spaces and hyphens matches cleaned digits
  it('TEST-12: listUsers search with formatted phone (+91 98765-43210) cleans input', async () => {
    mockPrismaService.user.findMany.mockResolvedValue([]);
    mockPrismaService.user.count.mockResolvedValue(0);

    await adminService.listUsers({ search: '+91 98765-43210' });

    expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { phone: { contains: '+919876543210', mode: 'insensitive' } },
          ]),
        }),
      }),
    );
  });
});
