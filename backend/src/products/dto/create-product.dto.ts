import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Unique product ID / slug seed (e.g. tiger_eye)', example: 'ruby_bracelet' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Product title in English', example: 'NATURAL MANIK (RUBY) BRACELET' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Product title in Hindi', example: 'प्राकृतिक माणिक्य (रूबी) ब्रेसलेट' })
  @IsOptional()
  @IsString()
  nameHi?: string;

  @ApiPropertyOptional({ description: 'Short badge/tagline in English', example: 'LEADERSHIP • ROYAL SUN ENERGY' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'Short badge/tagline in Hindi', example: 'नेतृत्व व राजयोग • सूर्य ऊर्जा' })
  @IsOptional()
  @IsString()
  tagHi?: string;

  @ApiProperty({ description: 'Full description in English' })
  @IsString()
  @IsNotEmpty()
  desc: string;

  @ApiPropertyOptional({ description: 'Full description in Hindi' })
  @IsOptional()
  @IsString()
  descHi?: string;

  @ApiProperty({ description: 'Main product image URL', example: '/products/prod-ruby.png' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiPropertyOptional({ description: 'Additional gallery images', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: 'Product category', example: 'wealth' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ description: 'Display label for category in English', example: 'Wealth & Leadership' })
  @IsOptional()
  @IsString()
  categoryLabel?: string;

  @ApiPropertyOptional({ description: 'Display label for category in Hindi', example: 'धन एवं नेतृत्व' })
  @IsOptional()
  @IsString()
  categoryLabelHi?: string;

  @ApiProperty({ description: 'Selling price in INR', example: 1999 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Original MRP before discount in INR', example: 3999 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ description: 'Inventory stock count', example: 50, default: 50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ description: 'Whether product is available for purchase', default: true })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ description: 'Featured product flag', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Associated planet in English', example: 'Sun (Surya)' })
  @IsOptional()
  @IsString()
  planet?: string;

  @ApiPropertyOptional({ description: 'Associated planet in Hindi', example: 'सूर्य ग्रह' })
  @IsOptional()
  @IsString()
  planetHi?: string;

  @ApiPropertyOptional({ description: 'Associated chakra in English', example: 'Heart Chakra (Anahata)' })
  @IsOptional()
  @IsString()
  chakra?: string;

  @ApiPropertyOptional({ description: 'Associated chakra in Hindi', example: 'अनाहत चक्र' })
  @IsOptional()
  @IsString()
  chakraHi?: string;

  @ApiPropertyOptional({ description: 'Recommended activation mantra', example: 'ॐ ह्रीं ह्रीं सूर्याय नमः' })
  @IsOptional()
  @IsString()
  mantra?: string;

  @ApiPropertyOptional({ description: 'Recommended day/time to wear in English', example: 'Sunday Morning' })
  @IsOptional()
  @IsString()
  dayToWear?: string;

  @ApiPropertyOptional({ description: 'Recommended day/time to wear in Hindi', example: 'रविवार प्रातः' })
  @IsOptional()
  @IsString()
  dayToWearHi?: string;

  @ApiPropertyOptional({ description: 'Bead dimensions / specifications in English', example: '8mm Natural Certified Beads' })
  @IsOptional()
  @IsString()
  beadSize?: string;

  @ApiPropertyOptional({ description: 'Bead dimensions / specifications in Hindi', example: '8 मिमी प्राकृतिक सिद्ध मनके' })
  @IsOptional()
  @IsString()
  beadSizeHi?: string;

  @ApiPropertyOptional({ description: 'List of spiritual benefits in English', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiPropertyOptional({ description: 'List of spiritual benefits in Hindi', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefitsHi?: string[];
}
