import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'aarav@example.com', description: 'Registered email address' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'cosmicPass123!', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
