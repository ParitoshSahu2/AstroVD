import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service.js';
import { ProductsFilterDto } from './products.types.js';

@ApiTags('Products & Sacred Store')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get product catalog with filters, keyword search, pagination, and Hindi localization',
    description:
      'Fetches energized gemstone bracelets with dynamic filtering by category, price bounds, stock status, sorting, and bilingual English/Hindi response (?lang=hi).',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of products returned successfully',
  })
  findAll(@Query() query: ProductsFilterDto) {
    return this.productsService.findAll(query);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Get product categories and counts',
    description: 'Returns all available spiritual categories (wealth, protection, love, healing) with counts.',
  })
  @ApiQuery({ name: 'lang', required: false, enum: ['en', 'hi'], example: 'en' })
  getCategories(@Query('lang') lang?: 'en' | 'hi') {
    return this.productsService.getCategories(lang || 'en');
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get product details by slug or ID with ?lang=hi',
    description:
      'Fetches deep technical and spiritual details for a specific gemstone bracelet by slug (e.g. "tiger-eye") or ID (e.g. "tiger_eye"), localized into Hindi if ?lang=hi is passed.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Product slug or ID (e.g. tiger-eye, golden-pyrite, black_tourmaline)',
    example: 'tiger-eye',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['en', 'hi'],
    description: 'Language localization parameter (?lang=hi)',
    example: 'hi',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details and related items returned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found with given slug or ID',
  })
  findBySlug(
    @Param('slug') slug: string,
    @Query('lang') lang?: 'en' | 'hi',
  ) {
    return this.productsService.findBySlugOrId(slug, lang || 'en');
  }
}
