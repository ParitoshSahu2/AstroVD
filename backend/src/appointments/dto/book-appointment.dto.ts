import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber, Min, Max } from 'class-validator';

export class BookAppointmentDto {
  @ApiPropertyOptional({
    description: 'Consultation duration in minutes (e.g. 15, 30, 45, 60)',
    example: 30,
  })
  @IsOptional()
  durationMinutes?: number;
  @ApiProperty({
    description: 'Stable canonical service ID (e.g. astrological_consultation)',
    example: 'astrological_consultation',
  })
  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @ApiProperty({
    description: 'Preferred appointment date in YYYY-MM-DD format',
    example: '2026-10-25',
  })
  @IsString()
  @IsNotEmpty()
  scheduledDate!: string;

  @ApiProperty({
    description: 'Published time slot (e.g. 11:00 AM)',
    example: '11:00 AM',
  })
  @IsString()
  @IsNotEmpty()
  scheduledTime!: string;

  @ApiPropertyOptional({
    description: 'Consultation mode (video, call, in-person)',
    example: 'video',
    enum: ['video', 'call', 'in-person'],
  })
  @IsOptional()
  @IsIn(['video', 'call', 'in-person'])
  consultationType?: 'video' | 'call' | 'in-person';

  @ApiProperty({
    description: 'Contact phone number (E.164 or 10-digit format)',
    example: '+919826012345',
  })
  @IsString()
  @IsNotEmpty()
  contactPhone!: string;

  @ApiPropertyOptional({
    description: 'Seeker display name',
    example: 'Rahul Sharma',
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Birth details (DOB, TOB, POB) and specific spiritual questions',
    example: '15th Aug 1990, 04:30 AM, Varanasi. Question regarding career change.',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Payment method (e.g. WALLET or PENDING_PAYMENT)',
    example: 'WALLET',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
