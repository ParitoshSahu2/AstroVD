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
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto.js';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto.js';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto.js';
import { UpdateMeetLinkDto } from './dto/update-meet-link.dto.js';
import { VerifyPaymentDto } from './dto/verify-payment.dto.js';
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

  @Patch(':id/reschedule')
  @ApiOperation({
    summary: 'Reschedule an active consultation appointment (Admin/Superadmin)',
    description:
      'Moves appointment to a new date and time slot within an atomic transaction. Enforces collision prevention against double-booking.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking successfully rescheduled' })
  @ApiResponse({ status: 400, description: 'Blocked date or invalid status' })
  @ApiResponse({ status: 409, description: 'Target slot is already reserved' })
  async rescheduleBooking(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Body() dto: RescheduleBookingDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.rescheduleAdminBooking(actor, id, dto, ipAddress);
  }

  @Patch(':id/meet-link')
  @ApiOperation({
    summary: 'Add or update consultation room meeting URL (Admin/Superadmin)',
    description:
      'Updates the custom meeting room link (Google Meet, Zoom, or Teams) for the specified consultation.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Meeting link updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid meeting link URL or domain' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateMeetLink(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateMeetLinkDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.updateAdminMeetLink(actor, id, dto, ipAddress);
  }

  @Post(':id/verify-payment')
  @ApiOperation({
    summary: 'Verify manual or offline booking payment with evidence (Admin/Superadmin)',
    description:
      'Verifies payment for PENDING_PAYMENT consultations by attaching authentic transaction reference proof and transitions status to CONFIRMED.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Payment verified and booking confirmed' })
  @ApiResponse({ status: 400, description: 'Missing evidence or booking is not in PENDING_PAYMENT status' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async verifyPayment(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Body() dto: VerifyPaymentDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.verifyBookingPayment(actor, id, dto, ipAddress);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Permanently delete an appointment booking (Admin/Superadmin only)',
    description: 'Deletes a booking from the database and preserves an audit record.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking successfully deleted' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async deleteBooking(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.deleteAdminBooking(actor, id, ipAddress);
  }
}
