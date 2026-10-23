import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiPropertyOptional({ example: 'aarav@example.com', description: 'Registered email address' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'aarav@example.com', description: 'Registered email or phone identifier' })
  @IsString()
  @IsOptional()
  identifier?: string;

  @ApiProperty({ example: 'cosmicPass123!', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
