import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListAuditLogsQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'ROLE_UPDATED', description: 'Filter by action name' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ example: 'superadmin@astrovd.com', description: 'Filter by actor email' })
  @IsOptional()
  @IsString()
  actorEmail?: string;

  @ApiPropertyOptional({ example: 'yash@astrovd.com', description: 'Filter by target user email' })
  @IsOptional()
  @IsString()
  targetEmail?: string;
}
