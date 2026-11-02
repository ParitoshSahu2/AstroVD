import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Authentic transaction ID or bank reference number provided as payment proof',
    example: 'UPI_TXN_987216450123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Transaction reference evidence is required to verify payment' })
  transactionReference!: string;

  @ApiProperty({
    description: 'Payment method through which payment was verified',
    enum: ['GATEWAY', 'UPI', 'NET_BANKING', 'OFFLINE_VERIFIED'],
    example: 'UPI',
  })
  @IsString()
  @IsIn(['GATEWAY', 'UPI', 'NET_BANKING', 'OFFLINE_VERIFIED'], {
    message: 'Payment method must be one of: GATEWAY, UPI, NET_BANKING, OFFLINE_VERIFIED',
  })
  paymentMethod!: 'GATEWAY' | 'UPI' | 'NET_BANKING' | 'OFFLINE_VERIFIED';

  @ApiPropertyOptional({
    description: 'Verification notes or audit remarks',
    example: 'Payment verified against bank statement received via WhatsApp.',
  })
  @IsOptional()
  @IsString()
  verificationNotes?: string;

  @ApiPropertyOptional({
    description: 'Optional admin notes regarding verification',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
