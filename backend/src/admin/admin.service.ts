import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { Role, AccountStatus } from '../auth/roles.enum.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';
import { ListUsersQueryDto } from './dto/list-users-query.dto.js';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto.js';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto.js';
import { CreateUserProfileDto } from './dto/create-user-profile.dto.js';
import { normalizePhoneNumber, isValidE164 } from '../auth/phone.util.js';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Retrieves a paginated list of users with optional search and filters.
   * Excludes password hashes from responses.
   */
  async listUsers(query: ListUsersQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      const searchConditions: any[] = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ];

      // If search query looks like a phone number (contains digits), normalize and add variants
      const cleanedDigits = term.replace(/[\s\-\(\)\.]/g, '');
      if (cleanedDigits && /\d/.test(cleanedDigits)) {
        if (cleanedDigits !== term) {
          searchConditions.push({ phone: { contains: cleanedDigits, mode: 'insensitive' } });
        }
        if (/^0\d{10}$/.test(cleanedDigits)) {
          searchConditions.push({ phone: { contains: cleanedDigits.slice(1), mode: 'insensitive' } });
        }
        const normalized = normalizePhoneNumber(cleanedDigits);
        if (normalized && normalized !== term && normalized !== cleanedDigits) {
          searchConditions.push({ phone: { contains: normalized, mode: 'insensitive' } });
        }
      }

      where.OR = searchConditions;
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          emailVerified: true,
          phoneVerified: true,
          role: true,
          status: true,
          walletBalance: true,
          zodiacSign: true,
          dateOfBirth: true,
          placeOfBirth: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              bookings: true,
              orders: true,
              transactions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const roleCounts = {
      USER: 0,
      ADMIN: 0,
      SUPERADMIN: 0,
      TOTAL: total,
    };

    if (typeof this.prisma.user.groupBy === 'function') {
      try {
        const [roleStats, totalAllUsers] = await Promise.all([
          this.prisma.user.groupBy({
            by: ['role'],
            _count: { id: true },
          }),
          this.prisma.user.count(),
        ]);
        roleCounts.TOTAL = totalAllUsers;
        for (const g of roleStats) {
          if (g.role && g.role in roleCounts) {
            roleCounts[g.role as 'USER' | 'ADMIN' | 'SUPERADMIN'] = g._count.id;
          }
        }
      } catch {
        // Fallback gracefully to total
      }
    }

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      roleCounts,
    };
  }

  /**
   * Retrieves complete details of a specific user.
   */
  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        bookings: {
          orderBy: { createdAt: 'desc' },
          include: {
            astrologer: true,
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        auditLogsTriggered: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        auditLogsReceived: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            bookings: true,
            orders: true,
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found.`);
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Suspends or reactivates a user account.
   * Prevents self-suspension, demotion of the last superadmin, and unauthorized admin actions.
   */
  async updateUserStatus(
    actor: JwtPayload,
    targetId: string,
    status: AccountStatus,
    ipAddress?: string,
  ) {
    // 1. Prevent self-suspension
    if (actor.sub === targetId) {
      throw new BadRequestException('You cannot suspend or modify the status of your own account.');
    }

    // 2. Locate target user
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
    });

    if (!target) {
      throw new NotFoundException(`Target user with ID '${targetId}' not found.`);
    }

    // 3. Permission checks
    if (target.role === Role.SUPERADMIN) {
      if (actor.role !== Role.SUPERADMIN) {
        throw new ForbiddenException('Only a Superadmin can modify another Superadmin account.');
      }

      // Check if target is the last active Superadmin
      if (status === AccountStatus.SUSPENDED) {
        const activeSuperadmins = await this.prisma.user.count({
          where: { role: Role.SUPERADMIN, status: AccountStatus.ACTIVE },
        });

        if (activeSuperadmins <= 1) {
          throw new BadRequestException('Cannot suspend the last active Superadmin in the system.');
        }
      }
    }

    if (target.role === Role.ADMIN && actor.role === Role.ADMIN) {
      throw new ForbiddenException(
        'Administrators cannot suspend other administrators. Only a Superadmin can perform this action.',
      );
    }

    // 4. Update status in database
    const updatedUser = await this.prisma.user.update({
      where: { id: targetId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // 5. Record immutable audit log
    const action =
      status === AccountStatus.SUSPENDED ? 'USER_SUSPENDED' : 'USER_REACTIVATED';

    await this.auditService.recordLog({
      action,
      actorId: actor.sub,
      actorEmail: actor.email,
      targetId: target.id,
      targetEmail: target.email,
      details: {
        previousStatus: target.status,
        newStatus: status,
      },
      ipAddress,
    });

    return {
      message: `User account status successfully updated to ${status}.`,
      user: updatedUser,
    };
  }

  /**
   * Permanently deletes a user account.
   * - ADMIN can only delete standard USER accounts.
   * - SUPERADMIN can delete USER or ADMIN accounts.
   * - No one can delete a SUPERADMIN directly.
   * - Users cannot delete their own accounts via this endpoint.
   */
  async deleteUser(
    actor: JwtPayload,
    targetId: string,
    ipAddress?: string,
  ) {
    if (actor.sub === targetId) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
    });

    if (!target) {
      throw new NotFoundException(`Target user with ID '${targetId}' not found.`);
    }

    if (target.role === Role.SUPERADMIN) {
      throw new BadRequestException('SUPERADMIN accounts cannot be deleted directly.');
    }

    if (actor.role === Role.ADMIN && target.role !== Role.USER) {
      throw new ForbiddenException(
        'Administrators can only delete standard USER accounts. Deleting administrative accounts requires SUPERADMIN authority.',
      );
    }

    // Execute atomic audit log & deletion in transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          action: 'USER_DELETED',
          actorId: actor.sub,
          actorEmail: actor.email,
          targetEmail: target.email,
          details: {
            deletedUserId: target.id,
            deletedUserName: target.name,
            deletedUserEmail: target.email,
            deletedUserRole: target.role,
            deletedUserStatus: target.status,
          },
          ipAddress,
        },
      });

      await tx.user.delete({
        where: { id: targetId },
      });
    });

    this.logger.log(
      `🗑️ Account '${target.email}' (${target.role}) permanently deleted by ${actor.email}.`,
    );

    return {
      message: `Account for ${target.name} (${target.email}) has been permanently deleted.`,
      deletedUser: {
        id: target.id,
        name: target.name,
        email: target.email,
        role: target.role,
      },
    };
  }

  /**
   * Promotes or changes a user's role.
   * Strictly enforces:
   * - ADMIN cannot promote or create another ADMIN.
   * - ADMIN cannot promote themselves.
   * - Only SUPERADMIN can manage administrator roles.
   * - Cannot demote the last active SUPERADMIN.
   * - Users cannot modify their own roles.
   */
  async updateUserRole(
    actor: JwtPayload,
    targetId: string,
    newRole: Role,
    ipAddress?: string,
  ) {
    // 1. Prevent self-role modification
    if (actor.sub === targetId) {
      throw new BadRequestException('You cannot modify your own role.');
    }

    // 2. Strict Superadmin-only authorization for role modifications
    if (actor.role !== Role.SUPERADMIN) {
      throw new ForbiddenException(
        'Only a Superadmin can assign, promote, or modify user roles.',
      );
    }

    // 3. Locate target user
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
    });

    if (!target) {
      throw new NotFoundException(`Target user with ID '${targetId}' not found.`);
    }

    // 4. Prevent demotion or removal of the last active SUPERADMIN
    if (target.role === Role.SUPERADMIN && newRole !== Role.SUPERADMIN) {
      const activeSuperadmins = await this.prisma.user.count({
        where: { role: Role.SUPERADMIN, status: AccountStatus.ACTIVE },
      });

      if (activeSuperadmins <= 1) {
        throw new BadRequestException('Cannot demote or remove the last active Superadmin.');
      }
    }

    // 5. Update role in database
    const updatedUser = await this.prisma.user.update({
      where: { id: targetId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // 6. Record immutable audit log
    await this.auditService.recordLog({
      action: 'ROLE_UPDATED',
      actorId: actor.sub,
      actorEmail: actor.email,
      targetId: target.id,
      targetEmail: target.email,
      details: {
        previousRole: target.role,
        newRole,
      },
      ipAddress,
    });

    return {
      message: `User role successfully updated to ${newRole}.`,
      user: updatedUser,
    };
  }

  /**
   * Transfers platform SUPERADMIN ownership to an existing active account.
   * Atomically:
   * 1. Re-authenticates current Superadmin with currentPassword.
   * 2. Re-validates current Superadmin status and role against DB.
   * 3. Validates target user is existing, ACTIVE, and distinct from caller.
   * 4. Promotes target to SUPERADMIN and transitions previous owner to ADMIN within a Prisma $transaction.
   * 5. Records PLATFORM_OWNERSHIP_TRANSFERRED in immutable AuditLog.
   */
  async transferOwnership(
    actor: JwtPayload,
    dto: TransferOwnershipDto,
    ipAddress?: string,
  ) {
    const { targetUserId, currentPassword, confirmation } = dto;

    if (confirmation !== 'TRANSFER_OWNERSHIP') {
      throw new BadRequestException("Confirmation must be exactly 'TRANSFER_OWNERSHIP'.");
    }

    // 1. Guard against self-transfer
    if (actor.sub === targetUserId) {
      throw new BadRequestException('Cannot transfer platform ownership to yourself.');
    }

    // 2. Fetch actor from database (including passwordHash)
    const actorUser = await this.prisma.user.findUnique({
      where: { id: actor.sub },
    });

    if (!actorUser) {
      throw new UnauthorizedException('Acting user account no longer exists.');
    }

    if (actorUser.role !== Role.SUPERADMIN) {
      throw new ForbiddenException('Only a verified Superadmin can transfer platform ownership.');
    }

    if (actorUser.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Your Superadmin account is not active.');
    }

    // 3. Re-verify current password using bcrypt
    const isPasswordValid = await bcrypt.compare(currentPassword, actorUser.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password. Ownership transfer rejected.');
    }

    // 4. Fetch target user
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException(`Target user with ID '${targetUserId}' does not exist.`);
    }

    if (targetUser.status !== AccountStatus.ACTIVE) {
      throw new BadRequestException('Target user must be an ACTIVE account to receive platform ownership.');
    }

    if (targetUser.role === Role.SUPERADMIN) {
      throw new BadRequestException('Target user is already a Superadmin.');
    }

    // 5. Execute atomic role transfer in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Re-verify inside transaction to prevent race conditions or concurrent calls
      const freshActor = await tx.user.findUnique({ where: { id: actorUser.id } });
      const freshTarget = await tx.user.findUnique({ where: { id: targetUser.id } });

      if (
        !freshActor ||
        freshActor.role !== Role.SUPERADMIN ||
        freshActor.status !== AccountStatus.ACTIVE
      ) {
        throw new ForbiddenException('Superadmin privileges revoked or unavailable.');
      }

      if (!freshTarget || freshTarget.status !== AccountStatus.ACTIVE) {
        throw new BadRequestException('Target user became inactive or unavailable.');
      }

      // Promote target to SUPERADMIN
      const updatedTarget = await tx.user.update({
        where: { id: freshTarget.id },
        data: { role: Role.SUPERADMIN },
        select: { id: true, name: true, email: true, role: true, status: true },
      });

      // Transition actor to ADMIN
      const updatedActor = await tx.user.update({
        where: { id: freshActor.id },
        data: { role: Role.ADMIN },
        select: { id: true, name: true, email: true, role: true, status: true },
      });

      // Write immutable audit log
      await tx.auditLog.create({
        data: {
          action: 'PLATFORM_OWNERSHIP_TRANSFERRED',
          actorId: freshActor.id,
          actorEmail: freshActor.email,
          targetId: freshTarget.id,
          targetEmail: freshTarget.email,
          details: {
            previousOwnerId: freshActor.id,
            previousOwnerEmail: freshActor.email,
            previousOwnerNewRole: Role.ADMIN,
            newOwnerId: freshTarget.id,
            newOwnerEmail: freshTarget.email,
            newOwnerRole: Role.SUPERADMIN,
          },
          ipAddress,
        },
      });

      return {
        previousOwner: updatedActor,
        newOwner: updatedTarget,
      };
    });

    this.logger.log(
      `👑 Platform ownership successfully transferred from ${result.previousOwner.email} to ${result.newOwner.email}.`,
    );

    return {
      message: `Platform ownership successfully transferred to ${result.newOwner.name} (${result.newOwner.email}). Your role has transitioned to ADMIN.`,
      ...result,
    };
  }

  /**
   * Generates a new user profile directly from the administrative portal.
   * Generates a new user profile directly from the administrative portal.
   * Admins can create USER accounts (max ₹500 starting balance); SUPERADMIN can create USER or ADMIN accounts.
   */
  async createUserProfile(
    actor: JwtPayload,
    dto: CreateUserProfileDto,
    ipAddress?: string,
  ) {
    const email = dto.email.trim().toLowerCase();

    // 1. Enforce unique email check
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException(`An account with email '${email}' already exists.`);
    }

    // 2. Validate and normalize optional phone number
    let normalizedPhone: string | null = null;
    if (dto.phone && dto.phone.trim()) {
      normalizedPhone = normalizePhoneNumber(dto.phone.trim());
      if (!isValidE164(normalizedPhone)) {
        throw new BadRequestException(
          'Phone number must be in valid international E.164 format (e.g. +919876543210).',
        );
      }
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });
      if (existingPhone) {
        throw new ConflictException(
          `An account with phone '${normalizedPhone}' already exists.`,
        );
      }
    }

    // 3. Prevent creating SUPERADMIN via routine profile generation
    const targetRole = dto.role || Role.USER;
    if (targetRole === Role.SUPERADMIN) {
      throw new BadRequestException(
        'SUPERADMIN accounts cannot be created via profile generation. Use ownership transfer or CLI provisioning.',
      );
    }

    // 4. Role assignment restriction: ADMIN cannot create ADMIN
    if (targetRole !== Role.USER && actor.role !== Role.SUPERADMIN) {
      throw new ForbiddenException('Only a Superadmin can generate administrative accounts.');
    }

    // 5. Starting balance authorization and validation
    // Explicit rule: do not automatically grant ₹150 welcome bonus to every admin-created account.
    // Default starting balance is 0.0 unless explicitly specified by the administrator.
    const requestedBalance =
      dto.walletBalance !== undefined ? Number(dto.walletBalance) : 0.0;
    if (isNaN(requestedBalance) || requestedBalance < 0) {
      throw new BadRequestException('Wallet balance must be a non-negative number.');
    }
    if (actor.role !== Role.SUPERADMIN && requestedBalance > 500) {
      throw new BadRequestException(
        'Standard administrators cannot grant starting wallet balance exceeding ₹500. Superadmin approval required.',
      );
    }

    // 6. Explicit verification and welcome bonus eligibility rules:
    // - Role.ADMIN: Always verified immediately (emailVerified: true). Ineligible for welcome bonus (welcomeBonusClaimed: true).
    // - Role.USER:
    //   - Verification: Defaults to emailVerified: true (or dto.emailVerified if passed) so admin-provisioned users can sign in.
    //     If dto.welcomeBonusEligible === true and emailVerified is not explicitly set, emailVerified defaults to false
    //     so the user must complete OTP verification to receive the welcome bonus.
    //   - Welcome Bonus:
    //     - If requestedBalance > 0: welcomeBonusClaimed: true (prevents duplicate bonus credits).
    //     - If emailVerified is true: welcomeBonusClaimed: true (pre-verified accounts cannot undergo OTP bonus flow).
    //     - If unverified (emailVerified === false) and requestedBalance === 0 and dto.welcomeBonusEligible === true:
    //       welcomeBonusClaimed: false (user will claim ₹150 upon completing OTP verification).
    //     - Otherwise: welcomeBonusClaimed: true (marked claimed to prevent unearned ₹150 credits).
    const isTargetAdmin = targetRole === Role.ADMIN;
    let emailVerified = true;
    if (!isTargetAdmin) {
      if (dto.emailVerified !== undefined) {
        emailVerified = Boolean(dto.emailVerified);
      } else if (dto.welcomeBonusEligible === true) {
        emailVerified = false;
      }
    }
    const phoneVerified = Boolean(normalizedPhone && emailVerified);

    let welcomeBonusClaimed = true;
    if (
      !isTargetAdmin &&
      requestedBalance === 0 &&
      !emailVerified &&
      dto.welcomeBonusEligible === true
    ) {
      welcomeBonusClaimed = false;
    }

    // 7. Password security: use supplied password or generate random secure temporary password
    const isGeneratedPassword = !dto.password?.trim();
    const rawPassword =
      dto.password?.trim() || `${crypto.randomBytes(4).toString('hex')}@Astro2026`;
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    // 8. Execute atomic user creation, wallet transaction ledger record, and audit log in a transaction
    let newUser: any;
    try {
      newUser = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: dto.name.trim(),
            email,
            phone: normalizedPhone,
            passwordHash,
            role: targetRole,
            status: AccountStatus.ACTIVE,
            tokenVersion: 0,
            emailVerified,
            phoneVerified,
            welcomeBonusClaimed,
            dateOfBirth: dto.dateOfBirth || null,
            timeOfBirth: dto.timeOfBirth || null,
            placeOfBirth: dto.placeOfBirth || null,
            zodiacSign: dto.zodiacSign || 'Aries',
            walletBalance: requestedBalance,
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            emailVerified: true,
            phoneVerified: true,
            welcomeBonusClaimed: true,
            role: true,
            status: true,
            dateOfBirth: true,
            timeOfBirth: true,
            placeOfBirth: true,
            zodiacSign: true,
            walletBalance: true,
            createdAt: true,
          },
        });

        // Financial ledger entry for starting balance
        if (requestedBalance > 0) {
          await tx.walletTransaction.create({
            data: {
              userId: user.id,
              type: 'CREDIT',
              amount: requestedBalance,
              description: 'Admin Initial Provisioning Credits',
              balanceAfter: requestedBalance,
            },
          });
        }

        // Atomic security audit log
        await tx.auditLog.create({
          data: {
            action: 'USER_PROFILE_GENERATED',
            actorId: actor.sub,
            actorEmail: actor.email,
            targetId: user.id,
            targetEmail: user.email,
            details: {
              role: user.role,
              walletBalance: user.walletBalance,
              emailVerified,
              phoneVerified,
              welcomeBonusClaimed,
              generatedByAdmin: true,
              grantedCredits: requestedBalance,
              temporaryPasswordAssigned: isGeneratedPassword,
            },
            ipAddress,
          },
        });

        return user;
      });
    } catch (error: any) {
      if (
        error?.code === 'P2002' ||
        (typeof error?.message === 'string' && error.message.includes('Unique constraint failed'))
      ) {
        const target = Array.isArray(error?.meta?.target)
          ? error.meta.target.join(', ')
          : '';
        if (target.includes('phone')) {
          throw new ConflictException(
            `An account with phone '${normalizedPhone}' already exists.`,
          );
        }
        throw new ConflictException(`An account with email '${email}' already exists.`);
      }
      throw error;
    }

    this.logger.log(
      `👤 New user profile generated: ${newUser.email} (${newUser.role}) by ${actor.email} with ₹${requestedBalance} credits, emailVerified=${emailVerified}, welcomeBonusClaimed=${welcomeBonusClaimed}`,
    );

    return {
      message: `Profile for ${newUser.name} (${newUser.email}) generated successfully.`,
      user: newUser,
      temporaryPassword: isGeneratedPassword ? rawPassword : null,
    };
  }

  /**
   * Returns paginated audit logs for administrators.
   */
  async listAuditLogs(query: ListAuditLogsQueryDto) {
    return await this.auditService.getLogs(query);
  }
}
