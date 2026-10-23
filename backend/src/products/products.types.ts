import { IsOptional, IsString, IsNumber, IsBoolean, Min, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export interface ProductItem {
  id: string;
  slug: string;
  name: string;
  nameHi: string;
  tag: string;
  tagHi: string;
  desc: string;
  descHi: string;
  image: string;
  images?: string[];
  category: 'wealth' | 'protection' | 'love' | 'healing' | string;
  categoryLabel: string;
  categoryLabelHi: string;
  price: number;
  priceFormatted: string;
  originalPrice: number;
  originalPriceFormatted: string;
  discountPercent: number;
  planet: string;
  planetHi: string;
  chakra: string;
  chakraHi: string;
  mantra: string;
  dayToWear: string;
  dayToWearHi: string;
  beadSize: string;
  beadSizeHi: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stock: number;
  isFeatured: boolean;
  benefits: string[];
  benefitsHi: string[];
}

export class ProductsFilterDto {
  @ApiPropertyOptional({ description: 'Filter by category: all, wealth, protection, love, healing', example: 'wealth' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Keyword search query for names, descriptions, or benefits', example: 'tiger' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Alias for search query', example: 'pyrite' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Minimum price filter in INR', example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter in INR', example: 2000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by in-stock availability', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ description: 'Filter by featured status', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Sorting strategy',
    enum: ['price_asc', 'price_desc', 'rating', 'popular', 'newest'],
    example: 'popular',
  })
  @IsOptional()
  @IsString()
  @IsIn(['price_asc', 'price_desc', 'rating', 'popular', 'newest'])
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'popular' | 'newest';

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 12, example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 12;

  @ApiPropertyOptional({ description: 'Language for localized content', enum: ['en', 'hi'], default: 'en', example: 'hi' })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'hi'])
  lang?: 'en' | 'hi' = 'en';
}

export interface PaginatedProductsResponse {
  data: ProductItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  filters: {
    category?: string;
    search?: string;
    lang: string;
    sort?: string;
  };
}
