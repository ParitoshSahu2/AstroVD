import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ListBookingsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by booking status',
    enum: ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
    example: 'ALL',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by canonical service ID',
    example: 'astrological_consultation',
  })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({
    description: 'Filter by scheduled date (YYYY-MM-DD)',
    example: '2026-10-25',
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Search by booking ID, customer name, email, or phone',
    example: 'Priya',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number (default: 1)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page (default: 20)',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
