import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import {
  ForgotPasswordEmailDto,
  ResetPasswordEmailDto,
  ForgotPasswordMobileDto,
  ResetPasswordMobileDto,
  VerifyResetMobileOtpDto,
} from './dto/password-recovery.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { JwtPayload } from './decorators/current-user.decorator.js';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('User Authentication & Profile')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user account',
    description:
      'Creates a new seeker account with bcrypt password hashing and 150 welcome bonus credits in PostgreSQL.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully with JWT access token',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (e.g. invalid email or password < 6 chars)',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - an account with this email already exists',
  })
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in with email and password',
    description:
      'Verifies credentials against PostgreSQL using bcrypt and returns a signed JWT access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful with JWT access token',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid email or password',
  })
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get authenticated user profile',
    description:
      'Retrieves the logged-in user profile, wallet balance, and recent ledger entries. Protected by JwtAuthGuard.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing, expired, or invalid Bearer token',
  })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return await this.authService.getProfile(user.sub);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and terminate active session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset link via email',
    description: 'Generates a secure password reset token and dispatches reset link to registered email.',
  })
  async forgotPassword(@Body() dto: ForgotPasswordEmailDto) {
    return await this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password using email token',
    description: 'Validates reset token and sets new password.',
  })
  async resetPassword(@Body() dto: ResetPasswordEmailDto) {
    return await this.authService.resetPassword(dto);
  }

  @Post('forgot-password-mobile')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request SMS OTP for password recovery',
    description: 'Dispatches 6-digit numeric recovery code via SMS.',
  })
  async forgotPasswordMobile(@Body() dto: ForgotPasswordMobileDto) {
    return await this.authService.forgotPasswordMobile(dto);
  }

  @Post('reset-password-mobile')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password using mobile SMS OTP',
    description: 'Validates 6-digit SMS OTP and sets new password.',
  })
  async resetPasswordMobile(@Body() dto: ResetPasswordMobileDto) {
    return await this.authService.resetPasswordMobile(dto);
  }

  @Post('verify-reset-mobile-otp')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify mobile recovery code',
    description: 'Validates 6-digit recovery code before setting new password.',
  })
  async verifyResetMobileOtp(@Body() dto: VerifyResetMobileOtpDto) {
    return await this.authService.verifyResetMobileOtp(dto);
  }
}

