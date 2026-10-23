import {
  Controller,
  Get,
  Post,
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
import { BookAppointmentDto } from './dto/book-appointment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Service Appointments & Consultations')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('services')
  @ApiOperation({
    summary: 'List all 29 sacred Vedic services and rituals',
    description: 'Returns canonical service catalogue with descriptions, prices, pandits, and badges.',
  })
  @ApiQuery({ name: 'category', required: false, example: 'astrology' })
  getServices(@Query('category') category?: string) {
    return this.appointmentsService.getServices(category);
  }

  @Get('services/:serviceId')
  @ApiOperation({ summary: 'Get single service details by stable ID or slug' })
  @ApiParam({ name: 'serviceId', example: 'astrological_consultation' })
  getServiceById(@Param('serviceId') serviceId: string) {
    return this.appointmentsService.getServiceById(serviceId);
  }

  @Get('slots')
  @ApiOperation({
    summary: 'Get published appointment slots and real-time availability for a date',
  })
  @ApiQuery({ name: 'serviceId', example: 'astrological_consultation' })
  @ApiQuery({ name: 'date', example: '2026-10-25' })
  getAvailableSlots(
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getAvailableSlots(serviceId, date);
  }

  @Post('book')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Book an appointment slot for a selected service',
    description:
      'Atomically books an appointment slot for the authenticated seeker with concurrency protection against double-booking.',
  })
  @ApiResponse({ status: 201, description: 'Appointment successfully booked' })
  @ApiResponse({ status: 400, description: 'Validation error, invalid slot, or dummy phone' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict - slot already reserved' })
  async bookAppointment(
    @CurrentUser() actor: JwtPayload,
    @Body() dto: BookAppointmentDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.appointmentsService.bookAppointment(actor, dto, ipAddress);
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'View authenticated customer’s own consultation appointments',
  })
  @ApiResponse({ status: 200, description: 'Customer bookings returned successfully' })
  async getMyBookings(@CurrentUser() actor: JwtPayload) {
    return await this.appointmentsService.getCustomerBookings(actor.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get single appointment details (owner or admin only)',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking details returned' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to view another customer’s booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBookingById(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
  ) {
    return await this.appointmentsService.getBookingById(actor, id);
  }
}
