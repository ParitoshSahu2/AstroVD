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
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    if (this.users.has(email)) {
      throw new ConflictException(
        'An account with this email already exists. Please sign in instead.',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const newUser: UserRecord = {
      id: `usr-${Date.now()}`,
      name: dto.name.trim(),
      email,
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
    const email = dto.email.trim().toLowerCase();
    const user = this.users.get(email);

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
