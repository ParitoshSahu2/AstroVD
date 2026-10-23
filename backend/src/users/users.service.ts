import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { WalletTransactionsQueryDto } from './dto/wallet-transactions-query.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Retrieves authenticated user's profile while strictly omitting password hashes.
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        role: true,
        status: true,
        dateOfBirth: true,
        timeOfBirth: true,
        placeOfBirth: true,
        zodiacSign: true,
        walletBalance: true,
        savedKundlis: true,
        savedReadings: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    return user;
  }

  /**
   * Updates only explicitly permitted profile fields for the authenticated user.
   * Disallows modifications to role, status, email, or wallet balance.
   */
  async updateMe(userId: string, dto: UpdateProfileDto, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    const data: Record<string, any> = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }
    if (dto.dateOfBirth !== undefined) {
      data.dateOfBirth = dto.dateOfBirth?.trim() || null;
    }
    if (dto.timeOfBirth !== undefined) {
      data.timeOfBirth = dto.timeOfBirth?.trim() || null;
    }
    if (dto.placeOfBirth !== undefined) {
      data.placeOfBirth = dto.placeOfBirth?.trim() || null;
    }
    if (dto.zodiacSign !== undefined) {
      data.zodiacSign = dto.zodiacSign?.trim() || 'Aries';
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        role: true,
        status: true,
        dateOfBirth: true,
        timeOfBirth: true,
        placeOfBirth: true,
        zodiacSign: true,
        walletBalance: true,
        savedKundlis: true,
        savedReadings: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Record audit log for profile update
    await this.auditService.recordLog({
      action: 'PROFILE_UPDATED',
      actorId: user.id,
      actorEmail: user.email,
      targetId: user.id,
      targetEmail: user.email,
      details: { updatedFields: Object.keys(data) },
      ipAddress,
    });

    return {
      message: 'Profile updated successfully.',
      user: updatedUser,
    };
  }

  /**
   * Retrieves authenticated user's current wallet balance and currency metadata.
   */
  async getWallet(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        walletBalance: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    return {
      walletBalance: user.walletBalance,
      currency: 'INR',
      currencySymbol: '₹',
    };
  }

  /**
   * Retrieves authenticated user's paginated wallet transaction history.
   * Guarantees strict user isolation by querying only against authenticated userId.
   */
  async getTransactions(userId: string, query: WalletTransactionsQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.walletTransaction.count({
        where: { userId },
      }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Securely changes the authenticated user's password.
   * Verifies currentPassword using bcrypt, enforces password policies (min 12 chars, distinct from old password),
   * updates passwordHash and increments tokenVersion atomically in PostgreSQL,
   * immediately invalidating all previous access tokens across all devices.
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    ipAddress?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        status: true,
        tokenVersion: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException('Suspended accounts cannot change passwords.');
    }

    // Verify current password with constant-time bcrypt compare
    const isCurrentValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentValid) {
      throw new BadRequestException('Current password is incorrect.');
    }

    // Reject new password identical to current password
    const isSamePassword = await bcrypt.compare(
      dto.newPassword,
      user.passwordHash,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'New password cannot be identical to current password.',
      );
    }

    // Hash new password using bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(dto.newPassword, salt);

    // Atomically persist new password and increment tokenVersion
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        tokenVersion: {
          increment: 1,
        },
      },
      select: {
        id: true,
        email: true,
        tokenVersion: true,
      },
    });

    // Record immutable audit log (never storing passwords or hashes)
    await this.auditService.recordLog({
      action: 'USER_PASSWORD_CHANGED',
      actorId: user.id,
      actorEmail: user.email,
      targetId: user.id,
      targetEmail: user.email,
      details: {
        sessionInvalidation: 'ALL_DEVICES',
        newTokenVersion: updatedUser.tokenVersion,
      },
      ipAddress,
    });

    return {
      message:
        'Password changed successfully. All active sessions have been invalidated across all devices. Please log in again with your new password.',
    };
  }
}
