import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service.js';
import { BookAppointmentDto } from './appointments.types.js';

@ApiTags('Appointments & Consultations')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('slots')
  @ApiOperation({
    summary: 'Get available time slots for Vedic consultation',
    description: 'Returns morning, afternoon, and evening slots for the selected date and service.',
  })
  @ApiQuery({ name: 'serviceId', required: true, example: 'astrological_consultation' })
  @ApiQuery({ name: 'date', required: true, example: '2026-10-22' })
  getSlots(
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getAvailableSlots(
      serviceId || 'astrological_consultation',
      date || new Date().toISOString().split('T')[0],
    );
  }

  @Post('book')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Reserve a consultation appointment session',
    description: 'Reserves a 1-on-1 session with Dr. Pandit Vishal Dubey or certified Varanasi Astrologers.',
  })
  @ApiResponse({
    status: 201,
    description: 'Appointment confirmed with unique Booking ID and optional video room link.',
  })
  @ApiResponse({
    status: 409,
    description: 'Time slot collision — slot already reserved.',
  })
  book(@Body() dto: BookAppointmentDto) {
    return this.appointmentsService.bookAppointment(dto);
  }

  @Get('all')
  @ApiOperation({ summary: 'List all platform appointment bookings (Admin)' })
  getAll() {
    return this.appointmentsService.getAllBookings();
  }
}
