import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../auth/roles.enum.js';

export class CreateUserProfileDto {
  @ApiProperty({ example: 'Arjun Mehta', description: 'Full name of the seeker or user' })
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ example: 'arjun.mehta@example.com', description: 'Unique email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  @IsEmail({}, { message: 'Must be a valid email format' })
  email: string;

  @ApiPropertyOptional({
    example: 'SecureSeekerPass#2026',
    description: 'Initial password (minimum 8 characters). Generates a secure temporary password if omitted',
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @ApiPropertyOptional({
    enum: Role,
    default: Role.USER,
    description: 'Initial role assigned to user (USER or ADMIN; SUPERADMIN prohibited)',
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Role must be USER or ADMIN' })
  role?: Role;

  @ApiPropertyOptional({ example: '1998-05-24', description: 'Date of birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '14:30', description: 'Time of birth (HH:MM)' })
  @IsOptional()
  @IsString()
  timeOfBirth?: string;

  @ApiPropertyOptional({ example: 'Varanasi, Uttar Pradesh', description: 'Place of birth' })
  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @ApiPropertyOptional({ example: 'Taurus', description: 'Vedic Rashi or Sun Zodiac Sign' })
  @IsOptional()
  @IsString()
  zodiacSign?: string;

  @ApiPropertyOptional({ example: '+919876543210', description: 'Contact phone number (international format)' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 0.0, description: 'Initial spiritual wallet balance (defaults to 0.0)' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Wallet balance cannot be negative' })
  walletBalance?: number;

  @ApiPropertyOptional({
    description: 'Whether to verify account immediately. Defaults to true for administrative provisioning.',
  })
  @IsOptional()
  emailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Whether account is eligible for ₹150 welcome bonus. Defaults to false for admin-created accounts.',
  })
  @IsOptional()
  welcomeBonusEligible?: boolean;
}
