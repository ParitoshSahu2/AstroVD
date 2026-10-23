import { IsNotEmpty, IsString, IsUUID, Equals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferOwnershipDto {
  @ApiProperty({
    description: 'Target user UUID to be promoted to SUPERADMIN',
    example: '85e16532-17b9-4853-9008-ce0bdb2af9fb',
  })
  @IsNotEmpty({ message: 'Target user ID is required' })
  @IsUUID('all', { message: 'Target user ID must be a valid UUID' })
  targetUserId: string;

  @ApiProperty({
    description: 'Current password of the acting SUPERADMIN for re-authentication',
    example: 'password123',
  })
  @IsNotEmpty({ message: 'Current password is required to transfer platform ownership' })
  @IsString({ message: 'Current password must be a string' })
  currentPassword: string;

  @ApiProperty({
    description: 'Explicit confirmation string to prevent accidental ownership transfer',
    example: 'TRANSFER_OWNERSHIP',
  })
  @IsNotEmpty({ message: 'Confirmation string is required' })
  @Equals('TRANSFER_OWNERSHIP', {
    message: "Confirmation must be exactly 'TRANSFER_OWNERSHIP'",
  })
  confirmation: string;
}
