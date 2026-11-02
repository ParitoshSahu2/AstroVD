import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ProductsService, CANONICAL_PRODUCTS } from './products.service.js';
import { AdminProductsController } from './admin-products.controller.js';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Role, AccountStatus } from '../auth/roles.enum.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';

describe('Admin Products Management & Dynamic Inventory', () => {
  let service: ProductsService;
  let adminController: AdminProductsController;
  let prisma: any;

  const testProductsFilePath = path.resolve(process.cwd(), 'data', 'products.json');

  const mockAdmin: JwtPayload = {
    sub: 'admin-uuid-1',
    email: 'admin@astrovd.com',
    role: Role.ADMIN,
    status: AccountStatus.ACTIVE,
  };

  const mockSuperadmin: JwtPayload = {
    sub: 'superadmin-uuid-1',
    email: 'superadmin@astrovd.com',
    role: Role.SUPERADMIN,
    status: AccountStatus.ACTIVE,
  };

  beforeEach(() => {
    // Clean test products data file if it exists
    if (fs.existsSync(testProductsFilePath)) {
      try {
        fs.unlinkSync(testProductsFilePath);
      } catch {}
    }

    prisma = {
      orderItem: {
        count: vi.fn().mockResolvedValue(0),
      },
      product: {
        create: vi.fn().mockResolvedValue({ id: 'prod_test' }),
        update: vi.fn().mockResolvedValue({ id: 'prod_test' }),
        delete: vi.fn().mockResolvedValue({ id: 'prod_test' }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-log-uuid' }),
      },
    };

    service = new ProductsService(prisma);
    adminController = new AdminProductsController(service);
  });

  afterEach(() => {
    if (fs.existsSync(testProductsFilePath)) {
      try {
        fs.unlinkSync(testProductsFilePath);
      } catch {}
    }
  });

  describe('TEST-01: Auto-seeding and Catalogue Integrity', () => {
    it('seeds exactly 19 canonical consecrated gemstone bracelets on first initialization', () => {
      expect(CANONICAL_PRODUCTS.length).toBe(19);
      const res = adminController.listProducts({ page: 1, limit: 50 });
      expect(res.totalCount).toBe(19);
      expect(res.products.length).toBe(19);

      // Verify file persistence
      expect(fs.existsSync(testProductsFilePath)).toBe(true);
      const persisted = JSON.parse(fs.readFileSync(testProductsFilePath, 'utf-8'));
      expect(persisted.length).toBe(19);
    });
  });

  describe('TEST-02: Admin Filtering & Pagination', () => {
    it('filters products by category', () => {
      const wealthRes = adminController.listProducts({ category: 'wealth', page: 1, limit: 50 });
      expect(wealthRes.products.every((p) => p.category === 'wealth')).toBe(true);
      expect(wealthRes.totalCount).toBeGreaterThan(0);
    });

    it('filters products by inStock status', () => {
      const stockRes = adminController.listProducts({ inStock: 'true', page: 1, limit: 50 });
      expect(stockRes.products.every((p) => p.inStock === true)).toBe(true);
    });

    it('searches products by name or keywords', () => {
      const searchRes = adminController.listProducts({ search: 'tiger', page: 1, limit: 50 });
      expect(searchRes.products.some((p) => p.name.includes('TIGER'))).toBe(true);
    });

    it('paginates correctly', () => {
      const page1 = adminController.listProducts({ page: 1, limit: 5 });
      expect(page1.products.length).toBe(5);
      expect(page1.totalPages).toBe(4);
      expect(page1.page).toBe(1);

      const page2 = adminController.listProducts({ page: 2, limit: 5 });
      expect(page2.products.length).toBe(5);
      expect(page2.page).toBe(2);
      expect(page2.products[0].id).not.toBe(page1.products[0].id);
    });
  });

  describe('TEST-03: Create Product via Admin', () => {
    it('creates a new product with auto-generated slug and discount', async () => {
      const newProd = await adminController.createProduct(
        mockAdmin,
        {
          name: 'NATURAL BLUE SAPPHIRE BRACELET',
          desc: 'Authentic Ceylon Blue Sapphire for Saturn alignment.',
          category: 'protection',
          price: 2499,
          originalPrice: 4999,
          stock: 25,
          image: '/products/prod-sapphire.png',
        },
        { ip: '192.168.1.1' } as any,
      );

      expect(newProd.id).toBeDefined();
      expect(newProd.slug).toBe('natural-blue-sapphire-bracelet');
      expect(newProd.priceFormatted).toBe('₹2,499');
      expect(newProd.discountPercent).toBe(50);
      expect(newProd.inStock).toBe(true);

      // Verify list includes new item
      const list = adminController.listProducts({ search: 'sapphire' });
      expect(list.totalCount).toBe(1);
    });

    it('rejects duplicate product ID or slug', async () => {
      await expect(
        adminController.createProduct(
          mockAdmin,
          {
            id: 'tiger_eye',
            name: 'DUPLICATE TIGER EYE',
            desc: 'Desc',
            category: 'wealth',
            price: 1000,
            stock: 10,
            image: '/test.png',
          },
          {} as any,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('TEST-04: Update Product Details', () => {
    it('updates product fields, prices, and recalculates discount', async () => {
      const updated = await adminController.updateProduct(
        mockAdmin,
        'tiger_eye',
        {
          price: 1499,
          originalPrice: 2999,
          stock: 60,
        },
        {} as any,
      );

      expect(updated.price).toBe(1499);
      expect(updated.priceFormatted).toBe('₹1,499');
      expect(updated.stock).toBe(60);
      expect(updated.discountPercent).toBe(50);
    });

    it('throws NotFoundException when updating non-existent product', async () => {
      await expect(
        adminController.updateProduct(mockAdmin, 'non-existent-id', { price: 999 }, {} as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('TEST-05: Toggle Stock Availability', () => {
    it('toggles product inStock status', async () => {
      const toggled = await adminController.toggleStock(
        mockAdmin,
        'tiger_eye',
        { inStock: false },
        {} as any,
      );
      expect(toggled.inStock).toBe(false);

      const toggledBack = await adminController.toggleStock(
        mockAdmin,
        'tiger_eye',
        { inStock: true },
        {} as any,
      );
      expect(toggledBack.inStock).toBe(true);
    });
  });

  describe('TEST-06: Guarded Product Deletion', () => {
    it('deletes product successfully when no historical orders reference it', async () => {
      prisma.orderItem.count.mockResolvedValue(0);

      const res = await adminController.deleteProduct(mockSuperadmin, 'tiger_eye', {} as any);
      expect(res.success).toBe(true);

      const list = adminController.listProducts({ page: 1, limit: 50 });
      expect(list.totalCount).toBe(18);
      expect(list.products.some((p) => p.id === 'tiger_eye')).toBe(false);
    });

    it('blocks deletion when product is referenced by historical customer orders', async () => {
      prisma.orderItem.count.mockResolvedValue(3);

      await expect(
        adminController.deleteProduct(mockAdmin, 'tiger_eye', {} as any),
      ).rejects.toThrow(BadRequestException);

      // Verify product was not deleted
      const list = adminController.listProducts({ page: 1, limit: 50 });
      expect(list.totalCount).toBe(19);
    });
  });
});
