import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersService, OrderStatus } from './orders.service.js';
import { AdminOrdersController } from './admin-orders.controller.js';
import { Role, AccountStatus } from '../auth/roles.enum.js';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';

describe('Admin Shopping Order Management', () => {
  let ordersService: OrdersService;
  let adminOrdersController: AdminOrdersController;
  let mockPrisma: any;

  const mockAdminUser: JwtPayload = {
    sub: 'admin-uuid-1',
    email: 'admin@astrovd.com',
    role: Role.ADMIN,
    status: AccountStatus.ACTIVE,
    tokenVersion: 1,
  };

  const mockCustomerUser: JwtPayload = {
    sub: 'customer-uuid-1',
    email: 'seeker@astrovd.com',
    role: Role.USER,
    status: AccountStatus.ACTIVE,
    tokenVersion: 1,
  };

  const sampleShippingAddress = {
    recipient: 'Paritosh Sahu',
    addressLine: '123 Temple Road',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    pincode: '221001',
    phone: '9876543210',
    sankalpName: 'Paritosh Sahu',
    sankalpGotra: 'Kashyap',
    notes: 'Please energize before packing',
  };

  const mockProduct = {
    id: 'tiger_eye',
    name: 'Natural Tiger Eye Bracelet',
    category: 'Gemstone',
    price: 1299,
    image: '/products/tiger_eye.jpg',
    energizedBy: 'Kashi Vishwanath Varanasi Acharyas',
    labCertified: true,
    stockCount: 50,
    inStock: true,
  };

  const sampleOrder = {
    id: 'ord-uuid-1',
    userId: 'customer-uuid-1',
    totalAmount: 2598,
    status: 'PENDING',
    shippingAddress: sampleShippingAddress,
    createdAt: new Date('2026-10-20T10:00:00.000Z'),
    user: {
      id: 'customer-uuid-1',
      name: 'Paritosh Sahu',
      email: 'seeker@astrovd.com',
      phone: '9876543210',
    },
    items: [
      {
        id: 'item-uuid-1',
        orderId: 'ord-uuid-1',
        productId: 'tiger_eye',
        quantity: 2,
        price: 1299,
        product: mockProduct,
      },
    ],
  };

  beforeEach(() => {
    mockPrisma = {
      order: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
      },
      product: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'log-uuid-1' }),
      },
      $transaction: vi.fn().mockImplementation(async (cb: any) => {
        return cb(mockPrisma);
      }),
    };

    ordersService = new OrdersService(mockPrisma);
    adminOrdersController = new AdminOrdersController(ordersService);
  });

  describe('AdminOrdersController routing & delegation', () => {
    it('delegates listOrders to service with query params', async () => {
      const query = { status: 'PENDING', page: 1, limit: 10 };
      const expectedResult = { total: 1, totalPages: 1, page: 1, limit: 10, orders: [] };
      vi.spyOn(ordersService, 'getAdminOrders').mockResolvedValue(expectedResult as any);

      const result = await adminOrdersController.listOrders(query);
      expect(ordersService.getAdminOrders).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });

    it('delegates getOrderDetail to service with order id', async () => {
      const expectedOrder = { id: 'ord-uuid-1' } as any;
      vi.spyOn(ordersService, 'getAdminOrderById').mockResolvedValue(expectedOrder);

      const result = await adminOrdersController.getOrderDetail('ord-uuid-1');
      expect(ordersService.getAdminOrderById).toHaveBeenCalledWith('ord-uuid-1');
      expect(result).toEqual(expectedOrder);
    });

    it('delegates updateStatus to service with actor, orderId, dto, and request IP', async () => {
      const dto = { status: 'PROCESSING', notes: 'Packed and verified' };
      const mockReq: any = { ip: '127.0.0.1' };
      const expectedResult = { message: 'Updated', order: sampleOrder } as any;
      vi.spyOn(ordersService, 'updateOrderStatus').mockResolvedValue(expectedResult);

      const result = await adminOrdersController.updateStatus(mockAdminUser, 'ord-uuid-1', dto, mockReq);
      expect(ordersService.updateOrderStatus).toHaveBeenCalledWith(mockAdminUser, 'ord-uuid-1', dto, '127.0.0.1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('OrdersService.getAdminOrders', () => {
    it('returns paginated orders across all customers with items and contact details', async () => {
      mockPrisma.order.count.mockResolvedValue(1);
      mockPrisma.order.findMany.mockResolvedValue([sampleOrder]);

      const result = await ordersService.getAdminOrders({ page: 1, limit: 20 });

      expect(mockPrisma.order.findMany).toHaveBeenCalled();
      expect(result.total).toBe(1);
      expect(result.orders.length).toBe(1);

      const order = result.orders[0];
      expect(order.id).toBe('ord-uuid-1');
      expect(order.orderReference).toBe('#ORD-ORD-UUID');
      expect(order.customer.name).toBe('Paritosh Sahu');
      expect(order.customer.email).toBe('seeker@astrovd.com');
      expect(order.shippingAddress.pincode).toBe('221001');
      expect(order.shippingAddress.sankalpName).toBe('Paritosh Sahu');
      expect(order.items.length).toBe(1);
      expect(order.items[0].productName).toBe('Natural Tiger Eye Bracelet');
      expect(order.items[0].purchasePrice).toBe(1299);
      expect(order.paymentStatus).toBe('PAID');
    });

    it('filters orders by status and date range', async () => {
      mockPrisma.order.count.mockResolvedValue(0);
      mockPrisma.order.findMany.mockResolvedValue([]);

      await ordersService.getAdminOrders({
        status: 'PROCESSING',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        search: 'Varanasi',
      });

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PROCESSING',
            createdAt: expect.any(Object),
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('OrdersService.getAdminOrderById', () => {
    it('returns single order detail with formatted structure', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(sampleOrder);

      const order = await ordersService.getAdminOrderById('ord-uuid-1');

      expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'ord-uuid-1' },
        include: expect.any(Object),
      });
      expect(order.id).toBe('ord-uuid-1');
      expect(order.totalAmount).toBe(2598);
      expect(order.items[0].productName).toBe('Natural Tiger Eye Bracelet');
    });

    it('throws NotFoundException when order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(ordersService.getAdminOrderById('missing-ord')).rejects.toThrow(NotFoundException);
    });
  });

  describe('OrdersService.updateOrderStatus (Lifecycle transitions & rules)', () => {
    it('successfully transitions from PENDING to PROCESSING', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ ...sampleOrder, status: 'PENDING' });
      mockPrisma.order.update.mockResolvedValue({ ...sampleOrder, status: 'PROCESSING' });

      const res = await ordersService.updateOrderStatus(
        mockAdminUser,
        'ord-uuid-1',
        { status: 'PROCESSING', notes: 'Verified inventory' },
        '10.0.0.1',
      );

      expect(res.message).toContain('successfully transitioned');
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ord-uuid-1' },
          data: expect.objectContaining({ status: 'PROCESSING' }),
        }),
      );
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'ORDER_STATUS_UPDATED',
            actorId: mockAdminUser.sub,
          }),
        }),
      );
    });

    it('successfully transitions from PROCESSING to SHIPPED', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ ...sampleOrder, status: 'PROCESSING' });
      mockPrisma.order.update.mockResolvedValue({ ...sampleOrder, status: 'SHIPPED' });

      const res = await ordersService.updateOrderStatus(
        mockAdminUser,
        'ord-uuid-1',
        { status: 'SHIPPED', notes: 'BlueDart Tracking #BD-12345' },
      );

      expect(res.message).toContain('successfully transitioned');
    });

    it('successfully transitions from SHIPPED to DELIVERED', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ ...sampleOrder, status: 'SHIPPED' });
      mockPrisma.order.update.mockResolvedValue({ ...sampleOrder, status: 'DELIVERED' });

      const res = await ordersService.updateOrderStatus(
        mockAdminUser,
        'ord-uuid-1',
        { status: 'DELIVERED', notes: 'Received by customer' },
      );

      expect(res.message).toContain('successfully transitioned');
    });

    it('successfully cancels order from PENDING and restores product stock', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ ...sampleOrder, status: 'PENDING' });
      mockPrisma.order.update.mockResolvedValue({ ...sampleOrder, status: 'CANCELLED' });
      mockPrisma.product.update.mockResolvedValue({});

      const res = await ordersService.updateOrderStatus(
        mockAdminUser,
        'ord-uuid-1',
        { status: 'CANCELLED', notes: 'Cancelled upon customer request' },
      );

      expect(res.message).toContain('successfully transitioned');
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'tiger_eye' },
        data: {
          stockCount: { increment: 2 },
          inStock: true,
        },
      });
    });

    it('rejects invalid jump from PENDING directly to DELIVERED', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ ...sampleOrder, status: 'PENDING' });

      await expect(
        ordersService.updateOrderStatus(mockAdminUser, 'ord-uuid-1', { status: 'DELIVERED' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects changing status of an already DELIVERED order (terminal state)', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ ...sampleOrder, status: 'DELIVERED' });

      await expect(
        ordersService.updateOrderStatus(mockAdminUser, 'ord-uuid-1', { status: 'PROCESSING' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects changing status of an already CANCELLED order (terminal state)', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ ...sampleOrder, status: 'CANCELLED' });

      await expect(
        ordersService.updateOrderStatus(mockAdminUser, 'ord-uuid-1', { status: 'PROCESSING' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('returns idempotently when target status matches current status', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ ...sampleOrder, status: 'PROCESSING' });

      const res = await ordersService.updateOrderStatus(mockAdminUser, 'ord-uuid-1', { status: 'PROCESSING' });

      expect(res.message).toBe('Order is already in PROCESSING status.');
      expect(mockPrisma.order.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when attempting to update non-existent order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(
        ordersService.updateOrderStatus(mockAdminUser, 'non-existent', { status: 'PROCESSING' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Customer Order Isolation', () => {
    it('permits a customer to view their own order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(sampleOrder);

      const order = await ordersService.getOrderById('ord-uuid-1', 'customer-uuid-1', 'USER');
      expect(order.id).toBe('ord-uuid-1');
    });

    it('forbids a customer from viewing another customer’s order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(sampleOrder);

      await expect(
        ordersService.getOrderById('ord-uuid-1', 'other-customer-uuid', 'USER'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('permits an ADMIN to view any customer’s order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(sampleOrder);

      const order = await ordersService.getOrderById('ord-uuid-1', 'admin-uuid-1', 'ADMIN');
      expect(order.id).toBe('ord-uuid-1');
    });

    it('permits a SUPERADMIN to view any customer’s order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(sampleOrder);

      const order = await ordersService.getOrderById('ord-uuid-1', 'superadmin-uuid-1', 'SUPERADMIN');
      expect(order.id).toBe('ord-uuid-1');
    });
  });
});
