import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class UpdateBookingStatusDto {
  @ApiProperty({
    description: 'Target booking status (PENDING, CONFIRMED, COMPLETED, CANCELLED, REJECTED)',
    enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'],
    example: 'COMPLETED',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'], {
    message: 'Status must be one of: PENDING, CONFIRMED, COMPLETED, CANCELLED, REJECTED',
  })
  status!: string;

  @ApiPropertyOptional({
    description: 'Admin notes or resolution rationale',
    example: 'Consultation conducted smoothly over video call.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
