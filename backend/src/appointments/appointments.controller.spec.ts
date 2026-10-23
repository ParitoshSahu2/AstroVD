import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppointmentsController } from './appointments.controller.js';
import { AdminBookingsController } from './admin-bookings.controller.js';
import { Role, AccountStatus } from '../auth/roles.enum.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';

describe('Appointments & AdminBookings Controllers', () => {
  let appointmentsController: AppointmentsController;
  let adminBookingsController: AdminBookingsController;
  let mockAppointmentsService: any;

  const mockUser: JwtPayload = {
    sub: 'user-1',
    email: 'user@astrovd.com',
    role: Role.USER,
    status: AccountStatus.ACTIVE,
    tokenVersion: 1,
  };

  const mockAdmin: JwtPayload = {
    sub: 'admin-1',
    email: 'admin@astrovd.com',
    role: Role.ADMIN,
    status: AccountStatus.ACTIVE,
    tokenVersion: 1,
  };

  beforeEach(() => {
    mockAppointmentsService = {
      getServices: vi.fn().mockReturnValue([{ id: 'astrological_consultation', title: 'Consultation' }]),
      getServiceById: vi.fn().mockImplementation((id: string) => ({ id, title: 'Consultation' })),
      getAvailableSlots: vi.fn().mockResolvedValue({ serviceId: 'astrological_consultation', slots: [] }),
      bookAppointment: vi.fn().mockResolvedValue({ success: true, booking: { id: 'b-1' } }),
      getCustomerBookings: vi.fn().mockResolvedValue([{ id: 'b-1' }]),
      getBookingById: vi.fn().mockResolvedValue({ id: 'b-1' }),
      listAdminBookings: vi.fn().mockResolvedValue({ totalCount: 1, bookings: [{ id: 'b-1' }] }),
      updateBookingStatus: vi.fn().mockResolvedValue({ message: 'Updated', booking: { id: 'b-1', status: 'COMPLETED' } }),
    };

    appointmentsController = new AppointmentsController(mockAppointmentsService);
    adminBookingsController = new AdminBookingsController(mockAppointmentsService);
  });

  describe('Customer AppointmentsController', () => {
    it('should delegate getServices to service', () => {
      const res = appointmentsController.getServices('astrology');
      expect(mockAppointmentsService.getServices).toHaveBeenCalledWith('astrology');
      expect(res).toBeDefined();
    });

    it('should delegate getServiceById to service', () => {
      const res = appointmentsController.getServiceById('astrological_consultation');
      expect(mockAppointmentsService.getServiceById).toHaveBeenCalledWith('astrological_consultation');
      expect(res.id).toBe('astrological_consultation');
    });

    it('should delegate getAvailableSlots to service', async () => {
      const res = await appointmentsController.getAvailableSlots('astrological_consultation', '2099-10-25');
      expect(mockAppointmentsService.getAvailableSlots).toHaveBeenCalledWith('astrological_consultation', '2099-10-25');
      expect(res).toBeDefined();
    });

    it('should delegate bookAppointment with actor and request IP', async () => {
      const mockReq: any = { ip: '127.0.0.1' };
      const dto = {
        serviceId: 'astrological_consultation',
        scheduledDate: '2099-10-25',
        scheduledTime: '11:00 AM',
        contactPhone: '+919826012345',
      };
      const res = await appointmentsController.bookAppointment(mockUser, dto, mockReq);
      expect(mockAppointmentsService.bookAppointment).toHaveBeenCalledWith(mockUser, dto, '127.0.0.1');
      expect(res.success).toBe(true);
    });

    it('should delegate getMyBookings using actor sub', async () => {
      const res = await appointmentsController.getMyBookings(mockUser);
      expect(mockAppointmentsService.getCustomerBookings).toHaveBeenCalledWith('user-1');
      expect(res.length).toBe(1);
    });

    it('should delegate getBookingById with actor', async () => {
      const res = await appointmentsController.getBookingById(mockUser, 'b-1');
      expect(mockAppointmentsService.getBookingById).toHaveBeenCalledWith(mockUser, 'b-1');
      expect(res.id).toBe('b-1');
    });
  });

  describe('AdminBookingsController', () => {
    it('should delegate listBookings to service', async () => {
      const query = { status: 'CONFIRMED', page: 1, limit: 10 };
      const res = await adminBookingsController.listBookings(query);
      expect(mockAppointmentsService.listAdminBookings).toHaveBeenCalledWith(query);
      expect(res.totalCount).toBe(1);
    });

    it('should delegate getBookingDetail with actor', async () => {
      const res = await adminBookingsController.getBookingDetail(mockAdmin, 'b-1');
      expect(mockAppointmentsService.getBookingById).toHaveBeenCalledWith(mockAdmin, 'b-1');
      expect(res.id).toBe('b-1');
    });

    it('should delegate updateStatus with actor and IP', async () => {
      const mockReq: any = { ip: '10.0.0.1' };
      const dto = { status: 'COMPLETED', notes: 'Done' };
      const res = await adminBookingsController.updateStatus(mockAdmin, 'b-1', dto, mockReq);
      expect(mockAppointmentsService.updateBookingStatus).toHaveBeenCalledWith(
        mockAdmin,
        'b-1',
        dto,
        '10.0.0.1',
      );
      expect(res.booking.status).toBe('COMPLETED');
    });
  });
});
