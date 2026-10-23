import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '../../auth/roles.enum.js';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: AccountStatus, example: 'SUSPENDED', description: 'New account status' })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(AccountStatus, { message: 'Status must be either ACTIVE or SUSPENDED' })
  status: AccountStatus;
}
