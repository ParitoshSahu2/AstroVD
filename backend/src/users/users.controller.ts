import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { WalletTransactionsQueryDto } from './dto/wallet-transactions-query.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@ApiTags('User Self-Service Profile & Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current authenticated user profile',
    description:
      'Returns permitted profile fields and spiritual wallet balance for the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Profile returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or expired token' })
  async getMe(@CurrentUser() user: JwtPayload) {
    return await this.usersService.getMe(user.sub);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update permitted profile fields for current user',
    description:
      'Updates editable profile fields (name, dateOfBirth, timeOfBirth, placeOfBirth, zodiacSign). Rejects client-injected roles or balances.',
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or non-permitted fields passed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.usersService.updateMe(user.sub, dto, ipAddress);
  }

  @Patch('me/password')
  @ApiOperation({
    summary: 'Change current user password',
    description:
      'Verifies current password and sets new password (minimum 12 characters). Atomically increments tokenVersion to invalidate all existing sessions across all devices.',
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password or new password fails policy' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - account suspended' })
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.usersService.changePassword(user.sub, dto, ipAddress);
  }

  @Get('me/wallet')
  @ApiOperation({
    summary: 'Get current user wallet balance',
    description:
      'Returns the real-time spiritual wallet balance and currency code for the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Wallet balance returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWallet(@CurrentUser() user: JwtPayload) {
    return await this.usersService.getWallet(user.sub);
  }

  @Get('me/wallet/transactions')
  @ApiOperation({
    summary: 'Get paginated wallet transaction history',
    description:
      'Returns the authenticated user ledger transaction records (welcome bonuses, credits, debits).',
  })
  @ApiResponse({ status: 200, description: 'Transaction history returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactions(
    @CurrentUser() user: JwtPayload,
    @Query() query: WalletTransactionsQueryDto,
  ) {
    return await this.usersService.getTransactions(user.sub, query);
  }
}
