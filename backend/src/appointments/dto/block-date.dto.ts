import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class BlockDateDto {
  @ApiProperty({
    description: 'Date to block in YYYY-MM-DD format',
    example: '2026-10-31',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' })
  date!: string;

  @ApiPropertyOptional({
    description: 'Reason for blocking this date (e.g. festival, personal leave, sanctuary holiday)',
    example: 'Diwali Sanctuary Observance & Maha Homa',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
