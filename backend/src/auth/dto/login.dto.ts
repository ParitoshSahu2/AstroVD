import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiPropertyOptional({ example: 'aarav@example.com', description: 'Registered email address' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'aarav@example.com or 9876543210', description: 'Email address or mobile phone' })
  @IsOptional()
  @IsString()
  identifier?: string;

  @ApiProperty({ example: 'cosmicPass123!', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
