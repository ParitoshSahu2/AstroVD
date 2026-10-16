import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AstrologersService } from './astrologers.service.js';
import { BookingRequestDto } from './astrologers.types.js';

@ApiTags('Astrologers & Consultations')
@Controller('astrologers')
export class AstrologersController {
  constructor(private readonly astrologersService: AstrologersService) {}

  @Get()
  @ApiOperation({ summary: 'List all verified expert astrologers with ratings and live availability' })
  @ApiQuery({ name: 'category', required: false, example: 'vedic' })
  getAll(@Query('category') category?: string) {
    return this.astrologersService.getAllAstrologers(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed astrologer profile and reviews' })
  getById(@Param('id') id: string) {
    return this.astrologersService.getAstrologerById(id);
  }

  @Post('book')
  @ApiOperation({ summary: 'Book instant chat, audio call, or video consultation' })
  bookSession(@Body() dto: BookingRequestDto) {
    return this.astrologersService.createBooking(dto);
  }
}
