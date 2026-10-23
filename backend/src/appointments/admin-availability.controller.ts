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
  ApiQuery,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service.js';
import { CreateSlotDto } from './dto/create-slot.dto.js';
import { UpdateSlotDto } from './dto/update-slot.dto.js';
import { BlockDateDto } from './dto/block-date.dto.js';
import { InitializeScheduleDto } from './dto/initialize-schedule.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';
import { Role } from '../auth/roles.enum.js';

@ApiTags('Admin Appointment Availability & Schedule Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@Controller('admin/availability')
export class AdminAvailabilityController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get schedule availability for a date with booking statuses (Admin/Superadmin only)',
    description:
      'Returns slots, publish status, reservation status, and sanctuary block status for a given date.',
  })
  @ApiQuery({ name: 'date', required: true, example: '2026-10-25' })
  @ApiResponse({ status: 200, description: 'Availability details returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN or SUPERADMIN role' })
  async getAvailability(@Query('date') date: string) {
    return await this.appointmentsService.getAdminAvailability(date);
  }

  @Post('slots')
  @ApiOperation({
    summary: 'Create a new available consultation time slot (Admin/Superadmin only)',
  })
  @ApiResponse({ status: 201, description: 'Slot successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error or past date' })
  @ApiResponse({ status: 409, description: 'Slot already exists for date and start time' })
  async createSlot(
    @CurrentUser() actor: JwtPayload,
    @Body() dto: CreateSlotDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.createAdminSlot(actor, dto, ipAddress);
  }

  @Patch('slots/:id')
  @ApiOperation({
    summary: 'Update or publish/unpublish a slot (Admin/Superadmin only)',
    description:
      'Modifies slot settings. Rejects start time change if an active booking is already confirmed on this slot.',
  })
  @ApiParam({ name: 'id', description: 'Slot UUID' })
  @ApiResponse({ status: 200, description: 'Slot updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot change start time of booked slot' })
  @ApiResponse({ status: 404, description: 'Slot not found' })
  async updateSlot(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateSlotDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.updateAdminSlot(actor, id, dto, ipAddress);
  }

  @Delete('slots/:id')
  @ApiOperation({
    summary: 'Remove an appointment slot (Admin/Superadmin only)',
    description:
      'Permanently deletes a slot. Rejects deletion if an active customer booking is associated with this slot.',
  })
  @ApiParam({ name: 'id', description: 'Slot UUID' })
  @ApiResponse({ status: 200, description: 'Slot deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete slot with active customer booking' })
  @ApiResponse({ status: 404, description: 'Slot not found' })
  async deleteSlot(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.deleteAdminSlot(actor, id, ipAddress);
  }

  @Post('block-date')
  @ApiOperation({
    summary: 'Block a date, holiday, or unavailable period (Admin/Superadmin only)',
  })
  @ApiResponse({ status: 201, description: 'Date successfully blocked' })
  @ApiResponse({ status: 400, description: 'Invalid date format' })
  async blockDate(
    @CurrentUser() actor: JwtPayload,
    @Body() dto: BlockDateDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.blockDate(actor, dto, ipAddress);
  }

  @Delete('block-date/:date')
  @ApiOperation({
    summary: 'Unblock a previously blocked date (Admin/Superadmin only)',
  })
  @ApiParam({ name: 'date', description: 'Date YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Date successfully unblocked' })
  async unblockDate(
    @CurrentUser() actor: JwtPayload,
    @Param('date') date: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.unblockDate(actor, date, ipAddress);
  }

  @Post('initialize-standard-schedule')
  @ApiOperation({
    summary: 'Bulk initialize standard Vedic consultation schedule for upcoming days (Admin/Superadmin only)',
  })
  @ApiResponse({ status: 201, description: 'Standard slots successfully initialized' })
  async initializeSchedule(
    @CurrentUser() actor: JwtPayload,
    @Body() dto: InitializeScheduleDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.initializeStandardSchedule(actor, dto, ipAddress);
  }
}
