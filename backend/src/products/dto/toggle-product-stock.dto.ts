import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleProductStockDto {
  @ApiProperty({ description: 'Stock availability status', example: true })
  @IsBoolean()
  inStock: boolean;
}
