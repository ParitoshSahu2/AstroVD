import { Module } from '@nestjs/common';
import { AstrologersController } from './astrologers.controller.js';
import { AstrologersService } from './astrologers.service.js';

@Module({
  controllers: [AstrologersController],
  providers: [AstrologersService],
  exports: [AstrologersService],
})
export class AstrologersModule {}
