import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersService } from './orders.service.js';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockPrisma: any;

  const mockProductTigerEye = {
    id: 'tiger_eye',
    name: 'TIGER EYE BRACELET',
    category: 'Gemstone',
    price: 1299,
    originalPrice: 2499,
    inStock: true,
    stockCount: 10,
    image: '/products/prod-tiger-eye-macro.jpg',
    description: 'Brings confidence.',
  };

  const mockProductPyrite = {
    id: 'golden_pyrite',
    name: 'GOLDEN PYRITE BRACELET',
    category: 'Gemstone',
    price: 1599,
    originalPrice: 2999,
    inStock: true,
    stockCount: 5,
    image: '/products/prod-pyrite.png',
    description: 'Wealth stone.',
  };

  const sampleShippingAddress = {
    recipient: 'Aarav Sharma',
    addressLine: '108 Ganga Ghat Marg',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    pincode: '221001',
    phone: '+919876543210',
    sankalpName: 'Aarav Sharma',
    sankalpGotra: 'Kashyap',
  };

  beforeEach(() => {
    mockPrisma = {
      $transaction: vi.fn(async (cb, options) => cb(mockPrisma)),
      product: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      order: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'user_seeker_1', walletBalance: 10000 }),
        update: vi.fn().mockImplementation(({ data }: any) =>
          Promise.resolve({
            id: 'user_seeker_1',
            walletBalance: 10000 - (data.walletBalance?.decrement || 0),
          }),
        ),
      },
      walletTransaction: {
        create: vi.fn().mockResolvedValue({ id: 'wt-1' }),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'log-1' }),
      },
    };

    service = new OrdersService(mockPrisma);
  });

  describe('createOrder', () => {
    it('successfully creates an order with server-side calculated totals, debits wallet atomically, and decrements stock', async () => {
      mockPrisma.product.findUnique
        .mockResolvedValueOnce({ ...mockProductTigerEye })
        .mockResolvedValueOnce({ ...mockProductPyrite });

      mockPrisma.product.update.mockResolvedValue({});

      const expectedTotal = 1299 * 2 + 1599 * 1; // 2598 + 1599 = 4197

      mockPrisma.order.create.mockImplementation(({ data }: { data: any }) => ({
        id: 'ord_12345',
        userId: 'user_seeker_1',
        totalAmount: data.totalAmount,
        status: data.status,
        shippingAddress: data.shippingAddress,
        items: data.items.create,
      }));

      const dto = {
        items: [
          { productId: 'tiger_eye', quantity: 2 },
          { productId: 'golden_pyrite', quantity: 1 },
        ],
        shippingAddress: sampleShippingAddress,
        paymentMethod: 'WALLET',
      };

      const result = await service.createOrder('user_seeker_1', dto);

      expect(result.id).toBe('ord_12345');
      expect(result.totalAmount).toBe(expectedTotal);
      expect(result.status).toBe('PROCESSING');

      // Assert atomic wallet debit and financial ledger record
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user_seeker_1' },
        data: { walletBalance: { decrement: expectedTotal } },
        select: { walletBalance: true },
      });
      expect(mockPrisma.walletTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user_seeker_1',
          type: 'DEBIT',
          amount: expectedTotal,
          reference: 'ORDER_ord_12345',
        }),
      });

      // Stock was decremented for both items
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'tiger_eye' },
        data: { stockCount: 8, inStock: true },
      });
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'golden_pyrite' },
        data: { stockCount: 4, inStock: true },
      });
    });

    it('rejects order if items array is empty', async () => {
      await expect(
        service.createOrder('user_seeker_1', {
          items: [],
          shippingAddress: sampleShippingAddress,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects order if a product does not exist in catalogue', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.createOrder('user_seeker_1', {
          items: [{ productId: 'invalid_product_id', quantity: 1 }],
          shippingAddress: sampleShippingAddress,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects order if requested quantity exceeds available stock', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        ...mockProductTigerEye,
        stockCount: 2,
      });

      await expect(
        service.createOrder('user_seeker_1', {
          items: [{ productId: 'tiger_eye', quantity: 5 }],
          shippingAddress: sampleShippingAddress,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects order if product is marked out of stock', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        ...mockProductTigerEye,
        inStock: false,
        stockCount: 0,
      });

      await expect(
        service.createOrder('user_seeker_1', {
          items: [{ productId: 'tiger_eye', quantity: 1 }],
          shippingAddress: sampleShippingAddress,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('updates inStock to false when all remaining stock is purchased', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        ...mockProductTigerEye,
        stockCount: 3,
      });
      mockPrisma.product.update.mockResolvedValue({});
      mockPrisma.order.create.mockResolvedValue({ id: 'ord_last_stock' });

      await service.createOrder('user_seeker_1', {
        items: [{ productId: 'tiger_eye', quantity: 3 }],
        shippingAddress: sampleShippingAddress,
      });

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'tiger_eye' },
        data: { stockCount: 0, inStock: false },
      });
    });

    it('optimizes product lookup using a single batch findMany query for multi-item orders', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([
        { ...mockProductTigerEye },
        { ...mockProductPyrite },
      ]);
      mockPrisma.product.update.mockResolvedValue({});
      mockPrisma.order.create.mockImplementation(({ data }: { data: any }) => ({
        id: 'ord_batch_1',
        totalAmount: data.totalAmount,
        status: data.status,
      }));

      const result = await service.createOrder('user_seeker_1', {
        items: [
          { productId: 'tiger_eye', quantity: 1 },
          { productId: 'golden_pyrite', quantity: 2 },
        ],
        shippingAddress: sampleShippingAddress,
      });

      expect(result.id).toBe('ord_batch_1');
      // Single batch findMany query instead of N sequential findUnique calls
      expect(mockPrisma.product.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['tiger_eye', 'golden_pyrite'] } },
      });
      expect(mockPrisma.product.findUnique).not.toHaveBeenCalled();
    });

    it('aggregates duplicate product items in an order into a single atomic stock decrement', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([
        { ...mockProductTigerEye, stockCount: 10 },
      ]);
      mockPrisma.product.update.mockResolvedValue({});
      mockPrisma.order.create.mockImplementation(({ data }: { data: any }) => ({
        id: 'ord_agg_1',
        totalAmount: data.totalAmount,
        items: data.items.create,
      }));

      const result = await service.createOrder('user_seeker_1', {
        items: [
          { productId: 'tiger_eye', quantity: 2 },
          { productId: 'tiger_eye', quantity: 3 },
        ],
        shippingAddress: sampleShippingAddress,
      });

      expect(result.totalAmount).toBe(1299 * 5);
      // Both line items preserved in order
      expect(result.items).toHaveLength(2);
      // But exactly 1 stock update executed with total aggregated quantity (10 - 5 = 5)
      expect(mockPrisma.product.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'tiger_eye' },
        data: { stockCount: 5, inStock: true },
      });
    });

    it('prevents overselling when duplicate product items collectively exceed stock', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([
        { ...mockProductTigerEye, stockCount: 5 },
      ]);

      await expect(
        service.createOrder('user_seeker_1', {
          items: [
            { productId: 'tiger_eye', quantity: 3 },
            { productId: 'tiger_eye', quantity: 4 }, // 3 + 4 = 7 > 5
          ],
          shippingAddress: sampleShippingAddress,
        }),
      ).rejects.toThrow(BadRequestException);

      // No stock update should have taken place
      expect(mockPrisma.product.update).not.toHaveBeenCalled();
    });

    it('rejects order with non-positive or non-integer quantities', async () => {
      await expect(
        service.createOrder('user_seeker_1', {
          items: [{ productId: 'tiger_eye', quantity: -2 }],
          shippingAddress: sampleShippingAddress,
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createOrder('user_seeker_1', {
          items: [{ productId: 'tiger_eye', quantity: 1.5 }],
          shippingAddress: sampleShippingAddress,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates an order with PENDING_PAYMENT status when no wallet payment is specified', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({ ...mockProductTigerEye });
      mockPrisma.product.update.mockResolvedValue({});
      mockPrisma.order.create.mockImplementation(({ data }: { data: any }) => ({
        id: 'ord_unpaid_1',
        totalAmount: data.totalAmount,
        status: data.status,
        shippingAddress: data.shippingAddress,
      }));

      const result = await service.createOrder('user_seeker_1', {
        items: [{ productId: 'tiger_eye', quantity: 1 }],
        shippingAddress: sampleShippingAddress,
      });

      expect(result.status).toBe('PENDING_PAYMENT');
      // Wallet was NOT debited
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockPrisma.walletTransaction.create).not.toHaveBeenCalled();
      // Stock was reserved
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'tiger_eye' },
        data: { stockCount: 9, inStock: true },
      });
    });

    it('rejects order and rolls back transaction when wallet balance is insufficient', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({ ...mockProductTigerEye });
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user_poor_seeker',
        walletBalance: 50.0,
      });

      await expect(
        service.createOrder('user_poor_seeker', {
          items: [{ productId: 'tiger_eye', quantity: 1 }],
          shippingAddress: sampleShippingAddress,
          paymentMethod: 'WALLET',
        }),
      ).rejects.toThrow(BadRequestException);

      // Verify rollback: no order created, no wallet debit, no stock update
      expect(mockPrisma.order.create).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockPrisma.product.update).not.toHaveBeenCalled();
      expect(mockPrisma.walletTransaction.create).not.toHaveBeenCalled();
    });

    it('rejects fulfilling unpaid PENDING_PAYMENT order directly to SHIPPED or DELIVERED', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'ord_unpaid_test',
        status: 'PENDING_PAYMENT',
        shippingAddress: sampleShippingAddress,
        items: [],
      });

      const mockAdmin: any = { sub: 'admin-1', role: 'ADMIN' };

      await expect(
        service.updateOrderStatus(mockAdmin, 'ord_unpaid_test', { status: 'SHIPPED' }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.updateOrderStatus(mockAdmin, 'ord_unpaid_test', { status: 'DELIVERED' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('refunds user wallet balance atomically when a wallet-paid order is cancelled', async () => {
      const walletOrder = {
        id: 'ord_wallet_paid',
        userId: 'user_seeker_1',
        totalAmount: 2598,
        status: 'PROCESSING',
        shippingAddress: { ...sampleShippingAddress, paymentMethod: 'WALLET' },
        items: [
          { productId: 'tiger_eye', quantity: 2 },
        ],
      };

      mockPrisma.order.findUnique.mockResolvedValueOnce(walletOrder);
      mockPrisma.product.update.mockResolvedValue({});
      mockPrisma.order.update.mockResolvedValue({ ...walletOrder, status: 'CANCELLED' });

      const mockAdmin: any = { sub: 'admin-1', role: 'ADMIN' };

      const res = await service.updateOrderStatus(mockAdmin, 'ord_wallet_paid', {
        status: 'CANCELLED',
        notes: 'Customer requested refund',
      });

      expect(res.message).toContain('successfully transitioned');
      // Stock restored
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'tiger_eye' },
        data: { stockCount: { increment: 2 }, inStock: true },
      });
      // Wallet refunded
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user_seeker_1' },
        data: { walletBalance: { increment: 2598 } },
        select: { walletBalance: true },
      });
      // Financial ledger transaction recorded
      expect(mockPrisma.walletTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user_seeker_1',
          type: 'CREDIT',
          amount: 2598,
          reference: 'REFUND_ORDER_ord_wallet_paid',
        }),
      });
    });
  });

  describe('getUserOrders', () => {
    it('returns only orders belonging to the specified user', async () => {
      const mockOrders = [
        { id: 'ord_1', userId: 'user_1', totalAmount: 1299 },
        { id: 'ord_2', userId: 'user_1', totalAmount: 2598 },
      ];
      mockPrisma.order.findMany.mockResolvedValue(mockOrders);

      const orders = await service.getUserOrders('user_1');

      expect(orders).toEqual(mockOrders);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user_1' },
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } },
      });
    });
  });

  describe('getOrderById', () => {
    it('allows owner to view their order', async () => {
      const mockOrder = {
        id: 'ord_123',
        userId: 'user_1',
        totalAmount: 1299,
        items: [],
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getOrderById('ord_123', 'user_1', 'USER');
      expect(result).toEqual(mockOrder);
    });

    it('allows admin to view any user order', async () => {
      const mockOrder = {
        id: 'ord_123',
        userId: 'user_1',
        totalAmount: 1299,
        items: [],
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getOrderById('ord_123', 'admin_999', 'ADMIN');
      expect(result).toEqual(mockOrder);
    });

    it('rejects non-owner, non-admin with 403 Forbidden', async () => {
      const mockOrder = {
        id: 'ord_123',
        userId: 'user_1',
        totalAmount: 1299,
        items: [],
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.getOrderById('ord_123', 'other_user', 'USER'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws 404 NotFound if order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.getOrderById('non_existent', 'user_1', 'USER'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
