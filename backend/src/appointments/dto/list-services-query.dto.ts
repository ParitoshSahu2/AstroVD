import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListServicesQueryDto {
  @ApiPropertyOptional({
    description: 'Search filter by service title, id, pandit, or description',
    example: 'Kundli',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by categoryKey (astrology, pooja, occult, education) or ALL',
    example: 'astrology',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by status: ACTIVE, INACTIVE, or ALL',
    example: 'ALL',
    default: 'ALL',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
