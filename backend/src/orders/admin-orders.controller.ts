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
import { OrdersService } from './orders.service.js';
import { GetAdminOrdersQueryDto } from './dto/get-admin-orders-query.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';
import { Role } from '../auth/roles.enum.js';

@ApiTags('Admin Shopping Order Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({
    summary: 'List customer shopping orders with pagination, status filters, date range, and search (Admin/Superadmin)',
    description:
      'Returns paginated customer orders across all seekers with order items, canonical pricing, shipping recipient details, and fulfillment statuses.',
  })
  @ApiResponse({ status: 200, description: 'Customer orders list returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN or SUPERADMIN role' })
  async listOrders(@Query() query: GetAdminOrdersQueryDto) {
    return await this.ordersService.getAdminOrders(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single order detail with customer contact and fulfillment details (Admin/Superadmin)',
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order details returned successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderDetail(@Param('id') id: string) {
    return await this.ordersService.getAdminOrderById(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update order fulfillment status enforcing valid lifecycle rules (Admin/Superadmin)',
    description:
      'Transitions order status. Permitted paths: PENDING -> PROCESSING, CANCELLED; PROCESSING -> SHIPPED, CANCELLED; SHIPPED -> DELIVERED. Terminal states (DELIVERED, CANCELLED) cannot be changed.',
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order status successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad Request - invalid status transition or terminal state' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket?.remoteAddress;
    return await this.ordersService.updateOrderStatus(
      actor,
      id,
      dto,
      ipAddress,
    );
  }
}
