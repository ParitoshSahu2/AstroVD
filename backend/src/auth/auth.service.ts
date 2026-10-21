import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

export { RegisterDto, LoginDto };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Registers a new user account with bcrypt password hashing and 150 welcome bonus credits.
   * Prevents duplicate registration by checking unique email.
   * Always assigns default 'USER' role and 'ACTIVE' status.
   */
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    // Check for existing user in PostgreSQL
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException(
        'An account with this email already exists. Please sign in instead.',
      );
    }

    // Secure password hashing with bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Atomically create user and credit welcome transaction in PostgreSQL
    const createdUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email,
          passwordHash,
          role: 'USER',
          status: 'ACTIVE',
          dateOfBirth: dto.dateOfBirth?.trim() || null,
          timeOfBirth: dto.timeOfBirth?.trim() || null,
          placeOfBirth: dto.placeOfBirth?.trim() || null,
          zodiacSign: dto.zodiacSign?.trim() || 'Aries',
          walletBalance: 150.0,
          savedKundlis: [],
          savedReadings: [],
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          type: 'CREDIT',
          amount: 150.0,
          description: 'Welcome Bonus Credits',
          balanceAfter: 150.0,
        },
      });

      return user;
    });

    // Record audit log for new registration
    await this.auditService.recordLog({
      action: 'USER_REGISTERED',
      actorId: createdUser.id,
      actorEmail: createdUser.email,
      targetId: createdUser.id,
      targetEmail: createdUser.email,
      details: { role: createdUser.role, status: createdUser.status },
    });

    const accessToken = this.jwtService.sign({
      sub: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role,
      status: createdUser.status,
    });

    const { passwordHash: _, ...safeUser } = createdUser;
    return {
      message:
        'Registration successful! Welcome bonus of 150 credits added to your spiritual wallet.',
      user: safeUser,
      accessToken,
    };
  }

  /**
   * Authenticates user credentials using bcrypt compare and returns a signed JWT.
   * Rejects suspended user accounts immediately.
   */
  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Use generic error to avoid user enumeration
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException(
        'Your account has been suspended. Please contact support.',
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    });

    const { passwordHash: _, ...safeUser } = user;
    return {
      message: 'Login successful! May celestial blessings guide your day.',
      user: safeUser,
      accessToken,
    };
  }

  /**
   * Retrieves profile for authenticated user while strictly excluding password hash.
   */
  async getProfile(userIdOrEmail: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: userIdOrEmail },
          { email: userIdOrEmail.trim().toLowerCase() },
        ],
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User profile not found.');
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}
