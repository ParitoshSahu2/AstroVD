import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { ToggleServiceStatusDto } from './dto/toggle-service-status.dto.js';
import { ListServicesQueryDto } from './dto/list-services-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';
import { Role } from '../auth/roles.enum.js';

@ApiTags('Admin Services Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@Controller('admin/services')
export class AdminServicesController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all services including active and inactive (Admin/Superadmin)',
    description: 'Returns all services with search and filtering by category or status.',
  })
  @ApiResponse({ status: 200, description: 'Services list returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN or SUPERADMIN role' })
  listServices(@Query() query: ListServicesQueryDto) {
    return this.appointmentsService.listAdminServices(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single service details by ID including inactive (Admin/Superadmin)',
  })
  @ApiParam({ name: 'id', description: 'Service slug/identifier' })
  @ApiResponse({ status: 200, description: 'Service details returned' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  getServiceDetail(@Param('id') id: string) {
    return this.appointmentsService.getServiceById(id, true);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new service in catalogue (Admin/Superadmin)',
    description: 'Creates a new persistent service entry with validation and audit logging.',
  })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Service identifier already exists' })
  async createService(
    @CurrentUser() actor: JwtPayload,
    @Body() dto: CreateServiceDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.createAdminService(actor, dto, ipAddress);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update service details (Admin/Superadmin)',
    description: 'Modifies fields of an existing service and records change in audit logs.',
  })
  @ApiParam({ name: 'id', description: 'Service slug/identifier' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async updateService(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.updateAdminService(actor, id, dto, ipAddress);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Activate or deactivate a service (Admin/Superadmin)',
    description:
      'Toggles public visibility and booking availability. Deactivated services remain referenced by historical bookings.',
  })
  @ApiParam({ name: 'id', description: 'Service slug/identifier' })
  @ApiResponse({ status: 200, description: 'Service status successfully updated' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async toggleStatus(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ToggleServiceStatusDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.toggleServiceStatus(actor, id, dto.isActive, ipAddress);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Permanently delete a service with historical integrity guard (Admin/Superadmin)',
    description:
      'Permanently removes an unbooked service. If historical bookings exist, deletion is blocked and deactivation is recommended.',
  })
  @ApiParam({ name: 'id', description: 'Service slug/identifier' })
  @ApiResponse({ status: 200, description: 'Service successfully deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete: existing bookings reference this service' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async deleteService(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.deleteAdminService(actor, id, ipAddress);
  }
}
