import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Paritosh Sahu', description: 'User full name' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(60, { message: 'Name cannot exceed 60 characters' })
  name?: string;

  @ApiPropertyOptional({ example: 'user@example.com', description: 'User email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+919876543210', description: 'User WhatsApp / phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '1998-05-15', description: 'Date of birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '08:45', description: 'Time of birth (HH:mm)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  timeOfBirth?: string;

  @ApiPropertyOptional({ example: 'Indore, MP, India', description: 'Place of birth' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  placeOfBirth?: string;

  @ApiPropertyOptional({ example: 'Taurus', description: 'Zodiac sun / moon sign' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  zodiacSign?: string;

  @ApiPropertyOptional({ example: 'Male', description: 'Gender for Vedic chart computation' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 'Kashyap', description: 'Gotra or spiritual lineage' })
  @IsOptional()
  @IsString()
  gotra?: string;
}
