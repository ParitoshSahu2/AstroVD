import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Matches, IsInt, Min, Max } from 'class-validator';

export class InitializeScheduleDto {
  @ApiProperty({
    description: 'Start date in YYYY-MM-DD format',
    example: '2026-10-25',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' })
  startDate!: string;

  @ApiPropertyOptional({
    description: 'Number of consecutive days to initialize (1-30)',
    example: 7,
    default: 7,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  daysCount?: number;
}
