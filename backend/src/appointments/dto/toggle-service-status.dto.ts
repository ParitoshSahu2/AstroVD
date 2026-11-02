import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ToggleServiceStatusDto {
  @ApiProperty({
    description: 'Whether the service is active and bookable by seekers',
    example: true,
  })
  @IsBoolean()
  isActive!: boolean;
}
