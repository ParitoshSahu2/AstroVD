import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';
import { Role } from '../auth/roles.enum.js';
import { ListUsersQueryDto } from './dto/list-users-query.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto.js';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto.js';
import { CreateUserProfileDto } from './dto/create-user-profile.dto.js';

@ApiTags('Administrative User Management & Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('users')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Generate a new user profile (Admin/Superadmin)',
    description:
      'Creates a new seeker or administrative user profile. Admins can create USER profiles; SUPERADMIN can create USER or ADMIN profiles.',
  })
  @ApiResponse({ status: 201, description: 'Profile successfully generated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - only SUPERADMIN can generate administrative accounts' })
  @ApiResponse({ status: 409, description: 'Email address already registered' })
  async createUserProfile(
    @CurrentUser() actor: JwtPayload,
    @Body() dto: CreateUserProfileDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.adminService.createUserProfile(actor, dto, ipAddress);
  }

  @Get('users')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({
    summary: 'List users with pagination, search, and filters (Admin/Superadmin)',
    description:
      'Returns a paginated list of registered users. Requires ADMIN or SUPERADMIN role.',
  })
  @ApiResponse({ status: 200, description: 'Paginated user list returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN or SUPERADMIN role' })
  async listUsers(@Query() query: ListUsersQueryDto) {
    return await this.adminService.listUsers(query);
  }

  @Get('users/:id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Get detailed user account by ID (Admin/Superadmin)',
    description:
      'Retrieves user details including recent transactions, bookings, and audit records.',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User details returned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserDetails(@Param('id') id: string) {
    return await this.adminService.getUserDetails(id);
  }

  @Patch('users/:id/status')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Suspend or reactivate a user account (Admin/Superadmin)',
    description:
      'Updates account status between ACTIVE and SUSPENDED. Admins cannot suspend themselves, other admins, or the last superadmin.',
  })
  @ApiParam({ name: 'id', description: 'Target user UUID' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - cannot suspend self or last superadmin' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient privileges' })
  async updateUserStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.adminService.updateUserStatus(user, id, dto.status, ipAddress);
  }

  @Delete('users/:id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Permanently delete a user account (Admin/Superadmin)',
    description:
      'Permanently deletes a user account and associated bookings/orders. Admins can delete standard USER accounts; SUPERADMIN can delete USER or ADMIN accounts. Superadmins cannot be deleted directly.',
  })
  @ApiParam({ name: 'id', description: 'Target user UUID to delete' })
  @ApiResponse({ status: 200, description: 'User account successfully deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request - cannot delete self or superadmin' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient authority to delete target account' })
  @ApiResponse({ status: 404, description: 'Target user not found' })
  async deleteUser(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.adminService.deleteUser(user, id, ipAddress);
  }

  @Patch('users/:id/role')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Promote or modify user role (Superadmin only)',
    description:
      'Changes user role between USER, ADMIN, and SUPERADMIN. Only SUPERADMIN can execute this. Prevents demoting the last superadmin or changing own role.',
  })
  @ApiParam({ name: 'id', description: 'Target user UUID' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - cannot modify self or last superadmin' })
  @ApiResponse({ status: 403, description: 'Forbidden - only SUPERADMIN can modify roles' })
  async updateUserRole(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.adminService.updateUserRole(user, id, dto.role, ipAddress);
  }

  @Post('transfer-ownership')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Transfer platform ownership to another active account (Superadmin only)',
    description:
      'Atomically promotes target user to SUPERADMIN and transitions current owner to ADMIN. Requires current password verification and explicit confirmation.',
  })
  @ApiResponse({ status: 200, description: 'Ownership successfully transferred' })
  @ApiResponse({ status: 400, description: 'Invalid confirmation, self-transfer, or suspended target' })
  @ApiResponse({ status: 401, description: 'Invalid current password or unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - only active SUPERADMIN can transfer ownership' })
  @ApiResponse({ status: 404, description: 'Target user not found' })
  async transferOwnership(
    @CurrentUser() user: JwtPayload,
    @Body() dto: TransferOwnershipDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.adminService.transferOwnership(user, dto, ipAddress);
  }

  @Get('audit-logs')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Query immutable security audit logs (Admin/Superadmin)',
    description:
      'Returns paginated audit records for administrative events, role updates, and account status transitions.',
  })
  @ApiResponse({ status: 200, description: 'Audit logs returned successfully' })
  async listAuditLogs(@Query() query: ListAuditLogsQueryDto) {
    return await this.adminService.listAuditLogs(query);
  }
}
