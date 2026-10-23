import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

export { RegisterDto, LoginDto };

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: string;
  status: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  zodiacSign?: string;
  walletBalance: number;
  savedKundlis: any[];
  savedReadings: any[];
  createdAt: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private users: Map<string, UserRecord> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {
    // Seed initial demo seeker account
    const demoPasswordHash = bcrypt.hashSync('cosmic123', 10);
    this.users.set('celestial@universe.com', {
      id: 'usr-demo-1',
      name: 'Aarav Sharma',
      email: 'celestial@universe.com',
      passwordHash: demoPasswordHash,
      role: 'USER',
      status: 'ACTIVE',
      dateOfBirth: '1996-11-14',
      timeOfBirth: '07:30',
      placeOfBirth: 'New Delhi, India',
      zodiacSign: 'Scorpio',
      walletBalance: 250,
      savedKundlis: [],
      savedReadings: [],
      createdAt: new Date().toISOString(),
    });

    // Seed Superadmin account
    const superadminEmail = (process.env.SUPERADMIN_EMAIL || 'yash@astrovd.com').toLowerCase();
    const superadminPass = process.env.SUPERADMIN_PASSWORD || 'password123';
    this.users.set(superadminEmail, {
      id: 'usr-superadmin',
      name: process.env.SUPERADMIN_NAME || 'Yash Patidar',
      email: superadminEmail,
      passwordHash: bcrypt.hashSync(superadminPass, 10),
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      walletBalance: 99999,
      savedKundlis: [],
      savedReadings: [],
      createdAt: new Date().toISOString(),
    });

    // Seed Admin account (Dr. Pandit Vishal Dubey)
    const adminEmail = (process.env.ADMIN_EMAIL || 'vishal.dubey@astrovd.com').toLowerCase();
    const adminPass = process.env.PANDIT_PASSWORD || 'PanditVishal@2026';
    this.users.set(adminEmail, {
      id: 'usr-admin-vishal',
      name: process.env.ADMIN_NAME || 'Dr. Pandit Vishal Dubey',
      email: adminEmail,
      passwordHash: bcrypt.hashSync(adminPass, 10),
      role: 'ADMIN',
      status: 'ACTIVE',
      walletBalance: 50000,
      savedKundlis: [],
      savedReadings: [],
      createdAt: new Date().toISOString(),
    });

    // Seed convenience Admin account
    this.users.set('admin@astrovd.com', {
      id: 'usr-admin-demo',
      name: 'AstroVD Content Admin',
      email: 'admin@astrovd.com',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'ADMIN',
      status: 'ACTIVE',
      walletBalance: 10000,
      savedKundlis: [],
      savedReadings: [],
      createdAt: new Date().toISOString(),
    });
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    try {
      const existingInDb = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: email, mode: 'insensitive' } },
            ...(dto.phone ? [{ phone: dto.phone.trim() }] : []),
          ],
        },
      });

      if (existingInDb) {
        throw new ConflictException(
          'An account with this email/phone already exists. Please sign in instead.',
        );
      }
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      this.logger.warn(`Database check during registration: ${err}`);
    }

    if (this.users.has(email)) {
      throw new ConflictException(
        'An account with this email already exists. Please sign in instead.',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    let dbCreated: any = null;
    try {
      dbCreated = await this.prisma.user.create({
        data: {
          name: dto.name.trim(),
          email,
          phone: dto.phone?.trim() || null,
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
    } catch (err) {
      this.logger.warn(`Database insert during registration: ${err}`);
    }

    const newUser: UserRecord = {
      id: dbCreated?.id || `usr-${Date.now()}`,
      name: dto.name.trim(),
      email,
      phone: dto.phone?.trim(),
      passwordHash,
      role: dbCreated?.role || 'USER',
      status: dbCreated?.status || 'ACTIVE',
      dateOfBirth: dto.dateOfBirth?.trim(),
      timeOfBirth: dto.timeOfBirth?.trim(),
      placeOfBirth: dto.placeOfBirth?.trim(),
      zodiacSign: dto.zodiacSign?.trim() || 'Aries',
      walletBalance: 150.0,
      savedKundlis: [],
      savedReadings: [],
      createdAt: dbCreated?.createdAt?.toISOString?.() || new Date().toISOString(),
    };

    this.users.set(email, newUser);
    this.logger.log(`New user registered: ${email}`);

    const accessToken = this.jwtService.sign({
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      status: newUser.status,
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return {
      message:
        'Registration successful! Welcome bonus of 150 credits added to your spiritual wallet.',
      user: safeUser,
      accessToken,
    };
  }

  async login(dto: LoginDto) {
    const rawIdentifier = (dto.identifier || dto.email || '').trim();
    if (!rawIdentifier) {
      throw new BadRequestException('Email or login identifier is required.');
    }

    // 1. Check PostgreSQL via Prisma for real user and admin accounts
    let dbUser: any = null;
    try {
      dbUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: rawIdentifier, mode: 'insensitive' } },
            { phone: rawIdentifier },
          ],
        },
      });
    } catch (err) {
      this.logger.warn(`Database query failed in login: ${err}`);
    }

    let user: any = null;
    if (dbUser) {
      user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email || rawIdentifier,
        phone: dbUser.phone || undefined,
        passwordHash: dbUser.passwordHash,
        role: dbUser.role,
        status: dbUser.status,
        walletBalance: dbUser.walletBalance,
        savedKundlis: dbUser.savedKundlis || [],
        savedReadings: dbUser.savedReadings || [],
        createdAt: dbUser.createdAt?.toISOString?.() || new Date().toISOString(),
      };
    } else {
      // 2. Fallback to in-memory seeded users (for test fixtures)
      const lower = rawIdentifier.toLowerCase();
      user = this.users.get(lower);
      if (!user) {
        for (const u of this.users.values()) {
          if (
            (u.email && u.email.toLowerCase() === lower) ||
            (u.phone && (u.phone === rawIdentifier || u.phone.endsWith(rawIdentifier)))
          ) {
            user = u;
            break;
          }
        }
      }
    }

    if (!user) {
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

  async getProfile(userIdOrEmail: string) {
    try {
      const dbUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { id: userIdOrEmail },
            { email: { equals: userIdOrEmail.trim(), mode: 'insensitive' } },
          ],
        },
      });

      if (dbUser) {
        const { passwordHash: _, ...safeUser } = dbUser;
        return safeUser;
      }
    } catch (err) {
      this.logger.warn(`Database query failed in getProfile: ${err}`);
    }

    let user: UserRecord | undefined;
    for (const u of this.users.values()) {
      if (u.id === userIdOrEmail || u.email === userIdOrEmail.trim().toLowerCase()) {
        user = u;
        break;
      }
    }

    if (!user) {
      throw new UnauthorizedException('User profile not found.');
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(
    userId: string,
    updateData: {
      name?: string;
      dateOfBirth?: string;
      timeOfBirth?: string;
      placeOfBirth?: string;
      zodiacSign?: string;
    },
  ) {
    let updated: any = null;
    try {
      updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(updateData.name ? { name: updateData.name.trim() } : {}),
          ...(updateData.dateOfBirth ? { dateOfBirth: updateData.dateOfBirth.trim() } : {}),
          ...(updateData.timeOfBirth ? { timeOfBirth: updateData.timeOfBirth.trim() } : {}),
          ...(updateData.placeOfBirth ? { placeOfBirth: updateData.placeOfBirth.trim() } : {}),
          ...(updateData.zodiacSign ? { zodiacSign: updateData.zodiacSign.trim() } : {}),
        },
      });
    } catch (err) {
      this.logger.warn(`Database update failed in updateProfile: ${err}`);
    }

    for (const [key, u] of this.users.entries()) {
      if (u.id === userId) {
        this.users.set(key, {
          ...u,
          ...(updateData.name ? { name: updateData.name.trim() } : {}),
          ...(updateData.dateOfBirth ? { dateOfBirth: updateData.dateOfBirth.trim() } : {}),
          ...(updateData.timeOfBirth ? { timeOfBirth: updateData.timeOfBirth.trim() } : {}),
          ...(updateData.placeOfBirth ? { placeOfBirth: updateData.placeOfBirth.trim() } : {}),
          ...(updateData.zodiacSign ? { zodiacSign: updateData.zodiacSign.trim() } : {}),
        });
        break;
      }
    }

    if (updated) {
      const { passwordHash: _, ...safeUser } = updated;
      return safeUser;
    }

    return await this.getProfile(userId);
  }
}
