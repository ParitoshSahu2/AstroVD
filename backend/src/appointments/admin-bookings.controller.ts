import {
  Controller,
  Get,
  Patch,
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
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto.js';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';
import { Role } from '../auth/roles.enum.js';

@ApiTags('Admin Appointment & Consultation Booking Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@Controller('admin/bookings')
export class AdminBookingsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List customer appointments with filters and search (Admin/Superadmin)',
    description:
      'Returns paginated customer bookings across services with search by booking reference, customer name, email, or phone.',
  })
  @ApiResponse({ status: 200, description: 'Bookings list returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN or SUPERADMIN role' })
  async listBookings(@Query() query: ListBookingsQueryDto) {
    return await this.appointmentsService.listAdminBookings(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single booking detail with full customer contact information (Admin/Superadmin)',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking details returned' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBookingDetail(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
  ) {
    return await this.appointmentsService.getBookingById(actor, id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update booking status following lifecycle rules (Admin/Superadmin)',
    description:
      'Transitions booking status. Enforces valid lifecycle: PENDING -> CONFIRMED/CANCELLED; CONFIRMED -> COMPLETED/CANCELLED. Terminal states cannot be changed.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking status successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad Request - invalid status transition or terminal state' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateStatus(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.updateBookingStatus(
      actor,
      id,
      dto,
      ipAddress,
    );
  }
}
