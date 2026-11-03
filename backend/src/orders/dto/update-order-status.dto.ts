import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Target fulfillment status (PENDING, CONFIRMED, PROCESSING, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED)',
    enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    example: 'CONFIRMED',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(
    [
      'PENDING',
      'PENDING_PAYMENT',
      'ORDER_PLACED',
      'CONFIRMED',
      'PROCESSING',
      'PACKED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ],
    {
      message:
        'Status must be one of: PENDING, CONFIRMED, PROCESSING, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED',
    },
  )
  status!: string;

  @ApiPropertyOptional({
    description: 'Courier service partner (required when transitioning to SHIPPED)',
    example: 'BlueDart Express',
  })
  @IsOptional()
  @IsString()
  courierName?: string;

  @ApiPropertyOptional({
    description: 'Courier tracking or AWB number (required when transitioning to SHIPPED)',
    example: 'BD-88492019',
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'Fulfillment or tracking remarks (e.g. BlueDart AWB #12345678, dispatched from Varanasi)',
    example: 'Dispatched via Express Courier. Tracking ID: BD-78901234.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
