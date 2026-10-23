import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Throttle } from '@nestjs/throttler';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async createOrder(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    const userId = user?.sub || user?.id;
    const order = await this.ordersService.createOrder(userId, dto);
    return {
      ...order,
      order,
      message: 'Order created successfully.',
    };
  }

  @Get('my-orders')
  async getMyOrders(@CurrentUser() user: any) {
    const userId = user?.sub || user?.id;
    const orders = await this.ordersService.getUserOrders(userId);
    return {
      orders,
      count: orders.length,
    };
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string, @CurrentUser() user: any) {
    const userId = user?.sub || user?.id;
    return this.ordersService.getOrderById(id, userId, user.role);
  }
}
