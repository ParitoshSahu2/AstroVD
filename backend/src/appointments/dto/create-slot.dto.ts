import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, Max, Matches } from 'class-validator';

export class CreateSlotDto {
  @ApiProperty({
    description: 'Slot date in YYYY-MM-DD format',
    example: '2026-10-25',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' })
  date!: string;

  @ApiProperty({
    description: 'Slot start time (e.g. "10:00 AM" or "10:00")',
    example: '10:00 AM',
  })
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @ApiPropertyOptional({
    description: 'Slot duration in minutes',
    example: 45,
    default: 45,
  })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(240)
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Whether slot is published and bookable by seekers',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Admin notes or instructions for this slot',
    example: 'Morning consultation window',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
