import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Aarav Sharma', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'aarav@example.com', description: 'Unique email address' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ example: '+919876543210', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'cosmicPass123!', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ example: '1995-05-15', description: 'Birth date (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '08:30', description: 'Birth time (HH:MM)' })
  @IsString()
  @IsOptional()
  timeOfBirth?: string;

  @ApiPropertyOptional({ example: 'Varanasi, India', description: 'Place of birth' })
  @IsString()
  @IsOptional()
  placeOfBirth?: string;

  @ApiPropertyOptional({ example: 'Taurus', description: 'Vedic or Western Zodiac sign' })
  @IsString()
  @IsOptional()
  zodiacSign?: string;
}
