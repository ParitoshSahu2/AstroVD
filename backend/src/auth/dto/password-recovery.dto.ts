import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordEmailDto {
  @ApiProperty({ example: 'yashpatidar862@gmail.com', description: 'Registered email address' })
  @IsString()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordEmailDto {
  @ApiProperty({ example: 'a1b2c3d4...', description: 'Password reset token from email link' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'SuperSecurePass@2026', description: 'New password' })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}

export class ForgotPasswordMobileDto {
  @ApiProperty({ example: '+919876543210', description: 'Registered mobile number' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}

export class ResetPasswordMobileDto {
  @ApiProperty({ example: '+919876543210', description: 'Registered mobile number' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: '123456', description: '6-digit verification code' })
  @IsString()
  @IsNotEmpty()
  otp!: string;

  @ApiProperty({ example: 'SuperSecurePass@2026', description: 'New password' })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}

export class VerifyResetMobileOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Registered mobile number' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: '123456', description: '6-digit verification code' })
  @IsString()
  @IsNotEmpty()
  otp!: string;
}
