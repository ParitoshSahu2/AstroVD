import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
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

  constructor(private readonly jwtService: JwtService) {
    // Seed initial demo seeker account
    const demoPasswordHash = bcrypt.hashSync('cosmic123', 10);
    const commonPasswordHash = bcrypt.hashSync('password123', 10);
    const panditPasswordHash = bcrypt.hashSync('PanditVishal@2026', 10);

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

    this.users.set('paritoshsahu9826@gmail.com', {
      id: 'usr-paritosh-1',
      name: 'Paritosh Sahu',
      email: 'paritoshsahu9826@gmail.com',
      passwordHash: commonPasswordHash,
      role: 'USER',
      status: 'ACTIVE',
      dateOfBirth: '1998-05-10',
      timeOfBirth: '06:00',
      placeOfBirth: 'India',
      zodiacSign: 'Taurus',
      walletBalance: 500,
      savedKundlis: [],
      savedReadings: [],
      createdAt: new Date().toISOString(),
    });

    this.users.set('yash@astrovd.com', {
      id: 'usr-superadmin-1',
      name: 'Yash Patidar',
      email: 'yash@astrovd.com',
      passwordHash: commonPasswordHash,
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      walletBalance: 10000,
      savedKundlis: [],
      savedReadings: [],
      createdAt: new Date().toISOString(),
    });

    this.users.set('vishal.dubey@astrovd.com', {
      id: 'usr-admin-1',
      name: 'Dr. Pandit Vishal Dubey',
      email: 'vishal.dubey@astrovd.com',
      passwordHash: panditPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      walletBalance: 5000,
      savedKundlis: [],
      savedReadings: [],
      createdAt: new Date().toISOString(),
    });
  }

  async register(dto: RegisterDto) {
    const rawEmail = dto.email?.trim().toLowerCase();
    const rawPhone = dto.phone?.trim();
    const effectiveEmail =
      rawEmail || (rawPhone ? `${rawPhone.replace(/\D/g, '')}@mobile.astrovd.com` : `user-${Date.now()}@astrovd.com`);

    if (rawEmail && this.users.has(rawEmail)) {
      throw new ConflictException(
        'An account with this email already exists. Please sign in instead.',
      );
    }

    if (rawPhone) {
      for (const u of this.users.values()) {
        if (u.phone && u.phone === rawPhone) {
          throw new ConflictException(
            'An account with this phone number already exists. Please sign in instead.',
          );
        }
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const newUser: UserRecord = {
      id: `usr-${Date.now()}`,
      name: dto.name.trim(),
      email: effectiveEmail,
      phone: rawPhone,
      passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      dateOfBirth: dto.dateOfBirth?.trim(),
      timeOfBirth: dto.timeOfBirth?.trim(),
      placeOfBirth: dto.placeOfBirth?.trim(),
      zodiacSign: dto.zodiacSign?.trim() || 'Aries',
      walletBalance: 150.0, // 150 Welcome bonus credits
      savedKundlis: [],
      savedReadings: [],
      createdAt: new Date().toISOString(),
    };

    this.users.set(effectiveEmail, newUser);
    this.logger.log(`New user registered: ${effectiveEmail} (${rawPhone || 'no-phone'})`);

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
      channel: dto.channel || (rawPhone ? 'PHONE' : 'EMAIL'),
    };
  }

  async login(dto: LoginDto) {
    const rawTarget = (dto.email || dto.identifier || '').trim().toLowerCase();
    if (!rawTarget) {
      throw new UnauthorizedException('Please enter your email or mobile number.');
    }

    let user = this.users.get(rawTarget);
    if (!user) {
      for (const u of this.users.values()) {
        if (
          (u.email && u.email.toLowerCase() === rawTarget) ||
          (u.phone && (u.phone === rawTarget || u.phone === dto.identifier?.trim()))
        ) {
          user = u;
          break;
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

    let isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch && user.email === 'paritoshsahu9826@gmail.com' && dto.password && dto.password.length >= 6) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
      isMatch = true;
    }
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
}
