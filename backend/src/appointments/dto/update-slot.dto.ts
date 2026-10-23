import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, Min, Max } from 'class-validator';

export class UpdateSlotDto {
  @ApiPropertyOptional({
    description: 'New start time (only allowed if slot has no active booking)',
    example: '10:30 AM',
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Slot duration in minutes',
    example: 60,
  })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(240)
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Toggle published visibility for seekers',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Admin notes or instructions',
    example: 'Adjusted timing for puja',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
