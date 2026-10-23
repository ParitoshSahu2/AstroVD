import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../auth/roles.enum.js';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: Role, example: 'ADMIN', description: 'New role to assign to the user' })
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(Role, { message: 'Role must be USER, ADMIN, or SUPERADMIN' })
  role: Role;
}
