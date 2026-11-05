import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateServiceDto {
  @ApiPropertyOptional({
    description: 'Unique stable service slug/ID. If omitted, will be auto-generated from title.',
    example: 'rudrabhishek_special_puja',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Service title / name',
    example: 'Special Rudrabhishek Puja in Kashi',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Category key identifier',
    enum: ['astrology', 'pooja', 'occult', 'education'],
    example: 'pooja',
  })
  @IsString()
  @IsIn(['astrology', 'pooja', 'occult', 'education'])
  categoryKey!: 'astrology' | 'pooja' | 'occult' | 'education';

  @ApiPropertyOptional({
    description: 'Display category tag badge',
    example: 'SACRED RITUAL',
  })
  @IsOptional()
  @IsString()
  categoryTag?: string;

  @ApiProperty({
    description: 'Officiating Pandit / Spiritual Guide',
    example: 'Dr. Pandit Vishal Dubey (Kashi Vishwanath)',
  })
  @IsString()
  @IsNotEmpty()
  pandit!: string;

  @ApiProperty({
    description: 'Comprehensive service description',
    example: 'Authentic Vedic Rudrabhishek ritual performed following traditional Sanskrit mantras.',
  })
  @IsString()
  @IsNotEmpty()
  desc!: string;

  @ApiPropertyOptional({
    description: 'Display price string (e.g. "₹3,100" or "100% FREE"). Auto-formatted if omitted.',
    example: '₹3,100',
  })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiProperty({
    description: 'Price in INR (0 for complimentary initiatives)',
    example: 3100,
  })
  @IsNumber()
  @Min(0)
  priceNumber!: number;

  @ApiProperty({
    description: 'Estimated consultation or ritual duration in minutes',
    example: 45,
  })
  @IsInt()
  @Min(10)
  @Max(240)
  durationMinutes!: number;

  @ApiPropertyOptional({
    description: 'Service image path or URL',
    example: '/services/consultation.jpg',
    default: '/services/consultation.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Promotional badge text',
    example: 'Most Popular',
  })
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiPropertyOptional({
    description: 'Special sacred initiative flag',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSpecial?: boolean;

  @ApiPropertyOptional({
    description: 'Active status for client visibility and booking acceptance',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
