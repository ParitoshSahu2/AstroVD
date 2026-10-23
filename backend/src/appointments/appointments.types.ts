import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookAppointmentDto {
  @ApiProperty({ example: 'astrological_consultation', description: 'ID of the astrological service' })
  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @ApiPropertyOptional({ example: 'vishal', description: 'ID of chosen Astrologer / Pandit' })
  @IsString()
  @IsOptional()
  astrologerId?: string;

  @ApiProperty({ example: '2026-10-22', description: 'Scheduled date (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  scheduledDate!: string;

  @ApiProperty({ example: '11:00 AM', description: 'Selected time slot' })
  @IsString()
  @IsNotEmpty()
  scheduledTime!: string;

  @ApiProperty({ example: 'video', enum: ['video', 'call', 'in-person'], description: 'Consultation mode' })
  @IsString()
  @IsNotEmpty()
  consultationType!: 'video' | 'call' | 'in-person';

  @ApiProperty({ example: '+91 98260 12345', description: 'WhatsApp / contact phone number' })
  @IsString()
  @IsNotEmpty()
  contactPhone!: string;

  @ApiPropertyOptional({ example: 'Aarav Sharma', description: 'Seeker full name' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ example: 'aarav@example.com', description: 'Seeker email address' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '1995-05-15 08:30 AM Varanasi', description: 'Birth details or consultation notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export interface AppointmentSlot {
  time: string;
  isAvailable: boolean;
  reason?: string;
  period: 'morning' | 'afternoon' | 'evening';
}
