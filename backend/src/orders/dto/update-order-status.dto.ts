import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Target fulfillment status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)',
    enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    example: 'SHIPPED',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    message: 'Status must be one of: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED',
  })
  status!: string;

  @ApiPropertyOptional({
    description: 'Fulfillment or tracking remarks (e.g. BlueDart AWB #12345678, dispatched from Varanasi)',
    example: 'Dispatched via Express Courier. Tracking ID: BD-78901234.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
