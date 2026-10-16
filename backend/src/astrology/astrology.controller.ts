import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AstrologyService } from './astrology.service.js';
import {
  KundliRequestDto,
  MatchmakingRequestDto,
  NumerologyRequestDto,
} from './astrology.types.js';

@ApiTags('Astrology Services')
@Controller('astrology')
export class AstrologyController {
  constructor(private readonly astrologyService: AstrologyService) {}

  @Get('horoscope')
  @ApiOperation({ summary: 'Get daily, weekly, or monthly horoscope for any zodiac sign' })
  @ApiQuery({ name: 'sign', required: true, example: 'scorpio' })
  @ApiQuery({ name: 'period', required: false, example: 'daily', enum: ['daily', 'weekly', 'monthly'] })
  getHoroscope(@Query('sign') sign: string, @Query('period') period?: string) {
    return this.astrologyService.getHoroscope(sign || 'aries', period || 'daily');
  }

  @Post('kundli')
  @ApiOperation({ summary: 'Generate detailed Vedic Kundli & Birth Chart calculations' })
  generateKundli(@Body() dto: KundliRequestDto) {
    return this.astrologyService.generateKundli(dto);
  }

  @Post('kundli-milan')
  @ApiOperation({ summary: 'Calculate 36 Guna Ashtakoot Kundli Matchmaking between partners' })
  calculateMatchmaking(@Body() dto: MatchmakingRequestDto) {
    return this.astrologyService.calculateMatchmaking(dto);
  }

  @Get('tarot')
  @ApiOperation({ summary: 'Draw cosmic Tarot card readings (daily, 3-card spread, or love spread)' })
  @ApiQuery({ name: 'type', required: false, enum: ['daily', 'three_card', 'love'] })
  getTarot(@Query('type') type?: 'daily' | 'three_card' | 'love') {
    return this.astrologyService.getTarotSpread(type || 'three_card');
  }

  @Post('numerology')
  @ApiOperation({ summary: 'Calculate Life Path Number, Destiny Number, and Soul Urge vibration' })
  calculateNumerology(@Body() dto: NumerologyRequestDto) {
    return this.astrologyService.calculateNumerology(dto);
  }

  @Get('panchang')
  @ApiOperation({ summary: 'Get current Vedic Hindu Panchang (Tithi, Nakshatra, Yoga, Rahu Kaal)' })
  getPanchang() {
    return this.astrologyService.getPanchang();
  }
}
