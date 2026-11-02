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
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ToggleProductStockDto } from './dto/toggle-product-stock.dto.js';
import { ListProductsQueryDto } from './dto/list-products-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';
import { Role } from '../auth/roles.enum.js';

@ApiTags('Admin Products Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all products including in-stock and out-of-stock (Admin/Superadmin)',
    description: 'Returns products with search and filtering by category or stock status.',
  })
  @ApiResponse({ status: 200, description: 'Products list returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN or SUPERADMIN role' })
  listProducts(@Query() query: ListProductsQueryDto) {
    return this.productsService.listAdminProducts(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single product details by ID or slug (Admin/Superadmin)',
  })
  @ApiParam({ name: 'id', description: 'Product ID or slug' })
  @ApiResponse({ status: 200, description: 'Product details returned' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  getProductDetail(@Param('id') id: string) {
    return this.productsService.findBySlugOrId(id, 'en');
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new product in the sacred store (Admin/Superadmin)',
    description: 'Creates a new persistent product entry with validation, price formatting, and audit logging.',
  })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Product identifier already exists' })
  async createProduct(
    @CurrentUser() actor: JwtPayload,
    @Body() dto: CreateProductDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.productsService.createAdminProduct(actor, dto, ipAddress);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update product details (Admin/Superadmin)',
    description: 'Modifies fields, prices, stock, or description of an existing product and records audit log.',
  })
  @ApiParam({ name: 'id', description: 'Product ID or slug' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.productsService.updateAdminProduct(actor, id, dto, ipAddress);
  }

  @Patch(':id/stock')
  @ApiOperation({
    summary: 'Toggle product inStock availability (Admin/Superadmin)',
  })
  @ApiParam({ name: 'id', description: 'Product ID or slug' })
  @ApiResponse({ status: 200, description: 'Product stock status updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async toggleStock(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ToggleProductStockDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.productsService.toggleAdminProductStock(actor, id, dto.inStock, ipAddress);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete product safely (Admin/Superadmin)',
    description: 'Safely removes a product from catalogue if not referenced by historical orders.',
  })
  @ApiParam({ name: 'id', description: 'Product ID or slug' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 400, description: 'Deletion blocked due to historical order references' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.productsService.deleteAdminProduct(actor, id, ipAddress);
  }
}
