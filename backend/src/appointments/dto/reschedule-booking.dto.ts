import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';

export class RescheduleBookingDto {
  @ApiProperty({
    description: 'Target consultation date in YYYY-MM-DD format',
    example: '2026-11-15',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' })
  scheduledDate!: string;

  @ApiProperty({
    description: 'Target consultation time slot (e.g. "02:00 PM")',
    example: '02:00 PM',
  })
  @IsString()
  @IsNotEmpty()
  scheduledTime!: string;

  @ApiPropertyOptional({
    description: 'Reason for rescheduling the consultation',
    example: 'Customer requested afternoon slot due to travel schedule.',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Optional admin notes regarding rescheduling',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
