import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsIn,
} from 'class-validator';

export class UpdateServiceDto {
  @ApiPropertyOptional({
    description: 'Updated service title / name',
    example: 'Special Rudrabhishek Puja in Kashi',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    description: 'Category key identifier',
    enum: ['astrology', 'pooja', 'occult', 'education'],
    example: 'pooja',
  })
  @IsOptional()
  @IsString()
  @IsIn(['astrology', 'pooja', 'occult', 'education'])
  categoryKey?: 'astrology' | 'pooja' | 'occult' | 'education';

  @ApiPropertyOptional({
    description: 'Display category tag badge',
    example: 'SACRED RITUAL',
  })
  @IsOptional()
  @IsString()
  categoryTag?: string;

  @ApiPropertyOptional({
    description: 'Officiating Pandit / Spiritual Guide',
    example: 'Dr. Pandit Vishal Dubey (Kashi Vishwanath)',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  pandit?: string;

  @ApiPropertyOptional({
    description: 'Comprehensive service description',
    example: 'Updated Vedic Rudrabhishek details and requirements.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  desc?: string;

  @ApiPropertyOptional({
    description: 'Display price string (e.g. "₹3,500")',
    example: '₹3,500',
  })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({
    description: 'Price in INR (0 for complimentary initiatives)',
    example: 3500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceNumber?: number;

  @ApiPropertyOptional({
    description: 'Estimated consultation or ritual duration in minutes',
    example: 45,
  })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(240)
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Service image path or URL',
    example: '/services/consultation.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Promotional badge text',
    example: 'Popular Choice',
  })
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiPropertyOptional({
    description: 'Special sacred initiative flag',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isSpecial?: boolean;

  @ApiPropertyOptional({
    description: 'Active status for client visibility and booking acceptance',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
