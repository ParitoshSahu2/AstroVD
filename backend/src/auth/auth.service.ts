import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

export class RegisterDto {
  name: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  zodiacSign?: string;
}

export class LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  // In-memory user store for instant out-of-the-box functioning
  private inMemoryUsers: Map<string, any> = new Map();

  constructor(private readonly jwtService: JwtService) {
    // Seed a demo user
    const demoPasswordHash = bcrypt.hashSync('cosmic123', 10);
    this.inMemoryUsers.set('celestial@universe.com', {
      id: 'user-demo-1',
      name: 'Aarav Sharma',
      email: 'celestial@universe.com',
      passwordHash: demoPasswordHash,
      dateOfBirth: '1996-11-14',
      timeOfBirth: '07:30',
      placeOfBirth: 'New Delhi, India',
      zodiacSign: 'Scorpio',
      savedKundlis: [],
      savedReadings: [],
      walletBalance: 250,
    });
  }

  async register(dto: RegisterDto) {
    const existing = this.inMemoryUsers.get(dto.email.toLowerCase());
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const newUser = {
      id: `usr-${Date.now()}`,
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      dateOfBirth: dto.dateOfBirth,
      timeOfBirth: dto.timeOfBirth,
      placeOfBirth: dto.placeOfBirth,
      zodiacSign: dto.zodiacSign || 'Aries',
      savedKundlis: [],
      savedReadings: [],
      walletBalance: 150, // Welcome credit
    };

    this.inMemoryUsers.set(dto.email.toLowerCase(), newUser);

    const token = this.jwtService.sign({
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return {
      message: 'Registration successful! Welcome bonus of 150 credits added to your spiritual wallet.',
      user: userWithoutPassword,
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = this.inMemoryUsers.get(dto.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      message: 'Login successful! May celestial blessings guide your day.',
      user: userWithoutPassword,
      accessToken: token,
    };
  }

  getProfile(email: string) {
    const user = this.inMemoryUsers.get(email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('User profile not found.');
    }
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
