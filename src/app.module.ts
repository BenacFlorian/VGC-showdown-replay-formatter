import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilityService } from './services/utility.service';
import { ParseLogsService } from './parseLogs.service';
import { WriteTextForIAService } from './writeTextForIA.service';
import { PokemonTxtForIAService } from './services/pokemon-txtForIA.service';
import { DamageTxtForIAService } from './services/damage-txtForIA.service';
import { ActionTxtForIAService } from './services/action-txtForIA.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [
    AppService, 
    UtilityService, 
    ParseLogsService, 
    WriteTextForIAService, 
    PokemonTxtForIAService, 
    DamageTxtForIAService, 
    ActionTxtForIAService
  ],
})
export class AppModule {}
