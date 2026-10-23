import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller.js';
import { AdminBookingsController } from './admin-bookings.controller.js';
import { AdminAvailabilityController } from './admin-availability.controller.js';
import { AppointmentsService } from './appointments.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    AppointmentsController,
    AdminBookingsController,
    AdminAvailabilityController,
  ],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
