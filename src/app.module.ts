import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilityService } from './utility.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService, UtilityService],
})
export class AppModule {}
